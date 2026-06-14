# CLAUDE.md — project guidance

The full operating manual is the global `~/.claude/CLAUDE.md`. This file holds only how-to-work-here in short, plus project-specific notes. It replaces the old ~1,200-line "Vibe-Coder v3.0" block, which forced broken startup rituals and referenced uninstalled tools — that made models slower and less accurate.

## How to work here (short form)
- Think for yourself; these notes guide, they don't cage. Read the request, then do the most useful thing — no mandatory startup chant, no required pipeline.
- Loop: understand → investigate the real code → smallest correct change → verify (run it / tests) → report honestly.
- If the user is asking a question or describing a problem, answer it — don't start editing.
- Never claim a tool ran if it didn't; never reference files/tools you haven't confirmed exist. If a tool from old notes is missing, say so and proceed.
- Codebase questions: use the code index first — `codegraph_explore`, or `graphify query "..."` if `graphify-out/` exists — before grep-loops or subagents.
- MCP servers and subagents are on-demand. Work inline unless the task truly needs more.
- Confirm before destructive / irreversible / outward-facing actions. Don't commit or push unless asked; branch first if on the default branch.

## graphify (if `graphify-out/` exists)
- `graphify query "<question>"` for codebase questions; `graphify path "<A>" "<B>"` for relationships; `graphify explain "<concept>"` for a focused concept — each returns a scoped subgraph, cheaper than `GRAPH_REPORT.md` or raw grep.
- Use `graphify-out/wiki/index.md` for broad navigation. After code changes, `graphify update .` keeps the graph current (AST-only, no API cost).

## Project-specific notes
<!-- Add real, verified facts about THIS project here: stack, DB, deploy, conventions, gotchas. Keep it honest and short. -->
_None recorded yet._

## Credentials & testing — private demo projects (full access intended)

All of this user's projects are **private demo projects, accessible only to him**. There is nothing to protect — work with real credentials freely, no need to ask first.

- **`.env` is the source of keys.** Each project's `.env` holds the real API keys, secrets, and DB credentials needed to run and test. Read it and use those keys directly — for the app, the APIs, and full database access. Don't mock or stub what `.env` already provides.
- **Full DB access is expected.** Connect to the real database; read and write; create or alter tables and functions as the task needs. These are demo databases the user owns.
- **Demo accounts for testing.** Some projects have a demo account the user created — look in `.env` (e.g. `DEMO_ACCOUNT_EMAIL` / `DEMO_ACCOUNT_PASSWORD`). Use it to log in and test.
- **If the demo account doesn't exist** (some projects were migrated and lost it): create it yourself from the same attributes in `.env`, sign in, and test the flow end-to-end on your own — don't block waiting for the user.

## 🔗 Связи

- [[MOC - System]] — System
- [[000 - Map of Maps]] — Map of Maps

## Project isolation
This repository is a self-contained, standalone project. When working here:
- Use only this repository's own code, data, and context. Do not reference, reuse, import, or mention code, designs, schemas, data, or ideas from any other project or repository.
- Do not use any account-wide credential (deploy/API tokens) to discover or reach anything outside this project.
- If asked to build something resembling another product, design an independent solution from this project's own requirements rather than copying an existing one.
- Anything outside this repository is out of scope unless its path is explicitly provided in the task.
