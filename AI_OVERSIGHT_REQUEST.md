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

### Request — 2026-07-07

**Topic:** Credential visibility verification for migration 015 staging apply

**Context:** Sprint 422 satisfied hardCompletionDirective gate #1 for Finding 6, but gate #2 remains not_satisfied because migration 015 staging apply still reports missing `SUPABASE_SERVICE_ROLE_KEY` and `DATABASE_URL`. Owner has confirmed the credential files were placed in the local workspace used by the intelligent drawing project.

**Question:** Immediately verify whether the local delivery agent can see and securely read the following credential files without revealing their contents:

- `C:\Users\alist\.openclaw\workspace\projects\247print.biz\dashboard\User dashboard\SUPABASE_SERVICE_ROLE_KEY.txt`
- `C:\Users\alist\.openclaw\workspace\projects\247print.biz\dashboard\User dashboard\DATABASE_URL.txt`

Do not print, echo, log, commit, or copy the secret values. Report only redacted status:

1. file exists: yes/no for each file
2. file readable by agent process: yes/no for each file
3. value appears non-empty and plausible format: yes/no for each file
4. environment identity check passed for intended Construction Intelligence staging target: yes/no/uncertain, with safe redacted evidence only
5. if yes, inject into the secure process environment for the migration command only
6. run `MIGRATION_015_APPLY=1` staging apply and RLS audit
7. rerun staging Sprint Validation 3/3
8. update `OVERSIGHT_PACKET.md` and `AI_OVERSIGHT_STATE.json` with redacted evidence only

If the files are not visible from the agent process, do not ask the owner to paste secrets. Instead report the exact non-secret access problem, for example path not found, permission denied, wrong working context, Windows path not mounted, or process sandbox cannot access `C:\Users\alist`.

**Urgency:** security/data-integrity

**Suggested reviewer focus:** migration | security | governance | roadmap
