# Team Sync Project

## Session Start Rule
At the start of every session, check the `claude://team-changes` resource.
If there are unseen changes, tell the developer:
- What file changed (added / modified / deleted)
- Who changed it (author) and when (timestamp)
- What the commit message was
- Why it matters (summary)

After informing the developer, call the `acknowledge_changes` tool to mark them as seen.
If there are no unseen changes, continue the session normally without mentioning it.

## MCP Server
This project uses the `claude-team-sync` MCP server.
It tracks changes to `.claude/` files made by teammates via git, including author and timestamp.
