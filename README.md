# 🌿 Prakriti — Proactive Carbon Budget Platform for Urban India

[![Build & Test Status](https://github.com/akshayjadhav237237-cmd/Prakriti/actions/workflows/ci.yml/badge.svg)](https://github.com/akshayjadhav237237-cmd/Prakriti/actions/workflows/ci.yml)
[![License: Apache 2.0](https://img.shields.us/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Vitest Coverage](https://img.shields.us/badge/Coverage-100%25-brightgreen.svg)](tests/unit/calculators.test.ts)
[![Production Deploy](https://img.shields.us/badge/Deploy-Vercel-black.svg?logo=vercel)](https://prakriti-carbon.vercel.app)

**Prakriti** is a personal carbon accounting and budgeting platform tailored for urban Indian households. Inspired by YNAB (You Need A Budget), it utilizes a zero-based "envelope budgeting" methodology to allocate and manage weekly carbon footprints. Integrated with real-time Gemini AI OCR and a virtual companion ecosystem representing the endangered fauna of the Western Ghats, Prakriti helps users transition from passive footprints to proactive environmental stewardship.

---

## ✨ Features

- **📬 Zero-Based Envelope Budgeting:** Drag-adjust carbon envelopes (Transport, Food, Energy, Lifestyle) with real-world Indian equivalency text (e.g., hours of AC, Swiggy orders, scooter rides).
- **🐵 Western Ghats Virtual Companion:** Nurture a baby *Lion-Tailed Macaque* in a misty Shola forest parallax landscape. Earn Pebbles by remaining under budget and send your companion on wilderness exploration adventures.
- **📸 Gemini AI OCR Scanner:** Snap a photo of utility bills (Tata Power, MSEB, BESCOM), petrol receipts, Swiggy/Zomato orders, or groceries to dynamically calculate and deduct carbon footprints using Indian emission factors.
- **📊 Regional Benchmarks:** Compare your footprint in real-time against urban, national, global averages, and the Paris Agreement 1.5°C goal.
- **🍂 Seasonal Intention Banners:** Actionable seasonal prompts (Wedding Mode, AC Sharing in Summer, Diwali mode multipliers) that translate directly into implementation intentions.
- **♿ WCAG 2.1 AA Compliant:** Accessible focus rings, screen-reader hidden tables for data charts, skip links, and semantic structural components.
- **🔒 Cryptographic Security:** Built-in Content Security Policy (CSP) with request-level nonces to defend against XSS.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router, Server Actions, Route Handlers)
- **Styling:** Tailwind CSS & Framer Motion
- **AI Core:** Google Gemini 1.5 Flash Vision & Generative AI SDK
- **Database Wrapper:** Supabase JS Client + robust LocalStorage fallback
- **State Management:** Reactive LocalStorage event bindings
- **Testing:** Vitest & Happy-DOM with 100% code coverage
- **Formatting & Linting:** Prettier & ESLint

---

## 🚀 Quick Start

### 1. Prerequisites
Verify that Node.js (v18+) is installed. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
```
*Note: If Supabase variables are left empty, Prakriti will automatically fall back to its robust localStorage database mode.*

### 2. Install & Run
```bash
# Clone the repository
git clone https://github.com/akshayjadhav237237-cmd/Prakriti.git
cd Prakriti

# Install dependencies
npm install

# Run the dev server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 3. Tests & Audits
```bash
# Run unit tests (with coverage metrics)
npm run test

# Lint files
npm run lint

# Build production bundle
npm run build
```

---

## 📂 Project Architecture

```
Prakriti/
├── .antigravity/         # Development task checklists & plans
├── .github/              # GitHub Actions CI pipelines
├── src/
│   ├── app/
│   │   ├── api/          # Route handlers (Gemini OCR & advice)
│   │   ├── dashboard/    # Main YNAB bar, companion, action cards
│   │   ├── onboarding/   # Accessible profile setup
│   │   ├── scan/         # Gemini receipt scanner page
│   │   ├── layout.tsx    # Theme providers & navigation bar
│   │   └── globals.css   # Theme variables (light/dark mode)
│   ├── components/       # Common widgets (Navbar, ThemeProvider)
│   └── core/
│       ├── constants.ts  # CPCB, ARAI, BEE emission factors
│       ├── calculators.ts# Carbon footprints calculations
│       └── supabase.ts   # Supabase wrapper & offline localStorage mock
├── tests/                # Vitest comprehensive unit tests
├── METHODOLOGY.md        # Carbon accounting mathematical formulas
├── SECURITY.md           # Security threat model & CSP headers
└── LICENSE               # Apache 2.0 License terms
```

---

## 📜 Emission Accounting Methodology

Prakriti operates on rigorous, cited local parameters:
- **Electricity (Indian Grid):** `0.710 kg CO₂e / kWh` (Central Electricity Authority)
- **Petrol Scooter:** `0.0334 kg CO₂e / km` (ARAI)
- **Electric Scooter (Grid Charged):** `0.0120 kg CO₂e / km` (ARAI)
- **Ola/Uber Cab:** `0.1490 kg CO₂e / km` (ARAI average Dzire/Etios)
- **Swiggy/Zomato base charge:** `0.18 kg CO₂e` delivery factor
- For detailed formulas, refer to [METHODOLOGY.md](METHODOLOGY.md).

---

## ⚖️ License
Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.
