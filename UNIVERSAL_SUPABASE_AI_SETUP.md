# UNIVERSAL_SUPABASE_AI_SETUP.md

## UNIVERSAL SOP FOR AI AGENTS — GITHUB × SUPABASE INTEGRATION

**Format:** Machine-to-Machine instruction document (Standard Operating Procedure)  
**Target audience:** LLM/AI agents setting up a new Supabase project in any empty GitHub repository  
**Purpose:** Fully portable, project-agnostic template — replace every `[PLACEHOLDER]` with real values before executing

> ⚠️ **STRICT RULE FOR AI AGENTS:** Before executing any step, substitute every `[PLACEHOLDER]` in this document with the actual values provided by the operator. Never execute SQL or shell commands that still contain literal bracket-placeholder text.

---

## 0. GLOSSARY OF PLACEHOLDERS

Replace every occurrence of these placeholders throughout this document with the real value for the target project:

| Placeholder | Meaning | Example format |
|---|---|---|
| `[YOUR_PROJECT_ID]` | Supabase project reference ID | `abcdefghijklmnop` (20-char alphanumeric) |
| `[YOUR_SUPABASE_URL]` | Full Supabase project URL | `https://[YOUR_PROJECT_ID].supabase.co` |
| `[YOUR_PUBLISHABLE_KEY]` | Public client key (replaces legacy `anon`) | `sb_publishable_...` |
| `[YOUR_SECRET_KEY]` | Server-side automation key (replaces legacy `service_role`) | `sb_secret_...` |
| `[YOUR_DB_PASSWORD]` | PostgreSQL database password for the project | set during project creation |
| `[YOUR_ACCESS_TOKEN]` | Supabase personal access token | from supabase.com/dashboard/account/tokens |
| `[YOUR_TABLE_NAME]` | Primary data table name (snake_case) | `products`, `articles`, `user_profiles` |
| `[YOUR_GITHUB_REPO]` | GitHub repository in `owner/repo` format | `my-org/my-app` |
| `[YOUR_TS_INTERFACE]` | TypeScript interface name for the data model | `Product`, `Article` |
| `[YOUR_DATA_SOURCE_PATH]` | Import path for your data array in TypeScript | `./src/data/items` |
| `[YOUR_DATA_ARRAY_EXPORT]` | Named export of the data array | `allItems` |
| `[YOUR_UNIQUE_KEY_FIELD]` | The primary unique field for upsert conflict resolution | `id`, `slug`, `sku` |
| `[YOUR_TEXT_SEARCH_FIELDS]` | Comma-separated columns to index for full-text search | `title, description` |
| `[YOUR_FTS_LANGUAGE]` | PostgreSQL text-search language config | `english`, `russian`, `simple` |
| `[YOUR_FILTER_COLUMN_1]` | A commonly filtered column (for index) | `category`, `status` |
| `[YOUR_FILTER_COLUMN_2]` | A second commonly filtered column (for index) | `type`, `region` |
| `[YOUR_SORT_COLUMN]` | Column used for default sort order | `created_at`, `score` |
| `[YOUR_TYPES_OUTPUT_PATH]` | Path where generated TypeScript types are written | `src/integrations/supabase/types.ts` |
| `[YOUR_CLIENT_PATH]` | Path where the Supabase client is instantiated | `src/integrations/supabase/client.ts` |
| `[YOUR_REGISTRY_PATH]` | Path to the JSON array of all occupied unique IDs | `src/data/_id_registry.json` |

---

## 1. PROJECT CONTEXT

Fill this table before starting any automated step:

| Field | Value |
|---|---|
| Supabase project ID | `[YOUR_PROJECT_ID]` |
| Supabase URL | `[YOUR_SUPABASE_URL]` |
| Client location | `[YOUR_CLIENT_PATH]` |
| Types location | `[YOUR_TYPES_OUTPUT_PATH]` |
| Publishable key | stored in `[YOUR_CLIENT_PATH]` — **public**, safe for frontend |
| Secret key | **NOT committed** — supplied via environment variable `SUPABASE_SECRET_KEY` |
| GitHub repository | `[YOUR_GITHUB_REPO]` |

