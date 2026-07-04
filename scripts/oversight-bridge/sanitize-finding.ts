/**
 * Sanitize oversight finding text fields — reuse oversight-sanitize patterns
 * and strip prompt-injection phrases (logged, never executed).
 */

import { scrubText, detectHighRisk, REDACT } from '../oversight-sanitize.ts';
import type { OversightFindingPayload } from './validate-payload.ts';

export type PromptInjectionHit = { field: string; pattern: string; excerpt: string };

/** Patterns stripped from text fields; logged in audit, never interpreted as instructions. */
export const PROMPT_INJECTION_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: 'ignore-instructions', pattern: /ignore\s+(?:all\s+)?(?:previous|prior|above)\s+instructions/gi },
  { name: 'system-prompt', pattern: /\bsystem\s*prompt\b/gi },
  { name: 'execute-command', pattern: /\b(?:execute|run)\s+(?:this\s+)?(?:shell\s+)?command\b/gi },
  { name: 'run-shell', pattern: /\brun\s+(?:bash|shell|powershell|cmd)\b/gi },
  { name: 'disregard-policy', pattern: /disregard\s+(?:all\s+)?(?:safety|security|policy)\b/gi },
  { name: 'jailbreak', pattern: /\b(?:DAN|jailbreak|developer\s+mode)\b/gi },
  { name: 'tool-invoke', pattern: /\b(?:call|invoke)\s+(?:tool|function|api)\s*[\(\[]/gi },
  { name: 'markdown-code-exec', pattern: /```(?:bash|sh|powershell|cmd|shell)/gi },
  { name: 'path-traversal', pattern: /\.\.[\\/]/g },
  { name: 'absolute-path', pattern: /(?:^|\s)[A-Za-z]:\\[^\s]+|(?:^|\s)\/(?:etc|home|usr|var|tmp)\/[^\s]*/g },
];

export function stripPromptInjection(
  field: string,
  text: string,
): { sanitized: string; hits: PromptInjectionHit[] } {
  let out = text;
  const hits: PromptInjectionHit[] = [];

  for (const rule of PROMPT_INJECTION_PATTERNS) {
    rule.pattern.lastIndex = 0;
    if (rule.pattern.test(out)) {
      const excerpt = out.slice(0, 80).replace(/\s+/g, ' ');
      hits.push({ field, pattern: rule.name, excerpt });
      out = out.replace(rule.pattern, '[stripped-injection]');
    }
    rule.pattern.lastIndex = 0;
  }

  return { sanitized: out, hits };
}

export function sanitizeFindingText(text: string): string {
  return scrubText(text);
}

export type SanitizedFinding = {
  payload: OversightFindingPayload;
  injectionHits: PromptInjectionHit[];
  highRiskAfterScrub: string[];
};

export function sanitizeFinding(payload: OversightFindingPayload): SanitizedFinding {
  const injectionHits: PromptInjectionHit[] = [];
  const textFields = ['title', 'evidence', 'whyItMatters', 'recommendedAction'] as const;

  const sanitized = { ...payload };
  for (const field of textFields) {
    const { sanitized: stripped, hits } = stripPromptInjection(field, payload[field]);
    injectionHits.push(...hits);
    sanitized[field] = sanitizeFindingText(stripped);
  }

  const combined = JSON.stringify(sanitized);
  const highRiskAfterScrub = detectHighRisk(combined);

  return { payload: sanitized, injectionHits, highRiskAfterScrub };
}

export { REDACT };
