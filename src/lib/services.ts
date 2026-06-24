import type { IConfigCatClient } from "configcat-js";
import { getClient, PollingMode } from "configcat-js";

// ── Zyte ──────────────────────────────────────────────────────────────────────

const ZYTE_API_URL = "https://api.zyte.com/v1/extract";

interface ZyteOptions {
  browserHtml?: boolean;
  screenshot?: boolean;
  geolocation?: string;
  httpResponseBody?: boolean;
  httpResponseHeaders?: boolean;
  javascript?: boolean;
  productList?: boolean;
  product?: boolean;
  article?: boolean;
  [key: string]: unknown;
}

interface ZyteResponse {
  url: string;
  browserHtml?: string;
  httpResponseBody?: string;
  [key: string]: unknown;
}

export async function zyteExtract(url: string, options: ZyteOptions = {}): Promise<ZyteResponse> {
  const apiKey = import.meta.env.ZYTE_API_KEY ?? "";
  const body = { url, browserHtml: true, javascript: true, ...options };

  const response = await fetch(ZYTE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Zyte API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ── ConfigCat ─────────────────────────────────────────────────────────────────

let _client1: IConfigCatClient | null = null;
let _client2: IConfigCatClient | null = null;

function getConfigCatClient(sdkKey: string, cache: { val: IConfigCatClient | null }): IConfigCatClient | null {
  if (!sdkKey) return null;
  if (!cache.val) {
    cache.val = getClient(sdkKey, PollingMode.AutoPoll, { pollIntervalSeconds: 60 });
  }
  return cache.val;
}

export function configCatClient(secondary = false): IConfigCatClient | null {
  const key = secondary
    ? (import.meta.env.VITE_CONFIGCAT_SDK_KEY_2 ?? "")
    : (import.meta.env.VITE_CONFIGCAT_SDK_KEY ?? "");
  const cache = secondary ? { val: _client2 } : { val: _client1 };
  const client = getConfigCatClient(key, cache);
  if (secondary) _client2 = cache.val;
  else _client1 = cache.val;
  return client;
}

export async function getFeatureFlag(key: string, defaultValue = false, secondary = false): Promise<boolean> {
  const client = configCatClient(secondary);
  if (!client) return defaultValue;
  return client.getValueAsync(key, defaultValue);
}

export async function getStringFlag(key: string, defaultValue = "", secondary = false): Promise<string> {
  const client = configCatClient(secondary);
  if (!client) return defaultValue;
  return client.getValueAsync(key, defaultValue);
}
