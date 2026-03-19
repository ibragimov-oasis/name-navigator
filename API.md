# Name Navigator API Specification (v1.0-alpha)

This document outlines the planned API endpoints for the Name Navigator linguistic infrastructure. These endpoints are designed for high-performance integration into registration flows, AI assistants, and CRM systems.

## 📡 Base URL
`https://api.namenavigator.io/v1`

---

## 🧩 Phonetic Harmony Engine

### `GET /harmony`
Calculates the phonetic resonance score between a first name, middle name (patronymic), and last name.

**Parameters:**
- `first` (string, required): The given name.
- `middle` (string, optional): The middle name or patronymic.
- `last` (string, optional): The family name.
- `culture` (string, optional): Context-specific weighting (e.g., `arabic`, `slavic`).

**Response:**
```json
{
  "score": 88,
  "level": "High Resonance",
  "details": {
    "alliteration": 12,
    "syllabicBalance": 0.95,
    "vowelFlow": "optimal"
  }
}
```

---

## 🏛 Cultural Dataset Access

### `GET /names`
Search the global anthroponymic database with semantic filtering.

**Parameters:**
- `q` (string): Search prefix.
- `culture` (string): Filter by cultural group.
- `attributes` (csv): Filter by semantic tags (e.g., `wise,brave`).
- `limit` (int): Results per page.

**Response:**
```json
{
  "count": 1,
  "results": [
    {
      "id": "muhammad",
      "name": "Muhammad",
      "meaning": "Praiseworthy",
      "attributes": ["just", "wise", "strong"],
      "popularity": 99
    }
  ]
}
```

### `GET /attributes`
Returns the full taxonomy of 1,123 semantic attributes.

---

## 🤖 AI & Machine Learning Endpoints

### `POST /vectorize`
Converts a name or identity profile into a semantic vector for matching.

### `GET /recommendations`
Returns related names based on user preference vectors.

---

## 🔒 Authentication
Public endpoints are rate-limited. Enterprise access requires a valid `Authorization: Bearer <JWT>` header.
