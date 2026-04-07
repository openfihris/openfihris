export type { ParseResult, Parser } from "./types.js";
export { skillMdParser } from "./skill-md.js";
export { a2aAgentCardParser } from "./a2a-agent-card.js";
export { lobechatJsonParser } from "./lobechat-json.js";

import type { ParseResult, Parser } from "./types.js";
import { skillMdParser } from "./skill-md.js";
import { a2aAgentCardParser } from "./a2a-agent-card.js";
import { lobechatJsonParser } from "./lobechat-json.js";

/** All available parsers, in priority order. */
export const parsers: Parser[] = [
  a2aAgentCardParser,
  lobechatJsonParser,
  skillMdParser,
];

/**
 * Try each parser in order and return the first successful result.
 * Returns null if no parser can handle the content.
 */
export function parseAny(
  content: string,
  filename: string,
  source: string,
): ParseResult | null {
  for (const parser of parsers) {
    if (parser.canParse(content, filename)) {
      try {
        return parser.parse(content, source);
      } catch {
        // Parser matched but failed to parse — try the next one
        continue;
      }
    }
  }
  return null;
}
