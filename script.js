// ════════════════════════════════════════
//  HABIT TRACKER — main script
// ════════════════════════════════════════


// ════════════════════════════════════════
//  AUTH — multi-user
//  All data is stored under the user's email as the key so multiple
//  people can use the same browser and keep their data separate.
//  Keys used:
//    habitUser_${email}  → profile object { name, email, startDate, dob, bio }
//    habitData_${email}  → array of habit objects
//    currentUserEmail    → which user is currently logged in
// ════════════════════════════════════════

const currentUserEmail = localStorage.getItem('currentUserEmail');

if (!currentUserEmail) {
  window.location.href = 'login.html';
}

function loadUserProfile() {
  const stored = localStorage.getItem('habitUser_' + currentUserEmail);
  if (stored) return JSON.parse(stored);
  // Fallback in case profile was lost somehow
  return { name: '', email: currentUserEmail, startDate: toDateKey(new Date()), dob: '', bio: '' };
}

function saveUserProfile(profile) {
  localStorage.setItem('habitUser_' + currentUserEmail, JSON.stringify(profile));
}

function loadHabits() {
  const stored = localStorage.getItem('habitData_' + currentUserEmail);
  return stored ? JSON.parse(stored) : [];
}

function saveHabits(habits) {
  localStorage.setItem('habitData_' + currentUserEmail, JSON.stringify(habits));
}


// ════════════════════════════════════════
//  DATE HELPERS
//  IMPORTANT: always use local date methods, never toISOString().
//  toISOString() converts to UTC which shifts dates backward in IST (UTC+5:30).
// ════════════════════════════════════════

function toDateKey(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

function addDays(dateKey, n) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + n);
  return toDateKey(date);
}

const realTodayKey = toDateKey(new Date());

// The user's tracking start date — comes from when they signed up.
// The back button cannot go before this date.
const userProfile  = loadUserProfile();
const appStartDate = userProfile.startDate || realTodayKey;


// ════════════════════════════════════════
//  MOTIVATION QUOTES
// ════════════════════════════════════════

const quotes = [
  "Small steps every day.",
  "Discipline is choosing between what you want now and what you want most.",
  "You don't rise to the level of your goals, you fall to the level of your systems.",
  "Show up. That's half the battle.",
  "Every habit is a vote for the person you want to become.",
  "Win the morning, win the day.",
  "Be consistent. Results follow.",
  "The secret of getting ahead is getting started.",
];

document.querySelector('.motivation-quote').textContent =
  quotes[Math.floor(Math.random() * quotes.length)];


// ════════════════════════════════════════
//  ACTIVE DATE
// ════════════════════════════════════════

let activeDate = realTodayKey;

function updateDateSwitcherUI() {
  const isToday = activeDate === realTodayKey;
  const isStart = activeDate === appStartDate;

  document.getElementById('active-date-label').textContent =
    isToday ? 'Today' : formatDisplayDate(activeDate);
  document.getElementById('active-date-value').textContent =
    isToday ? realTodayKey : activeDate;

  // Show "Back to Today" only when not on today
  const backBtn = document.getElementById('back-to-today');
  if (isToday) backBtn.classList.add('hidden');
  else         backBtn.classList.remove('hidden');

  // Dim the back button when we're at the start date — can't go further back
  const prevBtn = document.getElementById('prev-date');
  if (isStart) {
    prevBtn.style.opacity = '0.35';
    prevBtn.style.cursor  = 'not-allowed';
  } else {
    prevBtn.style.opacity = '';
    prevBtn.style.cursor  = '';
  }
}

document.getElementById('prev-date').addEventListener('click', function() {
  // Block navigation before the user's tracking start date
  if (activeDate <= appStartDate) return;
  activeDate = addDays(activeDate, -1);
  updateDateSwitcherUI();
  renderHabits();
});

document.getElementById('next-date').addEventListener('click', function() {
  activeDate = addDays(activeDate, 1);
  updateDateSwitcherUI();
  renderHabits();
});

document.getElementById('back-to-today').addEventListener('click', function() {
  activeDate = realTodayKey;
  updateDateSwitcherUI();
  renderHabits();
});


// ════════════════════════════════════════
//  NAVIGATION
// ════════════════════════════════════════

