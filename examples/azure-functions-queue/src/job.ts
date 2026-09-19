import * as z from "zod";

/** The only fields accepted in a queue job message. */
export const jobMessageSchema = z.strictObject({
  id: z.string().min(1),
  task: z.string().min(1),
});

export type JobMessage = z.infer<typeof jobMessageSchema>;

/**
 * Decode and validate one queue message without depending on Azure Functions.
 * Throwing is intentional: the queue trigger retries failed messages.
 */
export function parseJobMessage(message: string): JobMessage {
  const payload: unknown = JSON.parse(message);
  return jobMessageSchema.parse(payload);
}
