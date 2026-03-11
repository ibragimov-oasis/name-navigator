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
GitHub copilot + supabase. как мне сделать так чтобы гитхаб копайлот писал и делал поправки и все такое и сразу мог их с помощью sql сразу внедрить в supabase все нужные таблица и политики и все такое. с помощью action и publishable key and secret key. и все такое. короче найди в интернете и на пабликах и везде подробнуюшую инфу мне и на самом гитхабе ищи вдруг там тоже инфа есть.
Архитектура непрерывной интеграции и интеллектуального развертывания баз данных: Интеграция GitHub Copilot, GitHub Actions и экосистемы SupabaseРазвитие платформ предоставления бэкенда как услуги (Backend-as-a-Service, BaaS) и инструментов на базе искусственного интеллекта радикально трансформировало парадигму проектирования, развертывания и управления реляционными базами данных. Исторически управление изменениями в схемах баз данных (миграциями) являлось одним из самых узких мест в жизненном цикле разработки программного обеспечения. Ручное применение SQL-скриптов, рассинхронизация сред разработки и производственных серверов, а также ошибки человеческого фактора приводили к критическим сбоям и утечкам данных. Слияние технологий больших языковых моделей, представленных GitHub Copilot, и передовых платформ управления базами данных, таких как Supabase, открывает совершенно новые горизонты для полностью автоматизированного, идемпотентного и криптографически защищенного конвейера доставки кода.Данное исследование представляет собой исчерпывающий архитектурный и инженерный анализ методологии создания отказоустойчивых систем. В центре внимания находится процесс, в котором GitHub Copilot выступает в роли интеллектуального агента для написания, рефакторинга и корректировки SQL-миграций, а конвейеры GitHub Actions обеспечивают их непрерывное внедрение (CI/CD) в инфраструктуру Supabase. Особое внимание в отчете уделяется критическим аспектам написания идемпотентного кода («создать, если не существует, иначе — пропустить»), правильной реализации механизмов высоконагруженной пагинации и фундаментальному переходу на современные стандарты безопасности Supabase, внедренные в 2025–2026 годах. Этот переход знаменует собой полный отказ от устаревших anon и service_role ключей в пользу криптографически устойчивых publishable и secret ключей.Эволюция экосистемы безопасности Supabase (2025–2026 годы)Прежде чем переходить к автоматизации процессов через ИИ и CI/CD, необходимо детально проанализировать фундаментальные изменения в модели управления доступом Supabase. Любые скрипты, генерируемые GitHub Copilot, и любые конфигурации GitHub Actions должны строго соответствовать новой парадигме безопасности, которая переопределила способы взаимодействия клиентских приложений и серверных сервисов с базой данных.Критика устаревшей модели (anon и service_role)С момента своего основания и до 2025 года платформа Supabase полагалась на два основных типа JWT-ключей для аутентификации запросов к своему API-шлюзу (PostgREST): anon (для анонимных или клиентских запросов) и service_role (для серверных задач с повышенными привилегиями и обходом Row Level Security). Эти ключи имели один фундаментальный архитектурный недостаток: они являлись долгоживущими токенами (JSON Web Tokens), сгенерированными на основе единого симметричного JWT-секрета проекта (алгоритм HS256).Если ключ service_role оказывался скомпрометирован (например, случайный коммит в публичный репозиторий GitHub или утечка через переменные окружения), единственным способом предотвратить несанкционированный доступ к данным (поскольку service_role игнорирует любые политики безопасности RLS) была полная ротация мастер-секрета JWT проекта. Эта операция приводила к мгновенной инвалидации всех существующих сессий конечных пользователей, принудительному разлогиниванию всех клиентов и потенциальному простою производственных систем. Кроме того, старый ключ anon предоставлял неограниченный доступ к публичной спецификации OpenAPI проекта, что позволяло злоумышленникам извлекать полную схему базы данных, включая скрытые таблицы, и проводить перечисление (enumeration) векторов атак.Переход на Publishable и Secret ключиВ ответ на эти критические угрозы безопасности, начиная с середины 2025 года, платформа Supabase внедрила новую, значительно более надежную систему управления ключами, которая становится строго обязательной к концу 2026 года. Эта система опирается на асимметричную криптографию (алгоритм ES256, использующий пары открытых и закрытых ключей) и обеспечивает гранулярный контроль доступа.Разработчики и автоматизированные системы (такие как GitHub Copilot) теперь должны оперировать исключительно двумя новыми классами ключей:Publishable Key (sb_publishable_...): Этот ключ полностью заменяет устаревший anon ключ. Он предназначен для использования в клиентских средах (браузеры, мобильные приложения, публичные CI/CD скрипты) и обладает низким уровнем привилегий. Принципиальным отличием является то, что спецификация OpenAPI больше не доступна публично при использовании этого ключа, что предотвращает утечку архитектуры базы данных. В контексте взаимодействия с базой данных данный ключ предполагает строгую привязку к политикам Row Level Security (RLS).Secret Keys (sb_secret_...): Эти ключи заменяют service_role. В отличие от монолитного service_role, система позволяет создавать множество независимых секретных ключей для различных компонентов серверной инфраструктуры (один ключ для GitHub Actions, другой для Edge Functions, третий для микросервиса биллинга). Эти ключи обеспечивают полный доступ к данным, минуя RLS.Ключевым преимуществом новой системы является возможность мгновенного отзыва (instant revocation). При удалении конкретного sb_secret_... ключа доступ прекращается моментально, при этом остальные ключи и сессии конечных пользователей продолжают функционировать в штатном режиме. Более того, благодаря новому уникальному формату префиксов, ключи интегрированы с системой GitHub Secret Scanning. Если разработчик случайно зафиксирует такой ключ в публичном репозитории, система автоматически обнаружит его и моментально отзовет на стороне Supabase, предотвращая утечку данных.Для наглядности и использования в качестве референса при конфигурации систем автоматизации, ниже представлена таблица сравнения старой и новой парадигмы ключей:Архитектурный аспектУстаревшая модель (до 2025 г.)Современная модель (2025–2026 гг.)Ключ для публичного клиентаanon (JWT токен)Publishable Key (sb_publishable_...)Ключ для бэкенда и автоматизацииservice_role (JWT токен)Secret Keys (sb_secret_...)Обход политик безопасности (RLS)Да (только для service_role)Да (только для Secret Keys)Криптографический алгоритмСимметричный (HS256)Асимметричный (ES256)Раскрытие схемы OpenAPIПублично доступноСтрого ограниченоУстранение компрометацииРотация глобального JWT-секретаТочечное удаление скомпрометированного ключаПоддержка GitHub Secret ScanningОтсутствует / ЧастичнаяПолная автоматическая блокировкаНачиная с ноября 2025 года новые проекты больше не генерируют ключи anon и service_role. Любые проекты, восстановленные из резервных копий после этой даты, также лишаются поддержки устаревших ключей, а к концу 2026 года поддержка anon и service_role будет полностью удалена из платформы. Таким образом, при формулировании запросов к GitHub Copilot для настройки окружения или написания кода подключения, разработчик обязан требовать использование переменных среды SUPABASE_PUBLISHABLE_KEY и SUPABASE_SECRET_KEY.Интеллектуальная генерация схем и миграций через GitHub CopilotПроцесс разработки реляционных баз данных традиционно требовал глубоких знаний синтаксиса DDL (Data Definition Language) PostgreSQL и тонкостей настройки политик безопасности. С появлением GitHub Copilot и его интеграции с редакторами кода этот процесс перешел на уровень высокоуровневого декларативного описания намерений. Для обеспечения максимальной эффективности этого взаимодействия компания Supabase выпустила официальное расширение для Visual Studio Code, которое внедряет специализированного участника чата (Chat Participant) @supabase непосредственно в экосистему ИИ.Контекстуальное понимание базы данныхПроблема многих генеративных ИИ при написании SQL-кода заключается в «галлюцинациях» — нейросеть может выдумать названия таблиц, столбцов или связей, которых не существует в реальном проекте. Расширение Supabase решает эту проблему за счет глубокой интеграции с локальным CLI. Когда разработчик использует участника чата @supabase, расширение автоматически извлекает текущую схему локальной базы данных (таблицы, представления, функции, типы) и передает ее в качестве контекстного окна для GitHub Copilot. Это означает, что Copilot понимает точную структуру данных и генерирует миграции, которые гарантированно совместимы с существующей архитектурой.Команды генерации и структура промптовДля создания новой миграции с помощью ИИ разработчик использует команду @supabase /migration в чате Copilot, сопровождая ее текстовым описанием бизнес-требований. Для того чтобы Copilot генерировал производственно-готовый код, сам промпт должен содержать набор строгих архитектурных ограничений.Официальные руководства Supabase определяют следующие стандарты генерации миграций, которые ИИ должен неукоснительно соблюдать:Миграция должна представлять собой файл, размещенный в директории supabase/migrations/.Именование файла должно строго следовать формату временной метки UTC для обеспечения правильного порядка применения: YYYYMMDDHHmmss_short_description.sql.Все SQL-инструкции должны быть написаны в нижнем регистре (за исключением строковых литералов) и сопровождаться подробными комментариями.Для любых деструктивных команд (удаление таблиц, усечение данных, изменение типов столбцов) ИИ должен добавлять расширенные предупреждающие комментарии, объясняющие последствия операции.Формируя запрос к Copilot, разработчик может написать: «@supabase /migration Создай систему управления профилями пользователей. Добавь таблицу profiles, свяжи ее с таблицей авторизации auth.users, настрой политики RLS для того, чтобы пользователи могли редактировать только свои профили, и используй принципы идемпотентности, чтобы скрипт можно было запускать несколько раз без ошибок». ИИ проанализирует этот запрос и сгенерирует файл, готовый к интеграции в систему контроля версий.Принцип идемпотентности в SQL: Стратегии «создать, если не существует»Главным препятствием на пути к надежной автоматизации CI/CD для баз данных является прерывание выполнения скриптов из-за конфликтов состояния. В системах, не обладающих свойством идемпотентности, скрипт миграции предполагает, что база данных находится в строго определенном состоянии. Если объект (таблица, политика, функция) уже существует, попытка его повторного создания вызывает фатальную ошибку (например, ERROR: 42710: relation already exists), что приводит к остановке всего конвейера GitHub Actions и эффекту домино, блокирующему дальнейшее развертывание.Идемпотентность — это свойство операции, при котором многократное ее применение приводит к тому же результату, что и однократное, не вызывая дополнительных побочных эффектов или системных ошибок. Чтобы GitHub Copilot генерировал отказоустойчивый код для Supabase, необходимо внедрять строгие паттерны идемпотентности для каждого типа объектов PostgreSQL.Идемпотентность структурных объектов (Таблицы и Столбцы)Создание базовых структур хранения является наиболее изученной областью SQL, и PostgreSQL предоставляет встроенную поддержку идемпотентности для этих операций. При написании запросов к Copilot необходимо всегда указывать на использование конструкции IF NOT EXISTS.Например, генерация таблицы профилей должна выглядеть следующим образом:SQL-- Идемпотентное создание таблицы профилей
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name text NOT NULL,
    last_name text NOT NULL,
    avatar_url text,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
