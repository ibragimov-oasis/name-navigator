
-- Auto-enrichment pipeline for names

CREATE TABLE public.names_enriched (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_lower text GENERATED ALWAYS AS (lower(name)) STORED,
  gender text NOT NULL CHECK (gender IN ('male','female','unisex')),
  culture text,
  origin text,
  religion text,
  meaning text,
  history text,
  attributes jsonb NOT NULL DEFAULT '[]'::jsonb,
  languages jsonb NOT NULL DEFAULT '[]'::jsonb,
  source_url text,
  source_kind text,
  llm_model text,
  confidence numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'auto' CHECK (status IN ('auto','published','rejected','pending')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX names_enriched_name_gender_uidx ON public.names_enriched(name_lower, gender);
CREATE INDEX names_enriched_status_idx ON public.names_enriched(status);

GRANT SELECT ON public.names_enriched TO anon;
GRANT SELECT ON public.names_enriched TO authenticated;
GRANT ALL ON public.names_enriched TO service_role;

ALTER TABLE public.names_enriched ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published names" ON public.names_enriched
  FOR SELECT USING (status = 'published');

-- Enrichment runs log
CREATE TABLE public.enrich_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  model text,
  source text,
  added int NOT NULL DEFAULT 0,
  skipped int NOT NULL DEFAULT 0,
  errors jsonb,
  status text NOT NULL DEFAULT 'running'
);
GRANT SELECT ON public.enrich_runs TO anon;
GRANT SELECT ON public.enrich_runs TO authenticated;
GRANT ALL ON public.enrich_runs TO service_role;
ALTER TABLE public.enrich_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read enrich runs" ON public.enrich_runs FOR SELECT USING (true);

-- LLM daily quota counter (for router)
CREATE TABLE public.llm_quota_usage (
  model text NOT NULL,
  day date NOT NULL DEFAULT current_date,
  requests int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (model, day)
);
GRANT SELECT ON public.llm_quota_usage TO anon;
GRANT SELECT ON public.llm_quota_usage TO authenticated;
GRANT ALL ON public.llm_quota_usage TO service_role;
ALTER TABLE public.llm_quota_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read quota" ON public.llm_quota_usage FOR SELECT USING (true);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER names_enriched_touch BEFORE UPDATE ON public.names_enriched
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Cron
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.schedule(
  'enrich-names-every-15min',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://xvpngscmnasjuwxjoqyp.supabase.co/functions/v1/enrich-names',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cG5nc2NtbmFzanV3eGpvcXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMjE2MzcsImV4cCI6MjA4NzU5NzYzN30.AH_ybiLGFF9sTjK00DA7bN4zq-Rir_m8XQlR0XU8Yio"}'::jsonb,
    body := '{"trigger":"cron"}'::jsonb
  );
  $$
);
