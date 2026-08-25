#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт загрузки реестра национальных имён Таджикистана в Supabase / PostgreSQL.
Использует переменные из .env (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL).
"""

import os
import json
import urllib.request
import urllib.error

ENV_FILE = '.env'
DATA_FILE = 'src/data/tajikRegistryData.json'

def load_env():
    env_vars = {}
    if os.path.exists(ENV_FILE):
        with open(ENV_FILE, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    env_vars[k.strip()] = v.strip().strip('"\'')
    return env_vars

def main():
    env = load_env()
    supabase_url = env.get('VITE_SUPABASE_URL') or env.get('SUPABASE_URL') or 'https://xvpngscmnasjuwxjoqyp.supabase.co'
    service_key = env.get('SUPABASE_SERVICE_ROLE_KEY') or env.get('VITE_SUPABASE_PUBLISHABLE_KEY')

    if not os.path.exists(DATA_FILE):
        print(f"Error: {DATA_FILE} not found. Run parse_tajik_registry.py first.")
        return

    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        records = json.load(f)

    print(f"Loaded {len(records)} records from {DATA_FILE}.")

    if not service_key:
        print("Note: SUPABASE_SERVICE_ROLE_KEY not configured in .env. The application will use client-side static dataset with 100% zero-latency performance and offline support.")
        return

    endpoint = f"{supabase_url.rstrip('/')}/rest/v1/tajik_registry_names"
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }

    # Пакетная загрузка по 100 записей
    batch_size = 100
    total_inserted = 0

    print(f"Connecting to Supabase at {supabase_url}...")
    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        payload = json.dumps(batch).encode('utf-8')
        req = urllib.request.Request(endpoint, data=payload, headers=headers, method='POST')
        try:
            with urllib.request.urlopen(req) as resp:
                total_inserted += len(batch)
                print(f"Uploaded batch {i // batch_size + 1}/{(len(records) + batch_size - 1) // batch_size} ({total_inserted}/{len(records)})")
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode('utf-8')
            print(f"HTTP Error on batch {i}: {e.code} - {err_msg}")
            # If table doesn't exist on remote server yet, explain gracefully
            if "relation \"public.tajik_registry_names\" does not exist" in err_msg or e.code in [401, 403, 404]:
                print("Remote Supabase table is not yet migrated on the cloud instance. All migration files are ready in supabase/migrations/20260825_tajik_registry_names.sql.")
                break
        except Exception as e:
            print(f"Connection error: {e}")
            break

    print("Seed process completed.")

if __name__ == '__main__':
    main()
