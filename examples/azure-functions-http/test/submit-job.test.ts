import assert from "node:assert/strict";
import { test } from "node:test";
import type {
  HttpRequest as HttpRequestType,
  InvocationContext,
} from "@azure/functions";
import { submitJob } from "../src/functions/submit-job-handler.js";
import { submitJobOptions } from "../src/functions/submit-job-registration.js";

const context = {} as InvocationContext;
const requestId = "550e8400-e29b-41d4-a716-446655440000";

type ResponseBody = Record<string, unknown>;
type RequestInit = {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: { string: string };
};
type SdkHttpRequest = new (init: RequestInit) => HttpRequestType;
type SdkHttpResponse = new (init: Awaited<ReturnType<typeof submitJob>>) => {
  status: number;
  json(): Promise<unknown>;
};

// The SDK documents these constructors for testing, but v4.16.5 does not expose them from its package entrypoint.
const httpRequestModulePath = "@azure/functions/src/http/HttpRequest.ts";
const httpResponseModulePath = "@azure/functions/src/http/HttpResponse.ts";
const [{ HttpRequest }, { HttpResponse }] = await Promise.all([
  import(httpRequestModulePath) as Promise<{ HttpRequest: SdkHttpRequest }>,
  import(httpResponseModulePath) as Promise<{ HttpResponse: SdkHttpResponse }>,
]);

function requestFromJson(json: string) {
  return new HttpRequest({
    method: "POST",
    url: "http://localhost:7071/api/jobs",
    headers: { "content-type": "application/json" },
    body: { string: json },
  });
}

function requestFrom(body: unknown) {
  return requestFromJson(JSON.stringify(body));
}

async function responseFrom(response: Awaited<ReturnType<typeof submitJob>>) {
  return new HttpResponse(response);
}

test("registers POST /api/jobs with the testable handler", () => {
  assert.equal(submitJobOptions.route, "jobs");
  assert.deepEqual(submitJobOptions.methods, ["POST"]);
  assert.equal(submitJobOptions.handler, submitJob);
});

test("validates, trims, and defaults a job request", async () => {
  const response = await responseFrom(
    await submitJob(requestFrom({ requestId, task: "  summarize this input  " }), context),
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    requestId,
    task: "summarize this input",
    priority: "normal",
    status: "validated",
    scheduled: false,
  });
});

test("rejects malformed JSON", async () => {
  const response = await responseFrom(await submitJob(requestFromJson("{not-json"), context));

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    status: "invalid",
    errors: {
      formErrors: ["Request body must be valid JSON."],
      fieldErrors: {},
    },
  });
});

test("rejects null and array bodies", async () => {
  for (const body of [null, []]) {
    const response = await responseFrom(await submitJob(requestFrom(body), context));
    const responseBody = (await response.json()) as ResponseBody;

    assert.equal(response.status, 400, `expected ${String(body)} to be rejected`);
    assert.equal(responseBody.status, "invalid");
  }
});

test("rejects an invalid UUID", async () => {
  const response = await responseFrom(
    await submitJob(requestFrom({ requestId: "not-a-uuid", task: "run the task" }), context),
  );

  assert.equal(response.status, 400);
  assert.equal(((await response.json()) as ResponseBody).status, "invalid");
});

test("rejects unknown fields", async () => {
  const response = await responseFrom(
    await submitJob(requestFrom({ requestId, task: "run the task", extra: true }), context),
  );

  assert.equal(response.status, 400);
  assert.equal(((await response.json()) as ResponseBody).status, "invalid");
});

test("accepts all three priorities", async () => {
  for (const priority of ["low", "normal", "high"] as const) {
    const response = await responseFrom(
      await submitJob(requestFrom({ requestId, task: "run the task", priority }), context),
    );

    assert.equal(response.status, 200);
    const body = (await response.json()) as ResponseBody;
    assert.equal(body.priority, priority);
    assert.equal(body.status, "validated");
    assert.equal(body.scheduled, false);
  }
});

test("accepts a task of exactly 4000 characters", async () => {
  const task = "x".repeat(4000);
  const response = await responseFrom(await submitJob(requestFrom({ requestId, task }), context));

  assert.equal(response.status, 200);
  assert.equal(((await response.json()) as ResponseBody).task, task);
});

test("rejects a task of 4001 characters", async () => {
  const response = await responseFrom(
    await submitJob(requestFrom({ requestId, task: "x".repeat(4001) }), context),
  );

  assert.equal(response.status, 400);
  assert.equal(((await response.json()) as ResponseBody).status, "invalid");
});

test("rejects an empty task after trimming", async () => {
  const response = await responseFrom(
    await submitJob(requestFrom({ requestId, task: " \n\t ", priority: "low" }), context),
  );

  assert.equal(response.status, 400);
});
