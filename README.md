# 💊 Drug Interaction Checker

An interactive, offline-capable, full-stack web application designed to detect dangerous drug-drug interactions, visualize medication conflicts as an interactive graph, and generate clinical PDF reports.

## 1. Problem Statement
**Polypharmacy Safety Risk:** Patients taking multiple medications face a high risk of dangerous interactions. Existing checking tools are expensive, internet-dependent, or lack structured visual insights, leading to manual, error-prone evaluations at the point of care.

## 2. Problem Understanding & Approach
**Approach:** We replace manual and fragmented checks with a structured local SQLite database and a fast, deterministic pairwise interaction algorithm that works completely offline.

## 3. Proposed Solution
**Overview:** A full-stack app where clinicians enter a drug list to instantly see N*(N-1)/2 interactions, categorized by severity, visualized in a React Flow graph, and exportable as a clinical PDF report.

## 4. System Architecture
**Flow:** User → React Frontend → Express API → Rule-Based Engine → SQLite Database → JSON Response (Graph Nodes & Pairwise Data).

## 5. Database Design
**Schema:** A single, optimized `DrugInteraction` table with columns: `id`, `drug1`, `drug2`, `severity`, `description`, and `mechanism`. Bidirectional lookup eliminates the need for complex joins.

## 6. Dataset Selected
**Source:** Curated open-source pharmacological dataset (`db_drug_interactions.csv`). Seeded into the local database to guarantee 100% offline functionality.

## 7. Model Selected
**Engine:** Rule-Based Graph Detection. We explicitly rejected unpredictable ML models in favor of deterministic, 100% recall database lookups for this safety-critical clinical application.

## 8. Technology Stack
**Stack:** React 19, Vite, Tailwind CSS, React Flow (Frontend) | Express.js, Node 22 (Backend) | Prisma ORM, SQLite (Database) | jsPDF (Export).

## 9. API Documentation & Testing
**Core Endpoints:** 
- `GET /api/drugs/search?q={query}` (Autocomplete)
- `POST /api/interactions/check` (Core Pairwise Checker)
- `GET /api/health`

## 10. Module-wise Development & Deliverables
**Checkpoints:** Planning (Architecture/Schema) → Backend (Express API) → Frontend (React App) → Engine Verification (<200ms latency) → Integration (React Flow/jsPDF export) → Deployment.

## 11. End-to-End Workflow
**User Journey:** Search/select medications → Click "Check" (API triggers) → View Severity Summary → Explore Graph & Detail Cards → Export Patient PDF Report.

## 12. Demo & Video
**Links:** [GitHub Repository](https://github.com/tushar73-jet/drug-interaction-checker) | *Live Demo Link (TBD)* | *Video Pitch Link (TBD)*

## 13. Hackathon Deliverables Summary
**Achievements:** Fully functional, offline-capable full-stack app with custom database seeding, interactive graphing, PDF generation, and RESTful stateless architecture.

## 14. Team Roles & Responsibilities
**Tushar:** Full-Stack Developer & Project Lead (Architecture, Backend APIs, Prisma Schema, React Frontend, Graph Integration).

## 15. Future Scope & Scalability
**Next Steps:** Incorporate dosage conflict detection, add brand-to-generic mapping, and integrate with standard HL7 FHIR APIs for EHR interoperability.

## 16. Known Limitations
**Current Constraints:** Cannot detect novel interactions not present in the seeded CSV, does not analyze dose-dependency, and should function strictly as decision-support rather than clinical replacement.

## 17. Impact
**Value:** Significantly reduces the risk of adverse drug reactions, cuts clinical checking time to under 5 seconds, and provides a free, highly accessible tool for small/rural clinics.