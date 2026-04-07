import type { AgentCardInput } from "@openfihris/shared";
import type { ParseResult, Parser } from "./types.js";

interface A2ASkill {
  id?: string;
  name?: string;
  description?: string;
}

interface A2AAgentCard {
  name?: string;
  description?: string;
  url?: string;
  version?: string;
  capabilities?: Record<string, unknown>;
  skills?: A2ASkill[];
  authentication?: { schemes?: string[] };
}

/**
 * Parser for Google A2A (Agent-to-Agent) Agent Card JSON format.
 */
export const a2aAgentCardParser: Parser = {
  name: "a2a-agent-card",

  canParse(content: string, filename?: string): boolean {
    if (filename && /agent[_-]?card\.json$/i.test(filename)) return true;
    try {
      const parsed = JSON.parse(content);
      return (
        typeof parsed === "object" &&
        parsed !== null &&
        "name" in parsed &&
        ("skills" in parsed || "capabilities" in parsed) &&
        "url" in parsed
      );
    } catch {
      return false;
    }
  },

  parse(content: string, source: string): ParseResult {
    const data: A2AAgentCard = JSON.parse(content);

    const name = data.name || "Untitled A2A Agent";
    const description = data.description || "No description provided";

    const capabilities = (data.skills || [])
      .filter((s) => s.name)
      .map((s) => ({
        name: s.name!,
        description: s.description || s.name!,
      }));

    // Map A2A auth schemes to OpenFihris auth types
    let auth: AgentCardInput["auth"] | undefined;
    const schemes = data.authentication?.schemes;
    if (schemes && schemes.length > 0) {
      const scheme = schemes[0].toLowerCase();
      if (scheme.includes("oauth")) {
        auth = { type: "oauth2" };
      } else if (
        scheme.includes("bearer") ||
        scheme.includes("api") ||
        scheme.includes("key")
      ) {
        auth = { type: "api_key" };
      } else {
        auth = { type: "none" };
      }
    }

    const card: AgentCardInput = {
      name,
      description,
      version: data.version,
      author: "unknown",
      homepage: data.url,
      endpoint: data.url,
      tags: [],
      type: "remote",
      category: "Other",
      frameworks: ["any"],
      capabilities: capabilities.length > 0 ? capabilities : undefined,
      auth,
      protocols: ["a2a"],
    };

    return {
      card,
      source,
      sourceFormat: "a2a-agent-card",
      confidence: data.name && data.url ? 0.95 : 0.6,
    };
  },
};
