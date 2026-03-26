

## Plan: Realistic Signature Generator + New Features

### Problem
The current signature generator just renders text in different cursive fonts — it's not a real signature. Real signatures (like Shakespeare's, or any CEO's) have: flowing connected strokes, varying pressure/thickness, artistic flourishes, tilted baseline, and unique character deformations.

### Solution: Canvas Path-Based Signature Engine

Completely rewrite `signatureGenerator.ts` to draw signatures using **Canvas 2D path drawing** instead of `fillText()`. Each letter gets converted into a series of bezier curves with:

- **Variable stroke width** (pen pressure simulation via multiple overlapping strokes)
- **Connected letters** with natural ligatures (strokes flow from one letter into the next)
- **Baseline tilt** — signatures rarely sit on a straight line
- **Flourishes** — decorative loops at the start/end of the signature
- **Speed variation** — some parts drawn fast (thin), some slow (thick)
- **Artistic distortion** — letters are compressed, stretched, or partially omitted (like real signatures where people skip letters)

#### 8 Signature Styles:
1. **Деловая (Business)** — clean, slightly tilted, with a confident underline stroke
2. **Президентская (Presidential)** — large first letter, flowing body, elaborate flourish
3. **Каллиграфическая (Calligraphic)** — ornate, every letter visible, ink-pressure variation
4. **Быстрая (Quick)** — messy, only first 2-3 letters readable, rest is a wavy line
5. **Королевская (Royal)** — decorative initial + condensed name + ornamental tail
6. **Арабская (Arabic-inspired)** — flowing right-to-left aesthetic with dot decorations
7. **Минималистичная (Minimalist)** — initials only with a single decisive stroke
8. **Артистическая (Artistic)** — exaggerated loops, dramatic pressure changes

#### Technical approach:
- Build a **letter-to-bezier-path map** for Latin/Cyrillic characters in a handwritten style
- Each style applies different **transforms**: scale, rotation, pressure curve, connection style
- Use `ctx.quadraticCurveTo()` and `ctx.bezierCurveTo()` for smooth strokes
- Simulate pen pressure by drawing each stroke segment multiple times with varying `lineWidth`
- Add deterministic randomness seeded by the name (same name = same signature every time)
- Flourishes are pre-defined path templates that get scaled to fit

### New Features to Add

#### 1. Name DNA Card (ДНК Имени)
A single beautiful card combining ALL data about a name:
- Meaning, origin, numerology number, compatible names, pronunciation
- Visual "DNA strand" graphic built from the name's letter frequencies
- Shareable as PNG — social media ready

#### 2. Name Sound Wave (Звуковая волна)
Visualize the phonetic structure of any name as a waveform:
- Vowels = peaks, consonants = valleys, stress = amplitude
- Beautiful canvas-drawn waveform unique to each name
- Compare two names visually side-by-side

#### 3. Name Timeline (Хронология имени)
Show when a name was most popular historically:
- Simple timeline visualization using Canvas
- Mark key historical figures who had this name
- Show which centuries/regions the name dominated

### Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/signatureGenerator.ts` | **Rewrite** — bezier path engine with 8 styles |
| `src/pages/NameSignature.tsx` | **Rewrite** — better UI, style previews, animation |
| `src/lib/nameDNA.ts` | **Create** — DNA card generation logic |
| `src/pages/NameDNA.tsx` | **Create** — DNA card page |
| `src/App.tsx` | **Edit** — add new routes |
| `src/components/Header.tsx` | **Edit** — add navigation items |
| `src/pages/Index.tsx` | **Edit** — add new feature cards |

### Technical Details

**Bezier signature rendering:**
```text
Letter "M" as bezier path:
  moveTo(x, baseline)
  ┌─╲    ╱─╲    ╱─┐
  │  ╲  ╱   ╲  ╱  │   ← quadraticCurveTo for peaks
  │   ╲╱     ╲╱   │
  └───────────────┘

Pen pressure simulation:
  for each path segment:
    draw 3 overlapping strokes:
      lineWidth: 0.5 (outer, light opacity)
      lineWidth: 1.5 (middle)  
      lineWidth: 0.8 (inner, full opacity)
    → creates natural ink-like thickness variation

Connection between letters:
  endPoint of letter[i] → startPoint of letter[i+1]
  connected via bezierCurveTo with control points
  that create a natural hand-movement arc
```

**Deterministic randomness:**
```text
seed = hashCode(name + styleId)
→ same input always produces identical output
→ but each name looks unique and organic
```

