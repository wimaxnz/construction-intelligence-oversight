# AI Oversight — Review Requests

**Status:** Active monitoring — hard completion target Sunday 12 July 2026 (`hardCompletionDirective` in `AI_OVERSIGHT_STATE.json`).

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

### Request — 2026-07-06

**Topic:** Hard completion directive monitoring (Sunday 12 July 2026)  
**Context:** Sprint 378 closed; milestone 390–399 Pin Re-anchor at 5/10; governance repair after audit 2152971d; `hardCompletionDirective` added to canonical state with `status: at_risk`  
**Question:** On each hourly oversight sync, confirm public repo reflects local canonical state and report progress against pass/fail gates: (1) Finding 6 chained acceptance scenario, (2) migration 015 staging verification, (3) platform certification 5/5 re-run, (4) oversight bridge remote callable OR documented deferral  
**Urgency:** before-milestone-close  
**Suggested reviewer focus:** roadmap | architecture | governance
