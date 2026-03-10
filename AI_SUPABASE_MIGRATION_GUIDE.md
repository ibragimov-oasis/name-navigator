# AI_SUPABASE_MIGRATION_GUIDE.md

## SYSTEM RULES FOR AI AGENTS — NAME-NAVIGATOR × SUPABASE

**Format:** Machine-to-Machine instruction document  
**Target audience:** LLM agents performing database migrations or Supabase interactions  
**Project:** name-navigator (`xvpngscmnasjuwxjoqyp.supabase.co`)  
**Status of DB at time of writing:** No tables exist yet — `public` schema is empty

---

## 1. PROJECT CONTEXT

| Field | Value |
|---|---|
| Supabase project ID | `xvpngscmnasjuwxjoqyp` |
| Supabase URL | `https://xvpngscmnasjuwxjoqyp.supabase.co` |
| Client location | `src/integrations/supabase/client.ts` |
| Types location | `src/integrations/supabase/types.ts` |
| Anon/publishable key | stored in `client.ts` — public, safe for frontend |
| Service role key | NOT committed — must be supplied via environment variable `SUPABASE_SERVICE_ROLE_KEY` |
| PostgreSQL version | 14.1 (see `__InternalSupabase.PostgrestVersion`) |

---

## 2. DATA MODEL — TypeScript Source of Truth

The canonical type is defined in `src/data/types.ts`:

```typescript
export interface ChildName {
  id: string;            // slug, e.g. "muhammad", "hana_ja"  — globally unique (see _registry.json)
  name: string;          // display name in Russian (Cyrillic)
  gender: "male" | "female" | "unisex";
  origin: string;        // linguistic origin in Russian
  culture: string;       // cultural group in Russian
  religion?: string;     // optional, e.g. "Мусульманское", "Христианское"
  meaning: string;       // meaning of the name
  attributes: string[];  // personality trait tags (Russian)
  popularity: number;    // 1–100 integer
  namedAfter?: string[]; // optional historical figures
  famousPeople?: string[]; // optional famous bearers
  history: string;       // rich text history in Russian
  nameDay?: string;      // optional calendar name day
  languages: string[];   // ISO 639-1 codes, e.g. ["ar", "tr"]
}
```

---

## 3. TARGET DATABASE SCHEMA

### 3.1 Table: `child_names`

```sql
CREATE TABLE public.child_names (
  id            TEXT        PRIMARY KEY,               -- slug key from TypeScript
  name          TEXT        NOT NULL,
  gender        TEXT        NOT NULL CHECK (gender IN ('male', 'female', 'unisex')),
  origin        TEXT        NOT NULL,
  culture       TEXT        NOT NULL,
  religion      TEXT,
  meaning       TEXT        NOT NULL,
  attributes    TEXT[]      NOT NULL DEFAULT '{}',
  popularity    SMALLINT    NOT NULL CHECK (popularity BETWEEN 1 AND 100),
  named_after   TEXT[],
  famous_people TEXT[],
  history       TEXT        NOT NULL,
  name_day      TEXT,
  languages     TEXT[]      NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

> **Naming convention:** TypeScript camelCase fields are mapped to SQL snake_case.  
> Mapping: `namedAfter` → `named_after`, `famousPeople` → `famous_people`, `nameDay` → `name_day`.

### 3.2 Indexes

```sql
-- Filter by gender (common UI filter)
CREATE INDEX idx_child_names_gender    ON public.child_names (gender);
-- Filter by culture
CREATE INDEX idx_child_names_culture   ON public.child_names (culture);
-- Filter by religion
CREATE INDEX idx_child_names_religion  ON public.child_names (religion);
-- Full-text search over name + meaning
CREATE INDEX idx_child_names_fts       ON public.child_names
  USING gin(to_tsvector('russian', name || ' ' || meaning));
