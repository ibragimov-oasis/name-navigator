-- ==============================================================================
-- Миграция: Реестр национальных имён Таджикистана (Феҳристи номҳои миллӣ)
-- Утверждено Постановлением Правительства РТ от 26 февраля 2026 года, №98
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.tajik_registry_names (
  id                      TEXT PRIMARY KEY,
  num                     INTEGER NOT NULL,
  name_tj                 TEXT NOT NULL,
  name_tj_raw             TEXT NOT NULL,
  name_cyrillic           TEXT NOT NULL,
  name_cyrillic_raw       TEXT NOT NULL,
  name_latin              TEXT NOT NULL,
  name_latin_raw          TEXT NOT NULL,
  gender                  TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  gender_label            TEXT NOT NULL,
  gender_tj               TEXT NOT NULL,
  letter                  TEXT NOT NULL,
  is_official_permitted   BOOLEAN NOT NULL DEFAULT true,
  legal_decree            TEXT NOT NULL DEFAULT 'Қарори Ҳукумати Ҷумҳурии Тоҷикистон аз 26 феврали соли 2026, №98',
  is_enriched             BOOLEAN NOT NULL DEFAULT false,
  matched_child_name_id   TEXT,
  meaning                 TEXT DEFAULT '',
  origin                  TEXT DEFAULT 'Тоҷикӣ / Форсӣ',
  attributes              TEXT[] NOT NULL DEFAULT '{}',
  history                 TEXT DEFAULT '',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Индексы для быстрого поиска и фильтрации
CREATE INDEX IF NOT EXISTS idx_tajik_registry_gender ON public.tajik_registry_names (gender);
CREATE INDEX IF NOT EXISTS idx_tajik_registry_letter ON public.tajik_registry_names (letter);
CREATE INDEX IF NOT EXISTS idx_tajik_registry_name_tj ON public.tajik_registry_names (name_tj);
CREATE INDEX IF NOT EXISTS idx_tajik_registry_name_cyrillic ON public.tajik_registry_names (name_cyrillic);
CREATE INDEX IF NOT EXISTS idx_tajik_registry_name_latin ON public.tajik_registry_names (name_latin);
CREATE INDEX IF NOT EXISTS idx_tajik_registry_is_enriched ON public.tajik_registry_names (is_enriched);
CREATE INDEX IF NOT EXISTS idx_tajik_registry_permitted ON public.tajik_registry_names (is_official_permitted);

-- Полнотекстовый поиск по таджикскому, русскому и латинскому написанию + значению
CREATE INDEX IF NOT EXISTS idx_tajik_registry_fts ON public.tajik_registry_names 
  USING gin(to_tsvector('simple', name_tj || ' ' || name_cyrillic || ' ' || name_latin || ' ' || coalesce(meaning, '')));

-- Автообновление updated_at
CREATE OR REPLACE FUNCTION public.set_tajik_registry_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tajik_registry_updated_at ON public.tajik_registry_names;
CREATE TRIGGER trg_tajik_registry_updated_at
  BEFORE UPDATE ON public.tajik_registry_names
  FOR EACH ROW EXECUTE FUNCTION public.set_tajik_registry_updated_at();

-- Настройка Row Level Security (RLS)
ALTER TABLE public.tajik_registry_names ENABLE ROW LEVEL SECURITY;

-- Любой пользователь (включая анонимных) может читать разрешённый реестр
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tajik_registry_names' AND policyname = 'Anyone can read permitted tajik registry'
  ) THEN
    CREATE POLICY "Anyone can read permitted tajik registry"
      ON public.tajik_registry_names FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END
$$;

-- Запись разрешена только сервисной роли
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tajik_registry_names' AND policyname = 'Service role can manage tajik registry'
  ) THEN
    CREATE POLICY "Service role can manage tajik registry"
      ON public.tajik_registry_names FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;
