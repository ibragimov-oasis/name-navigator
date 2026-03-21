for m in client.models.list():
    print(m.name, " | ", m.display_name)
models/gemini-2.5-flash  |  Gemini 2.5 Flash
models/gemini-2.5-pro  |  Gemini 2.5 Pro
models/gemini-2.0-flash  |  Gemini 2.0 Flash
models/gemini-2.0-flash-001  |  Gemini 2.0 Flash 001
models/gemini-2.0-flash-exp-image-generation  |  Gemini 2.0 Flash (Image Generation) Experimental
models/gemini-2.0-flash-lite-001  |  Gemini 2.0 Flash-Lite 001
models/gemini-2.0-flash-lite  |  Gemini 2.0 Flash-Lite
models/gemini-2.5-flash-preview-tts  |  Gemini 2.5 Flash Preview TTS
models/gemini-2.5-pro-preview-tts  |  Gemini 2.5 Pro Preview TTS
models/gemma-3-1b-it  |  Gemma 3 1B
models/gemma-3-4b-it  |  Gemma 3 4B
models/gemma-3-12b-it  |  Gemma 3 12B
models/gemma-3-27b-it  |  Gemma 3 27B
models/gemma-3n-e4b-it  |  Gemma 3n E4B
models/gemma-3n-e2b-it  |  Gemma 3n E2B
models/gemini-flash-latest  |  Gemini Flash Latest
models/gemini-flash-lite-latest  |  Gemini Flash-Lite Latest
models/gemini-pro-latest  |  Gemini Pro Latest
models/gemini-2.5-flash-lite  |  Gemini 2.5 Flash-Lite
models/gemini-2.5-flash-image  |  Nano Banana
models/gemini-2.5-flash-lite-preview-09-2025  |  Gemini 2.5 Flash-Lite Preview Sep 2025
models/gemini-3-pro-preview  |  Gemini 3 Pro Preview
models/gemini-3-flash-preview  |  Gemini 3 Flash Preview
models/gemini-3.1-pro-preview  |  Gemini 3.1 Pro Preview
models/gemini-3.1-pro-preview-customtools  |  Gemini 3.1 Pro Preview Custom Tools
models/gemini-3-pro-image-preview  |  Nano Banana Pro
models/nano-banana-pro-preview  |  Nano Banana Pro
models/gemini-robotics-er-1.5-preview  |  Gemini Robotics-ER 1.5 Preview
models/gemini-2.5-computer-use-preview-10-2025  |  Gemini 2.5 Computer Use Preview 10-2025
models/deep-research-pro-preview-12-2025  |  Deep Research Pro Preview (Dec-12-2025)
models/gemini-embedding-001  |  Gemini Embedding 001
models/aqa  |  Model that performs Attributed Question Answering.
models/imagen-4.0-generate-001  |  Imagen 4
models/imagen-4.0-ultra-generate-001  |  Imagen 4 Ultra
models/imagen-4.0-fast-generate-001  |  Imagen 4 Fast
models/veo-2.0-generate-001  |  Veo 2
models/veo-3.0-generate-001  |  Veo 3
models/veo-3.0-fast-generate-001  |  Veo 3 fast
models/veo-3.1-generate-preview  |  Veo 3.1
models/veo-3.1-fast-generate-preview  |  Veo 3.1 fast
models/gemini-2.5-flash-native-audio-latest  |  Gemini 2.5 Flash Native Audio Latest
models/gemini-2.5-flash-native-audio-preview-09-2025  |  Gemini 2.5 Flash Native Audio Preview 09-2025
models/gemini-2.5-flash-native-audio-preview-12-2025  |  Gemini 2.5 Flash Native Audio Preview 12-2025

print("Модели с generateContent:\n")for m in client.models.list():    if "generateContent" in m.supported_actions:        print(m.name, " | ", m.display_name)print("\nМодели с embedContent:\n")for m in client.models.list():    if "embedContent" in m.supported_actions:        print(m.name, " | ", m.display_name)

 Модели с generateContent:

