#!/usr/bin/env node
// Generated from reviewed TypeScript source. Human-readable, non-minified, read-only collector.
// Source modules are identified by dist/... section comments in this file.
// This self-contained artifact requires no package-manager install or source-repository access.

// dist/cli/main.js
import { pathToFileURL } from "node:url";

// dist/redaction/boundary.js
function readErrorLike(err) {
  if (typeof err !== "object" || err === null) {
    return { message: typeof err === "string" ? err : void 0 };
  }
  const readString = (key) => {
    try {
      const value = Reflect.get(err, key);
      return typeof value === "string" ? value : void 0;
    } catch {
      return void 0;
    }
  };
  let statusCode;
  try {
    const value = Reflect.get(err, "statusCode");
    statusCode = typeof value === "number" ? value : void 0;
  } catch {
    statusCode = void 0;
  }
  return {
    name: readString("name"),
    code: readString("code"),
    message: readString("message"),
    statusCode
  };
}
function sanitizeError(err) {
  const e = readErrorLike(err);
  const raw = [e.name, e.code, e.message].filter(Boolean).join(": ");
  return { category: categorize(e, raw) };
}
function categorize(e, raw) {
  const code = (e.code ?? e.name ?? "").toLowerCase();
  const msg = raw.toLowerCase();
  if (code === "unsupported_scope")
    return "UNSUPPORTED_SCOPE";
  if (code.includes("econnrefused") || code.includes("enotfound") || code.includes("econnreset")) {
    return "NETWORK";
  }
  if (code.includes("timeout") || code.includes("timedout") || code.includes("abort")) {
    return "TIMEOUT";
  }
  if (code.includes("credentialunavailable"))
    return "CLI_NOT_LOGGED_IN";
  if (code.includes("enoent"))
    return "CLI_NOT_INSTALLED";
  if (code.includes("syntaxerror"))
    return "MALFORMED_RESPONSE";
  if (code.includes("invalidauthenticationtokentenant") || msg.includes("aadsts50020") || msg.includes("does not exist in tenant")) {
    return "WRONG_TENANT";
  }
  if (code.includes("accessdenied") || code.includes("forbidden") || e.statusCode === 403 || msg.includes("authorizationfailed") || msg.includes("accessdenied") || msg.includes("access denied") || msg.includes("not authorized") || msg.includes("forbidden")) {
    return "ACCESS_DENIED";
  }
  if (code.includes("throttl") || code.includes("toomanyrequests") || e.statusCode === 429 || msg.includes("throttlingexception") || msg.includes("toomanyrequests") || msg.includes("too many requests") || msg.includes("status code 429")) {
    return "THROTTLED";
  }
  if (msg.includes("getaddrinfo"))
    return "NETWORK";
  if (code.includes("notfound") || e.statusCode === 404 || msg.includes("resourcenotfound") || msg.includes("resource not found")) {
    return "NOT_FOUND";
  }
  if (msg.includes("az login") || msg.includes("please run 'az login'")) {
    return "CLI_NOT_LOGGED_IN";
  }
  if (msg.includes("command not found"))
    return "CLI_NOT_INSTALLED";
  if (msg.includes("unexpected token"))
    return "MALFORMED_RESPONSE";
  return "UNCATEGORIZED";
}

// dist/collectors/aws/cli-port.js
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// dist/collectors/azure/bounds.js
var AZURE_COLLECTOR_BOUNDS = {
  /** Maximum explicit subscription UUIDs collected within the workflow deadline. */
  maxSubscriptionIds: 10
};

