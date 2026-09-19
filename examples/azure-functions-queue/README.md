---
title: "Azure Functions Storage Queue"
description: "An isolated TypeScript Azure Functions v4 queue-trigger example with Zod validation."
category: "Integrations"
order: 0
---

This example is intentionally self-contained: an Azure Functions v4 Storage Queue trigger receives a JSON job, validates it with a strict Zod schema, and logs the validated job. The parser lives in `src/job.ts`, so it can be tested without importing Azure Functions or provisioning Azure resources.

The accepted message shape is:

```json
{"id":"job-123","task":"index-document"}
```

Unknown fields are rejected rather than stripped. Malformed JSON and invalid field types also throw, which lets the queue runtime apply its normal retry behavior.

## Test and type-check

From this directory:

```sh
pnpm install
pnpm test
pnpm check-types
pnpm build
```

The tests cover a valid message, malformed JSON/field data, and an unknown field.

## Retry behavior

The handler deliberately lets validation errors propagate. Azure Storage Queue retries a failed delivery until `maxDequeueCount` is reached; this example sets that limit to **5** in `host.json`, with a 30-second visibility timeout. After the final failed dequeue, Azure moves the message to the `jobs-poison` queue. No Azure resource is created by this example.

To run the trigger locally, use Azure Functions Core Tools with a local Storage emulator and an `AzureWebJobsStorage` setting. The queue binding is the Node.js programming model v4 `app.storageQueue` registration in `src/functions/processJob.ts`.

## Documentation

- [Azure Queue Storage trigger for Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-storage-queue-trigger?pivots=programming-language-typescript)
- [Azure Functions Node.js v4 developer guide](https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-node?pivots=nodejs-model-v4)
- [Zod schema definitions](https://zod.dev/api)
