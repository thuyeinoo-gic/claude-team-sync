#!/bin/bash
# Run once per developer to install the git hook
set -e

HOOK_PATH=".git/hooks/post-merge"

cat > "$HOOK_PATH" << 'EOF'
#!/bin/bash
python3 scripts/detect_changes.py
EOF

chmod +x "$HOOK_PATH"
echo "post-merge hook installed at $HOOK_PATH"
