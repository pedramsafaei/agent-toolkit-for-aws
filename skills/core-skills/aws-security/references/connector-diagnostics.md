# Security Hub Connector Diagnostics

## Contents

- [Overview](#overview)
- [Required answer semantics](#required-answer-semantics)
- [When to route here](#when-to-route-here)
- [Guarantees and semantics](#guarantees-and-semantics)
- [Security considerations](#security-considerations)
- [How to run](#how-to-run)
  - [`diagnose_connector` request](#diagnose_connector-request)
  - [`assess_connector_readiness` request](#assess_connector_readiness-request)
- [Interpreting the output](#interpreting-the-output)

## Overview

Diagnoses and assesses the setup readiness of a specific Security Hub V2 (OCSF)
third-party connector — for example an Azure connector that ingests Microsoft
Defender, Entra, and Event Hub signals. It answers two operational questions:

- **`diagnose_connector`** — Why is an existing connector unhealthy or failing,
  and can recovery be proven from evidence?
- **`assess_connector_readiness`** — Would a *proposed* connector configuration
  succeed, based on its proposed AWS account/Region context and the current
  Azure-side setup? Readiness makes no AWS API calls.

This is the **Security Hub Connector Diagnostics workflow available through your supported AWS agent or MCP experience.** It is surface-neutral: the same
workflow may be delivered through the AWS Security Hub MCP server, the AWS MCP
server, or the AWS Agent Toolkit. Do not describe it as bound to any single
surface, and do not name a specific product surface in customer-facing replies.

## Required answer semantics

When these topics appear in a customer question, state the following explicitly:

- Diagnosis and readiness share the same **versioned diagnostic result contract**.
  Finding statuses are `PASSED`, `FAILED`, `PENDING`, and `UNKNOWN`.
  Diagnosis-only `resolution.outcome: RESOLVED` means the connector selector was
  resolved; it is neither a check status nor a health verdict.
- If Azure did not run or produced only `UNAVAILABLE` placeholders, `awsOnly` is
  `true`. If Azure was reached but denied, `awsOnly` remains `false`. In both
  cases AWS conclusions remain valid and Azure checks remain unverified.
- `CAPABILITY_UNKNOWN` means the GetConnectorV2 adapter does not report
  service-linked capability/lifecycle metadata; it does not mean the customer
  disabled a feature. Keep `AZ_RECORDING_SUB_MISSING` and
  `AZ_DEFENDER_EXPORT_BROKEN` explicit with `CAPABILITY_UNKNOWN` rather than
  omitting them. Capability-agnostic checks use `EVIDENCE_UNAVAILABLE` or
  `EVIDENCE_DENIED`; capability applicability takes precedence for gated checks.
- Region validation is structural only. A plausible typo such as `us-eats-1`
  passes structural validation; this does not prove the Region is supported.
  Do not rewrite it to `us-east-1`. Advise the customer to verify the intended
  Region independently, and surface runtime access failures as unverified/error
  evidence rather than fabricating health.

## When to route here

Route to this reference when the user asks to **diagnose, troubleshoot, or
assess the readiness of one named connector** — e.g. "why is my Azure connector
failing", "diagnose connector ID", "is my connector set up correctly", "will
this connector configuration work". Diagnosis and readiness are **independent
from findings**: a request about *finding* volume, risk, exposure, or posture
trends is not a diagnostics request — route those to `security-hub-findings`.

Route to `security-hub-configuration` instead when the user wants to **list or
check connectors generically** as part of reviewing overall Security Hub V2
setup ("list my connectors", "are connectors configured", "check connector
status" across the account). This reference is only for **deep diagnosis or
readiness assessment of a specific connector**.

## Guarantees and semantics

- **Read-only.** Diagnosis issues only the non-mutating, allowlisted AWS reads
  `securityhub list-connectors-v2` and `securityhub get-connector-v2`.
  Readiness makes no AWS API calls; it treats the supplied account and Region as
  proposed context. Both operations may issue read-only Azure CLI queries when
  Azure access is enabled. Neither operation creates, modifies, enables,
  disables, deletes, or remediates any resource.
- **Evidence-based, no false healthy claims.** Every check is backed by
  collected evidence. When evidence for a check cannot be collected, that check
  is reported as an **unverified check** with a reason such as
  `EVIDENCE_UNAVAILABLE` — it is **never** reported as healthy or passing. An
  overall result of `UNKNOWN` means the workflow could not prove health; it does
  not mean the connector is healthy. Do not translate `UNKNOWN`, an `ERROR`
  resolution, or an unverified check into a "healthy" or "working" statement.
- **AWS-only / unverified distinction (`awsOnly`).** When Azure collection does
  not run or produces only `UNAVAILABLE` placeholders — for example because
  Azure access is disabled or no Azure CLI session exists — the response sets
  `awsOnly: true` and returns Azure checks as unverified. If Azure is reached but
  access is denied, those `DENIED` checks are meaningful attempted-Azure evidence:
  `awsOnly` remains false, while the checks stay unverified with
  `EVIDENCE_DENIED`. In AWS-only mode, report only AWS-side conclusions and MUST
  state that the Azure side was not verified. Never present an `awsOnly` result
  as a complete, both-sides-healthy assessment.
- **Unknown capability applicability (`CAPABILITY_UNKNOWN`).** When the
  `GetConnectorV2` Azure provider detail does not report the service-linked
  lifecycle metadata needed to determine applicability, capability-gated rules
  are returned as unverified with reason `CAPABILITY_UNKNOWN`; they are never
  evaluated under assumed enablement and never marked `NOT_APPLICABLE` as
  though disablement were known. `AZ_RECORDING_SUB_MISSING` and
  `AZ_DEFENDER_EXPORT_BROKEN` must remain explicit in `unverifiedChecks` rather
  than silently disappearing. Unknown is not a failure, and it does not mean
  the customer disabled or failed to select a connector capability.
- **Explicit scope only.** `awsRegion` must be explicit and match the AWS
  Region name structure (for example, `us-east-1`). The artifact intentionally
  carries no static Region catalog. Structural validation does not prove that a
  Region is supported: diagnosis reports any Security Hub access failure through
  its existing unverified/error semantics, while readiness treats the Region as
  proposed setup context. Verify the intended Region independently when input is
  uncertain. `awsAccountId` must be exactly 12 digits.
  **Tenant-wide Azure scope is not supported for either operation.** Readiness
  requires 1–10 explicit subscription UUIDs, and diagnosis supports only an
  existing connector whose configured scope contains 1–10 subscriptions. A
  larger configured scope fails safely without producing a health conclusion.
  There is no "scan the whole tenant" mode.
- **Bounded and safe.** Input is capped (64 KiB request, connector selector
  ≤ 256 chars), each AWS CLI call runs with a fixed timeout and bounded output
  buffer, and errors are redacted to a generic category/message so credentials,
  tokens, and raw provider payloads are never emitted.

## Security considerations

- **Invocation and credentials:** Restrict workflow invocation to authorized
  operators. It runs with the caller's AWS credentials and, when Azure access
  is enabled, the caller's existing Azure CLI session. Use temporary
  assumed-role or AWS SSO credentials for AWS — never long-lived access keys.
  Prefer certificate-based or federated workload identity credentials for
  automated Azure CLI sessions, use least privilege, and avoid Azure client
  secrets where possible. If an Azure client secret is unavoidable, store it in
  AWS Secrets Manager or Azure Key Vault with automatic rotation enabled; never
  persist it in environment variables, configuration files, or source control.
- **AWS least privilege and audit (diagnosis only):** Readiness makes no AWS API
  calls and requires no AWS permissions. Diagnosis needs only
  `securityhub:ListConnectorsV2` and `securityhub:GetConnectorV2`.
  `ListConnectorsV2` does not support resource-level permissions, so grant it on
  `Resource: "*"` with an `aws:RequestedRegion` condition for the intended
  Region. Grant `GetConnectorV2` only on the target
  `arn:aws:securityhub:<region>:<account>:connectorv2/*` resources and apply the
  same Region condition. Verify CloudTrail records these calls in the target
  account and Region so access is attributable and reviewable. Encrypt
  CloudTrail logs with a customer-managed AWS KMS key whose policy grants only
  the required trail and operator access, and enable CloudTrail log file
  validation so tampering can be detected. See the
  [Security Hub service authorization reference](https://docs.aws.amazon.com/service-authorization/latest/reference/list_securityhub.html).
- **Invocation throttling:** The invoking host or orchestrator MUST enforce
  per-principal request rate and concurrency limits before launching this
  one-shot CLI, use a bounded queue, and reject excess work. Honor provider
  throttling responses with bounded exponential backoff and jitter; do not rely
  on post-hoc detection as the control. If the workflow is exposed through API
  Gateway, require an authorizer such as IAM authorization, a Lambda authorizer,
  or a Cognito user pool; never deploy the endpoint with authorization type
  `NONE`. Also configure stage or method throttles and usage-plan quotas, while
  treating those quotas as client-usage controls rather than authorization. If
  the endpoint is publicly accessible, associate AWS WAF and use applicable
  managed rule groups for defense in depth against common HTTP attacks. For an
  API Gateway custom domain, use an AWS Certificate Manager (ACM) certificate so
  TLS certificate issuance and renewal remain managed. Enable API Gateway
  access logging to a KMS-encrypted CloudWatch Logs log group to capture
  request-level audit records for the diagnostic endpoint; do not log request
  or response bodies containing diagnostic data. Configure every response with
  `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`,
  `Referrer-Policy: strict-origin-when-cross-origin`,
  `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'`,
  `Pragma: no-cache`, and `Cache-Control: no-store` through API Gateway response
  mappings. Do not reflect request-header values into response headers.
- **Detection:** Use CloudWatch alarms or EventBridge rules over the relevant
  CloudTrail events to detect repeated rapid diagnostic reads, unexpected
  principals, or unexpected Regions. Diagnostic access reveals connector and
  infrastructure topology and should be monitored like other sensitive reads.
- **Microsoft Graph read:** The only Microsoft Graph request is regex-pinned to
  the trusted first-party `graph.microsoft.com` host, uses `GET`, and reads the
  selected `appRoleId` and `resourceId` fields solely to verify app-role
  assignment state. Arbitrary Graph hosts, methods, paths, and projections are
  rejected before process execution.
- **Sensitive output and logging surfaces:** Results can contain connector ARNs,
  AWS account and Region identifiers, Azure tenant and subscription IDs, health
  state, and remediation details. Do not share them through unprotected
  channels. MCP server logs, agent conversation/session histories, CloudWatch
  Logs, and other surfaces that capture the output must use the same access and
  retention controls as persisted results. You MUST configure KMS encryption on
  every CloudWatch Logs log group that receives connector diagnostic output,
  using a customer-managed KMS key with a least-privilege key policy. Restrict
  key use to the intended log group ARNs with the
  `kms:EncryptionContext:aws:logs:arn` condition key. If alarms or EventBridge
  rules forward diagnostic events to SNS, enable SSE-KMS on those topics,
  allow only HTTPS subscription endpoints (never HTTP), and enforce that
  requirement with an `sns:Protocol` condition on `sns:Subscribe`. Verify every
  endpoint is owned and controlled by authorized operators; reject arbitrary or
  unreviewed HTTPS endpoints and email addresses. For HTTPS subscriptions,
  enforce a `StringLike` `sns:Endpoint` condition that permits only pre-approved
  URLs under organization-owned domains. Restrict the topic resource policy to
  the intended service principal, and include an explicit deny for API requests
  where `aws:SecureTransport` is `false`. Include `aws:SourceArn`
  conditions for the specific EventBridge rule or CloudWatch alarm ARNs and an
  `aws:SourceAccount` condition for the owning account. Enable equivalent
  platform encryption on other logging surfaces.
- **AWS security references:** Follow
  [IAM security best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html),
  [CloudWatch Logs KMS encryption guidance](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/encrypt-log-data-kms.html),
  the [Security Hub User Guide](https://docs.aws.amazon.com/securityhub/latest/userguide/),
  and the [AWS Well-Architected Security Pillar](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/).

## How to run

The workflow ships as a self-contained, non-minified Node script at
[`../scripts/connector-diagnostics.mjs`](../scripts/connector-diagnostics.mjs). It is
**stdin-JSON only**: pass exactly one JSON request object on stdin and read one
JSON response object from stdout. It takes no positional arguments and no flags.
For diagnosis, run it with the caller's existing AWS credentials (temporary
role credentials via IAM role or AWS SSO — never long-lived access keys).
Readiness makes no AWS API calls and does not require AWS credentials. For Azure
evidence in either operation, an already-authenticated read-only Azure CLI
session must be present in the environment. When available, the AWS MCP server
is recommended for sandboxed execution and audit logging, but it is not a hard
requirement. Node.js 24 or later and a POSIX host (Linux or macOS) are required;
no `node_modules` install is needed — the script is fully bundled. Windows is
not supported because its Azure CLI is an `az.cmd` wrapper that requires shell
execution, while this collector deliberately executes child processes without
a shell. See the
[artifact verification record](connector-diagnostics-build.md) to verify the
installed executable.

```bash
echo '<request-json>' | node scripts/connector-diagnostics.mjs
```

### `diagnose_connector` request

```json
{
  "operation": "diagnose_connector",
  "azureAccess": "auto",
  "arguments": {
    "connectorId": "18cf7b55-e49a-0e6a-66e8-601d79dd8783",
    "awsAccountId": "123456789012",
    "awsRegion": "us-east-1"
  }
}
```

- Provide **exactly one** of `connectorId` or `connectorName` (never both,
  never neither — otherwise the request is rejected as an invalid selector).
- `azureAccess`: `"auto"` (default) attempts read-only Azure evidence collection
  from the ambient Azure CLI session; `"disabled"` skips Azure entirely and
  forces `awsOnly: true`.

### `assess_connector_readiness` request

```json
{
  "operation": "assess_connector_readiness",
  "azureAccess": "auto",
  "arguments": {
    "awsAccountId": "123456789012",
    "awsRegion": "us-east-1",
    "azureTenantId": "6b873ed7-0000-0000-0000-000000000000",
    "subscriptionIds": ["11111111-2222-3333-4444-555555555555"],
    "capabilities": { "cspm": true, "inspector": false, "threats": false }
  }
}
```

- `subscriptionIds` must be a non-empty array of subscription UUIDs (1–10).
- `capabilities` selects the connector capabilities to assess; each is a boolean.

## Interpreting the output

Both operations return a JSON object. Key fields:

| Field | Meaning |
|-------|---------|
| `resolution.outcome` (diagnose) | Connector selection outcome: `RESOLVED`, `NOT_FOUND`, `AMBIGUOUS`, `INVALID_SELECTOR`, `SCAN_TRUNCATED`, or `ERROR`. This is not a health verdict. Only `RESOLVED` includes a connector id. |
| `runtimeRecoveryProven` (diagnose) | `true` only when fresh runtime evidence proves the connector recovered. Absence of proof is not proof of failure. |
| `awsOnly` | `true` when Azure collection did not run or produced only `UNAVAILABLE` placeholders. `DENIED` means Azure was attempted, keeps `awsOnly: false`, and remains unverified. Qualify the answer accordingly. |
| `result.overall` | `HEALTHY`, `DEGRADED`, `FAILED`, `PENDING`, or `UNKNOWN`. `UNKNOWN` means health was not proven; `PENDING` is the bounded post-creation stabilization state. |
| `result.findings` | Deterministically ordered rule results with `PASSED`, `FAILED`, `PENDING`, or `UNKNOWN` status, catalog-owned severity/remediation, evidence, and affected scope. Do not invent or override severity. |
| `result.unverifiedChecks` | Checks that could not be evaluated, each with a `reason` (for example `EVIDENCE_UNAVAILABLE`, `CAPABILITY_UNKNOWN`, `NOT_APPLICABLE`, or `PROVIDER_NOT_SUPPORTED`). When collection was attempted and failed, `errorCategories` carries only closed categories such as `TIMEOUT` or `UNCATEGORIZED`; it is omitted when collection was not attempted. For diagnosis, `UNSUPPORTED_SCOPE` here means the existing connector exceeds the supported 1–10 explicit-subscription scope; the result remains `UNKNOWN` and produces no health conclusion. Present these checks as "not verified", never as passing. |
| `error` (stderr) | On invalid request input (exit 2) or an internal error (exit 1), a redacted `{ "error": { "category", "message" } }` object. Surface the category; do not fabricate detail. |

When summarizing for the customer: lead with proven findings and their
remediation, clearly separate what was **not** verified, state whether the
result is AWS-only, and never upgrade an `UNKNOWN`/unverified result into a
healthy claim.