models/gemini-2.5-flash  |  Gemini 2.5 Flash
models/gemini-2.5-pro  |  Gemini 2.5 Pro
models/gemini-2.0-flash  |  Gemini 2.0 Flash
models/gemini-2.0-flash-001  |  Gemini 2.0 Flash 001
models/gemini-2.0-flash-exp-image-generation  |  Gemini 2.0 Flash (Image Generation) Experimental
models/gemini-2.0-flash-lite-001  |  Gemini 2.0 Flash-Lite 001
models/gemini-2.0-flash-lite  |  Gemini 2.0 Flash-Lite
models/gemini-2.5-flash-preview-tts  |  Gemini 2.5 Flash Preview TTS
models/gemini-2.5-pro-preview-tts  |  Gemini 2.5 Pro Preview TTS
models/gemma-3-1b-it  |  Gemma 3 1B
models/gemma-3-4b-it  |  Gemma 3 4B
models/gemma-3-12b-it  |  Gemma 3 12B
models/gemma-3-27b-it  |  Gemma 3 27B
models/gemma-3n-e4b-it  |  Gemma 3n E4B
models/gemma-3n-e2b-it  |  Gemma 3n E2B
models/gemini-flash-latest  |  Gemini Flash Latest
models/gemini-flash-lite-latest  |  Gemini Flash-Lite Latest
models/gemini-pro-latest  |  Gemini Pro Latest
models/gemini-2.5-flash-lite  |  Gemini 2.5 Flash-Lite
models/gemini-2.5-flash-image  |  Nano Banana
models/gemini-2.5-flash-lite-preview-09-2025  |  Gemini 2.5 Flash-Lite Preview Sep 2025
models/gemini-3-pro-preview  |  Gemini 3 Pro Preview
models/gemini-3-flash-preview  |  Gemini 3 Flash Preview
models/gemini-3.1-pro-preview  |  Gemini 3.1 Pro Preview
models/gemini-3.1-pro-preview-customtools  |  Gemini 3.1 Pro Preview Custom Tools
models/gemini-3-pro-image-preview  |  Nano Banana Pro
models/nano-banana-pro-preview  |  Nano Banana Pro
models/gemini-robotics-er-1.5-preview  |  Gemini Robotics-ER 1.5 Preview
models/gemini-2.5-computer-use-preview-10-2025  |  Gemini 2.5 Computer Use Preview 10-2025
models/deep-research-pro-preview-12-2025  |  Deep Research Pro Preview (Dec-12-2025)

Модели с embedContent:

models/gemini-embedding-001  |  Gemini Embedding 001

Загружаем список моделей через Gemini API (v1beta)...

Найдено моделей: 43

=== ОСНОВНЫЕ МОДЕЛИ (Gemini 2.x, Flash, Image, и т.п.) ===

==========================================================================================
ID модели:       models/gemini-2.5-flash
Отображаемое имя: Gemini 2.5 Flash
Описание:         Stable version of Gemini 2.5 Flash, our mid-size multimodal model that supports up to 1 million tokens, released in June of 2025.
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  1048576
Лимит токенов на выход: 65536

Поддерживаемые действия/методы:
  - generateContent
  - countTokens
  - createCachedContent
  - batchGenerateContent

Рекомендуемое использование:
  Пример вызова (текст/мультимодал):

  POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_API_KEY

  Body:
  {
    "contents": [
      {
        "parts": [{ "text": "Привет! Расскажи про это блюдо." }]
      }
    ]
  }

==========================================================================================
ID модели:       models/gemini-2.5-pro
Отображаемое имя: Gemini 2.5 Pro
Описание:         Stable release (June 17th, 2025) of Gemini 2.5 Pro
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  1048576
Лимит токенов на выход: 65536

Поддерживаемые действия/методы:
  - generateContent
  - countTokens
  - createCachedContent
  - batchGenerateContent

Рекомендуемое использование:
  Пример вызова (текст/мультимодал):

  POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=YOUR_API_KEY

  Body:
  {
    "contents": [
      {
        "parts": [{ "text": "Привет! Расскажи про это блюдо." }]
      }
    ]
  }

==========================================================================================
ID модели:       models/gemini-2.0-flash
Отображаемое имя: Gemini 2.0 Flash
Описание:         Gemini 2.0 Flash
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  1048576
Лимит токенов на выход: 8192

Поддерживаемые действия/методы:
  - generateContent
  - countTokens
  - createCachedContent
  - batchGenerateContent

Рекомендуемое использование:
  Пример вызова (текст/мультимодал):

  POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY

  Body:
  {
    "contents": [
      {
        "parts": [{ "text": "Привет! Расскажи про это блюдо." }]
      }
    ]
  }

==========================================================================================
ID модели:       models/gemini-2.0-flash-001
Отображаемое имя: Gemini 2.0 Flash 001
Описание:         Stable version of Gemini 2.0 Flash, our fast and versatile multimodal model for scaling across diverse tasks, released in January of 2025.
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  1048576
Лимит токенов на выход: 8192