Аналогично, при эволюции схемы данных и добавлении новых столбцов, Copilot должен использовать проверку существования колонки во избежание ошибок при повторном накатывании миграции на резервные или синхронизируемые базы данных:SQL-- Идемпотентное добавление столбца
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_number text;
Такие конструкции гарантируют, что транзакция миграции успешно завершится независимо от того, был ли этот код применен ранее локально или в другой ветке.Идемпотентность ролей и управления доступом (Roles and Users)PostgreSQL управляет доступом на уровне базы данных с помощью ролей, которые могут функционировать как группы или индивидуальные пользователи. В отличие от таблиц, классический PostgreSQL не имеет встроенной команды CREATE ROLE IF NOT EXISTS. Попытка создать уже существующую роль приведет к ошибке, которая немедленно обрушит CI/CD пайплайн.Для решения этой проблемы в скриптах настройки Supabase используется анонимный блок PL/pgSQL (DO $$BEGIN... END$$;), который позволяет выполнить условную процедурную логику перед попыткой выполнения DDL-команды. При поручении Copilot создать новую системную роль для специфического микросервиса, он должен сгенерировать следующий идемпотентный паттерн:SQL-- Идемпотентное создание роли путем запроса к системному каталогу pg_roles
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'api_read_only') THEN 
        CREATE ROLE api_read_only NOLOGIN; 
    END IF; 
