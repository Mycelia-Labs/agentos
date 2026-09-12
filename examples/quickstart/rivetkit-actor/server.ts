import { agentOS, setup } from "@rivet-dev/agentos";

// Register one AgentOS VM actor. Clients address it by a stable key.
const vm = agentOS();

export const registry = setup({ use: { vm } });
registry.start();
