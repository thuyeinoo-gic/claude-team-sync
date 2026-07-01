# Team Sync Project

## Session Start Rule
At the start of every session, check the `claude://team-changes` resource.
If there are unseen changes, tell the developer exactly what changed and why it matters.
After informing the developer, call the `acknowledge_changes` tool to mark them as seen.

## MCP Server
This project uses the `claude-team-sync` MCP server.
It tracks changes to `.claude/` files made by teammates via git.