END $$;
Этот подход использует прямое обращение к внутреннему системному каталогу pg_roles базы данных для проверки факта существования роли перед инициированием процесса ее создания.Идемпотентность политик безопасности (Row Level Security)Политики безопасности на уровне строк (RLS) являются краеугольным камнем архитектуры авторизации Supabase. RLS действует как невидимый слой фильтрации запросов внутри самого ядра PostgreSQL, гарантируя, что даже если запрос поступит от клиента с ключом sb_publishable_..., пользователь получит доступ только к тем строкам, которые разрешены политиками. По умолчанию таблицы в Supabase публично доступны для чтения через API без RLS, поэтому включение этой функции является критическим требованием для развертывания в производство.Исторической проблемой являлось то, что PostgreSQL (вплоть до последних версий) не поддерживал синтаксис CREATE POLICY IF NOT EXISTS. Это приводило к тому, что при использовании платформ управления (например, Archon) на базе Supabase, скрипты ломались с ошибками вида ERROR: 42710: policy "Allow authenticated users to read" for table "profiles" already exists. В ответ на это сообщество активно разрабатывает патчи для включения этой конструкции в стандартный синтаксис (ожидается полная поддержка к 2026 году). Однако для обеспечения обратной совместимости и стабильности существующих конвейеров развертывания необходимо использовать специализированные подходы.При настройке Copilot для генерации политик RLS, промпт должен содержать явные указания на один из двух методов идемпотентности.Подход 1: Паттерн деструктивного пересоздания (Drop and Recreate)
Наиболее распространенный, понятный и предсказуемый метод заключается в предварительном удалении политики перед ее созданием. Это не только предотвращает ошибку дублирования, но и гарантирует, что если логика политики изменилась в ходе разработки, в базу данных будет применена ее самая актуальная версия. Copilot должен генерировать следующий код:SQL-- Включение RLS (эта команда сама по себе идемпотентна, если RLS уже включен)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Удаление политики, если она существует, во избежание конфликта
DROP POLICY IF EXISTS "Пользователи могут просматривать только свои профили" ON public.profiles;

