import { agentOS, setup } from "@rivet-dev/agentos";
import { actor, queue } from "rivetkit";
import {
  type WorkflowStepContextOf,
  workflow,
} from "rivetkit/workflow";
import pi from "@agentos-software/pi";

const vm = agentOS({ software: [pi] });

type GateResult = "passed" | "needs-work";

// This workflow turns an agent review into a durable quality gate. The review
// and decision are separate steps, so a crash after the agent finishes does not
// require paying for the review again when the workflow replays.
const qualityGate = actor({
  state: {
    lastFile: null as string | null,
    lastResult: null as GateResult | null,
  },
  queues: {
    review: queue<{ filePath: string; instruction: string }>(),
  },
  run: workflow(async (ctx) => {
    await ctx.loop("quality-gate-loop", async (loopCtx) => {
      const message = await loopCtx.queue.next("wait-for-review");
      const { filePath, instruction } = message.body;

      // The session is scoped to this step. Its findings are persisted in the
      // VM filesystem and then returned to the workflow as step data.
      const review = await loopCtx.step("review-file", (step) =>
        reviewFile(step, filePath, instruction),
      );

      // Keep the gate deterministic and easy to replace with a stricter policy:
      // the agent is responsible for findings, while this step owns the route.
      const passed = await loopCtx.step("evaluate-review", () =>
        !/\b(blocker|critical)\b/i.test(review),
      );

      await loopCtx.step("record-result", async (step) => {
        step.state.lastFile = filePath;
        step.state.lastResult = passed ? "passed" : "needs-work";
      });
    });
  }),
  actions: {
    getState: (c) => c.state,
  },
});

async function reviewFile(
  step: WorkflowStepContextOf<typeof qualityGate>,
  filePath: string,
  instruction: string,
): Promise<string> {
  const agent = step.client<typeof registry>().vm.getOrCreate("quality-reviewer");

  // Clear the previous artifact so each request produces a self-contained
  // result even when the VM is reused for multiple workflow iterations.
  await agent.writeFile("/home/agentos/review.md", "");

  const sessionId = await agent.createSession("claude", {
    env: { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY! },
  });
  await agent.sendPrompt(
    sessionId,
    [
      `Review the file at ${filePath}.`,
      instruction,
      "Write the findings to /home/agentos/review.md.",
      "Start with PASS: when there are no blocking issues, or BLOCKER: / CRITICAL: when there is a blocking issue.",
    ].join("\n\n"),
  );
  await agent.closeSession(sessionId);

  const content = await agent.readFile("/home/agentos/review.md");
  return new TextDecoder().decode(content);
}

export const registry = setup({ use: { vm, qualityGate } });
registry.start();
