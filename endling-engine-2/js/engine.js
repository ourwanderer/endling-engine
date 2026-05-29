/* 
// ANOMALY nodes — always capped at low weight regardless of pool weight
const STRANDS_ANOMALY = [
  'the-exile.html','cu-chulainn.html','entry.html','gloss-the-oracle.html',
  'img-giant-ghost-1.html','img-giant-ghost-2.html','img-giant-ghost-3.html',
  'img-comet-rider-1.html','img-comet-rider-2.html','img-engine-vista.html',
  'img-escape.html','img-which-life.html','img-dead-machine-mortuus.html',
  'img-atalanta.html','img-strange-garden.html','img-writing-black-hole.html',
  'img-writing-interview.html','img-misc-gallery-1.html','img-misc-gallery-2.html',
  'img-misc-gallery-3.html','img-misc-gallery-4.html','img-misc-memory.html',
  'img-charybdis.html','img-aeolus.html','img-superluminal-1.html','img-superluminal-2.html',
  'img-short-film-ancient-1.html','img-short-film-2.html','img-short-film-3.html',
  'vid-the-exile.html','vid-superluminal.html','vid-dead-machine.html',
  'vid-apogeic-one.html','vid-apogeic-two.html','vid-neurula-1.html','vid-neurula-2.html',
  'vid-i-had-that-dream.html','vid-random-experiment.html','vid-no-beyond.html',
  'gif-tinl.html','gif-osos-daynight.html',
];

THE ENDLING SAGA — ENGINE JS v6.2 — PHASE 2 */

// ── SESSION TRACKER ───────────────────────────────────────────────────────────

const EngineSession = {
  getVisited() {
    try { return JSON.parse(sessionStorage.getItem('es_visited')||'[]'); } catch(e) { return []; }
  },
  getVisitCounts() {
    try { return JSON.parse(sessionStorage.getItem('es_visit_counts')||'{}'); } catch(e) { return {}; }
  },
  getVisitCount(url) {
    const counts = this.getVisitCounts();
    const key = url.split('/').pop();
    return counts[key] || 0;
  },
  incrementVisitCount(url) {
    try {
      const counts = this.getVisitCounts();
      const key = url.split('/').pop();
      counts[key] = (counts[key] || 0) + 1;
      sessionStorage.setItem('es_visit_counts', JSON.stringify(counts));
    } catch(e) {}
  },
  getRecentFour() {
    try { return JSON.parse(sessionStorage.getItem('es_recent4')||'[]'); } catch(e) { return []; }
  },
  addToRecentFour(url) {
    try {
      const clean = url.split('/').pop();
      const r = this.getRecentFour();
      r.unshift(clean);
      if (r.length > 4) r.pop();
      sessionStorage.setItem('es_recent4', JSON.stringify(r));
    } catch(e) {}
  },
  addVisited(url) {
    try {
      const v = this.getVisited();
      const clean = url.split('/').pop();
      if (!v.includes(clean)) v.push(clean);
      sessionStorage.setItem('es_visited', JSON.stringify(v));
    } catch(e) {}
  },
  getClickCount() {
    try { return parseInt(sessionStorage.getItem('es_clicks')||'0'); } catch(e) { return 0; }
  },
  incrementClicks() {
    try {
      const c = this.getClickCount()+1;
      sessionStorage.setItem('es_clicks', c);
      return c;
    } catch(e) { return 0; }
  },
  hasVisited(url) {
    const clean = url.split('/').pop();
    return this.getVisited().includes(clean);
  }
};

// ── NAVIGATION ───────────────────────────────────────────────────────────────

function navigateTo(url, delay=350) {
  const overlay = document.getElementById('page-transition');
  if (overlay) {
    overlay.classList.add('active');
    setTimeout(()=>{ window.location.href=url; }, delay);
  } else window.location.href = url;
}

// Strand system removed — navigation driven by pool weights and elevation only


// Leonard is a bridge - appears in all strands
const BRIDGE_NODES = ['leonard.html','entry.html','agnar.html','the-exile.html'];


function smartRandom(pool) {
  const clicks = EngineSession.getClickCount();
  const recentFour = EngineSession.getRecentFour();
  const lastNode = getLastNode();
  const elevatedTargets = ELEVATIONS[lastNode] || [];
  const anomalyNodes = STRANDS_ANOMALY || [];

  // Step 1: exclude already-visited after 3 clicks
  let candidates = pool;
  let exhausted = false;
  if (clicks >= 3) {
    const unvisited = pool.filter(item => !EngineSession.hasVisited(item.url));
    if (unvisited.length >= 1) {
      candidates = unvisited;
    } else {
      candidates = pool;
      exhausted = true;
    }
  }

  // Step 2: apply weights
  const adjusted = candidates.map(item => {
    let w = item.weight || 1;
    const filename = item.url.split('/').pop();

    // Contextual elevation: double weight for one jump
    if (elevatedTargets.includes(filename)) {
      w *= 2;
    }

    // ANOMALY nodes: cap at low weight
    if (anomalyNodes.includes(filename)) {
      w = Math.min(w, 1.2);
    }

    // Recent-four penalty: scale by recency
    const recentIdx = recentFour.indexOf(filename);
    if (recentIdx === 0) w *= 0.05;
    else if (recentIdx === 1) w *= 0.1;
    else if (recentIdx === 2) w *= 0.2;
    else if (recentIdx === 3) w *= 0.35;

    // Exhausted fallback: boost nodes not in recent-four
    if (exhausted && recentIdx === -1) {
      w *= 1.5;
    }

    return { url: item.url, weight: Math.max(w, 0.01) };
  });

  const total = adjusted.reduce((s,i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of adjusted) {
    r -= item.weight;
    if (r <= 0) return item.url;
  }
  return adjusted[adjusted.length - 1].url;
}


