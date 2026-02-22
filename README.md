# CampusQuest

**Your college life as an RPG.** Log real actions — gym, study, clubs, deep focus — and level up your character. Streaks, daily quests, boss battles (midterms/finals), and a social feed (The Quad). Instead of scrolling, you level up.

## Create & run the app

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev
```

## Build for production

```bash
npm run build
npm start
```

## What’s in the app

- **Character** — Name, avatar, level, total XP, and five stats: Strength, Stamina, Knowledge, Social, Focus.
- **Log it** — Tap activities (gym, study, club, deep focus, run, exam prep, group study, meditate) to earn XP and stat gains.
- **The Quad** — Social feed: post Field Notes with #rammarks, nod and rally on others’ posts.
- **Daily quests** — Complete activities to finish quests and claim bonus XP.
- **Boss battles** — Midterms, finals, and group projects with due dates and XP on defeat.
- **Streaks** — Log at least one activity per day to keep your streak.

Data is stored in the browser (localStorage) for the MVP.

## Python CLI (optional)

A standalone CLI version of the same game logic lives in `scripts/`. It uses a JSON file at the project root (`campusquest_data.json`) and supports multiple users, activities, boss battles, and streaks.

```bash
# From project root (Python 3.7+)
python scripts/campusquest_cli.py
```

The CLI and the web app use separate data (CLI = JSON file, web = localStorage); they are not synced.

## Stack

- **Next.js 14** (App Router), **React 18**, **TypeScript**, **Tailwind CSS**
