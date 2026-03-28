#!/bin/bash
# lastplan — show recently updated .plan files
# Usage: lastplan [days]

DAYS="${1:-7}"

echo "=== .plan updates (last ${DAYS}d) ==="
echo ""

found=0
while IFS= read -r planfile; do
    user=$(stat -c '%U' "$planfile" 2>/dev/null)
    age=$(stat -c '%Y' "$planfile" 2>/dev/null)
    date=$(date -d "@$age" '+%b %d %H:%M' 2>/dev/null)
    if [ -r "$planfile" ] && [ -n "$user" ]; then
        found=1
        echo "--- $user ($date) ---"
        head -5 "$planfile"
        lines=$(wc -l < "$planfile")
        [ "$lines" -gt 5 ] && echo "  [...$(( lines - 5 )) more lines]"
        echo ""
    fi
done < <(find /home -maxdepth 2 -name .plan -mtime "-${DAYS}" -type f 2>/dev/null | sort -t/ -k3)

[ "$found" -eq 0 ] && echo "No .plan updates in the last ${DAYS} days."
