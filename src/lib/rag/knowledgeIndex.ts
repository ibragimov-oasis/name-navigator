/**
 * In-memory knowledge index for RAG.
 * Aggregates names, prophets, duas, guides into a unified searchable corpus.
 * Production-ready: BM25-style scoring + hybrid keyword+semantic ranking client-side.
 */
import { childNames } from "@/data/childNames";
import { duas } from "@/data/duas";
import { prophets } from "@/data/prophets";
import { historicalFigures } from "@/data/historicalFigures";
import { revertGuides, nameImpressions } from "@/data/peopleKnowledge";

export type RagSourceKind =
  | "name"
  | "prophet"
  | "dua"
  | "guide"
  | "revert-guide"
  | "historical-figure"
  | "name-impression";

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
  for (const p of prophets) {
    const derived = p.derivedNames?.map((d) => `${d.name} — ${d.meaning}`).join("; ") ?? "";
    docs.push(
      buildDoc(
        `prophet:${p.id}`,
        "prophet",
        `${p.nameRu} (${p.nameAr})`,
        `${p.title}. ${p.story}. Производные имена: ${derived}`,
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

  // Revert guides — для новообращённых
  for (const g of revertGuides) {
    docs.push(buildDoc(`revert:${g.id}`, "revert-guide", g.title, g.body, g.url, "Гайд для новообращённого", g.tags));
  }

  // Historical figures — реальные люди
  for (const h of historicalFigures) {
    docs.push(
      buildDoc(
        `hist:${h.id}`,
        "historical-figure",
        h.fullName ? `${h.name} (${h.fullName})` : h.name,
        `${h.bio} Эпоха: ${h.era}. Регион: ${h.region}. Известен(а) как: ${h.knownFor.join(", ")}. Годы: ${h.years}.`,
        `/people/historical#${h.id}`,
        `${h.field} · ${h.region}`,
        [h.field, h.era, h.region, ...h.knownFor]
      )
    );
  }

  // Name impressions — психология восприятия
  for (const im of nameImpressions) {
    docs.push(
      buildDoc(
        `impr:${im.id}`,
        "name-impression",
        im.title,
        im.body,
        "/people/adult",
        "Восприятие имени",
        im.tags
      )
    );
  }

  CACHE = docs;
  return docs;
}

export interface RagSearchHit {
  doc: RagDoc;
  score: number;
  /** Why this matched: matched query tokens, matched tags/attributes, matched kind */
  reasons: {
    matchedTokens: string[];     // tokens from the query found in the doc
    matchedTags: string[];        // attribute/tag chips that match the query or active filter
    titleHit: boolean;
    snippet: string;              // body snippet around first match
  };
}

export interface RagSearchOptions {
  limit?: number;
  /** Restrict to specific kinds (e.g. only "name") */
  kinds?: RagSourceKind[];
  /** Required tags (intersection) — usually attributes like "красивое", "сильное" */
  tags?: string[];
}

/** Synonyms / semantic expansions for attribute filters (Russian → tag tokens) */
const ATTR_SYNONYMS: Record<string, string[]> = {
  "красивое": ["красив", "прекрасн", "изящн"],
  "высокое": ["высок", "благородн", "возвышен"],
  "справедливое": ["справедлив", "правдив", "честн"],
  "весёлое": ["весёл", "весел", "радостн", "счастлив"],
  "сильное": ["сильн", "могуч", "храбр"],
  "мудрое": ["мудр", "учён", "знающ"],
  "светлое": ["свет", "сияющ", "лучезарн"],
  "благородное": ["благородн", "великодушн"],
};

function buildSnippet(body: string, tokens: string[], len = 140): string {
  if (!body) return "";
  const lower = body.toLowerCase();
  let pos = -1;
  for (const t of tokens) {
    const i = lower.indexOf(t);
    if (i >= 0 && (pos < 0 || i < pos)) pos = i;
  }
  if (pos < 0) return body.slice(0, len) + (body.length > len ? "…" : "");
  const start = Math.max(0, pos - 40);
  const end = Math.min(body.length, start + len);
  return (start > 0 ? "…" : "") + body.slice(start, end) + (end < body.length ? "…" : "");
}

/** BM25-lite scoring — keyword relevance per doc, with reasons + filters */
export function searchKnowledge(
  query: string,
  limitOrOpts: number | RagSearchOptions = 8
): RagDoc[] {
  const opts: RagSearchOptions =
    typeof limitOrOpts === "number" ? { limit: limitOrOpts } : limitOrOpts;
  return searchKnowledgeDetailed(query, opts).map((h) => h.doc);
}

export function searchKnowledgeDetailed(
  query: string,
  opts: RagSearchOptions = {}
): RagSearchHit[] {
  const { limit = 8, kinds, tags } = opts;
  const q = tokenize(query);

  // Expand query with attribute synonyms when user typed a known attribute word
  const expanded = new Set(q);
  for (const word of q) {
    for (const [key, syns] of Object.entries(ATTR_SYNONYMS)) {
      if (key.startsWith(word) || word.startsWith(key.slice(0, 4))) {
        syns.forEach((s) => expanded.add(s));
      }
    }
  }
  const qTokens = Array.from(expanded);

  let docs = getKnowledgeIndex();
  if (kinds?.length) docs = docs.filter((d) => kinds.includes(d.kind));
  if (tags?.length) {
    const lc = tags.map((t) => t.toLowerCase());
    docs = docs.filter((d) => {
      const dt = d.tags.map((t) => t.toLowerCase());
      return lc.every((t) => dt.includes(t));
    });
  }

  if (!qTokens.length && !tags?.length) return [];

  // doc frequencies (against filtered set)
  const df = new Map<string, number>();
  for (const t of new Set(qTokens)) {
    let c = 0;
    for (const d of docs) if (d._tokens.includes(t)) c++;
    df.set(t, c);
  }
  const N = Math.max(1, docs.length);
  const avgdl = docs.reduce((a, d) => a + d._tokens.length, 0) / N || 1;
  const k1 = 1.4;
  const b = 0.75;

  const scored: RagSearchHit[] = docs.map((d) => {
    let score = 0;
    const matchedTokens: string[] = [];
    const dl = d._tokens.length || 1;
    for (const t of qTokens) {
      const f = d._tokens.filter((x) => x === t).length;
      if (!f) continue;
      matchedTokens.push(t);
      const n = df.get(t) ?? 1;
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
      score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * dl) / avgdl)));
    }

    const titleTokens = tokenize(d.title);
    let titleHit = false;
    for (const t of qTokens) if (titleTokens.includes(t)) { score += 1.5; titleHit = true; }

    // tag matches (chips & active facets)
    const matchedTags: string[] = [];
    const dtagsLc = d.tags.map((t) => t.toLowerCase());
    for (const t of qTokens) {
      for (const tag of d.tags) {
        if (tag.toLowerCase().includes(t)) {
          if (!matchedTags.includes(tag)) matchedTags.push(tag);
          score += 0.6;
        }
      }
    }
    if (tags?.length) {
      for (const t of tags) {
        if (dtagsLc.includes(t.toLowerCase()) && !matchedTags.includes(t)) {
          matchedTags.push(t);
          score += 1.0; // facet match boost
        }
      }
      // baseline score so pure-facet results show up even without query
      if (!qTokens.length) score += 1;
    }

    return {
      doc: d,
      score,
      reasons: {
        matchedTokens: Array.from(new Set(matchedTokens)),
        matchedTags,
        titleHit,
        snippet: buildSnippet(d.body, [...matchedTokens, ...qTokens]),
      },
    };
  });

  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** Top facets (attribute chips) across the index, ordered by frequency */
export function getTopFacets(kinds?: RagSourceKind[], limit = 16): { tag: string; count: number }[] {
  let docs = getKnowledgeIndex();
  if (kinds?.length) docs = docs.filter((d) => kinds.includes(d.kind));
  const counts = new Map<string, number>();
  for (const d of docs) {
    for (const t of d.tags) {
      const k = t.trim();
      if (!k || k.length < 3) continue;
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
}
