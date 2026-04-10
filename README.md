# Drug Interaction Checker

A comprehensive web application designed to help healthcare professionals and patients identify potential drug-drug interactions. The application provides analytical tools, including severity ratings and interactive graph visualizations, to ensure medication safety.

![Dashboard Preview](https://via.placeholder.com/800x400?text=Drug+Interaction+Checker+Dashboard)

## 🚀 Features

- **Advanced Drug Search**: Quickly find medications from a comprehensive database.
- **Interaction Analysis**: Check for potential conflicts between multiple drugs simultaneously.
- **Severity Ratings**: Interactions are categorized by severity (Major, Moderate, Minor) with clinical descriptions.
- **Interactive Graph View**: Visualize complex drug interaction networks using a dynamic node-based interface.
- **PDF Report Generation**: Export interaction findings into a professionally formatted PDF report.
- **Secure Authentication**: User accounts and data protection powered by Clerk.
- **Responsive Design**: Fully optimized for both desktop and mobile devices with Dark Mode support.

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
