# Architecture Office — Vision

**Role:** Independent architecture governance for Construction Command Centre (CCC) / Construction Intelligence Platform.  
**Repo:** [`wimaxnz/construction-intelligence-oversight`](https://github.com/wimaxnz/construction-intelligence-oversight)  
**Governing reference:** [`CCC_ARCHITECTURE.md`](./CCC_ARCHITECTURE.md)

---

## Purpose

The Architecture Office maintains durable, machine-checkable architecture doctrine **outside** the delivery codebase so engineering can continue without merge conflicts, while oversight remains coherent with the published sprint/milestone state.

This layer **does not gate sprints**. It advises, records approved packages, and fail-closes publication of contradictory architecture metadata.

---

## Anchors (do not invent conflicting doctrine)

| Doctrine | Rule |
|----------|------|
| Parse once | Shared `ci_*` tables only — no siloed parsers or duplicate stores |
| Cross-project learning | **A → Governed Knowledge → B only** — never Memory-only A→B; never direct A→B |
| Sprint 521 | AI / IP processing is **server-side** |
| Weather | **One-active weather** constraint |
| Production gate | **CLOSED** unless a genuine production defect is proven |
| CIP / ITP | Continuous ITP floors ongoing; ITP Library → CI Engine is a **parallel** stream |
| Demo role-switch | Feature branch (migration 034); owner steps may remain |
| Blank-page prod fix | ACL `mask::---` on `public/assets`; `ccc-fix-public-acls` mandatory post-deploy |

---

## Relationship to AI Oversight Protocol

Architecture Office **links to** — it does not replace — the existing oversight loop:

- Protocol: [`../AI_OVERSIGHT_PROTOCOL.md`](../AI_OVERSIGHT_PROTOCOL.md)
- Canonical machine state: [`../AI_OVERSIGHT_STATE.json`](../AI_OVERSIGHT_STATE.json)
- Human packet: [`../OVERSIGHT_PACKET.md`](../OVERSIGHT_PACKET.md)
- Sync / publication: [`../OVERSIGHT_SYNC.md`](../OVERSIGHT_SYNC.md)

Sprint close-out, finding ingest, and sanitised push/pull remain owned by the AI Oversight Protocol. Architecture Office publishes package/review/status artefacts under `architecture/` and must pass Architecture Office publication guards before those artefacts are considered publishable.

---

## Non-interruption rule

Architecture governance **must not** stop, pause, or delay active CIP, production, Knowledge Graph, Digital Brain, QA/ITP, or other engineering tasks in the CCC app repository. Work here is oversight-only.
