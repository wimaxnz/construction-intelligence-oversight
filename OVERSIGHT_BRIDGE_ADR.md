# ADR: Oversight Write Bridge Architecture

**Status:** Accepted  
**Date:** 2026-07-05  
**Decision makers:** Platform engineering (autonomous sprint infrastructure)

---

## Context

Independent ChatGPT oversight reviews sanitized state published to `wimaxnz/construction-intelligence-oversight`. Findings today require **manual copy/paste** into `AI_OVERSIGHT_RESPONSE.md`. External ChatGPT integrations receive **HTTP 403** on direct GitHub writes to the oversight repo.

Constraints:

- Main repo (`construction-command-centre`) must **not** expose inbound writes to external callers
- Phase B gates and sprint execution remain unchanged (oversight is advisory)
- Smallest viable automation preferred

---

## Decision

**Option A — GitHub Actions workflow in the oversight repo only** (selected)

Implement `oversight-ingest.yml` deployed to `construction-intelligence-oversight`, triggered by `repository_dispatch` (type: `oversight-finding`) with HMAC-authenticated payload. Shared validation/sanitize/append logic lives in `scripts/oversight-bridge/` in the main repo as **templates** copied to the oversight repo on bootstrap.

**Option C — HTTPS relay layer (Cloudflare Worker)** (selected for ChatGPT)

External callers (ChatGPT Custom GPT Actions) invoke **POST /v1/findings** on a user-deployed Cloudflare Worker. The relay:

- Authenticates via Bearer `OVERSIGHT_RELAY_API_KEY` (separate from HMAC)
- Validates/sanitizes using the same schema as `validate-payload.ts`
- Rate-limits (10/hour) and idempotency by `findingId`
- HMAC-signs and calls `repository_dispatch` on **oversight repo only**

Template: `docs/ai-oversight/templates/oversight-relay/`. Does not touch `construction-command-centre` runtime or secrets in git.

**Option B — Supabase Edge Function in main repo** (rejected)

The project has Supabase edge patterns for drawing import, but adding a POST handler on delivery infrastructure would:

- Expose the main repo deployment to external callers
- Require new secrets, WAF, and ops in the production-adjacent stack
- Violate the narrow-bridge requirement

Option B is documented for completeness only; not implemented.

---

## Alternatives considered

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **A: GH workflow (oversight repo)** | No main-repo exposure; uses GitHub auth; PR review model | Requires PAT + bootstrap | **Selected** |
| **C: HTTPS relay (CF Worker)** | ChatGPT-callable HTTPS; no GitHub creds in ChatGPT; fixed endpoint | Deploy + 3 secrets; CF account | **Selected (ChatGPT path)** |
| **B: Edge function (main repo)** | HTTP familiar to ChatGPT Actions | Broadens attack surface | Rejected |
| **Direct GitHub write from ChatGPT** | Simple | 403 today; no fine-grained control | Rejected |
| **Email / manual paste** | Zero infra | Error-prone, not automated | Status quo (replaced) |
| **PR-only without workflow** | Human in loop | Still manual | Partial (PR model kept inside A) |

---

## Architecture

```
ChatGPT Custom GPT Action
  └─► POST https://<relay>/v1/findings  (Bearer OVERSIGHT_RELAY_API_KEY)
        ├─ validate · sanitize · rate-limit · idempotency (relay)
        └─► POST GitHub API /repos/wimaxnz/construction-intelligence-oversight/dispatches
              client_payload: { payload: "<json>", hmac: "<sha256 hex>" }

ChatGPT (or script with PAT — bypasses relay)
  └─► POST GitHub API /repos/wimaxnz/construction-intelligence-oversight/dispatches
        client_payload: { payload: "<json string>", hmac: "<sha256 hex>" }
  └─► oversight-ingest.yml
        ├─ verify HMAC (OVERSIGHT_INGEST_HMAC)
        ├─ tsx scripts/oversight-bridge/ingest-cli.ts --layout-root
        ├─ commit AI_OVERSIGHT_INBOX.json + AI_OVERSIGHT_RESPONSE.md + bridge-audit.jsonl
        └─ open PR oversight/inbox/{findingId} → main

Cursor close-out (construction-command-centre)
  └─► sync-ai-oversight.ps1 -Pull
        ├─ fetch INBOX + RESPONSE from oversight clone
        └─ consume-oversight-findings.ts → oversightFindingsState (non-blocking)
```

### PR branch model (preferred)

Each finding lands on branch `oversight/inbox/{findingId}` with an automated PR. Reasons:

- Branch protection on `main` preserved
- Human can review sanitized finding before merge
- Rollback = close PR or revert merge commit

Direct push to `main` is **not** used by the workflow.

---

## Payload contract (fixed)

