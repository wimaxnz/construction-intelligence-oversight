# AI Oversight — Close-out Packet

**Status:** Active — Sprint 386 close-out for milestone 400–409 Visual Revision Compare (3/10).

This file is included in the sanitized push to the public oversight repo.

---

## Packet — 2026-07-06

**Sprint closed:** 386  
**Milestone active:** 400–409 Drawing Intelligence Phase C — Visual Revision Compare (3/10, 30%)  
**Next sprint:** 387 queued — project assistant context engine wiring + AI panel context availability  
**Validation:** Sprint Validation 3/3 consecutive green (14/0/2 per run, network/console clean) · regression suite unchanged green

### Summary

Sprint 386 delivered Phase C visual revision compare pipeline stage filtered badge and Phase D playback pipeline-stage label via `sprint-386-selftest.ts`. Decision Timeline filter scope surfaces Takeoff pipeline stage (`decision-timeline-phase-c-revision-compare-pipeline-stage` · `decision-timeline-phase-c-revision-compare-playback-pipeline-stage`). Operational workspace AI panel label hint (`operational-workspace-ai-panel-phase-c-revision-compare-label-hint`) wired through `distinctPhaseCRevisionCompareLabels` · `formatDistinctPhaseCRevisionCompareLabelHint`. Milestone 400–409 active at 3/10; Sprint 387 queued for project assistant context engine wiring. Cross-project learning loop (Finding 6) remains undemonstrated as a chained acceptance scenario.

### Current sprint state

| Field | Value |
|---|---|
| **currentSprint** | 386 closed (2026-07-06) |
| **nextSprint** | 387 queued — project assistant context engine wiring + AI panel context availability |
| **Milestone progress** | 400–409 at 3/10 (30%) · Sprint 386 delivered |
| **Prior milestone** | 390–399 Pin Re-anchor & Carry-forward closed Sprint 383 |

### Validation summary

- Sprint Validation 3/3 consecutive green (14 passed / 0 failed / 2 deferred per run)
- Network clean · console clean
- `sprint-386-selftest.ts` PASSED (pipeline stage badge · playback pipeline-stage line · AI panel label hint)

### Stream delivery

**Stream 1 (UX):** Decision Timeline Phase C visual revision compare pipeline stage filtered badge + Phase D playback pipeline-stage label

**Stream 2 (Platform):** Operational workspace AI panel Phase C visual revision compare label hint (`distinctPhaseCRevisionCompareLabels` · `formatDistinctPhaseCRevisionCompareLabelHint`)

### Open findings (unchanged)

- Finding 2 — drawing revision provenance gap (partially addressed; C3 compare telemetry live Sprint 384; pipeline stage + label hint Sprint 386)
- Finding 4 — platform certification stale (170+ sprints since 5/5)
- Finding 6 — cross-project learning loop undemonstrated

### Next sprint preview (387)

- Stream 1: Operational workspace AI panel Phase C visual revision compare context availability surfacing from project assistant context
- Stream 2: Project assistant context engine Phase C visual revision compare timeline entry count + label hint wiring
- Selftest: `scripts/sprint-387-selftest.ts`

### Sprint 386 changed files

- `src/platform/workspace/decisionTimelineBuilder.ts`
- `src/components/workspace/DecisionTimeline.tsx`
- `src/components/workspace/OperationalWorkspace.tsx`
- `scripts/sprint-386-selftest.ts`

---

*Generated at sprint close-out. Sanitized before public push.*
