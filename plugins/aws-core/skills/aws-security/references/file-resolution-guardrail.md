# Bundled file resolution guardrail

The `aws-security` skill can be loaded through AWS MCP retrieval or from a local installation. You MUST identify which mode loaded the skill before reading any bundled reference or running any bundled script, because the file location differs by mode.

## Loaded through AWS MCP

When the skill was loaded through the AWS MCP `retrieve_skill` tool, its bundled files are not installed on the local filesystem.

- You MUST fetch each reference or script with `retrieve_skill` and its `file` parameter, for example `file="references/connector-diagnostics.md"` or `file="scripts/connector-diagnostics.mjs"`.
- You MUST run a script from the content returned by `retrieve_skill`.
- You MUST NOT use a local file-reading tool for these skill-relative paths because they do not exist on disk in this mode.

## Installed locally

When the skill is installed locally, for example under `.kiro/skills/aws-security/` or `~/.claude/skills/aws-security/`, read references and run scripts relative to that local skill directory. You MUST NOT call `retrieve_skill` for locally installed files because the local package is the authority for that installation.

## User data boundary

This distinction applies only to the skill's own bundled references and scripts. User data and session artifacts are always read from and written to the user's working directory. You MUST NOT fetch or write user data through `retrieve_skill` because it is only a skill-content retrieval interface.