const navButtons   = document.querySelectorAll('.nav-btn');
const pageSections = document.querySelectorAll('.page-section');

navButtons.forEach(function(button) {
  button.addEventListener('click', function() {
    const target = button.dataset.section;

    pageSections.forEach(function(s) { s.classList.add('hidden'); });
    document.getElementById(target).classList.remove('hidden');

    navButtons.forEach(function(b) { b.classList.remove('active-nav'); });
    button.classList.add('active-nav');

    if (target === 'graphs')       renderGraphs();
    if (target === 'achievements') renderAchievements();
  });
});


// ════════════════════════════════════════
//  STREAK CALCULATORS
// ════════════════════════════════════════

function calculateStreak(completedDates) {
  let streak  = 0;
  let current = realTodayKey;
  for (let i = 0; i < 365; i++) {
    if (completedDates.includes(current)) {
      streak++;
      current = addDays(current, -1);
    } else {
      break;
    }
  }
  return streak;
}

function calculateBestStreak(completedDates) {
  if (completedDates.length === 0) return 0;
  const sorted = [...completedDates].sort();
  let best    = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i]) - new Date(sorted[i - 1])) / 86400000;
    if (diff === 1) { current++; if (current > best) best = current; }
    else current = 1;
  }
  return best;
}

function calculateAllHabitsBestStreak(habits) {
  if (habits.length === 0) return 0;
  let best   = 0;
  let run    = 0;
  let cursor = appStartDate;
  while (cursor <= realTodayKey) {
    // Only count habits that were active on this day
    const active   = getActiveHabitsForDate(habits, cursor);
    const allDone  = active.length > 0 &&
                     active.every(function(h) { return h.completedDates.includes(cursor); });
    if (allDone) { run++; if (run > best) best = run; }
    else run = 0;
    cursor = addDays(cursor, 1);
  }
  return best;
}


// ════════════════════════════════════════
//  ACTIVE HABITS FILTER
//  A habit is "active" on a given day only if its startDate is on or before
//  that day.  This prevents habits added today from ruining yesterday's dots.
// ════════════════════════════════════════

function getActiveHabitsForDate(habits, dateKey) {
  return habits.filter(function(h) {
    const habitStart = h.startDate || appStartDate;
    return habitStart <= dateKey;
  });
}


// ════════════════════════════════════════
//  DOT GRID — 91 dots from appStartDate
//  Each dot's status is based only on habits active on that day.
//  Today's dot gets a purple highlight ring.
// ════════════════════════════════════════

function renderDotGrid(habits) {
  const dotGrid = document.getElementById('dot-grid');
  dotGrid.innerHTML = '';

  for (let offset = 0; offset < 91; offset++) {
    const dotKey = addDays(appStartDate, offset);
    const dot    = document.createElement('div');
    dot.classList.add('dot');
    dot.title = formatDisplayDate(dotKey);

    if (dotKey === realTodayKey) dot.classList.add('today');

    if (dotKey > realTodayKey) {
      dot.classList.add('future');
    } else {
      // Only consider habits that existed on this day
      const active = getActiveHabitsForDate(habits, dotKey);

      if (active.length === 0) {
        // No habits were being tracked on this day yet
        dot.classList.add('default');
      } else {
        const done = active.filter(function(h) {
          return h.completedDates.includes(dotKey);
        }).length;

        if      (done === active.length) dot.classList.add('green');
        else if (done > 0)               dot.classList.add('yellow');
        else                             dot.classList.add('red');
      }
    }

    dotGrid.appendChild(dot);
  }
}


// ════════════════════════════════════════
//  PROGRESS BAR
//  Also uses getActiveHabitsForDate so past dates only show
//  habits that existed at that time.
// ════════════════════════════════════════

function renderProgressBar(habits) {
  const activeHabits = getActiveHabitsForDate(habits, activeDate);
  const total        = activeHabits.length;
  const done         = activeHabits.filter(function(h) {
    return h.completedDates.includes(activeDate);
  }).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  document.querySelector('.progress-count').textContent = `${done} / ${total}`;
  document.querySelector('.progress-sublabel').textContent =
    (activeDate === realTodayKey ? "Today's" : formatDisplayDate(activeDate)) + ' habits done';
  document.querySelector('.progress-bar-fill').style.width = percent + '%';
  document.querySelector('.progress-percent').textContent  = percent + '%';
}


