import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { creators, agents } from "./schema.js";

const SEED_CREATOR = {
  githubId: 1000000,
  username: "openfihris-demo",
  displayName: "OpenFihris Demo",
  avatarUrl: "https://avatars.githubusercontent.com/u/1000000",
  bio: "Demo account for seed data",
  publicRepos: 10,
  followers: 0,
  githubUrl: "https://github.com/openfihris-demo",
};

const SEED_AGENTS = [
  {
    name: "Security Code Review",
    description:
      "Reviews code for OWASP Top 10 vulnerabilities, SQL injection, XSS, and other security issues. Provides detailed findings with severity ratings and fix recommendations.",
    type: "skill",
    category: "Security",
    tags: ["security", "code-review", "owasp", "vulnerabilities", "audit"],
    frameworks: ["claude-code", "any"],
  },
  {
    name: "B2B Lead Generator",
    description:
      "Finds B2B leads by industry, company size, and role. Supports filtering by region and language. Outputs structured lead lists with company name, contact info, and LinkedIn profiles.",
    type: "skill",
    category: "Sales & Marketing",
    tags: ["leads", "b2b", "sales", "prospecting", "linkedin"],
    frameworks: ["any"],
  },
  {
    name: "Arabic Content Writer",
    description:
      "Writes professional content in Modern Standard Arabic and Gulf dialect. Handles blog posts, marketing copy, social media posts, and email campaigns with culturally appropriate tone.",
    type: "prompt",
    category: "Writing",
    tags: ["arabic", "content", "writing", "marketing", "localization"],
    frameworks: ["any"],
  },
  {
    name: "API Documentation Generator",
    description:
      "Generates comprehensive API documentation from source code. Supports OpenAPI/Swagger output, markdown docs, and interactive examples. Works with REST and GraphQL APIs.",
    type: "skill",
    category: "Development",
    tags: ["api", "documentation", "openapi", "swagger", "developer-tools"],
    frameworks: ["claude-code", "any"],
  },
  {
    name: "Data Pipeline Monitor",
    description:
      "Monitors ETL pipelines and data workflows for failures, latency spikes, and data quality issues. Sends alerts and generates incident reports with root cause analysis.",
    type: "remote",
    category: "Data",
    tags: ["etl", "monitoring", "data-quality", "pipelines", "alerts"],
    endpoint: "https://example.com/a2a",
    frameworks: ["any"],
  },
  {
    name: "Customer Support Triage",
    description:
      "Classifies incoming support tickets by urgency, category, and sentiment. Routes tickets to the right team and suggests relevant knowledge base articles for quick resolution.",
    type: "skill",
    category: "Customer Support",
    tags: ["support", "triage", "tickets", "classification", "helpdesk"],
    frameworks: ["openclaw", "any"],
  },
  {
    name: "Financial Report Analyzer",
    description:
      "Analyzes quarterly and annual financial reports. Extracts key metrics like revenue, margins, and growth rates. Compares against industry benchmarks and highlights anomalies.",
    type: "skill",
    category: "Finance",
    tags: ["finance", "reports", "analysis", "metrics", "accounting"],
    frameworks: ["any"],
  },
  {
    name: "CI/CD Pipeline Builder",
    description:
      "Generates GitHub Actions, GitLab CI, or CircleCI pipeline configurations from your project structure. Detects language, framework, and testing setup automatically.",
    type: "skill",
    category: "DevOps",
    tags: ["cicd", "github-actions", "deployment", "automation", "devops"],
    frameworks: ["claude-code", "any"],
  },
  {
    name: "Research Paper Summarizer",
    description:
      "Summarizes academic papers and research articles. Extracts key findings, methodology, limitations, and citations. Supports batch processing of multiple papers for literature reviews.",
    type: "skill",
    category: "Research",
    tags: ["research", "papers", "summarization", "academic", "literature"],
    frameworks: ["any"],
  },
  {
    name: "Product Design Reviewer",
    description:
      "Reviews UI/UX designs for accessibility, usability, and consistency. Checks against WCAG guidelines, platform conventions, and design system compliance. Provides actionable feedback.",
    type: "prompt",
    category: "Design",
    tags: ["design", "ux", "accessibility", "wcag", "ui-review"],
    frameworks: ["any"],
  },
  {
    name: "Meeting Notes to Action Items",
    description:
      "Converts meeting transcripts and notes into structured action items with owners, deadlines, and priorities. Tracks follow-ups and integrates with project management tools.",
    type: "skill",
    category: "Productivity",
    tags: [
      "meetings",
      "action-items",
      "productivity",
      "notes",
      "project-management",
    ],
    frameworks: ["any"],
  },
  {
    name: "Sales Outreach Team",
    description:
      "Full outbound sales pipeline: researches target companies, finds decision makers, validates emails, and drafts personalized cold outreach sequences. Works as a coordinated agent team.",
    type: "team",
    category: "Sales & Marketing",
    tags: ["sales", "outreach", "cold-email", "pipeline", "b2b"],
    frameworks: ["any"],
  },
];

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL environment variable is required");
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  console.log("Seeding database...");

  // Insert demo creator
  const [creator] = await db
    .insert(creators)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .values(SEED_CREATOR as any)
    .onConflictDoNothing()
    .returning({ id: creators.id });

  const creatorId = creator?.id;
  if (!creatorId) {
    console.log("Demo creator already exists, fetching ID...");
    const existing = await db
      .select({ id: creators.id })
      .from(creators)
      .where(
        (await import("drizzle-orm")).eq(
          creators.githubId,
          SEED_CREATOR.githubId,
        ),
      )
      .limit(1);
    if (existing.length === 0) {
      console.error("Failed to find or create demo creator");
      process.exit(1);
    }
    var resolvedCreatorId = existing[0].id;
  } else {
    var resolvedCreatorId = creatorId;
  }

  console.log(`Creator ID: ${resolvedCreatorId}`);

  // Insert seed agents
  let inserted = 0;
  for (const agent of SEED_AGENTS) {
    const slug = `@openfihris-demo/${agent.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")}`;

    try {
      await db
        .insert(agents)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .values({
          creatorId: resolvedCreatorId,
          name: agent.name,
          slug,
          description: agent.description,
          type: agent.type,
          category: agent.category,
          tags: agent.tags,
          frameworks: agent.frameworks,
          endpoint: agent.type === "remote" ? (agent as any).endpoint : null,
          agentCard: {
            schemaVersion: "1.0",
            name: agent.name,
            description: agent.description,
            author: "openfihris-demo",
            category: agent.category,
            tags: agent.tags,
            type: agent.type,
            frameworks: agent.frameworks,
            verifiedAuthor: false,
          },
          upvotes: Math.floor(Math.random() * 50),
          downloads: Math.floor(Math.random() * 500),
        } as any)
        .onConflictDoNothing();

      inserted++;
      console.log(`  ✓ ${agent.name} (${agent.type})`);
    } catch (err) {
      console.log(`  ✗ ${agent.name} — already exists or error`);
    }
  }

  console.log(`\nSeeded ${inserted} agents.`);
  console.log("Done!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
