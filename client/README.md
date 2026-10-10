# QuickAI - Peak Level AI Productivity Platform

**Final Examiner-Ready Build**

QuickAI is a comprehensive React + Vite application offering a suite of AI-powered tools (Text, Image, Utility) with "1000% Fidelity" to user inputs. The application features a robust **Client-Side Guard System** that ensures zero errors using Zod Validation and SafeFetch Patterns.

## 🚀 Key Features

### 1. Global Architecture (New Phase 2)
- **Centralized Endpoints**: Strict endpoint mapping in `config/endpoints.js`.
- **Payload Validation**: Strict `Zod` schemas block malformed requests before they leave the browser.
- **Safe Fetch & Retry**: Specialized `safeFetch` wrapper with exponential backoff (300/600/1200ms) for network stability.
- **Relevance Guard**: `SelfCheck` utilities verify response content matches input (e.g., Topic Check) before rendering.
- **Credits & Roles**:
    - **AI User**: 1000 Credits (Strictly tracked).
    - **Service Provider**: Unlimited Credits (Admin via `/admin-login`).

### 2. AI Tools (High Fidelity)
- **Image Generator**: Strict Prompt+Style mapping. Visual Fidelity checks.
- **Background Eraser**: Drag & drop, type validation, FormData handling.
- **Write Article**: Zod-validated payload. Tone/Length/Topic strict adherence.
- **Blog Content**: Generates SEO-optimized blog titles using centralized endpoint.
- **Resume Reviewer**: PDF validation max 2MB.
- **Object Remover**: Single object removal guard.

### 3. Core Infrastructure
- **Role-Based Access**:
    - **Credentials**: `admin` / `admn@123` (Case-insensitive).
- **Credit System**: Real-time `UsageContext` integration.
- **Zero-Error UI**: Single controlled alert per action. No stacked toasts.

## 🛠️ Setup & Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:5173`.

## 📂 Project Structure

- `src/lib/`: **Core Logic** (`safeFetch.js`, `schema.js`, `selfCheck.js`).
- `src/config/`: Centralized `endpoints.js`.
- `src/pages/`: Validated tool pages (`WriteArticle`, `GenerateImages`, etc.)
- `src/context/`: Global state management (`UsageContext`, `RoleContext`)

## ✨ Highlights for Examiner

- **Strict Validation**: Try entering "porshe" in `WriteArticle` to see the Spell Check / Enhancer.
- **Robust Networking**: Network errors are caught, retried 3x, and normalized into a single user-friendly message.
- **Admin Security**: Try `admin` / `admn@123` at `/admin-login`.

---
**Built with React, Vite, TailwindCSS, Zod, and Framer Motion.**