// dist/collectors/process/json-cli-runner.js
import { execFile } from "node:child_process";
var DEFAULT_TIMEOUT_MS = 3e4;
var DEFAULT_MAX_BUFFER_BYTES = 8 * 1024 * 1024;
function isNativeTimeout(err, signal) {
  if (signal?.aborted || typeof err !== "object" || err === null)
    return false;
  try {
    if (Reflect.get(err, "code") === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER")
      return false;
    return Reflect.get(err, "killed") === true && Reflect.get(err, "signal") === "SIGTERM";
  } catch {
    return false;
  }
}
function runClosedJsonProcess(request) {
  return new Promise((resolve, reject) => {
    execFile(request.executable, [...request.args], {
      timeout: request.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      signal: request.signal,
      maxBuffer: request.maxBufferBytes ?? DEFAULT_MAX_BUFFER_BYTES,
      env: request.env
    }, (err, stdout) => {
      if (err) {
        const category = isNativeTimeout(err, request.signal) ? "TIMEOUT" : sanitizeError(err).category;
        reject(request.createError(category));
        return;
      }
      try {
        resolve(stdout.trim() === "" ? null : JSON.parse(stdout));
      } catch {
        reject(request.createError("UNCATEGORIZED"));
      }
    });
  });
}

// dist/collectors/aws/securityhub-cli-model.js
var SECURITY_HUB_CLI_MODEL = {
  version: "2.0",
  metadata: {
    apiVersion: "2018-10-26",
    endpointPrefix: "securityhub",
    jsonVersion: "1.1",
    protocol: "rest-json",
    protocols: ["rest-json"],
    serviceFullName: "AWS SecurityHub",
    serviceId: "SecurityHub",
    signatureVersion: "v4",
    signingName: "securityhub",
    uid: "securityhub-2018-10-26"
  },
  operations: {
    GetConnectorV2: {
      name: "GetConnectorV2",
      http: { method: "GET", requestUri: "/connectorsv2/{ConnectorId+}" },
      input: { shape: "GetConnectorV2Request" },
      output: { shape: "GetConnectorV2Response" }
    },
    ListConnectorsV2: {
      name: "ListConnectorsV2",
      http: { method: "GET", requestUri: "/connectorsv2" },
      input: { shape: "ListConnectorsV2Request" },
      output: { shape: "ListConnectorsV2Response" }
    }
  },
  shapes: {
    AzureDetail: {
      type: "structure",
      required: ["AWSConfigConnectorArn", "ScopeConfiguration", "AzureRegions"],
      members: {
        AWSConfigConnectorArn: { shape: "NonEmptyString" },
        ScopeConfiguration: { shape: "AzureScopeConfiguration" },
        AzureRegions: { shape: "NonEmptyStringList" }
      }
    },
    AzureScopeConfiguration: {
      type: "structure",
      required: ["ScopeType"],
      members: {
        ScopeType: { shape: "AzureScopeType" },
        ScopeValues: { shape: "NonEmptyStringList" }
      }
    },
    AzureScopeType: {
      type: "string",
      enum: ["SUBSCRIPTION", "TENANT"]
    },
    ConnectorAuthStatus: { type: "string" },
    ConnectorProviderName: { type: "string" },
    ConnectorStatus: { type: "string" },
    ConnectorSummary: {
      type: "structure",
      required: ["ConnectorId", "Name", "ProviderSummary", "CreatedAt"],
      members: {
        ConnectorArn: { shape: "NonEmptyString" },
        ConnectorId: { shape: "NonEmptyString" },
        Name: { shape: "NonEmptyString" },
        Description: { shape: "NonEmptyString" },
        ProviderSummary: { shape: "ProviderSummary" },
        CreatedAt: { shape: "Timestamp" }
      }
    },
    ConnectorSummaryList: {
      type: "list",
      member: { shape: "ConnectorSummary" }
    },
    GetConnectorV2Request: {
      type: "structure",
      required: ["ConnectorId"],
      members: {
        ConnectorId: {
          shape: "NonEmptyString",
          location: "uri",
          locationName: "ConnectorId"
        }
      }
    },
    GetConnectorV2Response: {
      type: "structure",
      required: [
        "ConnectorId",
        "Name",
        "CreatedAt",
        "LastUpdatedAt",
        "Health",
        "ProviderDetail"
      ],
      members: {
        ConnectorArn: { shape: "NonEmptyString" },
        ConnectorId: { shape: "NonEmptyString" },
        Name: { shape: "NonEmptyString" },
        Description: { shape: "NonEmptyString" },
        KmsKeyArn: { shape: "NonEmptyString" },
        CreatedAt: { shape: "Timestamp" },
        LastUpdatedAt: { shape: "Timestamp" },
        Health: { shape: "HealthCheck" },
        ProviderDetail: { shape: "ProviderDetail" }
      }
    },
    HealthCheck: {
      type: "structure",
      required: ["ConnectorStatus", "LastCheckedAt"],
      members: {
        ConnectorStatus: { shape: "ConnectorStatus" },
        Message: { shape: "NonEmptyString" },
        LastCheckedAt: { shape: "Timestamp" }
      }
    },
    JiraCloudDetail: {
      type: "structure",
      members: {
        CloudId: { shape: "NonEmptyString" },
        Domain: { shape: "NonEmptyString" },
        ProjectKey: { shape: "NonEmptyString" },
        AuthUrl: { shape: "NonEmptyString" },
        AuthStatus: { shape: "ConnectorAuthStatus" }
      }
    },
    ListConnectorsV2Request: {
      type: "structure",
      members: {
        ConnectorStatus: {
          shape: "ConnectorStatus",
          location: "querystring",
          locationName: "ConnectorStatus"
        },
        MaxResults: {
          shape: "MaxResults",
          location: "querystring",
          locationName: "MaxResults"
        },
        NextToken: {
          shape: "NextToken",
          location: "querystring",
          locationName: "NextToken"
        },
        ProviderName: {
          shape: "ConnectorProviderName",
          location: "querystring",
          locationName: "ProviderName"
        }
      }
    },
    ListConnectorsV2Response: {
      type: "structure",
      required: ["Connectors"],
      members: {
        Connectors: { shape: "ConnectorSummaryList" },
        NextToken: { shape: "NextToken" }
      }
    },
    MaxResults: { type: "integer", min: 1, max: 100 },
    NextToken: { type: "string" },
    NonEmptyString: { type: "string", pattern: ".*\\S.*" },
    NonEmptyStringList: {
      type: "list",
      member: { shape: "NonEmptyString" }
    },
    ProviderDetail: {
      type: "structure",
      union: true,
      members: {
        JiraCloud: { shape: "JiraCloudDetail" },
        ServiceNow: { shape: "ServiceNowDetail" },
        Azure: { shape: "AzureDetail" }
      }
    },
    ProviderSummary: {
      type: "structure",
      members: {
        ProviderName: { shape: "ConnectorProviderName" },
        ConnectorStatus: { shape: "ConnectorStatus" }
      }
    },
    ServiceNowDetail: {
      type: "structure",
      required: ["SecretArn", "AuthStatus"],
      members: {
        InstanceName: { shape: "NonEmptyString" },
        SecretArn: { shape: "NonEmptyString" },
        AuthStatus: { shape: "ConnectorAuthStatus" }
      }
    },
    Timestamp: { type: "timestamp", timestampFormat: "iso8601" }
  }
};
var SECURITY_HUB_CLI_MODEL_JSON = JSON.stringify(SECURITY_HUB_CLI_MODEL);

// dist/collectors/aws/cli-port.js
var AWS_ACCOUNT_ID = /^\d{12}$/;
var AZURE_SUBSCRIPTION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
var CONNECTOR_ARN = /^arn:[^:]+:securityhub:([^:]+):(\d{12}):connectorv2\/([^/]+)$/;
var AZURE_CONFIG_CONNECTOR_ARN = /^arn:[^:]+:config:([^:]+):(\d{12}):connector\/azure\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/[^/]+$/i;
var AwsCliError = class extends Error {
  category;
  constructor(category) {
    super(`aws invocation failed: ${category}`);
    this.name = "AwsCliError";
    this.category = category;
  }
};
var ConnectorScopeError = class extends Error {
  code;
  constructor(message, code) {
    super(message);
    this.name = "ConnectorScopeError";
    this.code = code;
  }
};
var COMMAND_OPTIONS = {
  "list-connectors-v2": /* @__PURE__ */ new Set(["--region", "--max-results", "--next-token", "--output"]),
  "get-connector-v2": /* @__PURE__ */ new Set(["--region", "--connector-id", "--output"])
};
var COMMAND_REQUIRED_OPTIONS = {
  "list-connectors-v2": /* @__PURE__ */ new Set(["--region", "--output"]),
  "get-connector-v2": /* @__PURE__ */ new Set(["--region", "--connector-id", "--output"])
};
var AWS_CLI_ENV_KEYS = [
  "PATH",
  "HOME",
  "TMPDIR",
  "LANG",
  "LC_ALL",
  "SSL_CERT_FILE",
  "HTTP_PROXY",
  "HTTPS_PROXY",
  "NO_PROXY",
  "http_proxy",
  "https_proxy",
  "no_proxy",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_SESSION_TOKEN",
  "AWS_SECURITY_TOKEN",
  "AWS_PROFILE",
  "AWS_DEFAULT_PROFILE",
  "AWS_SHARED_CREDENTIALS_FILE",
  "AWS_CONFIG_FILE",
  "AWS_WEB_IDENTITY_TOKEN_FILE",
  "AWS_ROLE_ARN",
  "AWS_ROLE_SESSION_NAME",
  "AWS_CONTAINER_CREDENTIALS_RELATIVE_URI",
  "AWS_CONTAINER_CREDENTIALS_FULL_URI",
  "AWS_CONTAINER_AUTHORIZATION_TOKEN",
  "AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE",
  "AWS_EC2_METADATA_DISABLED",
  "AWS_EC2_METADATA_SERVICE_ENDPOINT",
  "AWS_EC2_METADATA_SERVICE_ENDPOINT_MODE",
  "AWS_SDK_LOAD_CONFIG",
  "AWS_REGION",
  "AWS_DEFAULT_REGION",
  "AWS_CA_BUNDLE",
  "AWS_STS_REGIONAL_ENDPOINTS",
  "AWS_USE_FIPS_ENDPOINT",
  "AWS_USE_DUALSTACK_ENDPOINT",
  "AWS_RETRY_MODE",
  "AWS_MAX_ATTEMPTS",
  "AWS_CLI_FILE_ENCODING",
  "AWS_PAGER"
];
function isAllowlisted(args) {
  if (args[0] !== "securityhub")
    return false;
  const operation = args[1];
  if (operation === void 0 || !Object.prototype.hasOwnProperty.call(COMMAND_OPTIONS, operation) || !Object.prototype.hasOwnProperty.call(COMMAND_REQUIRED_OPTIONS, operation)) {
    return false;
  }
  const allowedOptions = COMMAND_OPTIONS[operation];
  const requiredOptions = COMMAND_REQUIRED_OPTIONS[operation];
  if (allowedOptions === void 0 || requiredOptions === void 0 || args.length < 6 || args.length % 2 !== 0) {
    return false;
  }
  const seen = /* @__PURE__ */ new Set();
  for (let index = 2; index < args.length; index += 2) {
    const option = args[index];
    const value = args[index + 1];
    if (option === void 0 || value === void 0 || !allowedOptions.has(option) || seen.has(option) || value.length === 0 || value.startsWith("--")) {
      return false;
    }
    seen.add(option);
  }
  return [...requiredOptions].every((option) => seen.has(option)) && args[args.indexOf("--output") + 1] === "json";
}
function awsCliEnvironment(modelRoot) {
  const env = {};
  for (const key of AWS_CLI_ENV_KEYS) {
    const value = process.env[key];
    if (value !== void 0)
      env[key] = value;
  }
  env["AWS_DATA_PATH"] = modelRoot;
  return env;
}
async function runWithConnectorModel(args, signal) {
  let modelRoot;
  try {
    modelRoot = mkdtempSync(join(tmpdir(), "securityhub-connector-diagnostics-"));
    chmodSync(modelRoot, 448);
    const { endpointPrefix, apiVersion } = SECURITY_HUB_CLI_MODEL.metadata;
    const modelDirectory = join(modelRoot, endpointPrefix, apiVersion);
    mkdirSync(modelDirectory, { recursive: true, mode: 448 });
    writeFileSync(join(modelDirectory, "service-2.json"), SECURITY_HUB_CLI_MODEL_JSON, { encoding: "utf8", mode: 384, flag: "wx" });
    return await runClosedJsonProcess({
      executable: "aws",
      args,
      signal,
      env: awsCliEnvironment(modelRoot),
      createError: (category) => new AwsCliError(category)
    });
  } catch (error) {
    if (error instanceof AwsCliError)
      throw error;
    throw new AwsCliError("UNCATEGORIZED");
  } finally {
    if (modelRoot !== void 0) {
      try {
        rmSync(modelRoot, { recursive: true, force: true });
      } catch {
      }
    }
  }
}
function createAwsCliRunner() {
  return {
    runJson(args, signal) {
      if (!isAllowlisted(args)) {
        throw new ConnectorScopeError("AWS CLI command is not on the read-only allowlist.");
      }
      return runWithConnectorModel(args, signal);
    }
  };
}
function stringValue(value) {
  return typeof value === "string" && value.length > 0 ? value : void 0;
}
function isoValue(value) {
  const text = stringValue(value);
  if (text === void 0 || Number.isNaN(Date.parse(text)))
    return void 0;
  return new Date(text).toISOString();
}
function assertExpectedScope(connectorArn, connectorId, expected) {
  const match = connectorArn?.match(CONNECTOR_ARN);
  if (!match) {
    throw new ConnectorScopeError("The connector response did not contain a canonical Security Hub connector ARN, so its AWS scope could not be verified.");
  }
  const [, region, accountId, arnConnectorId] = match;
  if (region !== expected.awsRegion || accountId !== expected.awsAccountId || arnConnectorId !== connectorId) {
    throw new ConnectorScopeError("The requested AWS scope does not match the connector response scope.");
  }
}
function responseRecord(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new AwsCliError("UNCATEGORIZED");
  }
  return value;
}
function decodeConnectorList(value) {
  const raw = responseRecord(value);
  if (!Array.isArray(raw["Connectors"]))
    throw new AwsCliError("UNCATEGORIZED");
  const connectors = raw["Connectors"].map((candidate) => {
    const summary = responseRecord(candidate);
    const connectorId = stringValue(summary["ConnectorId"]);
    const rawName = summary["Name"];
    const name = rawName === void 0 || rawName === "" ? void 0 : stringValue(rawName);
    if (connectorId === void 0 || rawName !== void 0 && rawName !== "" && name === void 0) {
      throw new AwsCliError("UNCATEGORIZED");
    }
    return { connectorId, name };
  });
  const nextToken = raw["NextToken"] === void 0 ? void 0 : stringValue(raw["NextToken"]);
  if (raw["NextToken"] !== void 0 && nextToken === void 0) {
    throw new AwsCliError("UNCATEGORIZED");
  }
  return { connectors, nextToken };
}
function normalizeSubscriptionIds(value) {
  if (!Array.isArray(value) || value.some((candidate) => typeof candidate !== "string")) {
    throw new ConnectorScopeError("The connector contains an invalid Azure subscription id; every subscription id must be a UUID.");
  }
  const ids = value.map((candidate) => candidate.trim().toLowerCase());
  if (ids.length === 0) {
    throw new ConnectorScopeError("Tenant-wide Azure connector diagnosis is not supported; configure an explicit subscription scope.", "UNSUPPORTED_SCOPE");
  }
  if (ids.some((candidate) => !AZURE_SUBSCRIPTION_ID.test(candidate))) {
    throw new ConnectorScopeError("The connector contains an invalid Azure subscription id; every subscription id must be a UUID.");
  }
  const unique = [...new Set(ids)];
  if (unique.length > AZURE_COLLECTOR_BOUNDS.maxSubscriptionIds) {
    throw new ConnectorScopeError(`Azure connector diagnosis supports at most ${AZURE_COLLECTOR_BOUNDS.maxSubscriptionIds} explicit subscriptions per run.`, "UNSUPPORTED_SCOPE");
  }
  return unique;
}
function toProviderView(detail, expected) {
  if (detail.ProviderDetail === void 0 || detail.ProviderDetail === null) {
    const provider = stringValue(detail.CloudProvider);
    return provider === void 0 ? void 0 : { provider: provider.toUpperCase() };
  }
  const providerDetail = responseRecord(detail.ProviderDetail);
  const azure = providerDetail["Azure"];
  if (azure === void 0 || azure === null) {
    const provider = stringValue(detail.CloudProvider) ?? Object.keys(providerDetail).find((key) => providerDetail[key] !== void 0);
    return provider === void 0 ? void 0 : { provider: provider.toUpperCase() };
  }
  const azureDetail = azure;
  const configArn = stringValue(azureDetail.AWSConfigConnectorArn);
  const configMatch = configArn?.match(AZURE_CONFIG_CONNECTOR_ARN);
  if (configMatch === void 0 || configMatch === null) {
    throw new ConnectorScopeError("The Azure connector response did not contain a canonical AWS Config connector ARN, so its tenant could not be verified.");
  }
  const [, configRegion, configAccountId] = configMatch;
  if (configRegion !== expected.awsRegion || configAccountId !== expected.awsAccountId) {
    throw new ConnectorScopeError("The requested AWS scope does not match the Azure provider configuration scope.");
  }
  const tenantId = configMatch[3].toLowerCase();
  if (azureDetail.ScopeConfiguration?.ScopeType !== "SUBSCRIPTION") {
    throw new ConnectorScopeError("Tenant-wide Azure connector diagnosis is not supported; configure an explicit subscription scope.", "UNSUPPORTED_SCOPE");
  }
  return {
    provider: "AZURE",
    tenantId,
    subscriptionIds: normalizeSubscriptionIds(azureDetail.ScopeConfiguration.ScopeValues)
  };
}
function createAwsCliSecurityHubReadPort(runner, expected) {
  if (!AWS_ACCOUNT_ID.test(expected.awsAccountId)) {
    throw new ConnectorScopeError("AWS account id must contain exactly 12 digits.");
  }
  return {
    async listConnectors({ nextToken, maxResults, signal }) {
      const args = [
        "securityhub",
        "list-connectors-v2",
        "--region",
        expected.awsRegion,
        "--max-results",
        String(maxResults),
        ...nextToken === void 0 ? [] : ["--next-token", nextToken],
        "--output",
        "json"
      ];
      return decodeConnectorList(await runner.runJson(args, signal));
    },
    async getConnector({ connectorId, signal }) {
      const raw = await runner.runJson([
        "securityhub",
        "get-connector-v2",
        "--region",
        expected.awsRegion,
        "--connector-id",
        connectorId,
        "--output",
        "json"
      ], signal);
      if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
        throw new AwsCliError("UNCATEGORIZED");
      }
      const returnedConnectorId = stringValue(raw.ConnectorId);
      if (returnedConnectorId === void 0 || returnedConnectorId !== connectorId) {
        throw new ConnectorScopeError("The connector response identity does not match the selected connector.");
      }
      const connectorArn = stringValue(raw.ConnectorArn);
      assertExpectedScope(connectorArn, returnedConnectorId, expected);
      const detail = {
        connectorId: returnedConnectorId,
        connectorArn,
        name: stringValue(raw.Name),
        createdAt: isoValue(raw.CreatedAt),
        lastUpdatedAt: isoValue(raw.LastUpdatedAt),
        health: raw.Health == null ? void 0 : {
          status: stringValue(raw.Health.ConnectorStatus),
          lastCheckedAt: isoValue(raw.Health.LastCheckedAt)
        },
        providerDetail: toProviderView(raw, expected)
      };
      return detail;
    }
  };
}

// dist/workflow/azure-evidence.js
var AZURE_EVIDENCE_DEFINITIONS = {
  "azure.tenant.identity": {
    kind: "azure.tenant.identity",
    provenance: "az account show"
  },
  "azure.entra.application": {
    kind: "azure.entra.application",
    provenance: "az ad app list"
  },
  "azure.rbac.assignments": {
    kind: "azure.rbac.assignments",
    provenance: "az role assignment list"
  },
  "azure.eventhub.resources": {
    kind: "azure.eventhub.resources",
    provenance: "az eventhubs namespace show"
  },
  "azure.subscription.diagnostics": {
    kind: "azure.subscription.diagnostics",
    provenance: "az monitor diagnostic-settings subscription list"
  },
  "azure.defender.export": {
    kind: "azure.defender.export",
    provenance: "az security automation list",
    capability: "threats"
  }
};
function azureEvidenceDefinitions(capabilities2) {
  return Object.values(AZURE_EVIDENCE_DEFINITIONS).filter((definition) => !("capability" in definition) || capabilities2?.[definition.capability] === true);
}

