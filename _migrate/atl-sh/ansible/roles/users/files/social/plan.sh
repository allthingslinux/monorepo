#!/bin/bash
# plan — read a user's .plan file
# Usage: plan [username]

if [ -z "$1" ]; then
    echo "Usage: plan <username>"
    exit 1
fi

USER="$1"
PLAN="/home/$USER/.plan"

if ! id "$USER" &>/dev/null; then
    echo "No such user: $USER"
    exit 1
fi

if [ -f "$PLAN" ] && [ -r "$PLAN" ]; then
    echo "=== $USER's .plan ==="
    cat "$PLAN"
else
    echo "$USER has no .plan"
fi
