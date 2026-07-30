# CCC Architecture — Governing Reference

**Status:** Governing architecture reference for Construction Command Centre (CCC).  
**Last aligned:** 2026-07-30  
**Canonical runtime state:** [`../AI_OVERSIGHT_STATE.json`](../AI_OVERSIGHT_STATE.json)  
**Protocol:** [`../AI_OVERSIGHT_PROTOCOL.md`](../AI_OVERSIGHT_PROTOCOL.md)

> All Architecture Office packages, reviews, and status summaries MUST remain consistent with this document and with published oversight state. Conflicts fail closed (see publication guards).

---

## 1. System intent

CCC is a construction intelligence platform: drawings, QA/ITP, commercial workflows, weather/risk signals, and cross-project learning share one parse-once data plane and one governed knowledge path.

Architecture Office reviews **direction and coherence**. Day-to-day sprint implementation remains in the private delivery repo and is non-blocking relative to this office.

---

## 2. Non-negotiable doctrine

### 2.1 Parse once / shared `ci_*` only

- Ingest and enrichment write into shared Construction Intelligence tables (`ci_*`).
- No feature-local silos that re-parse the same artefacts into private stores.
- Downstream modules consume shared entities; they do not fork truth.

### 2.2 Cross-project learning: A → Governed Knowledge → B

| Allowed | Forbidden |
|---------|-----------|
| Project A → **Governed Knowledge** → Project B | Memory-only A→B |
| Governed promotion with review / policy | Direct A→B transfer of project memory |

Digital Brain / Memory may support **within-project** recall. Cross-project reuse requires the Governed Knowledge path only.

### 2.3 Sprint 521 — AI / IP server-side

AI and intellectual-property–sensitive processing runs **server-side**. Client surfaces consume results; they do not host the protected processing path.

### 2.4 One-active weather

At most one active weather context drives scoring / ops signals for a given project scope. Competing concurrent weather actives are an architecture defect.

### 2.5 Production gate

Production gate is **CLOSED** unless a **genuine production defect** is proven with evidence. Roadmap “complete” / UAT Ready does not authorise speculative production churn.

Published oversight position (as of last sync): production acceptance on the permanent host was recorded in `AI_OVERSIGHT_STATE.json` / `OVERSIGHT_PACKET.md`. Architecture Office treats further production change as defect-driven only.

### 2.6 CIP / ITP continuous streams

- Continuous ITP floors remain an **ongoing** CIP concern.
- ITP Library → CI Engine is a **parallel** stream — not a replacement for floors, and not a reason to pause other validated work.

### 2.7 Demo role-switch (migration 034)

Demo role-switch lives on a **feature branch** (migration 034). Owner follow-up steps may remain; do not treat incomplete owner steps as licence to reopen closed autonomous roadmap milestones.

### 2.8 Blank-page production defect (resolved pattern)

Proven blank-page defect remediation:

- ACL `mask::---` on `public/assets`
- Post-deploy: `ccc-fix-public-acls` is **mandatory**

Regressions of this class are genuine production defects and may reopen the production gate.

---

## 3. Logical architecture

```text
Ingest / Parse-once
        │
        ▼
   Shared ci_* plane
        │
        ├── Knowledge Graph (entities, relations, citations)
        ├── Digital Brain (events, memory, decision timeline — project-scoped)
        ├── QA / ITP / CIP floors + ITP Library → CI Engine (parallel)
        └── Product surfaces (drawings, ops, commercial, weather signals)
                │
                ▼
        Governed Knowledge (promotion + policy)
                │  permanent store: ci_governed_knowledge
                │  Edge promote: ai-orchestrator ci_learning_promote
                ▼
        Cross-project reuse (A → GK → B only)
```

**Finding 8 (closed):** `project-kg-persist` is **not** an active production Edge service (HTTP 404; never deployed). It is obsolete as a production dependency for governed knowledge. Permanent GK persistence is `ai-orchestrator` → `ci_governed_knowledge` (+ consumptions). Drawing-KG soft-writes use orchestrator `kgSoftWrite` / client RLS upsert. See [`KNOWLEDGE_GRAPH.md`](./KNOWLEDGE_GRAPH.md) and [`EVIDENCE/FINDING8_PROJECT_KG_PERSIST_ARCHITECTURE.json`](./EVIDENCE/FINDING8_PROJECT_KG_PERSIST_ARCHITECTURE.json).

---

## 4. Component map

| Layer | Responsibility | Architecture docs |
|-------|----------------|-------------------|
| Data plane | Shared `ci_*`, no silos | [`DATA_MODEL.md`](./DATA_MODEL.md) |
| Knowledge Graph | Entities, edges, evidence | [`KNOWLEDGE_GRAPH.md`](./KNOWLEDGE_GRAPH.md) |
| Digital Brain | Events, memory, timelines | [`DIGITAL_BRAIN.md`](./DIGITAL_BRAIN.md) |
| Security | AuthZ, ACL, IP, publish hygiene | [`SECURITY.md`](./SECURITY.md) |
| Roadmap posture | Gate, streams, packages | [`ROADMAP.md`](./ROADMAP.md) |

---

## 5. Delivery vs oversight

| Concern | Owner |
|---------|-------|
| Sprint execution & validation | CCC delivery repo (private) |
| Sanitised state publication | `scripts/sync-ai-oversight.*` → this repo root |
| Architecture packages / reviews | `architecture/` (this folder) |
| Finding ingest | `.github/workflows/oversight-ingest.yml` + bridge |

Architecture Office artefacts are **additive**. They must not break existing allowlisted oversight sync for root protocol files.

---

## 6. Change control

1. Propose package in [`NEXT_WORKPACKAGE.md`](./NEXT_WORKPACKAGE.md) on **`main`**.
2. When status is `approved`, path-filtered GitHub Actions may dispatch the Cursor Automation webhook (see [`DELIVERY.md`](./DELIVERY.md)).
3. Implement in delivery repo **without** pausing other active streams (CCC via PR; do not fight CIP).
4. Complete review using the review template → [`REVIEWS/`](./REVIEWS/).
5. Archive completed package → [`WORKPACKAGES/`](./WORKPACKAGES/).
6. Refresh [`ARCHITECTURE_STATE.json`](./ARCHITECTURE_STATE.json) and [`STATUS/`](./STATUS/); advance next package or queued sentinel.
7. Publish only if Architecture Office guards pass (and existing oversight publication guards remain green for root state).

---

## 7. Authority

When documents disagree:

1. **Proven production defect evidence** (for gate reopen)  
2. **`AI_OVERSIGHT_STATE.json`** (canonical sprint/milestone/owner position)  
3. **This governing reference** (`CCC_ARCHITECTURE.md`)  
4. Package / status narratives  

Narrative docs never override machine-readable contradictory fields; publication must fail closed.
