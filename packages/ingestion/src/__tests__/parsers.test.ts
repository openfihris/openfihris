import { describe, expect, it } from "vitest";
import { skillMdParser } from "../parsers/skill-md.js";
import { a2aAgentCardParser } from "../parsers/a2a-agent-card.js";
import { lobechatJsonParser } from "../parsers/lobechat-json.js";
import { parseAny } from "../parsers/index.js";

describe("skillMdParser", () => {
  const sampleSkillMd = `---
name: Code Reviewer
description: Analyzes code for bugs, style issues, and potential improvements across multiple languages
version: 1.0.0
author: bader
tags: [code-review, linting, quality]
---
You are an expert code reviewer. Analyze the given code for bugs,
style violations, and potential performance improvements.
`;

  it("detects SKILL.md by filename", () => {
    expect(skillMdParser.canParse("anything", "SKILL.md")).toBe(true);
    expect(skillMdParser.canParse("anything", "path/to/SKILL.md")).toBe(true);
  });

  it("detects SKILL.md by frontmatter", () => {
    expect(skillMdParser.canParse(sampleSkillMd)).toBe(true);
    expect(skillMdParser.canParse("no frontmatter here")).toBe(false);
  });

  it("parses SKILL.md correctly", () => {
    const result = skillMdParser.parse(
      sampleSkillMd,
      "https://example.com/SKILL.md",
    );

    expect(result.card.name).toBe("Code Reviewer");
    expect(result.card.description).toContain("Analyzes code for bugs");
    expect(result.card.version).toBe("1.0.0");
    expect(result.card.author).toBe("bader");
    expect(result.card.tags).toEqual(["code-review", "linting", "quality"]);
    expect(result.card.type).toBe("skill");
    expect(result.card.frameworks).toEqual(["claude-code"]);
    expect(result.sourceFormat).toBe("skill-md");
    expect(result.source).toBe("https://example.com/SKILL.md");
    expect(result.confidence).toBe(0.9);
  });

  it("handles SKILL.md with YAML list syntax for tags", () => {
    const content = `---
name: Test Agent
description: A test agent that does many useful things for testing purposes and verification
author: tester
tags:
  - alpha
  - beta
---
Body content here.
`;
    const result = skillMdParser.parse(content, "test");
    expect(result.card.tags).toEqual(["alpha", "beta"]);
  });
});

describe("a2aAgentCardParser", () => {
  const sampleA2A = JSON.stringify({
    name: "Weather Agent",
    description:
      "Provides real-time weather data and forecasts for any location worldwide using multiple data sources",
    url: "https://weather-agent.example.com",
    version: "1.0",
    capabilities: { streaming: true },
    skills: [
      {
        id: "get-weather",
        name: "Get Weather",
        description: "Fetches current weather for a location",
      },
      {
        id: "forecast",
        name: "Forecast",
        description: "Gets a 7-day forecast",
      },
    ],
    authentication: { schemes: ["bearer"] },
  });

  it("detects A2A agent card by filename", () => {
    expect(a2aAgentCardParser.canParse("{}", "agent-card.json")).toBe(true);
    expect(a2aAgentCardParser.canParse("{}", "agent_card.json")).toBe(true);
  });

  it("detects A2A agent card by structure", () => {
    expect(a2aAgentCardParser.canParse(sampleA2A)).toBe(true);
    expect(a2aAgentCardParser.canParse('{"foo": "bar"}')).toBe(false);
  });

  it("parses A2A agent card correctly", () => {
    const result = a2aAgentCardParser.parse(
      sampleA2A,
      "https://example.com/.well-known/agent.json",
    );

    expect(result.card.name).toBe("Weather Agent");
    expect(result.card.description).toContain("real-time weather");
    expect(result.card.type).toBe("remote");
    expect(result.card.endpoint).toBe("https://weather-agent.example.com");
    expect(result.card.version).toBe("1.0");
    expect(result.card.protocols).toEqual(["a2a"]);
    expect(result.card.capabilities).toHaveLength(2);
    expect(result.card.capabilities![0].name).toBe("Get Weather");
    expect(result.card.auth?.type).toBe("api_key");
    expect(result.sourceFormat).toBe("a2a-agent-card");
    expect(result.confidence).toBe(0.95);
  });

  it("maps oauth authentication scheme", () => {
    const data = JSON.stringify({
      name: "OAuth Agent",
      description:
        "An agent protected by OAuth2 authentication for enterprise security compliance",
      url: "https://oauth.example.com",
      authentication: { schemes: ["oauth2"] },
    });
    const result = a2aAgentCardParser.parse(data, "test");
    expect(result.card.auth?.type).toBe("oauth2");
  });
});

describe("lobechatJsonParser", () => {
  const sampleLobechat = JSON.stringify({
    identifier: "writing-assistant",
    meta: {
      title: "Writing Assistant",
      description:
        "A helpful writing assistant that improves grammar, style, and clarity for any type of text",
      tags: ["writing", "grammar", "editing"],
    },
    author: "lobehub",
    homepage: "https://lobechat.com/agents/writing-assistant",
    version: "1",
  });

  it("detects LobeChat JSON by filename", () => {
    expect(lobechatJsonParser.canParse("{}", "lobechat-agents.json")).toBe(
      true,
    );
  });

  it("detects LobeChat JSON by structure", () => {
    expect(lobechatJsonParser.canParse(sampleLobechat)).toBe(true);
    expect(lobechatJsonParser.canParse('{"name": "not lobechat"}')).toBe(false);
  });

  it("parses LobeChat JSON correctly", () => {
    const result = lobechatJsonParser.parse(
      sampleLobechat,
      "https://lobechat.com/agents",
    );

    expect(result.card.name).toBe("Writing Assistant");
    expect(result.card.description).toContain("writing assistant");
    expect(result.card.author).toBe("lobehub");
    expect(result.card.type).toBe("prompt");
    expect(result.card.tags).toEqual(["writing", "grammar", "editing"]);
    expect(result.card.homepage).toBe(
      "https://lobechat.com/agents/writing-assistant",
    );
    expect(result.sourceFormat).toBe("lobechat-json");
    expect(result.confidence).toBe(0.9);
  });
});

describe("parseAny", () => {
  it("detects and parses A2A agent card", () => {
    const content = JSON.stringify({
      name: "Test Agent",
      description:
        "A comprehensive test agent for verifying format detection and parsing correctness",
      url: "https://test.example.com",
      skills: [],
    });
    const result = parseAny(content, "agent-card.json", "test-source");
    expect(result).not.toBeNull();
    expect(result!.sourceFormat).toBe("a2a-agent-card");
  });

  it("detects and parses LobeChat JSON", () => {
    const content = JSON.stringify({
      identifier: "test",
      meta: {
        title: "Test",
        description:
          "A test LobeChat agent used for verifying the parser detection and mapping logic",
      },
    });
    const result = parseAny(content, "test.json", "test-source");
    expect(result).not.toBeNull();
    expect(result!.sourceFormat).toBe("lobechat-json");
  });

  it("detects and parses SKILL.md", () => {
    const content = `---
name: Test Skill
description: A test skill for verifying SKILL.md parser detection and frontmatter extraction
author: tester
---
Prompt body.
`;
    const result = parseAny(content, "SKILL.md", "test-source");
    expect(result).not.toBeNull();
    expect(result!.sourceFormat).toBe("skill-md");
  });

  it("returns null for unrecognized format", () => {
    const result = parseAny("just plain text", "readme.txt", "test-source");
    expect(result).toBeNull();
  });
});