Поддерживаемые действия/методы:
  - generateContent
  - countTokens
  - createCachedContent
  - batchGenerateContent

Рекомендуемое использование:
  Пример вызова (текст/мультимодал):

  POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=YOUR_API_KEY

  Body:
  {
    "contents": [
      {
        "parts": [{ "text": "Привет! Расскажи про это блюдо." }]
      }
    ]
  }

==========================================================================================
ID модели:       models/gemini-2.0-flash-exp-image-generation
Отображаемое имя: Gemini 2.0 Flash (Image Generation) Experimental
Описание:         Gemini 2.0 Flash (Image Generation) Experimental
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  1048576
Лимит токенов на выход: 8192

Поддерживаемые действия/методы:
  - generateContent
  - countTokens
  - bidiGenerateContent

Рекомендуемое использование:
  Пример вызова (текст/мультимодал):

  POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=YOUR_API_KEY

  Body:
  {
    "contents": [
      {
        "parts": [{ "text": "Привет! Расскажи про это блюдо." }]
      }
    ]
  }

==========================================================================================
ID модели:       models/gemini-2.0-flash-lite-001
Отображаемое имя: Gemini 2.0 Flash-Lite 001
Описание:         Stable version of Gemini 2.0 Flash-Lite
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  1048576
Лимит токенов на выход: 8192

Поддерживаемые действия/методы:
  - generateContent
  - countTokens
  - createCachedContent
  - batchGenerateContent

Рекомендуемое использование:
  Пример вызова (текст/мультимодал):

  POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite-001:generateContent?key=YOUR_API_KEY

  Body:
  {
    "contents": [
      {
        "parts": [{ "text": "Привет! Расскажи про это блюдо." }]
      }
    ]
  }

==========================================================================================
ID модели:       models/gemini-2.0-flash-lite
Отображаемое имя: Gemini 2.0 Flash-Lite
Описание:         Gemini 2.0 Flash-Lite
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  1048576
Лимит токенов на выход: 8192

Поддерживаемые действия/методы:
  - generateContent
  - countTokens
  - createCachedContent
  - batchGenerateContent

Рекомендуемое использование:
  Пример вызова (текст/мультимодал):

  POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=YOUR_API_KEY

  Body:
  {
    "contents": [
      {
        "parts": [{ "text": "Привет! Расскажи про это блюдо." }]
      }
    ]
  }

==========================================================================================
ID модели:       models/gemini-2.5-flash-preview-tts
Отображаемое имя: Gemini 2.5 Flash Preview TTS
Описание:         Gemini 2.5 Flash Preview TTS
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  8192
Лимит токенов на выход: 16384

Поддерживаемые действия/методы:
  - countTokens
  - generateContent

Рекомендуемое использование:
  Пример вызова (текст/мультимодал):

  POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=YOUR_API_KEY

  Body:
  {
    "contents": [
      {
        "parts": [{ "text": "Привет! Расскажи про это блюдо." }]
      }
    ]
  }

==========================================================================================
ID модели:       models/gemini-2.5-pro-preview-tts
Отображаемое имя: Gemini 2.5 Pro Preview TTS
Описание:         Gemini 2.5 Pro Preview TTS
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  8192
Лимит токенов на выход: 16384

Поддерживаемые действия/методы:
  - countTokens
  - generateContent
  - batchGenerateContent

Рекомендуемое использование:
  Пример вызова (текст/мультимодал):

  POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-tts:generateContent?key=YOUR_API_KEY

  Body:
  {
    "contents": [
      {
        "parts": [{ "text": "Привет! Расскажи про это блюдо." }]
      }
    ]
  }

==========================================================================================
ID модели:       models/gemini-flash-latest
Отображаемое имя: Gemini Flash Latest
Описание:         Latest release of Gemini Flash
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  1048576
Лимит токенов на выход: 65536

Поддерживаемые действия/методы:
  - generateContent
  - countTokens
  - createCachedContent
  - batchGenerateContent

Рекомендуемое использование:
  Пример вызова (текст/мультимодал):

  POST https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=YOUR_API_KEY

  Body:
  {
    "contents": [
      {
        "parts": [{ "text": "Привет! Расскажи про это блюдо." }]
      }
    ]
  }

==========================================================================================
ID модели:       models/gemini-flash-lite-latest
Отображаемое имя: Gemini Flash-Lite Latest
Описание:         Latest release of Gemini Flash-Lite
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  1048576
Лимит токенов на выход: 65536

