# 🤖 GROQ API — Справочник для ИИ-агентов (Только бесплатный тир)

> **Обновлено:** 2026-03-29  
> **Источник лимитов:** Личные данные из консоли + официальная документация Groq  
> **Базовый URL:** `https://api.groq.com/openai/v1`  
> **Совместимость:** OpenAI SDK — полная (drop-in замена, меняй только `base_url` и `api_key`)

---

## ⚡ Почему Groq?

- **LPU (Language Processing Unit)** — собственный чип, не GPU. Детерминированное выполнение без batching-задержек.
- Самый быстрый инференс среди публичных API: до **945 токенов/сек** на gpt-oss-20b.
- **OpenAI-совместимый API** — нулевая миграция если уже используешь openai SDK.
- **Prompt caching** — 50% скидка на повторяющиеся токены контекста, работает автоматически.
- **Бесплатный тир** — без кредитки, регистрация на console.groq.com.

---

## 🔑 Авторизация

```bash
# Переменная окружения
export GROQ_API_KEY="gsk_..."

# Заголовок
Authorization: Bearer $GROQ_API_KEY
Content-Type: application/json
```

```python
# Python SDK
from groq import Groq
client = Groq(api_key="gsk_...")

# OpenAI SDK (drop-in)
from openai import OpenAI
client = OpenAI(api_key="gsk_...", base_url="https://api.groq.com/openai/v1")
```

```typescript
// TypeScript SDK
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
```

---

## 📊 Таблица всех доступных моделей

| Модель | Тип | RPD лим | TPM лим | Контекст | Приоритет использования |
|---|---|---|---|---|---|
| `llama-3.1-8b-instant` | CHAT | **14,400** | 6,000 | 128K | 🥇 Максимальный RPD |
| `meta-llama/llama-prompt-guard-2-22m` | CHAT | **14,400** | 15,000 | — | 🛡️ Модерация |
| `meta-llama/llama-prompt-guard-2-86m` | CHAT | **14,400** | 15,000 | — | 🛡️ Модерация |
| `allam-2-7b` | CHAT | 7,000 | 6,000 | 4K | 🌍 Арабский/Английский |
| `llama-3.3-70b-versatile` | CHAT | 1,000 | 12,000 | 128K | 🥈 Основная рабочая лошадка |
| `meta-llama/llama-4-scout-17b-16e-instruct` | CHAT | 1,000 | **30,000** | 128K | 👁️ Мультимодальная (текст+фото) |
| `moonshotai/kimi-k2-instruct` | CHAT | 1,000 | 10,000 | 131K | 💻 Агентный кодинг |
| `moonshotai/kimi-k2-instruct-0905` | CHAT | 1,000 | 10,000 | **256K** | 💻 Агентный кодинг v2 |
| `openai/gpt-oss-120b` | CHAT | 1,000 | 8,000 | 131K | 🧠 Топ интеллект |
| `openai/gpt-oss-20b` | CHAT | 1,000 | 8,000 | 131K | ⚡ Топ скорость |
| `openai/gpt-oss-safeguard-20b` | CHAT | 1,000 | 8,000 | — | 🛡️ Безопасность/фильтрация |
| `qwen/qwen3-32b` | CHAT | 1,000 | 6,000 | 32K→131K | 🔢 Рассуждение + мультиязычность |
| `groq/compound` | CHAT | 250 | 70,000 | — | 🤖 Агент с веб-поиском |
| `groq/compound-mini` | CHAT | 250 | 70,000 | — | 🤖 Лёгкий агент |
| `whisper-large-v3` | STT | — | — | — | 🎙️ Транскрипция (высокое качество) |
| `whisper-large-v3-turbo` | STT | — | — | — | 🎙️ Транскрипция (быстрее) |
| `canopylabs/orpheus-v1-english` | TTS | — | — | — | 🔊 TTS English |
| `canopylabs/orpheus-arabic-saudi` | TTS | — | — | — | 🔊 TTS Arabic |

> **RPD** = Requests Per Day | **TPM** = Tokens Per Minute  
> **STT/TTS лимиты не задокументированы** — Groq не публикует конкретные цифры для аудио-моделей в free tier.

---

