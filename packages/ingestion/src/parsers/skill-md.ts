import type { AgentCardInput } from "@openfihris/shared";
import type { ParseResult, Parser } from "./types.js";

/**
 * Parse a YAML value — handles simple scalars and inline arrays like [a, b].
 */
function parseYamlValue(raw: string): string | string[] {
  const trimmed = raw.trim();

  // Inline array: [tag1, tag2]
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed
      .slice(1, -1)
      .split(",")
      .map((s) => s.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }

  // Quoted string
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

/**
 * Parse YAML frontmatter key-value pairs manually.
 * Supports simple `key: value` lines and inline arrays.
 */
function parseFrontmatter(block: string): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};
  const lines = block.split("\n");
  let currentKey: string | null = null;
  let currentArray: string[] | null = null;

  for (const line of lines) {
    // YAML list continuation:  - item
    if (currentKey && currentArray !== null && /^\s+-\s+/.test(line)) {
      currentArray.push(line.replace(/^\s+-\s+/, "").trim());
      result[currentKey] = currentArray;
      continue;
    }

    // Flush any pending array
    currentArray = null;
    currentKey = null;

    const match = line.match(/^(\w[\w-]*)\s*:\s*(.*)/);
    if (!match) continue;

    const key = match[1];
    const rawValue = match[2].trim();

    // Empty value followed by list items
    if (rawValue === "") {
      currentKey = key;
      currentArray = [];
      result[key] = currentArray;
      continue;
    }

    const parsed = parseYamlValue(rawValue);
    result[key] = parsed;

    if (Array.isArray(parsed)) {
      currentKey = key;
      currentArray = parsed;
    }
  }

  return result;
}

/**
 * Parser for Claude Code SKILL.md files.
 * These contain YAML frontmatter delimited by `---` and a prompt body.
 */
export const skillMdParser: Parser = {
  name: "skill-md",

  canParse(content: string, filename?: string): boolean {
    if (filename && /SKILL\.md$/i.test(filename)) return true;
    return content.trimStart().startsWith("---");
  },

  parse(content: string, source: string): ParseResult {
    const parts = content.split("---");
    if (parts.length < 3) {
      throw new Error("Invalid SKILL.md: missing YAML frontmatter delimiters");
    }

    const frontmatter = parseFrontmatter(parts[1]);
    const body = parts.slice(2).join("---").trim();

    const name = (frontmatter.name as string) || "Untitled Skill";
    const rawDesc = (frontmatter.description as string) || body.slice(0, 200);
    // Ensure description meets minimum length by padding with body context
    let description = rawDesc;
    if (description.length < 50 && body) {
      description = `${description} - ${body.slice(0, 200 - description.length)}`;
    }

    const tags = Array.isArray(frontmatter.tags)
      ? frontmatter.tags
      : typeof frontmatter.tags === "string"
        ? [frontmatter.tags]
        : [];

    const card: AgentCardInput = {
      name,
      description,
      version: (frontmatter.version as string) || undefined,
      author: (frontmatter.author as string) || "unknown",
      tags,
      type: "skill",
      category: "Other",
      frameworks: ["claude-code"],
    };

    return {
      card,
      source,
      sourceFormat: "skill-md",
      confidence: frontmatter.name ? 0.9 : 0.5,
    };
  },
};
