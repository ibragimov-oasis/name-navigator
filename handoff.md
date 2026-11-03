# Handoff — Реестр РТ (Феҳристи номҳои миллии тоҷикӣ)

Обновлено: 2026-09-23. Работа велась ТОЛЬКО по разделу «Реестр РТ» (`/tajik-names`). Ничего не удалялось — только правки, типизация и новые возможности.

## Сделано и проверено

- **Асинхронная загрузка реестра.** Датасет 3461 имени (3.3 МБ) вынесен в `public/data/tajik-registry.json`; исходный `src/data/tajikRegistryData.json` сохранён. Загрузка через `src/lib/api/tajikRegistryApi.ts` (кэш в памяти, дедуп параллельных запросов, dynamic-import fallback для тестов/SSR). Страница больше не тянет JSON в основной бандл.
- **Hook `useTajikRegistry`** (`src/hooks/useTajikRegistry.ts`): loading / error / reload, abort, counts, alphabet stats, `useDebouncedValue`.
- **Чистые функции реестра** (`src/data/tajikRegistry.ts`): поиск по индексу, `checkTajikNameLegality(query, names)` со статусами `permitted | likely | not_found`, подсказки по Левенштейну, `tajikNameSlug`, статистика.
- **Утилиты** `src/lib/tajik/text.ts` (нормализации, Левенштейн, слоги, редкие буквы) и `src/lib/tajik/fio.ts` (правила ФИО, национальные суффиксы `-зода/-иён/-ӣ`, score + подсказка).
- **UI:** скелетоны и экран ошибки с retry (`src/components/tajik/TajikRegistrySkeleton.tsx`), новая вкладка «Санҷиши НИН (ФИО)» (`src/components/tajik/TajikFioChecker.tsx`), умные фильтры (длина имени, редкие буквы), кнопка «Мубодилаи ҷустуҷӯ», сброс фильтров, трёхцветный результат проверки (permitted / likely / not_found).
- **Deep links и SEO:** состояние `tab/q/gender/letter/page/name` в URL, открытие карточки по slug, `<SEO>` с title/description/canonical.
- **Производительность:** маршрут `/tajik-names` теперь lazy (`React.lazy` + `Suspense` в `src/App.tsx`).
- **Багфиксы по пути:** `toggleFavorite` вызывался с объектом вместо `id` в `TajikNameDetailDialog`, `TajikRandomGeneratorDialog`, `TajikNames`; в `CoupleSwipe.tsx` отсутствовали импорты иконок `Sparkles`, `ArrowRight` (страница падала); убран `as any`-подобный каст в enrichment-запросе.

### Верификация
- `tsgo --noEmit -p tsconfig.app.json` — 0 ошибок.
- `vitest run src/test/tajikRegistry.test.ts` — 12 тестов проходят (счётчики 3461 / 2007 / 1454, проверка имён, подсказки, ФИО-правила, текстовые утилиты).
- Build log: `build OK`.
- Playwright: `/tajik-names?q=Рустам` и `?tab=fio` рендерятся корректно, ошибок в консоли нет (только предустановочные React ref-warnings в dev).

## Findings / Proposals
- Только ~36% записей имеют `meaning`/`history` (1267 из 3461). Подключение таблицы `tajik_registry_enrichment` уже заложено в `fetchEnrichment()` (`USE_REMOTE=false`), таблицы пока нет.
- Правовая формулировка «Қарори №98» на странице не подтверждена первоисточником — стоит сверить с официальным PDF Комитета по языку.

## Next steps
1. Создать таблицу `tajik_registry_enrichment` и запустить обогащение значений/истории, включить `USE_REMOTE`.
2. Добавить JSON-LD `Dataset` и страницы отдельных имён (`/tajik-names/:slug`) для SEO.
3. Виртуализация списка при выводе более 200 карточек.

## 2026-11-03 — Автопополнение имён восстановлено
- `supabase/functions/enrich-names/index.ts` переписан и задеплоен: провайдеры Lovable AI Gateway (google/gemini-3.8-flash) → Gemini → Pollinations; культура с наименьшим покрытием, 20 имён за запуск, без повторов, пишет в `names_enriched` (status published) и лог в `enrich_runs`.
- Баг: `name_lower` — generated-колонка, её вставка ломала все insert'ы. Исправлено. Проверено: запуск добавил 13 украинских имён.
- Cron `enrich-names-every-15min` уже указывает на функцию (~80 имён/час при наличии кредитов ИИ).
- `src/lib/namesStore.ts`: `loadEnrichedNames()` подтягивает опубликованные имена из БД, кэш в localStorage применяется синхронно при старте, событие `names-updated`. Проверено Playwright: 1403 имени в кэше, ошибок нет.
- Next: страницы, держащие список в useMemo([]), увидят новые имена только со следующего захода — можно подписать их на `names-updated`.
