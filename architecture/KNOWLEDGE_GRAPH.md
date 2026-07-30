# Knowledge Graph

**Governing reference:** [`CCC_ARCHITECTURE.md`](./CCC_ARCHITECTURE.md)  
**Canonical state:** [`../AI_OVERSIGHT_STATE.json`](../AI_OVERSIGHT_STATE.json)

---

## Role

The Knowledge Graph stores construction entities, relations, and evidence links derived from the shared `ci_*` plane. It is the structural backbone for citations, drawing intelligence, and governed promotion.

---

## Cross-project learning (mandatory)

```text
Project A ──promote──► Governed Knowledge ──apply──► Project B
```

**Forbidden:**

- Memory-only A→B
- Direct A→B entity/memory copy without Governed Knowledge

Architecture reviews must verify **Project A → Governed Knowledge → Project B** coherence on every package that claims cross-project value.

---

## Parse-once alignment

- Graph nodes/edges reference shared CI entities; they do not re-ingest source PDFs into private tables.
- Persistence flags (for example remote KG persist in delivery) must not imply a second parse pipeline.

---

## Finding 8 — `project-kg-persist` disposition (2026-07-30)

**Verdict: RETIRED as a production Edge dependency** (never deployed; HTTP 404 on production ref `aybovjvmyqexgpmhedni`).

`project-kg-persist` is **not** the governed-knowledge persistence path and must not be treated as an active production service.

| Concern | Production path |
|---------|-----------------|
| Permanent governed knowledge | `ai-orchestrator` action `ci_learning_promote` (`confirm:true`) → `ci_governed_knowledge` + `ci_governed_knowledge_consumptions` |
| Drawing / revision KG soft-write | `ai-orchestrator` `kgSoftWrite` → `project_kg_nodes` / `project_kg_edges` |
| Client KG upsert fallback | RLS upsert via delivery `projectKnowledgeGraphSupabaseAdapter` (opt-in persist flags) |
| Optional Edge helper | `project-kg-persist` source may remain behind `VITE_PROJECT_KG_EDGE_WORKER=1` — **not deployed**; not required |

Evidence: [`EVIDENCE/FINDING8_PROJECT_KG_PERSIST_ARCHITECTURE.json`](./EVIDENCE/FINDING8_PROJECT_KG_PERSIST_ARCHITECTURE.json)

---

## Package checklist

- [ ] Entities/edges named and scoped
- [ ] Evidence / citation path defined
- [ ] No silo tables introduced
- [ ] A→GK→B verified or explicitly N/A (in-project only)
- [ ] Digital Brain events remain project-scoped unless promotion is declared
- [ ] Do not require `project-kg-persist` Edge for GK or production KG soft-write
