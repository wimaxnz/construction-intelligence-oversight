# AI Oversight Protocol

**Purpose:** Independent review layer that preserves autonomous sprint execution. Oversight adds periodic external perspective without gating or pausing delivery.

**Scope:** Architecture, product direction, construction domain fit, commercial intelligence alignment, and roadmap coherence — not day-to-day sprint implementation.

---

## Oversight loop

1. **Execute** — Sprints run continuously per `PLATFORM_EVOLUTION.md` (Stream 1 + Stream 2, Sprint Validation 3/3).
2. **Close out** — After each sprint closes, update `AI_OVERSIGHT_STATE.json` with current repo state.
3. **Sync (optional, non-blocking)** — Run `.\scripts\sync-ai-oversight.ps1 -Push` (or `./scripts/sync-ai-oversight.sh push`) to publish sanitized state to the external oversight repo per [`OVERSIGHT_SYNC.md`](./OVERSIGHT_SYNC.md). Never pause the next sprint if sync fails.
4. **Request (optional)** — When a matter benefits from independent review, append to `AI_OVERSIGHT_REQUEST.md`.
5. **Respond (async)** — Review findings land in `AI_OVERSIGHT_RESPONSE.md` and `AI_OVERSIGHT_INBOX.json` (pull with `-Pull` / `pull` at close-out; auto-runs `consume-oversight-findings.ts`).
6. **Incorporate** — Triage each finding into `AI_OVERSIGHT_STATE.json` → `oversightFindingsTriage` and `oversightFindingsState` (accepted · deferred · rejected with rationale). Valid findings enter backlog or future sprint queues; active validated work continues.

---

## When to update state

Update `AI_OVERSIGHT_STATE.json` **after each sprint close-out**, alongside updates to:

- `docs/PLATFORM_EVOLUTION.md`
- `docs/PHASE_B_UX_ACCEPTANCE.md`

Capture: sprint number, milestone progress, validation results, changed files, risks, blockers, and strategic alignment fields.

Then sanitize and push (non-blocking):

```powershell
.\scripts\sync-ai-oversight.ps1 -Push
```

The sync script scrubs allowlisted files before copying to the oversight repo. See [`OVERSIGHT_SYNC.md`](./OVERSIGHT_SYNC.md) for allowlist and sanitization rules.

---

## When to use REQUEST

Use `AI_OVERSIGHT_REQUEST.md` **only** for matters that benefit from independent review, such as:

- Architectural direction or cross-cutting design choices
- Product / UX strategy at milestone boundaries
- Construction domain or commercial workflow coherence
- Roadmap alignment or phase-transition decisions
- Security, data-integrity, or regression-risk escalations

Do **not** file requests for routine sprint deliverables already covered by self-tests and Sprint Validation.

---

## How to handle RESPONSE

When `AI_OVERSIGHT_RESPONSE.md` contains findings, record disposition in `oversightFindingsTriage` on `AI_OVERSIGHT_STATE.json`:

| Finding type | Action |
|--------------|--------|
| Valid improvement | Add to backlog or queue in `PLATFORM_EVOLUTION.md` for a future sprint |
| Strategic concern | Note in `AI_OVERSIGHT_STATE.json` → `openRisks`; plan remediation sprint |
| Security / data-integrity / architectural / regression risk | May interrupt **only** active work that directly introduces the risk; otherwise defer to next sprint |
| Disagreement with validated sprint work | Do not reopen closed sprints; carry forward as future consideration |

**Default:** Incorporate valid findings into planning; never roll back validated, regression-green deliverables without explicit human decision.

---

## Non-blocking rule

**Never stop development waiting for an oversight response.**

- Sprint execution does not pause for review.
- Missing or delayed responses do not block the next sprint.
- Oversight is advisory; Sprint Validation and Platform Certification remain the delivery gates.

---

## External oversight repository

Independent review is published to a separate public repo so oversight can run outside the delivery codebase:

