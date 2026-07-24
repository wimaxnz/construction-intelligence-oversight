#!/usr/bin/env node
/**
 * Architecture Office publication guard (fail-closed).
 *
 * Blocks Architecture Office publication when:
 * - architecture/ARCHITECTURE_STATE.json is empty or invalid / empty object
 * - roadmap metadata contradicts canonical AI_OVERSIGHT_STATE.json
 * - NEXT_WORKPACKAGE.md conflicts with declared active work
 *
 * Usage:
 *   node scripts/architecture-office-guard.mjs
 *   node scripts/architecture-office-guard.mjs --selftest
 *
 * Exit 0 = publishable; Exit 1 = blocked.
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ARCH_STATE_PATH = join(ROOT, 'architecture', 'ARCHITECTURE_STATE.json');
const NEXT_WP_PATH = join(ROOT, 'architecture', 'NEXT_WORKPACKAGE.md');
const OVERSIGHT_STATE_PATH = join(ROOT, 'AI_OVERSIGHT_STATE.json');

/**
 * @typedef {{ ok: boolean, errors: string[] }} GuardResult
 */

/**
 * @param {string} path
 * @returns {{ ok: true, value: any } | { ok: false, error: string }}
 */
function readJsonObject(path) {
  if (!existsSync(path)) {
    return { ok: false, error: `Missing file: ${path}` };
  }
  const raw = readFileSync(path, 'utf8');
  if (!raw.trim()) {
    return { ok: false, error: `${path} is empty` };
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return { ok: false, error: `JSON parse failed for ${path}: ${e.message}` };
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, error: `${path} root is not a non-empty object` };
  }
  if (Object.keys(parsed).length === 0) {
    return { ok: false, error: `${path} parsed to empty object` };
  }
  return { ok: true, value: parsed };
}

/**
 * @param {{ archStatePath?: string, nextWpPath?: string, oversightStatePath?: string }} [opts]
 * @returns {GuardResult}
 */
export function runArchitectureOfficeGuard(opts = {}) {
  const archStatePath = opts.archStatePath ?? ARCH_STATE_PATH;
  const nextWpPath = opts.nextWpPath ?? NEXT_WP_PATH;
  const oversightStatePath = opts.oversightStatePath ?? OVERSIGHT_STATE_PATH;
  /** @type {string[]} */
  const errors = [];

  const arch = readJsonObject(archStatePath);
  if (!arch.ok) {
    return { ok: false, errors: [arch.error] };
  }
  const archState = arch.value;

  const oversight = readJsonObject(oversightStatePath);
  if (!oversight.ok) {
    errors.push(oversight.error);
    return { ok: false, errors };
  }
  const oState = oversight.value;

  const align = archState.canonicalOversightAlignment ?? {};
  const cs = oState.currentSprint ?? {};
  const ns = oState.nextSprint ?? {};
  const pos = oState.ownerPosition ?? {};

  if (typeof align.currentSprint !== 'number') {
    errors.push('ARCHITECTURE_STATE.canonicalOversightAlignment.currentSprint missing/invalid');
  } else if (align.currentSprint !== cs.number) {
    errors.push(
      `roadmap contradiction: architecture currentSprint (${align.currentSprint}) != oversight currentSprint.number (${cs.number})`,
    );
  }

  if (typeof align.nextSprint !== 'number') {
    errors.push('ARCHITECTURE_STATE.canonicalOversightAlignment.nextSprint missing/invalid');
  } else if (align.nextSprint !== ns.number) {
    errors.push(
      `roadmap contradiction: architecture nextSprint (${align.nextSprint}) != oversight nextSprint.number (${ns.number})`,
    );
  }

  const archQueued = align.nextSprintQueued === true || align.nextSprintStatus === 'queued';
  const oversightQueued = ns.queued === true || ns.status === 'queued';
  if (archQueued !== oversightQueued) {
    errors.push(
      `roadmap contradiction: architecture nextSprintQueued/status (${align.nextSprintQueued}/${align.nextSprintStatus}) vs oversight (${ns.queued}/${ns.status})`,
    );
  }

  const archComplete = String(align.engineeringRoadmap ?? '').toLowerCase() === 'complete';
  const oversightComplete =
    ns.queued === false ||
    ns.status === 'not_queued' ||
    String(pos.engineeringRoadmap ?? '').toLowerCase() === 'complete';
  if (archComplete !== oversightComplete) {
    errors.push(
      `roadmap contradiction: architecture engineeringRoadmap=${align.engineeringRoadmap} vs oversight complete-position=${oversightComplete}`,
    );
  }

  if (archComplete && (align.nextSprintQueued === true || align.nextSprintStatus === 'queued')) {
    errors.push('ARCHITECTURE_STATE claims roadmap complete but next sprint is queued');
  }

  if (!existsSync(nextWpPath)) {
    errors.push(`Missing NEXT_WORKPACKAGE.md: ${nextWpPath}`);
  } else {
    const nextMd = readFileSync(nextWpPath, 'utf8');
    const requiredHeadings = [
      '## Objective',
      '## Business value',
      '## Scope',
      '## Architecture',
      '## Database',
      '## API',
      '## UI',
      '## Knowledge Graph integration',
      '## Digital Brain integration',
      '## Security',
      '## Dependencies',
      '## Risks',
      '## Acceptance criteria',
      '## Validation',
      '## Evidence required',
    ];
    for (const h of requiredHeadings) {
      if (!nextMd.includes(h)) {
        errors.push(`NEXT_WORKPACKAGE.md missing required section: ${h}`);
      }
    }

    const next = archState.nextWorkPackage ?? {};
    const active = archState.activeWork ?? {};
    const conflicts = next.conflictsWithActiveEngineering === true;
    const autonomous = String(active.engineeringAutonomousQueue ?? 'none').toLowerCase();

    if (conflicts && autonomous !== 'none' && autonomous !== '') {
      errors.push(
        'NEXT_WORKPACKAGE conflicts with active engineering (conflictsWithActiveEngineering=true while autonomous queue is active)',
      );
    }

    if (conflicts && archComplete) {
      errors.push(
        'NEXT_WORKPACKAGE declares conflictsWithActiveEngineering=true while roadmap is complete / no autonomous queue — refuse contradictory package metadata',
      );
    }

    const id = String(next.id ?? '');
    if (id && !nextMd.includes(id)) {
      errors.push(`NEXT_WORKPACKAGE.md does not reference nextWorkPackage.id (${id})`);
    }

    // Forbid packages that reopen Sprint 1616 while oversight says not queued
    if (!oversightQueued && /Sprint\s*1616\s+queued/i.test(nextMd)) {
      errors.push('NEXT_WORKPACKAGE.md queues Sprint 1616 but canonical oversight has 1616 NOT queued');
    }
  }

  if (!archState.governingReference || typeof archState.governingReference !== 'string') {
    errors.push('ARCHITECTURE_STATE.governingReference missing');
  }

  return { ok: errors.length === 0, errors };
}

