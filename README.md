# Drug Interaction Checker

A comprehensive web application designed to help healthcare professionals and patients identify potential drug-drug interactions. The application provides analytical tools, including severity ratings and interactive graph visualizations, to ensure medication safety.

## 🚀 Features

- **Advanced Drug Search**: Quickly find medications from a comprehensive database with real-time risk monitoring.
- **Interaction Analysis**: Check for potential conflicts between multiple drugs simultaneously with instant visual feedback.
- **Pharmacological Context**: Access drug classes, therapeutic indications, and mechanism of action directly from the workspace.
- **Interactive Visualization**: A dynamic, node-based graph that maps relationships to clinical findings with bi-directional highlighting.
- **Clinician Workspace**: Securely persist patient profiles and clinical observations across devices (powered by Clerk).
- **Professional Reporting**: Generate detailed PDF reports including patient history, clinician notes, and severity ratings.
- **Responsive Design**: Fully optimized for primary clinical devices (Desktop & Tablet) with high-contrast Dark Mode.

## 🛠️ Technology Stack

### Frontend
- **React 19** with **Vite**
- **Clerk** (Authentication)
- **xyflow/react** (Interaction Graph)
- **Framer Motion** (Animations)
- **Lucide React** (Icons)
- **jsPDF** (PDF Reports)
- **Vanilla CSS** (Custom Design System)

### Backend
- **Node.js** & **Express**
- **TypeScript**
- **Prisma ORM**
- **SQLite** (Database)
- **CSV Parser** (Data Ingestion)

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Repository Setup
```bash
git clone https://github.com/tushar73-jet/drug-interaction-checker.git
cd drug-interaction-checker
```

### 2. Backend Setup
```bash
cd backend
npm install

# Setup Database
npx prisma generate
npx prisma db push

# Seed Data (Important for initial drug database)
npm run seed

# Run Development Server
npm run dev
```
The backend will run on `http://localhost:3001`.

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Create .env file
echo "VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key" > .env

# Run Development Server
npm run dev
```
The frontend will run on `http://localhost:5173`.

## 📁 Project Structure

```text
drug-interaction-checker/
├── backend/
│   ├── prisma/             # Database schema
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── seed.ts         # Data seeding script
│   │   └── server.ts       # Express app entry
│   └── data/               # Source drug/interaction data
└── frontend/
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── pages/          # Application views
    │   ├── GraphView.jsx   # Interactive graph logic
    │   └── index.css       # Core design system
    └── public/             # Static assets
```

## 🔐 Environment Variables

### Frontend (`frontend/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Your Clerk application publishable key |

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `PORT` | Local server port (default: 3001) |
| `DATABASE_URL` | Prisma database connection string (default: SQLite `file:./data/dev.db`) |

## 📄 License
This project is licensed under the ISC License.
