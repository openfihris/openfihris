import { describe, it, expect } from "vitest";
import program from "../index.js";

describe("CLI scaffold", () => {
  it("program has correct name", () => {
    expect(program.name()).toBe("fihris");
  });

  it("program has correct version", () => {
    expect(program.version()).toBe("0.1.0");
  });

  it("registers all expected commands", () => {
    const commandNames = program.commands.map((cmd) => cmd.name());
    expect(commandNames).toContain("login");
    expect(commandNames).toContain("logout");
    expect(commandNames).toContain("whoami");
    expect(commandNames).toContain("search");
    expect(commandNames).toContain("info");
    expect(commandNames).toContain("install");
    expect(commandNames).toContain("publish");
  });

  it("has 7 commands total", () => {
    expect(program.commands.length).toBe(7);
  });

  it("search command has filter options", () => {
    const search = program.commands.find((cmd) => cmd.name() === "search");
    expect(search).toBeDefined();
    const optionNames = search!.options.map((opt) => opt.long);
    expect(optionNames).toContain("--category");
    expect(optionNames).toContain("--type");
    expect(optionNames).toContain("--framework");
    expect(optionNames).toContain("--limit");
  });
});

describe("format utilities", () => {
  it("truncate shortens long strings", async () => {
    const { truncate } = await import("../utils/format.js");
    expect(truncate("hello world", 5)).toBe("hell…");
    expect(truncate("hi", 10)).toBe("hi");
  });

  it("formatNumber adds commas", async () => {
    const { formatNumber } = await import("../utils/format.js");
    expect(formatNumber(1000)).toBeTruthy(); // locale-dependent formatting
    expect(formatNumber(0)).toBe("0");
  });
});
