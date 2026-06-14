# Spreetail Shared Expenses App

A highly polished, fintech-style shared expenses web application built to help flatmates (Aisha, Rohan, Priya, Meera, Sam, and Dev) track expenses, resolve messy data anomalies, simplify debts, and keep a transparent balance ledger.

## Technology Stack

- **Backend:** Node.js, Express.js, Prisma ORM, PostgreSQL (Supabase)
- **Frontend:** React (Vite), Tailwind CSS v4, Lucide Icons
- **AI Integrations:** Google Gemini 2.5 Flash API (Spreetail Expense AI Assistant)
- **Primary AI Developer Collaborator:** Gemini (Google DeepMind)

---

## Getting Started

### 1. Prerequisites
- **Node.js** (v24.14.0 or above recommended)
- **npm** (v11.12.0 or above)
- **Supabase/PostgreSQL Connection String** (Transaction pooler on port `6543` and direct URL on port `5432` for migrations)

---

### 2. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` file:
   Create a `.env` file in the `backend/` directory with the following variables:
   ```env
   DATABASE_URL="postgresql://postgres.[project-id]:[password]@aws-1-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.[project-id]:[password]@aws-1-[region].pooler.supabase.com:5432/postgres"
   PORT=5000
   GEMINI_API_KEY="your-gemini-api-key-here"
   ```
4. Run migrations to sync the PostgreSQL database:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Start the Express server:
   ```bash
   npm run start
   # or for development (auto-restart on changes):
   npm run dev
   ```
   *(The server will start on port `5000` and automatically seed initial flatmate profiles and active membership timelines if the database is empty).*

---

### 3. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the printed local port (e.g. `http://localhost:5175` or `http://localhost:5173`).

---

## Core Features Implemented

1. **Login Module:** Quick, interactive visual profile select screen to swap active flatmate contexts.
2. **Deduplication & Anomaly Resolution Wizard (Meera's View):** Ingests the raw `expenses_export.csv` file, detects all 18 anomalies, and provides an interactive dashboard to Approve, Edit, or Reject suggestions before final database writes.
3. **Debt Simplification (Aisha's View):** Runs a greedy transactions minimization algorithm to display a simplified list of "who pays whom, how much".
4. **Audit Ledgers (Rohan's View):** Drilldown audit panel explaining the exact expenses, splits, and payments that make up any net balance.
5. **Multi-Currency Toggle (Priya's View):** Toggle between base currency (INR) and original transaction currencies (USD/INR) showing clean conversion rates.
6. **Time-Bound Group Memberships (Sam's View):** Excludes Meera after March 31, excludes Sam before April 15 (with a custom override exception for housewarming drinks), and corrects misallocated post-paid March utility bills.
7. **AI Chat Assistant:** Panel connecting to Gemini 2.5 Flash to answer questions like *"Why does Sam owe Rohan?"* or *"Who spent the most on groceries?"* in natural language using the actual live database state.
