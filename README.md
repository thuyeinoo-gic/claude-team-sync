# Claude Team Sync

Developer 2 ယောက် Git နဲ့ collaborate လုပ်သောအခါ teammate ရဲ့ Claude Code changes တွေကို
`git pull` ပြီးတာနဲ့ Claude Code က **ဘယ်သူ၊ ဘယ်ချိန်၊ ဘာပြောင်းသွားလဲ** အလိုအလျောက် အသိပေးတဲ့ MCP server။

## Prerequisites

- [uv](https://docs.astral.sh/uv/) — Python package manager
- Git user config ထားရှိရမည်:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

## Setup (Developer တစ်ယောက်ချင်းစီ လုပ်ရ)

```bash
# 1. repo clone
git clone <repo-url>
cd claude-team-sync

# 2. uv install (မရှိသေးရင်)
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env

# 3. dependencies install
uv sync --project mcp-server

# 4. git hook install (one-time)
bash scripts/install-hook.sh
```

## Usage

```bash
# Dev A: .claude/ ထဲ change တွေ push
git add .claude/
git commit -m "add security-review skill"
git push

# Dev B: pull ဆွဲ → hook auto-run → changes.json update
git pull

# Dev B: Claude Code ဖွင့် → အလိုအလျောက် inform
claude
```

Claude Code session start မှာ ဒီလို ပြမည်:

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
│   ├── detect_changes.py  ← git hook ကနေ ခေါ်
│   └── install-hook.sh    ← one-time setup
└── .gitignore             ← changes.json, seen_changes.json excluded
```

## How It Works

1. `git pull` → `post-merge` hook → `detect_changes.py` run
2. `.claude/` ထဲ ဘာပြောင်းလဲ + ဘယ်သူ + ဘယ်ချိန် → `changes.json` မှာ save
3. MCP server က `claude://team-changes` resource အဖြစ် expose
4. Claude Code session start မှာ CLAUDE.md instruction အရ resource check
5. Unseen changes ရှိရင် developer ကို inform → `acknowledge_changes` tool call → နောက် session မှာ မထပ်ပြတော့

## Local-only Files (.gitignored)

| File | ရှင်းလင်းချက် |
|---|---|
| `.claude/changes.json` | `git pull` ပြီးတိုင်း hook က ဆောက်ပေး |
| `.claude/seen_changes.json` | developer တစ်ဦးချင်း seen state |