Поддерживаемые действия/методы:
  - generateContent
  - countTokens
  - createCachedContent
  - batchGenerateContent

Рекомендуемое использование:
  Пример вызова (текст/мультимодал):

  POST https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=YOUR_API_KEY

  Body:
  {
    "contents": [
      {
        "parts": [{ "text": "Привет! Расскажи про это блюдо." }]
      }
    ]
  }

==========================================================================================
ID модели:       models/gemini-pro-latest
Отображаемое имя: Gemini Pro Latest
Описание:         Latest release of Gemini Pro
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  1048576
Лимит токенов на выход: 65536

Поддерживаемые действия/методы:
  - generateContent
  - countTokens
  - createCachedContent
  - batchGenerateContent

Рекомендуемое использование:
  Пример вызова (текст/мультимодал):

  POST https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=YOUR_API_KEY

  Body:
  {
    "contents": [
      {
        "parts": [{ "text": "Привет! Расскажи про это блюдо." }]
      }
    ]
  }

==========================================================================================
ID модели:       models/gemini-2.5-flash-lite
Отображаемое имя: Gemini 2.5 Flash-Lite
Описание:         Stable version of Gemini 2.5 Flash-Lite, released in July of 2025
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  1048576
Лимит токенов на выход: 65536

Поддерживаемые действия/методы:
  - generateContent
  - countTokens
  - createCachedContent
  - batchGenerateContent

Рекомендуемое использование:
  Пример вызова (текст/мультимодал):

  POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=YOUR_API_KEY

  Body:
  {
    "contents": [
      {
        "parts": [{ "text": "Привет! Расскажи про это блюдо." }]
      }
    ]
  }

==========================================================================================
ID модели:       models/gemini-2.5-flash-image
Отображаемое имя: Nano Banana
Описание:         Gemini 2.5 Flash Preview Image
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  32768
Лимит токенов на выход: 32768

Поддерживаемые действия/методы:
  - generateContent
  - countTokens
  - batchGenerateContent

Рекомендуемое использование:
  Пример вызова (текст/мультимодал):

  POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=YOUR_API_KEY

  Body:
  {
    "contents": [
      {
        "parts": [{ "text": "Привет! Расскажи про это блюдо." }]
      }
    ]
  }

==========================================================================================
ID модели:       models/gemini-2.5-flash-lite-preview-09-2025
Отображаемое имя: Gemini 2.5 Flash-Lite Preview Sep 2025
Описание:         Preview release (Septempber 25th, 2025) of Gemini 2.5 Flash-Lite
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  1048576
Лимит токенов на выход: 65536

Поддерживаемые действия/методы:
  - generateContent
  - countTokens
  - createCachedContent
  - batchGenerateContent

Рекомендуемое использование:
  Пример вызова (текст/мультимодал):

  POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite-preview-09-2025:generateContent?key=YOUR_API_KEY

  Body:
  {
    "contents": [
      {
        "parts": [{ "text": "Привет! Расскажи про это блюдо." }]
      }
    ]
  }

==========================================================================================
ID модели:       models/gemini-3-pro-preview
Отображаемое имя: Gemini 3 Pro Preview
Описание:         Gemini 3 Pro Preview
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  1048576
Лимит токенов на выход: 65536

Поддерживаемые действия/методы:
  - generateContent
  - countTokens
  - createCachedContent
  - batchGenerateContent

Рекомендуемое использование:
  Пример вызова (текст/мультимодал):

  POST https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=YOUR_API_KEY

  Body:
  {
    "contents": [
      {
        "parts": [{ "text": "Привет! Расскажи про это блюдо." }]
      }
    ]
  }

==========================================================================================
ID модели:       models/gemini-3-flash-preview
Отображаемое имя: Gemini 3 Flash Preview
Описание:         Gemini 3 Flash Preview
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  1048576
Лимит токенов на выход: 65536

Поддерживаемые действия/методы:
  - generateContent
  - countTokens
  - createCachedContent
  - batchGenerateContent

Рекомендуемое использование:
  Пример вызова (текст/мультимодал):

  POST https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=YOUR_API_KEY

  Body:
  {
    "contents": [
      {
        "parts": [{ "text": "Привет! Расскажи про это блюдо." }]
      }
    ]
  }

==========================================================================================
ID модели:       models/gemini-3.1-pro-preview
Отображаемое имя: Gemini 3.1 Pro Preview
Описание:         Gemini 3.1 Pro Preview
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  1048576
Лимит токенов на выход: 65536

