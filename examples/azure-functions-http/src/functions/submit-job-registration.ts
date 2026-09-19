import type { HttpFunctionOptions } from "@azure/functions";
import { submitJob } from "./submit-job-handler.js";

export const submitJobOptions = {
  route: "jobs",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: submitJob,
} satisfies HttpFunctionOptions;
