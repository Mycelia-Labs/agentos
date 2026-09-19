import { app, InvocationContext } from "@azure/functions";
import { z } from "zod";

const JobMessageSchema = z.strictObject({
	jobId: z.string().min(1),
	task: z.string().min(1),
	attempt: z.number().int().nonnegative(),
});

type JobMessage = z.infer<typeof JobMessageSchema>;

export function validateJobMessage(input: unknown): JobMessage {
	const result = JobMessageSchema.safeParse(input);

	if (!result.success) {
		throw new Error(`Invalid job message: ${result.error.message}`);
	}

	return result.data;
}

function handleJob(queueItem: unknown, context: InvocationContext): void {
	const job = validateJobMessage(queueItem);

	context.log(`Processing ${job.task} for job ${job.jobId} (attempt ${job.attempt})`);
}

app.storageQueue("validate-job-message", {
	queueName: "jobs",
	connection: "AzureWebJobsStorage",
	handler: handleJob,
});