function selftest() {
  const dir = join(tmpdir(), `ao-guard-${Date.now()}`);
  mkdirSync(join(dir, 'architecture'), { recursive: true });
  const oversightPath = join(dir, 'AI_OVERSIGHT_STATE.json');
  const archPath = join(dir, 'architecture', 'ARCHITECTURE_STATE.json');
  const nextPath = join(dir, 'architecture', 'NEXT_WORKPACKAGE.md');

  writeFileSync(oversightPath, JSON.stringify({
    currentSprint: { number: 1615, status: 'closed' },
    nextSprint: { number: 1616, status: 'not_queued', queued: false },
    ownerPosition: { engineeringRoadmap: 'complete', sprint1616Queued: false },
  }), 'utf8');

  writeFileSync(archPath, '', 'utf8');
  writeFileSync(nextPath, '# empty\n', 'utf8');
  const rEmpty = runArchitectureOfficeGuard({
    archStatePath: archPath,
    nextWpPath: nextPath,
    oversightStatePath: oversightPath,
  });
  if (rEmpty.ok) {
    console.error('SELFTEST FAIL: empty ARCHITECTURE_STATE did not fail closed');
    process.exit(1);
  }

  writeFileSync(archPath, '{not-json', 'utf8');
  const rBad = runArchitectureOfficeGuard({
    archStatePath: archPath,
    nextWpPath: nextPath,
    oversightStatePath: oversightPath,
  });
  if (rBad.ok) {
    console.error('SELFTEST FAIL: invalid JSON did not fail closed');
    process.exit(1);
  }

  const contradictory = {
    governingReference: 'architecture/CCC_ARCHITECTURE.md',
    canonicalOversightAlignment: {
      currentSprint: 1615,
      nextSprint: 1616,
      nextSprintQueued: true,
      nextSprintStatus: 'queued',
      engineeringRoadmap: 'complete',
    },
    activeWork: { engineeringAutonomousQueue: 'none' },
    nextWorkPackage: {
      id: 'AO-WP-X',
      conflictsWithActiveEngineering: false,
    },
  };
  writeFileSync(archPath, JSON.stringify(contradictory), 'utf8');
  writeFileSync(
    nextPath,
    [
      '## Objective',
      '## Business value',
      '## Scope',
      '## Architecture',
      '## Database',
      '## API',
      '## UI',
      '## Knowledge Graph integration',
      '## Digital Brain integration',
      '## Security',
      '## Dependencies',
      '## Risks',
      '## Acceptance criteria',
      '## Validation',
      '## Evidence required',
      'AO-WP-X',
    ].join('\n'),
    'utf8',
  );
  const rContradict = runArchitectureOfficeGuard({
    archStatePath: archPath,
    nextWpPath: nextPath,
    oversightStatePath: oversightPath,
  });
  if (rContradict.ok) {
    console.error('SELFTEST FAIL: contradictory roadmap did not fail closed');
    process.exit(1);
  }

  const conflictPkg = {
    governingReference: 'architecture/CCC_ARCHITECTURE.md',
    canonicalOversightAlignment: {
      currentSprint: 1615,
      nextSprint: 1616,
      nextSprintQueued: false,
      nextSprintStatus: 'not_queued',
      engineeringRoadmap: 'complete',
    },
    activeWork: { engineeringAutonomousQueue: 'none' },
    nextWorkPackage: {
      id: 'AO-WP-X',
      conflictsWithActiveEngineering: true,
    },
  };
  writeFileSync(archPath, JSON.stringify(conflictPkg), 'utf8');
  const rConflict = runArchitectureOfficeGuard({
    archStatePath: archPath,
    nextWpPath: nextPath,
    oversightStatePath: oversightPath,
  });
  if (rConflict.ok) {
    console.error('SELFTEST FAIL: NEXT conflict with active/complete posture did not fail closed');
    process.exit(1);
  }

  try {
    rmSync(dir, { recursive: true, force: true });
  } catch {
    /* ignore */
  }

  console.log('SELFTEST PASS: fail-closed on empty/invalid JSON, roadmap contradiction, NEXT conflict');
}

function main() {
  if (process.argv.includes('--selftest')) {
    selftest();
    return;
  }

  const result = runArchitectureOfficeGuard();
  if (!result.ok) {
    console.error('ARCHITECTURE OFFICE GUARD BLOCKED PUBLICATION (fail closed):');
    for (const e of result.errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log('ARCHITECTURE OFFICE GUARD PASS — architecture artefacts publishable');
}

main();
