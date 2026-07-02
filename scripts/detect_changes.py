"""
Run by the post-merge git hook.
Detects changed files in tracked directories and writes changes.json.
"""
import json
import subprocess
from pathlib import Path

CHANGES_FILE = Path(__file__).parent.parent / ".claude" / "changes.json"

TRACKED_DIRS = [".claude/", "todo-app/"]

STATUS_LABELS = {"A": "added", "M": "modified", "D": "deleted"}

SUMMARIES = {
    "CLAUDE.md": "Project instructions updated — review before starting work",
    "settings.json": "Claude Code settings changed — MCP servers or permissions may differ",
}


def get_commit_info(filepath: str) -> dict:
    result = subprocess.run(
        ["git", "log", "ORIG_HEAD..HEAD", "--format=%an|%ai|%s", "--", filepath],
        capture_output=True,
        text=True,
    )
    line = result.stdout.strip().splitlines()
    if not line:
        return {"author": "unknown", "timestamp": "", "commit": ""}
    parts = line[0].split("|", 2)
    return {
        "author": parts[0] if len(parts) > 0 else "unknown",
        "timestamp": parts[1][:16] if len(parts) > 1 else "",
        "commit": parts[2] if len(parts) > 2 else "",
    }


def get_changed_files() -> list[dict]:
    result = subprocess.run(
        ["git", "diff", "ORIG_HEAD", "HEAD", "--name-status", "--"] + TRACKED_DIRS,
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
            info = get_commit_info(filepath)
            files.append({
                "path": filepath,
                "status": label,
                "summary": SUMMARIES.get(filename, ""),
                "author": info["author"],
                "timestamp": info["timestamp"],
                "commit": info["commit"],
            })
    return files


def main():
    changed = get_changed_files()
    if not changed:
        print("No changes detected in tracked directories.")
        return

    existing = {}
    if CHANGES_FILE.exists():
        existing = json.loads(CHANGES_FILE.read_text())

    for item in changed:
        existing[item["path"]] = {
            "status": item["status"],
            "summary": item["summary"],
            "author": item["author"],
            "timestamp": item["timestamp"],
            "commit": item["commit"],
        }

    CHANGES_FILE.parent.mkdir(parents=True, exist_ok=True)
    CHANGES_FILE.write_text(json.dumps(existing, indent=2, ensure_ascii=False))
    print(f"Recorded {len(changed)} change(s) → .claude/changes.json")


if __name__ == "__main__":
    main()
