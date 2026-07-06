# AI Oversight — Close-out Packet

**Status:** Active — Sprint 385 close-out for milestone 400–409 Visual Revision Compare (2/10).

This file is included in the sanitized push to the public oversight repo.

---

## Packet — 2026-07-06

**Sprint closed:** 385  
**Milestone active:** 400–409 Drawing Intelligence Phase C — Visual Revision Compare (2/10, 20%)  
**Next sprint:** 386 queued — pipeline stage badge + AI panel label hint  
**Validation:** Sprint Validation 3/3 consecutive green (14/0/2 per run, network/console clean) · regression suite unchanged green

### Summary

Sprint 385 delivered Phase C visual revision compare Phase D playback row and commercial workflow stage filtered badge via `sprint-385-selftest.ts`. Decision Timeline expandable playback surfaces left/right revision IDs, compare mode, and enterprise_drawing commercial-stage label (`decision-timeline-phase-c-revision-compare-playback-row` · `decision-timeline-phase-c-revision-compare-commercial-workflow-stage`). Operational workspace AI panel entry count indicator (`operational-workspace-ai-panel-phase-c-revision-compare-entry-count`) wired through `phaseCRevisionCompareTimelineEntryCount`. Milestone 400–409 active at 2/10; Sprint 386 queued for pipeline stage badge + AI panel label hint. Cross-project learning loop (Finding 6) remains undemonstrated as a chained acceptance scenario.

### Current sprint state

| Field | Value |
|---|---|
| **currentSprint** | 385 closed (2026-07-06) |
| **nextSprint** | 386 queued — pipeline stage badge + AI panel label hint |
| **Milestone progress** | 400–409 at 2/10 (20%) · Sprint 385 delivered |
| **Prior milestone** | 390–399 Pin Re-anchor & Carry-forward closed Sprint 383 |

### Validation summary

- Sprint Validation 3/3 consecutive green (14 passed / 0 failed / 2 deferred per run)
- Network clean · console clean
- `sprint-385-selftest.ts` PASSED (playback row · commercial workflow stage · AI panel entry count · workspace hydrate)

### Stream delivery

**Stream 1 (UX):** Decision Timeline Phase C visual revision compare Phase D playback row + commercial workflow stage filtered badge + Phase D playback commercial-stage line

**Stream 2 (Platform):** Operational workspace AI panel Phase C visual revision compare timeline entry count indicator (`phaseCRevisionCompareTimelineEntryCount`)

### Open findings (unchanged)

- Finding 2 — drawing revision provenance gap (partially addressed; C3 compare telemetry live Sprint 384; Phase D playback Sprint 385)
- Finding 4 — platform certification stale (170+ sprints since 5/5)
- Finding 6 — cross-project learning loop undemonstrated

### Next sprint preview (386)

- Stream 1: Decision Timeline Phase C visual revision compare pipeline stage filtered badge + Phase D playback pipeline-stage label
- Stream 2: Operational workspace AI panel Phase C visual revision compare label hint
- Selftest: `scripts/sprint-386-selftest.ts`

### Sprint 385 changed files

- `src/platform/workspace/decisionTimelineBuilder.ts`
- `src/components/workspace/DecisionTimeline.tsx`
- `src/components/workspace/OperationalWorkspace.tsx`
- `src/components/workspace/OperationalWorkspaceHost.tsx`
- `scripts/sprint-385-selftest.ts`

---

*Generated at sprint close-out. Sanitized before public push.*