Поддерживаемые действия/методы:
  - generateContent
  - countTokens
  - createCachedContent
  - batchGenerateContent

Рекомендуемое использование:
  Пример вызова (текст/мультимодал):

  POST https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=YOUR_API_KEY

  Body:
  {
    "contents": [
      {
        "parts": [{ "text": "Привет! Расскажи про это блюдо." }]
      }
    ]
  }

==========================================================================================
ID модели:       models/gemini-3.1-pro-preview-customtools
Отображаемое имя: Gemini 3.1 Pro Preview Custom Tools
Описание:         Gemini 3.1 Pro Preview optimized for custom tool usage
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  1048576
Лимит токенов на выход: 65536

Поддерживаемые действия/методы:
  - generateContent
  - countTokens
  - createCachedContent
  - batchGenerateContent

Рекомендуемое использование:
  Пример вызова (текст/мультимодал):

  POST https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview-customtools:generateContent?key=YOUR_API_KEY

  Body:
  {
    "contents": [
      {
        "parts": [{ "text": "Привет! Расскажи про это блюдо." }]
      }
    ]
  }

==========================================================================================
ID модели:       models/gemini-3-pro-image-preview
Отображаемое имя: Nano Banana Pro
Описание:         Gemini 3 Pro Image Preview
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  131072
Лимит токенов на выход: 32768

Поддерживаемые действия/методы:
  - generateContent
  - countTokens
  - batchGenerateContent

Рекомендуемое использование:
  Пример вызова (текст/мультимодал):

  POST https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=YOUR_API_KEY

  Body:
  {
    "contents": [
      {
        "parts": [{ "text": "Привет! Расскажи про это блюдо." }]
      }
    ]
  }

==========================================================================================
ID модели:       models/gemini-robotics-er-1.5-preview
Отображаемое имя: Gemini Robotics-ER 1.5 Preview
Описание:         Gemini Robotics-ER 1.5 Preview
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  1048576
Лимит токенов на выход: 65536

Поддерживаемые действия/методы:
  - generateContent
  - countTokens

Рекомендуемое использование:
  Пример вызова (текст/мультимодал):

  POST https://generativelanguage.googleapis.com/v1beta/models/gemini-robotics-er-1.5-preview:generateContent?key=YOUR_API_KEY

  Body:
  {
    "contents": [
      {
        "parts": [{ "text": "Привет! Расскажи про это блюдо." }]
      }
    ]
  }

==========================================================================================
ID модели:       models/gemini-2.5-computer-use-preview-10-2025
Отображаемое имя: Gemini 2.5 Computer Use Preview 10-2025
Описание:         Gemini 2.5 Computer Use Preview 10-2025
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  131072
Лимит токенов на выход: 65536

Поддерживаемые действия/методы:
  - generateContent
  - countTokens

Рекомендуемое использование:
  Пример вызова (текст/мультимодал):

  POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-computer-use-preview-10-2025:generateContent?key=YOUR_API_KEY

  Body:
  {
    "contents": [
      {
        "parts": [{ "text": "Привет! Расскажи про это блюдо." }]
      }
    ]
  }

==========================================================================================
ID модели:       models/gemini-embedding-001
Отображаемое имя: Gemini Embedding 001
Описание:         Obtain a distributed representation of a text.
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  2048
Лимит токенов на выход: 1

Поддерживаемые действия/методы:
  - embedContent
  - countTextTokens
  - countTokens
  - asyncBatchEmbedContent

Рекомендуемое использование:
  Пример вызова для эмбеддингов:

  POST https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=YOUR_API_KEY

  Body:
  {
    "model": "models/gemini-embedding-001",
    "content": {
      "parts": [{ "text": "Текст, который надо превратить в эмбеддинг" }]
    }
  }

==========================================================================================
ID модели:       models/imagen-4.0-generate-001
Отображаемое имя: Imagen 4
Описание:         Vertex served Imagen 4.0 model
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  480
Лимит токенов на выход: 8192

Поддерживаемые действия/методы:
  - predict

Рекомендуемое использование:
  Специальная модель. См. документацию к Gemini API для точного способа вызова.

==========================================================================================
ID модели:       models/imagen-4.0-ultra-generate-001
Отображаемое имя: Imagen 4 Ultra
Описание:         Vertex served Imagen 4.0 ultra model
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  480
Лимит токенов на выход: 8192

Поддерживаемые действия/методы:
  - predict

