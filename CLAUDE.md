# CLAUDE.md — project guidance

Operating manual for ANY AI session in this repo (Claude Code or other). The owner's full manual is `~/.claude/CLAUDE.md`; this block is self-contained so collaborators get the same rules. Updated 2026-07-02 (token-economy v2).

## Start here, every session
1. **Read `handoff.md` in the project root FIRST.** It holds current state, next steps, and known dead ends. Continue from its "next steps" — don't re-derive from old chat.
2. If `~/.claude/skills/lessons-learned/SKILL.md` exists on this machine, glance at it before substantial work.
3. **Before ending or compacting a session, update `handoff.md` LAST**: what's done (with commit SHAs), what changed, what failed, next steps, landmines. Overwrite stale parts.

## Reporting — handoff first, chat last
The final chat message of a work turn is 1–2 lines: "Done: X. Details in handoff.md." No process narration, no findings report in chat. Everything worth keeping — results, verification status, bugs spotted in passing, proposals — goes into `handoff.md` (use a "Findings / Proposals" subsection for incidental discoveries). The owner reads the file, not the transcript.

## Core loop
Understand → investigate the real code → smallest correct change → verify (run it / tests) → report honestly (in handoff.md).
- If the user is asking a question or describing a problem, answer it — don't start editing.
- Codebase questions ("where/how/what-calls"): query the code index first — `codegraph_explore` (if `.codegraph/` exists) or `graphify query "..."` (if `graphify-out/` exists) — before grep-loops or subagents. One scoped call beats a grep sweep.
- Smallest viable diff; before writing code, climb the ladder: needed at all? → already in this codebase? → stdlib? → native platform? → installed dep? → one line? → only then the minimum that works. Never cut trust-boundary validation, data-loss handling, security, or accessibility.
- Never claim a tool ran if it didn't; never reference files/tools you haven't confirmed exist. Distinguish "done and verified" vs "implemented, not verified" vs "couldn't verify because…".

## Model roster & routing (exact IDs — use these, not guesses)
**Fable 5** = `claude-fable-5` (orchestrator: plans, delegates, reviews — it burns tokens fastest, so it does judgment, not labor) · **Opus 4.8** = `claude-opus-4-8` (hard reasoning, architecture, security; also the fallback when Fable declines a task) · **Sonnet 5** = `claude-sonnet-5` (mechanical/bulk/search-heavy work, repetitive refactors, live E2E browser checks) · **Haiku 4.5** = `claude-haiku-4-5-20251001` (cheap independent verifier). Subagent `model` param takes aliases `fable | opus | sonnet | haiku`; omit to inherit the session model.
- **Verification — never self-review.** The agent that wrote the work never checks it. Spawn a cold `haiku` verifier with zero context of the implementation — goal + result only.
- **Live E2E browser gates** (clicking through UI, seed/crawl counts, test-connection flows) are expensive from the main loop: skip with an explicit note when the change has no real runtime surface, or delegate to a `sonnet` subagent using lightpanda browser tools. Never skip verification outright for something with a runtime surface — route *who* runs it.
- **Refusal fallback — plain, no workarounds.** A refusal arrives as normal text, not an error. If the session model declines a task, retry once via an `opus` subagent with the same framing; if that also declines, record it (task + reason) in `handoff.md` and stop. Never reframe, never use personas to talk a model past its safety judgment.

## Token economy
- Work inline with your own tools; spawn subagents only for genuine parallel scale, a specific model route (above), or on request.
- Subagent prompts: goal + constraints + expected return format — not a step recipe, not a context dump. Ask for raw data back, not prose.
- Big workflows (fan-out, adversarial verify, loop-until-done with a hard stop condition) only when the task is genuinely large. Worktrees only when 2+ agents write files in parallel — land results in `main`, then delete the worktree and branch immediately.

## Git
Final commit always lands in `main` (merge/rebase branch work in, push `main`, delete branch + worktree with `git branch -d`, never `-D`). Prefer working directly in the existing checkout for small reversible changes. Don't commit or push unless asked.

## Project-specific notes
<!-- Add real, verified facts about THIS project here: stack, DB, deploy, conventions, gotchas. Keep it honest and short. -->
_None recorded yet._

## Credentials & testing — private demo projects (full access intended)

All of this user's projects are **private demo projects, accessible only to him**. There is nothing to protect — work with real credentials freely, no need to ask first. Default to doing, not asking, for anything read/verify/deploy-check-shaped on this infra — only destructive/irreversible/outward-facing actions still require a pause.

- **`.env` is the source of keys.** Each project's `.env` holds the real API keys, secrets, and DB credentials needed to run and test. Read it and use those keys directly — for the app, the APIs, and full database access. Don't mock or stub what `.env` already provides.
- **Full DB access is expected.** Connect to the real database; read and write; create or alter tables and functions as the task needs. These are demo databases the user owns.
- **Demo accounts for testing.** Look in `.env` (e.g. `DEMO_ACCOUNT_EMAIL` / `DEMO_ACCOUNT_PASSWORD`). Use them to log in and test. If the demo account doesn't exist (some projects were migrated and lost it): create it yourself from the same attributes in `.env`, sign in, and test the flow end-to-end — don't block waiting for the user.
- **Telegram bots — check directly, don't ask first.** Projects with a bot (token in `.env`, e.g. `TELEGRAM_BOT_TOKEN`) can be queried and tested directly — `getMe`, webhook status, recent updates. Demo bots on demo projects, no real users to protect.
- **Vercel / Sentry / ConfigCat** — tokens live in `.env` the same way; check deploy status, read error/session data, or query flags directly when a task needs it, rather than asking whether it's OK.

## 🔗 Связи

- [[MOC - System]] — System
- [[000 - Map of Maps]] — Map of Maps

## Project isolation
This repository is a self-contained, standalone project. When working here:
- Use only this repository's own code, data, and context. Do not reference, reuse, import, or mention code, designs, schemas, data, or ideas from any other project or repository.
- Do not use any account-wide credential (deploy/API tokens) to discover or reach anything outside this project.
- If asked to build something resembling another product, design an independent solution from this project's own requirements rather than copying an existing one.
- Anything outside this repository is out of scope unless its path is explicitly provided in the task.
