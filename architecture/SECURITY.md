# Security

**Governing reference:** [`CCC_ARCHITECTURE.md`](./CCC_ARCHITECTURE.md)  
**Bridge threat model (existing):** [`../OVERSIGHT_BRIDGE_THREAT_MODEL.md`](../OVERSIGHT_BRIDGE_THREAT_MODEL.md)

---

## Architecture security doctrine

1. **AI / IP server-side (Sprint 521)** — protected processing does not run in the public client.
2. **Least privilege publication** — oversight sync remains allowlisted + sanitised; Architecture Office adds guards, does not weaken scrub rules.
3. **Production ACL hygiene** — blank-page class defect fixed via ACL `mask::---` on `public/assets`; **`ccc-fix-public-acls` mandatory post-deploy**.
4. **Production gate CLOSED** unless genuine defect evidence exists.
5. **No secret leakage** into architecture docs (no env values, tokens, customer data, commercial figures).

---

## Oversight publication security

Existing fail-closed guards on `AI_OVERSIGHT_STATE.json` remain authoritative for root sync.

Architecture Office additionally fail-closes when:

- `architecture/ARCHITECTURE_STATE.json` is empty or invalid JSON
- Roadmap metadata contradicts canonical oversight position
- `NEXT_WORKPACKAGE.md` conflicts with active / approved work declarations in `ARCHITECTURE_STATE.json`

See `scripts/architecture-office-guard.mjs`.

---

## Review obligations

Every architecture review must include **Security and data-integrity review** covering AuthZ/ACL, IP path, and publish hygiene.
