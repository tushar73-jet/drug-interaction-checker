# Drug Interaction Checker - Frontend

The frontend for the Drug Interaction Checker application, built with React and Vite.

## 🚀 Features
- **Modern UI**: Clean, responsive interface with Dark Mode support.
- **Interactive Graphs**: Visual representation of drug interactions using `@xyflow/react`.
- **Authentication**: Secure login and user management via Clerk.
- **PDF Export**: Generate professional reports of interaction findings.

## 🛠️ Tech Stack
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Vanilla CSS with a customized design system.
- **State Management**: React Hooks.

## 📦 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   Create a `.env` file and add your Clerk publishable key:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## 🏗️ Building for Production
```bash
npm run build
```
The build assets will be generated in the `dist/` directory.

---
For full project documentation, please refer to the [root README](../README.md).
