# Data Model

**Governing reference:** [`CCC_ARCHITECTURE.md`](./CCC_ARCHITECTURE.md)

---

## Principle

**Parse once → shared `ci_*` only.**

All modules (drawings, QA/ITP, commercial, weather signals, assistant context) read from the shared Construction Intelligence data plane. Feature work must not introduce parallel stores that duplicate parse outputs.

---

## Layers

| Layer | Contents | Notes |
|-------|----------|-------|
| Shared CI (`ci_*`) | Canonical parsed / enriched records | Source of truth for intelligence |
| Knowledge Graph | Entities, relations, evidence | Structural; cites `ci_*` |
| Digital Brain | Events, memory, timelines | Project-scoped narrative |
| Governed Knowledge | Promoted, policy-filtered knowledge | Only path A→B |
| Product projections | UI/API views | Derived; not alternate truth |

---

## Migration posture (architecture view)

- Schema changes belong in delivery migrations with owner gates where required.
- Demo role-switch (migration 034) remains feature-branch scoped; incomplete owner steps are not architecture reopen triggers.
- Production ACL / public asset posture is security-critical (see [`SECURITY.md`](./SECURITY.md)).

---

## Package requirements

Work packages must specify:

- Tables / entities touched
- Whether writes are into shared `ci_*` vs projections
- Migration IDs if any
- Rollback / data-integrity risks
