# Personal Productivity Tracker (Local-Only)

A full-stack Next.js app for personal productivity tracking on localhost.

## Features
- Single-user local authentication (bcrypt hashed password in SQLite)
- Daily + custom-frequency task/habit tracking
- Quick unscheduled completion logging
- Daily completion progress + weekly trend chart
- Calorie tracking + weight tracking with trend charts
- Weekly calorie deficit/surplus analysis with feedback
- Minimal daily diary with date-based editing
- Settings for editable daily calorie target

## Tech
- Next.js (App Router)
- React
- Tailwind CSS
- SQLite (`better-sqlite3`)
- Recharts

## Run locally
```bash
npm install
npm run dev
```
Then open http://localhost:3000

## Notes
- Database file is created locally as `tracker.db`.
- Session signing uses `SESSION_SECRET`; defaults to a local dev secret if not set.
