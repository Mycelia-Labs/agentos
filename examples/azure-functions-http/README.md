---
title: "Azure Functions HTTP validation"
description: "Validate local job requests with Zod in an Azure Functions v4 HTTP endpoint."
category: "Integrations"
order: 1
---

A small, local-only Azure Functions v4 example that validates job requests at an HTTP boundary with Zod. It does not enqueue, persist, schedule, or execute jobs.

## Run it locally

Install the repository dependencies, then start the Functions host with Azure Functions Core Tools:

```sh
pnpm install
pnpm --dir examples/azure-functions-http start
```

No Azure subscription, deployment, storage account, credentials, or `local.settings.json` is required.

## Send a request

```sh
curl --request POST http://localhost:7071/api/jobs \
  --header 'content-type: application/json' \
  --data '{"requestId":"550e8400-e29b-41d4-a716-446655440000","task":"  summarize this input  ","priority":"high"}'
```

A valid request returns `200` with `status: "validated"` and `scheduled: false`. The response acknowledges validation only; it does not promise that a job was queued or will run.

The accepted payload has exactly these fields:

- `requestId`: UUID
- `task`: trimmed string, 1–4000 characters after trimming
- `priority`: `low`, `normal`, or `high`; defaults to `normal`

Unknown fields and invalid JSON are rejected with `400`.
