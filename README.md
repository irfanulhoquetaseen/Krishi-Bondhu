# Krishi Bondhu (কৃষি বন্ধু) — AI Agro-Advisory & Soil Telemetry Platform

> **An algorithmic, multimodal agronomic intelligence and digital crop health passport engineered specifically for smallholder farmers across Bangladesh.**

Krishi Bondhu bridges artificial intelligence with Bangladesh's agricultural heartland. Designed to solve the acute agricultural extension deficit (where 1 Sub-Assistant Agriculture Officer advises over 1,800 farm families), Krishi Bondhu provides colloquial Bangla voice diagnostics, foliar plant pathology computer vision, weather-aware prescriptive treatment protocols, mandi wholesale predatory price detection, and printable Field Health Cards with natural audio briefings.

---

## Architecture Overview

Krishi Bondhu operates as an integrated full-stack monorepo featuring a **Next.js 14 (App Router) + TypeScript + Tailwind CSS** frontend and a **FastAPI (Python 3.11) + Uvicorn + Pydantic** agronomic reasoning backend.

```
Krishi Bondhu flash/
├── frontend/                          # Next.js 14 App Router + Tailwind + Framer Motion
│   ├── app/
│   │   ├── layout.tsx                 # Space Grotesk + Inter fonts, Navbar, Footer, Theme Script
│   │   ├── globals.css                # Design tokens, CSS variables, Dark Mode, Telemetry textures
│   │   ├── page.tsx                   # Interactive landing page with animated count-up metrics
│   │   ├── dashboard/
│   │   │   └── page.tsx               # Advisory console: Multimodal Intake, Diagnosis, Telemetry, Passport
│   │   └── passport/
│   │       └── page.tsx               # Dedicated Digital Crop Passport certificate view
│   ├── components/
│   │   ├── layout/                    # Navbar (with Dark Mode toggle & mobile drawer), Footer
│   │   ├── landing/                   # Hero with live telemetry, Problem, 5-Step Engine, CTA
│   │   ├── dashboard/
│   │   │   ├── voice-intake-card.tsx      # Task 1: Spoken Bengali query intake (Whisper + Claude)
│   │   │   ├── crop-disease-detector.tsx  # Task 2: Foliar pathology vision diagnostic (Blast/Blight)
│   │   │   ├── diagnosis-report.tsx       # Task 3: Multimodal treatment reasoning + weather rules
│   │   │   ├── market-price-anomaly.tsx   # Task 4: Mandi wholesale Z-score & selling window
│   │   │   ├── field-health-card.tsx      # Task 5: Printable certificate + PDF generator
│   │   │   ├── audio-advisory-player.tsx  # Native audio player with playback speed & transcript
│   │   │   └── dashboard-skeletons.tsx    # Shimmering loading skeletons for all async flows
│   │   └── ui/
│   │       ├── skeleton.tsx               # Reusable shimmering skeleton primitive
│   │       ├── theme-toggle.tsx           # Light/Dark mode animated toggle
│   │       └── scroll-reveal.tsx          # Framer Motion viewport reveal wrappers
│   └── tailwind.config.ts             # Forest, amber, soil, and dynamic warm tokens
│
└── backend/                           # FastAPI + Pydantic + Uvicorn
    ├── app/
    │   ├── main.py                    # Entry point, CORS middleware, API route registration
    │   ├── routers/
    │   │   ├── health.py              # System & hardware diagnostic endpoints
    │   │   ├── voice_intake.py        # Task 1: ASR speech transcription & parameter parsing
    │   │   ├── disease_detection.py   # Task 2: Foliar pathology classification & severity
    │   │   ├── treatment_plan.py      # Task 3: Weather-aware IPM reasoning engine
    │   │   ├── price_check.py         # Task 4: Mandi benchmark statistics & haat window
    │   │   └── report_generation.py   # Task 5: Spoken Bengali synthesis (Gemini native TTS) & PDF
    │   ├── services/                  # Business logic, statistical calculations & AI clients
    │   ├── models/                    # Strict Pydantic contracts & schemas
    │   └── data/                      # 30-day regional wholesale mandi benchmark datasets
    ├── tests/                         # Full automated test suite for all 5 tasks
    ├── requirements.txt               # Backend Python dependencies
    └── run.py                         # Convenience startup script
```

