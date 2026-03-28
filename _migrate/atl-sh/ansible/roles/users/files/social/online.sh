#!/bin/bash
# online — show who's logged in with their .plan summary
# Usage: online

printf "%-14s %-8s %-16s %s\n" "USER" "TTY" "IDLE" "PLAN"
printf "%-14s %-8s %-16s %s\n" "----" "---" "----" "----"

who -u | while read -r user tty _ _ idle _; do
    plan=""
    if [ -f "/home/$user/.plan" ] && [ -r "/home/$user/.plan" ]; then
        plan=$(head -1 "/home/$user/.plan" | cut -c1-40)
    fi
    [ "$idle" = "?" ] && idle="active"
    printf "%-14s %-8s %-16s %s\n" "$user" "$tty" "$idle" "$plan"
done
