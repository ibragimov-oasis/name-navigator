# 🌸 Pollinations API — Полная документация для AI-агентов

> **Источник:** [gen.pollinations.ai](https://gen.pollinations.ai) · [GitHub](https://github.com/pollinations/pollinations) · [Docs](https://enter.pollinations.ai/api/docs)  
> **Обновлено:** Март 2026  
> **Версия API:** 0.3.0 (OpenAPI 3.1.0)

---

## ⚠️ КРИТИЧЕСКИ ВАЖНО — БЮДЖЕТ ПОЛЛЕНА

```
Бюджет:     0.010 поллена / час (Publishable Key)
Сброс:      каждый час (НЕ накапливается!)
Стратегия:  ТРАТИТЬ ВСЁ до сброса — остаток сгорает
Правило:    лучше лишний запрос, чем потерять поллен
1 Pollen = $1 (курс платформы)
```

**Тип ключа:** Publishable Key (`pk_...`) — для frontend / агентов  
**Лимит:** 0.010 поллена / час на IP + ключ  
**⚡ Важно:** Не давай полленам "протухнуть" — планируй задачи каждый час!

---

## 🔗 API Эндпоинты

```
Base URL (новый):  https://gen.pollinations.ai
Legacy image:      https://image.pollinations.ai   (работает)
Legacy text:       https://text.pollinations.ai    (работает)
Docs:              https://enter.pollinations.ai/api/docs
Dashboard:         https://enter.pollinations.ai
```

### Аутентификация

```http
Authorization: Bearer YOUR_API_KEY
# или query param:
?key=YOUR_API_KEY
```

### Базовые запросы

```bash
# Изображение (Flux — бесплатно)
curl 'https://gen.pollinations.ai/image/a beautiful cat?model=flux' \
  -H 'Authorization: Bearer YOUR_API_KEY'

# Текст (OpenAI-совместимый формат)
curl 'https://gen.pollinations.ai/v1/chat/completions' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"model": "openai", "messages": [{"role": "user", "content": "Hello"}]}'

# Аудио TTS
curl 'https://gen.pollinations.ai/audio/Hello?voice=nova&key=YOUR_KEY' -o speech.mp3

# Проверить баланс поллена
curl 'https://gen.pollinations.ai/account/balance' -H 'Authorization: Bearer YOUR_API_KEY'

# История использования
curl 'https://gen.pollinations.ai/account/usage' -H 'Authorization: Bearer YOUR_API_KEY'
```

---

## 📊 Легенда возможностей и типов токенов

### Возможности моделей

| Эмодзи | Значение |
|--------|----------|
| 👁️ | Vision — принимает изображения на вход |
| 🧠 | Reasoning — расширенное логическое мышление (chain-of-thought) |
| 🎙️ | Audio In — принимает аудио на вход |
| 🔍 | Search — встроенный поиск в интернете в реальном времени |
| 🔊 | Audio Out — генерирует аудио |
| 💻 | Code Execution — выполнение кода на сервере |

### Типы токенов / метрики стоимости

| Эмодзи | Тип | Метрика |
|--------|-----|---------|
| 💬 | Текстовые токены | /M = за миллион |
| 🖼️ | Изображения | /img = за одно изображение |
| 💾 | Кэшированные токены | /M = за миллион (дешевле обычных) |
| 🎬 | Видео | /sec = за секунду |
| 🔊 | Аудио | /sec или /1K chars |

---

## 🖼️ МОДЕЛИ ИЗОБРАЖЕНИЙ

> **⭐ Flux Schnell — ВСЕГДА БЕСПЛАТЕН, без лимита поллена**

| Модель | Alias | Цена | За 0.01🌸/час | Возможности |
|--------|-------|------|--------------|-------------|
| **Flux Schnell** | `flux` | **0🌸 (бесплатно!)** | **♾️ неограниченно** | Быстрая генерация, отличное качество, SDXL-уровень |
| **Z-Image Turbo** | `zimage` | 0.002🌸/img | **≈ 5 изобр./час** | Турбо-генерация |
| **FLUX.2 Klein 4B** (ALPHA) | `klein` | 0.01🌸/img | **≈ 1 изобр./час** | 👁️ Vision; компактная 4B модель |
| **GPT Image 1 Mini** | `gptimage` | вх: 0.002🌸/M txt + 0.0025🌸/M img; вых: 0.008🌸/img | **≈ 1 изобр./час** | 👁️ Vision; OpenAI image model |
| **Grok Imagine** (NEW) | `grok-imagine` | 0.02🌸/img | **≈ 0.5 изобр./час** (1 раз в 2 часа) | xAI Grok visual model (alpha) |
| **Qwen Image Plus** (NEW) | `qwen-image` | 0.03🌸/img | **≈ 0.33 изобр./час** (1 раз в 3 часа) | 👁️ Vision; нативный CJK-текст, multi-image editing |

### 💡 Стратегия изображений

```
♾️  flux         → всегда использовать по умолчанию (бесплатно!)
✅  zimage       → 5 изобр./час, быстро, стоит 0.01 поллена
⚠️  klein        → 1 изобр./час — только если нужна vision-модель
❌  grok-imagine  → слишком дорого при 0.01 бюджете
❌  qwen-image   → слишком дорого при 0.01 бюджете
```

---

## 🎬 МОДЕЛИ ВИДЕО

> Видео крайне дорогое при 0.01🌸/час — использовать только если критически необходимо

| Модель | Alias | Цена | За 0.01🌸/час | Возможности |
|--------|-------|------|--------------|-------------|
| **Wan 2.2** (NEW) | `wan-fast` | 0.010🌸/сек видео + 0.010🌸/сек аудио | **≈ 0.5 сек** (оба трека вместе) | 👁️ Vision; text-to-video, image-to-video |
| **LTX-2** (NEW) | `ltx-2` | 0.010🌸/сек | **≈ 1 сек видео** | Быстрая text-to-video генерация |
| **Amazon Nova Reel** | `nova-reel` | 0.080🌸/сек | **≈ 0.12 сек** (нецелесообразно) | 👁️ Vision; студийное качество видео |

### 💡 Стратегия видео

```
❌  Всё видео при 0.01 поллена практически нецелесообразно
⚠️  Если нужен ровно 1 сек — использовать ltx-2
❌  nova-reel — слишком дорого, не использовать
```

---

## 🔊 МОДЕЛИ АУДИО

| Модель | Alias | Тип | Цена | За 0.01🌸/час | Возможности |
|--------|-------|-----|------|--------------|-------------|
| **Whisper Large V3** (ALPHA) | `whisper` | 🎙️ STT | 0.00004🌸/сек | **≈ 250 сек ≈ 4 мин** транскрипции | Многоязычное распознавание речи (OpenAI Whisper) |
| **ElevenLabs Scribe v2** | `scribe` | 🎙️ STT | 0.00011🌸/сек | **≈ 91 сек ≈ 1.5 мин** транскрипции | Высокоточная транскрипция ElevenLabs |
| **ElevenLabs v3 TTS** | `elevenlabs` | 🔊 TTS | 0.18🌸/1K chars | **≈ 55 символов** (~1-2 предложения) | Голоса: alloy, echo, fable, onyx, shimmer, coral, verse, ballad, ash, sage, amuch, dan |
| **ElevenLabs Music** | `elevenmusic` | 🔊 Music | 0.0050🌸/сек | **≈ 2 сек музыки** (нецелесообразно) | Генерация музыки |

### 💡 Стратегия аудио

```
✅  whisper      → ЛУЧШИЙ выбор: 4 мин транскрипции за весь бюджет/час
✅  scribe       → 1.5 мин, выше качество
⚠️  elevenlabs   → только короткие фразы (2-3 предложения максимум)
❌  elevenmusic  → нецелесообразно при данном бюджете
```

---

## 💬 ТЕКСТОВЫЕ МОДЕЛИ

> `/M` = за миллион токенов · `💾` = цена кэшированных токенов (дешевле)

---

### 🟢 ВЫСОКАЯ ЭФФЕКТИВНОСТЬ (максимум токенов)

| Модель | Alias | Вход | Кэш | Выход | За 0.01🌸: вход / выход | Возможности |
|--------|-------|------|-----|-------|------------------------|-------------|
| **Qwen3Guard 8B** | `qwen-safety` | 0.01💬/M | — | 0.01💬/M | **1M / 1M токенов** ⭐ | Модерация контента, safety-фильтрация |
| **Amazon Nova Micro** | `nova-fast` | 0.04💬/M | — | 0.15💬/M | **250K / 67K токенов** | Очень быстрый, минимальная латентность |
| **Qwen3 Coder 30B** | `qwen-coder` | 0.06💬/M | — | 0.22💬/M | **167K / 45K токенов** | Специализируется на коде, 30B параметров |
| **OpenAI GPT-5 Nano** | `openai-fast` | 0.06💬/M | 0.01💾/M | 0.44💬/M | **167K / 23K токенов** | 👁️ Vision; быстрый GPT-5 Nano, кэш токены |
| **Mistral Small 3.2 24B** | `mistral` | 0.1💬/M | — | 0.3💬/M | **100K / 33K токенов** | Универсальный, надёжный, 24B параметров |
| **Google Gemini 2.5 Flash Lite** | `gemini-fast` | 0.1💬/M | 0.01💾/M · 0.1🔊/M | 0.4💬/M | **100K / 25K токенов** | 👁️🔍💻 Vision + поиск + выполнение кода |
| **Google Gemini 2.5 Flash Lite** | `gemini-search` | 0.1💬/M | 0.01💾/M · 0.1🔊/M | 0.4💬/M | **100K / 25K токенов** | 👁️🔍💻 То же + поиск включён по умолчанию |

> `gemini-fast` и `gemini-search` — одна и та же модель. Разница: `gemini-search` имеет поиск включённым по умолчанию.

---

### 🟡 СРЕДНЯЯ ЭФФЕКТИВНОСТЬ

| Модель | Alias | Вход | Кэш | Выход | За 0.01🌸: вход / выход | Возможности |
|--------|-------|------|-----|-------|------------------------|-------------|
| **OpenAI GPT-5 Mini** | `openai` | 0.15💬/M | 0.04💾/M | 0.6💬/M | **67K / 17K токенов** | 👁️ Vision; умный GPT-5 Mini |
| **Qwen3 VL Plus** (NEW) | `qwen-vision` | 0.2💬/M | — | 1.6💬/M | **50K / 6K токенов** | 👁️🧠 Vision + reasoning; мощный multimodal |
| **MiniMax M2.5** | `minimax` | 0.3💬/M | 0.03💾/M | 1.2💬/M | **33K / 8K токенов** | 🧠 Reasoning; мощная модель MiniMax |
| **Qwen3.5 Plus** (NEW) | `qwen-large` | 0.4💬/M | — | 2.4💬/M | **25K / 4K токенов** | 🧠 Reasoning; улучшенная Qwen3 |

---

### 🔴 ДОРОГИЕ (мало токенов за 0.01 поллена)

| Модель | Alias | Вход | Кэш | Выход | За 0.01🌸: вход / выход | Возможности |
|--------|-------|------|-----|-------|------------------------|-------------|
| **Perplexity Sonar** | `perplexity-fast` | 1.0💬/M | — | 1.0💬/M | **10K / 10K токенов** | 🔍 Поиск в реальном времени (Perplexity) |
| **DeepSeek V3.2** | `deepseek` | 0.57💬/M | 0.29💾/M | 1.68💬/M | **18K / 6K токенов** | 🧠 Reasoning; мощный open-source |
| **Moonshot Kimi K2.5** | `kimi` | 0.6💬/M | 0.1💾/M | 3.0💬/M | **17K / 3K токенов** | 👁️🧠 Vision + reasoning; длинный контекст |
| **Z.ai GLM-5** | `glm` | 0.6💬/M | 0.3💾/M | 2.21💬/M | **17K / 5K токенов** | 🧠 Reasoning; Z.ai GLM серия |
| **Anthropic Claude Haiku 4.5** | `claude-fast` | 1.0💬/M | 0.1💾/M | 5.0💬/M | **10K / 2K токенов** | 👁️ Vision; последний Claude Haiku от Anthropic |
| **MIDIjourney** | `midijourney` | 1.0💬/M | 0.1💾/M | 5.0💬/M | **10K / 2K токенов** | Генерация MIDI/музыкальных описаний |
| **Perplexity Sonar Reasoning** | `perplexity-reasoning` | 2.0💬/M | — | 8.0💬/M | **5K / 1.25K токенов** | 🧠🔍 Reasoning + поиск (мощнейший поиск) |
| **OpenAI GPT-4o Mini Audio** | `openai-audio` | 0.17💬/M · 11.0🎙️/M | — | 0.66💬/M · 22.0🔊/M | **59K текст / 909 сек аудио** | 👁️🎙️🔊 Vision + аудио вход и выход |

---

### 🔮 СПЕЦИАЛЬНАЯ / НЕИЗВЕСТНАЯ СТОИМОСТЬ

| Модель | Alias | Возможности | Описание |
|--------|-------|-------------|----------|
| **Polly** by @Itachi-1824 (ALPHA) | `polly` | 👁️🧠🔍💻 | Vision + reasoning + search + code exec; стоимость не указана — возможно бесплатная, стоит проверить |

---

## 📋 СВОДНАЯ ТАБЛИЦА — ВСЕ МОДЕЛИ

```
ALIAS               КАТЕГОРИЯ   СПОСОБНОСТИ     ЗА 0.01🌸/ЧАС
─────────────────────────────────────────────────────────────────
flux                Image       —               ♾️ БЕСПЛАТНО (всегда!)
zimage              Image       —               ~5 изображений
klein               Image       👁️              ~1 изображение
gptimage            Image       👁️              ~1 изображение
grok-imagine        Image       —               ~0.5 изображения
qwen-image          Image       👁️              ~0.33 изображения

wan-fast            Video       👁️              ~0.5 сек (видео+аудио)
ltx-2               Video       —               ~1 сек видео
nova-reel           Video       👁️              ~0.12 сек (не использовать)

whisper             Audio STT   🎙️              ~250 сек транскрипции ⭐
scribe              Audio STT   🎙️              ~91 сек транскрипции
elevenlabs          Audio TTS   🔊              ~55 символов (~2 предл.)
elevenmusic         Audio Music 🔊              ~2 сек (не использовать)

qwen-safety         Text        —               1M / 1M токенов ⭐⭐
nova-fast           Text        —               250K / 67K токенов ⭐
qwen-coder          Text        —               167K / 45K токенов ⭐
openai-fast         Text        👁️              167K / 23K токенов ⭐
mistral             Text        —               100K / 33K токенов ⭐
gemini-fast         Text        👁️🔍💻          100K / 25K токенов ⭐
gemini-search       Text        👁️🔍💻          100K / 25K токенов ⭐
openai              Text        👁️              67K / 17K токенов
qwen-vision         Text        👁️🧠            50K / 6K токенов
minimax             Text        🧠              33K / 8K токенов
qwen-large          Text        🧠              25K / 4K токенов
perplexity-fast     Text        🔍              10K / 10K токенов
deepseek            Text        🧠              18K / 6K токенов
kimi                Text        👁️🧠            17K / 3K токенов
glm                 Text        🧠              17K / 5K токенов
claude-fast         Text        👁️              10K / 2K токенов
midijourney         Text        —               10K / 2K токенов (MIDI)
perplexity-reason   Text        🧠🔍            5K / 1.25K токенов
openai-audio        Text/Audio  👁️🎙️🔊          59K текст / 909 сек аудио
polly               Text        👁️🧠🔍💻        Неизвестно (проверить!)
```

---

## 🎯 СТРАТЕГИИ ИСПОЛЬЗОВАНИЯ 0.010🌸/ЧАС

### Сценарий: Генерация кода
```
1. qwen-coder   → основная генерация кода (167K токенов)
2. flux         → генерация диаграмм/иллюстраций (бесплатно)
```

### Сценарий: Анализ данных с поиском
```
1. gemini-search → анализ + актуальный поиск (100K токенов)
2. flux          → визуализация (бесплатно)
```

### Сценарий: Модерация / фильтрация контента
```
1. qwen-safety  → 1 МИЛЛИОН токенов за весь бюджет!
```

### Сценарий: Транскрипция + обработка
```
1. whisper      → транскрипция (250 сек аудио)
2. nova-fast    → обработка текста транскрипции (250K токенов)
```

### Сценарий: Vision-задачи
```
1. openai-fast  → анализ изображений (167K токенов)
2. flux         → генерация (бесплатно)
```

---

## 📦 ПРИМЕР КОДА (Python)

```python
import requests

API_KEY = "pk_ТВОЙ_КЛЮЧ"
BASE_URL = "https://gen.pollinations.ai"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# === ТЕКСТ (OpenAI-совместимый) ===
def chat(model: str, message: str, system: str = None) -> str:
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": message})
    
    response = requests.post(
        f"{BASE_URL}/v1/chat/completions",
        headers=headers,
        json={"model": model, "messages": messages}
    )
    return response.json()["choices"][0]["message"]["content"]

# === ИЗОБРАЖЕНИЕ ===
def generate_image(prompt: str, model: str = "flux", width: int = 1024, height: int = 1024) -> bytes:
    url = f"{BASE_URL}/image/{requests.utils.quote(prompt)}"
    response = requests.get(url, params={
        "model": model, "width": width, "height": height
    }, headers={"Authorization": f"Bearer {API_KEY}"})
    return response.content  # байты изображения (JPEG/PNG)

# === ТРАНСКРИПЦИЯ (Whisper) ===
def transcribe(audio_path: str) -> str:
    with open(audio_path, "rb") as f:
        response = requests.post(
            f"{BASE_URL}/v1/audio/transcriptions",
            headers={"Authorization": f"Bearer {API_KEY}"},
            files={"file": f},
            data={"model": "whisper"}
        )
    return response.json()["text"]

# === ПРОВЕРКА БАЛАНСА ===
def check_balance() -> dict:
    r = requests.get(f"{BASE_URL}/account/balance", headers=headers)
    return r.json()

# ========= ПРИМЕРЫ =========

# Код — максимум токенов за поллен
result = chat("qwen-coder", "Write a Python quicksort with type hints")

# Поиск в реальном времени
result = chat("gemini-search", "What are the top AI news today?")

# Модерация (1M токенов за 0.01 поллена!)
result = chat("qwen-safety", "Is this message safe: 'Hello world'")

# Изображение БЕСПЛАТНО
img = generate_image("futuristic city at night, neon lights", model="flux")
with open("output.jpg", "wb") as f:
    f.write(img)

# Баланс
print(check_balance())
```

---

## 📦 ПРИМЕР КОДА (JavaScript / Node.js)

```javascript
const API_KEY = "pk_ТВОЙ_КЛЮЧ";
const BASE_URL = "https://gen.pollinations.ai";

const headers = {
  "Authorization": `Bearer ${API_KEY}`,
  "Content-Type": "application/json"
};

// Текст
async function chat(model, message, system = null) {
  const messages = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: message });

  const res = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ model, messages })
  });
  const data = await res.json();
  return data.choices[0].message.content;
}

// Изображение (Flux — бесплатно)
function imageUrl(prompt, model = "flux", width = 1024, height = 1024) {
  return `${BASE_URL}/image/${encodeURIComponent(prompt)}?model=${model}&width=${width}&height=${height}&key=${API_KEY}`;
}

// Баланс
async function checkBalance() {
  const res = await fetch(`${BASE_URL}/account/balance`, { headers });
  return res.json();
}

// Примеры
chat("qwen-coder", "Write a React hook for dark mode").then(console.log);
chat("gemini-search", "Latest AI news today").then(console.log);
chat("qwen-safety", "Check if this is safe: hello").then(console.log);
console.log(imageUrl("a dragon in space")); // вставь в <img src="">
checkBalance().then(console.log);
```

---

## 🔧 ПАРАМЕТРЫ API

### POST `/v1/chat/completions` (текст)

```json
{
  "model": "openai",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant"},
    {"role": "user", "content": "..."}
  ],
  "stream": true,
  "temperature": 0.7,
  "max_tokens": 1000,
  "tools": ["google_search", "code_execution", "google_maps", "url_context", "file_search"]
}
```

> ⚠️ `tools` доступен для `gemini-fast` и `gemini-search`

### GET `/image/{prompt}` (изображение)

| Параметр | Описание | Пример |
|----------|----------|--------|
| `model` | Модель | `flux`, `zimage`, `klein` |
| `width` | Ширина пикселей | `1024` |
| `height` | Высота пикселей | `1024` |
| `seed` | Воспроизводимость | `42` |
| `enhance` | Улучшение промпта AI | `true` |
| `nologo` | Без watermark | `true` |
| `negative` | Negative prompt | `blurry, ugly` |

### Голоса для TTS (`elevenlabs`, `openai-audio`)

```
alloy · echo · fable · onyx · shimmer · coral · verse · ballad · ash · sage · amuch · dan
```

### Инструменты для Gemini (`gemini-fast` / `gemini-search`)

```
google_search   — поиск в интернете в реальном времени
code_execution  — выполнение Python кода
google_maps     — поиск мест и карты
url_context     — анализ содержимого URL
file_search     — поиск по файлам
computer_use    — управление компьютером (beta)
```

---

## 📊 РЕЙТИНГ ЭФФЕКТИВНОСТИ (0.010🌸/час)

```
РАНГ  ALIAS               ПРИЧИНА
─────────────────────────────────────────────────────────────
 1⭐  flux                БЕСПЛАТНО — всегда использовать для изображений
 2⭐  qwen-safety         1 МИЛЛИОН токенов за 0.01 поллена!
 3⭐  nova-fast           250K вход, мгновенный ответ
 4⭐  qwen-coder          167K вход, специализируется на коде
 5⭐  openai-fast         167K вход + vision (GPT-5 Nano)
 6⭐  mistral             100K вход, универсальный и надёжный
 7⭐  gemini-fast         100K вход + ПОИСК + код + vision (3в1!)
 8⭐  gemini-search       100K вход + поиск включён по умолчанию
 9   whisper             250 сек транскрипции (лучший STT)
10   zimage              5 изображений/час (если нужно не Flux)
11   openai              67K вход + vision (GPT-5 Mini)
12   qwen-vision         50K вход + vision + reasoning
13   deepseek            18K вход + мощный reasoning
14   minimax             33K вход + reasoning
15   perplexity-fast     10K токенов с актуальным поиском
16   polly               Неизвестно — может быть бесплатным!
17   claude-fast         10K вход + vision (Haiku 4.5)
18   kimi                17K вход + vision + reasoning
19   glm                 17K вход + reasoning
20   openai-audio        Аудио вход/выход + vision
──   perplexity-reason   НЕ РЕКОМЕНДУЕТСЯ (дорого + мало токенов)
──   nova-reel           НЕ РЕКОМЕНДУЕТСЯ (видео нецелесообразно)
──   elevenmusic         НЕ РЕКОМЕНДУЕТСЯ (2 сек музыки бессмысленно)
```

---

## ⚡ ПРАВИЛА ДЛЯ AI-АГЕНТОВ

```
1.  ПРОВЕРЯЙ баланс перед каждым циклом: GET /account/balance
2.  ИСПОЛЬЗУЙ flux для всех изображений (бесплатно, всегда!)
3.  ПРИОРИТИЗИРУЙ qwen-coder / nova-fast / openai-fast для текста
4.  ИСПОЛЬЗУЙ gemini-fast если нужен поиск или выполнение кода
5.  НЕ ОСТАВЛЯЙ поллен — он сгорает каждый час без накопления!
6.  ПЛАНИРУЙ задачи в начале каждого часового окна
7.  ДЛЯ reasoning → deepseek или qwen-vision
8.  ДЛЯ транскрипции → whisper (самый дешёвый STT)
9.  ДЛЯ модерации → qwen-safety (1M токенов за 0.01 поллена!)
10. ИЗБЕГАЙ: nova-reel, elevenmusic, perplexity-reasoning
11. ТЕСТИРУЙ polly — возможно бесплатный
12. КЭШИРУЙ повторяющиеся части промптов (💾 кэш токены дешевле)
```

---

## 🌐 Полезные ссылки

| Ресурс | URL |
|--------|-----|
| Dashboard & API Keys | https://enter.pollinations.ai |
| API Docs (OpenAPI 3.1) | https://enter.pollinations.ai/api/docs |
| GitHub репозиторий | https://github.com/pollinations/pollinations |
| Pollen FAQ | https://github.com/pollinations/pollinations/blob/master/enter.pollinations.ai/POLLEN_FAQ.md |
| Список всех моделей | https://enter.pollinations.ai/#models |
| Discord сообщество | https://discord.gg/pollinations |
| Статус системы | https://enter.pollinations.ai/health |
| Старые Legacy Docs | https://raw.githubusercontent.com/pollinations/pollinations/master/APIDOCS.md |
