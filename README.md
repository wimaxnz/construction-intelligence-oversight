# construction-intelligence-oversight

Independent AI oversight, architecture review, risk monitoring, and roadmap governance for the Construction Intelligence platform.

## Architecture Office

Governing architecture artefacts live under [`architecture/`](./architecture/README.md).

- **Governing reference:** [`architecture/CCC_ARCHITECTURE.md`](./architecture/CCC_ARCHITECTURE.md)
- **Machine state:** [`architecture/ARCHITECTURE_STATE.json`](./architecture/ARCHITECTURE_STATE.json)
- **Next package:** [`architecture/NEXT_WORKPACKAGE.md`](./architecture/NEXT_WORKPACKAGE.md)
- **Publication guard:** `node scripts/architecture-office-guard.mjs` (fail-closed)

Architecture Office links to — and does not replace — the AI Oversight Protocol:

- [`AI_OVERSIGHT_PROTOCOL.md`](./AI_OVERSIGHT_PROTOCOL.md)
- [`AI_OVERSIGHT_STATE.json`](./AI_OVERSIGHT_STATE.json) (canonical sprint/milestone position)
- [`OVERSIGHT_SYNC.md`](./OVERSIGHT_SYNC.md)

Root allowlisted sprint-state sync from the private delivery repo remains unchanged. `architecture/` is native to this repository and is validated by Architecture Office guards / CI.