## 🧠 CHAT модели — детальное описание

---

### `llama-3.1-8b-instant`
**Тип:** CHAT | **Лимит:** 14,400 RPD / 6,000 TPM  
**Контекст:** 128K токенов | **Скорость:** ~668 tok/s

**Используй когда:**
- Нужен максимальный объём запросов в день (14,400!)
- Простые задачи: суммаризация, классификация, парсинг, форматирование
- Быстрые ответы без глубокого рассуждения
- Очередь задач с высоким throughput

**Особенности:**
- Самый высокий RPD во всём free tier Groq — основная рабочая модель для массовых задач
- Заменила Gemma2-9B (август 2025)
- Поддерживает JSON mode, function calling
- Хорошо для chain-of-thought на простых задачах

**Пример запроса:**
```python
response = client.chat.completions.create(
    model="llama-3.1-8b-instant",
    messages=[{"role": "user", "content": "Суммаризируй этот текст: ..."}],
    max_tokens=1024
)
```

---

### `llama-3.3-70b-versatile`
**Тип:** CHAT | **Лимит:** 1,000 RPD / 12,000 TPM  
**Контекст:** 128K токенов

**Используй когда:**
- Сложные задачи: анализ, написание кода, рассуждение
- Нужен баланс качество/скорость
- Генерация кода среднего уровня сложности
- Основная «умная» модель в твоём стеке

**Особенности:**
- Лучшее соотношение цена/качество среди Llama-серии
- Поддерживает 128K контекст — можно грузить большие документы
- Хорошие бенчмарки по instruction-following
- Рекомендована Groq как замена deepseek-r1-distill-llama-70b

---

### `meta-llama/llama-4-scout-17b-16e-instruct`
**Тип:** CHAT (мультимодальная) | **Лимит:** 1,000 RPD / **30,000 TPM**  
**Контекст:** 128K токенов (поддерживает до 10M в оригинале!) | **Time-to-first-token:** 0.48s (самый низкий на Groq!)

**Используй когда:**
- Нужно анализировать изображения (до 5 фото за раз)
- Высокий throughput токенов в минуту (30K TPM — максимум среди CHAT моделей)
- Задачи с большим объёмом выходных данных
- Мультиязычные задачи (12 языков)

**Особенности:**
- MoE архитектура: 17B активных параметров из 109B общих — высокая эффективность
- Поддерживает **vision** (изображения через base64 или URL)
- Function calling + JSON mode
- Самая низкая латентность первого токена на платформе Groq (0.48s)
- Обучена на ~40 триллионах токенов

**Пример с изображением:**
```python
response = client.chat.completions.create(
    model="meta-llama/llama-4-scout-17b-16e-instruct",
    messages=[{
        "role": "user",
        "content": [
            {"type": "image_url", "image_url": {"url": "https://example.com/image.jpg"}},
            {"type": "text", "text": "Что изображено на фото?"}
        ]
    }]
)
```

---

### `moonshotai/kimi-k2-instruct`
**Тип:** CHAT | **Лимит:** 1,000 RPD / 10,000 TPM  
**Контекст:** 131K токенов

**Используй когда:**
- Агентный кодинг (agentic coding)
- Сложные multi-turn диалоги с инструментами
- Frontend разработка
- Задачи, требующие длинного контекста

**Особенности:**
- Специализирован на агентных задачах — отличный выбор для AI агентов с tool use
- Поддерживает structured outputs
- Prompt caching работает (автоматически, без кода)
- Устаревает — заменяется на `kimi-k2-instruct-0905`

---

### `moonshotai/kimi-k2-instruct-0905` ⭐ РЕКОМЕНДУЕТСЯ
**Тип:** CHAT | **Лимит:** 1,000 RPD / 10,000 TPM  
**Контекст:** **256K токенов** (самый большой контекст в free tier!)

**Используй когда:**
- Агентный кодинг — лучший в классе
- Нужен огромный контекст (256K — целые кодовые базы!)
- Frontend/full-stack разработка
- Complex multi-turn agent workflows

**Особенности:**
- Улучшенная версия kimi-k2 с сентября 2025
- **256K токенов контекст** — крупнейший на Groq
- Улучшенный агентный кодинг, соперничает с frontier closed-source моделями
- Structured outputs поддерживаются нативно
- Prompt caching включён

