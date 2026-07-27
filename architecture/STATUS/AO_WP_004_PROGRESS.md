# AO-WP-004 progress — ITP CI Engine SPA go-live

**As of:** 2026-07-27  
**Package:** AO-WP-004 (approved / in progress)  
**Prior:** AO-WP-003 Access Control — COMPLETE (no reopen)

## Done this pulse

| Item | Result |
|------|--------|
| ITP CI Engine selftest | **52/52 PASS** |
| Local SPA stage (`itp-ci-engine:spa-stage`) | **STAGED_OK** stamp `20260727T011245Z-itp-ci-engine` |
| Go-live | **Deferred** — CIP SPA thrashing (releases ~every 5m) |
| ACL guardrail (post-merge) | access-control selftest + live probe **PASS** |
| Host ACL mask | `mask::rwx` |
| Live JWT soak | **Blocked** — no JWT/operator token in agent env |

## Evidence

- CCC `docs/uat-screenshots/CIP_ITP_CI_SPA_STAGE_EVIDENCE.json` (`stagedLocal: true`, `spaDeployed: false`, `blockedReason: stage_only_cip_thrashing_or_no_go_live_flag`)
- CCC `docs/uat-screenshots/CIP_ITP_CI_ENGINE_INTEGRATION_EVIDENCE.json`
- CCC `docs/uat-screenshots/POST_MERGE_REGRESSION_EVIDENCE.json`

## Next engineering step

When CIP floor SPA deploys idle for a quiet window:

```bash
CIP_SPA_QUIET=1 npm run itp-ci-engine:spa-stage -- --go-live
```

Fail closed unless host HTTP 200 and assets ACL mask `rwx`. Then optional JWT soak if owner provides token out-of-band.

## Owner-only

1. Quiet-window coordination is automatic when CIP pauses — no owner action if agent can observe idle releases.
2. Live JWT soak requires owner-supplied session/JWT (not present in agent environment).
3. `CURSOR_AO_WEBHOOK_URL` still owner-gated for Architecture Office auto-dispatch (orthogonal).