// ════════════════════════════════════════
//  RENDER HABITS
// ════════════════════════════════════════

function renderHabits() {
  const habits     = loadHabits();
  const habitsList = document.querySelector('.habits-list');
  habitsList.innerHTML = '';

  if (habits.length === 0) {
    habitsList.innerHTML = `
      <div class="empty-state">
        <span class="empty-state-icon">🌱</span>
        <h3>No habits yet</h3>
        <p>Add your first habit above and start building your streak today.</p>
      </div>
    `;
    renderProgressBar(habits);
    renderDotGrid(habits);
    return;
  }

  habits.forEach(function(habit) {
    const isDone = habit.completedDates.includes(activeDate);
    const streak = calculateStreak(habit.completedDates);
    const isHot  = streak >= 3;

    const card = document.createElement('div');
    card.classList.add('habit-card');
    if (isDone)          card.classList.add('done');
    if (isHot && !isDone) card.classList.add('streak-hot');

    const streakText  = streak > 0 ? `🔥 ${streak} day streak` : 'No streak yet';
    const descPreview = habit.description
      ? `<span class="habit-desc-preview">${habit.description}</span>`
      : '';

    card.innerHTML = `
      <div class="habit-checkbox ${isDone ? 'checked' : ''}" data-id="${habit.id}">
        ${isDone ? '&#10003;' : ''}
      </div>
      <div class="habit-info" data-id="${habit.id}">
        <div class="habit-name">${habit.name}</div>
        <div class="habit-meta">
          <span class="habit-streak">${streakText}</span>
          ${descPreview}
          <span class="habit-open-hint">tap to edit ›</span>
        </div>
      </div>
      <button class="habit-delete" data-id="${habit.id}">&#10005;</button>
    `;

    habitsList.appendChild(card);
  });

  renderProgressBar(habits);
  renderDotGrid(habits);
  attachHabitEvents();
}


// ════════════════════════════════════════
//  ADD HABIT — opens a modal first so the user
//  can set start date and goal date before saving.
// ════════════════════════════════════════

const addHabitModal = document.getElementById('add-habit-modal');

document.querySelector('.add-habit-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const input     = document.querySelector('.add-habit-form input');
  const habitName = input.value.trim();
  if (!habitName) return;

  // Pre-fill the modal and open it — don't add the habit yet
  document.getElementById('new-habit-name').value  = habitName;
  document.getElementById('new-habit-start').value = realTodayKey;
  document.getElementById('new-habit-start').min   = appStartDate;  // can't start before app start
  document.getElementById('new-habit-goal').value  = '';
  document.getElementById('new-habit-desc').value  = '';

  addHabitModal.classList.remove('hidden');
  document.getElementById('new-habit-name').focus();
});

document.getElementById('add-habit-modal-close').addEventListener('click', function() {
  addHabitModal.classList.add('hidden');
});

addHabitModal.addEventListener('click', function(event) {
  if (event.target === addHabitModal) addHabitModal.classList.add('hidden');
});

document.getElementById('new-habit-save').addEventListener('click', function() {
  const name = document.getElementById('new-habit-name').value.trim();
  if (!name) return;

  const startDate = document.getElementById('new-habit-start').value || realTodayKey;
  const goalDate  = document.getElementById('new-habit-goal').value  || '';
  const desc      = document.getElementById('new-habit-desc').value.trim();

  const habits = loadHabits();
  habits.push({
    id:             Date.now(),
    name:           name,
    description:    desc,
    startDate:      startDate,
    goalDate:       goalDate,
    reminder:       false,
    reminderTime:   '08:00',
    completedDates: [],
  });

  saveHabits(habits);

  // Clear the form input and close the modal
  document.querySelector('.add-habit-form input').value = '';
  addHabitModal.classList.add('hidden');
  renderHabits();
});


// ════════════════════════════════════════
//  TOGGLE DONE & DELETE
// ════════════════════════════════════════

