#!/usr/bin/env node
/**
 * Architecture Office sessionStart hook (cloud + local).
 * Injects execution contract context and guard status for work-package agents.
 * Fail-open for session start so unrelated oversight work is not blocked;
 * the agent prompt still requires fail-closed guard before package execution.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const GUARD = join(ROOT, 'scripts', 'architecture-office-guard.mjs');
const STATE = join(ROOT, 'architecture', 'ARCHITECTURE_STATE.json');
const NEXT = join(ROOT, 'architecture', 'NEXT_WORKPACKAGE.md');

function readStdin() {
  try {
    return readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function summarizePackage() {
  let id = 'unknown';
  let status = 'unknown';
  try {
    if (existsSync(STATE)) {
      const s = JSON.parse(readFileSync(STATE, 'utf8'));
      id = s?.nextWorkPackage?.id ?? id;
      status = s?.nextWorkPackage?.status ?? status;
    }
  } catch {
    /* ignore */
  }
  let heading = '';
  try {
    if (existsSync(NEXT)) {
      const md = readFileSync(NEXT, 'utf8');
      const m = md.match(/\*\*Status:\*\*\s*`?([^`\n]+)`?/i);
      if (m) status = m[1].trim();
      const idm = md.match(/\*\*Package ID:\*\*\s*`?([^`\n]+)`?/i);
      if (idm) id = idm[1].trim();
      heading = (md.split(/\r?\n/)[0] ?? '').replace(/^#\s*/, '').trim();
    }
  } catch {
    /* ignore */
  }
  return { id, status, heading };
}

readStdin();

let guardLine = 'guard not run';
if (existsSync(GUARD)) {
  const r = spawnSync(process.execPath, [GUARD], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 45000,
  });
  const out = `${r.stdout || ''}${r.stderr || ''}`.trim();
  guardLine = out.split('\n').pop() || (r.status === 0 ? 'GUARD PASS' : 'GUARD FAIL');
  if (r.status !== 0) {
    guardLine = `FAIL-CLOSED: ${guardLine}`;
  }
} else {
  guardLine = 'FAIL-CLOSED: scripts/architecture-office-guard.mjs missing';
}

const pkg = summarizePackage();
const approved =
  String(pkg.status).toLowerCase() === 'approved' ||
  String(pkg.status).toLowerCase() === 'in_progress';

const additional_context = [
  'Architecture Office work-package session.',
  `Guard: ${guardLine}`,
  `Next package: ${pkg.id} (status=${pkg.status})${pkg.heading ? ` — ${pkg.heading}` : ''}.`,
  approved
    ? 'If this run was triggered for delivery: execute ONLY approved packages per .cursor/skills/architecture-office-workpackage/SKILL.md. Do not interrupt CCC CIP/ITP mid-flight; open PRs for CCC delivery work.'
    : 'No approved executable package — abort cleanly (no-op). Do not invent packages or reopen Sprint 1616.',
  'Canonical branch: main. On completion: archive to architecture/WORKPACKAGES/, write architecture/REVIEWS/, update ARCHITECTURE_STATE.json, advance or set queued sentinel in NEXT_WORKPACKAGE.md, commit/push or PR to oversight main.',
].join('\n');

process.stdout.write(JSON.stringify({ additional_context }));
process.exit(0);
