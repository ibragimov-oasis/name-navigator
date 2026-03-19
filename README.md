# Name Navigator — Linguistic Identity & Global Data Infrastructure 🧭

**Name Navigator** is a high-performance, mission-critical infrastructure platform designed for the management, normalization, and phonetic analysis of global anthroponymic data. Bridging the gap between ancient cultural heritage and modern machine learning classification, it provides a high-fidelity data layer for identity management, personalization, and cross-cultural linguistic research.

---

## 🏛 The Vision: Linguistic Sovereignty & Global Inclusivity

In the era of hyper-globalization, naming data is the primary anchor of digital identity. However, current systems are often culturally biased or technologically fragmented. **Name Navigator** solves this by providing a standardized, AI-ready framework for cultural data governance.

### The Core Challenges We Address:
- **Phonetic Deadlocks**: Traditional systems fail to analyze the harmonic transitions in multi-part names (First + Middle + Last), leading to poor UX in text-to-speech and AI assistants.
- **Cultural Erasure**: Digital systems often marginalize minority linguistic groups. We provide first-class support for **23+ distinct cultures**, including Bashkir, Tatar, and diverse Asian/Middle-Eastern naming conventions.
- **Data Fragmentation**: We consolidate unstructured linguistic data into a queryable, attribute-rich infrastructure layer.

---

## 🌍 Ecosystem Impact & Infrastructure Criticality

*This project serves as a foundational resource for the global developer and data science ecosystem.*

### 1. Unified Anthroponymic Infrastructure (AI Training Layer)
We maintain a rigorously structured database of **1,100+ names** and **760+ semantic attributes**. This corpus is essential for:
- **LLM Refinement**: Improving how Large Language Models handle non-Western phonemes and cultural contexts.
- **KYC & Identity Resolution**: Providing a semantic ground truth for mapping variant romanizations and transliterations across different languages.

