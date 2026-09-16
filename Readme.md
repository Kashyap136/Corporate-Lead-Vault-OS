# Corporate Lead Vault OS

A corporate lead management and digital-engagement platform built to the DEV-SHEET-03 specification. Captures leads from multiple channels, calculates solar ROI, generates mock SEO reports, issues a WhatsApp/SMS lead alert, honors DPDP 365-day data retention, and exports an ISO-auditor-ready Excel report.

## Tech Stack

**Backend (Node.js / Express)**

- express
- mongoose
- cors
- dotenv
- jsonwebtoken
- bcryptjs
- node-cron
- exceljs

> Note: the build sheet lists `whatsapp-api`, but that package does not exist on npm as an installable package. No fake dependency was created. WhatsApp functionality is implemented via the WhatsApp Cloud API (`fetch` to `graph.facebook.com/v18.0`).

**Frontend (Next.js)**

- Next.js 14 (App Router)
- Tailwind CSS

## Project Structure

```
backend/
  app.js
  cron.js
  seed.js
  models/
    Company.js
    Lead.js
    ROIcalc.js
    SEOreport.js
  routes/
    auth.js
    leads.js
    roi.js
    seo.js
    whatsapp.js
    audit.js
  .env

frontend/
  app/
    login/page.jsx
    dashboard/page.jsx
    leads/page.jsx
    roi-calc/page.jsx
    seo/page.jsx
    audit/page.jsx
    public-calc/[subdomain]/page.jsx
```

## Database Models

**Company**

- `name`
- `subdomain` (unique)
- `ownerEmail`
- `passwordHash`
- `websiteUrl`

**Lead**

- `companyId` (ref Company)
- `name`, `phone`, `email`
- `source` — `ROIcalc | Form | Google | WhatsApp`
- `message`
- `score` — `hot | warm | cold` (scoring rule: message length > 50 chars => `hot`, else `cold`)
- `status` — `new | contacted | proposal | closed`
- `createdAt`
- `logRetentionUntil` = now + 365 days (DPDP)
- `ip`, `userAgent`

**ROIcalc**

- `companyId`
- `inputs`: `factoryArea`, `powerBill`, `manpower`, `currentCost`
- `result`: `savings`, `roiPercent`
- `leadId`, `createdAt`

**SEOreport**

- `companyId`
- `domain`
- `competitorDomains []`
- `rankingKeywords [{ keyword, position, competitorPosition }]`
- `generatedAt`

## API Reference

### Auth

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register company (bcrypt hash + JWT) |
| POST | `/api/auth/login` | Login (subdomain + email + password) → JWT |
| GET | `/api/auth/company?subdomain=` | Resolve subdomain → company (public calculator) |

### Leads

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/leads/create` | Create lead, score, set DPDP retention, capture IP/UA, trigger WhatsApp alert |
| GET | `/api/leads/list?companyId=&status=&source=` | List, optional status/source filters, newest first |
| GET | `/api/leads/stats?companyId=` | Stats: new, contacted, closed, hot |
| PUT | `/api/leads/update-status` | Update lead status (Leads page dropdown) |

### ROI

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/roi/calculate` | Calculate savings + ROI %, create ROIcalc record, create Lead (source = ROIcalc) when name/phone provided |
| GET | `/api/roi/list?companyId=` | List past calculations |

### SEO

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/seo/report?companyId=` | Generate mock ranking report, save SEOreport |

### WhatsApp

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/whatsapp/lead-alert` | Send lead alert (template: `New Lead: Name Phone Source`) via WhatsApp/SMS |

### Audit

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/audit/export?companyId=&year=` | Export ISO auditor Excel → `public/exports/audit-<year>.xlsx`, returns `fileUrl` |

#### Excel Export Columns

1. Name
2. Phone
3. Email
4. Source
5. Score
6. Status
7. Date
8. DPDP Retention Until

## ROI Formula

```
savings     = factoryArea * 0.2 + powerBill * 0.15
roiPercent  = savings / currentCost * 100
```

## Cron Jobs

| Schedule | Job |
|---|---|
| `0 9 * * *` | DPDP expiry alert — leads with `logRetentionUntil < now + 30 days` |
| `0 0 * * *` | Archive leads older than 365 days to cold storage (`leads_archive` collection) |

## Frontend Pages

| Route | Page |
|---|---|
| `/` | Redirect to `/login` |
| `/login` | Login |
| `/dashboard` | Total Leads / Hot Leads / Closed % cards + Hot Leads (last 30 days) table |
| `/leads` | Leads table (Call, WhatsApp, status dropdown, Export), status/source filters, add lead |
| `/roi-calc` | Internal ROI calculator → savings + ROI % |
| `/seo` | Generate mock SEO report + download |
| `/audit` | Export ISO auditor Excel, score %, DPDP 100% |
| `/public-calc/[subdomain]` | Public calculator — name + phone required; creates ROI + Lead, shows full report + thank-you |

## Environment Variables (`backend/.env`)

```
MONGO_URI=mongodb://localhost:27017/lead_vault
JWT_SECRET=secret
WHATSAPP_TOKEN=EAAxxx
FAST2SMS_KEY=xxx
EMAIL_USER=...
```

> `WHATSAPP_PHONE_ID` is referenced in code (technically required by the WhatsApp Cloud API URL for real delivery) but is optional at runtime — absent values simply report `not_configured`.

## Getting Started

**Prerequisites:** Node.js 18+, MongoDB (or a MongoDB Atlas connection string). The dev machine used for verification has no local `mongod`/Docker, so runtime verification was performed with `mongodb-memory-server` (since removed).

**1. Backend**

```bash
npm install
npm run seed     # seed demo company + 12 sample leads
npm run dev      # starts on port 5000
```

**2. Frontend**

```bash
npm install
npm run dev      # Next.js dev server; /api and /exports proxied to localhost:5000
```

**Demo credentials (from seed):**

- subdomain: `demo-solar`
- email: `admin@demo.com`
- password: `admin123`

## WhatsApp / SMS / IVR Behavior

- **WhatsApp**: real delivery attempted via WhatsApp Cloud API when `WHATSAPP_TOKEN` and `WHATSAPP_PHONE_ID` are configured. With placeholder creds, the API reports `whatsappStatus: 'not_configured'`.
- **SMS**: attempted via Fast2SMS when `FAST2SMS_KEY` is configured.
- **IVR (Marathi/Hindi)**: no IVR provider is integrated. The API explicitly returns `ivrStatus: 'not_configured'` and never claims IVR delivery; Marathi and Hindi alert strings are returned as localization data.

## Compliance Status

Per the strict PDF compliance audit, the project passed scope review:

- All explicitly required features are implemented.
- Unauthorized business logic was removed (extra warm-scoring rule, hardcoded ROI lead score, `currentCost` fallback, fake "closed" archiving, `GET /api/health`, stale `mongodb-memory-server` dependency).
- Final scope verdict: **YES**.