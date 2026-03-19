# Name Navigator DB Utility

The core linguistic engine and phonetic harmony algorithm used by Name Navigator.

## 🚀 Installation

```bash
npm install namenavigator-db
```

## 🧩 Usage

```typescript
import { calculateHarmony, generatePatronymic } from 'namenavigator-db';

const harmony = calculateHarmony("Muhammad", "Ali", "Ibragimov");
console.log(`Phonetic Harmony Score: ${harmony.score}/100`);

const patronymic = generatePatronymic("Farid", "male");
// Output: "Faridovich" (based on linguistic rules)
```

## 🌍 Features
- **Cross-Cultural Harmony**: Phonetic weighting for 23+ cultures.
- **Intelligent Patronymics**: Rule-based generation for Slavic and Turkic naming conventions.
- **Deduplication Logic**: Handle cultural naming collisions with ease.

## 🏛 License
MIT