-- Создание политики с чистого листа
CREATE POLICY "Пользователи могут просматривать только свои профили" 
ON public.profiles 
FOR SELECT 
USING ( auth.uid() = id );
Официальные рекомендации Supabase для ИИ-ассистентов предписывают разделять логику FOR ALL на четыре отдельные политики (SELECT, INSERT, UPDATE, DELETE), использовать функцию auth.uid() вместо системного current_user и оборачивать строковые значения в двойные апострофы.Подход 2: Проверка системных каталогов через PL/pgSQLВ высоконагруженных системах, где даже микросекундное отсутствие политики безопасности (в момент между DROP и CREATE) может привести к несанкционированному доступу или заблокировать транзакцию, используется более сложный обходной путь. ИИ генерирует блок PL/pgSQL, проверяющий таблицу pg_policy:SQLDO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Пользователи могут обновлять свои профили' 
        AND polrelid = 'public.profiles'::regclass
    ) THEN
        CREATE POLICY "Пользователи могут обновлять свои профили" 
        ON public.profiles 
        FOR UPDATE 
        USING ( auth.uid() = id )
        WITH CHECK ( auth.uid() = id );
    END IF;
END $$;
Идемпотентность функций (RPC) и триггеровБаза данных часто содержит бизнес-логику в виде хранимых процедур и триггеров. Для функций PostgreSQL предлагает удобную встроенную команду CREATE OR REPLACE FUNCTION. Эта конструкция является эталоном идемпотентности: она автоматически заменяет тело функции без необходимости ее предварительного удаления, сохраняя при этом все зависимости и привилегии.Однако триггеры, которые вызывают эти функции при событиях изменения данных (INSERT, UPDATE), не поддерживают конструкцию CREATE OR REPLACE TRIGGER в большинстве контекстов. Если попытаться создать существующий триггер, база выдаст ошибку. Поэтому Copilot должен быть проинструктирован использовать комбинацию DROP TRIGGER IF EXISTS и CREATE TRIGGER.Пример генерации идемпотентного триггера для синхронизации пользователей из схемы auth (создаваемой Supabase) в публичную таблицу профилей:SQL-- Создание или обновление функции-обработчика (идемпотентно)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name', 
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$;