function attachHabitEvents() {
  document.querySelectorAll('.habit-checkbox').forEach(function(checkbox) {
    checkbox.addEventListener('click', function() {
      const id     = Number(checkbox.dataset.id);
      const habits = loadHabits();
      const habit  = habits.find(function(h) { return h.id === id; });

      if (habit.completedDates.includes(activeDate)) {
        habit.completedDates = habit.completedDates.filter(function(d) { return d !== activeDate; });
      } else {
        habit.completedDates.push(activeDate);
      }

      saveHabits(habits);
      renderHabits();
    });
  });

  document.querySelectorAll('.habit-info').forEach(function(info) {
    info.addEventListener('click', function() {
      openHabitModal(Number(info.dataset.id));
    });
  });

  document.querySelectorAll('.habit-delete').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const id     = Number(btn.dataset.id);
      const habits = loadHabits();
      saveHabits(habits.filter(function(h) { return h.id !== id; }));
      renderHabits();
    });
  });
}


// ════════════════════════════════════════
//  HABIT DETAIL MODAL
// ════════════════════════════════════════

const habitModal = document.getElementById('habit-modal');
let editingHabitId = null;

function openHabitModal(habitId) {
  const habits = loadHabits();
  const habit  = habits.find(function(h) { return h.id === habitId; });
  if (!habit) return;

  editingHabitId = habitId;

  document.getElementById('habit-modal-title').textContent = habit.name;
  document.getElementById('habit-desc').value              = habit.description  || '';
  document.getElementById('habit-start-date').value        = habit.startDate    || realTodayKey;
  document.getElementById('habit-start-date').min          = appStartDate;
  document.getElementById('habit-goal-date').value         = habit.goalDate     || '';

  const toggle = document.getElementById('habit-reminder-toggle');
  toggle.checked = habit.reminder || false;
  document.getElementById('habit-reminder-time').value = habit.reminderTime || '08:00';

  const timeSection = document.getElementById('reminder-time-section');
  if (habit.reminder) timeSection.classList.remove('hidden');
  else                timeSection.classList.add('hidden');

  renderHabitDetailDots(habit);
  habitModal.classList.remove('hidden');
}

document.getElementById('habit-reminder-toggle').addEventListener('change', function() {
  const timeSection = document.getElementById('reminder-time-section');
  if (this.checked) timeSection.classList.remove('hidden');
  else              timeSection.classList.add('hidden');
});

document.getElementById('habit-modal-close').addEventListener('click', function() {
  habitModal.classList.add('hidden');
  editingHabitId = null;
});

habitModal.addEventListener('click', function(event) {
  if (event.target === habitModal) {
    habitModal.classList.add('hidden');
    editingHabitId = null;
  }
});

document.getElementById('habit-modal-save').addEventListener('click', function() {
  if (!editingHabitId) return;

  const habits = loadHabits();
  const habit  = habits.find(function(h) { return h.id === editingHabitId; });
  if (!habit) return;

  habit.description  = document.getElementById('habit-desc').value.trim();
  habit.startDate    = document.getElementById('habit-start-date').value || realTodayKey;
  habit.goalDate     = document.getElementById('habit-goal-date').value  || '';
  habit.reminder     = document.getElementById('habit-reminder-toggle').checked;
  habit.reminderTime = document.getElementById('habit-reminder-time').value;

  saveHabits(habits);
  habitModal.classList.add('hidden');
  editingHabitId = null;
  renderHabits();
});

// Habit detail dots: from habit's startDate to goalDate (or +90 days).
// Past = green/red, future = dimmed, today = ring.
function renderHabitDetailDots(habit) {
  const container = document.getElementById('habit-detail-dots');
  const label     = document.getElementById('habit-detail-dots-label');
  container.innerHTML = '';

  const startKey = habit.startDate || realTodayKey;

  let endKey = habit.goalDate && habit.goalDate > startKey
    ? habit.goalDate
    : addDays(startKey, 89);

  // Cap at 180 days to keep the modal usable
  const maxEndKey = addDays(startKey, 179);
  if (endKey > maxEndKey) endKey = maxEndKey;

  label.textContent =
    'Progress — ' + formatDisplayDate(startKey) + ' → ' + formatDisplayDate(endKey);

  let cursor = startKey;
  while (cursor <= endKey) {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    dot.title = formatDisplayDate(cursor);

    if (cursor > realTodayKey) {
      dot.classList.add('future');
    } else {
      dot.classList.add(habit.completedDates.includes(cursor) ? 'green' : 'red');
    }

    if (cursor === realTodayKey) dot.classList.add('today');

    container.appendChild(dot);
    cursor = addDays(cursor, 1);
  }
}