---

## 2. KEY TYPES — SECURITY MODEL (2025–2026 STANDARD)

> ⚠️ The legacy `anon` and `service_role` JWT keys are **deprecated** as of 2025 and will be fully removed by end of 2026. All new projects must use the keys described below.

| Aspect | Publishable Key | Secret Key |
|---|---|---|
| Replaces | legacy `anon` | legacy `service_role` |
| Key prefix | `sb_publishable_...` | `sb_secret_...` |
| Cryptography | Asymmetric ES256 | Asymmetric ES256 |
| Where to use | Frontend / public CI scripts | Server-side, GitHub Actions, Edge Functions |
| Bypasses RLS | **No** — always bound by RLS policies | **Yes** — full access |
| OpenAPI schema exposure | Restricted (schema not publicly leaked) | Restricted |
| Revocation | Instant, without affecting other keys or user sessions | Instant, without affecting other keys or user sessions |
| GitHub Secret Scanning | Auto-detected and auto-revoked if committed | Auto-detected and auto-revoked if committed |

**Environment variable names to use everywhere:**

```
SUPABASE_URL=[YOUR_SUPABASE_URL]
SUPABASE_PUBLISHABLE_KEY=[YOUR_PUBLISHABLE_KEY]
SUPABASE_SECRET_KEY=[YOUR_SECRET_KEY]
```

> **AI agent rule:** Never use variable names `SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_ROLE_KEY` in new code. Always use `SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY`.

---

## 3. SUPABASE CLIENT SETUP

### 3.1 Install the Supabase JS client

```bash
npm install @supabase/supabase-js
```