**Remote:** [wimaxnz/construction-intelligence-oversight](https://github.com/wimaxnz/construction-intelligence-oversight)

**GitHub write-back:** External reviewers use the **oversight bridge**:

1. **ChatGPT (recommended):** Custom GPT Action → HTTPS relay (`POST /v1/findings`) → HMAC-signed `repository_dispatch` → `oversight-ingest.yml` on the oversight repo. Template: [`templates/oversight-relay/`](./templates/oversight-relay/README.md). ChatGPT direct GitHub writes return 403.
2. **Direct dispatch:** PAT + HMAC → `repository_dispatch` (scripts or `gh api`).

Delivery team publishes outbound state via `.\scripts\sync-ai-oversight.ps1 -Push` only. See [`OVERSIGHT_BRIDGE_ADR.md`](./OVERSIGHT_BRIDGE_ADR.md).

Full sync instructions: [`OVERSIGHT_SYNC.md`](./OVERSIGHT_SYNC.md) (allowlist, sanitization, usage). Quick reference: [`OVERSIGHT_REMOTE.md`](./OVERSIGHT_REMOTE.md).

### Sync workflow (after each sprint close-out)

1. **Update local state** — Refresh `AI_OVERSIGHT_STATE.json` (and `AI_OVERSIGHT_REQUEST.md` if a request is active).
2. **Sanitize and push** — Run `.\scripts\sync-ai-oversight.ps1 -Push` (or `./scripts/sync-ai-oversight.sh push`). The script stages allowlisted files, scrubs secrets/PII/commercial data, blocks on post-scrub high-risk hits unless `-Force` / `OVERSIGHT_FORCE=1`, then commits to the oversight clone only. Non-blocking: warn and continue if remote is unavailable.
3. **Pull inbound (at close-out)** — `.\scripts\sync-ai-oversight.ps1 -Pull` fetches `AI_OVERSIGHT_RESPONSE.md` and `AI_OVERSIGHT_INBOX.json`, then runs `consume-oversight-findings.ts` to detect new findings vs `oversightFindingsState`. Incorporate per the table above; never block the next sprint on pull timing.
4. **Continue** — Start the next sprint regardless of whether steps 2–3 succeeded.

This is a **docs-only link** — not a git submodule. The delivery repo keeps working copies; the external repo is the publish/subscribe channel for independent review.

---

## File reference

| File | Role |
|------|------|
| `AI_OVERSIGHT_PROTOCOL.md` | This document — loop definition |
| `AI_OVERSIGHT_STATE.json` | Machine-readable current state snapshot |
| `AI_OVERSIGHT_REQUEST.md` | Outbound independent review requests |
| `AI_OVERSIGHT_RESPONSE.md` | Inbound review findings |
| `AI_OVERSIGHT_INBOX.json` | Machine-readable inbound findings (bridge ingest) |
| `OVERSIGHT_BRIDGE_ADR.md` | Bridge architecture decision + invocation path |
| `OVERSIGHT_BRIDGE_THREAT_MODEL.md` | Security threat model |
| `OVERSIGHT_BRIDGE_OPERATIONS.md` | Deploy, test, auth, rollback |
| `templates/oversight-relay/` | HTTPS relay for ChatGPT Actions (Cloudflare Worker) |
| `OVERSIGHT_RELAY_E2E_PROOF.md` | Timestamped E2E proof artifact |
| `OVERSIGHT_SYNC.md` | Safe public sync — allowlist, sanitization, usage |
| `OVERSIGHT_PACKET.md` | Optional human-readable close-out summary for external review |
| `OVERSIGHT_REMOTE.md` | External repo URL, push/pull workflow, non-blocking rules |
| `architecture/` | **Architecture Office** — governing reference, packages, reviews, status (see [`architecture/README.md`](./architecture/README.md)) |
| `architecture/CCC_ARCHITECTURE.md` | Governing architecture reference |
| `architecture/ARCHITECTURE_STATE.json` | Machine-readable Architecture Office state (guarded) |
| `scripts/architecture-office-guard.mjs` | Fail-closed Architecture Office publication guard |

---

## Architecture Office (additive)

Architecture governance artefacts live under [`architecture/`](./architecture/README.md) in this oversight repository so they do **not** interrupt CCC engineering worktrees.

- Governing reference: [`architecture/CCC_ARCHITECTURE.md`](./architecture/CCC_ARCHITECTURE.md)
- Must stay consistent with canonical [`AI_OVERSIGHT_STATE.json`](./AI_OVERSIGHT_STATE.json)
- Publishability: `node scripts/architecture-office-guard.mjs` (empty/invalid state, contradictory roadmap metadata, or NEXT package conflicts → fail closed)
- Root allowlisted sync from the delivery repo (`AI_OVERSIGHT_*.md/json`, `OVERSIGHT_PACKET.md`) is unchanged; `architecture/` is native here and validated by Architecture Office CI
