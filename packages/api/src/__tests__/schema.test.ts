import { describe, it, expect } from "vitest";
import {
  creators,
  agents,
  agentCapabilities,
  teams,
  teamMembers,
  votes,
  healthChecks,
  reports,
} from "../db/schema.js";

describe("Database Schema", () => {
  it("exports all required tables", () => {
    expect(creators).toBeDefined();
    expect(agents).toBeDefined();
    expect(agentCapabilities).toBeDefined();
    expect(teams).toBeDefined();
    expect(teamMembers).toBeDefined();
    expect(votes).toBeDefined();
    expect(healthChecks).toBeDefined();
    expect(reports).toBeDefined();
  });

  it("creators table has correct columns", () => {
    const columns = Object.keys(creators);
    expect(columns).toContain("id");
    expect(columns).toContain("githubId");
    expect(columns).toContain("username");
    expect(columns).toContain("displayName");
    expect(columns).toContain("avatarUrl");
    expect(columns).toContain("bio");
    expect(columns).toContain("publicRepos");
    expect(columns).toContain("followers");
    expect(columns).toContain("isVerified");
    expect(columns).toContain("isOfficial");
  });

  it("agents table has correct columns", () => {
    const columns = Object.keys(agents);
    expect(columns).toContain("id");
    expect(columns).toContain("creatorId");
    expect(columns).toContain("name");
    expect(columns).toContain("slug");
    expect(columns).toContain("description");
    expect(columns).toContain("type");
    expect(columns).toContain("category");
    expect(columns).toContain("tags");
    expect(columns).toContain("agentCard");
    expect(columns).toContain("upvotes");
    expect(columns).toContain("downvotes");
    expect(columns).toContain("downloads");
    expect(columns).toContain("frameworks");
    expect(columns).toContain("status");
    expect(columns).toContain("healthStatus");
  });

  it("votes table has correct columns", () => {
    const columns = Object.keys(votes);
    expect(columns).toContain("id");
    expect(columns).toContain("creatorId");
    expect(columns).toContain("agentId");
    expect(columns).toContain("vote");
  });

  it("health checks table has correct columns", () => {
    const columns = Object.keys(healthChecks);
    expect(columns).toContain("id");
    expect(columns).toContain("agentId");
    expect(columns).toContain("status");
    expect(columns).toContain("latencyMs");
    expect(columns).toContain("conformance");
  });

  it("reports table has correct columns", () => {
    const columns = Object.keys(reports);
    expect(columns).toContain("id");
    expect(columns).toContain("agentId");
    expect(columns).toContain("reporterId");
    expect(columns).toContain("reason");
    expect(columns).toContain("detail");
    expect(columns).toContain("resolved");
  });

  it("team members has composite primary key fields", () => {
    const columns = Object.keys(teamMembers);
    expect(columns).toContain("teamId");
    expect(columns).toContain("agentId");
    expect(columns).toContain("role");
    expect(columns).toContain("position");
  });
});
