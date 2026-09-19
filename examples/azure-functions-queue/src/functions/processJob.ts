import { app, type InvocationContext } from "@azure/functions";
import { parseJobMessage } from "../job.js";

export function processJob(queueItem: string, context: InvocationContext): void {
  const job = parseJobMessage(queueItem);
  context.log("Processing job", job);
}

app.storageQueue<string>("processJob", {
  queueName: "jobs",
  connection: "AzureWebJobsStorage",
  handler: processJob,
});