Рекомендуемое использование:
  Специальная модель. См. документацию к Gemini API для точного способа вызова.

==========================================================================================
ID модели:       models/imagen-4.0-fast-generate-001
Отображаемое имя: Imagen 4 Fast
Описание:         Vertex served Imagen 4.0 Fast model
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  480
Лимит токенов на выход: 8192

Поддерживаемые действия/методы:
  - predict

Рекомендуемое использование:
  Специальная модель. См. документацию к Gemini API для точного способа вызова.

==========================================================================================
ID модели:       models/gemini-2.5-flash-native-audio-latest
Отображаемое имя: Gemini 2.5 Flash Native Audio Latest
Описание:         Latest release of Gemini 2.5 Flash Native Audio
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  131072
Лимит токенов на выход: 8192

Поддерживаемые действия/методы:
  - countTokens
  - bidiGenerateContent

Рекомендуемое использование:
  Специальная модель. См. документацию к Gemini API для точного способа вызова.

==========================================================================================
ID модели:       models/gemini-2.5-flash-native-audio-preview-09-2025
Отображаемое имя: Gemini 2.5 Flash Native Audio Preview 09-2025
Описание:         Gemini 2.5 Flash Native Audio Preview 09-2025
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  131072
Лимит токенов на выход: 8192

Поддерживаемые действия/методы:
  - countTokens
  - bidiGenerateContent

Рекомендуемое использование:
  Специальная модель. См. документацию к Gemini API для точного способа вызова.

==========================================================================================
ID модели:       models/gemini-2.5-flash-native-audio-preview-12-2025
Отображаемое имя: Gemini 2.5 Flash Native Audio Preview 12-2025
Описание:         Gemini 2.5 Flash Native Audio Preview 12-2025
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  131072
Лимит токенов на выход: 8192

Поддерживаемые действия/методы:
  - countTokens
  - bidiGenerateContent

Рекомендуемое использование:
  Специальная модель. См. документацию к Gemini API для точного способа вызова.


=== ПРОЧИЕ МОДЕЛИ (эмбеддинги, вспомогательные и т.д.) ===

==========================================================================================
ID модели:       models/gemma-3-1b-it
Отображаемое имя: Gemma 3 1B
Описание:         None
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  32768
Лимит токенов на выход: 8192

Поддерживаемые действия/методы:
  - generateContent
  - countTokens

Рекомендуемое использование:
  Пример вызова (текст/мультимодал):

  POST https://generativelanguage.googleapis.com/v1beta/models/gemma-3-1b-it:generateContent?key=YOUR_API_KEY

  Body:
  {
    "contents": [
      {
        "parts": [{ "text": "Привет! Расскажи про это блюдо." }]
      }
    ]
  }

==========================================================================================
ID модели:       models/gemma-3-4b-it
Отображаемое имя: Gemma 3 4B
Описание:         None
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  32768
Лимит токенов на выход: 8192

Поддерживаемые действия/методы:
  - generateContent
  - countTokens

Рекомендуемое использование:
  Пример вызова (текст/мультимодал):

  POST https://generativelanguage.googleapis.com/v1beta/models/gemma-3-4b-it:generateContent?key=YOUR_API_KEY

  Body:
  {
    "contents": [
      {
        "parts": [{ "text": "Привет! Расскажи про это блюдо." }]
      }
    ]
  }

==========================================================================================
ID модели:       models/gemma-3-12b-it
Отображаемое имя: Gemma 3 12B
Описание:         None
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  32768
Лимит токенов на выход: 8192

Поддерживаемые действия/методы:
  - generateContent
  - countTokens

Рекомендуемое использование:
  Пример вызова (текст/мультимодал):

  POST https://generativelanguage.googleapis.com/v1beta/models/gemma-3-12b-it:generateContent?key=YOUR_API_KEY

  Body:
  {
    "contents": [
      {
        "parts": [{ "text": "Привет! Расскажи про это блюдо." }]
      }
    ]
  }

==========================================================================================
ID модели:       models/gemma-3-27b-it
Отображаемое имя: Gemma 3 27B
Описание:         None
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  131072
Лимит токенов на выход: 8192

Поддерживаемые действия/методы:
  - generateContent
  - countTokens

Рекомендуемое использование:
  Пример вызова (текст/мультимодал):

  POST https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=YOUR_API_KEY

  Body:
  {
    "contents": [
      {
        "parts": [{ "text": "Привет! Расскажи про это блюдо." }]
      }
    ]
  }

