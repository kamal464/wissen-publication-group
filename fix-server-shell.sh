#!/bin/bash
# ==========================================
# Fix .profile and .bashrc syntax errors on EC2 (stray "fi").
# Run ON the server (e.g. in AWS browser terminal):
#   bash fix-server-shell.sh
# Or after upload: cd /var/www/wissen-publication-group && sudo bash fix-server-shell.sh
# ==========================================

set -e

PROFILE="/home/ubuntu/.profile"
BASHRC="/home/ubuntu/.bashrc"

fix_line() {
    local file="$1"
    local line_num="$2"
    if [ -f "$file" ] && [ -n "$line_num" ]; then
        if sudo sed -n "${line_num}p" "$file" | grep -qE '^\s*fi\s*'"'"'?\s*$|^\s*fi\s*$'; then
            echo "Commenting out line $line_num in $file (stray fi)"
            sudo sed -i "${line_num}s/^/# FIXED: /" "$file"
            return 0
        fi
    fi
    return 1
}

echo "Fixing shell config syntax errors..."

# .profile line 10
if [ -f "$PROFILE" ]; then
    fix_line "$PROFILE" 10 && echo "  -> .profile line 10 fixed" || echo "  -> .profile: inspect with: sed -n '1,20p' $PROFILE"
else
    echo "  -> $PROFILE not found, skip"
fi

# .bashrc line 31
if [ -f "$BASHRC" ]; then
    fix_line "$BASHRC" 31 && echo "  -> .bashrc line 31 fixed" || echo "  -> .bashrc: inspect with: sed -n '1,40p' $BASHRC"
else
    echo "  -> $BASHRC not found, skip"
fi

echo "Done. Open a new session or run: source $PROFILE; source $BASHRC"