---

## The 5-Step Multimodal Engine

1. **Task 1: Bangla Spoken Query Intake (`/api/voice-intake`)**
   - Captures spoken voice queries directly from farmers via browser MediaRecorder.
   - Transcribes colloquial Bengali and regional dialects using OpenAI Whisper ASR.
   - Extracts structured agronomic entities (crop type, growth stage, foliar damage symptoms, upazila/district) using Anthropic Claude.
   - *Fallback:* Includes interactive manual typing fallback and preloaded voice samples.

2. **Task 2: Foliar Pathology Vision Diagnostics (`/api/disease-detection`)**
   - Analyzes crop leaf photos uploaded via file browser or mobile camera capture (`capture="environment"`).
   - Segments foliar lamina and evaluates necrotic lesions (Rice Leaf Blast, Bacterial Leaf Blight, Potato Late Blight).
   - Generates confidence scores, foliar damage percentages, and severity classification (Mild, Moderate, Severe, Critical).
   - *Fallback:* Includes 1-click test specimen generators (Blast, Blight, Healthy canopy).

3. **Task 3: Weather-Aware Multimodal Treatment Reasoning (`/api/treatment-plan`)**
   - Fuses Task 1 Voice Symptoms + Task 2 Foliar Pathology + Real-Time OpenWeatherMap microclimate telemetry.
   - **Critical Weather Rule:** Automatically enforces spray suspension if precipitation is forecast within 6 hours to prevent chemical runoff and waterway contamination.
   - Provides tiered BRRI/BARI agronomic prescriptions: biological organic controls, precision chemical dosage, Pre-Harvest Intervals (PHI), and application timing.

4. **Task 4: Mandi Wholesale Price Anomaly Detection (`/api/price-check`)**
   - Analyzes broker offers against 30-day moving wholesale benchmarks across primary Bangladeshi mandis.
   - Computes statistical Z-scores; flags predatory middleman rates ($Z \le -1.5$, $>15\%$ below mean) to protect farmer margins.
   - Calculates estimated financial loss in BDT and recommends optimal upcoming Haat selling windows.

5. **Task 5: Official Digital Crop Passport & Field Health Card (`/api/generate-report`)**
   - Consolidates Voice Intake + Vision Diagnostics + Treatment Rx + Price Analysis into a formal certificate.
   - Composes a warm, natural spoken Bengali advisory and synthesizes clear audio via Gemini native TTS.
   - Dynamically compiles a vector PDF report via ReportLab with QR code validation and WhatsApp sharing.

---

## Design System & Tokens

Krishi Bondhu adheres to a tailored agricultural design system avoiding generic AI aesthetics:

- **Core Primary (Deep Forest):** `forest-800` (`#1F3D2B`), `forest-900` (`#172F22`), `forest-950` (`#0E1D15`)
- **Core Accent (Warm Amber):** `amber-500` (`#D9A441`), `amber-400` (`#E2B455`), `amber-600` (`#BF882C`)
- **Core Secondary (Soil Brown):** `soil-600` (`#5C4632`), `soil-500` (`#775D45`), `soil-700` (`#4A3828`)
- **Warm Editorial Surfaces:**
  - Light Mode: `--bg-warm: #FAF7F0`, `--surface-warm: #F4EFE6`, `--card-warm: #FBF9F4`, `--border-warm: #E5DED0`, `--ink-primary: #142018`
  - Dark Mode: `--bg-warm: #0C1610`, `--surface-warm: #13241A`, `--card-warm: #182C21`, `--border-warm: #264232`, `--ink-primary: #F0F5F2`
