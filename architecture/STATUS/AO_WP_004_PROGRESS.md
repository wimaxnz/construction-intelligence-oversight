# AO-WP-004 progress — ITP CI Engine SPA go-live

**As of:** 2026-07-27  
**Package:** AO-WP-004 (`in_progress` / **STAGED**; go-live deferred)  
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

## Automation pulse (2026-07-27T05:47Z)

Architecture Office delivery automation re-ran after `NEXT_WORKPACKAGE.md` dispatch. Guard **PASS**. Package remains **approved / in_progress** — not archived.

| Check | Result |
|-------|--------|
| Sibling `../construction-command-centre` | **Absent** |
| Known remote `wimaxnz/construction-command-centre` | **Not accessible** (`Repository not found` for automation token) |
| Production probe `https://ccc.247print.biz` | Cloudflare **HTTP 403** / `cf-mitigated: challenge` |
| Quiet-window / `--go-live` | **Not executed** — CCC code path unavailable; do not invent remote or thrash CIP |
| AO-WP-003 | Left **COMPLETE** (no reopen) |
| Production gate / Sprint 1616 | Unchanged (**CLOSED** / not queued) |

Oversight artefacts stay on the staged package; FAIL-close/sentinel restore would fight the intentional STAGED state on `main`. See [`AO_WP_004_AUTOMATION_PULSE.md`](./AO_WP_004_AUTOMATION_PULSE.md).

## Evidence

- CCC `docs/uat-screenshots/CIP_ITP_CI_SPA_STAGE_EVIDENCE.json` (`stagedLocal: true`, `spaDeployed: false`, `blockedReason: stage_only_cip_thrashing_or_no_go_live_flag`)
- CCC `docs/uat-screenshots/CIP_ITP_CI_ENGINE_INTEGRATION_EVIDENCE.json`
- CCC `docs/uat-screenshots/POST_MERGE_REGRESSION_EVIDENCE.json`

## Next engineering step

When CIP floor SPA deploys idle for a quiet window **and** CCC is available to the delivery agent:

```bash
CIP_SPA_QUIET=1 npm run itp-ci-engine:spa-stage -- --go-live
```

Fail closed unless host HTTP 200 and assets ACL mask `rwx`. Then optional JWT soak if owner provides token out-of-band.

## Owner-only

1. Grant automation access to private `wimaxnz/construction-command-centre` (or provide sibling checkout with `origin`) so quiet-window go-live can run.
2. Quiet-window coordination is automatic when CIP pauses — no owner action if agent can observe idle releases and run CCC scripts.
3. Live JWT soak requires owner-supplied session/JWT (not present in agent environment).
4. Optionally allowlist egress / bypass Cloudflare challenge for host+ACL probes from cloud agents.
5. `CURSOR_AO_WEBHOOK_URL` still owner-gated for Architecture Office auto-dispatch (orthogonal).
