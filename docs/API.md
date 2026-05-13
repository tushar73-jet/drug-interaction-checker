# REST API Reference

Base URL: `http://localhost:3001/api/v1`

---

## Drugs

### `GET /drugs/search?q={query}`

Search drugs by name (in-memory cache, debounced).

**Query params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `q` | string | ✅ | Search term (1-100 chars, letters/digits/hyphens) |

**Response `200`:**
```json
{
  "status": "success",
  "data": {
    "drugs": [
      { "name": "Aspirin" },
      { "name": "Aspirin/Dipyridamole" }
    ]
  }
}
```

---

### `GET /drugs/stats`

Live database statistics.

**Response `200`:**
```json
{
  "totalDrugs": 1742,
  "totalInteractions": 192847
}
```

---

### `GET /drugs/details/:name`

Pharmacology details for a single drug.

**Response `200`:**
```json
{
  "details": {
    "class": "Salicylate / NSAID",
    "action": "Irreversible COX-1 and COX-2 inhibition",
    "indications": ["Analgesic", "Antipyretic", "Antiplatelet"],
    "warnings": ["GI bleeding risk", "Reye syndrome in children"]
  }
}
```

---

## Interactions

### `POST /interactions/check`

Check a list of drugs for known database interactions.

**Request body:**
```json
{
  "drugs": ["Aspirin", "Warfarin"]
}
```

| Field | Rules |
|-------|-------|
| `drugs` | Array, min 2, max 20, each ≤100 chars |

**Response `200`:**
```json
{
  "status": "success",
  "data": {
    "interactions": [
      {
        "drug1": "Aspirin",
        "drug2": "Warfarin",
        "severity": "Major",
        "description": "Concurrent use increases bleeding risk significantly."
      }
    ]
  }
}
```

---

### `POST /interactions/explain`

AI-powered clinical explanation via the Python engine (Groq + Tavily).

**Request body:**
```json
{
  "drug1": "Aspirin",
  "drug2": "Warfarin",
  "description": "Increased risk of bleeding."
}
```

**Response `200`:**
```json
{
  "status": "success",
  "data": {
    "explanation": "Aspirin irreversibly inhibits COX-1-mediated thromboxane A2 synthesis, reducing platelet aggregation. When combined with Warfarin, which blocks Vitamin K-dependent clotting factors (II, VII, IX, X), the dual anticoagulant effect dramatically elevates haemorrhagic risk. Studies [1] demonstrate a 3× increased incidence of major GI bleeding...",
    "citations": [
      {
        "title": "NSAID–Warfarin interaction: NEJM systematic review",
        "url": "https://www.nejm.org/doi/...",
        "snippet": "A meta-analysis of 14 RCTs showed a 3.2-fold increase in GI bleeding..."
      }
    ]
  }
}
```

**Error responses:**
| Code | Meaning |
|------|---------|
| `400` | Validation error (invalid drug name, missing fields) |
| `503` | AI engine not configured (missing API keys) |
| `504` | AI engine timed out |
| `502` | AI engine temporarily unavailable |

---

## Profiles (Authentication Required)

All `/profiles` routes require `Authorization: Bearer <clerk_jwt>`.

### `GET /profiles`

List saved patient profiles for the authenticated user.

### `POST /profiles`

Create a new patient profile.

**Request body:**
```json
{
  "name": "Patient John",
  "drugs": ["Aspirin", "Warfarin"],
  "notes": "Monitor INR weekly"
}
```

### `DELETE /profiles/:id`

Delete a patient profile by ID.

---

## Health

### `GET /api/v1/health`

```json
{
  "status": "ok",
  "version": "v1",
  "timestamp": "2026-05-13T12:00:00.000Z"
}
```

### `GET http://localhost:3002/health` (AI Engine)

```json
{
  "status": "ok",
  "groq_configured": true,
  "tavily_configured": true
}
```
