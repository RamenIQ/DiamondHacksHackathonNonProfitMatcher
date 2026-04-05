# GrantMatcher

> Built for **DiamondHacks Hackathon**

GrantMatcher is an AI-powered platform that analyzes charities and non-profit organizations and connects them with grants whose giving history and interests best align with their mission. Think of it like a matchmaking service for nonprofit organizations so organizations can focus on what matters most.

---

## The Problem

Finding the right funding can be time-consuming challenges for non-profits and charities. Organizations often lack the resources to research hundreds of grant opportunities, match their mission to eligibility criteria, or craft personalized outreach. NonProfit Matcher hopes to be a solution to this by automating the process.

---

## How It Works

1. **Input Your Organization** — Fill out a short form with your non-profit's name, mission statement, cause area, state, and annual budget range.
2. **AI Matching** — The `/api/match` endpoint sends your profile to Claude, which analyzes it against a curated database of grants and foundations and returns the top 5 matches.
3. **Review Results** — Browse your matched grants with match scores, explanations, award ranges, and application links.
4. **Draft Outreach** — Select any match and the `/api/draft-email` endpoint generates a tailored outreach email ready to send.

---

## Features

- **AI-Powered Grant Matching** — Enter your organization's name, mission, cause area, state, and budget range to get your top 5 matched grants with percentage of how much of match they are with your org.
- **Smart Match Scoring** — Each result includes a 1–100 compatibility score and a plain-language explanation of why the grant is a strong fit.
- **Detailed Grant Profiles** — View award ranges, geographic focus, eligibility requirements, focus areas, and direct application links.
- **Outreach Email Drafting** — Automatically generates a personalized, and professional outreach email for any matched grant.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript / JavaScript |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| AI Engine | [Anthropic Claude](https://anthropic.com) (`claude-opus-4-6`) via `@anthropic-ai/sdk` |
| Data | Local JSON datasets (grants, foundations) |
| Data Prep | Python (`data.py`) |

---

## Project Structure
```
DiamondHacksHackathonNonProfitMatcher/
├── data/                        # Raw grant & foundation data (JSON)
├── data.py                      # Python script for data preparation
└── nonprofit-matcher/           # Main Next.js application
    ├── app/
    │   ├── api/
    │   │   ├── match/           # POST /api/match — AI grant matching endpoint
    │   │   └── draft-email/     # POST /api/draft-email — AI email drafting endpoint
    │   ├── results/             # Results page (matched grants)
    │   ├── outreach/            # Outreach page (draft & view emails)
    │   ├── page.tsx             # Home / intake form
    │   └── globals.css
    ├── components/              # Reusable UI components
    └── data/                    # Foundations dataset used by API routes
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/RamenIQ/DiamondHacksHackathonNonProfitMatcher.git
   cd DiamondHacksHackathonNonProfitMatcher/nonprofit-matcher
```

2. **Install dependencies**
```bash
   npm install
```

3. **Set up your environment variables**

   Create a `.env.local` file in the `nonprofit-matcher/` directory:
```env
   ANTHROPIC_API_KEY=your_api_key_here
```

4. **Run the development server**
```bash
   npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

From the `nonprofit-matcher/` directory:
```bash
npm run dev      # Start the development server
npm run build    # Build for production
npm run start    # Start the production server
npm run lint     # Run ESLint
```

---

## Contributors

- Rehman Iqbal
- Daniyal Khan

---
