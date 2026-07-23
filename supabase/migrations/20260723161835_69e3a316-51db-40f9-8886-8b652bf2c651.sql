
ALTER TABLE public.names_enriched
  ADD COLUMN IF NOT EXISTS name_native TEXT,
  ADD COLUMN IF NOT EXISTS name_latin TEXT,
  ADD COLUMN IF NOT EXISTS famous_people JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS name_day TEXT,
  ADD COLUMN IF NOT EXISTS popularity INT;

CREATE UNIQUE INDEX IF NOT EXISTS names_enriched_uniq_name_gender_culture
  ON public.names_enriched (lower(name), gender, culture);
