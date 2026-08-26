#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт автоматического AI-обогащения таджикских имён:
«Феҳристи номҳои миллӣ 2026».
Поддерживает бесплатные AI-провайдеры (Pollinations AI, Groq, Gemini)
и может запускаться автономно или по расписанию (cron).

Использование:
  python3 scripts/enrich_tajik_names_ai.py --limit 20
  python3 scripts/enrich_tajik_names_ai.py --provider gemini --limit 100
  python3 scripts/enrich_tajik_names_ai.py --cron
"""

import os
import sys
import json
import time
import urllib.request
import urllib.parse
import urllib.error
import argparse

DATA_JSON_PATH = 'src/data/tajikRegistryData.json'
CSV_PATH_1 = 'Фехристи номхои милли 20.01.2026.csv'
CSV_PATH_2 = 'data/tajik_national_names.csv'

def load_env():
    env = {}
    if os.path.exists('.env'):
        with open('.env') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    env[k.strip()] = v.strip().strip('"\'')
    return env

def query_pollinations_ai(name_tj: str, gender: str) -> dict:
    """Бесплатный запрос к Pollinations AI для определения значения таджикского имени."""
    gender_str = "духтарона / женское" if gender == "female" else "писарона / мужское"
    prompt = (
        f"Таджикское национальное имя: «{name_tj}» ({gender_str}).\n"
        f"Дай краткое и точное значение этого имени на таджикском и русском языках, происхождение (Тоҷикӣ/Форсӣ/Арабӣ) "
        f"и 3-4 ключевых атрибута личности.\n"
        f"Ответь строго в формате валидного JSON без разметки markdown:\n"
        f'{{"meaning": "значение на русском и таджикском", "origin": "Тоҷикӣ / Форсӣ", "attributes": ["мудрость", "красота", "благородство"]}}'
    )
    
    url = f"https://text.pollinations.ai/{urllib.parse.quote(prompt)}?json=true&model=openai"
    req = urllib.request.Request(url, headers={'User-Agent': 'NameNavigator/1.0'})
    
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            content = resp.read().decode('utf-8').strip()
            # Clean possible markdown wrapping
            if content.startswith('```'):
                content = re.sub(r'^```(?:json)?\n', '', content)
                content = re.sub(r'\n```$', '', content)
            return json.loads(content)
    except Exception as e:
        print(f"Error querying Pollinations for {name_tj}: {e}")
        return None

def query_groq_ai(name_tj: str, gender: str, api_key: str) -> dict:
    """Запрос к Groq API (Llama-3)."""
    gender_str = "духтарона / женское" if gender == "female" else "писарона / мужское"
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {
                "role": "system",
                "content": "Ты эксперт по таджикской ономастике, филологии и востоковедению. Отвечай строго в формате JSON."
            },
            {
                "role": "user",
                "content": f"Определи значение таджикского имени «{name_tj}» ({gender_str}). Формат: {{\"meaning\": \"...\", \"origin\": \"Тоҷикӣ / Форсӣ\", \"attributes\": [\"...\"]}}"
            }
        ],
        "temperature": 0.3,
        "response_format": {"type": "json_object"}
    }
    
    req = urllib.request.Request(
        "https://api.groq.com/openai/v1/chat/completions",
        data=json.dumps(payload).encode('utf-8'),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    )
    
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return json.loads(data['choices'][0]['message']['content'])
    except Exception as e:
        print(f"Error querying Groq for {name_tj}: {e}")
        return None

def main():
    parser = argparse.ArgumentParser(description="Enrich Tajik Registry Names via AI")
    parser.add_argument("--limit", type=int, default=10, help="Number of un-enriched names to process")
    parser.add_argument("--provider", choices=["poll", "groq", "gemini"], default="poll", help="AI Provider")
    parser.add_argument("--cron", action="store_true", help="Run in cron mode with batch of 20")
    args = parser.parse_args()

    env = load_env()
    limit = 20 if args.cron else args.limit

    if not os.path.exists(DATA_JSON_PATH):
        print(f"File {DATA_JSON_PATH} not found.")
        sys.exit(1)

    with open(DATA_JSON_PATH, 'r', encoding='utf-8') as f:
        records = json.load(f)

    pending = [r for r in records if not r.get('is_enriched') or not r.get('meaning')]
    print(f"Total names: {len(records)}, pending enrichment: {len(pending)}")

    if not pending:
        print("All names are already enriched!")
        return

    batch = pending[:limit]
    print(f"Processing batch of {len(batch)} names using provider [{args.provider}]...")

    enriched_count = 0
    for idx, item in enumerate(batch):
        print(f"[{idx+1}/{len(batch)}] Enriching «{item['name_tj']}» ({item['gender_tj']})...")
        
        result = None
        if args.provider == 'groq' and env.get('GROQ_API_KEY'):
            result = query_groq_ai(item['name_tj'], item['gender'], env['GROQ_API_KEY'])
        else:
            result = query_pollinations_ai(item['name_tj'], item['gender'])

        if result and result.get('meaning'):
            item['meaning'] = result.get('meaning', '')
            item['origin'] = result.get('origin', 'Тоҷикӣ / Форсӣ')
            if result.get('attributes') and isinstance(result['attributes'], list):
                item['attributes'] = list(set(item.get('attributes', []) + result['attributes']))
            item['is_enriched'] = True
            item['history'] = 'Официальное имя из Феҳристи номҳои миллии Ҷумҳурии Тоҷикистон (Қарори №98).'
            enriched_count += 1
            print(f"  ✓ Значение: {item['meaning'][:60]}...")
        else:
            print(f"  ✗ Не удалось обогатить {item['name_tj']}")

        time.sleep(1.2) # Rate limit safety

    # Save back
    with open(DATA_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
    print(f"\nSaved updated dataset with {enriched_count} newly enriched records to {DATA_JSON_PATH}.")

if __name__ == '__main__':
    main()
