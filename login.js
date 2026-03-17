// ════════════════════════════════════════
//  LOGIN PAGE — script
// ════════════════════════════════════════

// ── If already logged in, skip straight to the app ──
if (localStorage.getItem('currentUserEmail')) {
  window.location.href = 'index.html';
}

// ── Today's date (local time, not UTC) ──
function todayDateKey() {
  const now = new Date();
  const y   = now.getFullYear();
  const m   = String(now.getMonth() + 1).padStart(2, '0');
  const d   = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatLong(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

const todayKey = todayDateKey();
document.getElementById('login-today-date').textContent = formatLong(todayKey);

// ── Detect returning user on email blur ──
const emailInput  = document.getElementById('login-email');
const nameInput   = document.getElementById('login-name');
const statusEl    = document.getElementById('login-status');
const submitBtn   = document.getElementById('login-submit');

emailInput.addEventListener('blur', function() {
  const email = emailInput.value.trim().toLowerCase();
  if (!email) {
    statusEl.textContent = '';
    statusEl.className   = 'login-status';
    return;
  }

  const stored = localStorage.getItem('habitUser_' + email);
  if (stored) {
    const user = JSON.parse(stored);
    statusEl.textContent = '👋 Welcome back, ' + user.name + '! Just click Sign In.';
    statusEl.className   = 'login-status returning';
    nameInput.value    = user.name;
    nameInput.disabled = true;
    submitBtn.textContent = 'Sign In →';
  } else {
    statusEl.textContent = '✨ New account — fill in your name below.';
    statusEl.className   = 'login-status new';
    nameInput.disabled = false;
    nameInput.value    = '';
    submitBtn.textContent = 'Sign Up →';
  }
});

// ── Form submit ──
document.getElementById('login-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const email = emailInput.value.trim().toLowerCase();
  const name  = nameInput.value.trim();

  if (!email) return;

  const stored = localStorage.getItem('habitUser_' + email);

  if (stored) {
    // Returning user — just set the active session
    localStorage.setItem('currentUserEmail', email);
    window.location.href = 'index.html';

  } else {
    // New user — require a name
    if (!name) {
      statusEl.textContent = 'Please enter your name to create an account.';
      statusEl.className   = 'login-status error';
      nameInput.focus();
      return;
    }

    // Create the user record. startDate is TODAY — this is the tracking origin.
    const newUser = {
      name:      name,
      email:     email,
      startDate: todayKey,   // ← the user's tracking origin date
      dob:       '',
      bio:       '',
    };

    localStorage.setItem('habitUser_' + email, JSON.stringify(newUser));
    localStorage.setItem('currentUserEmail', email);
    localStorage.setItem('justSignedUp', 'true');
    window.location.href = 'index.html';
  }
});