-- Popularity sort
CREATE INDEX idx_child_names_popularity ON public.child_names (popularity DESC);
-- Attribute array containment queries
CREATE INDEX idx_child_names_attributes ON public.child_names USING gin(attributes);
```

### 3.3 Auto-update `updated_at`

```sql
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_child_names_updated_at
  BEFORE UPDATE ON public.child_names
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

---

## 4. ROW LEVEL SECURITY (RLS)

### 4.1 Enable RLS

```sql
ALTER TABLE public.child_names ENABLE ROW LEVEL SECURITY;
```

### 4.2 Policies

```sql
-- RULE: Anyone (including anonymous) can read all names
CREATE POLICY "allow_public_read"
  ON public.child_names
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- RULE: Only authenticated service-role can insert/update/delete
-- (No direct write from frontend; all writes go through service role or admin panel)
CREATE POLICY "allow_service_write"
  ON public.child_names
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

> **Security principle:** The anon key (exposed in `client.ts`) can only SELECT.  
> Mutations MUST use `SUPABASE_SERVICE_ROLE_KEY` server-side.

---

## 5. MIGRATION STEPS (SEQUENTIAL)

An AI agent performing the migration must execute these steps in order.

### Step 1 — Create table

Execute SQL from §3.1 in Supabase SQL Editor or via `supabase db push`.

### Step 2 — Create indexes

Execute SQL from §3.2.

### Step 3 — Create trigger

Execute SQL from §3.3.

### Step 4 — Enable RLS and create policies

Execute SQL from §4.1 and §4.2.

### Step 5 — Seed data

The TypeScript data source is sharded across:

```
src/data/names/islamic/     — 170 entries split across batch_001–batch_004
src/data/names/russian/     — 10 entries in batch_001
src/data/names/japanese/    — 6 entries in batch_001
src/data/names/european/    — 7 entries in batch_001
src/data/names/asian/       — 14 entries in batch_001
src/data/names/other/       — 13 entries in batch_001
```

Total: **220 unique records** (verified via `src/data/names/_registry.json`).

Use the following TypeScript snippet (run with service role key) to seed:

```typescript
import { createClient } from '@supabase/supabase-js';
import { childNames } from './src/data/childNames';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const rows = childNames.map(n => ({
  id:            n.id,
  name:          n.name,
  gender:        n.gender,
  origin:        n.origin,
  culture:       n.culture,
  religion:      n.religion ?? null,
  meaning:       n.meaning,
  attributes:    n.attributes,
  popularity:    n.popularity,
  named_after:   n.namedAfter ?? null,
  famous_people: n.famousPeople ?? null,
  history:       n.history,
  name_day:      n.nameDay ?? null,
  languages:     n.languages,
}));

const { error } = await supabase
  .from('child_names')
  .upsert(rows, { onConflict: 'id' });

if (error) throw error;
console.log(`Seeded ${rows.length} records.`);
```

### Step 6 — Update TypeScript types

After creating tables, regenerate `src/integrations/supabase/types.ts`:

```bash
npx supabase gen types typescript \
  --project-id xvpngscmnasjuwxjoqyp \
  --schema public \
  > src/integrations/supabase/types.ts
```

### Step 7 — Verify

```sql
-- Row count must equal total IDs in _registry.json (220)
SELECT COUNT(*) FROM public.child_names;
-- Expected: 220

-- Spot-check a few known IDs
SELECT id, name, culture FROM public.child_names
WHERE id IN ('muhammad', 'hana', 'hana_ja', 'sofia', 'haruki')
ORDER BY id;
-- Expected: 5 rows — confirms both hana variants exist with correct cultures