### 2. Machine-to-Machine (M2M) & AI Readiness
Name Navigator is architected for **Agentic Workflows**. Our [AI_SUPABASE_MIGRATION_GUIDE.md](file:///Users/ibragimov/Desktop/GitHub/name-navigator/AI_SUPABASE_MIGRATION_GUIDE.md) serves as a machine-readable contract, allowing AI agents to:
- **Autonomously Scale Databases**: Full SQL schema and RLS policy documentation for zero-human-intervention deployment.
- **Deduplicated Data Seeding**: A rigid ID contract (`_registry.json`) prevents data collisions in distributed systems.
- **Interoperable Schemas**: Mapping TypeScript interfaces directly to PostgreSQL GIN indexes for high-speed attribute containment queries.

---

## 🛠 Technology Stack

Name Navigator is built using a modern, high-performance stack optimized for linguistic data processing and AI interoperability:

- **Frontend Framework**: [React 18](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/) for type-safe data modeling.
- **Build Tooling**: [Vite](https://vitejs.dev/) for ultra-fast HMR and production builds.
- **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/) for utility-first design and [Shadcn/UI](https://ui.shadcn.com/) for high-fidelity accessible components.
- **State Management**: [React Context API](https://react.dev/learn/passing-data-deeply-with-context) and custom hooks for persistent linguistic state.
- **Testing**: [Vitest](https://vitest.dev/) for unit testing core phonetic algorithms.
- **Architecture**: Sharded data delivery using immutable TypeScript batches for horizontal scalability.

---

## ☁️ Linguistic Backend (Supabase Infrastructure)

The project leverages [Supabase](https://supabase.com/) (PostgreSQL + Postgrest) as its primary persistence and edge computing layer:

### 1. Persistent Storage (Postgres)
We utilize a multi-schema PostgreSQL architecture:
- **Relational Tables**: Mapping names to their etymological roots, gender, and cultural metadata.
- **GIN Indexes**: High-performance "generalized inverted indexes" for optimized attribute filtering across the 1,123 semantic tags.
- **Row-Level Security (RLS)**: Fine-grained access control to ensure data integrity across multi-tenant naming contributions.

### 2. Edge Computing & Serverless Logic
- **Supabase Edge Functions**: We use [Deno](https://deno.land/) sub-runtimes for heavy phonetic processing and cross-cultural deduplication logic.
- **Real-time Sync**: Ensuring that naming "battles" and "favorites" are synchronized across client sessions with low latency.

---

## 🧪 Technical Core: Phonetic & Semantic Intelligence

### 🧩 Advanced Phonetic Harmony Algorithm (`nameHarmony.ts`)
Our proprietary engine performs multi-weighted linguistic analysis beyond simple string manipulation:
- **Phonetic Junction Analysis (Transition Scoring)**: Detects "clashes" between words by analyzing vowel-consonant transitions at the boundaries.
- **Rhythmic Synchronization (Syllabic Weighting)**: Uses a balanced-syllable matrix to ensure the First-Middle-Last sequence has a natural "flow."
- **Alliteration & Resonance**: Heuristic scoring for repetitive sounds that enhance memory recall and aesthetic appeal.
- **Intelligent Morphogenesis**: Handles complex Slavic and Turkic patronymic generation based on stem mutation rules.

---

## 🏛 System Architecture & Data Engineering

### 📦 Sharded Data Delivery Model
To maintain performance in resource-constrained environments (mobile/web), we implement a **Cold/Warm Data Strategy**:
- **TypeScript Data Sharding**: Large datasets are partitioned into immutable TypeScript batches (`batch_001.ts` to `batch_022.ts`).
- **Registry-Based Indexing**: Centralized `_registry.json` allows for O(log n) lookup.
- **Developer API**: Full roadmap for REST/GraphQL integration defined in **[API.md](file:///Users/ibragimov/Desktop/GitHub/name-navigator/API.md)**.

### 🤖 The "Agent-First" Contract
The project includes a dedicated manual for AI development, ensuring that any code-generating AI (like Copilot or Cursor) can extend the system without violating core invariants:
- **Deduplication Logic**: Conflict resolution for name collisions across cultures.
- **Schema Mapping**: Strict mapping of camelCase (JS) to snake_case (SQL).

---

## ⚙️ Routing & Infrastructure Map

| Route | Feature Pillar | Engineering Detail |
| :--- | :--- | :--- |
| `/` | Gateway | Entry point for linguistic modules. |
| `/children` | Infrastructure Search | High-performance filtering via `useMemo` & bitmask-like attribute matching. |
| `/pets` | Cross-Species Extension | Adaptation of the name model for diverse biological categories. |
| `/wizard` | Harmony Engine UI | Direct interface to the `calculateHarmony()` linguistic utility. |
| `/battle` | Heuristic Evaluation | Crowdsourcing name popularity via pairwise comparison logic. |
| `/favorites` | Predictive Layer | Personalized recommendation carousel based on vector proximity. |
| `/import` | Data Ingestion | Validation pipeline for external cultural datasets (CSV/JSON). |

---

## 📊 Comprehensive Infrastructure Statistics (Inventory v1.0)

Name Navigator maintains one of the most granular anthroponymic datasets available. Below is the exhaustive breakdown of our current data assets, verified for the Q1 2026 grant application.

### 🏛 Religious Distribution
| Religious Context | Record Count | Infrastructure Role |
| :--- | :--- | :--- |
| **Muslim** | 1,005 | Primary dataset for Islamic identity mapping. |
| **Christian** | 36 | Emerging dataset for Western/Orthodox traditions. |

### 🌍 Cultural Taxonomy (Child Names)
Our system currently supports **23 unique cultural groups** with the following distributions:
| Culture | Record Count | Culture | Record Count |
| :--- | :--- | :--- | :--- |
| **Arabic** | 921 | **Indian** | 12 |
| **Russian** | 20 | **Japanese** | 12 |
| **Uzbek** | 15 | **Persian** | 10 |
| **Persian-Muslim** | 15 | **Korean** | 8 |
| **Kazakh** | 14 | **Chinese** | 8 |
| **Tatar** | 14 | **Turkish** | 7 |

> [!TIP]
> **[View Full Data Inventory (DATA_INVENTORY.md)](file:///Users/ibragimov/Desktop/GitHub/name-navigator/DATA_INVENTORY.md)** — Exhaustive breakdown of all 1,123 attributes, 23 cultures, and 1,095 name entries.

---

## 🛠 Setup, Verification & Deployment

```bash
# 1. Initialize System Dependencies
npm install

# 2. Run Infrastructure Verification Tests
npm run test

# 3. Launch Development Runtime
npm run dev

# 4. Production Optimization
npm run build
```

---

*Name Navigator — Bridging Culture and Technology through Data.*
