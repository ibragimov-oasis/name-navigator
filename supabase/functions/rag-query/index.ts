// RAG answer generator using Lovable AI Gateway.
// Receives query + retrieved context chunks, returns streamed grounded answer.
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

interface ContextChunk {
  id: string;
  kind: string;
  title: string;
  body: string;
  url: string;
}

interface RequestBody {
  query: string;
  context: ContextChunk[];
}

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { query, context } = (await req.json()) as RequestBody;

    if (!query || typeof query !== "string" || query.length > 500) {
      return new Response(JSON.stringify({ error: "Invalid query" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const safeContext = Array.isArray(context) ? context.slice(0, 8) : [];

    const contextText = safeContext
      .map(
        (c, i) =>
          `[${i + 1}] (${c.kind}) ${c.title}\n${c.body.slice(0, 800)}\nИсточник: ${c.url}`
      )
      .join("\n\n");

    const systemPrompt = `Ты — эксперт-помощник по мусульманским именам, исламской традиции имянаречения, пророкам и дуа.
Отвечай на русском языке, кратко (2-5 предложений), ТОЛЬКО на основе предоставленных источников.
Если в источниках нет ответа — честно скажи: "В базе пока нет точного ответа" и предложи похожие темы.
В конце добавь ссылки на источники в формате [1], [2] и т.д.
Тон: тёплый, уважительный, без воды.`;

    const userPrompt = `Вопрос пользователя: "${query}"

Источники из базы знаний:
${contextText || "(нет релевантных источников)"}

Сформируй краткий грамотный ответ.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Слишком много запросов, попробуйте через минуту." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Кредиты AI исчерпаны. Пополните баланс в Lovable Cloud." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(JSON.stringify({ error: "AI gateway error", details: errText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(aiResponse.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("rag-query error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