---

### `openai/gpt-oss-120b` 🧠 Топ интеллект
**Тип:** CHAT | **Лимит:** 1,000 RPD / 8,000 TPM  
**Контекст:** 131K токенов | **Intelligence Index:** 33 (топ на Groq)

**Используй когда:**
- Максимально сложные задачи рассуждения
- Математика, логика, анализ
- Когда важнее качество, чем скорость
- Задачи уровня GPT-4o / o3-mini

**Особенности:**
- MoE архитектура от OpenAI (open-source версия)
- Производительность сравнима с frontier o3-mini и o4-mini
- Встроенные reasoning capabilities
- Поддерживает браузерный поиск (browser search)
- Рекомендован Groq как замена kimi-k2 и llama-4-maverick (февраль 2026)

---

### `openai/gpt-oss-20b` ⚡ Топ скорость
**Тип:** CHAT | **Лимит:** 1,000 RPD / 8,000 TPM  
**Контекст:** 131K токенов | **Скорость:** **945 tok/s** (быстрейшая модель на Groq!)

**Используй когда:**
- Нужна максимальная скорость генерации
- Задачи реального времени
- Reasoning задачи с приоритетом на latency

**Особенности:**
- Самая быстрая модель на всей платформе Groq
- Reasoning capabilities, как у более крупных моделей
- Встроенный browser search
- Structured outputs

---

### `openai/gpt-oss-safeguard-20b`
**Тип:** CHAT | **Лимит:** 1,000 RPD / 8,000 TPM

**Используй когда:**
- Нужна классификация/фильтрация опасного контента
- Input/output validation в пайплайне агента
- Safety layer перед основной моделью

---

### `qwen/qwen3-32b`
**Тип:** CHAT | **Лимит:** 1,000 RPD / 6,000 TPM  
**Контекст:** 32K нативно, до 131K через YaRN scaling

**Используй когда:**
- Задачи на рассуждение (math, logic, coding)
- Нужны thinking/non-thinking режимы в одной модели
- Мультиязычные задачи (100+ языков!)
- Instruction-following, creative writing, tool use

**Особенности:**
- **Два режима в одной модели:** thinking (глубокое рассуждение) и non-thinking (быстрый диалог)
- Поддерживает `reasoning_effort` параметр и `reasoning_format: "parsed"`
- Заменила qwen-qwq-32b и mistral-saba-24b
- Сильнейшая мультиязычная модель в free tier
- 100+ языков и диалектов

**Пример с reasoning:**
```python
response = client.chat.completions.create(
    model="qwen/qwen3-32b",
    messages=[{"role": "user", "content": "Реши задачу шаг за шагом: ..."}],
    # Для thinking режима:
    extra_body={"reasoning_effort": "default"}  # или "none" для non-thinking
)
# Получить цепочку рассуждений:
print(response.choices[0].message.reasoning)
```

---

### `allam-2-7b`
**Тип:** CHAT | **Лимит:** 7,000 RPD / 6,000 TPM  
**Контекст:** 4K токенов

**Используй когда:**
- Двуязычные Arabic-English приложения
- Задачи с арабским текстом
- Хорошее соотношение RPD/возможности для арабского языка

**Особенности:**
- Разработан NCAI / SDAIA (Saudi Arabia)
- Обучен: 4T English токенов → 1.2T Arabic/English токенов
- Культурно-ориентированный арабский AI
- Использует Groq TruePoint Numerics для ускорения
- Рекомендуемый system prompt: `"You are ALLaM, a bilingual English and Arabic AI assistant"`

---

### `meta-llama/llama-prompt-guard-2-22m` и `llama-prompt-guard-2-86m`
**Тип:** CHAT (классификация) | **Лимит:** 14,400 RPD / 15,000 TPM

**Используй когда:**
- Защита от prompt injection атак
- Входная фильтрация в пайплайне агента
- Валидация пользовательских промптов

**Особенности:**
- Специализированные маленькие модели-классификаторы
- 22m и 86m параметров — ультра-быстрые
- Предназначены для safety layer в production агентах
- 14,400 RPD — можно проверять каждый запрос без ограничений

