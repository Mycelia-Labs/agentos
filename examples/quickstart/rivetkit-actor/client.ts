import { createClient } from "@rivet-dev/agentos/client";
import type { registry } from "./server";

const client = createClient<typeof registry>({
	endpoint: "http://localhost:6420",
});

// The same key addresses the same VM actor on later client runs.
const vm = client.vm.getOrCreate("persistent-demo");
const statePath = "/workspace/visit-count.txt";

const previous = (await vm.exists(statePath))
	? new TextDecoder().decode(await vm.readFile(statePath))
	: "0";
const visitCount = Number.parseInt(previous.trim() || "0", 10) + 1;

await vm.writeFile(statePath, `${visitCount}\n`);
console.log("Visit count:", visitCount);
