import { createClient } from "@rivet-dev/agentos/client";
import type { registry } from "./quality-gate-server";

const client = createClient<typeof registry>({ endpoint: "http://localhost:6420" });
const handle = client.qualityGate.getOrCreate("main");

const filePath = process.argv[2] ?? "/home/agentos/project/src/index.ts";
const instruction =
  process.argv[3] ??
  "Look for correctness, security, and maintainability issues. Keep the report concise.";

await handle.send("review", { filePath, instruction });

const state = await handle.getState();
console.log("Reviewed:", state.lastFile);
console.log("Quality gate:", state.lastResult);