// dist/collectors/azure/cli-port.js
var AzCliError = class extends Error {
  category;
  constructor(category) {
    super(`az invocation failed: ${category}`);
    this.name = "AzCliError";
    this.category = category;
  }
};
var READ_ONLY_ALLOWLIST = [
  { prefix: ["account", "show"], options: {}, required: [] },
  { prefix: ["ad", "app", "list"], options: { "--filter": "value" }, required: ["--filter"] },
  {
    prefix: ["ad", "app", "federated-credential", "list"],
    options: { "--id": "value" },
    required: ["--id"]
  },
  {
    prefix: ["ad", "app", "permission", "list"],
    options: { "--id": "value" },
    required: ["--id"]
  },
  { prefix: ["ad", "sp", "list"], options: { "--filter": "value" }, required: ["--filter"] },
  { prefix: ["ad", "sp", "show"], options: { "--id": "value" }, required: ["--id"] },
  {
    prefix: ["role", "assignment", "list"],
    options: { "--assignee": "value", "--all": "flag" },
    required: ["--assignee", "--all"]
  },
  {
    prefix: ["eventhubs", "namespace", "list"],
    options: { "--subscription": "value" },
    required: ["--subscription"]
  },
  {
    prefix: ["eventhubs", "eventhub", "list"],
    options: {
      "--namespace-name": "value",
      "--resource-group": "value",
      "--subscription": "value"
    },
    required: ["--namespace-name", "--resource-group"]
  },
  {
    prefix: ["eventhubs", "eventhub", "consumer-group", "list"],
    options: {
      "--eventhub-name": "value",
      "--namespace-name": "value",
      "--resource-group": "value",
      "--subscription": "value"
    },
    required: ["--eventhub-name", "--namespace-name", "--resource-group"]
  },
  {
    prefix: ["monitor", "diagnostic-settings", "subscription", "list"],
    options: { "--subscription": "value" },
    required: ["--subscription"]
  },
  {
    prefix: ["security", "automation", "list"],
    options: { "--subscription": "value" },
    required: ["--subscription"]
  }
];
var AZURE_CLI_ENV_KEYS = [
  "PATH",
  "HOME",
  "TMPDIR",
  "LANG",
  "LC_ALL",
  "SSL_CERT_FILE",
  "REQUESTS_CA_BUNDLE",
  "CURL_CA_BUNDLE",
  "HTTP_PROXY",
  "HTTPS_PROXY",
  "NO_PROXY",
  "http_proxy",
  "https_proxy",
  "no_proxy",
  "AZURE_CONFIG_DIR",
  "AZURE_EXTENSION_DIR",
  "AZURE_HTTP_USER_AGENT",
  "AZURE_CORE_OUTPUT",
  "AZURE_CORE_ONLY_SHOW_ERRORS",
  "AZURE_CORE_COLLECT_TELEMETRY",
  "AZURE_CORE_NO_COLOR",
  "AZURE_CORE_DISABLE_CONFIRM_PROMPT",
  "AZURE_AUTHORITY_HOST",
  "AZURE_CLIENT_ID",
  "AZURE_TENANT_ID",
  "AZURE_FEDERATED_TOKEN_FILE",
  "MSI_ENDPOINT",
  "MSI_SECRET",
  "IDENTITY_ENDPOINT",
  "IDENTITY_HEADER",
  "IDENTITY_SERVER_THUMBPRINT",
  "IMDS_ENDPOINT"
];
function azureCliEnvironment() {
  const env = {};
  for (const key of AZURE_CLI_ENV_KEYS) {
    const value = process.env[key];
    if (value !== void 0)
      env[key] = value;
  }
  return env;
}
var GRAPH_APP_ROLE_ASSIGNMENTS_URL = /^https:\/\/graph\.microsoft\.com\/v1\.0\/servicePrincipals\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/appRoleAssignments\?\$select=appRoleId,resourceId$/i;
function matchesReadCommand(args, command) {
  if (command.prefix.length > args.length || !command.prefix.every((part, index) => args[index] === part)) {
    return false;
  }
  const seen = /* @__PURE__ */ new Set();
  for (let index = command.prefix.length; index < args.length; index++) {
    const option = args[index] ?? "";
    const shape = Object.prototype.hasOwnProperty.call(command.options, option) ? command.options[option] : void 0;
    if (shape === void 0 || seen.has(option))
      return false;
    seen.add(option);
    if (shape === "value") {
      const value = args[++index];
      if (value === void 0 || value.trim() === "" || value.startsWith("-"))
        return false;
    }
  }
  return command.required.every((option) => seen.has(option));
}
function isAllowlisted2(args) {
  if (READ_ONLY_ALLOWLIST.some((command) => matchesReadCommand(args, command)))
    return true;
  return args.length === 5 && args[0] === "rest" && args[1] === "--method" && args[2] === "GET" && args[3] === "--url" && GRAPH_APP_ROLE_ASSIGNMENTS_URL.test(args[4] ?? "");
}
function createAzureCliRunner() {
  return {
    runJson(args, signal) {
      if (!isAllowlisted2(args)) {
        throw new Error(`az subcommand not on the read-only allowlist: ${args[0] ?? ""} ${args[1] ?? ""}`);
      }
      return runClosedJsonProcess({
        executable: "az",
        args: [...args, "--output", "json", "--only-show-errors"],
        signal,
        env: azureCliEnvironment(),
        createError: (category) => new AzCliError(category)
      });
    }
  };
}