==========================================================================================
ID модели:       models/gemma-3n-e4b-it
Отображаемое имя: Gemma 3n E4B
Описание:         None
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  8192
Лимит токенов на выход: 2048

Поддерживаемые действия/методы:
  - generateContent
  - countTokens

Рекомендуемое использование:
  Пример вызова (текст/мультимодал):

  POST https://generativelanguage.googleapis.com/v1beta/models/gemma-3n-e4b-it:generateContent?key=YOUR_API_KEY

  Body:
  {
    "contents": [
      {
        "parts": [{ "text": "Привет! Расскажи про это блюдо." }]
      }
    ]
  }

==========================================================================================
ID модели:       models/gemma-3n-e2b-it
Отображаемое имя: Gemma 3n E2B
Описание:         None
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  8192
Лимит токенов на выход: 2048

Поддерживаемые действия/методы:
  - generateContent
  - countTokens

Рекомендуемое использование:
  Пример вызова (текст/мультимодал):

  POST https://generativelanguage.googleapis.com/v1beta/models/gemma-3n-e2b-it:generateContent?key=YOUR_API_KEY

  Body:
  {
    "contents": [
      {
        "parts": [{ "text": "Привет! Расскажи про это блюдо." }]
      }
    ]
  }

==========================================================================================
ID модели:       models/nano-banana-pro-preview
Отображаемое имя: Nano Banana Pro
Описание:         Gemini 3 Pro Image Preview
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  131072
Лимит токенов на выход: 32768

Поддерживаемые действия/методы:
  - generateContent
  - countTokens
  - batchGenerateContent

Рекомендуемое использование:
  Пример вызова (текст/мультимодал):

  POST https://generativelanguage.googleapis.com/v1beta/models/nano-banana-pro-preview:generateContent?key=YOUR_API_KEY

  Body:
  {
    "contents": [
      {
        "parts": [{ "text": "Привет! Расскажи про это блюдо." }]
      }
    ]
  }

==========================================================================================
ID модели:       models/deep-research-pro-preview-12-2025
Отображаемое имя: Deep Research Pro Preview (Dec-12-2025)
Описание:         Preview release (December 12th, 2025) of Deep Research Pro
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  131072
Лимит токенов на выход: 65536

Поддерживаемые действия/методы:
  - generateContent
  - countTokens

Рекомендуемое использование:
  Пример вызова (текст/мультимодал):

  POST https://generativelanguage.googleapis.com/v1beta/models/deep-research-pro-preview-12-2025:generateContent?key=YOUR_API_KEY

  Body:
  {
    "contents": [
      {
        "parts": [{ "text": "Привет! Расскажи про это блюдо." }]
      }
    ]
  }

==========================================================================================
ID модели:       models/aqa
Отображаемое имя: Model that performs Attributed Question Answering.
Описание:         Model trained to return answers to questions that are grounded in provided sources, along with estimating answerable probability.
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  7168
Лимит токенов на выход: 1024

Поддерживаемые действия/методы:
  - generateAnswer

Рекомендуемое использование:
  Специальная модель. См. документацию к Gemini API для точного способа вызова.

==========================================================================================
ID модели:       models/veo-2.0-generate-001
Отображаемое имя: Veo 2
Описание:         Vertex served Veo 2 model. Access to this model requires billing to be enabled on the associated Google Cloud Platform account. Please visit https://console.cloud.google.com/billing to enable it.
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  480
Лимит токенов на выход: 8192

Поддерживаемые действия/методы:
  - predictLongRunning

Рекомендуемое использование:
  Специальная модель. См. документацию к Gemini API для точного способа вызова.

==========================================================================================
ID модели:       models/veo-3.0-generate-001
Отображаемое имя: Veo 3
Описание:         Veo 3
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  480
Лимит токенов на выход: 8192

Поддерживаемые действия/методы:
  - predictLongRunning

Рекомендуемое использование:
  Специальная модель. См. документацию к Gemini API для точного способа вызова.

==========================================================================================
ID модели:       models/veo-3.0-fast-generate-001
Отображаемое имя: Veo 3 fast
Описание:         Veo 3 fast
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  480
Лимит токенов на выход: 8192

Поддерживаемые действия/методы:
  - predictLongRunning

Рекомендуемое использование:
  Специальная модель. См. документацию к Gemini API для точного способа вызова.

==========================================================================================
ID модели:       models/veo-3.1-generate-preview
Отображаемое имя: Veo 3.1
Описание:         Veo 3.1
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  480
Лимит токенов на выход: 8192

