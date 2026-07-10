# Oversight Bridge — Threat Model

**Scope:** Automated write path from independent ChatGPT oversight → `wimaxnz/construction-intelligence-oversight` only. The delivery repo (`construction-command-centre`) has **no inbound write endpoint**.

**Last updated:** 2026-07-05

---

## Assets

| Asset | Location | Sensitivity |
|-------|----------|-------------|
| Inbound findings | `AI_OVERSIGHT_INBOX.json`, `AI_OVERSIGHT_RESPONSE.md` | Public advisory (oversight repo) |
| Bridge audit log | `bridge-audit.jsonl` (oversight repo root) | Integrity / forensics |
| Ingest HMAC secret | GitHub Secret `OVERSIGHT_INGEST_HMAC` (oversight repo only) | **High** |
| Relay API key | Cloudflare Worker secret `OVERSIGHT_RELAY_API_KEY` | **High** |
| GitHub dispatch PAT | Cloudflare Worker secret `GITHUB_DISPATCH_PAT` (oversight repo only) | **High** |
| GitHub token (Actions) | Ephemeral `GITHUB_TOKEN` in workflow | Scoped to oversight repo |
| Delivery codebase | `construction-command-centre` | **Must not be writable by bridge** |

---

## Trust boundaries

```
[ ChatGPT Custom GPT Action ]
        │ HTTPS POST /v1/findings (Bearer OVERSIGHT_RELAY_API_KEY)
        ▼
[ Cloudflare Worker relay — external, not in either repo ]
        │ validate · sanitize · rate-limit · idempotency
        │ HMAC + repository_dispatch
        ▼
[ ChatGPT / external caller with PAT — optional bypass ]
        │ repository_dispatch + HMAC
        ▼
[ oversight-ingest.yml @ construction-intelligence-oversight ]
        │ validate · sanitize · idempotency · rate limit
        ▼
[ Fixed files: INBOX + RESPONSE + audit log ]
        │ git pull (local sync, outbound from delivery)
        ▼
[ construction-command-centre docs/ai-oversight/ ]
        │ consume-oversight-findings.ts (read-only triage)
        ▼
[ AI_OVERSIGHT_STATE.json oversightFindingsState ]
```

---

## Threats and mitigations

### Authentication

| Threat | Mitigation |
|--------|------------|
| Unauthenticated relay POST | Bearer `OVERSIGHT_RELAY_API_KEY`; missing/invalid → 401 |
| Unauthenticated ingest | `repository_dispatch` requires repo-scoped PAT or GitHub App; HMAC over payload body verified against `OVERSIGHT_INGEST_HMAC` |
| Stolen relay API key | Rate limit 10/hour; rotate key; relay cannot target other repos (fixed dispatch URL) |
| Stolen PAT with write access | Fine-grained PAT limited to **oversight repo only**; rotate on compromise; never store in main repo |
| Spoofed dispatch | HMAC-SHA256(`payload`, secret); mismatch → workflow fails closed |

### Authorization

| Threat | Mitigation |
|--------|------------|
| Write to delivery repo | **No bridge in main repo**; workflow exists only in oversight repo template |
| Arbitrary file write | `append-finding.ts` writes **only** `AI_OVERSIGHT_INBOX.json` and `AI_OVERSIGHT_RESPONSE.md` at fixed paths |
| Path traversal in payload | Forbidden field names (`path`, `repo`, `file`, …); prompt-injection path patterns stripped |
| Branch protection bypass | PR model: ingest commits to `oversight/inbox/{findingId}`; merge requires human or protected-branch rules |

### Replay

| Threat | Mitigation |
|--------|------------|
| Duplicate submission | `findingId` idempotency via append-only audit log; duplicate → exit 2, no write |
| Replayed dispatch | Same `findingId` rejected; timestamp logged but not used as nonce (idempotency key is `findingId`) |

### Idempotency

- Primary key: `findingId` (stable, caller-assigned)
- Audit events: `ingest_accepted`, `ingest_duplicate`, `ingest_rejected`, `ingest_rate_limited`
- Re-ingest with same ID updates inbox entry in place (local CLI only after audit reset); production workflow treats duplicate as no-op

