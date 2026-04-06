import type { AgentCardInput } from "@openfihris/shared";
import type { ParseResult, Parser } from "./types.js";

interface LobeChatAgent {
  identifier?: string;
  meta?: {
    title?: string;
    description?: string;
    tags?: string[];
  };
  author?: string;
  homepage?: string;
  version?: string;
}

/**
 * Parser for LobeChat agent JSON format.
 */
export const lobechatJsonParser: Parser = {
  name: "lobechat-json",

  canParse(content: string, filename?: string): boolean {
    if (filename && /lobechat/i.test(filename)) return true;
    try {
      const parsed = JSON.parse(content);
      return (
        typeof parsed === "object" &&
        parsed !== null &&
        "identifier" in parsed &&
        "meta" in parsed
      );
    } catch {
      return false;
    }
  },

  parse(content: string, source: string): ParseResult {
    const data: LobeChatAgent = JSON.parse(content);

    const name =
      data.meta?.title || data.identifier || "Untitled LobeChat Agent";
    const description = data.meta?.description || "No description provided";
    const tags = data.meta?.tags || [];

    const card: AgentCardInput = {
      name,
      description,
      version: data.version,
      author: data.author || "unknown",
      homepage: data.homepage || undefined,
      tags,
      type: "prompt",
      category: "Other",
      frameworks: ["any"],
    };

    return {
      card,
      source,
      sourceFormat: "lobechat-json",
      confidence: data.meta?.title ? 0.9 : 0.6,
    };
  },
};