---

## 🤖 COMPOUND системы — Агентный режим

> Compound — это не просто LLM. Это система, которая сама решает когда использовать инструменты.

### `groq/compound`
**Тип:** CHAT + AGENT | **Лимит:** 250 RPD / 70,000 TPM

**Внутренние модели:** GPT-OSS 120B + Llama 4 Scout + Llama 3.3 70B  
**Инструменты:** web_search, code_interpreter, visit_website, browser_automation, wolfram_alpha

**Используй когда:**
- Нужен ответ, требующий поиска в интернете
- Нужно выполнение Python кода
- Нужна автоматизация браузера
- Несколько инструментов в одном запросе (multi-tool)

**Особенности:**
- Единственный API call — всё оркестрируется на сервере
- Поддерживает несколько tool calls за один запрос
- Code execution через E2B (изолированные Firecracker microVMs)
- Browser automation через Anchor Browser
- Wolfram Alpha для математики

**Пример:**
```python
response = client.chat.completions.create(
    model="groq/compound",
    messages=[{"role": "user", "content": "Найди последние новости об OpenAI и напиши Python код для анализа сентимента"}],
    extra_body={
        "compound_custom": {
            "tools": {
                "enabled_tools": ["web_search", "code_interpreter"]
            }
        }
    }
)
# Посмотреть какие инструменты были вызваны:
print(response.choices[0].message.executed_tools)
```

---

### `groq/compound-mini`
**Тип:** CHAT + AGENT | **Лимит:** 250 RPD / 70,000 TPM

**Внутренние модели:** GPT-OSS 120B + Llama 3.3 70B  

**Используй когда:**
- Один инструмент за запрос (OR search, OR code — не оба)
- Нужна меньшая латентность (~3x быстрее compound)
- Простые агентные задачи

**Отличия от compound:**
- В 3 раза ниже латентность
- Только 1 tool call за запрос
- Подходит для realtime приложений

**Управление версиями:**
```python
# Использовать специфическую версию
client = Groq(default_headers={"Groq-Model-Version": "latest"})
# Или: "2025-08-16" (текущая stable)
```

---

## 🎙️ STT модели (Speech-to-Text)

### `whisper-large-v3`
**Тип:** STT | **Endpoint:** `/openai/v1/audio/transcriptions`

**Используй когда:**
- Максимальное качество транскрипции
- Не критична скорость
- Сложные акценты, шум, диалекты

### `whisper-large-v3-turbo` ⭐ РЕКОМЕНДУЕТСЯ
**Тип:** STT | **Endpoint:** `/openai/v1/audio/transcriptions`

**Используй когда:**
- Нужна быстрая транскрипция
- Realtime приложения
- Хорошее качество при высокой скорости (228x realtime!)

**Пример:**
```python
with open("audio.mp3", "rb") as f:
    transcription = client.audio.transcriptions.create(
        model="whisper-large-v3-turbo",
        file=f,
        response_format="text",
        language="ru"  # опционально
    )
print(transcription)
```

---

## 🔊 TTS модели (Text-to-Speech)

### `canopylabs/orpheus-v1-english`
**Тип:** TTS | **Endpoint:** `/openai/v1/audio/speech`  
**Скорость:** ~100 символов/сек | **Latency:** ~200ms (100ms с input streaming)

**Голоса:** `autumn`, `diana`, `hannah`, `austin`, `daniel`, `troy`

**Используй когда:**
- Английский TTS с эмоциональным контролем
- Voice агенты, customer support, нарратив
- Нужно управлять интонацией через теги

**Особенности:**
- Backbone: Llama 3B, обучен на 100,000+ часах речи
- Поддерживает **vocal direction теги:** `[cheerful]`, `[whisper]`, `[sad]`, `[excited]`
- ⚠️ Нужно принять условия в Groq Playground перед первым использованием

**Пример:**
```python
response = client.audio.speech.create(
    model="canopylabs/orpheus-v1-english",
    input="Hello! [cheerful] This is an amazing day! [whisper] Can you keep a secret?",
    voice="hannah",
    response_format="wav"
)
with open("output.wav", "wb") as f:
    f.write(response.content)
```

---

