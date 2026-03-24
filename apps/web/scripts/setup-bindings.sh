#!/bin/bash
# Setup bindings for the "allthingslinux" worker
# This recreates KV namespaces, R2 buckets, and verifies Durable Objects setup

set -e

echo "🔧 Setting up Cloudflare bindings for worker: allthingslinux"
echo ""

# Load CLOUDFLARE_API_TOKEN from .env.secrets files (same pattern as deploy scripts)
# Try prod first (more likely to exist), then dev
# These files are optional and may not exist, so we suppress shellcheck warnings
if [ -f .env.secrets.prod ]; then
    # shellcheck source=.env.secrets.prod
    # shellcheck disable=SC1091
    source .env.secrets.prod 2>/dev/null
elif [ -f .env.secrets.dev ]; then
    # shellcheck source=.env.secrets.dev
    # shellcheck disable=SC1091
    source .env.secrets.dev 2>/dev/null
fi
export CLOUDFLARE_API_TOKEN

# Verify wrangler authentication before proceeding (same pattern as secrets.sh)
echo "Verifying Wrangler authentication..."
if ! pnpm exec wrangler whoami >/dev/null 2>&1; then
    echo "Error: Wrangler authentication failed"
    echo ""
    echo "Troubleshooting steps:"
    echo "1. If using API token: Add CLOUDFLARE_API_TOKEN to .env.secrets.prod or .env.secrets.dev"
    echo "2. If token is invalid: Get a new token from https://developers.cloudflare.com/fundamentals/api/get-started/create-token/"
    echo "3. If OAuth is corrupted: Run 'wrangler logout' then 'wrangler login'"
    echo "4. Token permissions needed: Account:Cloudflare Workers:Edit, Account:Workers KV Storage:Edit, Account:Workers Scripts:Edit"
    exit 1
fi

echo "✓ Authentication verified"
echo ""

# ============================================================================
# R2 Bucket Setup
# ============================================================================
echo "📦 Setting up R2 buckets..."

BUCKET_NAME="atl-cache-prod"

# Check if bucket already exists
BUCKET_LIST=$(pnpm exec wrangler r2 bucket list --json 2>/dev/null || echo "[]")
if echo "$BUCKET_LIST" | grep -q "\"$BUCKET_NAME\"" || echo "$BUCKET_LIST" | jq -e ".[] | select(.name == \"$BUCKET_NAME\")" >/dev/null 2>&1; then
    echo "ℹ️  R2 bucket $BUCKET_NAME already exists"
else
    echo "Creating R2 bucket: $BUCKET_NAME"
    # Note: No --env flag since we're using the base worker
    if pnpm exec wrangler r2 bucket create "$BUCKET_NAME" 2>/dev/null; then
        echo "✅ Created R2 bucket: $BUCKET_NAME"
    else
        echo "⚠️  Failed to create R2 bucket: $BUCKET_NAME"
        echo "   Check your Cloudflare permissions and try again"
    fi
fi

echo ""

# ============================================================================
# KV Namespace Setup
# ============================================================================
echo "🗄️  Setting up KV namespace..."

KV_NAMESPACE_NAME="KV_QUICKBOOKS"

# Check if KV namespace already exists by listing all namespaces
KV_LIST=$(pnpm exec wrangler kv namespace list 2>/dev/null || echo "")
KV_ID=""
if echo "$KV_LIST" | grep -q "$KV_NAMESPACE_NAME"; then
    # Extract ID from human-readable format like "KV_QUICKBOOKS (id: abc123...)"
    KV_ID=$(echo "$KV_LIST" | grep "$KV_NAMESPACE_NAME" | sed 's/.*id: *\([a-zA-Z0-9_-]*\).*/\1/' | head -1 || echo "")
fi

if [ -n "$KV_ID" ]; then
    echo "ℹ️  KV namespace $KV_NAMESPACE_NAME already exists"
    echo "✅ Found existing KV namespace ID: $KV_ID"
