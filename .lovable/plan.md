## Часть 1 — Чинить белый экран

**Диагноз:** `Error: supabaseUrl is required` в `index-Bh7RpW0J.js`. Локальный `.env` содержит `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` (проверил). Остальные ошибки в консоли (`googleadservices`, `linkedin`, `Resource blocked by content blocker`, sandbox-флаги, cross-origin postMessage) — это шум от рекламных пикселей самого `lovable.dev` и блокировщика в браузере, к падению приложения отношения не имеют.

Значит билд, который сейчас отдаётся в превью (`index-Bh7RpW0J.js`), был собран до того, как `.env` появился/обновился, и в бандл попали `undefined` для Supabase. Нужно пересобрать превью с актуальным `.env`.

**Действия:**
1. Перезапустить dev-сервер Vite, чтобы `import.meta.env.VITE_SUPABASE_*` подхватились заново (`code--restart_dev_server`).
2. Проверить, что hash бандла поменялся и в `src/integrations/supabase/client.ts` URL не пустой (открыть превью, посмотреть консоль).
3. Если ошибка осталась — дописать fallback в `client.ts`: если `import.meta.env.VITE_SUPABASE_URL` пустой, использовать жёстко зашитые публичные значения из `<supabase-configuration>` (URL = `https://xvpngscmnasjuwxjoqyp.supabase.co`, anon key уже известен — он публичный, можно в коде). Это сделает приложение устойчивым к пропавшему `.env`.

## Часть 2 — Авто-обогащение БД именами (непрерывный пайплайн)

**Цель:** скрипт сам ищет имена в интернете и заливает в базу, Gemini проверяет/чистит. Работает круглосуточно через `pg_cron`, не упирается в дневные лимиты Gemini за счёт ротации моделей.

### Лимиты Gemini (по таблице пользователя)
| Модель | RPM | RPD | роль |
|---|---|---|---|
| Gemini 3.5 Flash | 5 | **20** | главный «контролёр качества» |
| Gemini 3 Flash | 5 | 20 | резерв качества |
| Gemini 2.5 Flash | 5 | 20 | резерв |
| Gemini 2.5 Flash Lite | 10 | 20 | резерв |
| **Gemini 3.1 Flash Lite** | 15 | **500** | основной «рабочий» (массовое обогащение) |
| Gemma 4 26B / 31B | 15 | **1500 каждая** | дешёвый bulk-валидатор/переписыватель |

Суммарно реальных вызовов в день: **≈ 3580**. При batch=10 имён/вызов это ~35 800 имён/день — выше любой разумной потребности.

### Архитектура

```text
[pg_cron каждые 15 мин]
        ▼
[edge: enrich-names-v2]
        ├─ источники сидов:
        │    1) Firecrawl /search "<culture> baby names"
        │    2) Firecrawl /scrape Behind the Name, Nameberry, Quran.com, kumitaizabon.tj
        │    3) Wikipedia REST API (бесплатно, без ключа)
        ├─ дедуп против names_enriched по lower(name)+gender
        ├─ LLM router:
        │    bulk → Gemini 3.1 Flash Lite (500/день)
        │    quality check → Gemini 3.5 Flash (20/день)
        │    rewrite/translate → Gemma 4 26B (1500/день)
        ├─ запись в names_enriched (status='auto', confidence)
        └─ авто-публикация, если confidence ≥ 0.8
```

### Что меняем в коде/БД

1. **Миграция** (один вызов `supabase--migration`):
   - таблица `names_enriched` (name, gender, culture, origin, religion, meaning, history, attributes jsonb, source_url, llm_model, confidence numeric, status text, created_at)
   - таблица `enrich_runs` (started_at, finished_at, model, source, added int, skipped int, errors jsonb)
   - таблица `llm_quota_usage` (model, day date, requests int, PK(model, day)) — счётчик для router
   - GRANTs + RLS (`SELECT` для anon на `names_enriched`, остальное только service_role)
   - `cron.schedule('enrich-names', '*/15 * * * *', ...)` → POST на edge-функцию с anon-ключом

2. **Edge-функция** `supabase/functions/enrich-names/index.ts`:
   - читает `llm_quota_usage` за сегодня, выбирает первую модель с остатком ≥ 1 в порядке: `gemini-3.1-flash-lite` → `gemma-4-31b` → `gemma-4-26b` → `gemini-2.5-flash-lite` → `gemini-2.5-flash` → `gemini-3-flash` → `gemini-3.5-flash`
   - тянет 1 источник через Firecrawl (`FIRECRAWL_API_KEY` уже в connectors flow — попросить connect)
   - 1 batch = 10 имён, JSON-схема через `responseMimeType:application/json`
   - инкремент `llm_quota_usage`, лог в `enrich_runs`
   - валидатор (Gemini 3.5 Flash) запускается раз в час: берёт 50 случайных `status='auto'`, ставит `confidence` и `status='published'` или `'rejected'`

3. **Клиент:**
   - `src/lib/namesStore.ts` — при загрузке мерджит статические батчи + `select * from names_enriched where status='published'`
   - страница `/admin/enrich` — таблица `enrich_runs`, кнопка «Запустить сейчас», график квот по моделям

4. **Что НЕ трогаем:** существующие статические батчи, текущие страницы, gemini-chat (он остаётся для UI).

### Открытые вопросы

1. **Firecrawl коннектор** ещё не привязан к проекту (в connectors его нет среди установленных). Подключаем сейчас через `standard_connectors--connect firecrawl`? Без него останутся только Wikipedia + ручные сиды — медленнее, но бесплатно.
2. **Авто-публикация:** confidence ≥ 0.8 ставим сразу `published`, или всё в `pending` и публикуется только после ручного апрува в `/admin/enrich`? (Раньше выбрали авто — подтверждаем?)
3. **Частота cron:** оставляем 15 минут (≈ 96 запусков/день, по 10 имён = ~960 новых имён/день при основной модели Flash Lite), или редить до 30/60 мин?

После ответов — сразу часть 1 (рестарт + fallback), затем миграция и edge-функция.