Поддерживаемые действия/методы:
  - predictLongRunning

Рекомендуемое использование:
  Специальная модель. См. документацию к Gemini API для точного способа вызова.

==========================================================================================
ID модели:       models/veo-3.1-fast-generate-preview
Отображаемое имя: Veo 3.1 fast
Описание:         Veo 3.1 fast
Тип:              
Версия API:       v1beta (этим скриптом)

Лимит токенов на вход:  480
Лимит токенов на выход: 8192

Поддерживаемые действия/методы:
  - predictLongRunning

Рекомендуемое использование:
  Специальная модель. См. документацию к Gemini API для точного способа вызова.

==========================================================================================
ИНФОРМАЦИЯ О ЛИМИТАХ (ВАЖНО)

Через Gemini API программно нельзя получить твои per-model rate limits (RPM/TPM/RPD).
Они видны только в консоли Google AI Studio.

Чтобы посмотреть реальные лимиты для КАЖДОЙ модели:

1) Открой в браузере:
   https://aistudio.google.com/app/apikey

2) Перейди во вкладку "Rate limits by model" (или "Лимиты по моделям").

3) Там будет таблица:
   - Model (например, gemini-2.5-flash)
   - RPM (requests per minute)
   - TPM (tokens per minute)
   - RPD (requests per day)

Эти значения ты и используешь при планировании нагрузки на сайт.

А вот и лимиты мои : 
Rate limits by model
info
Peak usage per model compared to its limit over the last hour
Model
Category
RPM
TPM
RPD
Charts
Gemini 2.5 Flash
Text-out models	
0 / 5
0 / 250K
0 / 20
Gemini 2.5 Pro
Text-out models	
0 / 0
0 / 0
0 / 0
Gemini 2 Flash
Text-out models	
0 / 0
0 / 0
0 / 0
Gemini 2 Flash Exp
Text-out models	
0 / 0
0 / 0
0 / 0
Gemini 2 Flash Lite
Text-out models	
0 / 0
0 / 0
0 / 0
Gemini 2 Pro Exp
Text-out models	
0 / 0
0 / 0
0 / 0
Gemini 2.5 Flash TTS
Multi-modal generative models	
0 / 3
0 / 10K
0 / 10
Gemini 2.5 Pro TTS
Multi-modal generative models	
0 / 0
0 / 0
0 / 0
Gemma 3 1B
Other models	
0 / 30
0 / 15K
0 / 14.4K
Gemma 3 4B
Other models	
0 / 30
0 / 15K
0 / 14.4K
Gemma 3 12B
Other models	
0 / 30
0 / 15K
0 / 14.4K
Gemma 3 27B
Other models	
0 / 30
0 / 15K
0 / 14.4K
Imagen 4 Generate
Multi-modal generative models	N/A	N/A	
0 / 25
Imagen 4 Ultra Generate
Multi-modal generative models	N/A	N/A	
0 / 25
Imagen 4 Fast Generate
Multi-modal generative models	N/A	N/A	
0 / 25
Gemma 3 2B
Other models	
0 / 30
0 / 15K
0 / 14.4K
Gemini Embedding 1
Other models	
0 / 100
0 / 30K
0 / 1K
Gemini 3 Flash
Text-out models	
0 / 5
0 / 250K
0 / 20
Gemini 2.5 Flash Lite
Text-out models	
0 / 10
0 / 250K
0 / 20
Gemini 3 Pro
Text-out models	
0 / 0
0 / 0
0 / 0
Nano Banana (Gemini 2.5 Flash Preview Image)
Multi-modal generative models	
0 / 0
0 / 0
0 / 0
Gemini 3.1 Pro
Text-out models	
0 / 0
0 / 0
0 / 0
Nano Banana Pro (Gemini 3 Pro Image)
Multi-modal generative models	
0 / 0
0 / 0
0 / 0
Veo 3 Generate
info
Multi-modal generative models	
0 / 0
N/A	
0 / 0
Veo 3 Fast Generate
info
Multi-modal generative models	
0 / 0
N/A	
0 / 0
Gemini Robotics ER 1.5 Preview
Other models	
0 / 10
0 / 250K
0 / 20
Computer Use Preview
Other models	
0 / 0
0 / 0
0 / 0
Deep Research Pro Preview
Agents	
0 / 0
0 / 0
0 / 0
Gemini 2.5 Flash Native Audio Dialog
Live API	
0 / Unlimited
0 / 1M
0 / Unlimited