### 3.2 Create the client file at `[YOUR_CLIENT_PATH]`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '[YOUR_TYPES_OUTPUT_PATH]';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
```

### 3.3 Environment variables for local development (`.env.local` — **never commit**)

```
VITE_SUPABASE_URL=[YOUR_SUPABASE_URL]
VITE_SUPABASE_PUBLISHABLE_KEY=[YOUR_PUBLISHABLE_KEY]
```

Add `.env.local` to `.gitignore` if not already present.

---

## 4. DATA MODEL — TYPESCRIPT SOURCE OF TRUTH

Define your TypeScript interface first. The database schema in §5 is derived from it.

```typescript
// Example: adapt field names and types to your domain
export interface [YOUR_TS_INTERFACE] {
  [YOUR_UNIQUE_KEY_FIELD]: string;  // primary key / slug / id
  // --- add all fields of your data model here ---
  // TEXT fields       → string
  // INTEGER fields    → number
  // BOOLEAN fields    → boolean
  // ARRAY fields      → string[] | number[]
  // OPTIONAL fields   → fieldName?: Type  (maps to nullable SQL column)
  created_at?: string;   // auto-set by DB
  updated_at?: string;   // auto-set by DB trigger
}
```

**Naming convention:** TypeScript `camelCase` → SQL `snake_case`.  
Examples: `namedAfter` → `named_after`, `firstName` → `first_name`.

---

## 5. DATABASE SCHEMA

### 5.1 Create the main table (idempotent)

```sql
-- Idempotent: safe to run multiple times
create table if not exists public.[YOUR_TABLE_NAME] (
  [YOUR_UNIQUE_KEY_FIELD] text        primary key,
  -- add columns matching your TypeScript interface:
  -- example_text_col      text        not null,
  -- example_optional_col  text,
  -- example_int_col        smallint    not null check (example_int_col between 1 and 100),
  -- example_array_col      text[]      not null default '{}',
  -- example_bool_col       boolean     not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
```

> Replace the comment placeholders with the actual columns from your TypeScript interface.

### 5.2 Indexes

```sql
-- Index for [YOUR_FILTER_COLUMN_1] (common filter)
create index if not exists idx_[YOUR_TABLE_NAME]_[YOUR_FILTER_COLUMN_1]
  on public.[YOUR_TABLE_NAME] ([YOUR_FILTER_COLUMN_1]);

-- Index for [YOUR_FILTER_COLUMN_2] (common filter)
create index if not exists idx_[YOUR_TABLE_NAME]_[YOUR_FILTER_COLUMN_2]
  on public.[YOUR_TABLE_NAME] ([YOUR_FILTER_COLUMN_2]);

-- Index for sort column
create index if not exists idx_[YOUR_TABLE_NAME]_[YOUR_SORT_COLUMN]
  on public.[YOUR_TABLE_NAME] ([YOUR_SORT_COLUMN] desc);

-- Full-text search index over key text fields
create index if not exists idx_[YOUR_TABLE_NAME]_fts
  on public.[YOUR_TABLE_NAME]
  using gin(to_tsvector('[YOUR_FTS_LANGUAGE]', [YOUR_TEXT_SEARCH_FIELDS]));
```

### 5.3 Auto-update `updated_at` trigger

```sql
-- Shared trigger function (idempotent)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Attach trigger to [YOUR_TABLE_NAME] (drop first for idempotency)
drop trigger if exists trg_[YOUR_TABLE_NAME]_updated_at on public.[YOUR_TABLE_NAME];
create trigger trg_[YOUR_TABLE_NAME]_updated_at
  before update on public.[YOUR_TABLE_NAME]
  for each row execute function public.set_updated_at();
```

---

## 6. ROW LEVEL SECURITY (RLS)

### 6.1 Enable RLS

```sql
alter table public.[YOUR_TABLE_NAME] enable row level security;
```

### 6.2 Policies

Adapt policies to your access pattern. The examples below cover the most common scenario — public read, server-only write:

```sql
-- POLICY: Anyone (including anonymous) can read all rows
-- Drop first for idempotency
drop policy if exists "allow_public_read" on public.[YOUR_TABLE_NAME];
create policy "allow_public_read"
  on public.[YOUR_TABLE_NAME]
  for select
  to anon, authenticated
  using (true);

-- POLICY: Only secret-key (server-side) callers can write
drop policy if exists "allow_secret_write" on public.[YOUR_TABLE_NAME];
create policy "allow_secret_write"
  on public.[YOUR_TABLE_NAME]
  for all
  to service_role
  using (true)
  with check (true);
```

> **Security principle:** The publishable key (exposed in frontend) can only SELECT (bound by RLS).  
> All INSERT/UPDATE/DELETE operations must use `SUPABASE_SECRET_KEY` server-side.

---

## 7. IDEMPOTENCY PATTERNS — REFERENCE

An AI agent must always generate idempotent SQL. Use these canonical patterns:

### 7.1 Tables and columns

```sql
create table if not exists public.[YOUR_TABLE_NAME] (...);

-- Add a column only if it does not exist
alter table public.[YOUR_TABLE_NAME]
  add column if not exists new_column text;
```

### 7.2 Indexes

```sql
create index if not exists idx_[YOUR_TABLE_NAME]_col_name
  on public.[YOUR_TABLE_NAME] (col_name);
```

### 7.3 Functions

```sql
-- "create or replace" is inherently idempotent
create or replace function public.my_function()
returns void language plpgsql as $$ begin ... end; $$;
```

### 7.4 Triggers

```sql
-- Drop before recreate for full idempotency
drop trigger if exists trg_name on public.[YOUR_TABLE_NAME];
create trigger trg_name ...;
```

### 7.5 RLS Policies

```sql
-- Drop before recreate for full idempotency
drop policy if exists "policy_name" on public.[YOUR_TABLE_NAME];
create policy "policy_name" on public.[YOUR_TABLE_NAME] ...;
```

> **AI agent rule:** Never generate raw `CREATE TABLE`, `CREATE INDEX`, `CREATE TRIGGER`, or `CREATE POLICY` without the appropriate `IF NOT EXISTS` / `DROP IF EXISTS` guard. Every migration file must be re-runnable without errors.

---

## 8. MIGRATION STEPS (SEQUENTIAL)

Execute these steps in order. Each step references the SQL section above.

| Step | Action | Source |
|---|---|---|
| 1 | Create table | §5.1 |
| 2 | Create indexes | §5.2 |
| 3 | Create `set_updated_at` function and trigger | §5.3 |
| 4 | Enable RLS | §6.1 |
| 5 | Create RLS policies | §6.2 |
| 6 | Seed data | §9 |
| 7 | Regenerate TypeScript types | §10 |
| 8 | Verify | §11 |

---

## 9. DATA SEEDING

Use the secret key to seed data. Never seed from a publishable/anon key.

```typescript
import { createClient } from '@supabase/supabase-js';
import { [YOUR_DATA_ARRAY_EXPORT] } from '[YOUR_DATA_SOURCE_PATH]';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!   // server-side secret key, never publishable
);