else
    echo "Creating KV namespace: $KV_NAMESPACE_NAME"
    # Create KV namespace and get its ID
    KV_OUTPUT=$(pnpm exec wrangler kv namespace create "$KV_NAMESPACE_NAME" 2>&1 || true)

    if echo "$KV_OUTPUT" | grep -q "already exists"; then
        echo "ℹ️  KV namespace already exists (detected after creation attempt), getting ID..."
        # Re-list to get the ID
        KV_LIST=$(pnpm exec wrangler kv namespace list 2>/dev/null || echo "")
        if echo "$KV_LIST" | grep -q "$KV_NAMESPACE_NAME"; then
            KV_ID=$(echo "$KV_LIST" | grep "$KV_NAMESPACE_NAME" | sed 's/.*id: *\([a-zA-Z0-9_-]*\).*/\1/' | head -1 || echo "")
        fi
        if [ -n "$KV_ID" ]; then
            echo "✅ Found existing KV namespace ID: $KV_ID"
        else
            echo "⚠️  Could not find KV namespace ID automatically"
            echo "Please run: pnpm exec wrangler kv namespace list"
            echo "Look for the line with '$KV_NAMESPACE_NAME' and extract the ID from 'id: <ID>'"
            echo "Then update wrangler.jsonc with the correct ID"
        fi
    else
        # Extract the ID from the human-readable output (creation succeeded)
        # Look for patterns like "ID: abc123..." in the output
        if echo "$KV_OUTPUT" | grep -q "ID:"; then
            KV_ID=$(echo "$KV_OUTPUT" | grep "ID:" | head -1 | sed 's/.*ID: *\([a-zA-Z0-9_-]*\).*/\1/' || echo "")
            PREVIEW_ID=$KV_ID # Preview ID is usually the same as main ID
        else
            echo "⚠️  Could not extract KV namespace ID from output"
            echo "Output was: $KV_OUTPUT"
            KV_ID=""
            PREVIEW_ID=""
        fi

        if [ -n "$KV_ID" ]; then
            echo "✅ Created KV namespace"
            echo "   ID: $KV_ID"
            if [ -n "$PREVIEW_ID" ]; then
                echo "   Preview ID: $PREVIEW_ID"
            fi
            echo ""
            echo "📝 Update wrangler.jsonc with these IDs:"
            echo '   "kv_namespaces": ['
            echo '     {'
            echo "       \"binding\": \"KV_QUICKBOOKS\","
            echo "       \"id\": \"$KV_ID\","
            if [ -n "$PREVIEW_ID" ]; then
                echo "       \"preview_id\": \"$PREVIEW_ID\","
            else
                echo "       \"preview_id\": \"$KV_ID\","
            fi
            echo '     },'
            echo '   ],'
        else
            echo "⚠️  Could not extract KV namespace ID from output"
            echo "Output was: $KV_OUTPUT"
        fi
    fi
fi

echo ""

# ============================================================================
# Durable Objects Setup
# ============================================================================
echo "🔄 Durable Objects setup..."
echo "ℹ️  Durable Objects will be created automatically on first deployment"
echo "   Make sure migrations are configured in wrangler.jsonc:"
echo "   - DOQueueHandler"
echo "   - DOShardedTagCache"
echo "   - BucketCachePurge"
echo ""

# ============================================================================
# Service Binding
# ============================================================================
echo "🔗 Service binding..."
echo "✅ Service binding configured in wrangler.jsonc (self-reference to 'allthingslinux' worker)"
echo "   This will work after the worker is deployed"
echo ""

echo "✨ Setup complete!"
echo ""
echo "📋 Next steps:"
if [ -n "$KV_ID" ]; then
    echo "1. ✅ Update wrangler.jsonc with the KV namespace ID shown above"
fi
echo "2. Deploy the worker: pnpm run deploy   # alchemy deploy --app web (from apps/web)"
echo "   (or use CI: .github/workflows/web-deploy.yml)"
echo "3. Durable Objects will be created automatically on first deployment"
echo ""
echo "💡 Tip: You can also run this script with a secrets file:"
echo "   CLOUDFLARE_API_TOKEN=your_token bash scripts/setup-bindings.sh"
