# AO-WP-005 — Edge ai-orchestrator redeploy + JWT AGKB hard-promote soak

**Status:** COMPLETED  
**Completed:** 2026-07-30  
**Review:** AO-REV-005 PASS  

## Results

| Item | Result |
|------|--------|
| Token load | CLI Windows Credential Manager (sbp_ UTF-8); `projects list` OK for `aybovjvmyqexgpmhedni` |
| Deploy | `npx supabase functions deploy ai-orchestrator --project-ref aybovjvmyqexgpmhedni` |
| Initial post-deploy live | Still BOOT_ERROR/503 |
| Root cause | `Uncaught SyntaxError: Identifier 'payload' has already been declared` in `_shared/ai/cipModuleIntelligence.ts` |
| Fix | Hoist single `gkPayload` binding (remove duplicate `const payload`) |
| Live probe after fix | HTTP **401** `unauthorized` (boots; JWT required) — no BOOT_ERROR/503 |
| AGKB confirm e2e | **PASS** — `edge_dry_run` 200, `edge_confirm_promote` 200, `edgeWroteGk` true |

## Evidence

- `docs/uat-screenshots/EDGE_AI_ORCHESTRATOR_RECOVER_EVIDENCE.json`
- `docs/uat-screenshots/EDGE_AI_ORCHESTRATOR_BOOT_DIAG.json`
- `docs/uat-screenshots/AGKB_CONFIRM_E2E_SOAK_EVIDENCE.json`
- `docs/uat-screenshots/ROADMAP_PRODUCTION_READY_EVIDENCE.json`

## Notes

Does not reopen Sprint 1616. Follow-on package AO-WP-006 tracks standing deferred owner gates.
