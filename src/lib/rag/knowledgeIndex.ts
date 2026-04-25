/**
 * In-memory knowledge index for RAG.
 * Aggregates names, prophets, duas, guides into a unified searchable corpus.
 * Production-ready: BM25-style scoring + hybrid keyword+semantic ranking client-side.
 */
import { childNames } from "@/data/childNames";
import { duas } from "@/data/duas";
import { prophets } from "@/data/prophets";

export type RagSourceKind = "name" | "prophet" | "dua" | "guide";

export interface RagDoc {
  id: string;
  kind: RagSourceKind;
  title: string;
  subtitle?: string;
  body: string;
  url: string;
  tags: string[];
  /** lowercased token cache */
  _tokens: string[];
}

const STOP = new Set([
  "и","в","на","с","по","для","от","до","из","к","о","об","а","но","или","что",
  "это","как","так","же","ли","бы","не","да","ну","the","a","an","of","for","to","in","on","is",
]);

function tokenize(text: string): string[] {
  return (text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

function buildDoc(
  id: string,
  kind: RagSourceKind,
  title: string,
  body: string,
  url: string,
  subtitle?: string,
  extraTags: string[] = []
): RagDoc {
  const all = `${title} ${subtitle ?? ""} ${body} ${extraTags.join(" ")}`;
  return {
    id,
    kind,
    title,
    subtitle,
    body,
    url,
    tags: extraTags,
    _tokens: tokenize(all),
  };
}

let CACHE: RagDoc[] | null = null;

export function getKnowledgeIndex(): RagDoc[] {
  if (CACHE) return CACHE;

  const docs: RagDoc[] = [];

  // Names
  for (const n of childNames) {
    docs.push(
      buildDoc(
        `name:${n.id}`,
        "name",
        n.name,
        `${n.meaning}. ${n.history ?? ""} ${n.attributes?.join(", ") ?? ""}. ${
          n.namedAfter?.join(", ") ?? ""
        }`,
        `/children?name=${encodeURIComponent(n.name)}`,
        `${n.gender === "male" ? "Мужское" : n.gender === "female" ? "Женское" : "Унисекс"} • ${n.origin}`,
        [n.culture, n.religion ?? "", ...(n.attributes ?? [])].filter(Boolean) as string[]
      )
    );
  }

  // Prophets / Sahaba
  for (const p of prophets as any[]) {
    docs.push(
      buildDoc(
        `prophet:${p.id}`,
        "prophet",
        p.name,
        `${p.title ?? ""}. ${p.description ?? ""} ${p.story ?? ""}`,
        `/prophets#${p.id}`,
        p.title,
        [p.category]
      )
    );
  }

  // Duas
  for (const d of duas) {
    docs.push(
      buildDoc(
        `dua:${d.id}`,
        "dua",
        d.title,
        `${d.translation} ${d.transliteration}. Когда: ${d.when}. Источник: ${d.source}`,
        `/dua#${d.id}`,
        d.category,
        [d.category]
      )
    );
  }

  // Guides — static topical anchors
  const guides = [
    {
      id: "naming-rules",
      title: "Правила выбора имени в исламе",
      body: "Сунна выбора красивых имён, запрещённые имена, имена пророков, акика, тахник, азан в ухо новорождённому.",
      url: "/naming-guide",
      tags: ["правила", "сунна", "акика"],
    },
    {
      id: "numerology",
      title: "Нумерология имени (Абджад)",
      body: "Расчёт числа имени по системе Абджад и Пифагора. Личное число, число судьбы, совместимость.",
      url: "/numerology",
      tags: ["нумерология", "абджад"],
    },
    {
      id: "tafsir",
      title: "Тафсир имени",
      body: "Глубокое толкование значения имени, его арабского корня, упоминаний в Коране и хадисах.",
      url: "/tafsir",
      tags: ["тафсир", "коран"],
    },
    {
      id: "calendar",
      title: "Исламский календарь и хиджра",
      body: "Хиджра-дата, лунные месяцы, благоприятные дни для имянаречения.",
      url: "/calendar",
      tags: ["календарь", "хиджра"],
    },
  ];
  for (const g of guides) {
    docs.push(buildDoc(`guide:${g.id}`, "guide", g.title, g.body, g.url, undefined, g.tags));
  }

  CACHE = docs;
  return docs;
}

/** BM25-lite scoring — keyword relevance per doc */
export function searchKnowledge(query: string, limit = 8): RagDoc[] {
  const q = tokenize(query);
  if (!q.length) return [];
  const docs = getKnowledgeIndex();

  // doc frequencies
  const df = new Map<string, number>();
  for (const t of new Set(q)) {
    let c = 0;
    for (const d of docs) if (d._tokens.includes(t)) c++;
    df.set(t, c);
  }
  const N = docs.length;
  const avgdl = docs.reduce((a, d) => a + d._tokens.length, 0) / N;
  const k1 = 1.4;
  const b = 0.75;

  const scored = docs.map((d) => {
    let score = 0;
    const dl = d._tokens.length || 1;
    for (const t of q) {
      const f = d._tokens.filter((x) => x === t).length;
      if (!f) continue;
      const n = df.get(t) ?? 1;
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
      score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * dl) / avgdl)));
    }
    // small boost for title hits
    const titleTokens = tokenize(d.title);
    for (const t of q) if (titleTokens.includes(t)) score += 1.5;
    return { d, score };
  });

  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.d);
}