// ════════════════════════════════════════
//  GRAPHS
// ════════════════════════════════════════

function renderGraphs() {
  const habits    = loadHabits();
  const container = document.getElementById('graphs-content');
  container.innerHTML = '';

  if (habits.length === 0) {
    container.innerHTML = '<p class="placeholder-text">Add some habits first to see your graphs.</p>';
    return;
  }

  // ── Stats overview ──
  const totalCompletions = habits.reduce(function(s, h) { return s + h.completedDates.length; }, 0);
  const bestStreak       = calculateAllHabitsBestStreak(habits);

  let perfectDays = 0;
  let cursor = appStartDate;
  while (cursor <= realTodayKey) {
    const active = getActiveHabitsForDate(habits, cursor);
    if (active.length > 0 && active.every(function(h) { return h.completedDates.includes(cursor); })) {
      perfectDays++;
    }
    cursor = addDays(cursor, 1);
  }

  const statsCard = document.createElement('div');
  statsCard.classList.add('graph-card');
  statsCard.innerHTML = `
    <h3>Overview</h3>
    <div class="stats-row">
      <div class="stat-box">
        <div class="stat-value">${habits.length}</div>
        <div class="stat-label">Total Habits</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${totalCompletions}</div>
        <div class="stat-label">Check-ins</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${bestStreak}</div>
        <div class="stat-label">Best Streak</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${perfectDays}</div>
        <div class="stat-label">Perfect Days</div>
      </div>
    </div>
  `;
  container.appendChild(statsCard);

  // ── Main line graph ──
  const lineCard = document.createElement('div');
  lineCard.classList.add('graph-card');
  lineCard.innerHTML = `
    <h3>Habits Completed Per Day</h3>
    <div class="line-graph-wrap">${buildLineGraphSVG(habits)}</div>
  `;
  container.appendChild(lineCard);

  // ── Per-habit card: completion rate bar + daily bar chart ──
  habits.forEach(function(habit) {
    const habitStart = habit.startDate || appStartDate;

    let habitDays = 0;
    let c = habitStart;
    while (c <= realTodayKey) { habitDays++; c = addDays(c, 1); }

    const done    = habit.completedDates.length;
    const percent = habitDays === 0 ? 0 : Math.round((done / habitDays) * 100);
    const streak  = calculateStreak(habit.completedDates);
    const best    = calculateBestStreak(habit.completedDates);

    let barsHTML = '';
    c = habitStart;
    while (c <= realTodayKey) {
      const wasDone = habit.completedDates.includes(c);
      barsHTML += `<div class="mini-bar ${wasDone ? 'done' : 'miss'}" title="${c}"></div>`;
      c = addDays(c, 1);
    }

    const habitCard = document.createElement('div');
    habitCard.classList.add('habit-graph-card');
    habitCard.innerHTML = `
      <div class="habit-graph-name">${habit.name}</div>
      <div class="habit-graph-stats">
        ${done} days done &nbsp;·&nbsp; 🔥 ${streak} now &nbsp;·&nbsp; best ${best}
      </div>

      <div class="habit-graph-label">Completion Rate — ${percent}%</div>
      <div class="progress-bar-bg" style="margin-bottom:18px">
        <div class="progress-bar-fill" style="width:${percent}%"></div>
      </div>

      <div class="habit-graph-label">Daily Log (since ${formatDisplayDate(habitStart)})</div>
      <div class="mini-bar-chart">${barsHTML}</div>
    `;
    container.appendChild(habitCard);
  });
}

