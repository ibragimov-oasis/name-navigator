// Direct Google Gemini API edge function.
// Routes all "Gemini AI" calls through here, keeps GEMINI_API_KEY server-side.
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

interface Body {
  prompt: string;
  system?: string;
  model?: "gemini-2.5-flash" | "gemini-2.5-pro" | "gemini-2.5-flash-lite";
  temperature?: number;
  json?: boolean;
  stream?: boolean;
  history?: { role: "user" | "model"; text: string }[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Body;
    const prompt = (body.prompt ?? "").toString().trim();
    if (!prompt || prompt.length > 4000) {
      return new Response(JSON.stringify({ error: "Invalid prompt (1..4000 chars)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const model = body.model ?? "gemini-2.5-flash";
    const temperature = typeof body.temperature === "number" ? body.temperature : 0.7;
    const wantStream = body.stream === true;

    type GeminiPart = { text: string };
    type GeminiContent = { role: "user" | "model"; parts: GeminiPart[] };
    type GeminiPayload = {
      contents: GeminiContent[];
      generationConfig: {
        temperature: number;
        maxOutputTokens: number;
        responseMimeType?: string;
      };
      systemInstruction?: { role: string; parts: GeminiPart[] };
    };

    const contents: GeminiContent[] = [];
    if (Array.isArray(body.history)) {
      for (const h of body.history.slice(-12)) {
        if (!h?.text) continue;
        contents.push({ role: h.role === "model" ? "model" : "user", parts: [{ text: String(h.text).slice(0, 4000) }] });
      }
    }
    contents.push({ role: "user", parts: [{ text: prompt }] });

    const payload: GeminiPayload = {
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens: 1024,
        ...(body.json ? { responseMimeType: "application/json" } : {}),
      },
    };
    if (body.system) {
      payload.systemInstruction = { role: "system", parts: [{ text: body.system }] };
    }

    const action = wantStream ? "streamGenerateContent?alt=sse&" : "generateContent?";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:${action}key=${GEMINI_API_KEY}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("gemini error", res.status, errText);
      const status = res.status === 429 ? 429 : res.status === 403 ? 402 : 500;
      const msg =
        status === 429
          ? "Слишком много запросов к Gemini, попробуйте через минуту."
          : status === 402
          ? "Ключ Gemini отклонён или квота исчерпана."
          : "Gemini API error";
      return new Response(JSON.stringify({ error: msg, details: errText.slice(0, 500) }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (wantStream) {
      return new Response(res.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });
    }

    const json = await res.json();
    const answer =
      json?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p?.text ?? "").join("") ?? "";
    return new Response(JSON.stringify({ answer, model }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("gemini-chat error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