### Rate limiting

- **10 accepts / hour / source** (`independent-oversight`) counted from audit log
- Excess → `ingest_rate_limited`, HTTP workflow failure
- Abuse from compromised token limited to oversight repo file churn

### Payload validation

- JSON max **8192 bytes**
- Fixed schema; unknown fields rejected
- Enums: `severity`, `category`, `source`
- Max lengths: title 120, text fields 2000, findingId 64
- **No** `repo`, `path`, `command`, `shell`, `branch`, `token`, etc.

### Sanitization

- Reuses `oversight-sanitize.ts` scrub rules (secrets, PII, commercial figures)
- Prompt-injection phrases stripped and logged (`ingest_injection_stripped`)
- High-risk patterns after scrub → blocked unless `--allow-high-risk` (local debug only)

### Audit

- Append-only JSONL: `bridge-audit.jsonl`
- Every accept/reject/duplicate/rate-limit/injection event recorded with `eventId`, ISO timestamp
- No PII in audit `details` beyond finding metadata

### Rollback

1. Revert PR or commit on oversight repo `main`
2. Remove finding from `AI_OVERSIGHT_INBOX.json` manually if merged in error
3. Update `AI_OVERSIGHT_STATE.json` `oversightFindingsState` disposition
4. Audit log is append-only — record manual rollback as new local note (do not delete history)

### Secrets handling

- **Never** commit `OVERSIGHT_INGEST_HMAC`, PATs, or tokens to either repo
- Secrets live in GitHub Actions secrets on **oversight repo only**
- Sanitizer blocks accidental secret paste in finding text

### Branch protection

- Recommended on `main`: require PR review for ingest branches
- Workflow creates PR from `oversight/inbox/{findingId}`; auto-merge optional after human policy

### Abuse scenarios

| Scenario | Impact | Response |
|----------|--------|----------|
| Token flood | Oversight repo spam PRs | Rate limit + revoke PAT + branch protection |
| Large payloads | Workflow CPU | 8 KB cap, early reject |
| Injection in evidence | None (text only, stripped) | Logged, never executed |
| Malicious findingId churn | Many branches | Rate limit; findingId format validation |

### Public endpoint exposure

- **No public HTTP endpoint** on delivery infrastructure (`construction-command-centre`)
- **HTTPS relay** on Cloudflare Workers — single fixed route POST `/v1/findings`; no repo/path/shell selection; secrets in Worker env only
- GitHub `repository_dispatch` is authenticated GitHub API, not anonymous internet POST
- Option B (Supabase Edge) **not implemented** — would expand attack surface on main repo

### GitHub scope

- PAT / App permissions: **Contents: write**, **Actions: read**, **Metadata: read** on oversight repo only
- No access to `construction-command-centre`, org secrets, or other repos

### Failure behavior

| Failure | Behavior |
|---------|----------|
| Validation error | Workflow fails; `ingest_rejected` in audit; no file change |
| Duplicate | Exit 2; workflow may fail (no duplicate commit) |
| Rate limit | Exit 3; workflow fails |
| High-risk after scrub | Blocked; workflow fails |
| HMAC missing/wrong | Workflow fails before ingest |
| Merge conflict on PR | Human resolves; sprint unaffected |

### Duplicates

- Same `findingId` → duplicate event, no second inbox row
- Pull + consume in delivery repo: `oversightFindingsState` keyed by `findingId`, skips known IDs

---

## Residual risks

1. **Compromised oversight-repo write token** — attacker can spam findings (not delivery code). Mitigate with rate limits, PAT rotation, branch protection.
2. **Compromised relay API key** — attacker can submit findings within rate limit (same impact as PAT). Mitigate with key rotation and relay audit (KV).
3. **ChatGPT path** — requires relay deploy + Custom GPT Action; see [`templates/oversight-relay/README.md`](./templates/oversight-relay/README.md).
3. **Human merge of bad finding** — advisory only; triage in `consume-oversight-findings.ts` does not auto-change sprint scope.

---

## Out of scope

- Weakening Phase B gates or Sprint Validation
- Write access to `construction-command-centre` from external AI
- Executing finding `recommendedAction` automatically
