# habit-tracker

# 🌱 Habit Tracker

A clean, personal habit tracking web app built with pure HTML, CSS, and JavaScript — no frameworks, no backend, no dependencies.

**[Live Demo →](https://habit-tracker-ten-blond.vercel.app/login.html)**

---

## What it does

- Add habits and mark them done each day
- Track streaks and see your longest run
- Navigate back through past dates to log missed days
- 90-day dot grid showing your overall consistency at a glance
- Graphs page with a per-habit completion rate and daily log
- Achievements system with unlockable badges
- Multi-user support — different accounts stay completely separate in the same browser
- All data saved locally in the browser, no account or server needed

---

## Screenshots

> Login page → Home → Graphs → Achievements

---

## Tech stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 (Flexbox, CSS variables) |
| Logic | Vanilla JavaScript (ES6+) |
| Storage | localStorage (browser-native) |
| Deployment | Vercel |

No npm. No build step. No libraries. Three files.

---

## Project structure

```
habit-tracker/
├── index.html      — main app shell and all modal markup
├── login.html      — sign in / sign up page
├── script.js       — all app logic (habits, streaks, graphs, achievements)
├── login.js        — auth logic (new user vs returning user detection)
├── style.css       — all styling for both pages
└── README.md       — this file
```

---

## How to run locally

```bash
git clone https://github.com/slash0403/habit-tracker.git
cd habit-tracker
```

Then open `login.html` with Live Server in VS Code.  
Right click `login.html` → **Open with Live Server** → runs at `localhost:5500`

No install step needed.

---

## How it works

**Auth** — when you sign up, your email becomes your unique key. All your habits and profile data are stored under `habitUser_yourEmail` in localStorage. Logging out just clears the active session — your data stays intact for next time.

**Streaks** — calculated by walking backwards from today. If today is done, check yesterday, and so on. The moment there's a gap, the streak stops.

**Dot grid** — shows 91 days starting from your sign-up date. Green = all habits done, yellow = partial, red = missed, grey = future. A habit only counts toward a day's dot if it existed on that day — adding a new habit today doesn't mark all previous days as missed.

**Date navigation** — you can go back to any past date and mark habits done retroactively. You can't go before your sign-up date.

---

## What I learned building this

- How HTML structure and semantic elements work
- CSS layout with Flexbox and how the box model behaves
- JavaScript DOM manipulation — creating, updating, and removing elements dynamically
- Event listeners — clicks, form submissions, input changes
- localStorage — reading, writing, and structuring data without a database
- Git workflow — branching, committing after each feature, pushing to GitHub
- Deploying a static site to Vercel

---

## Roadmap

- [ ] PWA support — installable on mobile
- [ ] Push notifications for reminders
- [ ] Data export to CSV
- [ ] Rebuild in Next.js with Supabase for real cloud sync

---

## Author

**Yash Goel** — 3rd year B.Tech CS, Delhi  
[GitHub](https://github.com/slash0403)