-- Идемпотентное пересоздание триггера
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
Использование параметра SECURITY DEFINER в данном контексте критически важно, так как триггер вызывается анонимным пользователем при регистрации, и функция должна выполняться с правами администратора базы данных для успешной записи в защищенную таблицу.Проектирование высоконагруженной пагинации: Архитектурные паттерны и генерация функцийПо мере роста объема данных в приложении, эффективная выборка записей становится ключевым фактором, определяющим общую производительность системы. Пользовательские интерфейсы требуют разделения данных на страницы. В экосистеме PostgreSQL и Supabase существует два принципиально разных подхода к реализации пагинации: основанная на смещении (Offset-based) и основанная на курсоре (Keyset/Cursor-based). Искусственный интеллект, такой как GitHub Copilot, должен быть способен генерировать оптимальные решения в зависимости от архитектурных требований.Критика Offset-based пагинацииТрадиционный и наиболее простой в реализации подход использует SQL-операторы LIMIT и OFFSET. На стороне клиента с использованием Supabase-JS это часто реализуется через методы модификаторов .range(from, to).Внутренняя механика базы данных при выполнении запроса вида SELECT * FROM items ORDER BY created_at DESC LIMIT 20 OFFSET 100000; заключается в том, что PostgreSQL не может мгновенно «перепрыгнуть» на нужную позицию. Система вынуждена последовательно просканировать, упорядочить и загрузить в память 100 000 строк, а затем отбросить их, чтобы вернуть требуемые 20 записей. Этот процесс требует значительных затрат процессорного времени и дискового ввода-вывода. По мере увеличения значения OFFSET (при переходе пользователя на дальние страницы), производительность запроса деградирует экспоненциально, что может привести к исчерпанию ресурсов сервера баз данных. Кроме того, этот метод страдает от проблемы несогласованности данных (data drift): если во время листания пользователем страниц в таблицу добавляются новые записи, элементы будут смещаться, что приведет к дублированию одних и тех же записей на соседних страницах или пропуску некоторых из них.Несмотря на эти недостатки, если бизнес-логика строго требует навигации по номерам страниц (например, переключение между страницами 1, 2, 3... 100 в административной панели) и размер таблицы относительно невелик, GitHub Copilot может сгенерировать идемпотентную RPC-функцию для этого подхода:SQLCREATE OR REPLACE FUNCTION public.get_records_by_page(page_number int, page_size int)
RETURNS SETOF public.items
LANGUAGE sql
SECURITY INVOKER
AS $$
    SELECT * 
    FROM public.items
    ORDER BY created_at DESC
    LIMIT page_size 
    OFFSET (page_number - 1) * page_size;
$$;
Важно отметить использование SECURITY INVOKER. В отличие от SECURITY DEFINER, этот флаг гарантирует, что функция выполняется с правами вызывающего ее пользователя. Это означает, что при вызове функции клиентом с использованием ключа sb_publishable_..., база данных прозрачно применит все существующие политики RLS к результатам запроса, предотвращая утечку чужих данных.Реализация Keyset-based (курсорной) пагинацииДля обеспечения константного времени выполнения запросов ($O(1)$) при неограниченно больших наборах данных и предотвращения смещения результатов, стандартом индустрии является пагинация на основе курсора (Keyset pagination).Вместо того чтобы пропускать определенное количество строк, клиентский интерфейс передает серверу «курсор» — уникальный идентификатор последней загруженной записи на предыдущей странице. Сервер использует этот курсор для мгновенного поиска точки возобновления выборки. В качестве курсора чаще всего выступает отметка времени (created_at). Однако, поскольку метки времени не всегда уникальны (две записи могут быть созданы в одну и ту же миллисекунду), для предотвращения недетерминированного поведения курсор должен включать уникальный идентификатор для разрешения конфликтов (tie-breaker), например id.Разработчик может отправить Copilot следующий запрос: «Напиши функцию RPC для курсорной пагинации таблицы товаров. В качестве курсора используй created_at и id для разрешения коллизий. Функция должна быть идемпотентной и безопасной с точки зрения RLS. Также сгенерируй необходимые индексы для обеспечения максимальной производительности».Сгенерированный ИИ результат для интеграции в Supabase должен содержать как саму функцию, так и соответствующий композитный индекс:SQL-- 1. Идемпотентное создание композитного B-Tree индекса для мгновенной выборки
CREATE INDEX IF NOT EXISTS idx_items_cursor 
ON public.items(created_at DESC, id DESC);