-- Confirm no duplicate IDs exist
SELECT id, COUNT(*) AS cnt FROM public.child_names
GROUP BY id HAVING COUNT(*) > 1;
-- Expected: 0 rows
```

---

## 6. ID UNIQUENESS CONTRACT

- **Source of truth for all occupied IDs:** `src/data/names/_registry.json`
- This file is a flat JSON array of 220 strings, sorted alphabetically
- Before inserting any new name, an AI agent MUST:
  1. Load `_registry.json`
  2. Check that the new `id` is NOT present in the array
  3. After successful insert, append the new `id` and re-sort the array
- **Conflict resolution for same-romanization names from different cultures:** append a culture suffix, e.g. `hana` (Arabic) vs `hana_ja` (Japanese)

---

## 7. CLIENT USAGE PATTERNS

### 7.1 Import the client

```typescript
import { supabase } from "@/integrations/supabase/client";
```

### 7.2 Fetch all names (paginated)

```typescript
const { data, error } = await supabase
  .from('child_names')
  .select('*')
  .order('popularity', { ascending: false })
  .range(0, 49); // first 50
```

### 7.3 Filter by gender and culture

```typescript
const { data } = await supabase
  .from('child_names')
  .select('id, name, gender, meaning, popularity')
  .eq('gender', 'female')
  .eq('culture', 'Арабская');
```

### 7.4 Full-text search (using `ilike` on name and meaning)

```typescript
// Simple pattern search — works without a dedicated tsvector column
const { data } = await supabase
  .from('child_names')
  .select('*')
  .or(`name.ilike.%${query}%,meaning.ilike.%${query}%`);
```

> **Note:** To use Supabase full-text search (`textSearch`), add a dedicated `fts` tsvector column:
> ```sql
> ALTER TABLE public.child_names
>   ADD COLUMN fts tsvector GENERATED ALWAYS AS
>   (to_tsvector('russian', name || ' ' || meaning)) STORED;
> CREATE INDEX idx_child_names_fts ON public.child_names USING gin(fts);
> ```
> Then query: `.textSearch('fts', query, { config: 'russian' })`

### 7.5 Attribute containment filter

```typescript
const { data } = await supabase
  .from('child_names')
  .select('*')
  .contains('attributes', ['мудрый', 'справедливый']);
```

---

## 8. GITHUB ACTIONS — AUTOMATED MIGRATION

To allow GitHub Copilot and GitHub Actions to apply migrations automatically:

### 8.1 Required secrets (set in GitHub repo settings)

| Secret name | Value |
|---|---|
| `SUPABASE_ACCESS_TOKEN` | Personal access token from supabase.com/dashboard/account/tokens |
| `SUPABASE_DB_PASSWORD` | Database password for the project |
| `SUPABASE_PROJECT_ID` | `xvpngscmnasjuwxjoqyp` |

### 8.2 Workflow template

```yaml
# .github/workflows/supabase-migrate.yml
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

      - name: Link project
        run: supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_ID }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Push migrations
        run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
```

### 8.3 Migration file naming convention

Place SQL files in `supabase/migrations/` using timestamp prefix:

```
supabase/migrations/
  20240101000000_create_child_names.sql
  20240101000001_create_indexes.sql
  20240101000002_enable_rls.sql
```

---

## 9. CONSTRAINTS AND INVARIANTS

An AI agent MUST NOT:

- Delete any record from `child_names` without also removing the ID from `_registry.json`
- Insert a record with an ID already present in `_registry.json`
- Use the anon key for write operations (INSERT/UPDATE/DELETE)
- Commit `SUPABASE_SERVICE_ROLE_KEY` to source control
- Disable RLS on `child_names`
- Create policies that allow unauthenticated writes

An AI agent MUST:

- Always `upsert` with `onConflict: 'id'` when seeding to avoid duplicate errors
- Regenerate `src/integrations/supabase/types.ts` after any schema change
- Keep `_registry.json` sorted and deduplicated after any ID addition
- Validate all new entries against `ChildName` TypeScript interface before insertion

---

## 10. CURRENT STATE SUMMARY

| Component | Status |
|---|---|
| Supabase project | Created, linked |
| Database tables | **NOT YET CREATED** — migration pending |
| RLS policies | **NOT YET CREATED** |
| Data (TypeScript) | 220 records, sharded, deduplicated |
| ID registry | `src/data/names/_registry.json` — 220 entries |
| TypeScript types | Generated but empty (no tables) |
| Client auth | `localStorage` persistence, auto-refresh enabled |
