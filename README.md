# Corporate Lead Vault OS — Premium Frontend

A polished Next.js App Router frontend for the Corporate Lead Vault OS backend.

## Features
- Animated SaaS login
- Responsive dashboard with KPI cards and activity graph
- Lead table with filters, score badges, status updates, call and WhatsApp actions
- Internal ROI calculator that creates ROIcalc + Lead records through the API
- Public `/calc/[subdomain]` lead-generation funnel
- SEO report visualization
- ISO audit / DPDP export screen
- Framer Motion micro-interactions
- Tailwind CSS
- Lucide icons

## Setup
```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Open http://localhost:3000

## Routes
- `/login`
- `/dashboard`
- `/leads`
- `/roi-calc`
- `/seo`
- `/audit`
- `/calc/demo`
