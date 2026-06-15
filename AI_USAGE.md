# AI_USAGE.md: AI Collaborator Log

This document records how I utilized AI (specifically Gemini and GitHub Copilot) during the development of this application. Rather than using AI to write the entire application blindly, I treated the AI as an advanced pair-programming partner—leveraging it to brainstorm system design, scaffold boilerplate, and accelerate debugging, while maintaining strict architectural control.

---

## 1. Role & Strategy
- **Tools Used:** Gemini (Google DeepMind) for architectural sounding-boarding and prompt engineering, GitHub Copilot for inline auto-completion.
- **My Role:** System Architect and Lead Developer. I defined the database schema, handled the complex business logic (e.g., Time-Bound Memberships, Pairwise Ledger algorithms), and made the final technical decisions.
- **AI's Role:** Boilerplate scaffolding (React components, Express routing structures), CSS/Tailwind generation based on my design tokens, and acting as a rubber duck for debugging stack traces.

---

## 2. Prompt Engineering & Design Sparring

Instead of giving vague prompts like *"build me an expense app"*, I isolated complex problems and used advanced prompt engineering strategies to accelerate my velocity.

### Example: The "Meera & Sam" Timeline Problem
I realized splitting expenses equally across a flat where people move in and out would cause cascading math errors. Before writing the logic, I asked the AI:
> *"I have a Prisma schema for an expense tracker. If an expense is logged for April 2nd, and Meera moved out on March 31st while Sam moved in on April 15th, what is the most normalized way to handle dynamic split exclusion in a relational database without duplicating logic across endpoints?"*

The AI suggested several options, including a global `FlatmateStatus` table or a `GroupMembership` join table. We iterated on the ideas, and I ultimately chose and implemented the `GroupMembership` tracking approach because it allowed for the cleanest `date` interception in my controller logic.

### Example: Context-Injected AI Assistant
I wanted to build an AI chatbot into the app without the immense overhead of Vector Databases or the security risks of Text-to-SQL agents. I experimented with prompt constraints:
> *"You are an AI assistant for a flat expense app. Here is the raw JSON array of all expenses and user balances. Your job is to answer user queries based strictly on this JSON object. Do not hallucinate data. Be concise."*

By dynamically feeding the database state into the system instructions, I built an incredibly robust and accurate semantic search feature with minimal infrastructure.

---

## 3. Concrete Debugging & Course Corrections

Throughout development, the AI occasionally hallucinated incompatible libraries or configurations. My engineering fundamentals were critical in catching and overriding these errors.

### Case 1: Prisma v7 Schema Validation Error
*   **The AI's Suggestion:** The AI scaffolded a standard Prisma schema containing a `datasource` block with `url = env("DATABASE_URL")`.
*   **The Reality:** Prisma recently released v7, which deprecates the inline `url` property in favor of a dynamic `prisma.config.ts` setup. Running my initial migrations threw validation errors.
*   **My Fix:** I recognized that Prisma v7's new architecture relies on native C++ driver bindings (`better-sqlite3` or `pg`), which notoriously fail on Windows machines lacking MSBuild tools. I rejected the AI's configuration, consciously downgraded to the highly stable Prisma v6.19.3, and restored the inline `url` format. This ensured a friction-free local environment.

### Case 2: Database Transaction Timeouts During Bulk CSV Ingestion
*   **The AI's Suggestion:** For the CSV importer, the AI suggested wrapping all 42 parsed CSV rows—and their nested split records—inside a single sequential `$transaction` array.
*   **The Reality:** While conceptually correct, executing ~150 sequential insertion queries to a remote Supabase Postgres instance exceeded Prisma's default 5-second timeout, resulting in a `Transaction API error: Transaction not found`.
*   **My Fix:** I profiled the network latency and realized the connection pool was bottlenecking. I manually decoupled the non-critical data processing and overrode the Prisma configuration to increase the transaction timeout (`{ timeout: 60000 }`), successfully committing the batch process.

### Case 3: Hallucinated UI Libraries
*   **The AI's Suggestion:** When I asked the AI to help mock up the Dashboard layout, it hallucinated custom components from `@radix-ui/react-slider` and other headless UI libraries that were not in my `package.json`.
*   **My Fix:** Rather than installing bloated dependencies to satisfy the generated code, I stripped out the hallucinated imports and implemented the design system purely in native HTML/CSS and vanilla React state. This kept the bundle size small and aligned with my preference for zero-dependency foundations.
