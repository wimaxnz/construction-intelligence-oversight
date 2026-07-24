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

## Package checklist

- [ ] Entities/edges named and scoped
- [ ] Evidence / citation path defined
- [ ] No silo tables introduced
- [ ] A→GK→B verified or explicitly N/A (in-project only)
- [ ] Digital Brain events remain project-scoped unless promotion is declared
