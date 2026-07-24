# AO-WP-001 — Architecture Office bootstrap and publication guards

**Status:** completed  
**Completed:** 2026-07-25  
**Review:** [`../REVIEWS/AO-REV-001-architecture-office-guards.md`](../REVIEWS/AO-REV-001-architecture-office-guards.md)

---

## Objective

Establish durable Architecture Office artefacts and fail-closed publication guards in `wimaxnz/construction-intelligence-oversight` without interrupting active CCC engineering.

## Business value

Independent architecture governance aligned with published oversight state, preventing contradictory roadmap publication while engineering continues.

## Scope

**In scope:** `architecture/` tree; `scripts/architecture-office-guard.mjs`; GitHub workflow; protocol/README links.  
**Out of scope:** CCC app source changes; reopening Sprint 1616; weakening root oversight sanitisation.

## Architecture

`CCC_ARCHITECTURE.md` governing reference; doctrine encoded in machine state.

## Database

N/A.

## API

Guard CLI only.

## UI

N/A.

## Knowledge Graph integration

Doctrine + review checklist only.

## Digital Brain integration

Doctrine + review checklist only.

## Security

Fail-closed guards for empty/invalid `ARCHITECTURE_STATE.json`, contradictory roadmap metadata, and NEXT package conflicts.

## Dependencies

Canonical `AI_OVERSIGHT_STATE.json` and existing oversight protocol.

## Risks

Mitigated by oversight-only worktree and additive files.

## Acceptance criteria

Met — structure, state JSON, guards, workflow, non-interruption.

## Validation

`node scripts/architecture-office-guard.mjs` and `--selftest`.

## Evidence required

Guard PASS transcripts; commit/PR on oversight remote.
