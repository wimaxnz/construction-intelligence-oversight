# AI Oversight — Review Requests

**Status:** Active completion directive and review request, 2026-07-06.

Independent review is optional and non-blocking. File a request here only when architectural, product, construction-domain, commercial, or roadmap perspective would add value beyond sprint self-tests.

---

## How to file a request

1. Copy the template below into a new dated section.
2. Update `AI_OVERSIGHT_STATE.json` → note the request in `openRisks` or a custom field if urgent.
3. Continue sprint execution — do not wait for response.

### Request template

```markdown
## Request — YYYY-MM-DD

**Topic:**
**Context:** (sprint/milestone, relevant docs)
**Question:** (specific decision or review ask)
**Urgency:** advisory | before-milestone-close | security/data-integrity
**Suggested reviewer focus:** architecture | product | construction | commercial | roadmap
```

---

## Active requests

## Request — 2026-07-06

**Topic:** Hard end-of-week functional completion plan

**Context:** Owner target is full critical platform completion no later than Sunday, 2026-07-12. Latest observed state reports Sprint 330 closed and the Commercial Intelligence Future Project Knowledge Reuse milestone at approximately 70%, while Finding 8 identifies insufficient end-to-end integration evidence and a presentation-heavy delivery pattern.

**Question:** Replan the remaining execution path immediately around functional platform completion rather than presentation parity. Provide and execute the shortest credible critical path to complete the integrated platform by 2026-07-12, explicitly showing what will be completed, validated, deferred as non-critical polish, or declared impossible with evidence.

**Urgency:** before-milestone-close

**Suggested reviewer focus:** architecture | product | construction | commercial | roadmap

### Owner completion directive

Treat Sunday, 2026-07-12 as the hard target for completion of all critical platform capabilities. Preserve autonomous execution and green validation, but stop spending isolated sprint capacity on additional badges, labels, hints, playback rows, viewer chrome, or presentation parity unless directly required by a critical end-to-end acceptance path.

Prioritize, in critical-path order:

1. Project A evidence produces governed reusable knowledge.
2. Exact evidence and drawing-revision provenance is persisted and queryable.
3. Knowledge Graph relationships connect project, evidence, revision, trade/discipline/system applicability, reviewer authority, lineage, supersession, future-project application, and outcome feedback.
4. Authorized review and permission boundaries are enforced.
5. Superseded source revisions trigger revalidation or invalidation behavior.
6. Project B similarity/context retrieval applies Project A knowledge under correct tenant/project isolation.
7. The system proactively warns or recommends action, rather than only replaying timeline events.
8. User accept, dismiss, or modify outcomes feed confidence evolution and future reuse.
9. Digital Brain, Construction Memory, Commercial Intelligence, and Knowledge Graph provide one auditable chain.
10. Migration/RLS risks have owner, target environment, verification evidence, rollback path, and production gate.
11. End-to-end regression and platform certification are rerun against the completed baseline.
12. Milestone metadata and public oversight state pass cross-field consistency checks.

### Acceptance rule

Do not count the platform as complete merely because sprint count, milestone percentage, UI parity, event contracts, timeline playback, or self-tests are green. Completion requires working end-to-end integration evidence for the critical intelligence loop and production-relevant governance.

### Required response

At the next close-out, record:

- critical-path plan to 2026-07-12
- capability-by-capability status: done | in progress | blocked | deferred non-critical
- named blockers and dependencies
- end-to-end proof artifacts
- remaining production risks
- explicit confirmation whether the 2026-07-12 target is credible

Continue execution without waiting for further oversight response.
