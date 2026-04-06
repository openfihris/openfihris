export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-950 font-sans">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-6 pt-32 pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400 mb-8">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Open Source Agent Registry
        </div>
        <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
          The Open Registry for{" "}
          <span className="text-emerald-400">AI Agents</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400 sm:text-xl">
          Search, publish, and discover AI agents across every framework. Like
          npm, but for agents.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="https://github.com/openfihris/openfihris"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-emerald-500 px-8 text-base font-semibold text-white transition-colors hover:bg-emerald-400"
          >
            Get Started
          </a>
          <a
            href="https://openfihris-api.vercel.app/api/v1/trending"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-gray-700 px-8 text-base font-semibold text-gray-300 transition-colors hover:border-gray-500 hover:text-white"
          >
            Browse API
          </a>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-gray-800 bg-gray-900/50 py-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-8 px-6 sm:gap-16">
          {[
            { value: "12+", label: "Agents" },
            { value: "7", label: "Frameworks" },
            { value: "15", label: "Categories" },
            { value: "100%", label: "Open Source" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-emerald-400 sm:text-3xl">
                {stat.value}
              </span>
              <span className="text-sm text-gray-400">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24">
        <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">
          How It Works
        </h2>
        <p className="mt-4 text-center text-gray-400">
          Three steps to find and use any AI agent
        </p>
        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Search",
              description:
                "Find agents by name, category, or framework",
              icon: (
                <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              ),
            },
            {
              step: "2",
              title: "Install",
              description: "One command: fihris install @user/agent",
              code: "fihris install @user/agent",
            },
            {
              step: "3",
              title: "Publish",
              description: "Share your agents with fihris publish",
              code: "fihris publish",
            },
          ].map((card) => (
            <div
              key={card.step}
              className="group relative flex flex-col rounded-xl border border-gray-800 bg-gray-900/50 p-8 transition-colors hover:border-emerald-500/50"
            >
              <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-lg font-bold text-emerald-400">
                {card.step}
              </span>
              <h3 className="text-xl font-semibold text-white">{card.title}</h3>
              <p className="mt-2 text-gray-400">{card.description}</p>
              {card.code && (
                <code className="mt-4 block rounded-lg bg-gray-950 px-4 py-2.5 font-mono text-sm text-emerald-400">
                  $ {card.code}
                </code>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Frameworks Section */}
      <section className="border-t border-gray-800 bg-gray-900/30 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">
            Works With Every Framework
          </h2>
          <p className="mt-4 text-center text-gray-400">
            One registry, every AI agent ecosystem
          </p>
          <div className="mt-16 flex flex-wrap items-center justify-center gap-6">
            {[
              "Claude Code",
              "OpenClaw",
              "LangChain",
              "CrewAI",
              "Google ADK",
              "AutoGen",
              "Cursor",
            ].map((name) => (
              <div
                key={name}
                className="flex h-14 items-center justify-center rounded-xl border border-gray-800 bg-gray-900/50 px-6 text-sm font-medium text-gray-300 transition-colors hover:border-emerald-500/50 hover:text-emerald-400"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Terminal Example */}
      <section className="mx-auto w-full max-w-4xl px-6 py-24">
        <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">
          See It in Action
        </h2>
        <p className="mt-4 text-center text-gray-400">
          Search and install agents right from your terminal
        </p>
        <div className="mt-12 overflow-hidden rounded-xl border border-gray-800 bg-gray-950 shadow-2xl">
          {/* Terminal header */}
          <div className="flex items-center gap-2 border-b border-gray-800 bg-gray-900 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <span className="h-3 w-3 rounded-full bg-green-500/80" />
            <span className="ml-2 text-sm text-gray-500">terminal</span>
          </div>
          {/* Terminal body */}
          <pre className="overflow-x-auto p-6 font-mono text-sm leading-7">
            <code>
              <span className="text-emerald-400">$</span>
              <span className="text-gray-300">{" "}fihris search &quot;code review&quot;</span>
              {"\n"}
              <span className="text-gray-500">Found 3 agents:</span>
              {"\n"}
              <span className="text-white">{"  "}@alice/code-reviewer</span>
              <span className="text-yellow-400">{"    "}&#9733; 42</span>
              <span className="text-gray-500">{"  "}&darr; 128</span>
              {"\n"}
              <span className="text-white">{"  "}@bob/pr-helper</span>
              <span className="text-yellow-400">{"          "}&#9733; 38</span>
              <span className="text-gray-500">{"  "}&darr; 95</span>
              {"\n"}
              <span className="text-white">{"  "}@charlie/lint-agent</span>
              <span className="text-yellow-400">{"     "}&#9733; 21</span>
              <span className="text-gray-500">{"  "}&darr; 67</span>
              {"\n\n"}
              <span className="text-emerald-400">$</span>
              <span className="text-gray-300">{" "}fihris install @alice/code-reviewer</span>
              {"\n"}
              <span className="text-emerald-400">Installed</span>
              <span className="text-gray-300">{" "}@alice/code-reviewer v1.2.0</span>
            </code>
          </pre>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-800 bg-gray-900/50 py-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6">
          <div className="flex items-center gap-8 text-sm">
            <a
              href="https://github.com/openfihris/openfihris"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 transition-colors hover:text-emerald-400"
            >
              GitHub
            </a>
            <a
              href="https://openfihris-api.vercel.app/api/v1/trending"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 transition-colors hover:text-emerald-400"
            >
              API
            </a>
            <a
              href="https://github.com/openfihris/openfihris/tree/main/packages/cli"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 transition-colors hover:text-emerald-400"
            >
              CLI
            </a>
          </div>
          <p className="text-sm text-gray-500">
            Built by the OpenFihris community
          </p>
        </div>
      </footer>
    </div>
  );
}
