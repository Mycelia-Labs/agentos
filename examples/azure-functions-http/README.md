---
title: "Azure Functions HTTP validation"
description: "Validate local job requests with Zod in an Azure Functions v4 HTTP endpoint."
category: "Integrations"
order: 1
---

A small, local-only Azure Functions v4 example that validates job requests at an HTTP boundary with Zod. It does not enqueue, persist, schedule, or execute jobs.

## Prerequisites

- Node.js **22 LTS** is recommended. The repository requires Node.js 20 or newer, and the current Azure Functions guidance lists Node.js 22 and 24 as supported GA versions.
- Azure Functions Core Tools **v4**. Node.js programming model v4 requires Core Tools **4.0.5382 or newer** for local runs.

See the [Azure Functions local development guide](https://learn.microsoft.com/azure/azure-functions/functions-run-local) for installation instructions and the [Node.js v4 requirements](https://learn.microsoft.com/azure/azure-functions/functions-node-upgrade-v4#requirements).

## Run it locally

From a fresh checkout, install the repository dependencies, then start the Functions host from this example directory:

```sh
pnpm install
pnpm --dir examples/azure-functions-http start
```

This HTTP-only example does **not** require `local.settings.json`, `AzureWebJobsStorage`, an Azurite emulator, an Azure subscription, deployment, or credentials. Azure documents `AzureWebJobsStorage` as required for triggers other than HTTP; this example has no storage binding.

When the host is available, send a request:

```sh
curl --request POST http://localhost:7071/api/jobs \
  --header 'content-type: application/json' \
  --data '{"requestId":"550e8400-e29b-41d4-a716-446655440000","task":"  summarize this input  ","priority":"high"}'
```

A valid request returns `200` with `status: "validated"` and `scheduled: false`. The response acknowledges validation only; it does not promise that a job was queued or will run.

The accepted payload has exactly these fields:

- `requestId`: UUID
- `task`: trimmed string, 1–2000 characters after trimming
- `priority`: `low`, `normal`, or `high`; defaults to `normal`

Unknown fields and invalid JSON are rejected with `400`.

## Host-test limitation

The repository example includes handler-level tests, but a real Functions-host smoke test requires Core Tools to be installed and available as `func`. If `func` is unavailable, the host cannot be started and the HTTP smoke test has not been run; the handler tests are not a substitute for that host check.