// dist/collectors/azure/collector.js
var REQUIRED_SP_ROLES = [
  "Reader",
  "Contributor",
  "Azure Event Hubs Data Receiver"
];
var REQUIRED_GRAPH_APP_PERMISSIONS = [
  "Application.Read.All",
  "AuditLog.Read.All",
  "Directory.ReadWrite.All",
  "GroupMember.Read.All",
  "Organization.ReadWrite.All",
  "Policy.Read.All",
  "Policy.Read.ConditionalAccess",
  "Policy.ReadWrite.AuthenticationFlows",
  "Policy.ReadWrite.AuthenticationMethod",
  "Policy.ReadWrite.Authorization",
  "Policy.ReadWrite.ConditionalAccess",
  "Policy.ReadWrite.SecurityDefaults",
  "RoleManagement.Read.Directory",
  "User.ManageIdentities.All",
  "UserAuthenticationMethod.ReadWrite.All"
];
var FEDERATED_CREDENTIAL_CAP = 20;
var DIAGNOSTIC_SETTINGS_CAP = 5;
var now = () => (/* @__PURE__ */ new Date()).toISOString();
function available(kind, provenance, facts) {
  return {
    ref: { kind, status: "AVAILABLE", provenance, collectedTimestamp: now() },
    facts
  };
}
function failed(kind, provenance, err) {
  const category = err instanceof AzCliError ? err.category : "UNCATEGORIZED";
  return {
    ref: {
      kind,
      status: category === "ACCESS_DENIED" ? "DENIED" : "UNAVAILABLE",
      provenance,
      collectedTimestamp: now(),
      errorCategory: category
    },
    facts: void 0
  };
}
function createAzureCliEvidenceSource(runner) {
  return async (context, signal) => {
    const items = [];
    const intendedTenantId = context.tenantId?.toLowerCase() ?? "";
    let activeTenantId;
    try {
      const account = await runner.runJson(["account", "show"], signal);
      activeTenantId = account?.tenantId?.toLowerCase();
      items.push(available("azure.tenant.identity", "az account show", {
        intendedTenantId,
        activeTenantId
      }));
    } catch (err) {
      items.push(failed("azure.tenant.identity", "az account show", err));
      const category = err instanceof AzCliError ? err.category : "UNCATEGORIZED";
      return withheld(items, context, category);
    }
    if (context.tenantId === void 0) {
      return withheld(items, context, "UNCATEGORIZED");
    }
    if (activeTenantId !== intendedTenantId) {
      return withheld(items, context, "WRONG_TENANT");
    }
    const appName = `AWSAuthApp-${context.awsAccountId}`;
    let appId;
    let appResolutionError;
    let spId;
    let spResolutionError;
    try {
      const apps = await runner.runJson(["ad", "app", "list", "--filter", `displayName eq '${appName}'`], signal);
      appId = singleIdentifier(apps, (app) => app.appId);
      if (appId === void 0) {
        items.push(available("azure.entra.application", "az ad app list", {
          applicationFound: false,
          federatedCredentialCount: 0,
          federatedCredentialCap: FEDERATED_CREDENTIAL_CAP,
          federatedSubjectForAccount: false
        }));
      } else {
        const creds = await runner.runJson(["ad", "app", "federated-credential", "list", "--id", appId], signal);
        const subjects = (creds ?? []).map((c) => c.subject ?? "");
        const graphProbe = await probeGraphPermissions(runner, appId, signal);
        spId = graphProbe.spId;
        spResolutionError = graphProbe.spResolutionError;
        items.push(available("azure.entra.application", "az ad app list", {
          applicationFound: true,
          federatedCredentialCount: subjects.length,
          federatedCredentialCap: FEDERATED_CREDENTIAL_CAP,
          federatedSubjectForAccount: subjects.some((s) => s.includes(`:${context.awsAccountId}:`)),
          ...graphProbe.missingGraphPermissions === void 0 ? {} : { missingGraphPermissions: graphProbe.missingGraphPermissions }
        }));
      }
    } catch (err) {
      appResolutionError = err;
      items.push(failed("azure.entra.application", "az ad app list", err));
    }
    try {
      if (appId === void 0 || spId === void 0) {
        if (appResolutionError !== void 0)
          throw appResolutionError;
        if (spResolutionError !== void 0)
          throw spResolutionError;
        items.push(available("azure.rbac.assignments", "az role assignment list", {
          servicePrincipalFound: false,
          missingRoles: [...REQUIRED_SP_ROLES]
        }));
      } else {
        const assignments = await runner.runJson(["role", "assignment", "list", "--assignee", spId, "--all"], signal);
        const have = new Set((assignments ?? []).map((a) => a.roleDefinitionName ?? ""));
        items.push(available("azure.rbac.assignments", "az role assignment list", {
          servicePrincipalFound: true,
          missingRoles: REQUIRED_SP_ROLES.filter((r) => !have.has(r))
        }));
      }
    } catch (err) {
      items.push(failed("azure.rbac.assignments", "az role assignment list", err));
    }
    const eventHub = await collectEventHub(runner, context, signal);
    items.push(eventHub.item);
    items.push(await collectSubscriptionDiagnostics(runner, context, eventHub.targets.activityLog.hub, eventHub.namespace, eventHub.item.ref.errorCategory, eventHub.prefetchedDiagnosticSettings, signal));
    if (context.capabilities?.threats === true) {
      items.push(await collectDefenderExport(runner, context, eventHub.targets.defenderAlerts?.hub ?? DEFENDER_ALERTS_HUB, eventHub.namespace, eventHub.item.ref.errorCategory, signal));
    }
    return items;
  };
}
function withheld(items, context, category) {
  const ts = now();
  for (const { kind, provenance } of azureEvidenceDefinitions(context.capabilities)) {
    if (kind === "azure.tenant.identity")
      continue;
    items.push({
      ref: { kind, status: "UNAVAILABLE", provenance, collectedTimestamp: ts, errorCategory: category },
      facts: void 0
    });
  }
  return items;
}
var MICROSOFT_GRAPH_APP_ID = "00000003-0000-0000-c000-000000000000";
function singleIdentifier(rows, identifierOf) {
  if ((rows?.length ?? 0) === 0)
    return void 0;
  if (rows?.length !== 1)
    throw new AzCliError("UNCATEGORIZED");
  const identifier = identifierOf(rows[0]);
  if (identifier === void 0 || identifier.trim() === "") {
    throw new AzCliError("UNCATEGORIZED");
  }
  return identifier;
}
async function probeGraphPermissions(runner, appId, signal) {
  let spId;
  try {
    const sps = await runner.runJson(["ad", "sp", "list", "--filter", `appId eq '${appId}'`], signal);
    spId = singleIdentifier(sps, (sp) => sp.id);
  } catch (spResolutionError) {
    return { spResolutionError };
  }
  if (spId === void 0)
    return {};
  try {
    const perms = await runner.runJson(["ad", "app", "permission", "list", "--id", appId], signal);
    const graphSp = await runner.runJson(["ad", "sp", "show", "--id", MICROSOFT_GRAPH_APP_ID], signal);
    if (graphSp?.id === void 0)
      return { spId };
    const consent = await runner.runJson([
      "rest",
      "--method",
      "GET",
      "--url",
      `https://graph.microsoft.com/v1.0/servicePrincipals/${spId}/appRoleAssignments?$select=appRoleId,resourceId`
    ], signal);
    const declaredIds = new Set((perms ?? []).filter((entry) => entry.resourceAppId === MICROSOFT_GRAPH_APP_ID).flatMap((entry) => entry.resourceAccess ?? []).filter((access) => access.type === "Role" && access.id !== void 0).map((access) => access.id));
    const consentedIds = new Set((consent?.value ?? []).filter((assignment) => assignment.resourceId === graphSp.id).flatMap((assignment) => assignment.appRoleId === void 0 ? [] : [assignment.appRoleId]));
    const graphRolesByName = new Map((graphSp.appRoles ?? []).filter((role) => role.id !== void 0 && role.value !== void 0 && role.isEnabled !== false).map((role) => [role.value, role.id]));
    if (REQUIRED_GRAPH_APP_PERMISSIONS.some((name) => !graphRolesByName.has(name))) {
      return { spId };
    }
    return {
      spId,
      missingGraphPermissions: REQUIRED_GRAPH_APP_PERMISSIONS.filter((name) => {
        const roleId = graphRolesByName.get(name);
        return !declaredIds.has(roleId) || !consentedIds.has(roleId);
      })
    };
  } catch {
    return { spId };
  }
}
var ACTIVITY_LOG_HUB = "activitylog";
var DEFENDER_ALERTS_HUB = "defender-alerts";
var AWS_CONFIG_CONSUMER_GROUP = "AWSConfig";
var AWS_SECURITY_HUB_CONSUMER_GROUP = "AWSSecurityHub";
var EVENT_HUB_NAME_MAX_LENGTH = 256;
var CONSUMER_GROUP_NAME_MAX_LENGTH = 50;
async function selectSharedEventHubNamespace(runner, context, subscriptionIds, namespaces, prefetchedDiagnosticSettings, signal) {
  const [configSpec, securityHubSpec] = discoveryTagSpecs(context);
  if (namespaces.length === 0)
    return { type: "ABSENT" };
  const configMatches = namespaces.filter((namespace) => parseDiscoveryTag(namespace.tags?.[configSpec.key], configSpec) !== void 0);
  const securityHubMatches = securityHubSpec === void 0 ? [] : namespaces.filter((namespace) => parseDiscoveryTag(namespace.tags?.[securityHubSpec.key], securityHubSpec) !== void 0);
  const canonicalMatches = namespaces.filter((namespace) => namesEqual(namespace.name, `aws-eh-${context.awsAccountId}`));
  const signalSets = [configMatches, securityHubMatches, canonicalMatches].filter((matches) => matches.length > 0);
  const [firstSignal, ...remainingSignals] = signalSets;
  const consensusMatches = firstSignal === void 0 ? [] : remainingSignals.reduce((candidates, matches) => candidates.filter((candidate) => matches.includes(candidate)), firstSignal);
  const securityHubOnlyMatch = signalSets.length === 1 && securityHubMatches.length === 1;
  if (consensusMatches.length === 1 && (signalSets.length > 1 || securityHubOnlyMatch || namespaces.length === 1)) {
    return { type: "RESOLVED", namespace: consensusMatches[0] };
  }
  const activityLogMatches = /* @__PURE__ */ new Set();
  for (const subscriptionId of subscriptionIds) {
    const settings = await runner.runJson(["monitor", "diagnostic-settings", "subscription", "list", "--subscription", subscriptionId], signal);
    prefetchedDiagnosticSettings.set(subscriptionId, settings);
    for (const setting of settings?.value ?? []) {
      for (const namespace of namespaces) {
        const target = resolveDiscoveryTarget(configSpec, namespace.tags);
        if (namesEqual(setting.eventHubName, target.hub) && targetsNamespace(setting.eventHubAuthorizationRuleId, namespace)) {
          activityLogMatches.add(namespace);
        }
      }
    }
  }
  if (activityLogMatches.size === 1) {
    return { type: "RESOLVED", namespace: [...activityLogMatches][0] };
  }
  return signalSets.length > 0 || activityLogMatches.size > 1 ? { type: "AMBIGUOUS" } : { type: "ABSENT" };
}
async function collectEventHub(runner, context, signal) {
  const provenance = "az eventhubs namespace show";
  const subscriptionIds = context.subscriptionIds;
  const prefetchedDiagnosticSettings = /* @__PURE__ */ new Map();
  if (subscriptionIds.length === 0) {
    return {
      item: failed("azure.eventhub.resources", provenance, new AzCliError("UNCATEGORIZED")),
      targets: configuredDiscoveryTargets(context)
    };
  }
  let resolution;
  try {
    const namespaces = [];
    for (const subscriptionId of subscriptionIds) {
      const args = ["eventhubs", "namespace", "list", "--subscription", subscriptionId];
      const scoped = await runner.runJson(args, signal);
      namespaces.push(...(scoped ?? []).map((namespace) => ({ ...namespace, subscriptionId })));
    }
    resolution = await selectSharedEventHubNamespace(runner, context, subscriptionIds, namespaces, prefetchedDiagnosticSettings, signal);
  } catch (err) {
    return {
      item: failed("azure.eventhub.resources", provenance, err),
      targets: configuredDiscoveryTargets(context)
    };
  }
  if (resolution.type === "AMBIGUOUS") {
    return {
      item: failed("azure.eventhub.resources", provenance, new AzCliError("UNCATEGORIZED")),
      targets: configuredDiscoveryTargets(context)
    };
  }
  const target = resolution.type === "RESOLVED" ? resolution.namespace : void 0;
  if (target?.name === void 0 || target.resourceGroup === void 0 || target.subscriptionId === void 0) {
    const targets2 = configuredDiscoveryTargets(context);
    const expectedTargets = uniqueConsumerGroups(targets2);
    return {
      item: available("azure.eventhub.resources", provenance, {
        expectedNamespaceCount: 1,
        discoveredNamespaceCount: 0,
        missingHubs: expectedHubs(expectedTargets),
        missingConsumerGroups: expectedTargets.map(formatConsumerGroup),
        missingDiscoveryTags: missingDiscoveryTags(context)
      }),
      targets: targets2
    };
  }
  const targets = configuredDiscoveryTargets(context, target.tags);
  const resolvedNamespace = {
    name: target.name,
    resourceGroup: target.resourceGroup,
    subscriptionId: target.subscriptionId
  };
  try {
    const hubs = await runner.runJson([
      "eventhubs",
      "eventhub",
      "list",
      "--namespace-name",
      resolvedNamespace.name,
      "--resource-group",
      resolvedNamespace.resourceGroup,
      "--subscription",
      resolvedNamespace.subscriptionId
    ], signal);
    const hubNames = new Set((hubs ?? []).map((h) => (h.name ?? "").toLowerCase()));
    const expectedTargets = uniqueConsumerGroups(targets);
    const missingHubs = expectedHubs(expectedTargets).filter((hub) => !hubNames.has(hub.toLowerCase()));
    const missingConsumerGroups = [];
    for (const required of expectedTargets) {
      if (!hubNames.has(required.hub.toLowerCase())) {
        missingConsumerGroups.push(formatConsumerGroup(required));
        continue;
      }
      const groups = await runner.runJson([
        "eventhubs",
        "eventhub",
        "consumer-group",
        "list",
        "--eventhub-name",
        required.hub,
        "--namespace-name",
        resolvedNamespace.name,
        "--resource-group",
        resolvedNamespace.resourceGroup,
        "--subscription",
        resolvedNamespace.subscriptionId
      ], signal);
      if (!(groups ?? []).some((group) => namesEqual(group.name, required.consumerGroup))) {
        missingConsumerGroups.push(formatConsumerGroup(required));
      }
    }
    return {
      item: available("azure.eventhub.resources", provenance, {
        expectedNamespaceCount: 1,
        discoveredNamespaceCount: 1,
        missingHubs,
        missingConsumerGroups,
        missingDiscoveryTags: missingDiscoveryTags(context, target.tags)
      }),
      targets,
      namespace: resolvedNamespace,
      prefetchedDiagnosticSettings
    };
  } catch (err) {
    return {
      item: failed("azure.eventhub.resources", provenance, err),
      targets,
      namespace: resolvedNamespace,
      prefetchedDiagnosticSettings
    };
  }
}
function discoveryTagSpecs(context) {
  const specs = [
    {
      key: `AWSConfig-${context.awsAccountId}-${context.awsRegion}`,
      defaultHub: ACTIVITY_LOG_HUB,
      defaultConsumerGroup: AWS_CONFIG_CONSUMER_GROUP,
      allowExtendedTarget: true
    }
  ];
  if (context.capabilities?.threats === true) {
    specs.push({
      key: `AWSSecurityHub-${context.awsAccountId}-${context.awsRegion}`,
      defaultHub: DEFENDER_ALERTS_HUB,
      defaultConsumerGroup: AWS_SECURITY_HUB_CONSUMER_GROUP,
      allowExtendedTarget: false
    });
  }
  return specs;
}
function configuredDiscoveryTargets(context, tags) {
  const [activityLogSpec, defenderAlertsSpec] = discoveryTagSpecs(context);
  const activityLog = resolveDiscoveryTarget(activityLogSpec, tags);
  return {
    activityLog,
    ...defenderAlertsSpec === void 0 ? {} : { defenderAlerts: resolveDiscoveryTarget(defenderAlertsSpec, tags) }
  };
}
function resolveDiscoveryTarget(spec, tags) {
  return parseDiscoveryTag(tags?.[spec.key], spec) ?? {
    hub: spec.defaultHub,
    consumerGroup: spec.defaultConsumerGroup
  };
}
function parseDiscoveryTag(value, spec) {
  if (!spec.allowExtendedTarget) {
    return namesEqual(value, spec.defaultHub) ? { hub: spec.defaultHub, consumerGroup: spec.defaultConsumerGroup } : void 0;
  }
  return parseDiscoveryTarget(value, spec.defaultHub, spec.defaultConsumerGroup);
}
function uniqueConsumerGroups(targets) {
  const values = [targets.activityLog, targets.defenderAlerts].filter((target) => target !== void 0);
  return [
    ...new Map(values.map((target) => [formatConsumerGroup(target).toLowerCase(), target])).values()
  ];
}
function missingDiscoveryTags(context, tags) {
  return discoveryTagSpecs(context).filter((spec) => parseDiscoveryTag(tags?.[spec.key], spec) === void 0).map((spec) => spec.key);
}
function parseDiscoveryTarget(value, defaultHub, defaultConsumerGroup) {
  if (value === void 0)
    return void 0;
  const parts = value.split(":");
  if (parts.length > 2)
    return void 0;
  const [hub = defaultHub, consumerGroup = defaultConsumerGroup] = parts;
  if (!isValidDiscoveryName(hub, EVENT_HUB_NAME_MAX_LENGTH) || !isValidDiscoveryName(consumerGroup, CONSUMER_GROUP_NAME_MAX_LENGTH)) {
    return void 0;
  }
  return { hub, consumerGroup };
}
function isValidDiscoveryName(value, maxLength) {
  return value.length > 0 && value.length <= maxLength && value.trim() === value && !value.startsWith("-") && !/[\\/:\u0000-\u001f\u007f]/u.test(value);
}
function expectedHubs(targets) {
  return [...new Set(targets.map((target) => target.hub))];
}
function formatConsumerGroup(required) {
  return `${required.hub}/${required.consumerGroup}`;
}
function namesEqual(actual, expected) {
  return actual?.toLowerCase() === expected.toLowerCase();
}
function targetsNamespace(authorizationRuleId, namespace) {
  if (authorizationRuleId === void 0 || namespace.name === void 0 || namespace.resourceGroup === void 0 || namespace.subscriptionId === void 0) {
    return false;
  }
  return authorizationRuleId.toLowerCase().includes(`/subscriptions/${namespace.subscriptionId.toLowerCase()}/resourcegroups/${namespace.resourceGroup.toLowerCase()}/providers/microsoft.eventhub/namespaces/${namespace.name.toLowerCase()}/`);
}
function targetsEventHub(resourceId, namespace, hubName) {
  if (resourceId === void 0)
    return false;
  return resourceId.toLowerCase() === `/subscriptions/${namespace.subscriptionId.toLowerCase()}/resourcegroups/${namespace.resourceGroup.toLowerCase()}/providers/microsoft.eventhub/namespaces/${namespace.name.toLowerCase()}/eventhubs/${hubName.toLowerCase()}`;
}
async function collectSubscriptionDiagnostics(runner, context, activityLogHub, activityLogNamespace, namespaceErrorCategory, prefetchedDiagnosticSettings, signal) {
  const provenance = "az monitor diagnostic-settings subscription list";
  if (activityLogNamespace === void 0) {
    return failed("azure.subscription.diagnostics", provenance, new AzCliError(namespaceErrorCategory ?? "UNCATEGORIZED"));
  }
  if (context.subscriptionIds.length === 0) {
    return failed("azure.subscription.diagnostics", provenance, new AzCliError("UNCATEGORIZED"));
  }
  try {
    const subscriptions = [];
    for (const subscriptionId of context.subscriptionIds) {
      const settings = prefetchedDiagnosticSettings?.has(subscriptionId) ? prefetchedDiagnosticSettings.get(subscriptionId) : await runner.runJson([
        "monitor",
        "diagnostic-settings",
        "subscription",
        "list",
        "--subscription",
        subscriptionId
      ], signal);
      const list = settings?.value ?? [];
      subscriptions.push({
        subscriptionId,
        activityLogExportConfigured: list.some((setting) => namesEqual(setting.eventHubName, activityLogHub) && targetsNamespace(setting.eventHubAuthorizationRuleId, activityLogNamespace)),
        diagnosticSettingsCount: list.length,
        diagnosticSettingsCap: DIAGNOSTIC_SETTINGS_CAP
      });
    }
    return available("azure.subscription.diagnostics", provenance, { subscriptions });
  } catch (err) {
    return failed("azure.subscription.diagnostics", provenance, err);
  }
}
async function collectDefenderExport(runner, context, defenderAlertsHub, defenderAlertsNamespace, namespaceErrorCategory, signal) {
  const provenance = "az security automation list";
  if (defenderAlertsNamespace === void 0) {
    return failed("azure.defender.export", provenance, new AzCliError(namespaceErrorCategory ?? "UNCATEGORIZED"));
  }
  if (context.subscriptionIds.length === 0) {
    return failed("azure.defender.export", provenance, new AzCliError("UNCATEGORIZED"));
  }
  try {
    const automations = [];
    for (const subscriptionId of context.subscriptionIds) {
      const args = ["security", "automation", "list", "--subscription", subscriptionId];
      const scoped = await runner.runJson(args, signal);
      automations.push(...scoped ?? []);
    }
    const expectedName = `securityhub-defender-alerts-export-${context.awsAccountId.slice(-4)}`;
    const matchingAutomations = automations.filter((automation) => namesEqual(automation.name, expectedName));
    return available("azure.defender.export", provenance, {
      automationFound: matchingAutomations.length > 0,
      targetsExpectedHub: matchingAutomations.some((automation) => automation.actions?.some((action) => targetsEventHub(action.eventHubResourceId, defenderAlertsNamespace, defenderAlertsHub)))
    });
  } catch (err) {
    return failed("azure.defender.export", provenance, err);
  }
}

