"""
Run by the post-merge git hook.
Reads changed .claude/ files from stdin and writes changes.json.
"""
import json
import subprocess
import sys
from pathlib import Path

CHANGES_FILE = Path(__file__).parent.parent / ".claude" / "changes.json"

STATUS_LABELS = {"A": "added", "M": "modified", "D": "deleted"}

SUMMARIES = {
    "CLAUDE.md": "Project instructions updated — review before starting work",
    "settings.json": "Claude Code settings changed — MCP servers or permissions may differ",
}


def get_changed_claude_files() -> list[dict]:
    result = subprocess.run(
        ["git", "diff", "ORIG_HEAD", "HEAD", "--name-status", "--", ".claude/"],
        capture_output=True,
        text=True,
    )
    files = []
    for line in result.stdout.strip().splitlines():
        if not line:
            continue
        parts = line.split("\t", 1)
        if len(parts) == 2:
            status_code, filepath = parts
            label = STATUS_LABELS.get(status_code[0], "changed")
            filename = Path(filepath).name
            files.append({
                "path": filepath,
                "status": label,
                "summary": SUMMARIES.get(filename, ""),
            })
    return files


def main():
    changed = get_changed_claude_files()
    if not changed:
        print("No .claude/ changes detected.")
        return

    existing = {}
    if CHANGES_FILE.exists():
        existing = json.loads(CHANGES_FILE.read_text())

    for item in changed:
        existing[item["path"]] = {
            "status": item["status"],
            "summary": item["summary"],
        }

    CHANGES_FILE.parent.mkdir(parents=True, exist_ok=True)
    CHANGES_FILE.write_text(json.dumps(existing, indent=2, ensure_ascii=False))
    print(f"Recorded {len(changed)} Claude Code change(s) → .claude/changes.json")


if __name__ == "__main__":
    main()