-- 2. Создание идемпотентной функции RPC для пагинации
CREATE OR REPLACE FUNCTION public.get_items_cursor(
    cursor_time timestamptz DEFAULT NULL, 
    cursor_id uuid DEFAULT NULL,
    limit_count int DEFAULT 20
)
RETURNS SETOF public.items
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
    SELECT * 
    FROM public.items
    -- Условие: если курсор передан, ищем записи строго старше курсора
    WHERE (cursor_time IS NULL AND cursor_id IS NULL) 
       OR (created_at < cursor_time) 
       OR (created_at = cursor_time AND id < cursor_id)
    ORDER BY created_at DESC, id DESC
    LIMIT limit_count;
$$;
Преимущества курсорного подхода:База данных использует структуру индекса B-Tree для логарифмического поиска точного места в таблице, удовлетворяющего условию created_at < cursor_time, и просто считывает следующие limit_count записей. Независимо от того, запрашивает ли клиент первую страницу или миллионную, время отклика базы данных остается минимальным и предсказуемым.Интеграция этого решения на стороне клиентского приложения, использующего новые стандарты безопасности, выглядит предельно просто. Приложение инициализирует клиент с sb_publishable_... ключом и вызывает RPC-функцию:TypeScript// Клиентский вызов RPC функции с передачей данных последней просмотренной записи
const { data, error } = await supabase
 .rpc('get_items_cursor', { 
    cursor_time: lastSeenRecord.created_at,
    cursor_id: lastSeenRecord.id,
    limit_count: 50
  });
Таким образом, ИИ помогает не только создать структуру данных, но и спроектировать высокопроизводительный, масштабируемый и идемпотентный API поверх базы данных.Автоматизация развертывания: Настройка GitHub Actions и Supabase CLI v2Локальная генерация кода с помощью Copilot — это лишь первый шаг. Истинная мощь подхода "инфраструктура как код" (IaC) раскрывается, когда локальные изменения автоматически, безопасно и предсказуемо переносятся в производственные среды. Развертывание миграций путем ручного выполнения SQL-команд в веб-интерфейсе Supabase или локального запуска команд для производственной базы является антипаттерном в современных методологиях DevOps.Для реализации непрерывной интеграции и доставки (CI/CD) используются конвейеры GitHub Actions в связке с интерфейсом командной строки Supabase CLI версии 2, который претерпел значительные изменения в архитектуре безопасности и конфигурации.Эволюция Supabase CLI v2 и отказ от передачи паролей базы данныхДо выхода второй мажорной версии CLI процесс развертывания миграций в удаленные проекты требовал явной передачи пароля суперпользователя базы данных PostgreSQL через флаги (например, supabase db push -p [password]) или через переменную окружения SUPABASE_DB_PASSWORD. Хранение и передача пароля администратора базы данных в средах CI/CD создавало дополнительные векторы атак и усложняло управление секретами.С переходом на современные версии CLI (середина 2025 года и далее), платформа внедрила механизм бесспарольного развертывания миграций. Теперь для доступа к базе данных и применения изменений схемы CLI по умолчанию использует временные, короткоживущие роли, которые генерируются прозрачно для пользователя на основе единого токена доступа к платформе — SUPABASE_ACCESS_TOKEN. Это фундаментальное изменение означает, что пароли базы данных больше не требуются для команд db push, migration list и других операций, связанных со схемой. Флаг -p и переменная SUPABASE_DB_PASSWORD перешли в разряд устаревших для этих целей.Конфигурация GitHub Secrets для конвейераДля успешного функционирования конвейера в репозитории GitHub должны быть настроены соответствующие переменные и секреты. Согласно современным рекомендациям, администратор репозитория должен создать зашифрованные секреты (Encrypted Secrets) на уровне среды (Environment secrets) для разделения доступов к различным стадиям проекта (Staging и Production).Обязательный набор секретов включает:SUPABASE_ACCESS_TOKEN: Персональный токен доступа разработчика или сервисного аккаунта, сгенерированный в панели управления Supabase. Этот токен предоставляет права на взаимодействие с Management API и генерацию временных ролей базы данных.PRODUCTION_PROJECT_ID: Уникальный идентификатор производственного проекта Supabase (буквенно-цифровая строка из URL-адреса панели управления).STAGING_PROJECT_ID: Идентификатор проекта для предварительного тестирования.Следует помнить о концептуальном разделении ключей: переменные SUPABASE_PUBLISHABLE_KEY и SUPABASE_SECRET_KEY (начинающиеся с префиксов sb_) используются внутри самого развертываемого приложения (в Edge Functions, на веб-клиентах, в серверном коде) для взаимодействия с данными в процессе работы системы. А вот SUPABASE_ACCESS_TOKEN (начинающийся с sbp_) используется исключительно инструментами командной строки и GitHub Actions для управления инфраструктурой и развертывания миграций.Архитектура конвейеров GitHub ActionsДля обеспечения отказоустойчивого процесса создаются два независимых рабочих процесса (workflow) в директории .github/workflows репозитория.1. Конвейер непрерывной интеграции и валидации (ci.yaml)Этот рабочий процесс (CI) автоматически запускается при каждом создании или обновлении Pull Request в основную ветку разработки. Его главная цель — создать изолированную локальную среду выполнения базы данных непосредственно внутри контейнера GitHub Actions, применить к ней все сгенерированные Copilot миграции из папки supabase/migrations/ и убедиться в отсутствии синтаксических ошибок, конфликтов состояний и нарушений идемпотентности.Кроме того, этот этап проверяет консистентность статической типизации приложения. Supabase CLI способен генерировать типы TypeScript непосредственно из схемы базы данных. Конвейер запускает эту генерацию и проверяет, соответствуют ли типы, зафиксированные разработчиком в репозитории, реальной структуре базы после применения миграций.YAML# Файл:.github/workflows/ci.yaml
name: CI Database Validation
on:
  pull_request:
  workflow_dispatch:

jobs:
  validate-migrations:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest
          
      - name: Start Supabase Local Environment
        # Эта команда инициализирует контейнеры Docker с Postgres, применяет миграции и сидирование данных
        run: supabase db start
        
      - name: Verify Migration Idempotency
        # Команда db reset проверяет способность скриптов полностью пересоздать схему с нуля без ошибок
        run: supabase db reset 
        
      - name: Validate TypeScript Types Generation
        run: |
          supabase gen types typescript --local > types.gen.ts
          if! git diff --exit-code --quiet types.gen.ts; then
            echo "Критическая ошибка: Обнаружены незафиксированные изменения в структуре базы данных."
            echo "Запустите 'supabase gen types typescript --local' на локальной машине и зафиксируйте изменения."
            exit 1
          fi
В этом рабочем процессе вообще не используются секретные ключи или токены доступа к облаку, поскольку вся база данных эмулируется локально внутри эфемерного раннера GitHub Actions. Если ИИ-ассистент сгенерировал неидемпотентный скрипт (например, попытался создать уже существующую роль без проверки IF NOT EXISTS), шаг db start завершится фатальной ошибкой, предотвращая слияние некорректного кода.2. Конвейер непрерывного развертывания (production.yaml)Этот рабочий процесс (CD) запускается исключительно при слиянии изменений в основную защищенную ветку (например, main). Его задача — безопасно перенести проверенную локальную структуру на удаленные серверы Supabase.В архитектуре CLI версии 2 процесс связи с проектом осуществляется через команду supabase link, а применение изменений — через бесспарольную команду supabase db push. Это обеспечивает максимальную автоматизацию без необходимости ручного управления версиями миграций на сервере.YAML# Файл:.github/workflows/production.yaml
name: Deploy to Production Database
on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy-schema:
    runs-on: ubuntu-latest
    environment: production
    env:
      # Передача токена платформы и ID проекта из защищенных секретов
      SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      PROJECT_ID: ${{ secrets.PRODUCTION_PROJECT_ID }}
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
        
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest
          
      - name: Link Repository to Remote Supabase Project
        # Связывание локального репозитория с удаленным проектом
        run: supabase link --project-ref $PROJECT_ID
        
      - name: Push Pending Migrations
        # Применение новых миграций к удаленной базе данных без использования пароля
        run: supabase db push