// Map TypeScript camelCase to SQL snake_case as needed
const rows = [YOUR_DATA_ARRAY_EXPORT].map(item => ({
  [YOUR_UNIQUE_KEY_FIELD]: item.[YOUR_UNIQUE_KEY_FIELD],
  // map other fields:
  // sql_column_name: item.tsFieldName ?? null,
}));

const { error } = await supabase
  .from('[YOUR_TABLE_NAME]')
  .upsert(rows, { onConflict: '[YOUR_UNIQUE_KEY_FIELD]' });

if (error) throw error;
console.log(`Seeded ${rows.length} records into [YOUR_TABLE_NAME].`);
```

---

## 10. REGENERATE TYPESCRIPT TYPES

Run this after any schema change to keep the TypeScript types in sync:

```bash
npx supabase gen types typescript \
  --project-id [YOUR_PROJECT_ID] \
  --schema public \
  > [YOUR_TYPES_OUTPUT_PATH]
```

Commit the updated `[YOUR_TYPES_OUTPUT_PATH]` to source control.

---

## 11. VERIFICATION QUERIES

After migration and seeding, run these checks in the Supabase SQL Editor:

```sql
-- 1. Confirm the table exists and has the expected row count
select count(*) from public.[YOUR_TABLE_NAME];
-- Expected: equals the number of records in [YOUR_DATA_SOURCE_PATH]

-- 2. Confirm no duplicate primary keys
select [YOUR_UNIQUE_KEY_FIELD], count(*) as cnt
from public.[YOUR_TABLE_NAME]
group by [YOUR_UNIQUE_KEY_FIELD]
having count(*) > 1;
-- Expected: 0 rows

-- 3. Confirm RLS is enabled
select relname, relrowsecurity
from pg_class
where relname = '[YOUR_TABLE_NAME]';
-- Expected: relrowsecurity = true

-- 4. Spot-check a known record (substitute a real key value)
select * from public.[YOUR_TABLE_NAME]
where [YOUR_UNIQUE_KEY_FIELD] = '<known_value>';
-- Expected: 1 row with correct data
```

---

## 12. ID / PRIMARY KEY UNIQUENESS CONTRACT

> Apply this section if your project maintains a JSON registry of occupied IDs.

- **Source of truth for occupied IDs:** `[YOUR_REGISTRY_PATH]`
- This file must be a flat JSON array of strings (sorted alphabetically)
- Before inserting any new record, an AI agent **MUST**:
  1. Load `[YOUR_REGISTRY_PATH]`
  2. Verify the new `[YOUR_UNIQUE_KEY_FIELD]` is **NOT** already in the array
  3. After a successful insert, append the new ID and re-sort the array
- **Collision resolution:** if two records share the same romanized key from different contexts, append a disambiguating suffix (e.g., `item` vs `item_v2`, or `item_en` vs `item_fr`)

---

## 13. GITHUB ACTIONS — AUTOMATED MIGRATION

### 13.1 Required GitHub repository secrets

Set these in **Settings → Secrets and variables → Actions**:

| Secret name | Value |
|---|---|
| `SUPABASE_ACCESS_TOKEN` | Personal access token from supabase.com/dashboard/account/tokens |
| `SUPABASE_DB_PASSWORD` | Database password for the project |
| `SUPABASE_PROJECT_ID` | `[YOUR_PROJECT_ID]` |
| `SUPABASE_SECRET_KEY` | `[YOUR_SECRET_KEY]` (for seeding scripts that run server-side) |

### 13.2 Migration workflow

Create the file `.github/workflows/supabase-migrate.yml`:

```yaml
name: Supabase Migration

