/* THE ENDLING SAGA — ENGINE NAVIGATION
   Weighted random traversal system.
   Each node defines its own pool of deeper destinations.
   Some connections are thematic. Some are lateral. Some seem random.
   That is correct.
*/

// ─── PAGE TRANSITION ────────────────────────────────────────────────────────

function navigateTo(url, delay = 400) {
  const overlay = document.getElementById('page-transition');
  if (overlay) {
    overlay.classList.add('active');
    setTimeout(() => { window.location.href = url; }, delay);
  } else {
    window.location.href = url;
  }
}

// ─── WEIGHTED RANDOM SELECTION ──────────────────────────────────────────────

/*
  Each destination in the pool can have an optional weight (default: 1).
  Higher weight = more likely to be selected.
  Use this to create soft paths without hard linearity.

  Format:
  { url: '../nodes/page-name.html', weight: 2 }

  A weight of 2 means twice as likely as weight 1.
  A weight of 0.5 means half as likely.
*/

function weightedRandom(pool) {
  const total = pool.reduce((sum, item) => sum + (item.weight || 1), 0);
  let rand = Math.random() * total;
  for (const item of pool) {
    rand -= (item.weight || 1);
    if (rand <= 0) return item.url;
  }
  return pool[pool.length - 1].url;
}

// ─── DEEPER BUTTON INIT ─────────────────────────────────────────────────────

/*
  Call this on any node page to wire up the GO DEEPER button.

  Usage in your node's HTML:
  <script>
    initDeeperButton([
      { url: '../nodes/koa-on-the-run.html', weight: 2 },
      { url: '../nodes/doran-speaks.html', weight: 1 },
      { url: '../nodes/agnar.html', weight: 1 },
    ]);
  </script>
*/

function initDeeperButton(pool) {
  const btn = document.getElementById('btn-deeper');
  if (!btn) return;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const destination = weightedRandom(pool);
    navigateTo(destination);
  });
}

// ─── BACK BUTTON ────────────────────────────────────────────────────────────

/*
  GO BACK uses browser history if available.
  Falls back to homepage.
*/

function initBackButton(fallback = '../index.html') {
  const btn = document.getElementById('btn-back');
  if (!btn) return;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (window.history.length > 1) {
      navigateTo('javascript:void(0)', 50);
      setTimeout(() => window.history.back(), 100);
    } else {
      navigateTo(fallback);
    }
  });
}

// ─── COORDINATES (easter egg) ───────────────────────────────────────────────

/*
  Optional: display cryptic coordinates on each page.
  Can be used to encode hidden lore for the truly obsessive.
  Set data-coords="[value]" on the .coordinates element.
*/

function initCoordinates() {
  const el = document.querySelector('.coordinates');
  if (!el || !el.dataset.coords) return;
  el.textContent = el.dataset.coords;
}

// ─── INIT ALL ────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initBackButton();
  initCoordinates();

  // Fade in on arrival
  const overlay = document.getElementById('page-transition');
  if (overlay) {
    overlay.classList.remove('active');
  }
});
