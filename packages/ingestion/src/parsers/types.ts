import type { AgentCardInput } from "@openfihris/shared";

export interface ParseResult {
  card: AgentCardInput;
  source: string;
  sourceFormat: string;
  confidence: number;
}

export interface Parser {
  name: string;
  canParse(content: string, filename?: string): boolean;
  parse(content: string, source: string): ParseResult;
}