### `canopylabs/orpheus-arabic-saudi`
**Тип:** TTS | **Endpoint:** `/openai/v1/audio/speech`

**Голоса:** `fahad` (M), `sultan` (M), `noura` (F), `lulwa` (F), `aisha` (F)

**Используй когда:**
- Арабский TTS (Saudi dialect)
- Аутентичная региональная произносительность

**Особенности:**
- Vocal direction теги не поддерживаются (в отличие от английской версии)

---

## 🎯 Стратегия использования лимитов на 100%

### Приоритеты по RPD (от большего к меньшему)

```
14,400/день  →  llama-3.1-8b-instant       | Все простые задачи
14,400/день  →  llama-prompt-guard-2-22m    | Safety validation КАЖДОГО запроса
14,400/день  →  llama-prompt-guard-2-86m    | Safety validation (более точный)
 7,000/день  →  allam-2-7b                  | Арабские задачи
 1,000/день  →  llama-3.3-70b-versatile     | Средней сложности
 1,000/день  →  llama-4-scout               | Мультимодальные / высокий TPM
 1,000/день  →  kimi-k2-instruct-0905       | Агентный кодинг
 1,000/день  →  gpt-oss-120b               | Топ сложность
 1,000/день  →  gpt-oss-20b                | Топ скорость
 1,000/день  →  gpt-oss-safeguard-20b      | Content filtering
 1,000/день  →  qwen/qwen3-32b             | Рассуждение / мультиязычность
   250/день  →  groq/compound              | Агентные задачи с веб-поиском
   250/день  →  groq/compound-mini         | Лёгкие агентные задачи
```

### Рекомендуемый роутинг для агентов

```python
def route_to_model(task_type: str, complexity: str) -> str:
    routing = {
        # Safety первым делом — используй prompt-guard на КАЖДЫЙ входящий запрос
        ("safety", "any"):        "meta-llama/llama-prompt-guard-2-86m",
        
        # Простые задачи — максимальный RPD
        ("simple", "low"):        "llama-3.1-8b-instant",
        ("format", "any"):        "llama-3.1-8b-instant",
        ("classify", "low"):      "llama-3.1-8b-instant",
        
        # Средней сложности
        ("code", "medium"):       "llama-3.3-70b-versatile",
        ("analysis", "medium"):   "llama-3.3-70b-versatile",
        
        # Сложный кодинг / агентность
        ("code", "high"):         "moonshotai/kimi-k2-instruct-0905",
        ("agent", "coding"):      "moonshotai/kimi-k2-instruct-0905",
        
        # Максимальный интеллект
        ("reasoning", "high"):    "openai/gpt-oss-120b",
        ("math", "any"):          "openai/gpt-oss-120b",
        
        # Мультимодальные
        ("vision", "any"):        "meta-llama/llama-4-scout-17b-16e-instruct",
        
        # Агент с интернетом
        ("web_search", "any"):    "groq/compound",
        ("agent", "web"):         "groq/compound-mini",
        
        # Речь
        ("transcribe", "fast"):   "whisper-large-v3-turbo",
        ("transcribe", "quality"): "whisper-large-v3",
        ("tts", "english"):       "canopylabs/orpheus-v1-english",
        ("tts", "arabic"):        "canopylabs/orpheus-arabic-saudi",
        
        # Арабский текст
        ("arabic", "any"):        "allam-2-7b",
        
        # Рассуждение на нескольких языках
        ("multilingual", "any"):  "qwen/qwen3-32b",
    }
    return routing.get((task_type, complexity), "llama-3.1-8b-instant")
```

---

## ⚙️ Полезные параметры API

### Стандартные параметры CHAT

```python
response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[...],
    max_tokens=8192,           # Максимум токенов в ответе
    temperature=0.7,           # 0=детерминированно, 2=максимально творчески
    top_p=0.9,                 # Nucleus sampling
    stream=True,               # Стриминг ответа
    response_format={"type": "json_object"},  # JSON режим
    seed=42,                   # Воспроизводимость (если поддерживается)
)
```

### Flex tier (10x лимиты на throughput, могут быть отказы)