on:
  push:
    branches: [main]
    paths:
      - 'supabase/migrations/**'

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Link Supabase project
        run: supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_ID }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Push migrations
        run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
```

> **Note:** This workflow triggers automatically when any file under `supabase/migrations/` is pushed to `main`. The Supabase CLI applies only unapplied migrations (it tracks history in the `supabase_migrations` schema).

### 13.3 Migration file naming convention

Place SQL migration files in `supabase/migrations/` using UTC timestamp prefix:

```
supabase/migrations/
  YYYYMMDDHHmmss_create_[YOUR_TABLE_NAME].sql
  YYYYMMDDHHmmss_create_indexes.sql
  YYYYMMDDHHmmss_enable_rls.sql
```

Example:
```
supabase/migrations/
  20260101000000_create_products.sql
  20260101000001_create_indexes.sql
  20260101000002_enable_rls.sql
```

---

## 14. GITHUB COPILOT INTEGRATION (VS CODE)

### 14.1 Setup

1. Install the **Supabase extension** for VS Code (ID: `Supabase.supabase-vscode`).
2. Run `supabase login` in the terminal (authenticates with `[YOUR_ACCESS_TOKEN]`).
3. Run `supabase link --project-ref [YOUR_PROJECT_ID]` to connect the local CLI to the cloud project.

### 14.2 Generating migrations with Copilot

Use the `@supabase` chat participant in VS Code Copilot Chat:

```
@supabase /migration <describe your schema change in natural language>
```

**Best-practice prompt template:**

```
@supabase /migration
Create [describe the table or feature].
Requirements:
- Use IF NOT EXISTS / DROP IF EXISTS for full idempotency
- All SQL lowercase with inline comments
- Enable RLS; add a public-read policy and a secret-write-only policy
- Add indexes for [YOUR_FILTER_COLUMN_1], [YOUR_FILTER_COLUMN_2], and [YOUR_SORT_COLUMN]
- Add a full-text search index on [YOUR_TEXT_SEARCH_FIELDS] using [YOUR_FTS_LANGUAGE]
- Add an auto-updating updated_at trigger
- File should be placed in supabase/migrations/ with timestamp prefix
```

### 14.3 Applying the generated migration

```bash
# Review the generated file, then push:
supabase db push
```

---

## 15. CLIENT USAGE PATTERNS

### 15.1 Import the client

```typescript
import { supabase } from "[YOUR_CLIENT_PATH]";
```

### 15.2 Fetch all rows (paginated)

```typescript
const { data, error } = await supabase
  .from('[YOUR_TABLE_NAME]')
  .select('*')
  .order('[YOUR_SORT_COLUMN]', { ascending: false })
  .range(0, 49); // first 50 rows
```

### 15.3 Filter by column values

```typescript
const { data } = await supabase
  .from('[YOUR_TABLE_NAME]')
  .select('*')
  .eq('[YOUR_FILTER_COLUMN_1]', 'some_value')
  .eq('[YOUR_FILTER_COLUMN_2]', 'another_value');
