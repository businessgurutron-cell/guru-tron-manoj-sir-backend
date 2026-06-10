# Gurutron — Web (React + Express)

NEET / JEE / Board exam prep web app. Ported from the Expo prototype at
`artifacts/neet-jee-prep/` into a proper full-stack React web app with a
Supabase-swappable backend.

## Stack

- **Client**: Vite + React 18 + TypeScript + TailwindCSS + react-router-dom + lucide-react
- **Server**: Node + Express (ESM) with a pluggable storage adapter
- **Storage (default)**: JSON file at `server/data/db.json` (auto-created)
- **Storage (later)**: Supabase — stub adapter at `server/src/storage/supabase.js`

## Folder layout

```
gurutron-web/
├── client/          # Vite + React frontend (port 5173)
│   └── src/
│       ├── pages/          # Onboarding, Home, Quiz, QuizSession, Papers,
│       │                   # PaperGenerate, PaperView, Progress, Profile
│       ├── components/ui.tsx
│       ├── context/AppContext.tsx
│       ├── data/questions.ts
│       └── lib/            # api.ts, colors.ts, types.ts
└── server/          # Express API (port 4000)
    └── src/
        ├── index.js
        └── storage/
            ├── json.js       # default adapter (file-based)
            └── supabase.js   # stub — implement when wiring Supabase
```

## Features (parity with Expo prototype)

- Onboarding flow with role (Student / Teacher) + target exam (NEET / JEE / BOARD)
- Home — Student dashboard (streak, points, rank, avg, subjects, weak areas, daily tip)
- Home — Teacher dashboard (class avg, subject breakdown, top performers, need attention, all students)
- Quiz tab — filter by exam / subject, curated list with PYQ / HOT tags
- Quiz Session — intro → timed quiz → instant explanations → result with stats
- Papers tab — list with delete + view
- AI Paper Generator — exam / subject / topic / difficulty / type / count → generates from question bank
- Paper View — show / hide answers + explanations
- Progress — total / avg / best, subject performance bars, weak topics, recent attempts, badges
- Profile — edit name, switch role, switch exam, reset progress, re-onboard

## Admin Panel (content management)

Open `/admin/login` or click **Admin Login** on the onboarding screen.

- **Dashboard** — stats: total questions, breakdown by subject / exam / difficulty / source
- **Upload PDF** — drop a PDF → choose Heuristic or AI parser → review & tag extracted questions → save to bank
- **Questions** — list with search + filters (subject, exam, difficulty); inline edit / delete
- **Add Question** — manual form for entering questions one by one

### Default admin credentials

Set in `server/.env` (copied from `.env.example`):

```env
ADMIN_EMAIL=admin@gurutron.local
ADMIN_PASSWORD=changeme
```

Change these before deploying. Login returns a JWT stored in `localStorage` (`gurutron.adminToken`).

### PDF parsing

1. **Heuristic** (default, no API key needed): regex-based extraction. Works great for standard `Q1. ... (A) ... (B) ...` formats.
2. **AI parser** (Gemini Flash): more accurate on messy / image-heavy PDFs. Free tier available.

### Enable Gemini AI parser (free)

1. Get a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey) (no credit card needed).
2. Paste it into `server/.env`:
   ```env
   GEMINI_API_KEY=YOUR_KEY_HERE
   ```
3. Restart the server. The admin sidebar will show "AI parser: ready".

## Running locally (Windows)

```powershell
# from this folder (gurutron-web/)
npm install
npm --prefix server install
npm --prefix client install

# start client + server together
npm run dev
```

Then open http://localhost:5173 in your browser. The client proxies `/api/*`
to the Express server on port 4000 (see `client/vite.config.ts`).

> Tip: `npm run install:all` does all three installs in one go.

## Data storage

- Each browser gets a generated `userId` stored in `localStorage`
  (`gurutron.userId`). The client sends it via the `x-user-id` header.
- The server persists everything to `server/data/db.json` per user id.

## Switching to Supabase later

1. `cd server && npm i @supabase/supabase-js`
2. Implement methods in `server/src/storage/supabase.js` against your tables.
   Suggested schema is documented at the top of that file.
3. Copy `server/.env.example` → `server/.env`, set:

   ```env
   STORAGE=supabase
   SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   SUPABASE_ANON_KEY=YOUR-ANON-KEY
   ```

4. Restart the server. No client code changes needed — the API surface
   is the same.

## Scripts

Workspace root:

- `npm run dev` — runs client and server concurrently
- `npm run dev:client` / `npm run dev:server`
- `npm run build` — production build of the client