- **Typography:**
  - Headings: `Space Grotesk` (bold, tight tracking `-0.03em`)
  - Body: `Inter` (neutral, legible, optimized line heights)
  - Telemetry: `JetBrains Mono / monospace` (readout precision)
- **Loading UX:** Zero spinners for async operations; replaced entirely with shimmering multi-part skeletons.

---

## Getting Started

### Prerequisites
- **Node.js** 18.17+ or 20+
- **Python** 3.11+
- **npm** or **pnpm**

---

### 1. Backend Setup (FastAPI)

```bash
cd backend

# Create and activate Python virtual environment
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On macOS / Linux:
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Configure API Keys (`.env`)
Create a `.env` file in the `backend/` directory (or copy from `.env.example`):

```bash
cp .env.example .env
```

Set your keys:
```env
# OpenAI API Key (Whisper ASR speech transcription)
OPENAI_API_KEY=your_openai_api_key_here

# Anthropic API Key (Claude 3.5 Sonnet / Haiku agronomic reasoning)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# OpenWeatherMap API Key (free tier: https://openweathermap.org/api)
OPENWEATHER_API_KEY=your_openweathermap_api_key_here

# Optional: Default Claude Model
CLAUDE_MODEL=claude-3-5-sonnet-20241022
```

> [!NOTE]
> **Graceful Offline / Mock Fallbacks:** If any API key is omitted, Krishi Bondhu automatically switches to high-fidelity agronomic heuristic mocks. The entire suite (Voice Intake, Leaf Diagnostics, Weather Forecasting, Price Checks, and PDF Generation) remains **100% functional** for demonstration, testing, and offline grading.

#### Run the Backend Server
```bash
# Start FastAPI with auto-reload on port 8000
python run.py

# Or using uvicorn directly:
uvicorn app.main:app --reload --port 8000
```
- **Interactive Swagger Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check Endpoint:** [http://localhost:8000/health](http://localhost:8000/health)

---

### 2. Frontend Setup (Next.js 14)

```bash
cd frontend

# Install Node dependencies
npm install

# Start development server
npm run dev
```
- **Landing Page:** [http://localhost:3000](http://localhost:3000)
- **Advisory Console:** [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- **Digital Crop Passport:** [http://localhost:3000/passport](http://localhost:3000/passport)

---

## Automated Verification & Testing

### Backend Unit Tests
Execute the automated test suite covering disease detection, price anomaly calculations, treatment reasoning, and report generation:

```bash
cd backend
.venv\Scripts\python.exe -c "import tests.test_disease_detection as t; t.test_disease_detection_successful()"
.venv\Scripts\python.exe -c "import tests.test_price_check as t; t.test_price_check_successful()"
.venv\Scripts\python.exe -c "import tests.test_treatment_plan as t; t.test_treatment_plan_synthesis()"
.venv\Scripts\python.exe -c "import tests.test_report_generation as t; t.test_report_generation()"
```

### Frontend Build & Lint Verification
```bash
cd frontend
npm run lint
npm run build
```

---

## Accessibility & Responsiveness Features

- **Keyboard Navigable:** Visible focus rings (`focus-visible:ring-2 focus-visible:ring-amber focus:outline-none`) across all interactive inputs, buttons, and tab controls.
- **Screen Reader Support:** Semantic HTML5 landmarks (`<header>`, `<main>`, `<nav>`, `<section>`), `aria-label` attributes on icon buttons, and descriptive image `alt` texts on all foliar specimens.
- **Mobile-First Design:** Touch targets $\ge 48\text{px}$, responsive camera capture triggers, horizontal scrolling sub-nav pill strips, and adaptive chart layouts.
- **Dark Mode Integration:** One-click animated theme switcher in Navbar, Dashboard, and Passport headers, backed by `localStorage` persistence and system `prefers-color-scheme` synchronization.

---

## License

MIT License. Developed for the agricultural empowerment of smallholder farming communities across Bangladesh.
