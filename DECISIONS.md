# DECISIONS.md: Architectural & System Design Log

This document outlines the core engineering decisions, system design trade-offs, and product logic implemented during development. My goal was to prioritize maintainability, developer experience, and robustness, while avoiding unnecessary over-engineering.

---

## 1. Stack Selection: Node.js/Express over Django
* **Context:** The assignment allowed flexibility in the backend stack (Django or Node.js).
* **Options Considered:**
  1. *Django (Python):* Excellent for rapid MVC, built-in admin panel, and robust ORM. However, it introduces context-switching between Python and JavaScript (React) and requires managing separate environments (Pipenv/venv).
  2. *Node.js + Express:* Lightweight, highly customizable, and allows a unified JavaScript/TypeScript mental model across the entire stack.
* **Decision:** Node.js + Express.
* **Rationale:** A unified JS stack accelerates full-stack feature development. By using Express, I kept the API layer thin and delegated complex data modeling to the Prisma ORM. This also simplifies the deployment pipeline since the frontend and backend share the same package ecosystem.

---

## 2. Database Layer: Supabase PostgreSQL & Prisma ORM
* **Context:** The system required a relational database to handle complex financial data (users, expenses, splits, payments).
* **Options Considered:**
  1. *Local SQLite:* Fast for local development but unsuitable for cloud deployments (like Render or Fly.io) where ephemeral file systems wipe local `.db` files on restart.
  2. *Supabase PostgreSQL:* A cloud-hosted Postgres instance with connection pooling built-in.
* **Decision:** Supabase PostgreSQL with Prisma ORM (v6).
* **Rationale:** 
  - **PostgreSQL** guarantees data persistence in production and handles concurrent transactions (vital for an expense tracker). 
  - **Prisma ORM** provides a declarative, strictly typed schema. 
  - *Engineering Note on Versioning:* I explicitly pinned Prisma to `v6.19.3` instead of the latest `v7`. Prisma v7 introduced a serverless-first architecture requiring native C++ driver bindings (`pg` or `better-sqlite3`), which frequently causes Node-Gyp build failures on Windows environments. Reverting to Prisma v6 utilized its stable built-in Rust query engine, ensuring that anyone reviewing or running my code wouldn't face native compilation blockers.

---

## 3. Handling Dynamic Flatmate Memberships (Time-Bound Logic)
* **Context:** The flat has rotating members. Meera moved out on March 31, and Sam moved in on April 15. If a bill is added for April 2, Meera shouldn't be charged.
* **Options Considered:**
  1. *Manual Exclusion:* Forcing the user to manually deselect Meera for every April expense. This causes friction and human error.
  2. *Time-Bound Membership Tracking:* Creating a `GroupMembership` table with `joinedAt` and `leftAt` timestamps.
* **Decision:** Time-Bound Membership Tracking.
* **Rationale:** I designed the `computeSplits` algorithm to intercept the expense date. When a user logs an "equal split" expense, the backend checks the transaction date against the `GroupMembership` timeline. If the date falls outside a user's active residency, they are automatically excluded from the split calculation. This creates a foolproof system that scales to any number of move-ins/move-outs.

---

## 4. The Ledger Algorithm: Rohan's "No Magic Numbers" View
* **Context:** Rohan needs a transparent audit trail showing exactly *why* he owes Aisha a specific amount.
* **Options Considered:**
  1. *Global Balance Sheet:* A simple feed of all expenses. (Fails because Rohan can't easily isolate his debts to Aisha among 5 other roommates).
  2. *Pairwise Audit Ledger:* A localized sub-ledger calculating the net flow between User A and User B.
* **Decision:** Pairwise Audit Ledger.
* **Rationale:** I implemented an endpoint that queries only the expenses where User A paid and User B was involved in the split (and vice versa), alongside direct settlement payments between the two. By chronological sorting and mapping these records, the frontend reconstructs a step-by-step running balance. This solves the "magic numbers" problem by proving the math with actual receipts.

---

## 5. AI Contextual Ingestion vs. RAG (Retrieval-Augmented Generation)
* **Context:** Implementing an AI chat assistant capable of answering complex natural language questions like "Who spent the most on groceries?"
* **Options Considered:**
  1. *Vector Database & RAG:* Chunking database rows into vector embeddings. (Over-engineered for a small flatmate ledger, leading to precision loss on exact math).
  2. *Text-to-SQL Agents:* Asking the LLM to generate SQL queries. (High risk of SQL injection, hallucinated column names, and application crashes).
  3. *Prompt Context Ingestion:* Dumping the raw JSON state of the database into the LLM's system prompt dynamically.
* **Decision:** Prompt Context Ingestion using Gemini 2.5 Flash.
* **Rationale:** A flatmate group typically generates a few hundred rows of expense data per year. This payload is infinitesimally small compared to modern LLM context windows (1M+ tokens). By querying the Prisma database and passing the raw, exact ledger state directly into the system prompt, the AI has 100% accurate context to perform analysis without any risk of hallucinating SQL queries or setting up expensive vector architecture. It is a pragmatic, scalable choice for this specific use case.