// dist/contract/result.js
var SCHEMA_VERSION = "1.0";
var SEVERITY_RANK = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
  INFO: 4
};
var BREADTH_RANK = {
  CONNECTOR: 0,
  SUBSCRIPTION: 1,
  RESOURCE: 2
};
var STATUS_RANK = {
  // The customer's actual problems lead; unproven states next; passes last.
  FAILED: 0,
  UNKNOWN: 1,
  PENDING: 2,
  PASSED: 3
};
function compareFindings(a, b) {
  const byStatus = STATUS_RANK[a.status] - STATUS_RANK[b.status];
  if (byStatus !== 0)
    return byStatus;
  const bySeverity = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
  if (bySeverity !== 0)
    return bySeverity;
  const byBreadth = BREADTH_RANK[a.affectedScope.breadth] - BREADTH_RANK[b.affectedScope.breadth];
  if (byBreadth !== 0)
    return byBreadth;
  return a.code < b.code ? -1 : a.code > b.code ? 1 : 0;
}
function serializeResult(result) {
  return JSON.stringify(sortKeysDeep(result));
}
function sortKeysDeep(value) {
  if (Array.isArray(value))
    return value.map(sortKeysDeep);
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value).filter(([, v]) => v !== void 0).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
    return Object.fromEntries(entries.map(([k, v]) => [k, sortKeysDeep(v)]));
  }
  return value;
}

// dist/collectors/aws/collector.js
var AWS_COLLECTOR_BOUNDS = {
  /** Max ListConnectorsV2 pages walked during name resolution. */
  maxListPages: 10,
  /** Page size requested from the port. */
  listPageSize: 50,
  /** Per-port-call timeout in milliseconds. */
  callTimeoutMs: 1e4,
  /** Max configured subscription ids carried into evidence. */
  maxSubscriptionIds: 200
};
async function bounded(run) {
  const controller = new AbortController();
  let timer;
  const timeout = new Promise((_resolve, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      const err = new Error("port call timed out");
      err.name = "TimeoutError";
      reject(err);
    }, AWS_COLLECTOR_BOUNDS.callTimeoutMs);
  });
  try {
    return await Promise.race([run(controller.signal), timeout]);
  } finally {
    clearTimeout(timer);
  }
}
async function resolveConnector(port, selector) {
  if (selector.connectorId)
    return { outcome: "RESOLVED", connectorId: selector.connectorId };
  if (!selector.connectorName)
    return { outcome: "INVALID_SELECTOR" };
  const matches = [];
  let nextToken;
  let scanComplete = false;
  try {
    for (let page = 0; page < AWS_COLLECTOR_BOUNDS.maxListPages; page++) {
      const result = await bounded((signal) => port.listConnectors({ nextToken, maxResults: AWS_COLLECTOR_BOUNDS.listPageSize, signal }));
      for (const summary of result.connectors) {
        if (summary.name === selector.connectorName)
          matches.push(summary.connectorId);
        if (matches.length > 1)
          return { outcome: "AMBIGUOUS" };
      }
      nextToken = result.nextToken;
      if (!nextToken) {
        scanComplete = true;
        break;
      }
    }
  } catch (err) {
    return { outcome: "ERROR", errorCategory: sanitizeError(err).category };
  }
  if (!scanComplete)
    return { outcome: "SCAN_TRUNCATED" };
  if (matches.length === 1)
    return { outcome: "RESOLVED", connectorId: matches[0] };
  return matches.length === 0 ? { outcome: "NOT_FOUND" } : { outcome: "AMBIGUOUS" };
}
function toCapabilities(detail) {
  const caps = detail.providerDetail?.capabilities;
  if (caps === void 0)
    return void 0;
  return {
    cspm: caps.cspm === true,
    inspector: caps.inspector === true,
    threats: caps.threats === true
  };
}
function toHealthStatus(status) {
  switch (status) {
    case "CONNECTED":
      return "HEALTHY";
    case "DEGRADED":
    case "FAILED_TO_CONNECT":
      return "UNHEALTHY";
    default:
      return "UNKNOWN";
  }
}
function unavailableEvidence(kind, errorCategory, collectedTimestamp, provenance) {
  return {
    ref: {
      kind,
      status: errorCategory === "ACCESS_DENIED" ? "DENIED" : "UNAVAILABLE",
      provenance,
      collectedTimestamp,
      errorCategory
    },
    // INVARIANT: facts are only read by rules, and the engine refuses to run
    // a rule whose evidence status is DENIED/UNAVAILABLE (RUNNABLE_EVIDENCE
    // gate in engine/evaluate.ts) — so facts are unreachable here. The cast
    // keeps EvidenceItem's facts non-optional for the runnable path, where
    // it matters. Guarded by the 'unavailable evidence facts are never read'
    // test in aws-collector.spec.ts.
    facts: void 0
  };
}
async function collectAwsEvidence(port, selector, clock) {
  const collectedTimestamp = clock.now().toISOString();
  const resolution = await resolveConnector(port, selector);
  if (resolution.outcome !== "RESOLVED") {
    const errorCategory = resolution.outcome === "ERROR" ? resolution.errorCategory ?? "UNCATEGORIZED" : resolution.outcome === "NOT_FOUND" ? "NOT_FOUND" : "UNCATEGORIZED";
    return {
      resolution,
      evidence: [
        unavailableEvidence("aws.connector.config", errorCategory, collectedTimestamp, "ListConnectorsV2"),
        unavailableEvidence("aws.connector.health", errorCategory, collectedTimestamp, "ListConnectorsV2")
      ]
    };
  }
  let detail;
  try {
    detail = await bounded((signal) => port.getConnector({ connectorId: resolution.connectorId, signal }));
  } catch (err) {
    const errorCategory = sanitizeError(err).category;
    return {
      resolution,
      evidence: [
        unavailableEvidence("aws.connector.config", errorCategory, collectedTimestamp, "GetConnectorV2"),
        unavailableEvidence("aws.connector.health", errorCategory, collectedTimestamp, "GetConnectorV2")
      ]
    };
  }
  const connector = {
    connectorId: detail.connectorId,
    connectorArn: detail.connectorArn,
    name: detail.name,
    provider: detail.providerDetail?.provider
  };
  const configEvidence = {
    ref: {
      kind: "aws.connector.config",
      status: "AVAILABLE",
      provenance: "GetConnectorV2",
      sourceTimestamp: detail.lastUpdatedAt,
      collectedTimestamp
    },
    facts: {
      configuredTenantId: detail.providerDetail?.tenantId,
      configuredSubscriptionIds: (detail.providerDetail?.subscriptionIds ?? []).slice(0, AWS_COLLECTOR_BOUNDS.maxSubscriptionIds),
      capabilities: toCapabilities(detail),
      createdAt: detail.createdAt,
      lastUpdatedAt: detail.lastUpdatedAt
    }
  };
  const healthEvidence = {
    ref: {
      kind: "aws.connector.health",
      status: "AVAILABLE",
      provenance: "GetConnectorV2",
      sourceTimestamp: detail.health?.lastCheckedAt,
      collectedTimestamp
    },
    facts: {
      healthStatus: toHealthStatus(detail.health?.status),
      lastCheckedAt: detail.health?.lastCheckedAt
    }
  };
  return {
    resolution,
    connector,
    capabilities: toCapabilities(detail),
    evidence: [configEvidence, healthEvidence]
  };
}

// dist/engine/evidence.js
function evidenceSetOf(items) {
  const byKind = /* @__PURE__ */ new Map();
  for (const item of items)
    byKind.set(item.ref.kind, item);
  return {
    get: (kind) => byKind.get(kind),
    kinds: () => [...byKind.keys()]
  };
}

// dist/engine/evaluate.js
var RUNNABLE_EVIDENCE = /* @__PURE__ */ new Set(["AVAILABLE", "STALE", "PENDING"]);
var NO_CAPABILITIES = {
  cspm: false,
  inspector: false,
  threats: false
};
function evaluate(catalog, input, clock) {
  const evaluatedAt = clock.now().toISOString();
  const findings = [];
  const unverifiedChecks = [];
  for (const rule of catalog.rules) {
    if (!rule.workflows.includes(input.workflow)) {
      unverifiedChecks.push({
        code: rule.code,
        missingEvidence: [],
        reason: "NOT_APPLICABLE"
      });
      continue;
    }
    const connectorProvider = input.connector?.provider;
    if (rule.provider !== void 0 && connectorProvider !== void 0 && rule.provider !== connectorProvider) {
      unverifiedChecks.push({
        code: rule.code,
        missingEvidence: [],
        reason: "PROVIDER_NOT_SUPPORTED"
      });
      continue;
    }
    const capabilities2 = input.evaluatedScope.capabilities;
    if (capabilities2 !== void 0 && !rule.appliesTo(capabilities2)) {
      unverifiedChecks.push({
        code: rule.code,
        missingEvidence: [],
        reason: "NOT_APPLICABLE"
      });
      continue;
    }
    if (capabilities2 === void 0 && !rule.appliesTo(NO_CAPABILITIES)) {
      unverifiedChecks.push({
        code: rule.code,
        missingEvidence: [...rule.requiredEvidence],
        reason: "CAPABILITY_UNKNOWN"
      });
      continue;
    }
    const missing = rule.requiredEvidence.filter((kind) => {
      const item = input.evidence.get(kind);
      return item === void 0 || !RUNNABLE_EVIDENCE.has(item.ref.status);
    });
    if (missing.length > 0) {
      const denied = missing.some((kind) => input.evidence.get(kind)?.ref.status === "DENIED");
      const errorCategories = [
        ...new Set(missing.flatMap((kind) => {
          const category = input.evidence.get(kind)?.ref.errorCategory;
          return category === void 0 ? [] : [category];
        }))
      ];
      unverifiedChecks.push({
        code: rule.code,
        missingEvidence: missing,
        ...errorCategories.length > 0 ? { errorCategories } : {},
        reason: denied ? "EVIDENCE_DENIED" : "EVIDENCE_UNAVAILABLE"
      });
      continue;
    }
    const evaluatedOutcome = rule.evaluate(input.evidence, clock);
    const outcome = normalizePassingOutcome(evaluatedOutcome);
    findings.push({
      code: rule.code,
      ruleVersion: rule.version,
      severity: rule.severity,
      status: outcome.status,
      affectedScope: outcome.affectedScope,
      evidence: outcome.evidence,
      confidence: outcome.confidence,
      remediation: rule.remediation(outcome),
      freshness: { ...outcome.freshness, evaluatedAt }
    });
  }
  findings.sort(compareFindings);
  return {
    schemaVersion: SCHEMA_VERSION,
    catalogVersion: catalog.version,
    workflow: input.workflow,
    connector: input.connector,
    proposed: input.proposed,
    evaluatedScope: input.evaluatedScope,
    overall: overallOf(findings, unverifiedChecks),
    findings,
    unverifiedChecks,
    evaluatedAt
  };
}
function normalizePassingOutcome(outcome) {
  if (outcome.status !== "PASSED")
    return outcome;
  if (outcome.evidence.some((ref) => ref.status === "PENDING")) {
    return { ...outcome, status: "PENDING" };
  }
  if (outcome.evidence.some((ref) => ref.status === "STALE")) {
    return { ...outcome, status: "UNKNOWN" };
  }
  return outcome;
}
function overallOf(findings, unverified) {
  const failed2 = findings.filter((f) => f.status === "FAILED");
  if (failed2.some((f) => f.severity === "CRITICAL" || f.severity === "HIGH")) {
    return "FAILED";
  }
  if (failed2.length > 0)
    return "DEGRADED";
  const blocked = unverified.some((u) => u.reason !== "NOT_APPLICABLE" && u.reason !== "PROVIDER_NOT_SUPPORTED");
  if (blocked)
    return "UNKNOWN";
  if (findings.some((f) => f.status === "UNKNOWN"))
    return "UNKNOWN";
  if (findings.some((f) => f.status === "PENDING"))
    return "PENDING";
  if (findings.length === 0)
    return "UNKNOWN";
  return "HEALTHY";
}

