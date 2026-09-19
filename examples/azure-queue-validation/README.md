# Azure Queue message validation

A tiny Azure Functions Node.js v4 queue-trigger example that validates a JSON job message with Zod before processing it. The schema is strict: unknown keys are rejected instead of silently accepted.

The handler expects a message shaped like:

```json
{"jobId":"job-123","task":"rebuild-index","attempt":1}
```

It receives the queue item as `unknown`, validates it with `safeParse`, and throws for invalid input so the host can apply its normal queue retry behavior. This directory is source-only: it intentionally adds no package manifest, dependency installation, local settings, or deployment configuration. The host application must provide `@azure/functions` and `zod`.

## Documentation

- [Zod strict objects and parsing](https://zod.dev/api#objects)
- [Azure Queue storage trigger for Azure Functions](https://learn.microsoft.com/azure/azure-functions/functions-bindings-storage-queue-trigger)

The Microsoft example uses the Node.js v4 `app.storageQueue` registration and documents the queue input as `unknown` by default; JSON payloads are deserialized before the handler runs. Runtime validation is still useful because the queue contents are untrusted.

## Checks

No dependencies were installed and nothing was deployed. In a configured host application, the smallest useful checks would be:

- Run the repository formatter/linter against this directory (for example, `pnpm biome check examples/azure-queue-validation/`).
- Run the host application's TypeScript check to verify the `@azure/functions` and `zod` versions in use.
- Exercise `validateJobMessage` with one valid message, a missing field, and an extra field to confirm strict rejection.
