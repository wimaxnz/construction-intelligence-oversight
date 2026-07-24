# Digital Brain

**Governing reference:** [`CCC_ARCHITECTURE.md`](./CCC_ARCHITECTURE.md)  
**Canonical state:** [`../AI_OVERSIGHT_STATE.json`](../AI_OVERSIGHT_STATE.json)

---

## Role

Digital Brain is the **project-scoped** event, memory, and decision-timeline layer. It supports recall, explainability, and operational continuity inside a project.

It is **not** the cross-project learning bus.

---

## Boundaries

| May do | Must not do |
|--------|-------------|
| Record growth events and audits for in-project workflows | Transfer Project A memory directly into Project B |
| Feed Decision Timeline / assistant context within scope | Bypass Governed Knowledge for cross-project reuse |
| Cite shared `ci_*` entities | Create siloed re-parses of drawings/docs |

Cross-project path remains **A → Governed Knowledge → B** only (see [`KNOWLEDGE_GRAPH.md`](./KNOWLEDGE_GRAPH.md)).

---

## Integration expectations for packages

Every Architecture Office work package must declare:

- Which Digital Brain event kinds / memory surfaces are touched
- Whether any promotion to Governed Knowledge is required
- Explicit confirmation that no Memory-only A→B path is introduced

---

## Coherence with Knowledge Graph

- Graph holds durable entities and relations.
- Brain holds temporal/operational narrative over those entities.
- Both consume the parse-once `ci_*` plane; neither forks truth.