// dist/engine/freshness.js
var EVIDENCE_CATEGORY = {
  "aws.connector.config": "STATIC_CONFIGURATION",
  "azure.entra.application": "STATIC_CONFIGURATION",
  "azure.rbac.assignments": "STATIC_CONFIGURATION",
  "azure.eventhub.resources": "STATIC_CONFIGURATION",
  "azure.tenant.identity": "AUTHENTICATION",
  // These Azure reads inspect current configuration, not observed event delivery.
  // Their collection time proves configuration freshness but cannot prove runtime recovery.
  "azure.subscription.diagnostics": "STATIC_CONFIGURATION",
  "aws.connector.health": "DELIVERY",
  "aws.connector.telemetry": "DELIVERY",
  "azure.defender.export": "STATIC_CONFIGURATION"
};
var FRESHNESS_WINDOWS_MS = {
  /** Roles/apps/hubs drift slowly; a day-old read is still meaningful. */
  STATIC_CONFIGURATION: 24 * 60 * 60 * 1e3,
  /** Login/tenant state must be near-live to reason about auth. */
  AUTHENTICATION: 60 * 60 * 1e3,
  /** Runtime delivery/health signals age fastest. */
  DELIVERY: 30 * 60 * 1e3
};
var POST_CREATION_PENDING_WINDOW_MS = 2 * 60 * 60 * 1e3;
var CLOCK_SKEW_TOLERANCE_MS = 5 * 60 * 1e3;
var RUNTIME_CATEGORIES = /* @__PURE__ */ new Set(["DELIVERY"]);
var RUNTIME_EVIDENCE_KINDS = Object.keys(EVIDENCE_CATEGORY).filter((kind) => RUNTIME_CATEGORIES.has(EVIDENCE_CATEGORY[kind]));
function parseMs(iso) {
  if (!iso)
    return void 0;
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? void 0 : ms;
}
function applyEvidenceFreshness(items, clock) {
  const now2 = clock.now().getTime();
  return items.map((item) => {
    if (item.ref.status !== "AVAILABLE")
      return item;
    const category = EVIDENCE_CATEGORY[item.ref.kind];
    const window = FRESHNESS_WINDOWS_MS[category];
    const collected = parseMs(item.ref.collectedTimestamp);
    const source = parseMs(item.ref.sourceTimestamp);
    const observed = category === "DELIVERY" && collected !== void 0 && source !== void 0 ? Math.min(collected, source) : collected ?? source;
    const trustworthy = observed !== void 0 && observed - now2 <= CLOCK_SKEW_TOLERANCE_MS;
    const fresh = trustworthy && now2 - observed <= window;
    return fresh ? item : { ...item, ref: { ...item.ref, status: "STALE" } };
  });
}
function applyPendingWindow(result, input, clock) {
  const createdMs = parseMs(input.connectorCreatedAt);
  if (createdMs === void 0)
    return result;
  const now2 = clock.now().getTime();
  const windowEndsMs = createdMs + POST_CREATION_PENDING_WINDOW_MS;
  if (now2 < createdMs - CLOCK_SKEW_TOLERANCE_MS || now2 >= windowEndsMs)
    return result;
  const reevaluateAfter = new Date(windowEndsMs).toISOString();
  let suppressed = false;
  const findings = result.findings.map((finding) => {
    if (finding.status !== "FAILED")
      return finding;
    const runtimeBacked = finding.evidence.length > 0 && finding.evidence.every((ref) => RUNTIME_CATEGORIES.has(EVIDENCE_CATEGORY[ref.kind]));
    if (!runtimeBacked)
      return finding;
    suppressed = true;
    return {
      ...finding,
      status: "PENDING",
      freshness: { ...finding.freshness, verdict: "PENDING_WINDOW", reevaluateAfter }
    };
  });
  if (!suppressed)
    return result;
  return { ...result, findings, overall: overallOf(findings, result.unverifiedChecks) };
}
function runtimeRecoveryProven(result) {
  if (result.overall !== "HEALTHY")
    return false;
  const unverifiedRuntime = result.unverifiedChecks.some((check) => check.reason !== "NOT_APPLICABLE" && check.reason !== "PROVIDER_NOT_SUPPORTED" && check.missingEvidence.some((kind) => RUNTIME_CATEGORIES.has(EVIDENCE_CATEGORY[kind])));
  if (unverifiedRuntime)
    return false;
  const runtimeFindings = result.findings.filter((finding) => finding.evidence.some((ref) => RUNTIME_CATEGORIES.has(EVIDENCE_CATEGORY[ref.kind])));
  if (runtimeFindings.length === 0)
    return false;
  return runtimeFindings.every((finding) => finding.status === "PASSED" && finding.freshness.verdict === "FRESH");
}

// dist/catalog/codes.js
var ANY = (_c) => true;
var CSPM = (c) => c.cspm;
var INSPECTOR = (c) => c.inspector;
var THREATS = (c) => c.threats;
var CSPM_OR_INSPECTOR = (c) => c.cspm || c.inspector;
var CATALOG_VERSION = "azure-1.0.0-preview.1";
var FINDING_CODES = [
  {
    code: "AZ_TENANT_MISMATCH",
    severity: "CRITICAL",
    breadth: "CONNECTOR",
    appliesTo: ANY,
    trace: "securityhub-azure-setup.sh Step 1 (login + config block); GetConnectorV2 ProviderDetail",
    remediationSummary: "Sign in to the intended tenant with `az login --tenant <tenant-id>` and confirm the connector configuration targets the same tenant, then re-run the assessment.",
    implemented: true
  },
  {
    code: "AZ_ONBOARDING_CALLER_PERMISSION_MISSING",
    severity: "HIGH",
    breadth: "CONNECTOR",
    appliesTo: ANY,
    trace: "securityhub-azure-setup.sh Step 1 caller-permission preflight (Global Administrator, root role-assignment access, management-group policy access, and Event Hub subscription access)",
    remediationSummary: "Grant the caller permissions reported by the supported onboarding preflight, wait for Azure role propagation, and re-run the readiness assessment before onboarding.",
    implemented: false
  },
  {
    code: "AZ_AUTH_APP_MISSING",
    severity: "CRITICAL",
    breadth: "CONNECTOR",
    appliesTo: ANY,
    trace: "securityhub-azure-setup.sh Steps 2-3 (Entra app AWSAuthApp-<acct> + service principal)",
    remediationSummary: "Re-run the supported Azure onboarding script to recreate the Entra application and service principal.",
    implemented: true
  },
  {
    code: "AZ_FEDERATED_CRED_MISSING",
    severity: "CRITICAL",
    breadth: "CONNECTOR",
    appliesTo: ANY,
    trace: "securityhub-azure-setup.sh Step 3 (federated credential subjects per enabled pipeline)",
    remediationSummary: "Re-run the supported onboarding script so each enabled pipeline\u2019s AWS role subject has a federated credential on the Entra application.",
    implemented: true
  },
  {
    code: "AZ_GRAPH_CONSENT_MISSING",
    severity: "HIGH",
    breadth: "CONNECTOR",
    appliesTo: ANY,
    trace: "securityhub-azure-setup.sh Step 5 (Graph application permissions + admin consent)",
    remediationSummary: "Have a Global Administrator grant admin consent for the required Microsoft Graph application permissions per the onboarding script.",
    implemented: true
  },
  {
    code: "AZ_RBAC_ROLE_MISSING",
    severity: "HIGH",
    breadth: "CONNECTOR",
    appliesTo: ANY,
    trace: "securityhub-azure-setup.sh Step 4 (SP role assignments at management-group scope)",
    remediationSummary: "Re-run the supported Azure onboarding script to ensure the service principal exists and apply these required management-group role assignments: <missingRoles>. Newly created roles can take up to a minute to propagate (Azure RBAC is eventually consistent).",
    implemented: true
  },
  {
    code: "AZ_EVENTHUB_UNREACHABLE",
    severity: "HIGH",
    breadth: "CONNECTOR",
    appliesTo: ANY,
    trace: "securityhub-azure-setup.sh Steps 6 and 8 (capability-specific shared/regional Event Hub targets, consumer groups, and AWSConfig/AWSSecurityHub discovery tags; namespace and app names may be customized or shared)",
    remediationSummary: "Restore the missing capability-specific Event Hub target, consumer group, or discovery tag through the supported onboarding flow. Diagnose targets by connector identity and discovery metadata, not default resource names.",
    implemented: true
  },
  {
    code: "AZ_RECORDING_SUB_MISSING",
    severity: "HIGH",
    breadth: "SUBSCRIPTION",
    appliesTo: CSPM_OR_INSPECTOR,
    trace: "securityhub-azure-setup.sh Step 7 (Activity Log DINE policy at tenant-root MG; Azure caps a subscription at 5 diagnostic settings \u2014 at the cap the remediation silently no-ops)",
    remediationSummary: "Configure the Activity Log export diagnostic setting for the affected subscription. If the subscription already has the maximum number of diagnostic settings, remove one first \u2014 the policy remediation cannot apply at the cap and fails silently.",
    implemented: true
  },
  {
    code: "AZ_ACR_REGION_UNCOVERED",
    severity: "MEDIUM",
    breadth: "SUBSCRIPTION",
    appliesTo: INSPECTOR,
    trace: "securityhub-azure-setup.sh Step 8 (per-region Event Hub + ACR diagnostic-settings assignment)",
    remediationSummary: "Add the missing region to AZURE_LOCATIONS and re-run the onboarding script so a regional Event Hub and ACR diagnostic assignment exist for that region.",
    implemented: false
  },
  {
    code: "AZ_VM_IDENTITY_POLICY_MISSING",
    severity: "MEDIUM",
    breadth: "SUBSCRIPTION",
    appliesTo: INSPECTOR,
    trace: "securityhub-azure-setup.sh Step 9 (VM managed-identity policies: none/user-assigned variants)",
    remediationSummary: "Re-apply the VM managed-identity policy assignments from the onboarding script for the affected scope.",
    implemented: false
  },
  {
    code: "AZ_DEFENDER_EXPORT_BROKEN",
    severity: "HIGH",
    breadth: "SUBSCRIPTION",
    appliesTo: THREATS,
    trace: "securityhub-azure-setup.sh Steps 10-11 (Defender continuous export; requires the hub-scoped SAS Send policy DefenderExportSend \u2014 a namespace-level key does not reliably deliver)",
    remediationSummary: "Recreate the Defender continuous-export automation with the hub-scoped DefenderExportSend SAS policy via the onboarding script.",
    implemented: true
  },
  {
    code: "AZ_EVENT_DELIVERY_STALLED",
    severity: "HIGH",
    breadth: "SUBSCRIPTION",
    appliesTo: ANY,
    trace: "securityhub GetConnectorV2 Health/issues and connector delivery telemetry (continuous event delivery after discovery and recording)",
    remediationSummary: "Restore continuous delivery for the affected subscription. Verify fresh source events, Event Hub ingestion, consumer progress, and connector processing before declaring recovery.",
    implemented: false
  },
  {
    code: "AZ_ENTRA_DIAG_MISSING",
    severity: "MEDIUM",
    breadth: "CONNECTOR",
    appliesTo: CSPM,
    trace: "securityhub-azure-setup.sh Step 12 (Entra ID audit-log diagnostic settings)",
    remediationSummary: "Have a Global Administrator restore the Entra ID audit-log diagnostic setting per the onboarding script.",
    implemented: false
  },
  {
    code: "AWS_CONNECTOR_HEALTH_DEGRADED",
    severity: "MEDIUM",
    breadth: "CONNECTOR",
    appliesTo: ANY,
    trace: "securityhub GetConnectorV2 Health (service-side health check, correlated with Azure-side findings)",
    remediationSummary: "Security Hub reports this connector unhealthy. Review the co-reported findings for the specific misconfiguration; if none are present, sign in to the connector's tenant with Azure CLI and enable direct Azure checks for a root cause.",
    implemented: true
  },
  {
    code: "AWS_CONNECTOR_SCOPE_DRIFT",
    severity: "HIGH",
    breadth: "CONNECTOR",
    appliesTo: ANY,
    trace: "securityhub GetConnectorV2 ProviderDetail vs intended tenant/scope",
    remediationSummary: "The connector\u2019s configured provider scope differs from the intended tenant/scope. Update the connector configuration or the intended scope so they agree.",
    implemented: false
  },
  {
    code: "EVIDENCE_STALE",
    severity: "INFO",
    breadth: "CONNECTOR",
    appliesTo: ANY,
    trace: "Freshness windows (design \xA76; product-approved constants land with the freshness CR)",
    remediationSummary: "Evidence for one or more checks is older than its freshness window. Re-run the assessment after fresh runtime evidence is available.",
    implemented: false
  }
];
function findingCodeSpec(code) {
  const spec = FINDING_CODES.find((s) => s.code === code);
  if (!spec)
    throw new Error(`Unknown finding code: ${code}`);
  return spec;
}

