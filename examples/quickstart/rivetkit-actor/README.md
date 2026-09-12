---
title: "RivetKit Actor"
description: "Keep an AgentOS VM's filesystem across client requests by addressing it with a stable RivetKit actor key."
category: "Quickstart"
order: 13
---

Keep a VM's filesystem across separate client runs by exposing it as a RivetKit actor. Reach for this when each user or task needs an isolated VM that can be addressed repeatedly without recreating it on every request.

## How it works

The server registers one `agentOS()` VM with `setup()`. The client calls `getOrCreate` with a stable actor key, checks a file in the VM, increments its value, and writes it back. RivetKit uses that key to route later requests to the same VM actor, so the second client run sees the state written by the first.

The VM starts with an in-memory filesystem; the state lasts as long as the actor's VM does. For durable storage beyond the VM lifecycle, use a filesystem mount such as S3 instead.

## Run it

From the repository root, install the workspace dependencies:

```sh
pnpm install
```

Start the server in one terminal:

```sh
pnpm --dir examples/quickstart/rivetkit-actor run server
```

Run the client in another terminal, then run it again:

```sh
pnpm --dir examples/quickstart/rivetkit-actor run client
pnpm --dir examples/quickstart/rivetkit-actor run client
```

The first run prints `Visit count: 1`; the second prints `Visit count: 2` because both requests address the `persistent-demo` actor.

## Source

View the source on GitHub: https://github.com/Mycelia-Labs/agentos/tree/feat/add-rivetkit-actor-example/examples/quickstart/rivetkit-actor
