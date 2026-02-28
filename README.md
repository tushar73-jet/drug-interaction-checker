# 💊 Drug Interaction Checker
An interactive, offline-capable web application to detect, visualize, and report dangerous drug-drug interactions.

---

### :one: Clear Problem Understanding
*   **The Problem:** Patients—especially the elderly and those with chronic illnesses—frequently take multiple medications simultaneously (polypharmacy), exponentially increasing the risk of adverse drug-drug interactions.
*   **Why it Exists:** Current checking methods are highly fragmented. Doctors are forced to rely on manual book/PDF lookups or expensive, internet-dependent EHR systems that are inaccessible in smaller clinics.
*   **Real-World Impact:** Missed drug interactions lead to increased adverse drug reactions, longer hospital stays, and severe patient safety risks, particularly in under-resourced or rural healthcare settings.

### :two: Defined User Persona
*   **Target Users:** General Practitioners (GPs), Rural Clinic Doctors, Pharmacists, and Caregivers.
*   **Who they are:** Medical professionals managing complex patient prescriptions often in fast-paced or low-connectivity environments.
*   **Needs & Pain Points:** Existing tools are too slow (manual lookup), lack visual clarity, or require constant internet. They desperately need a fast, offline tool to instantly process $N \times (N-1)/2$ multi-drug combinations.

### :three: Proposed Solution Approach
*   **Proposed Solution:** A full-stack, entirely offline application that computes all pairwise drug interactions against a local database, visualizes the conflict network in a color-coded graph, and exports a clinical report.
*   **How it Addresses the Problem:** It acts as an instant decision-support tool. By using SQLite locally, it guarantees 100% offline availability and sub-200ms response times for identifying Contraindicated, Severe, or Moderate interactions.
*   **Methodology & Stack:** Deterministic Rule-Based algorithm checking pre-seeded interaction pairs. Tech stack includes React, Vite, Express.js, SQLite, and Prisma.

### :four: Architecture Diagram
**High-level data flow:**
```text
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                    │
│  DrugSearchBar → DrugTags → [CHECK] → Results Page      │
│  InteractionCards | InteractionGraph | ReportExport     │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP (Axios)
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND API (Express.js)               │
│  GET  /api/drugs/search?q=                              │
│  POST /api/interactions/check                           │
└───────────────────────────┬─────────────────────────────┘
                            │ Prisma ORM
                            ▼
┌─────────────────────────────────────────────────────────┐
│               DATABASE (SQLite - dev.db)                │
│  [id | drug1 | drug2 | description | severity]          │
└─────────────────────────────────────────────────────────┘
```

### :five: Setup Instructions (Repository Setup)
```bash
# 1. Clone the repository
git clone https://github.com/tushar73-jet/drug-interaction-checker.git
cd drug-interaction-checker

# 2. Install Dependencies
npm install

# 3. Setup Database (Migration & Seed)
npx prisma migrate dev
npx ts-node src/seed.ts

# 4. Start the Backend API
npx ts-node src/server.ts

# 5. Start the Frontend (in a new terminal)
cd frontend
npm install
npm run dev
```

### :six: Initial Proof of Concept (PoC Status)
*   ✅ **Database Seeding Engine:** Custom script (`src/seed.ts`) successfully parses thousands of raw CSV rows and seeds the offline SQLite database via Prisma.
*   ✅ **Core Interaction Algorithm:** Bidirectional querying logic implemented to handle N-way drug interaction paths.
*   ✅ **Environment Setup:** Full monorepo structure combining backend Express and frontend Vite scaffolding.

---
## 📑 Project Master Summary (17 Points)

### 1. Problem Statement
**Title:** Polypharmacy Safety Risk. taking multiple medications face compounded risks of dangerous interactions, and the current tools are expensive or slow.

### 2. Problem Understanding & Approach
**Strategy:** An offline SQLite database with a deterministic algorithm to rapidly check all interaction pairs.

### 3. Proposed Solution
**Overview:** Enter a drug list to instantly see graded interactions, visual graphs, and clinical reports.

### 4. System Architecture
**Flow:** User → React Frontend → Express API → Rule-Based Engine → SQLite Database → JSON Response

### 5. Database Design
A single `DrugInteraction` flat-table containing `id`, `drug1`, `drug2`, `severity`, and `description`. Indexed for bidirectional lookups.

### 6. Dataset Selected
**Name:** `db_drug_interactions.csv`
**Source:** Open-source pharmacological dataset, bulk-seeded via Prisma for offline functionality.

### 7. Model Selected
**Name:** Rule-Based Graph Detection
**Reasoning:** Deterministic safety. ML introduces unacceptable uncertainty in exact clinical interaction matching.

### 8. Technology Stack
**Frontend:** React 19, Vite, Tailwind, React Flow | **Backend:** Express.js, Node.js | **Database:** SQLite, Prisma ORM

### 9. API Documentation & Testing
**Core Endpoints:**
1. `GET /api/drugs/search?q={query}` (Autocomplete)
2. `POST /api/interactions/check` (Pairwise Checker)

### 10. Module-wise Deliverables
Scope definition → Express API/Schema → React UI → Graph Integration → Testing → Local Deployment.

### 11. End-to-End Workflow
Search drug → Select pills → "Check" → View Graph & Cards → Export PDF.

### 12. Demo & Video
**Repository:** [GitHub](https://github.com/tushar73-jet/drug-interaction-checker)

### 13. Hackathon Deliverables Summary
Fully offline app, custom dataset seeded, interactive graph UI, and PDF reporting.

### 14. Team Roles & Responsibilities
**Tushar:** Full-Stack Dev (API, DB Schema, React UI, Flow Integration)

### 15. Future Scope & Scalability
**Short-Term:** Combine duplicate interactions, add brand/generic name mapping. **Long-Term:** HL7 FHIR Integration.

### 16. Known Limitations
Cannot identify novel interactions not in the CSV, and does not check for dose-dependency.

### 17. Impact
Significantly cuts down clinical manual check times to <200ms while greatly reducing polypharmacy errors in low-connectivity areas.