// dist/catalog/rules.js
var RULE_VERSION = "1.0";
function evidenceQuality(status) {
  switch (status) {
    case "STALE":
      return { verdict: "STALE", confidence: "MEDIUM" };
    case "PENDING":
      return { verdict: "PENDING_WINDOW", confidence: "LOW" };
    default:
      return { verdict: "FRESH", confidence: "HIGH" };
  }
}
function capConfidence(ceiling, desired) {
  const rank = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  return rank[desired] > rank[ceiling] ? desired : ceiling;
}
function remediationFor(spec, outcome) {
  switch (outcome.status) {
    case "FAILED":
      return {
        summary: interpolate(spec.remediationSummary, outcome.remediationParams),
        reference: spec.trace
      };
    case "PASSED":
      return { summary: "No action required.", reference: spec.trace };
    default:
      return {
        summary: "No determination could be made from the available evidence. Re-run the assessment when fresh evidence is available.",
        reference: spec.trace
      };
  }
}
function interpolate(template, params) {
  return template.replace(/<([a-zA-Z-]+)>/g, (_match, key) => params?.[key] ?? "");
}
function baseRule(code) {
  const spec = findingCodeSpec(code);
  return {
    code: spec.code,
    version: RULE_VERSION,
    severity: spec.severity,
    // Azure setup-state rules describe prerequisites that exist (or not)
    // regardless of whether the connector does — they assess both a
    // proposed setup and a live one. Connector-runtime rules override this.
    workflows: ["readiness", "diagnosis"],
    appliesTo: spec.appliesTo,
    remediation: (outcome) => remediationFor(spec, outcome)
  };
}
function tenantMismatchRule() {
  return {
    ...baseRule("AZ_TENANT_MISMATCH"),
    provider: "AZURE",
    requiredEvidence: ["azure.tenant.identity"],
    evaluate(evidence, _clock) {
      const item = evidence.get("azure.tenant.identity");
      if (!item)
        throw new Error("engine contract violation: missing evidence");
      const q = evidenceQuality(item.ref.status);
      const activeTenantId = item.facts.activeTenantId;
      const intendedTenantId = item.facts.intendedTenantId;
      const status = activeTenantId === void 0 || intendedTenantId === "" ? "UNKNOWN" : activeTenantId === intendedTenantId ? "PASSED" : "FAILED";
      return {
        status,
        confidence: status === "UNKNOWN" ? "LOW" : q.confidence,
        affectedScope: { breadth: "CONNECTOR" },
        evidence: [item.ref],
        freshness: { verdict: q.verdict },
        ...status === "FAILED" && item.facts.intendedTenantId !== "" ? { remediationParams: { "tenant-id": item.facts.intendedTenantId } } : {}
      };
    }
  };
}
function eventHubUnreachableRule() {
  return {
    ...baseRule("AZ_EVENTHUB_UNREACHABLE"),
    provider: "AZURE",
    requiredEvidence: ["azure.eventhub.resources"],
    evaluate(evidence, _clock) {
      const item = evidence.get("azure.eventhub.resources");
      if (!item)
        throw new Error("engine contract violation: missing evidence");
      const f = item.facts;
      if (f.expectedNamespaceCount < 1) {
        return {
          status: "UNKNOWN",
          confidence: "LOW",
          affectedScope: { breadth: "CONNECTOR" },
          evidence: [item.ref],
          freshness: { verdict: evidenceQuality(item.ref.status).verdict }
        };
      }
      const healthy = f.discoveredNamespaceCount >= f.expectedNamespaceCount && f.missingHubs.length === 0 && f.missingConsumerGroups.length === 0 && f.missingDiscoveryTags.length === 0;
      const q = evidenceQuality(item.ref.status);
      const status = healthy ? "PASSED" : "FAILED";
      return {
        status,
        confidence: q.confidence,
        affectedScope: { breadth: "CONNECTOR" },
        evidence: [item.ref],
        freshness: { verdict: q.verdict }
      };
    }
  };
}
function recordingSubMissingRule() {
  return {
    ...baseRule("AZ_RECORDING_SUB_MISSING"),
    provider: "AZURE",
    requiredEvidence: ["azure.subscription.diagnostics"],
    evaluate(evidence, _clock) {
      const item = evidence.get("azure.subscription.diagnostics");
      if (!item)
        throw new Error("engine contract violation: missing evidence");
      const missing = item.facts.subscriptions.filter((s) => !s.activityLogExportConfigured);
      const q = evidenceQuality(item.ref.status);
      if (missing.length === 0) {
        return {
          status: "PASSED",
          confidence: q.confidence,
          affectedScope: { breadth: "CONNECTOR" },
          evidence: [item.ref],
          freshness: { verdict: q.verdict }
        };
      }
      const atCap = missing.some((s) => s.diagnosticSettingsCount >= s.diagnosticSettingsCap);
      return {
        status: "FAILED",
        // The cap is a definitive root cause; absent it, other causes
        // (policy exclusion, propagation) remain possible. Evidence
        // quality (stale/pending) caps the confidence either way.
        confidence: capConfidence(q.confidence, atCap ? "HIGH" : "MEDIUM"),
        affectedScope: {
          breadth: "SUBSCRIPTION",
          subscriptionIds: missing.map((s) => s.subscriptionId)
        },
        evidence: [item.ref],
        freshness: { verdict: q.verdict }
      };
    }
  };
}
function connectorHealthDegradedRule() {
  return {
    ...baseRule("AWS_CONNECTOR_HEALTH_DEGRADED"),
    // Connector-runtime signal: structurally meaningless before the
    // connector exists, so readiness reports it NOT_APPLICABLE.
    workflows: ["diagnosis"],
    requiredEvidence: ["aws.connector.health"],
    evaluate(evidence, _clock) {
      const item = evidence.get("aws.connector.health");
      if (!item)
        throw new Error("engine contract violation: missing evidence");
      const q = evidenceQuality(item.ref.status);
      const status = item.facts.healthStatus === "HEALTHY" ? "PASSED" : item.facts.healthStatus === "UNHEALTHY" ? "FAILED" : "UNKNOWN";
      return {
        status,
        // A health flag alone never explains a root cause — correlation
        // with Azure-side findings does — so confidence never exceeds
        // MEDIUM, and degraded evidence (stale/pending) lowers it further.
        confidence: status === "UNKNOWN" || q.verdict !== "FRESH" ? "LOW" : "MEDIUM",
        affectedScope: { breadth: "CONNECTOR" },
        evidence: [item.ref],
        freshness: { verdict: q.verdict }
      };
    }
  };
}
function authAppMissingRule() {
  return {
    ...baseRule("AZ_AUTH_APP_MISSING"),
    provider: "AZURE",
    requiredEvidence: ["azure.entra.application"],
    evaluate(evidence, _clock) {
      const item = evidence.get("azure.entra.application");
      if (!item)
        throw new Error("engine contract violation: missing evidence");
      const q = evidenceQuality(item.ref.status);
      return {
        status: item.facts.applicationFound ? "PASSED" : "FAILED",
        confidence: q.confidence,
        affectedScope: { breadth: "CONNECTOR" },
        evidence: [item.ref],
        freshness: { verdict: q.verdict }
      };
    }
  };
}
function federatedCredMissingRule() {
  return {
    ...baseRule("AZ_FEDERATED_CRED_MISSING"),
    provider: "AZURE",
    requiredEvidence: ["azure.entra.application"],
    evaluate(evidence, _clock) {
      const item = evidence.get("azure.entra.application");
      if (!item)
        throw new Error("engine contract violation: missing evidence");
      const q = evidenceQuality(item.ref.status);
      const status = !item.facts.applicationFound ? "UNKNOWN" : item.facts.federatedSubjectForAccount ? "PASSED" : "FAILED";
      return {
        status,
        confidence: status === "UNKNOWN" ? "LOW" : q.confidence,
        affectedScope: { breadth: "CONNECTOR" },
        evidence: [item.ref],
        freshness: { verdict: q.verdict }
      };
    }
  };
}
function graphConsentMissingRule() {
  return {
    ...baseRule("AZ_GRAPH_CONSENT_MISSING"),
    provider: "AZURE",
    requiredEvidence: ["azure.entra.application"],
    evaluate(evidence, _clock) {
      const item = evidence.get("azure.entra.application");
      if (!item)
        throw new Error("engine contract violation: missing evidence");
      const q = evidenceQuality(item.ref.status);
      const missing = item.facts.missingGraphPermissions;
      const status = !item.facts.applicationFound ? "UNKNOWN" : missing === void 0 ? "UNKNOWN" : missing.length === 0 ? "PASSED" : "FAILED";
      return {
        status,
        confidence: status === "UNKNOWN" ? "LOW" : q.confidence,
        affectedScope: { breadth: "CONNECTOR" },
        evidence: [item.ref],
        freshness: { verdict: q.verdict }
      };
    }
  };
}
function rbacRoleMissingRule() {
  return {
    ...baseRule("AZ_RBAC_ROLE_MISSING"),
    provider: "AZURE",
    requiredEvidence: ["azure.rbac.assignments"],
    evaluate(evidence, _clock) {
      const item = evidence.get("azure.rbac.assignments");
      if (!item)
        throw new Error("engine contract violation: missing evidence");
      const q = evidenceQuality(item.ref.status);
      const failed2 = !item.facts.servicePrincipalFound || item.facts.missingRoles.length > 0;
      const missingRoles = item.facts.missingRoles.length > 0 ? item.facts.missingRoles.join(", ") : "all required roles";
      return {
        status: failed2 ? "FAILED" : "PASSED",
        confidence: q.confidence,
        affectedScope: { breadth: "CONNECTOR" },
        evidence: [item.ref],
        freshness: { verdict: q.verdict },
        ...failed2 ? { remediationParams: { missingRoles } } : {}
      };
    }
  };
}
function defenderExportBrokenRule() {
  return {
    ...baseRule("AZ_DEFENDER_EXPORT_BROKEN"),
    provider: "AZURE",
    requiredEvidence: ["azure.defender.export"],
    evaluate(evidence, _clock) {
      const item = evidence.get("azure.defender.export");
      if (!item)
        throw new Error("engine contract violation: missing evidence");
      const q = evidenceQuality(item.ref.status);
      const healthy = item.facts.automationFound && item.facts.targetsExpectedHub;
      return {
        status: healthy ? "PASSED" : "FAILED",
        confidence: q.confidence,
        affectedScope: { breadth: "CONNECTOR" },
        evidence: [item.ref],
        freshness: { verdict: q.verdict }
      };
    }
  };
}
function azureRuleCatalog() {
  return {
    version: CATALOG_VERSION,
    rules: [
      tenantMismatchRule(),
      authAppMissingRule(),
      federatedCredMissingRule(),
      graphConsentMissingRule(),
      rbacRoleMissingRule(),
      eventHubUnreachableRule(),
      recordingSubMissingRule(),
      defenderExportBrokenRule(),
      connectorHealthDegradedRule()
    ]
  };
}

// dist/workflow/azure-source.js
var AZURE_SOURCE_TIMEOUT_MS = 6e4;
function unavailableAzureEvidence(context, errorCategory) {
  const collectedTimestamp = (/* @__PURE__ */ new Date()).toISOString();
  return azureEvidenceDefinitions(context.capabilities).map(({ kind, provenance }) => ({
    ref: { kind, status: "UNAVAILABLE", provenance, collectedTimestamp, errorCategory },
    facts: void 0
  }));
}
async function invokeAzureSource(azure, context) {
  let timer;
  const controller = new AbortController();
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => {
      controller.abort();
      resolve(unavailableAzureEvidence(context, "TIMEOUT"));
    }, AZURE_SOURCE_TIMEOUT_MS);
  });
  try {
    return await Promise.race([azure(context, controller.signal), timeout]);
  } catch {
    return unavailableAzureEvidence(context, "UNCATEGORIZED");
  } finally {
    clearTimeout(timer);
  }
}
function hasAvailableAzureEvidence(items) {
  return items.some((item) => item.ref.kind.startsWith("azure.") && (item.ref.status === "AVAILABLE" || item.ref.status === "STALE" || item.ref.status === "PENDING" || item.ref.status === "DENIED"));
}

