import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { parseRepo } from "../github.js";
import { extractRepoLinks } from "../crawlers/awesome-list.js";

describe("parseRepo", () => {
  it("parses owner/repo", () => {
    expect(parseRepo("anthropic/claude")).toEqual({
      owner: "anthropic",
      repo: "claude",
    });
  });

  it("parses https URL", () => {
    expect(parseRepo("https://github.com/anthropic/claude")).toEqual({
      owner: "anthropic",
      repo: "claude",
    });
  });

  it("strips .git suffix", () => {
    expect(parseRepo("https://github.com/anthropic/claude.git")).toEqual({
      owner: "anthropic",
      repo: "claude",
    });
  });

  it("strips trailing slash", () => {
    expect(parseRepo("anthropic/claude/")).toEqual({
      owner: "anthropic",
      repo: "claude",
    });
  });

  it("throws on invalid input", () => {
    expect(() => parseRepo("not-a-repo")).toThrow(/Invalid GitHub repo/);
    expect(() => parseRepo("")).toThrow();
    expect(() => parseRepo("/")).toThrow();
  });
});

describe("extractRepoLinks (awesome-list parsing)", () => {
  it("extracts simple markdown link", () => {
    const md = "- [Name](https://github.com/user/repo) - description";
    expect(extractRepoLinks(md)).toEqual([{ owner: "user", repo: "repo" }]);
  });

  it("extracts multiple links", () => {
    const md = `
### Category
- [A](https://github.com/alice/a)
- [B](https://github.com/bob/b)
- [C](http://github.com/carol/c)
`;
    expect(extractRepoLinks(md)).toEqual([
      { owner: "alice", repo: "a" },
      { owner: "bob", repo: "b" },
      { owner: "carol", repo: "c" },
    ]);
  });

  it("deduplicates case-insensitively", () => {
    const md = `
[A](https://github.com/user/repo)
[B](https://github.com/USER/REPO)
[C](https://github.com/user/repo)
`;
    expect(extractRepoLinks(md)).toHaveLength(1);
  });

  it("strips .git and anchors/queries from repo", () => {
    const md = `
[A](https://github.com/user/repo.git)
[B](https://github.com/user/repo2#readme)
[C](https://github.com/user/repo3?tab=readme)
`;
    const links = extractRepoLinks(md);
    expect(links.map((l) => l.repo)).toEqual(["repo", "repo2", "repo3"]);
  });

  it("skips known non-repo paths", () => {
    const md = `
[topics](https://github.com/topics/agents)
[search](https://github.com/search?q=agent)
[settings](https://github.com/settings/profile)
[valid](https://github.com/user/repo)
`;
    expect(extractRepoLinks(md)).toEqual([{ owner: "user", repo: "repo" }]);
  });

  it("ignores non-github links", () => {
    const md = `
[GitLab](https://gitlab.com/user/repo)
[NPM](https://npmjs.com/package/foo)
[GitHub](https://github.com/user/repo)
`;
    expect(extractRepoLinks(md)).toEqual([{ owner: "user", repo: "repo" }]);
  });

  it("handles empty input", () => {
    expect(extractRepoLinks("")).toEqual([]);
    expect(extractRepoLinks("no links here")).toEqual([]);
  });
});

describe("crawlRepo (mocked fetch)", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("returns empty results for archived repos when skipArchived=true (default)", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          full_name: "user/archived",
          description: "",
          homepage: null,
          stargazers_count: 0,
          forks_count: 0,
          default_branch: "main",
          topics: [],
          license: null,
          html_url: "https://github.com/user/archived",
          owner: { login: "user" },
          archived: true,
          fork: false,
        }),
        { status: 200 },
      ),
    );
    const { crawlRepo } = await import("../crawlers/github-repo.js");
    const result = await crawlRepo("user/archived");
    expect(result.repo.archived).toBe(true);
    expect(result.results).toEqual([]);
  });

  it("returns empty results for forks when skipForks=true (default)", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          full_name: "user/fork",
          description: "",
          homepage: null,
          stargazers_count: 0,
          forks_count: 0,
          default_branch: "main",
          topics: [],
          license: null,
          html_url: "https://github.com/user/fork",
          owner: { login: "user" },
          archived: false,
          fork: true,
        }),
        { status: 200 },
      ),
    );
    const { crawlRepo } = await import("../crawlers/github-repo.js");
    const result = await crawlRepo("user/fork");
    expect(result.repo.fork).toBe(true);
    expect(result.results).toEqual([]);
  });
});
