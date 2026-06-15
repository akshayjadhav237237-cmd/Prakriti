<div align="center">

<br />

```
██████╗ ██████╗  █████╗ ██╗  ██╗██████╗ ██╗████████╗██╗
██╔══██╗██╔══██╗██╔══██╗██║ ██╔╝██╔══██╗██║╚══██╔══╝██║
██████╔╝██████╔╝███████║█████╔╝ ██████╔╝██║   ██║   ██║
██╔═══╝ ██╔══██╗██╔══██║██╔═██╗ ██╔══██╗██║   ██║   ██║
██║     ██║  ██║██║  ██║██║  ██╗██║  ██║██║   ██║   ██║
 ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝   ╚═╝   ╚═╝  *
```

### **Proactive Carbon Budget Platform for Urban India**

*From passive footprints → to proactive stewardship*

<br />

[![Live Demo](https://img.shields.io/badge/🌿_Live_Demo-prakriti--carbon.vercel.app-00FF41?style=for-the-badge&labelColor=0a0a0a)](https://prakriti-carbon.vercel.app)

<br />

[![Build Status](https://github.com/akshayjadhav237237-cmd/Prakriti/actions/workflows/ci.yml/badge.svg)](https://github.com/akshayjadhav237237-cmd/Prakriti/actions/workflows/ci.yml)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg)](tests/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)](https://nextjs.org)
[![Powered by Gemini](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-4285F4?logo=google)](https://ai.google.dev)

<br />

</div>

---

## 🌿 What is Prakriti?

**Prakriti** *(Sanskrit: प्रकृति — "nature")* is a personal carbon accounting platform built for urban Indian households. Inspired by the zero-based budgeting philosophy of YNAB, it turns your weekly carbon footprint into a manageable, visual budget — complete with AI-powered receipt scanning, a virtual endangered-species companion, and real Indian emission factors sourced from CPCB, ARAI, and BEE.

> *"You can't manage what you can't measure — but Prakriti makes measuring beautiful."*

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 📬 Zero-Based Carbon Envelopes
Drag-adjust four budget envelopes — **Transport, Food, Energy, Lifestyle** — with real-world Indian equivalency text so you know exactly what a reduction means in your daily life (hours of AC, Swiggy orders, scooter rides).

</td>
<td width="50%">

### 📸 Gemini AI OCR Scanner
Snap a photo of any Indian utility bill (Tata Power, MSEB, BESCOM), petrol receipt, or Swiggy/Zomato order. Gemini Vision extracts the numbers and deducts the carbon footprint automatically.

</td>
</tr>
<tr>
<td width="50%">

### 🐒 Western Ghats Companion
Nurture a baby *Lion-Tailed Macaque* in a misty Shola forest parallax landscape. Earn **Pebbles** by staying under budget and send your companion on wilderness adventures.

</td>
<td width="50%">

### 📊 Regional Benchmarks
See your footprint stacked against **urban Indian, national, global averages**, and the Paris Agreement **1.5°C goal** — in real time, every week.

</td>
</tr>
<tr>
<td width="50%">

### 🍂 Seasonal Intention Banners
Actionable, season-aware prompts — **Wedding Mode, Diwali Multipliers, AC-Sharing Summer** — that translate carbon data into implementation intentions you can actually act on.

</td>
<td width="50%">

### 🔒 Security & Accessibility
**WCAG 2.1 AA** compliant — focus rings, skip links, screen-reader tables. **CSP nonces** on every request for XSS protection. Built to last.

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 — App Router, Server Actions, Route Handlers |
| **Styling** | Tailwind CSS + Framer Motion animations |
| **Typography** | Cormorant Garamond (headings) · Space Grotesk (body) |
| **AI Core** | Google Gemini 1.5 Flash Vision + Generative AI SDK |
| **Database** | Supabase JS Client + localStorage offline fallback |
| **Testing** | Vitest + Happy-DOM · 100% code coverage |
| **Linting** | ESLint + Prettier |
| **Deployment** | Vercel (Edge CDN, global) |

---

## 🚀 Quick Start

### Prerequisites

Node.js `v18+` is required. Create a `.env.local` file:

```env
GEMINI_API_KEY=your-gemini-api-key

# Optional — falls back to localStorage if omitted
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Install & Run

```bash
# Clone
git clone https://github.com/akshayjadhav237237-cmd/Prakriti.git
cd Prakriti

# Install
npm install

# Develop
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the app is live.

### Other Commands

```bash
npm run test      # Unit tests with coverage
npm run lint      # ESLint check
npm run build     # Production bundle
```

---

## 📂 Project Structure

```
Prakriti/
├── public/
│   └── hero-bg.mp4           # Hero background video (Vercel CDN)
│
├── src/
│   ├── app/
│   │   ├── api/              # Route Handlers
│   │   │   ├── scan/         # Gemini OCR endpoint
│   │   │   ├── insights/     # AI insight generation
│   │   │   └── debug/        # Debug utilities
│   │   │
│   │   ├── dashboard/        # Main YNAB budget dashboard
│   │   ├── budget/           # Carbon envelope management
│   │   ├── scan/             # Receipt scanner UI
│   │   ├── log/              # Activity log & history
│   │   ├── insights/         # AI-powered insights page
│   │   ├── ecosystem/        # Western Ghats companion
│   │   ├── track/            # Carbon tracking
│   │   ├── onboarding/       # First-run setup flow
│   │   ├── layout.tsx        # Root layout + ThemeProvider
│   │   └── globals.css       # Design tokens & theme vars
│   │
│   ├── components/
│   │   ├── Navbar.tsx        # Floating pill navigation
│   │   └── ThemeProvider.tsx # next-themes wrapper
│   │
│   └── core/
│       ├── constants.ts      # Emission factors (CPCB/ARAI/BEE — do not modify without citation)
│       ├── calculators.ts    # Carbon footprint calculation engine
│       └── supabase.ts       # DB wrapper + localStorage mock
│
├── tests/                    # Vitest unit tests (100% coverage)
├── METHODOLOGY.md            # Full emission accounting formulas
├── SECURITY.md               # CSP threat model & security headers
└── LICENSE                   # Apache 2.0
```

---

## 📐 Emission Methodology

Prakriti uses rigorous, India-specific emission factors — **not global averages**.

| Source | Factor | Authority |
|--------|--------|-----------|
| Indian Grid Electricity | `0.710 kg CO₂e / kWh` | Central Electricity Authority (CEA) |
| Petrol Scooter | `0.0334 kg CO₂e / km` | ARAI |
| Electric Scooter (grid charged) | `0.0120 kg CO₂e / km` | ARAI |
| Ola / Uber Cab | `0.1490 kg CO₂e / km` | ARAI (Dzire/Etios avg) |
| Swiggy / Zomato delivery | `0.18 kg CO₂e / order` | Delivery factor |

> Full mathematical derivations in [METHODOLOGY.md](METHODOLOGY.md).
> 
> ⚠️ **Do not modify** `src/core/constants.ts` emission factors without citing a peer-reviewed or government source.

---

## 🗺️ Roadmap

- [x] Zero-based carbon envelope budgeting
- [x] Gemini AI OCR receipt scanner
- [x] Western Ghats companion ecosystem
- [x] Regional benchmark comparisons
- [x] Seasonal intention banners
- [x] WCAG 2.1 AA accessibility
- [x] CSP nonce security
- [ ] Push notifications for weekly budget resets
- [ ] Household multi-user mode
- [ ] Offline PWA mode
- [ ] WhatsApp bot integration for rural users

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

Please ensure `npm run test` and `npm run lint` pass before submitting.

---

## ⚖️ License

Licensed under the **Apache License 2.0** — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with 🌿 for a greener India**

[prakriti-carbon.vercel.app](https://prakriti-carbon.vercel.app) · [Report a Bug](https://github.com/akshayjadhav237237-cmd/Prakriti/issues) · [Request a Feature](https://github.com/akshayjadhav237237-cmd/Prakriti/issues)

</div>
