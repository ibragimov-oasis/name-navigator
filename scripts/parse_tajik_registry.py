#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Парсер официального реестра национальных таджикских имён:
«Феҳристи номҳои миллӣ 20.01.2026.docx» (Қарори Ҳукумати ҶТ №98 аз 26.02.2026).
Извлекает все имена, нормализует регистр, связывает с существующей базой,
генерирует CSV файлы и TypeScript модули.
"""

import zipfile
import xml.etree.ElementTree as ET
import csv
import json
import os
import re
import glob

ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

DOCX_PATH = '/Users/ibragimov/obsidian/Projects/GitHub/name-navigator/Фехристи номхои милли 20.01.2026.docx'
ROOT_CSV_PATH = '/Users/ibragimov/obsidian/Projects/GitHub/name-navigator/Фехристи номхои милли 20.01.2026.csv'
DATA_CSV_PATH = '/Users/ibragimov/obsidian/Projects/GitHub/name-navigator/data/tajik_national_names.csv'
SRC_DATA_TS = '/Users/ibragimov/obsidian/Projects/GitHub/name-navigator/src/data/tajikRegistryData.json'

def to_title_case_tj(text: str) -> str:
    """Преобразует таджикский текст в Title Case с учётом апострофов и дефисов."""
    if not text:
        return ""
    text = text.strip()
    
    parts = re.split(r'([\s\-])', text)
    result = []
    for part in parts:
        if not part or part in [' ', '-']:
            result.append(part)
            continue
        
        part_lower = part.lower()
        if len(part_lower) == 1:
            result.append(part_lower.upper())
        else:
            result.append(part_lower[0].upper() + part_lower[1:])
    return ''.join(result)

def make_slug(name_latin: str, name_tj: str, gender: str, index: int) -> str:
    """Генерирует уникальный slug ID."""
    clean = re.sub(r'[^a-zA-Z0-9]', '', name_latin.lower())
    if not clean:
        clean = re.sub(r'[^a-zA-Z0-9]', '', name_tj.lower())
    prefix = 'tj_f' if gender == 'female' else 'tj_m'
    return f"{prefix}_{clean}_{index}" if clean else f"{prefix}_{index}"

def canonical_key(s: str) -> str:
    """Канонический ключ для нечёткого сравнения имён между таджикской, русской и арабской орфографией."""
    if not s:
        return ""
    s = s.lower().strip()
    # Убираем все апострофы и мягкие/твёрдые знаки
    s = re.sub(r'[\'\"’ʻ`ъь\s\-]', '', s)
    
    # Таджикские буквы в русские эквиваленты
    s = s.replace('ҳ', 'х').replace('ҷ', 'дж').replace('ӯ', 'у').replace('ғ', 'г').replace('қ', 'к').replace('ӣ', 'и')
    
    # Редукция гласных для поиска вариантов (например Фатима / Фотима, Лейла / Лайло, Хадиджа / Хадича)
    # Заменяем о на а на конце и в корнях
    s = s.replace('дж', 'ж')
    s = s.replace('д', 'т').replace('з', 'с').replace('б', 'п').replace('г', 'к')
    s = s.replace('о', 'а').replace('е', 'и').replace('э', 'и').replace('я', 'а').replace('ю', 'у')
    
    # Сжатие двойных согласных (Мухаммад -> Мухамад)
    s = re.sub(r'(.)\1+', r'\1', s)
    return s

def load_existing_system_names():
    """Загружает существующие имена из src/data/names/**/*.ts для кросс-матчинга."""
    existing_exact = {}
    existing_canonical = {}
    
    # 1. Поиск по TS файлам
    ts_files = glob.glob('src/data/names/**/*.ts', recursive=True)
    for f in ts_files:
        if 'index.ts' in f or '_registry' in f:
            continue
        try:
            with open(f, 'r', encoding='utf-8') as fp:
                content = fp.read()
                pattern = re.compile(r'\{\s*id:\s*["\']([^"\']+)["\'],\s*name:\s*["\']([^"\']+)["\'](.*?)\}', re.DOTALL)
                for m in pattern.finditer(content):
                    name_id = m.group(1)
                    name_display = m.group(2)
                    body = m.group(3)
                    
                    meaning_m = re.search(r'meaning:\s*["\']([^"\']+)["\']', body)
                    origin_m = re.search(r'origin:\s*["\']([^"\']+)["\']', body)
                    culture_m = re.search(r'culture:\s*["\']([^"\']+)["\']', body)
                    history_m = re.search(r'history:\s*["\']([^"\']+)["\']', body)
                    attrs_m = re.search(r'attributes:\s*\[(.*?)\]', body)
                    
                    attributes = []
                    if attrs_m:
                        attributes = [x.strip(' "\'') for x in attrs_m.group(1).split(',') if x.strip(' "\'')]
                    
                    data = {
                        'id': name_id,
                        'name': name_display,
                        'meaning': meaning_m.group(1) if meaning_m else '',
                        'origin': origin_m.group(1) if origin_m else '',
                        'culture': culture_m.group(1) if culture_m else '',
                        'history': history_m.group(1) if history_m else '',
                        'attributes': attributes
                    }
                    existing_exact[name_display.strip().lower()] = data
                    existing_exact[name_id.strip().lower()] = data
                    c_key = canonical_key(name_display)
                    if c_key and c_key not in existing_canonical:
                        existing_canonical[c_key] = data
        except Exception as e:
            print(f"Warning reading {f}: {e}")

    # 2. data/names.json
    if os.path.exists('data/names.json'):
        try:
            with open('data/names.json', 'r', encoding='utf-8') as fp:
                json_data = json.load(fp)
                if isinstance(json_data, list):
                    for item in json_data:
                        if 'name' in item:
                            n_key = item['name'].strip().lower()
                            data = {
                                'id': item.get('id', ''),
                                'name': item['name'],
                                'meaning': item.get('meaning', ''),
                                'origin': item.get('origin', ''),
                                'culture': item.get('culture', ''),
                                'history': item.get('history', ''),
                                'attributes': item.get('attributes', [])
                            }
                            if n_key not in existing_exact:
                                existing_exact[n_key] = data
                            c_key = canonical_key(item['name'])
                            if c_key and c_key not in existing_canonical:
                                existing_canonical[c_key] = data
        except Exception as e:
            print(f"Warning reading data/names.json: {e}")
            
    print(f"Loaded {len(existing_exact)} exact records, {len(existing_canonical)} canonical patterns.")
    return existing_exact, existing_canonical

def match_existing_data(name_tj: str, name_cyrillic: str, name_latin: str, existing_exact: dict, existing_canonical: dict):
    """Сопоставляет таджикское имя с существующей базой по точному и каноническому соответствию."""
    # 1. Прямой поиск
    keys_to_try = [
        name_tj.lower(),
        name_cyrillic.lower(),
        name_latin.lower(),
    ]
    
    # 2. Базовые таджикские замены
    tj_normalized = (name_tj.lower()
                     .replace('ҳ', 'х')
                     .replace('ҷ', 'дж')
                     .replace('ӯ', 'у')
                     .replace('ғ', 'г')
                     .replace('қ', 'к')
                     .replace('ӣ', 'и')
                     .replace('ъ', ''))
    keys_to_try.append(tj_normalized)
    
    tj_normalized2 = (name_tj.lower()
                      .replace('ҳ', 'х')
                      .replace('ҷ', 'ж')
                      .replace('ӯ', 'у')
                      .replace('ғ', 'г')
                      .replace('қ', 'к')
                      .replace('ӣ', 'и')
                      .replace('ъ', ''))
    keys_to_try.append(tj_normalized2)

    for k in keys_to_try:
        if k in existing_exact:
            return existing_exact[k]
            
    # 3. Канонический поиск (Фотима -> Фатима, Хадича -> Хадиджа, Оиша -> Аиша и т.д.)
    c_tj = canonical_key(name_tj)
    if c_tj in existing_canonical:
        return existing_canonical[c_tj]
        
    c_cyr = canonical_key(name_cyrillic)
    if c_cyr in existing_canonical:
        return existing_canonical[c_cyr]
        
    return None

def parse_docx():
    print(f"Reading docx from {DOCX_PATH}...")
    with zipfile.ZipFile(DOCX_PATH) as docx:
        tree = ET.fromstring(docx.read('word/document.xml'))
        tables = tree.findall('.//w:tbl', ns)

    existing_exact, existing_canonical = load_existing_system_names()

    all_records = []
    
    table_configs = [
        (tables[0], 'female', 'духтарона'),
        (tables[1], 'male', 'писарона')
    ]

    matched_count = 0

    for t_idx, (table, gender, gender_tj) in enumerate(table_configs):
        rows = table.findall('.//w:tr', ns)
        current_letter = ''
        gender_num = 0
        
        for r_idx, row in enumerate(rows):
            cells = row.findall('.//w:tc', ns)
            row_text = [' '.join(''.join(c.itertext()).split()) for c in cells]
            non_empty = [c for c in row_text if c]
            
            if not non_empty or 'НОМҲОИ' in ''.join(non_empty) or 'Тоҷикӣ' in non_empty or 'Овонавишти' in ''.join(non_empty):
                continue
            
            if len(non_empty) == 1 and len(non_empty[0]) <= 3:
                current_letter = non_empty[0].strip()
                continue
            
            raw_num = row_text[0] if len(row_text) > 0 else ''
            raw_name_tj = row_text[1] if len(row_text) > 1 else ''
            raw_name_cyrillic = row_text[2] if len(row_text) > 2 else ''
            raw_name_latin = row_text[3] if len(row_text) > 3 else ''
            
            if not raw_name_tj:
                for c in non_empty:
                    if len(c) > 1:
                        raw_name_tj = c
                        break
            
            if not raw_name_tj:
                continue
                
            gender_num += 1
            raw_name_tj = raw_name_tj.strip()
            raw_name_cyrillic = (raw_name_cyrillic.strip() if raw_name_cyrillic else raw_name_tj)
            raw_name_latin = raw_name_latin.strip()
            
            letter = current_letter if current_letter else raw_name_tj[0].upper()
            
            name_display_tj = to_title_case_tj(raw_name_tj)
            name_display_cyrillic = to_title_case_tj(raw_name_cyrillic)
            name_display_latin = to_title_case_tj(raw_name_latin)
            
            slug = make_slug(raw_name_latin, raw_name_tj, gender, gender_num)
            
            matched = match_existing_data(name_display_tj, name_display_cyrillic, name_display_latin, existing_exact, existing_canonical)
            is_enriched = False
            meaning = ""
            origin = "Тоҷикӣ / Форсӣ"
            attributes = []
            history = ""
            matched_id = ""

            if matched:
                matched_count += 1
                is_enriched = True
                matched_id = matched.get('id', '')
                meaning = matched.get('meaning', '')
                origin = matched.get('origin', 'Тоҷикӣ / Форсӣ')
                attributes = matched.get('attributes', [])
                history = matched.get('history', '')

            record = {
                'id': slug,
                'num': gender_num,
                'name_tj': name_display_tj,
                'name_tj_raw': raw_name_tj,
                'name_cyrillic': name_display_cyrillic,
                'name_cyrillic_raw': raw_name_cyrillic,
                'name_latin': name_display_latin,
                'name_latin_raw': raw_name_latin,
                'gender': gender,
                'gender_label': 'Женский' if gender == 'female' else 'Мужской',
                'gender_tj': 'Духтарона' if gender == 'female' else 'Писарона',
                'letter': letter,
                'is_official_permitted': True,
                'legal_decree': 'Қарори Ҳукумати Ҷумҳурии Тоҷикистон аз 26 феврали соли 2026, №98',
                'is_enriched': is_enriched,
                'matched_child_name_id': matched_id,
                'meaning': meaning,
                'origin': origin,
                'attributes': attributes,
                'history': history,
            }
            all_records.append(record)

    print(f"Total parsed records: {len(all_records)}")
    print(f"Female count: {len([r for r in all_records if r['gender'] == 'female'])}")
    print(f"Male count: {len([r for r in all_records if r['gender'] == 'male'])}")
    print(f"Cross-matched with existing rich records: {matched_count}")

    csv_fieldnames = [
        'id', 'num', 'gender', 'gender_label', 'gender_tj', 'letter',
        'name_tj', 'name_cyrillic', 'name_latin',
        'name_tj_raw', 'name_cyrillic_raw', 'name_latin_raw',
        'is_official_permitted', 'legal_decree', 'is_enriched',
        'matched_child_name_id', 'meaning', 'origin', 'attributes', 'history'
    ]

    for path in [ROOT_CSV_PATH, DATA_CSV_PATH]:
        os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
        with open(path, 'w', encoding='utf-8-sig', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=csv_fieldnames)
            writer.writeheader()
            for r in all_records:
                row_copy = dict(r)
                row_copy['attributes'] = '; '.join(row_copy['attributes']) if isinstance(row_copy['attributes'], list) else ''
                writer.writerow(row_copy)
        print(f"Saved CSV to {path} ({os.path.getsize(path)} bytes)")

    with open(SRC_DATA_TS, 'w', encoding='utf-8') as f:
        json.dump(all_records, f, ensure_ascii=False, indent=2)
    print(f"Saved Frontend Data to {SRC_DATA_TS} ({os.path.getsize(SRC_DATA_TS)} bytes)")

    return all_records

if __name__ == '__main__':
    parse_docx()