// SVG line graph — pure SVG, no libraries.
// x axis = days since appStartDate, y axis = habits completed that day.
function buildLineGraphSVG(habits) {
  const points = [];
  let cursor = appStartDate;
  while (cursor <= realTodayKey) {
    const active = getActiveHabitsForDate(habits, cursor);
    const done   = active.filter(function(h) { return h.completedDates.includes(cursor); }).length;
    points.push({ key: cursor, done: done, max: active.length });
    cursor = addDays(cursor, 1);
  }

  if (points.length < 2) {
    return '<p style="color:#3a3a70;font-size:13px;padding:16px 0">Not enough data yet — check back tomorrow!</p>';
  }

  const W = 700, H = 130, padL = 28, padR = 10, padT = 10, padB = 26;
  const graphW = W - padL - padR;
  const graphH = H - padT - padB;
  const maxVal = habits.length;
  const n      = points.length;

  const coords = points.map(function(p, i) {
    const x = padL + (i / (n - 1)) * graphW;
    const y = padT + graphH - (p.done / maxVal) * graphH;
    return x.toFixed(1) + ',' + y.toFixed(1);
  });
  const polyPoints = coords.join(' ');
  const areaPoints = padL + ',' + (padT + graphH) + ' ' + polyPoints +
                     ' ' + (padL + graphW) + ',' + (padT + graphH);

  let gridHTML = '';
  for (let v = 0; v <= maxVal; v++) {
    const y = padT + graphH - (v / maxVal) * graphH;
    gridHTML += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - padR}" y2="${y.toFixed(1)}" stroke="#1e1e50" stroke-width="1"/>`;
    gridHTML += `<text x="${padL - 5}" y="${(y + 4).toFixed(1)}" text-anchor="end" fill="#3a3a70" font-size="9">${v}</text>`;
  }

  let xHTML  = '';
  const step = Math.max(1, Math.floor(n / 6));
  points.forEach(function(p, i) {
    if (i % step === 0 || i === n - 1) {
      const x = padL + (i / (n - 1)) * graphW;
      xHTML += `<text x="${x.toFixed(1)}" y="${H - 4}" text-anchor="middle" fill="#2a2060" font-size="9">${p.key.slice(5)}</text>`;
    }
  });

  return `
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="width:100%;height:${H}px">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stop-color="#7c3aed"/>
          <stop offset="100%" stop-color="#06b6d4"/>
        </linearGradient>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="#7c3aed" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#7c3aed" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${gridHTML}
      ${xHTML}
      <polygon points="${areaPoints}" fill="url(#areaGrad)"/>
      <polyline points="${polyPoints}" fill="none" stroke="url(#lineGrad)"
                stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    </svg>
  `;
}


// ════════════════════════════════════════
//  ACHIEVEMENTS
// ════════════════════════════════════════

const BADGES = [
  { name: 'First Step',      icon: '🌱', desc: 'Add your very first habit.',
    check: function(h) { return h.length >= 1; } },
  { name: 'Check!',          icon: '✅', desc: 'Complete a habit for the first time.',
    check: function(h) { return h.some(function(x) { return x.completedDates.length >= 1; }); } },
  { name: 'Hat Trick',       icon: '🔥', desc: 'Complete all habits 3 days in a row.',
    check: function(h) { return calculateAllHabitsBestStreak(h) >= 3; } },
  { name: 'One Week',        icon: '📅', desc: 'Complete all habits 7 days in a row.',
    check: function(h) { return calculateAllHabitsBestStreak(h) >= 7; } },
  { name: 'Two Weeks',       icon: '💪', desc: 'Complete all habits 14 days in a row.',
    check: function(h) { return calculateAllHabitsBestStreak(h) >= 14; } },
  { name: 'One Month',       icon: '🏆', desc: 'Complete all habits 30 days in a row.',
    check: function(h) { return calculateAllHabitsBestStreak(h) >= 30; } },
  { name: 'Habit Collector', icon: '📚', desc: 'Add 5 or more habits.',
    check: function(h) { return h.length >= 5; } },
  { name: 'Century',         icon: '⚡', desc: '100 total habit completions.',
    check: function(h) { return h.reduce(function(s, x) { return s + x.completedDates.length; }, 0) >= 100; } },
  { name: 'Dedicated',       icon: '🌟', desc: '30 perfect days (all habits done).',
    check: function(h) {
      let count = 0;
      let c = appStartDate;
      while (c <= realTodayKey) {
        const active = getActiveHabitsForDate(h, c);
        if (active.length > 0 && active.every(function(x) { return x.completedDates.includes(c); })) count++;
        c = addDays(c, 1);
      }
      return count >= 30;
    }
  },
  { name: 'Planner',   icon: '🎯', desc: 'Set a goal date on any habit.',
    check: function(h) { return h.some(function(x) { return x.goalDate && x.goalDate !== ''; }); } },
  { name: 'Early Bird', icon: '🌅', desc: 'Set a 6 AM reminder.',
    check: function(h) { return h.some(function(x) { return x.reminder && x.reminderTime === '06:00'; }); } },
  { name: 'Night Owl',  icon: '🦉', desc: 'Set a 9 PM reminder.',
    check: function(h) { return h.some(function(x) { return x.reminder && x.reminderTime === '21:00'; }); } },
];