// dist/workflow/diagnose.js
var SYSTEM_CLOCK = { now: () => /* @__PURE__ */ new Date() };
async function diagnoseConnector(request, deps) {
  const clock = deps.clock ?? SYSTEM_CLOCK;
  const catalog = deps.catalog ?? azureRuleCatalog();
  const aws = await collectAwsEvidence(deps.port, request.selector, clock);
  const azureItems = await collectAzure(deps.azure, aws, request);
  const configFacts = readConfigFacts(aws);
  const evidence = applyEvidenceFreshness([...aws.evidence, ...azureItems], clock);
  const evaluated = evaluate(catalog, {
    workflow: "diagnosis",
    evaluatedScope: {
      awsAccountId: request.awsAccountId,
      awsRegion: request.awsRegion,
      azureTenantId: configFacts?.configuredTenantId,
      subscriptionIds: configFacts?.configuredSubscriptionIds ?? [],
      capabilities: configFacts?.capabilities
    },
    evidence: evidenceSetOf(evidence),
    connector: aws.connector
  }, clock);
  const result = applyPendingWindow(evaluated, { connectorCreatedAt: configFacts?.createdAt }, clock);
  return {
    resolution: aws.resolution,
    result,
    runtimeRecoveryProven: runtimeRecoveryProven(result),
    awsOnly: !hasAvailableAzureEvidence(azureItems)
  };
}
async function collectAzure(azure, aws, request) {
  if (azure === void 0)
    return [];
  if (aws.resolution.outcome !== "RESOLVED")
    return [];
  if (aws.connector?.provider !== void 0 && aws.connector.provider !== "AZURE")
    return [];
  const configFacts = readConfigFacts(aws);
  if (configFacts === void 0)
    return [];
  return invokeAzureSource(azure, {
    connectorId: aws.resolution.connectorId,
    awsAccountId: request.awsAccountId,
    awsRegion: request.awsRegion,
    tenantId: configFacts.configuredTenantId,
    subscriptionIds: configFacts.configuredSubscriptionIds,
    capabilities: configFacts.capabilities
  });
}
function readConfigFacts(aws) {
  const item = aws.evidence.find((candidate) => candidate.ref.kind === "aws.connector.config" && (candidate.ref.status === "AVAILABLE" || candidate.ref.status === "STALE"));
  return item?.facts;
}

// dist/workflow/readiness.js
var SYSTEM_CLOCK2 = { now: () => /* @__PURE__ */ new Date() };
async function assessConnectorReadiness(request, deps = {}) {
  const clock = deps.clock ?? SYSTEM_CLOCK2;
  const catalog = deps.catalog ?? azureRuleCatalog();
  const azureItems = deps.azure === void 0 ? [] : await invokeAzureSource(deps.azure, {
    // Pre-creation: no connectorId. Scope is the PROPOSED setup.
    awsAccountId: request.awsAccountId,
    awsRegion: request.awsRegion,
    tenantId: request.proposed.azureTenantId,
    subscriptionIds: request.proposed.subscriptionIds,
    capabilities: request.proposed.capabilities
  });
  const evidence = applyEvidenceFreshness(azureItems, clock);
  const result = evaluate(catalog, {
    workflow: "readiness",
    evaluatedScope: {
      awsAccountId: request.awsAccountId,
      awsRegion: request.awsRegion,
      azureTenantId: request.proposed.azureTenantId,
      subscriptionIds: request.proposed.subscriptionIds,
      capabilities: request.proposed.capabilities
    },
    evidence: evidenceSetOf(evidence),
    proposed: request.proposed
  }, clock);
  return { result, awsOnly: !hasAvailableAzureEvidence(azureItems) };
}

// dist/cli/collector.js
var AWS_REGION_SHAPE = /^[a-z]{2,4}(-[a-z]+)+-\d+$/;
var AWS_ACCOUNT_ID2 = /^\d{12}$/;
var UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
var UNSAFE_CONNECTOR_ID = /[\\/?#%\u0000-\u001f\u007f]/;
var MAX_SELECTOR_LENGTH = 256;
var CollectorInputError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "CollectorInputError";
  }
};
function assertKnownKeys(value, keys, label) {
  const allowed = new Set(keys);
  if (Object.keys(value).some((key) => !allowed.has(key))) {
    throw new CollectorInputError(`${label} contains an unsupported field.`);
  }
}
function record(value, label) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new CollectorInputError(`${label} must be a JSON object.`);
  }
  return value;
}
function requiredString(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new CollectorInputError(`${label} must be a non-empty string.`);
  }
  return value.trim();
}
function optionalString(value, label) {
  if (value === void 0)
    return void 0;
  return requiredString(value, label);
}
function isStructurallyValidAwsRegion(value) {
  return AWS_REGION_SHAPE.test(value);
}
function awsScope(args) {
  const awsAccountId = requiredString(args["awsAccountId"], "awsAccountId");
  if (!AWS_ACCOUNT_ID2.test(awsAccountId)) {
    throw new CollectorInputError("awsAccountId must contain exactly 12 digits.");
  }
  const awsRegion = requiredString(args["awsRegion"], "awsRegion");
  if (!isStructurallyValidAwsRegion(awsRegion)) {
    throw new CollectorInputError("awsRegion must use a valid AWS Region format, for example us-east-1.");
  }
  return { awsAccountId, awsRegion };
}
function azureAccess(value) {
  if (value === void 0 || value === "auto")
    return "auto";
  if (value === "disabled")
    return "disabled";
  throw new CollectorInputError("azureAccess must be either auto or disabled.");
}
function normalizeUuid(value, label) {
  const normalized = requiredString(value, label).toLowerCase();
  if (!UUID.test(normalized))
    throw new CollectorInputError(`${label} must be a UUID.`);
  return normalized;
}
function capabilities(value) {
  const parsed = record(value, "capabilities");
  assertKnownKeys(parsed, ["cspm", "inspector", "threats"], "capabilities");
  for (const key of ["cspm", "inspector", "threats"]) {
    if (typeof parsed[key] !== "boolean") {
      throw new CollectorInputError(`capabilities.${key} must be a boolean.`);
    }
  }
  return {
    cspm: parsed["cspm"],
    inspector: parsed["inspector"],
    threats: parsed["threats"]
  };
}
function parseDiagnose(argsValue, access) {
  const args = record(argsValue, "arguments");
  assertKnownKeys(args, ["connectorId", "connectorName", "awsAccountId", "awsRegion"], "arguments");
  const scope = awsScope(args);
  const connectorId = optionalString(args["connectorId"], "connectorId");
  const connectorName = optionalString(args["connectorName"], "connectorName");
  const hasId = connectorId !== void 0;
  const hasName = connectorName !== void 0;
  if (hasId === hasName) {
    throw new CollectorInputError("Provide exactly one of connectorId or connectorName.");
  }
  if ((connectorId?.length ?? connectorName?.length ?? 0) > MAX_SELECTOR_LENGTH) {
    throw new CollectorInputError("Connector selector exceeds the supported length.");
  }
  if (connectorId !== void 0 && (connectorId.startsWith("-") || connectorId === "." || connectorId === ".." || UNSAFE_CONNECTOR_ID.test(connectorId))) {
    throw new CollectorInputError("connectorId is not a supported identifier.");
  }
  return {
    operation: "diagnose_connector",
    azureAccess: access,
    arguments: { ...scope, connectorId, connectorName }
  };
}
function parseReadiness(argsValue, access) {
  const args = record(argsValue, "arguments");
  assertKnownKeys(args, ["awsAccountId", "awsRegion", "azureTenantId", "subscriptionIds", "capabilities"], "arguments");
  const scope = awsScope(args);
  const azureTenantId = normalizeUuid(args["azureTenantId"], "azureTenantId");
  if (!Array.isArray(args["subscriptionIds"])) {
    throw new CollectorInputError("subscriptionIds must be a JSON array.");
  }
  const subscriptionIds = [
    ...new Set(args["subscriptionIds"].map((candidate) => normalizeUuid(candidate, "subscription id")))
  ];
  if (subscriptionIds.length === 0) {
    throw new CollectorInputError("Tenant-wide scope is not supported safely; provide at least one subscription UUID.");
  }
  if (subscriptionIds.length > AZURE_COLLECTOR_BOUNDS.maxSubscriptionIds) {
    throw new CollectorInputError(`At most ${AZURE_COLLECTOR_BOUNDS.maxSubscriptionIds} unique subscriptions are supported per run.`);
  }
  return {
    operation: "assess_connector_readiness",
    azureAccess: access,
    arguments: {
      ...scope,
      azureTenantId,
      subscriptionIds,
      capabilities: capabilities(args["capabilities"])
    }
  };
}
function parseCollectorInput(value) {
  const input = record(value, "request");
  assertKnownKeys(input, ["operation", "arguments", "azureAccess"], "request");
  const access = azureAccess(input["azureAccess"]);
  if (input["operation"] === "diagnose_connector") {
    return parseDiagnose(input["arguments"], access);
  }
  if (input["operation"] === "assess_connector_readiness") {
    return parseReadiness(input["arguments"], access);
  }
  throw new CollectorInputError("operation must be diagnose_connector or assess_connector_readiness.");
}
function azureSource(input, dependencies) {
  if (input.azureAccess === "disabled")
    return void 0;
  return dependencies.azureSource ?? createAzureCliEvidenceSource(createAzureCliRunner());
}
async function runConnectorDiagnostics(value, dependencies = {}) {
  const input = parseCollectorInput(value);
  const azure = azureSource(input, dependencies);
  const awsRunner = dependencies.awsRunner ?? createAwsCliRunner();
  if (input.operation === "diagnose_connector") {
    const { connectorId, connectorName, awsAccountId: awsAccountId2, awsRegion: awsRegion2 } = input.arguments;
    const outcome2 = await diagnoseConnector({
      selector: { connectorId, connectorName },
      awsAccountId: awsAccountId2,
      awsRegion: awsRegion2
    }, {
      port: createAwsCliSecurityHubReadPort(awsRunner, { awsAccountId: awsAccountId2, awsRegion: awsRegion2 }),
      azure
    });
    return JSON.stringify({
      resolution: outcome2.resolution,
      runtimeRecoveryProven: outcome2.runtimeRecoveryProven,
      awsOnly: outcome2.awsOnly,
      result: JSON.parse(serializeResult(outcome2.result))
    });
  }
  const { awsAccountId, awsRegion, azureTenantId, subscriptionIds, capabilities: capabilities2 } = input.arguments;
  const outcome = await assessConnectorReadiness({
    awsAccountId,
    awsRegion,
    proposed: { azureTenantId, subscriptionIds, capabilities: capabilities2 }
  }, { azure });
  return JSON.stringify({
    awsOnly: outcome.awsOnly,
    result: JSON.parse(serializeResult(outcome.result))
  });
}

// dist/cli/main.js
var MAX_INPUT_BYTES = 64 * 1024;
function chunkBuffer(chunk) {
  if (Buffer.isBuffer(chunk))
    return chunk;
  if (typeof chunk === "string" || chunk instanceof Uint8Array)
    return Buffer.from(chunk);
  throw new CollectorInputError("Request input could not be read safely.");
}
async function readBoundedStdin(stdin, maxInputBytes = MAX_INPUT_BYTES) {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of stdin) {
    const buffer = chunkBuffer(chunk);
    bytes += buffer.length;
    if (bytes > maxInputBytes) {
      throw new CollectorInputError("Request exceeds the supported input size.");
    }
    chunks.push(buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}
var defaultRuntime = {
  argv: process.argv,
  stdin: process.stdin,
  writeStdout: (text) => {
    process.stdout.write(text);
  },
  writeStderr: (text) => {
    process.stderr.write(text);
  },
  runDiagnostics: runConnectorDiagnostics
};
async function runCollectorCli(runtime = defaultRuntime) {
  try {
    if (runtime.argv.length !== 2) {
      throw new CollectorInputError("This collector accepts one JSON request on stdin only.");
    }
    const raw = await readBoundedStdin(runtime.stdin);
    if (raw.trim().length === 0) {
      throw new CollectorInputError("Request must contain one JSON object.");
    }
    let request;
    try {
      request = JSON.parse(raw);
    } catch {
      throw new CollectorInputError("Request must be valid JSON.");
    }
    runtime.writeStdout(`${await runtime.runDiagnostics(request)}
`);
    return 0;
  } catch (err) {
    const inputError = err instanceof CollectorInputError;
    const error = {
      error: {
        category: inputError ? "INVALID_INPUT" : sanitizeError(err).category,
        message: inputError ? err.message : "Connector diagnostics could not complete safely."
      }
    };
    runtime.writeStderr(`${JSON.stringify(error)}
`);
    return inputError ? 2 : 1;
  }
}
if (process.argv[1] !== void 0 && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void runCollectorCli().then((exitCode) => {
    process.exitCode = exitCode;
  });
}
export {
  readBoundedStdin,
  runCollectorCli
};
