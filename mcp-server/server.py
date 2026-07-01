import json
import os
from pathlib import Path
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("claude-team-sync")

CHANGES_FILE = Path(__file__).parent.parent / ".claude" / "changes.json"
SEEN_FILE = Path(__file__).parent.parent / ".claude" / "seen_changes.json"


def _load_json(path: Path) -> dict:
    if path.exists():
        return json.loads(path.read_text())
    return {}


def _save_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False))


@mcp.resource("claude://team-changes")
def get_team_changes() -> str:
    """Return unseen Claude Code changes made by teammates."""
    changes = _load_json(CHANGES_FILE)
    seen = _load_json(SEEN_FILE)

    unseen = {k: v for k, v in changes.items() if k not in seen}

    if not unseen:
        return "No new Claude Code changes from teammates."

    lines = ["## New Claude Code changes from your teammate:\n"]
    for filename, detail in unseen.items():
        lines.append(f"- **{detail['status']}** `{filename}`")
        if detail.get("summary"):
            lines.append(f"  → {detail['summary']}")

    return "\n".join(lines)


@mcp.tool()
def acknowledge_changes() -> str:
    """Mark all current team changes as seen."""
    changes = _load_json(CHANGES_FILE)
    seen = _load_json(SEEN_FILE)
    seen.update({k: True for k in changes})
    _save_json(SEEN_FILE, seen)
    return "All changes marked as seen."


if __name__ == "__main__":
    mcp.run()