```

### 15.4 Pattern / full-text search

```typescript
// Simple ILIKE pattern search (no extra column required)
const { data } = await supabase
  .from('[YOUR_TABLE_NAME]')
  .select('*')
  .or(`[YOUR_TEXT_SEARCH_FIELDS].ilike.%${query}%`);

// Supabase native full-text search (requires tsvector column — see §5.2)
const { data } = await supabase
  .from('[YOUR_TABLE_NAME]')
  .select('*')
  .textSearch('fts', query, { config: '[YOUR_FTS_LANGUAGE]' });
```

### 15.5 Array-contains filter

```typescript
// Match rows where an array column contains all specified values
const { data } = await supabase
  .from('[YOUR_TABLE_NAME]')
  .select('*')
  .contains('array_column_name', ['value1', 'value2']);
```

---

## 16. CONSTRAINTS AND INVARIANTS

### An AI agent MUST NOT:

- Delete any record from `[YOUR_TABLE_NAME]` without also removing the ID from `[YOUR_REGISTRY_PATH]`
- Insert a record with an ID already present in `[YOUR_REGISTRY_PATH]`
- Use the **publishable key** for write operations (INSERT / UPDATE / DELETE)
- Commit `SUPABASE_SECRET_KEY` to source control
- Disable RLS on `[YOUR_TABLE_NAME]`
- Create policies that allow unauthenticated writes
- Generate `CREATE TABLE` / `CREATE INDEX` / `CREATE POLICY` / `CREATE TRIGGER` without idempotency guards
- Use legacy variable names `SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_ROLE_KEY` in new code

### An AI agent MUST:

- Always use `upsert` with `onConflict: '[YOUR_UNIQUE_KEY_FIELD]'` when seeding to avoid duplicate errors
- Regenerate `[YOUR_TYPES_OUTPUT_PATH]` after any schema change
- Keep `[YOUR_REGISTRY_PATH]` sorted and deduplicated after any ID addition
- Validate all new entries against `[YOUR_TS_INTERFACE]` TypeScript interface before insertion
- Use `SUPABASE_SECRET_KEY` (never publishable key) for any server-side or CI/CD write operations
- Use `IF NOT EXISTS` / `DROP IF EXISTS` / `CREATE OR REPLACE` in every migration file

---

## 17. CHECKLIST — FULL SETUP FROM SCRATCH

Use this checklist when connecting a brand-new GitHub repository to a new Supabase project:

- [ ] Create Supabase project at supabase.com; note `[YOUR_PROJECT_ID]`, `[YOUR_SUPABASE_URL]`, `[YOUR_DB_PASSWORD]`
- [ ] Generate a **Publishable Key** (`sb_publishable_...`) from the project dashboard
- [ ] Generate a **Secret Key** (`sb_secret_...`) from the project dashboard (label it, e.g., "github-actions")
- [ ] Generate a **Personal Access Token** from supabase.com/dashboard/account/tokens
- [ ] Add secrets to GitHub repo: `SUPABASE_PROJECT_ID`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_SECRET_KEY`
- [ ] Install `@supabase/supabase-js` in the project: `npm install @supabase/supabase-js`
- [ ] Install Supabase CLI: `npm install --save-dev supabase` or `brew install supabase/tap/supabase`
- [ ] Run `supabase login` and `supabase link --project-ref [YOUR_PROJECT_ID]`
- [ ] Create `[YOUR_CLIENT_PATH]` using the template in §3.2
- [ ] Add `.env.local` to `.gitignore`
- [ ] Write the migration SQL (§5–§6) into `supabase/migrations/YYYYMMDDHHmmss_init.sql`
- [ ] Run `supabase db push` to apply the migration
- [ ] Run type generation (§10)
- [ ] Create `.github/workflows/supabase-migrate.yml` (§13.2)
- [ ] Seed data using the script in §9
- [ ] Run verification queries (§11)
- [ ] Confirm row count, no duplicate keys, RLS enabled
