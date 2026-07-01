# Claude Team Sync

Developer 2 ယောက် Git နဲ့ collaborate လုပ်သောအခါ teammate ရဲ့ Claude Code changes တွေကို
`git pull` ပြီးတာနဲ့ Claude Code က အလိုအလျောက် အသိပေးတဲ့ MCP server။

## Setup (Developer တစ်ယောက်ချင်းစီ လုပ်ရ)

```bash
# 1. uv install (မရှိသေးရင်)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 2. dependencies install
cd mcp-server
uv sync

# 3. git hook install
bash scripts/install-hook.sh
```

## Usage

```bash
# Dev A: change တွေ push
git add .claude/
git commit -m "add security-review skill"
git push

# Dev B: pull ဆွဲ → hook auto-run → changes.json update
git pull

# Dev B: Claude Code ဖွင့် → အလိုအလျောက် inform
claude
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
└── .gitignore             ← changes.json excluded
```

## How It Works

1. `post-merge` hook → `detect_changes.py` run
2. `.claude/` ထဲ ဘာပြောင်းသွားတယ်ဆိုတာ `changes.json` မှာ save
3. MCP server က `claude://team-changes` resource အဖြစ် expose
4. Claude Code session start မှာ CLAUDE.md instruction အရ resource check
5. Unseen changes ရှိရင် developer ကို inform → `acknowledge_changes` tool call
