import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as z from "zod";

export const jobRequestSchema = z.strictObject({
  requestId: z.uuid(),
  task: z.string().trim().min(1).max(2000),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
});

export type JobRequest = z.infer<typeof jobRequestSchema>;

export async function submitJob(
  request: HttpRequest,
  _context: InvocationContext,
): Promise<HttpResponseInit> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return {
      status: 400,
      jsonBody: {
        status: "invalid",
        errors: {
          formErrors: ["Request body must be valid JSON."],
          fieldErrors: {},
        },
      },
    };
  }

  const result = jobRequestSchema.safeParse(body);
  if (!result.success) {
    return {
      status: 400,
      jsonBody: {
        status: "invalid",
        errors: z.flattenError(result.error),
      },
    };
  }

  return {
    status: 200,
    jsonBody: {
      status: "validated",
      scheduled: false,
      ...result.data,
    },
  };
}
