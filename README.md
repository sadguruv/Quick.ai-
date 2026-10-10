<div align="center">

# QUICK.AI ⚡

**Next-Generation AI Content & Multimedia Generation SaaS**

[![GitHub Repository](https://img.shields.io/badge/GitHub-sadguruv%2FQuick.ai---blue?style=flat-square&logo=github)](https://github.com/sadguruv/Quick.ai-)
[![License](https://img.shields.io/badge/license-ISC-blue?style=flat-square)](LICENSE)
[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.1.0-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL / SQLite](https://img.shields.io/badge/Database-PostgreSQL%20%7C%20SQLite-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Ollama & OpenAI](https://img.shields.io/badge/AI Engine-OpenAI %7C Ollama %7C SD-412991?style=flat-square&logo=openai&logoColor=white)](https://ollama.ai/)

</div>

---

## 📌 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Prerequisites](#prerequisites)
- [Quick Start Guide](#quick-start-guide)
- [Detailed Setup Guide](#detailed-setup-guide)
  - [1. Repository Setup](#1-repository-setup)
  - [2. Environment Configuration](#2-environment-configuration)
  - [3. Backend Setup](#3-backend-setup)
  - [4. Frontend Setup](#4-frontend-setup)
- [Local AI Providers Setup](#local-ai-providers-setup)
  - [Ollama Setup (Local LLM)](#ollama-setup-local-llm)
  - [Stable Diffusion Setup (Local Image Generation)](#stable-diffusion-setup-local-image-generation)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Testing & System Verification](#testing--system-verification)
- [License](#license)

---

## 🌟 Overview

**QuickAI** is an all-in-one AI platform providing text, image, document, and media creation tools. It features a hybrid AI execution engine capable of seamlessly switching between cloud providers (OpenAI, Cloudinary, Clerk, Neon PostgreSQL) and local AI runtimes (Ollama, Stable Diffusion / Automatic1111, SQLite) for privacy, speed, and offline capability.

---

## 🚀 Key Features

### 🤖 AI-Powered Tools & Services
- **📝 Article Generator**: Generate structured articles with customizable length, tone, and formatting.
- **🎨 Image Generator**: Create high-resolution images using OpenAI DALL-E or local Stable Diffusion WebUI.
- **🖼️ Background Remover**: Precision background removal powered by local Python `rembg` services or Cloudinary.
- **📄 Resume Reviewer**: AI-powered analysis of uploaded PDF resumes with actionable improvement feedback and scoring.
- **✍️ Blog Title Generator**: Generate viral, high-converting blog post titles.
- **💻 Codex AI Workspace**: Code assistant for explaining, refactoring, and generating code.
- **💳 Flexible Credits & Roles System**: Support for Free Users (1,000 credits), Service Providers, and Scanner Bypasses.

---

## 🛠️ Tech Stack

### Frontend (`client/`)
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS, Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router DOM v7
- **Authentication**: Clerk React (`@clerk/clerk-react`)
- **HTTP Client**: Axios

### Backend (`server/`)
- **Runtime**: Node.js & Express 5
- **Databases**: PostgreSQL (via Neon `@neondatabase/serverless`) & Local SQLite (`better-sqlite3`)
- **AI Integrations**: OpenAI API, Ollama (Llama 3.2), Stable Diffusion API
- **Media & File Handling**: Cloudinary, Multer, Sharp
- **PDF Extraction**: `pdf-parse`
- **Email Services**: Nodemailer (SMTP OTP & Notifications)

---

## 📂 Project Architecture

```
QuickAI/
├── client/                     # React Frontend Application
│   ├── src/
│   │   ├── assets/            # Static media and icons
│   │   ├── components/        # UI Components (Navbar, Sidebar, Hero, Plan, etc.)
│   │   ├── context/           # React Contexts (Credits, Theme, Role)
│   │   ├── pages/             # Page Views (Dashboard, ChatWorkspace, ReviewResume, etc.)
│   │   ├── services/          # Client API services & self-checks
│   │   └── config/            # API endpoints & client config
│   ├── .env.example           # Environment template for frontend
│   └── package.json
│
├── server/                     # Express Backend Application
│   ├── ai/                    # Core AI execution engine & prompt templates
│   ├── configs/               # Cloudinary, Database, Multer & Credit configs
│   ├── controllers/           # Controllers for AI, Auth, Resume, Codex, Article, etc.
│   ├── db/                    # Local SQLite & Neon PostgreSQL database drivers
│   ├── middlewares/           # Auth, Role, & Error handling middlewares
│   ├── routes/                # Express API Route handlers
│   ├── utils/                 # AI provider dispatchers & credit calculators
│   ├── bg_remove_service.py   # Python background removal script
│   ├── .env.example           # Environment template for backend
│   └── package.json
│
├── .gitignore                  # Root Git ignore rules
├── run_quickai.bat             # Automated 1-click Windows launcher
├── README.md                   # Project documentation & setup guide
└── LICENSE                     # ISC License
```

---

## 📋 Prerequisites

Before starting, ensure you have the following installed on your machine:

- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm**: v8.0.0 or higher (comes with Node.js)
- **Git**: ([Download Git](https://git-scm.com/))
- *(Optional for local AI)* **Ollama**: ([Download Ollama](https://ollama.ai/))
- *(Optional for Python services)* **Python 3.10+**: ([Download Python](https://www.python.org/))

---

## ⚡ Quick Start Guide

### 🚀 One-Click Start (Windows)
If you are running on Windows, simply double-click **`run_quickai.bat`** in the project root folder. It will:
1. Check dependencies
2. Install frontend and backend npm packages automatically if missing
3. Launch both backend (`http://localhost:5000`) and frontend (`http://localhost:5173`) in parallel.

---

## 📖 Detailed Setup Guide

### 1. Repository Setup

Clone the repository to your local machine:

```bash
git clone https://github.com/sadguruv/Quick.ai-.git
cd Quick.ai-
```

---

### 2. Environment Configuration

#### Backend Environment Setup
Navigate to the `server/` directory and create `.env` from the provided `.env.example`:

```bash
cd server
cp .env.example .env
```

Open `server/.env` and update the values with your credentials:

```env
# AI Providers
OPENAI_API_KEY=sk-your-openai-key-here
OLLAMA_API_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2:latest
SD_API_URL=http://127.0.0.1:7860

# Database Connections
DATABASE_URL=postgresql://user:password@ep-sample.neon.tech/quickai?sslmode=require

# Media & Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Authentication
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key

# Server Config
PORT=5000

# Email OTP Service (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

#### Frontend Environment Setup
Navigate to the `client/` directory and create `.env` from the provided `.env.example`:

```bash
cd ../client
cp .env.example .env
```

Open `client/.env` and verify the settings:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
VITE_API_URL=http://localhost:5000/api
VITE_API_BASE_URL=http://localhost:5000
VITE_BASE_URL=http://localhost:5000
```

---

### 3. Backend Setup

From the project root:

```bash
cd server
npm install
```

Start the backend server in development mode:

```bash
npm run dev
```

The server will run at: `http://localhost:5000`

---

### 4. Frontend Setup

From the project root:

```bash
cd client
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The client will run at: `http://localhost:5173` (or the URL displayed in terminal).

---

## 🤖 Local AI Providers Setup

### Ollama Setup (Local LLM)
To run text generation tools offline or without OpenAI API costs:

1. Install [Ollama](https://ollama.ai/).
2. Pull the default model:
   ```bash
   ollama pull llama3.2
   ```
3. Start the Ollama service (default URL: `http://127.0.0.1:11434`).
4. Ensure `server/.env` contains `OLLAMA_API_URL=http://127.0.0.1:11434`.

### Stable Diffusion Setup (Local Image Generation)
To generate images locally:
1. Run Automatic1111 WebUI with `--api` flag enabled.
2. Verify the web interface is accessible at `http://127.0.0.1:7860`.

---

## 📡 API Endpoints

### AI Endpoints (`/api/ai`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/generate-article` | Generate full articles with custom parameters |
| `POST` | `/api/ai/generate-titles` | Generate engaging blog post titles |
| `POST` | `/api/ai/generate-image` | Generate AI images via DALL-E / Stable Diffusion |
| `POST` | `/api/ai/remove-background` | Remove background from uploaded image |
| `POST` | `/api/ai/review-resume` | Analyze PDF resume and provide score & tips |
| `POST` | `/api/ai/codex` | Process code completion and explanation requests |

### User Endpoints (`/api/users`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users/profile` | Retrieve user profile & credit balance |
| `GET` | `/api/users/creations` | List user's saved AI creations |
| `GET` | `/api/users/community` | Retrieve public community creations |

---

## 🧪 Testing & System Verification

The backend includes test scripts to verify database connectivity, AI engine responsiveness, and API endpoints:

```bash
# Test local database & AI provider availability
cd server
node verify_system_suite.js
```

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