function renderAchievements() {
  const habits    = loadHabits();
  const container = document.getElementById('achievements-content');
  container.innerHTML = '';

  BADGES.forEach(function(badge) {
    const unlocked = badge.check(habits);
    const card     = document.createElement('div');
    card.classList.add('badge-card');
    if (unlocked) card.classList.add('unlocked');

    card.innerHTML = `
      <span class="badge-icon">${badge.icon}</span>
      <div class="badge-name">${badge.name}</div>
      <div class="badge-desc">${badge.desc}</div>
      <span class="badge-status">${unlocked ? '✓ Unlocked' : 'Locked'}</span>
    `;
    container.appendChild(card);
  });
}


// ════════════════════════════════════════
//  PROFILE MODAL
//  Reads from and writes to the user's profile object.
//  Email is read-only — it's the user's unique identifier.
// ════════════════════════════════════════

const profileModal = document.getElementById('profile-modal');
const profileBtn   = document.getElementById('profile-btn');

profileBtn.addEventListener('click', function() {
  const profile = loadUserProfile();
  document.getElementById('profile-name').value  = profile.name  || '';
  document.getElementById('profile-email').value = profile.email || currentUserEmail;
  document.getElementById('profile-dob').value   = profile.dob   || '';
  document.getElementById('profile-bio').value   = profile.bio   || '';

  // Show the "Member since" line
  const sinceEl = document.getElementById('profile-since');
  if (profile.startDate) {
    sinceEl.textContent = 'Member since ' + formatDisplayDate(profile.startDate);
  }

  profileModal.classList.remove('hidden');
});

document.getElementById('profile-modal-close').addEventListener('click', function() {
  profileModal.classList.add('hidden');
});

profileModal.addEventListener('click', function(event) {
  if (event.target === profileModal) profileModal.classList.add('hidden');
});

document.getElementById('profile-modal-save').addEventListener('click', function() {
  const profile = loadUserProfile();

  const name = document.getElementById('profile-name').value.trim();
  const dob  = document.getElementById('profile-dob').value;
  const bio  = document.getElementById('profile-bio').value.trim();

  if (name) {
    profile.name = name;
    profileBtn.textContent = name[0].toUpperCase();
  }
  if (dob) profile.dob = dob;
  if (bio) profile.bio = bio;

  saveUserProfile(profile);
  profileModal.classList.add('hidden');
});

// Logout — removes only the active session.
// All habit data and profile remain stored under the user's email.
document.getElementById('profile-logout').addEventListener('click', function() {
  localStorage.removeItem('currentUserEmail');
  window.location.href = 'login.html';
});


// ════════════════════════════════════════
//  WELCOME MODAL
// ════════════════════════════════════════

const welcomeModal = document.getElementById('welcome-modal');

document.getElementById('welcome-close').addEventListener('click', function() {
  welcomeModal.classList.add('hidden');
});

if (localStorage.getItem('justSignedUp') === 'true') {
  localStorage.removeItem('justSignedUp');
  welcomeModal.classList.remove('hidden');
}


// ════════════════════════════════════════
//  GREETING STRIP
// ════════════════════════════════════════

const homeSection = document.getElementById('home');
const greeting    = document.createElement('div');
greeting.classList.add('home-greeting');
greeting.innerHTML = `
  <h2>My Habits</h2>
  <span class="home-date-label">${formatDisplayDate(realTodayKey)}</span>
`;
homeSection.insertBefore(greeting, homeSection.firstChild);


// ════════════════════════════════════════
//  INIT
// ════════════════════════════════════════

// Show first letter of user's name on the profile button
const profile = loadUserProfile();
profileBtn.textContent = profile.name ? profile.name[0].toUpperCase() : '?';

updateDateSwitcherUI();
renderHabits();
