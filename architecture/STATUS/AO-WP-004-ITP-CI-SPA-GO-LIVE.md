# AO-WP-004 — ITP CI Engine SPA go-live status

**As of:** 2026-07-27  
**Package:** AO-WP-004  
**Review:** [`../REVIEWS/AO-REV-004-itp-ci-spa-go-live.md`](../REVIEWS/AO-REV-004-itp-ci-spa-go-live.md)  
**Governing reference:** [`../CCC_ARCHITECTURE.md`](../CCC_ARCHITECTURE.md)  
**Canonical oversight:** [`../../AI_OVERSIGHT_STATE.json`](../../AI_OVERSIGHT_STATE.json)

---

## Verdict

**FAIL — blocked before CCC SPA go-live.** Oversight automation could not clone or inspect `wimaxnz/construction-command-centre`. No CCC branches were created, force-pushed, or modified. Quiet-window go-live was not attempted. Production gate remains **CLOSED**. Sprint 1616 was not reopened. AO-WP-003 access-control remains **CLOSED**.

## Blockers (exact)

| Stream | Blocker | Evidence |
|--------|---------|----------|
| SPA stage / go-live | CCC sibling checkout absent; known private remote not readable by this agent token | `../construction-command-centre` missing; `gh repo view wimaxnz/construction-command-centre` → not resolved; `git ls-remote` → `Repository not found` |
| Quiet-window coordination | Cannot read CIP quiet state / run `itp-ci-engine:spa-stage` without CCC checkout | Same clone failure |
| Host HTTP + ACL gate | Production host returns Cloudflare managed challenge to this environment | `https://ccc.247print.biz/` and `/projects` → HTTP 403, `cf-mitigated: challenge` — SPA assets / ACL mask not observable |
| Selftests | `itp-ci-engine:selftest` and `access-control:selftest` require CCC npm scripts | Same clone failure |
| JWT soak | Deferred until go-live path executable | Blocked by above |

## Acceptance criteria (this run)

| Criterion | Result |
|-----------|--------|
| SPA staged with ITP CI Engine stamp | **BLOCKED** — no CCC checkout |
| Go-live under quiet window only | **BLOCKED** — no deploy attempted |
| Host HTTP 200 + assets ACL rwx | **BLOCKED** — Cloudflare challenge |
| Go-live evidence JSON written | **BLOCKED** — deferred to owner/CCC-capable run |
| ITP CI Engine selftest PASS | **BLOCKED** |
| Access-control selftest PASS (no reopen) | **N/A** — ACL package not reopened; CCC selftest not run |
| Oversight guard PASS | **PASS** |

## Oversight-side posture retained

| Item | Finding |
|------|---------|
| AO-WP-003 Access Control | COMPLETE / PASS — reopen only on ACL regression |
| Canonical posture | Roadmap complete; Sprint 1616 not queued; production gate CLOSED unless genuine defect |
| Parallel stream identity | ITP Library → CI Engine remains a parallel production-readiness stream, not a reopened autonomous sprint |

## ITP/CI non-conflict declaration

| Field | Value |
|-------|-------|
| Touched `feature/itp-ci-engine-integration` | **No** |
| Touched CIP floor packs | **No** |
| Force-push / history rewrite | **No** |
| Invented CCC GitHub remote URL | **No** |
| Reopened AO-WP-003 access-control | **No** |
| Production mutation / SPA publish | **No** |

## Owner-only CCC remote setup (required for redelivery)

1. Ensure private GitHub repo `wimaxnz/construction-command-centre` exists and is the canonical delivery remote (already named in package / doctrine; **do not invent** another URL).
2. Grant the Cursor Automation / cloud-agent GitHub identity **read** (and PR-write if delivery PRs are expected) on that private repo.
3. Prefer environment sibling checkout at `../construction-command-centre` with `origin` set to that known remote.
4. Optionally allowlist cloud-agent egress for `https://ccc.247print.biz` (or provide browser-capable probe) so host HTTP 200 / ACL rwx gates are observable.
5. Re-approve a follow-up Architecture Office package (new id) on oversight `main` once access is confirmed — do not leave AO-WP-004 silently approved without access.

## Non-goals preserved

- No bridge services, n8n, or extra infrastructure
- Sprint 1616 not queued
- No production mutation
- No speculative CCC SPA go-live invented from oversight docs alone
- CIP floors not paused
