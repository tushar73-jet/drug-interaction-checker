# Drug Interaction Checker - Backend

The backend API for the Drug Interaction Checker, built with Node.js, Express, and TypeScript.

## 🚀 Features
- **Drug Search API**: Efficiently search through the drug database.
- **Interaction Checker**: Analyze pairs and groups of drugs for potential interactions.
- **Graph Builder**: Generates node/edge data for the frontend graph visualization.
- **Prisma ORM**: Robust database management with TypeSafe queries.
- **Data Seeding**: Automated script to populate the database from CSV sources.

## 🛠️ Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: SQLite (scalable to PostgreSQL or MySQL)

## 📦 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Initialize the database:
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Sync schema with SQLite database
   npx prisma db push
   ```

3. Seed the database:
   ```bash
   # Populates the database with drug and interaction data
   npm run seed
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/drugs/search?q=...` | GET | Search for drugs by name |
| `/api/interactions/check` | POST | Check for interactions between a list of drugs |
| `/api/interactions/graph` | POST | Build graph data for a list of drugs |
| `/api/health` | GET | Check API status |

---
For full project documentation, please refer to the [root README](../README.md).
