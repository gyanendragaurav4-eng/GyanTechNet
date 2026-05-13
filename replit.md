# GyanTechNet

A comprehensive all-in-one AI platform — a full replica of gyantechnet.com with 50+ workspace apps.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/gyantechnet run dev` — run the frontend (Vite, auto-port)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Tailwind CSS v4 + shadcn/ui + wouter routing
- Backend: Express 5 + OpenAI API
- Icons: react-icons/fi (Feather Icons only — do NOT use FiFolderOpen, FiUploadCloud, FiArchive, FiEdit3)
- Charts: Recharts
- Auth: Local (AuthContext + localStorage)

## Where things live

- `artifacts/gyantechnet/src/App.tsx` — all routes (50+ pages)
- `artifacts/gyantechnet/src/components/DashboardLayout.tsx` — sidebar with all apps
- `artifacts/gyantechnet/src/contexts/AuthContext.tsx` — auth state
- `artifacts/gyantechnet/src/pages/` — all 50+ page components
- `artifacts/api-server/src/routes/chat.ts` — OpenAI chat + content generation routes
- `artifacts/api-server/src/routes/index.ts` — route registration

## Architecture decisions

- Dark-only theme — `dark` class permanently on `<html>`, no light mode toggle
- Color palette: background `#06060f` (near black), sidebar `#08081a`, cards `#0d0d1e`, primary `hsl(262 84% 58%)` (#7c3aed purple)
- Animated star particles via CSS `::before`/`::after` in `.stars-bg` class (index.css)
- SVG circuit-board AI logo (GyanLogo/SidebarLogo components) matches gyantechnet.com's real logo style
- Auth is localStorage-based; protected routes redirect to /login if no user
- API server at path `/api`, frontend at path `/` via shared proxy
- OpenAI API key must be set as `OPENAI_API_KEY` secret for AI features to work

## Pages

- `/` → LandingPage (public, matches gyantechnet.com hero)
- `/login` → LoginPage (gradient tab toggle Sign In/Sign Up, matches real site)
- `/register` → RegisterPage (same style)
- `/chat` → ChatPage (11-mode AI chat with suggestion cards)
- All other routes → protected, redirect to /login if not authenticated

## Product

- Login/Register with dark GyanTechNet branding
- Left sidebar dashboard with 43 workspace apps + 4 developer tools
- AI Chat with 11 modes (Normal, Code, Creative, Research, Reasoning, etc.)
- Image AI, Video AI, Music AI, TTS, Translator (all powered by OpenAI)
- Productivity: Notes, Calendar, Tasks, Focus Timer, Projects, Forms, Slides, Sheets, Whiteboard
- Tools: Calculator, QR Generator, Weather, File Converter, Password Manager
- Analytics, Wiki, Research, Learn, Stories, Meet (video call), CRM, Invoices
- Music Player, API Tester, DB Manager, Live Cricket scoreboard
- Developer: API Keys, Settings, Gyan Intelligence (model config), Dev Console

## User preferences

- UPI payment ID "9162415380-3@ybl" must NEVER be shown on screen anywhere
- Dark theme only — #0d0d14 background, #7c3aed purple primary
- Always use `FiFolder` (not `FiFolderOpen`), `FiUpload` (not `FiUploadCloud`), `FiPackage` (not `FiArchive`), `FiEdit2` (not `FiEdit3`)

## Gotchas

- react-icons/fi does NOT export: FiFolderOpen, FiUploadCloud, FiArchive, FiEdit3, FiEdit4
- Vite module cache must be cleared (`rm -rf artifacts/gyantechnet/node_modules/.vite`) when icon imports fail to update
- OPENAI_API_KEY secret must be set for AI chat, translator, research, stories, and business tools to work

## Pointers

- See the `pnpm-workspace` skill for workspace structure