```json
{
  "findingId": "stable-unique-id",
  "timestamp": "2026-07-05T08:00:00Z",
  "severity": "low|medium|high|critical",
  "category": "architecture|product|construction|commercial|roadmap|regression|security|data-integrity",
  "title": "short title",
  "evidence": "bounded text",
  "whyItMatters": "bounded text",
  "recommendedAction": "bounded text",
  "source": "independent-oversight"
}
```

Implementation: `scripts/oversight-bridge/validate-payload.ts`

---

## Invocation path proof

### Known constraints (documented 2026-07-05)

| Integration | Observation |
|-------------|-------------|
| **ChatGPT direct GitHub write** | **403** — insufficient repo-level write permission for external connector |
| **Cursor GitHub App** | Installed on delivery workflow; not exposed as ChatGPT callable endpoint |
| **Codex Connector** | Not installed as repo-level app on oversight repo |
| **GitHub Actions `repository_dispatch`** | **Works** with PAT scoped to oversight repo + `OVERSIGHT_INGEST_HMAC` secret |
| **GitHub Actions `workflow_dispatch`** | **Works** for manual / CI test with JSON input (no HMAC) |

### Callable today?

| Path | Callable end-to-end? | Notes |
|------|---------------------|-------|
| **Option C: HTTPS relay → dispatch** | **Y** (after CF deploy) | ChatGPT Action → POST /v1/findings; no GitHub creds in ChatGPT |
| `workflow_dispatch` with test JSON | **Y** | Operator runs from GitHub UI or `gh workflow run` |
| `repository_dispatch` + HMAC | **Y** | Any client with oversight-repo PAT + shared secret |
| ChatGPT native GitHub tool | **N** | 403 on direct write; no repo dispatch without custom Action |
| ChatGPT OpenAI Actions → GitHub API | **Partial** | Possible if user configures Custom GPT with PAT + dispatch script; not turnkey |
| ChatHub direct call | **N** | Cannot call GitHub API without user-supplied credentials |

**Verdict:** Bridge is **callable Y** via HTTPS relay (Option C) or GitHub API (`repository_dispatch` / `workflow_dispatch`). ChatGPT **can** call end-to-end **after** relay deploy + Custom GPT Action configuration.

### Smallest additional integration (ChatGPT fully automated)

1. **Recommended:** Deploy Cloudflare Worker from `docs/ai-oversight/templates/oversight-relay/`; configure Custom GPT Action with `openapi.yaml` + Bearer `OVERSIGHT_RELAY_API_KEY`.
2. **Alternative:** Custom GPT with PAT + dispatch (not recommended — PAT in ChatGPT config).
3. **Fallback:** Scheduled poll of ChatGPT output + local `ingest-cli.ts` (semi-automated, no new public surface).

### Harmless test command

Local (main repo layout):

```bash
npx tsx --tsconfig tsconfig.app.json scripts/oversight-bridge/ingest-cli.ts \
  --payload '{"findingId":"bridge-smoke-test","timestamp":"2026-07-05T08:00:00Z","severity":"low","category":"architecture","title":"Smoke test","evidence":"Harmless test.","whyItMatters":"Verifies pipeline.","recommendedAction":"Delete after test.","source":"independent-oversight"}'
```

Oversight repo (after bootstrap):

```bash
gh workflow run oversight-ingest.yml \
  -f payload='{"findingId":"bridge-smoke-test",...}'
```

Self-test suite:

```bash
npx tsx --tsconfig tsconfig.app.json scripts/oversight-bridge-ingest-selftest.ts
```

---

## Limitations

- ChatGPT ChatHub cannot invoke the bridge directly without PAT + dispatch wiring
- Findings are **advisory** — `consume-oversight-findings.ts` never pauses sprints
- Rate limit 10/hour may delay burst reviews (by design)
- Audit log growth unbounded — periodic archival is manual ops

---

## Consequences

**Positive**

- Removes manual copy/paste for machine-readable findings
- Main repo attack surface unchanged
- Idempotency + sanitization enforced in code

**Negative**

- One-time oversight repo bootstrap (copy workflow + scripts)
- HMAC + PAT rotation is operational overhead
- PR-per-finding may accumulate open PRs under heavy review

---

## References

- [`OVERSIGHT_BRIDGE_THREAT_MODEL.md`](./OVERSIGHT_BRIDGE_THREAT_MODEL.md)
- [`OVERSIGHT_BRIDGE_OPERATIONS.md`](./OVERSIGHT_BRIDGE_OPERATIONS.md)
- [`AI_OVERSIGHT_PROTOCOL.md`](./AI_OVERSIGHT_PROTOCOL.md)
- Template workflow: [`templates/oversight-repo/.github/workflows/oversight-ingest.yml`](./templates/oversight-repo/.github/workflows/oversight-ingest.yml)