```python
response = client.chat.completions.create(
    model="llama-3.1-8b-instant",
    messages=[...],
    extra_body={"service_tier": "flex"}  # Вместо "on_demand"
)
```

### Function calling / Tool use

```python
response = client.chat.completions.create(
    model="kimi-k2-instruct-0905",
    messages=[{"role": "user", "content": "Какая погода в Токио?"}],
    tools=[{
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather for a city",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string"}
                },
                "required": ["city"]
            }
        }
    }],
    tool_choice="auto"
)
```

### Structured outputs (JSON Schema)

```python
from pydantic import BaseModel

class Result(BaseModel):
    summary: str
    score: int
    tags: list[str]

response = client.beta.chat.completions.parse(
    model="moonshotai/kimi-k2-instruct-0905",
    messages=[{"role": "user", "content": "Проанализируй текст..."}],
    response_format=Result,
)
result = response.choices[0].message.parsed
```

---

## 🔧 Поддерживаемые возможности по моделям

| Модель | Vision | Function Calling | Structured Output | JSON Mode | Streaming | Reasoning |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| llama-3.1-8b-instant | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ |
| llama-3.3-70b-versatile | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ |
| llama-4-scout-17b-16e | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| kimi-k2-instruct | ❌ | ✅ | ⚠️ | ✅ | ✅ | ❌ |
| kimi-k2-instruct-0905 | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| gpt-oss-120b | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| gpt-oss-20b | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| qwen/qwen3-32b | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| groq/compound | ❌ | ⛔ custom | N/A | N/A | ✅ | ✅ |
| groq/compound-mini | ❌ | ⛔ custom | N/A | N/A | ✅ | ✅ |
| allam-2-7b | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |

> ⚠️ = частичная поддержка | ⛔ = кастомные tools не поддерживаются, только встроенные

---

## 📈 Производительность (данные artificialanalysis.ai)

| Модель | Скорость (tok/s) | TTFT (s) | Контекст |
|---|---|---|---|
| gpt-oss-20b | **945** | 0.7s | 131K |
| llama-3.1-8b | ~668 | 0.6s | 128K |
| gpt-oss-120b | ~465 | **0.60s** | 131K |
| llama-4-scout | ~400 | **0.48s** | 128K |
| kimi-k2-0905 | ~350 | 0.8s | **256K** |
| llama-3.3-70b | ~280 | 0.9s | 128K |

---

## ⚠️ Важные ограничения и нюансы

1. **compound/compound-mini** — не поддерживают кастомные user-defined tools. Только встроенные (web_search, code_interpreter, visit_website, browser_automation, wolfram_alpha)

2. **Structured outputs** — поддерживаются только в новых моделях (kimi-k2-0905, gpt-oss-*). Для остальных используй `json_object` формат с упоминанием "JSON" в промпте.

3. **allam-2-7b** — контекст только 4K токенов, в отличие от остальных. Используй только для коротких Arabic/English задач.

4. **Orpheus TTS** — перед первым использованием нужно принять ToS в Groq Console/Playground.

5. **RPM (запросы в минуту)** — глобальный лимит по умолчанию ~30 RPM для большинства моделей. Используй `service_tier: "flex"` для до 300 RPM (с возможными отказами).

6. **Prompt caching** — работает автоматически на Kimi K2 и ряде других моделей. Повторяющиеся prefix-токены кэшируются со скидкой 50%.

7. **kimi-k2-instruct** (без -0905) — помечена к устареванию (март 2026). Используй -0905 версию.

8. **Compound** — не HIPAA-compliant, не работает с regional/sovereign endpoints.

---

## 🔗 Полезные ссылки

- **Консоль / API ключи:** https://console.groq.com/keys
- **Документация моделей:** https://console.groq.com/docs/models
- **Лимиты:** https://console.groq.com/docs/rate-limits
- **Changelog:** https://console.groq.com/docs/changelog
- **Compound docs:** https://console.groq.com/docs/compound
- **TTS docs:** https://console.groq.com/docs/text-to-speech
- **STT docs:** https://console.groq.com/docs/speech-text
- **Python SDK:** `pip install groq`
- **TypeScript SDK:** `npm install groq-sdk`

---

*Файл создан: 2026-03-29 | Следующий провайдер: добавить в этот файл*