Благодаря конфигурации как коду (Configuration as Code), поддерживаемой в CLI версии 2, файл config.toml в репозитории может содержать настройки специфичные для различных сред (например, настройки авторизации, вебхуков, хранилища). GitHub Actions гарантирует, что эти настройки применяются синхронно с изменениями схемы базы данных. При этом секретные значения, такие как ключи сторонних провайдеров (OAuth, Stripe), могут быть безопасно инжектированы с использованием функции подстановки переменных env() в файле config.toml, что исключает их попадание в открытый исходный код.Для проектов, требующих изолированной среды тестирования (Staging), создается аналогичный рабочий процесс staging.yaml, который реагирует на изменения в ветке develop и использует переменную STAGING_PROJECT_ID. Физическое разделение проектов гарантирует, что деструктивные операции или манипуляции с тестовыми данными на этапе проверки никогда не затронут производственную базу данных и реальных пользователей.Синтез рабочего процесса: Интеллектуальный цикл непрерывной доставкиИнтеграция описанных методологий и технологий формирует замкнутый, интеллектуальный цикл непрерывной доставки программного обеспечения, который полностью устраняет ручные операции со схемами базы данных, минимизирует вероятность ошибок и максимизирует безопасность и производительность системы.Архитектура этого процесса выглядит следующим образом:Фаза высокоуровневого проектирования (Intent Declaration): Разработчик инициирует сеанс в Visual Studio Code, обращаясь к GitHub Copilot через участника чата @supabase. Вместо написания сотен строк DDL-кода, разработчик формулирует бизнес-цель: создать новую систему управления платежами с политиками RLS, привязанными к ролям пользователей, и обеспечить высоконагруженную курсорную пагинацию для отображения транзакций.Фаза контекстуальной генерации кода (AI Contextual Execution): Расширение сканирует локальную базу данных и передает актуальную схему ИИ. Copilot генерирует файл миграции, строго следуя конвенции именования YYYYMMDDHHmmss_.... Искусственный интеллект, зная ограничения среды, генерирует абсолютно идемпотентные конструкции: CREATE TABLE IF NOT EXISTS, анонимные блоки DO $$BEGIN... END$$; для проверки системных каталогов ролей и политик, и использует DROP POLICY IF EXISTS для RLS. Для пагинации ИИ генерирует RPC-функцию с композитными индексами и логикой разрезания на страницы на основе курсора.Фаза непрерывной валидации (Continuous Integration Verification): Сгенерированный код фиксируется в системе контроля версий и отправляется в новую ветку (Pull Request). Инфраструктура GitHub Actions перехватывает событие, разворачивает изолированную копию PostgreSQL через supabase db start, применяет скрипты, проверяет их на идемпотентность и генерирует новые статические типы TypeScript. Если ИИ совершил ошибку или нарушил консистентность, пайплайн прерывается, создавая непреодолимый барьер для некорректного кода на пути в производство.Фаза интеллектуального развертывания (Continuous Deployment): После успешного прохождения автоматических тестов и одобрения ревьюером, ветка сливается с main. GitHub Actions авторизуется в экосистеме платформы с использованием защищенного токена SUPABASE_ACCESS_TOKEN и выполняет команду db push. Платформа прозрачно создает временные роли для миграции, исключая необходимость в долгоживущих паролях администраторов, и безопасно применяет изменения к производственной базе данных.Фаза безопасного выполнения среды исполнения (Runtime Cryptography): Развернутое приложение (серверные компоненты, Edge Functions, фронтенд) начинает взаимодействовать с обновленной схемой базы данных. При этом архитектура строго опирается на криптографические стандарты платформы 2025–2026 годов. Взаимодействие происходит исключительно с использованием новых асимметричных ключей sb_publishable_ (для клиентских сред) и sb_secret_ (для серверной автоматизации с обходом RLS). Устаревшие симметричные anon и service_role ключи полностью выведены из эксплуатации. Это гарантирует, что даже в случае утечки исходного кода инфраструктуры или переменных окружения, скомпрометированные секретные ключи будут моментально отозваны сканерами GitHub, а сессии легитимных пользователей останутся в безопасности.Комплексное внедрение GitHub Copilot в качестве инженера данных, управляемого строгими правилами промптинга и контролируемого конвейерами GitHub Actions, знаменует собой переход к концепции NoOps в управлении базами данных. Отказ от ручных операций в панелях управления в пользу инфраструктуры как кода (IaC) с поддержкой ИИ навсегда устраняет так называемый «дрейф схем» (schema drift). Команды разработчиков получают возможность безопасно, быстро и масштабируемо управлять сложными архитектурными эволюциями, от базовых прототипов до глобально распределенных высоконагруженных систем, сохраняя при этом целостность, предсказуемость и исключительный уровень криптографической защиты данных.
