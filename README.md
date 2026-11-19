# Highlights — AI-Powered Daily Reflection & Accountability

Highlights is a full-stack social platform for logging the best parts of your day. Jot down a few unstructured highlights, and an AI pipeline scores your day, tags every entry, and updates your streaks automatically. Friends see your wins, and you build a searchable record of your life.

---

## Key Features

- 📝 **Frictionless Daily Logging**: Write free-form highlights. No forms, no categories to pick.
- 🤖 **AI Processing Pipeline**: One Gemini 2.5 Flash call returns a **daily score (1–10)**, **tags each highlight** from your own tag list, and **evaluates every streak condition**.
- 🔥 **Natural-Language Streaks**: Define a streak in plain English (`"I exercised"`, `"No junk food"`). The AI decides each day whether you met it. A default **Logged today** streak is always created.
- 🗓️ **Heatmap Calendar**: GitHub-style heatmap of every streak's history, with current and best streak counts.
- 👥 **Friends & Feed**: Send, accept and remove friend requests, then share a day's log to a friend feed.
- 🔍 **Search & Tag Filters**: Search past days by text and filter by tag chips.
- 🏷️ **Custom Tag Manager**: Own your taxonomy. The AI only picks from your tags and never invents new ones.
- 🔐 **Supabase Auth**: Auth-guarded routes via Next.js middleware.
- 📱 **Responsive Navigation**: Bottom nav on mobile, side nav on desktop.

---

## 🧠 How the AI Pipeline Works

```
Highlights[] + User Tags[] + Streak Conditions[]
                    │
                    ▼
        Gemini 2.5 Flash (JSON mode)
                    │
                    ▼
{ dailyScore, taggedHighlights[], streakResults[] }
                    │
                    ▼
   Saved to DayLog  →  Streaks updated  →  Shared to friend feed
```

The model is called with a strict system instruction and `responseMimeType: application/json`. Output is parsed and validated before anything is written. See [`src/lib/ai/pipeline.ts`](src/lib/ai/pipeline.ts) and [`src/lib/ai/prompts.ts`](src/lib/ai/prompts.ts).

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, Lucide icons |
| Database | PostgreSQL (Supabase) via Prisma ORM |
| Auth | Supabase Auth (`@supabase/ssr`) |
| AI | Google Gemini 2.5 Flash (`@google/generative-ai`) |

---

## 🚀 How to Build & Run

### Prerequisites
- **Node.js** 20+
- A **Supabase** project (Postgres + Auth)
- A **Gemini API key**

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Create a `.env` file in the project root:
```env
DATABASE_URL=postgresql://...        # pooled connection
DIRECT_URL=postgresql://...          # direct connection (migrations)
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
GEMINI_API_KEY=<gemini-key>
```

### 3. Set up the database
```bash
npx prisma generate
npx prisma db push
```

### 4. Run the dev server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### 5. Production build
```bash
npm run build && npm start
```

Lint with `npm run lint`.

---

## 🗄️ Data Model

| Model | Purpose |
|---|---|
| `User` | Profile, tags, friends, and sent/received friend requests |
| `DayLog` | One per user per day: highlights (JSON), AI daily score, share flag |
| `Streak` | Name, plain-English condition, current/best counts, date history |
| `FriendFeedItem` | Snapshot of a shared day log delivered to a friend |

---

## 🔌 API Routes

| Route | Description |
|---|---|
| `/api/log`, `/api/log/dates` | Create and read day logs, list logged dates |
| `/api/streaks`, `/api/streaks/[id]` | Manage streaks |
| `/api/tags`, `/api/tags/generate` | Manage tags, AI tag suggestions |
| `/api/friends/*` | Request, accept, respond, remove, list friends |
| `/api/search` | Search logs by text and tag |
| `/api/profile`, `/api/users` | Profile and user lookup |

---

## 🏗️ Architecture

```
HighlightsApp/
├── prisma/
│   └── schema.prisma          # User, DayLog, Streak, FriendFeedItem
└── src/
    ├── middleware.ts          # Auth guard for protected routes
    ├── app/
    │   ├── api/               # Route handlers (log, streaks, tags, friends, search, profile)
    │   ├── home/              # Today's log
    │   ├── feed/              # Friend feed
    │   ├── streaks/           # Streak dashboard
    │   ├── search/            # Search & tag filters
    │   └── profile/           # Profile, tags, friend requests
    ├── components/
    │   ├── log/               # HighlightInput, LogForm, TodayView
    │   ├── streaks/           # HeatmapCalendar, StreakCard, NewStreakModal
    │   ├── feed/              # FriendCard, FriendStreakCard, StreakDrawer
    │   ├── search/            # SearchBar, DayLogCard, TagFilterChips
    │   ├── profile/           # TagManager, FriendRequests
    │   └── nav/               # BottomNav, SideNav
    └── lib/
        ├── ai/                # Gemini pipeline & prompts
        ├── utils/             # Streak math, score roll helpers
        ├── auth.ts            # Auth helpers
        ├── prisma.ts          # Prisma client
        └── supabase.ts        # Supabase client
```
