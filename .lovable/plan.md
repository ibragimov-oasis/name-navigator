## Plan: Islamic Calendar Auto-Detection + New Features Roadmap

### Part 1: Islamic Calendar — Auto-Detection of Current Date

**Problem:** The calendar page always starts on Muharram 1. It should auto-detect today's Islamic (Hijri) date and show the current month/day with names for today.

**Solution:** Use the Hijri calendar conversion algorithm (Kuwaiti algorithm / Umm al-Qura approximation) to convert `new Date()` to the current Islamic month and day. No external API needed — pure math.

**Implementation:**

1. **Create `src/lib/hijriDate.ts**` — a utility with `gregorianToHijri(date: Date)` returning `{ year, month, day }`. Uses the well-known astronomical approximation algorithm (no npm package needed, ~40 lines of JS).
2. **Update `NameCalendar.tsx`:**
  - On mount, calculate today's Hijri date and set `selectedIslamicMonth` to it
  - Show a banner at the top: "Сегодня: 25 Шавваль 1447 г.х." with names for today highlighted
  - Add a mini-calendar grid (30 days) where user can click any day to see names
  - Highlight today's day in the grid
  - For Gregorian mode, auto-select the current Gregorian month too

---

### Part 2: Signature Generator (Подпись)

**Problem:** User wants a feature where each name gets a beautiful calligraphic signature, cached in DB to save AI tokens.

**Solution without AI:** Use Canvas API + custom cursive font rendering to generate stylized signatures purely on the frontend. This covers 90% of cases for free.  
User Note: use only free API methods. 

**Implementation:**

1. **Create Supabase table `name_signatures`:**
  - `id` (uuid), `name` (text), `style` (text), `image_url` (text), `svg_data` (text), `created_at`
  - RLS: public read, authenticated write
2. **Create `src/lib/signatureGenerator.ts`:**
  - Uses HTML Canvas with cursive fonts (Google Fonts: "Dancing Script", "Great Vibes", "Pacifico") to render signatures
  - Multiple styles: classic, modern, arabic-calligraphy, minimalist
  - Returns base64 PNG or SVG path
3. **Create `src/pages/NameSignature.tsx`:**
  - User selects a name from DB or types custom name
  - Shows 4-6 signature styles generated on Canvas (no AI, no tokens)
  - "Generate unique" button uses Supabase Edge Function + Lovable AI (image generation) for premium signatures
  - All generated signatures cached in `name_signatures` table
  - Users see cached signatures first, can generate new ones
4. **Edge Function `generate-signature`:**
  - Checks DB cache first
  - If no cache, calls Lovable AI image generation (already available as `LOVABLE_API_KEY` secret)
  - Saves result to DB + Supabase Storage bucket
  - Note: Lovable AI Gateway is disabled, so the AI-powered generation will use Canvas-only approach unless user enables it

**Important:** Since Lovable AI Gateway is disabled, the primary approach will be Canvas-based (no AI tokens needed). The AI generation option will be shown as "coming soon" or enabled when user activates the gateway.

---

### Part 3: Feature Roadmap — Ideas to Make the Site AAAA+ Level

**Without AI (pure logic):**

1. **Name Numerology (Нумерология имени)** — Calculate the numerological number of any name using letter-to-number mapping (Abjad for Arabic, Pythagorean for Cyrillic). Show personality traits, lucky numbers, compatibility scores. Pure math, very popular in Islamic and Eastern cultures.
2. **Name Compatibility Calculator (Совместимость имён)** — Input two names (e.g., husband + wife, siblings) and calculate phonetic + numerological + cultural compatibility. Show a percentage score with detailed breakdown. No AI needed.
3. **Name Statistics Dashboard** — Interactive charts: most popular names by decade, by region, trending names, gender distribution. Uses recharts library with the existing data.
4. **Name Origin Map (Карта происхождения)** — Interactive world map showing where each name originates. Click a country to see names from that region. Uses a simple SVG map component.
5. **Family Tree Builder (Семейное древо)** — Users can build a family tree, add names for each member. The system suggests names for new children based on existing family names (avoiding similar sounds, ensuring harmony).
6. **Name Pronunciation Audio** — Use Web Speech API (free, built into browsers) to pronounce names in different languages. No API tokens needed.
7. **PDF Certificate Generator** — Generate a beautiful "Name Certificate" PDF with the name's meaning, origin, numerology, and signature. Users can print/share it. Uses jsPDF library.
8. **Share & Social Features** — Generate shareable cards (OG images) for any name. "I chose the name X" cards for social media.

**With AI (if enabled later):**

9. **AI Name Story Generator** — Generate a short poetic story about the meaning of a name
10. **AI Calligraphy** — Generate Arabic calligraphy for Islamic names

---

### Implementation Priority (what gets built now):


| Step | Task                                  | Complexity |
| ---- | ------------------------------------- | ---------- |
| 1    | Hijri date auto-detection in Calendar | Medium     |
| 2    | Canvas-based Signature Generator page | Medium     |
| 3    | Name Numerology page                  | Medium     |
| 4    | Supabase table for signature caching  | Low        |
| 5    | Add routes and navigation             | Low        |


### Technical Details

**Hijri conversion algorithm** — The Kuwaiti algorithm converts Gregorian to Hijri with ~1 day accuracy. For exact dates, the Umm al-Qura calendar data can be embedded (a lookup table of ~100 years, ~2KB). This is the same approach used by major Islamic apps.

**Canvas signature rendering:**

```text
┌─────────────────────────────┐
│  Name: Muhammad              │
│  ┌─────────────────────┐    │
│  │  [Dancing Script]    │    │  Style 1: Classic
│  │  Muhammad            │    │
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │  [Great Vibes]       │    │  Style 2: Elegant
│  │  Muhammad            │    │
│  └─────────────────────┘    │
│  [Download PNG] [Share]      │
└─────────────────────────────┘
```

ABOUT USING AI - see this path data in repository and look at files name x_API_INFO.md, there is gemini, groq, and pollination apis info. like which models is available for me and their limits and info how to refer to them and use them.    
**Supabase migration needed:**

- `name_signatures` table for caching generated signatures