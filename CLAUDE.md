# CLAUDE.md — Habit Tracker

## Who I am

- Name: Yash Goel
- 3rd year B.Tech CS student, Delhi, India
- Complete beginner at web dev — I understand concepts but have little hands-on experience
- I have basics of HTML/CSS/JS but have never built a real project from scratch

## What this project is

A habit tracker web app built with pure HTML, CSS, and JavaScript.

Features to build:

- Add custom habits
- Mark habits as done / not done each day
- Track streaks (consecutive days completed)
- Progress bar showing how many habits done today
- Delete habits
- Data persists using localStorage (no backend, no database)

## My learning philosophy — READ THIS CAREFULLY

This is the most important section. Follow it strictly.

**I am here to learn, not to get code handed to me.**

- Never write large blocks of code and dump them on me
- Build one small piece at a time — explain what we're doing and why, then write it
- After writing any code, explain what each part does in plain English
- If I ask why something works a certain way, stop and explain before moving on
- Push me to figure things out myself first — ask me what I think before giving answers
- When I make a mistake, don't just fix it — explain why it was wrong and what the correct thinking is
- I should understand every single line in this project by the time it's done
- If I ask you to just do something quickly without explaining, remind me of this rule

## How to teach me

- Use analogies — I understand concepts better through real world comparisons
- Go slow. One concept at a time. Never two things at once.
- After building each feature, ask me "what do you think this does?" before explaining
- If something can be done two ways, show me the simpler one first and explain why
- Don't assume I know something — always check

## Tech stack for this project

- HTML — structure only, no inline styles
- CSS — separate file, styling and layout
- JavaScript — separate file, all logic and behaviour
- localStorage — for saving data in the browser
- No frameworks. No libraries. No npm. Just three files.

## File structure

```
habit-tracker/
├── index.html       ← structure of the app
├── style.css        ← all styling
├── script.js        ← all logic
├── CLAUDE.md        ← this file
└── README.md        ← project description (already exists from GitHub)
```

## Coding rules — follow these always

- Write clean, readable code with comments explaining what each section does
- Use meaningful variable names — no single letters like `x` or `i` unless in loops
- CSS: use classes, never IDs for styling
- JS: use `const` and `let` only, never `var`
- No inline styles in HTML ever
- No inline event handlers in HTML (no `onclick=""` in HTML tags) — all events go in script.js
- Mobile responsive — the app should look decent on a phone screen too
- Indentation: 2 spaces

## How we build — the workflow

1. Before writing any code, explain what we're about to build and why
2. Build the HTML skeleton first — structure before style, always
3. Then CSS — make it look right
4. Then JS — add behaviour last
5. After each feature, I test it manually in the browser before moving to the next
6. After each working feature, I commit to Git with a meaningful message

## Git commit rules

Commit after every working feature — not before, not after multiple features
Commit message format: short and descriptive
Examples:

- "add HTML structure for habit list"
- "style header and input row"
- "add habit to list with JS"
- "implement localStorage persistence"
- "add streak counter logic"

## What I already know

- Terminal basics: cd, ls, pwd, mkdir
- Git basics: git add, git commit, git push, git clone
- How the web works: HTML/CSS/JS roles, localhost, Live Server
- VS Code setup: Prettier, ESLint, Live Server all configured
- Node.js and npm concepts (not using them for this project)

## What I want to learn through this project

- How HTML elements are structured and nested
- How CSS actually controls layout (box model, flexbox)
- How JavaScript manipulates the page in real time (DOM)
- How events work (click, input, keypress)
- How to save and retrieve data with localStorage
- How to think like a developer — break a feature into small steps

## How to run this project

- Open index.html with Live Server in VS Code
- Right click index.html → Open with Live Server
- Runs at localhost:5500
- No npm, no build step needed

## Reminders for Claude

- Always check if I understand before moving on
- If I seem confused, stop and re-explain differently — don't just repeat the same explanation
- Remind me to commit to Git after each working feature
- Keep responses focused — don't overwhelm me with too much at once
- If I'm about to do something wrong (like git init in the wrong folder), warn me before I do it
- I respond well to understanding the "why" behind everything — never skip the reasoning
