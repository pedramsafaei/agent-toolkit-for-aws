# Connector Diagnostics artifact verification

The executable at
[`../scripts/connector-diagnostics.mjs`](../scripts/connector-diagnostics.mjs)
is a self-contained, human-readable Node.js artifact generated from reviewed
TypeScript source. It is distributed with the `aws-security` skill. Running it
does not require access to a source repository or package registry.

## Artifact identity

The reviewed artifact has the following identity:

- SHA-256: `b0bef61c0ec4b3ecaeb863146369e16041836a763a54a6af07156d61cc75273e`
- Size: 96,011 bytes
- Line count: 2,529 lines

The output is intentionally non-minified, retains `// dist/...` source-module
section labels, and contains no bundled `node_modules` sections or esbuild
`__esm`, `__commonJS`, `__toESM`, or `__copyProps` wrappers.

## Verify the installed artifact

From the installed `aws-security` skill directory, run:

```bash
sha256sum scripts/connector-diagnostics.mjs
wc -c scripts/connector-diagnostics.mjs
wc -l scripts/connector-diagnostics.mjs
```

The results must match the hash, byte count, and line count above. A mismatch
means the installed artifact is not the reviewed version; do not run it until
you reinstall or refresh the skill from the supported distribution.

## Runtime requirements

The artifact is stdin-JSON only: pass exactly one JSON request object on stdin
and read one JSON response object from stdout. It takes no positional arguments
and no flags.

It requires:

- A POSIX host (Linux or macOS). Windows is unsupported because Azure CLI is an
  `az.cmd` wrapper that requires shell execution, which this collector forbids.
- Node.js 24 or later.
- The AWS CLI for AWS-side reads.
- The Azure CLI and an existing authenticated session for Azure-side reads.
- The caller's existing temporary AWS credentials and, when Azure evidence is
  requested, the caller's existing Azure CLI session.

It does not require `npm install`, `node_modules`, the AWS MCP server, or access
to the source repository. The script executes only bounded, allowlisted,
read-only commands and emits redacted error categories rather than raw provider
errors or credentials.

Internal source, build, code-review, and security-review provenance is retained
in Amazon review systems. Customers need only the reviewed artifact distributed
with the skill and the verification values recorded here.
