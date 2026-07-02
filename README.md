# Claude Team Sync

An MCP server that automatically notifies developers about Claude Code changes
(Skills, CLAUDE.md, settings) made by teammates after `git pull` — including
who changed it, when, and why it matters.

## Prerequisites

- [uv](https://docs.astral.sh/uv/) — Python package manager
- Git user config must be set:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

## Setup (each developer runs once)

```bash
# 1. Clone the repo
git clone <repo-url>
cd claude-team-sync

# 2. Install uv (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env

# 3. Install dependencies
uv sync --project mcp-server

# 4. Install git hook
bash scripts/install-hook.sh
```

## Usage

```bash
# Dev A: push .claude/ changes
git add .claude/
git commit -m "add security-review skill"
git push

# Dev B: pull → hook runs automatically → changes.json updated
git pull

# Dev B: open Claude Code → notified automatically
claude
```

Claude Code will show at session start:

```
## New Claude Code changes from your teammate:

- **added** `.claude/commands/security-review.md` — Alice (2026-07-02 10:53)
  commit: add security-review skill
```

## Project Structure

```
claude-team-sync/
├── .claude/
│   ├── CLAUDE.md          ← session start rule
│   ├── settings.json      ← MCP server config
│   └── commands/          ← shared Skills (git tracked)
├── mcp-server/
│   ├── server.py          ← MCP Resource + Tool
│   └── pyproject.toml
├── scripts/
│   ├── detect_changes.py  ← called by git hook
│   └── install-hook.sh    ← one-time setup
└── .gitignore             ← changes.json, seen_changes.json excluded
```

## How It Works

1. `git pull` → `post-merge` hook → `detect_changes.py` runs
2. Detects what changed in `.claude/` + who + when → saved to `changes.json`
3. MCP server exposes `claude://team-changes` resource
4. Claude Code reads CLAUDE.md at session start → checks the resource
5. If unseen changes exist → informs developer → calls `acknowledge_changes` → not shown again

## Local-only Files (.gitignored)

| File | Description |
|---|---|
| `.claude/changes.json` | created by hook after every `git pull` |
| `.claude/seen_changes.json` | per-developer seen state |
