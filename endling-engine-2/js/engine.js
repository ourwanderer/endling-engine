/* THE ENDLING SAGA — ENGINE JS v6.2 — PHASE 2 */

// ── SESSION TRACKER ───────────────────────────────────────────────────────────

const EngineSession = {
  getVisited() {
    try { return JSON.parse(sessionStorage.getItem('es_visited')||'[]'); } catch(e) { return []; }
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

// Strand definitions — THE ENDLING / HIGH WAIL ROOK / DOMUM NOVUM
const STRANDS = {
  endling: [
    'koa.html','doran.html','agnar.html','sleipnir.html','bouncer-x.html',
    'the-ookami.html','new-kyushu.html','blackbone.html','nkmc.html',
    'graphic-novel.html','war-dog.html','nkmc-electroghosts.html','nkmc-dead-gods.html',
    'nkmc-pr-crew.html',
    'nkmc-bike-piero.html','nkmc-bike-riastrad.html',
    'nkmc-bike-dead-gods-1.html','nkmc-bike-electroghost-1.html',
    'gif-anime-endling.html','gif-koa-ride.html','gif-headgear-logo.html',
    'gif-yaeko-bebop.html','gif-yaeko-echo.html','gif-yaeko-helmet.html',
    'gif-yaeko-spear.html','gif-yaeko-test.html','gif-yaeko-title.html',
    'gif-yaeko-kick.html','gif-yaeko-skullgolf.html','gif-skullgolf.html',
    'vid-bouncer-x.html','vid-headgear-8.html','vid-headgear-9.html',
    'vid-headgear-10.html','vid-headgear-5.html','vid-headgear-genesis.html',
    'vid-acid-cola-ad.html','vid-walk-war-dog.html','vid-acid-cola-can-360.html',
    'vid-headgear-360-1.html','vid-headgear-360-2.html','vid-yaeko-fun.html',
    'vid-yaeko-spear.html','vid-endling-credits.html',
    'img-koa-sunset.html','img-koa-bike-doran.html','img-endling-oracle.html',
    'img-endling-oracle-dream.html','img-shogun-leiko.html','img-war-dog-koa.html',
    'img-endling-flight.html','img-endling-meet.html','img-endling-rest-sunset.html',
    'img-endling-duel.html','img-koa-young.html','img-piero.html',
    'img-headgear-card-1.html','img-headgear-card-2.html','img-headgear-card-3.html',
    'img-headgear-3moons-note.html','img-acid-cola-logo.html','img-writing-consulcrew.html',
    'img-koa-wanderer.html','img-early-endling-1.html','img-early-endling-2.html',
    'img-yaeko.html','img-yaeko-acid-cola.html','img-yaeko-storyboard.html',
    'img-new-kyushu-citizen.html','img-nkmc-electroghosts.html','img-nkmc-dead-gods-bike.html',
    'img-nkmc-piero.html','img-nkmc-riastrad.html',
    'gloss-headgear.html','gloss-jiro-monk.html','gloss-riastrad.html',
  ],
  hwr: [
    'irla.html','elayda.html','kelak.html','cu-chulainn.html',
    'high-wail-rook.html','the-continent.html','green-temple.html',
    'dead-gods.html','holy-lines.html','map.html',
    'vid-maelstrom-knight.html','vid-nightcutters.html',
    'img-irla-rin-title.html','img-kelak.html','img-kelak-story.html',
    'img-adamas.html','img-baiden.html','img-bria.html','img-dragon-rider.html',
    'img-elayda-portrait.html','img-green-temple-adira.html',
    'img-cataphract.html','img-excubitor.html','img-halberdier.html',
    'img-neokoro.html','img-hwr-knight-1.html','img-hwr-knight-2.html',
    'img-hwr-hordes.html','img-seedlands.html','img-desert-knight.html',
    'img-irla-rin-map.html','img-maelstrom-knight.html','img-maelstrom-fragment.html',
    'gloss-baiden.html','gloss-bria.html','gloss-excubitor.html',
    'gloss-halberdier.html','gloss-cataphract.html','gloss-granite-throne.html',
    'gloss-auric-coast.html','gloss-mourning-sea.html','gloss-the-cut.html',
    'gloss-great-verdant.html','gloss-vast-aught.html','gloss-elon-fingertip.html',
    'gloss-dragon-rider.html','gloss-nightcutters.html','gloss-gawyle.html',
    'gloss-sacred-lines.html','gloss-riastrad.html',
  ],
  domum: [
    'peregrinus.html','domum-novum.html','three-moons-glossary.html',
    'our-wanderer-song.html','three-moons-song.html',
    'memory-endlessly-song.html','other-seas-song.html',
    'lyric-our-wanderer.html','lyric-three-moons.html',
    'lyric-memory-endlessly.html','lyric-other-seas.html',
    'gif-osos-daynight.html','vid-the-exile.html','vid-dead-machine.html',
    'vid-short-film-ancient.html','vid-rixual-1.html','vid-rixual-2.html',
    'img-domum-liftoff.html','img-domum-machina.html','img-domum-parousia.html',
    'img-domum-prex-machina.html','img-domum-veil.html',
    'img-engine-prex-inscription.html','img-dead-machine-one.html',
    'img-mythed-ceremony.html','img-mythed-sirens.html',
    'img-peregrinus-world.html','img-misc-seer.html','img-misc-shore.html',
    'gloss-parousia.html','gloss-prex-machina.html','gloss-ulthera.html',
  ],
  // ANOMALY — bleeds through all strands at low weight
  // These nodes appear in every pool at weight 1, never clustered
  anomaly: [
    'the-exile.html','cu-chulainn.html','entry.html',
    'gloss-the-oracle.html',
    'img-giant-ghost-1.html','img-giant-ghost-2.html','img-giant-ghost-3.html',
    'img-comet-rider-1.html','img-comet-rider-2.html',
    'img-engine-vista.html','img-escape.html','img-which-life.html',
    'img-dead-machine-mortuus.html',
    'img-atalanta.html','img-strange-garden.html',
    'img-writing-black-hole.html','img-writing-interview.html',
    'img-misc-gallery-1.html','img-misc-gallery-2.html',
    'img-misc-gallery-3.html','img-misc-gallery-4.html',
    'img-misc-memory.html','img-charybdis.html','img-aeolus.html',
    'img-superluminal-1.html','img-superluminal-2.html',
    'img-short-film-ancient-1.html','img-short-film-2.html','img-short-film-3.html',
    'vid-the-exile.html','vid-superluminal.html','vid-dead-machine.html',
    'vid-apogeic-one.html','vid-apogeic-two.html',
    'vid-neurula-1.html','vid-neurula-2.html',
    'vid-i-had-that-dream.html','vid-random-experiment.html',
    'vid-no-beyond.html',
    'gif-tinl.html','gif-osos-daynight.html',
  ],
};

// Leonard is a bridge — accessible from all strands but not belonging to any
// The Exile is a bridge node too

// Leonard is a bridge - appears in all strands
const BRIDGE_NODES = ['leonard.html','entry.html','agnar.html','the-exile.html'];

function getOrAssignStrand() {
  try {
    let strand = sessionStorage.getItem('es_strand');
    if (!strand) {
      const strands = ['endling','hwr','domum'];
      strand = strands[Math.floor(Math.random() * strands.length)];
      sessionStorage.setItem('es_strand', strand);
    }
    return strand;
  } catch(e) {
    return 'newkyushu';
  }
}

// ── CONTEXTUAL ELEVATION MAP ────────────────────────────────────────────────
// When the visitor lands on a source node, target nodes get weight doubled
// for the next jump only. Stored in sessionStorage as es_last_node.
const ELEVATIONS = {
  'koa.html':         ['agnar.html','war-dog.html','doran.html','the-ookami.html','gloss-headgear.html','new-kyushu.html'],
  'leonard.html':     ['agnar.html','gloss-slowrym.html','gloss-kwathlegonx.html','entry.html'],
  'irla.html':        ['elayda.html','kelak.html','green-temple.html','the-continent.html','holy-lines.html'],
  'elayda.html':      ['irla.html','img-green-temple-adira.html','gloss-sacred-lines.html','green-temple.html'],
  'kelak.html':       ['irla.html','elayda.html','the-continent.html'],
  'the-exile.html':   ['gloss-the-oracle.html'],
  'peregrinus.html':  ['domum-novum.html','dead-gods.html','gloss-ulthera.html'],
  'doran.html':       ['koa.html','high-wail-rook.html'],
  'dead-gods.html':   ['gloss-parousia.html','gloss-prex-machina.html','gloss-ulthera.html','peregrinus.html'],
  'agnar.html':       ['koa.html','leonard.html','entry.html'],
};

function getLastNode() {
  try { return sessionStorage.getItem('es_last_node') || ''; } catch(e) { return ''; }
}
function setLastNode(url) {
  try { sessionStorage.setItem('es_last_node', url.split('/').pop()); } catch(e) {}
}

function smartRandom(pool) {
  const clicks = EngineSession.getClickCount();
  const strand = getOrAssignStrand();
  const strandNodes = STRANDS[strand] || [];
  const anomalyNodes = STRANDS['anomaly'] || [];
  const lastNode = getLastNode();
  const elevatedTargets = ELEVATIONS[lastNode] || [];
  const recentFour = EngineSession.getRecentFour();

  // Step 1: exclude already-visited after 3 clicks
  let candidates = pool;
  if (clicks >= 3) {
    const unvisited = pool.filter(item => !EngineSession.hasVisited(item.url));
    if (unvisited.length >= 1) candidates = unvisited;
    // If all visited, use full pool — at least recent-four penalty will
    // push us toward less-recently-seen nodes
  }

  // Step 2: apply weights
  const strandInfluence = clicks < 12 ? 1.8 : 2.8;

  const adjusted = candidates.map(item => {
    let w = item.weight || 1;
    const filename = item.url.split('/').pop();

    // Strand boost
    if (strandNodes.includes(filename)) {
      w *= clicks > 20 ? 1.3 : strandInfluence;
    }

    // Contextual elevation: double weight for one jump (apply before penalties)
    if (elevatedTargets.includes(filename)) {
      w *= 2;
    }

    // ANOMALY nodes: cap at low weight
    if (anomalyNodes.includes(filename)) {
      w = Math.min(w, 1.2);
    }

    // Recent-four penalty: scale by recency (most recent = heaviest)
    const recentIdx = recentFour.indexOf(filename);
    if (recentIdx === 0) w *= 0.05;      // just came from here
    else if (recentIdx === 1) w *= 0.1;  // one hop ago
    else if (recentIdx === 2) w *= 0.2;  // two hops ago
    else if (recentIdx === 3) w *= 0.35; // three hops ago

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

function initDeeperButton(pool) {
  const btn = document.getElementById('btn-deeper');
  if (!btn) return;
  btn.addEventListener('click', e=>{
    e.preventDefault();
    EngineSession.incrementClicks();
    navigateTo(smartRandom(pool));
  });
}

function initBackButton() {
  const btn = document.getElementById('btn-back');
  if (!btn) return;
  // Always go home — no browser history dependency
  btn.addEventListener('click', e=>{
    e.preventDefault();
    // Detect if we're in /nodes/ subfolder
    const inNodes = window.location.pathname.includes('/nodes/');
    navigateTo(inNodes ? '../index.html' : 'index.html');
  });
}

// ── WARP DISTORTION ──────────────────────────────────────────────────────────

function initWarp() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('width','0'); svg.setAttribute('height','0');
  svg.style.position='absolute';
  svg.innerHTML=`<defs><filter id="reality-warp" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence id="warp-turb" type="turbulence" baseFrequency="0.015 0.015" numOctaves="3" seed="2" result="noise"/><feDisplacementMap id="warp-disp" in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter></defs>`;
  document.body.appendChild(svg);

  const turb = document.getElementById('warp-turb');
  const disp = document.getElementById('warp-disp');

  setTimeout(()=>{
    document.querySelectorAll('.bg-image').forEach(bg=>{
      const ex = bg.style.filter||'';
      if (!ex.includes('reality-warp')) bg.style.filter='url(#reality-warp) '+ex;
    });
  }, 100);

  let ts=0, cs=0, tf=0.015, cf=0.015, animating=false, idle=null;

  window.addEventListener('mousemove', e=>{
    const nx=e.clientX/window.innerWidth, ny=e.clientY/window.innerHeight;
    const d=Math.sqrt(Math.pow(nx-0.5,2)+Math.pow(ny-0.5,2));
    ts=3+d*10; tf=0.013+nx*0.006;
    if (!animating) { animating=true; requestAnimationFrame(tick); }
    clearTimeout(idle);
    idle=setTimeout(()=>{ ts=0; tf=0.015; }, 700);
  });

  function tick() {
    cs+=(ts-cs)*0.07; cf+=(tf-cf)*0.04;
    if (turb) turb.setAttribute('baseFrequency',cf.toFixed(4)+' 0.015');
    if (disp) disp.setAttribute('scale',cs.toFixed(2));
    if (Math.abs(cs-ts)>0.08||cs>0.08) requestAnimationFrame(tick);
    else { if(disp) disp.setAttribute('scale','0'); animating=false; }
  }

  // Apply warp filter to buttons on hover
  const btnStyle = document.createElement('style');
  btnStyle.textContent = '.nav-btn:hover, .enter-btn:hover { filter: url(#reality-warp); }';
  document.head.appendChild(btnStyle);
}

// ── ABSTRACT AUDIO VISUALISER ─────────────────────────────────────────────────


// ── FOUR DISTINCT VISUALISER MODES ──────────────────────────────────────────

function drawModeOrbital(ctx, analyser, W, H, time, hueBase) {
  // Our Wanderer - orbiting rings, expansive, space-like
  const freqData = new Uint8Array(analyser.frequencyBinCount);
  const waveData = new Uint8Array(analyser.fftSize);
  analyser.getByteFrequencyData(freqData);
  analyser.getByteTimeDomainData(waveData);
  const bass = freqData.slice(0,8).reduce((a,b)=>a+b,0)/8/255;
  const mid  = freqData.slice(8,60).reduce((a,b)=>a+b,0)/52/255;
  const energy = bass*0.6 + mid*0.4;

  ctx.fillStyle = `rgba(4,4,8,${0.05+bass*0.03})`;
  ctx.fillRect(0,0,W,H);
  ctx.globalCompositeOperation = 'screen';

  const cx=W/2, cy=H/2;
  for (let ring=0; ring<4; ring++) {
    const r = 15 + ring*18 + bass*25;
    const pts = 80;
    ctx.beginPath();
    for (let i=0; i<=pts; i++) {
      const angle = (i/pts)*Math.PI*2 + time*(0.2+ring*0.1);
      const fi = Math.floor((i/pts)*analyser.frequencyBinCount*0.7);
      const amp = (freqData[fi]||0)/255;
      const dr = amp*(10+ring*5);
      const px = cx + Math.cos(angle)*(r+dr)*2.5;
      const py = cy + Math.sin(angle)*(r+dr)*0.6;
      i===0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py);
    }
    const hue = (hueBase + ring*25) % 360;
    ctx.strokeStyle = `hsla(${hue},70%,${45+bass*25}%,${0.3+mid*0.4})`;
    ctx.lineWidth = 0.6+bass;
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
}

function drawModeWaveform(ctx, analyser, W, H, time, hueBase) {
  // Three Moons - pure waveform, haunting, minimal
  const waveData = new Uint8Array(analyser.fftSize);
  const freqData = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteTimeDomainData(waveData);
  analyser.getByteFrequencyData(freqData);
  const bass = freqData.slice(0,8).reduce((a,b)=>a+b,0)/8/255;

  ctx.fillStyle = `rgba(2,2,6,${0.08+bass*0.02})`;
  ctx.fillRect(0,0,W,H);
  ctx.globalCompositeOperation = 'screen';

  // Three offset waveforms like three moons
  for (let layer=0; layer<3; layer++) {
    ctx.beginPath();
    const yOffset = (layer-1) * H*0.15;
    for (let i=0; i<waveData.length; i++) {
      const x = (i/waveData.length)*W;
      const v = (waveData[i]-128)/128;
      const y = H/2 + yOffset + v*H*(0.2-layer*0.03) + Math.sin(i*0.04+time*(1+layer*0.3))*bass*12;
      i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    }
    const hue = (hueBase + layer*80) % 360;
    ctx.strokeStyle = `hsla(${hue},60%,${55+bass*20}%,${0.4-layer*0.08})`;
    ctx.lineWidth = 1.2-layer*0.3;
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
}

function drawModeParticleField(ctx, analyser, W, H, time, hueBase, particles) {
  // Memory Endlessly - particle field, melancholic, diffuse
  const freqData = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(freqData);
  const bass = freqData.slice(0,8).reduce((a,b)=>a+b,0)/8/255;
  const mid  = freqData.slice(8,60).reduce((a,b)=>a+b,0)/52/255;
  const energy = bass*0.5+mid*0.5;

  ctx.fillStyle = `rgba(3,2,5,${0.04+bass*0.02})`;
  ctx.fillRect(0,0,W,H);
  ctx.globalCompositeOperation = 'screen';

  if (energy > 0.15 && Math.random() < 0.4+energy*0.5) {
    particles.push({
      x: Math.random()*W, y: H+5,
      vx: (Math.random()-0.5)*0.5,
      vy: -(0.2+Math.random()*energy*1.5),
      life: 1, decay: 0.004+Math.random()*0.008,
      hue: (hueBase+Math.random()*40-20)%360,
      size: 0.5+Math.random()*1.5
    });
  }

  for (let i=particles.length-1; i>=0; i--) {
    const p = particles[i];
    p.x += p.vx + Math.sin(time*0.5+p.y*0.02)*0.4;
    p.y += p.vy; p.life -= p.decay;
    if (p.life <= 0) { particles.splice(i,1); continue; }
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
    ctx.fillStyle = `hsla(${p.hue},55%,65%,${p.life*0.5})`;
    ctx.fill();
  }
  if (particles.length > 200) particles.splice(0, particles.length-200);
  ctx.globalCompositeOperation = 'source-over';
  return particles;
}

function drawModeGeometric(ctx, analyser, W, H, time, hueBase) {
  // Other Seas Other Suns - geometric, hopeful, structured
  const freqData = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(freqData);
  const bass = freqData.slice(0,8).reduce((a,b)=>a+b,0)/8/255;
  const mid  = freqData.slice(8,60).reduce((a,b)=>a+b,0)/52/255;

  ctx.fillStyle = `rgba(4,4,2,${0.06+bass*0.03})`;
  ctx.fillRect(0,0,W,H);
  ctx.globalCompositeOperation = 'screen';

  const cx=W/2, cy=H/2;
  const sides = [3,4,6,8];
  sides.forEach((n, idx) => {
    const baseR = 10 + idx*12 + bass*20;
    const fi = Math.floor((idx/sides.length)*analyser.frequencyBinCount*0.5);
    const amp = (freqData[fi]||0)/255;
    const r = baseR + amp*25;
    ctx.beginPath();
    for (let i=0; i<=n; i++) {
      const angle = (i/n)*Math.PI*2 + time*(0.15+idx*0.08);
      const px = cx + Math.cos(angle)*r*2.8;
      const py = cy + Math.sin(angle)*r;
      i===0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py);
    }
    ctx.closePath();
    const hue = (hueBase + idx*30) % 360;
    ctx.strokeStyle = `hsla(${hue},65%,${50+bass*25}%,${0.25+mid*0.35})`;
    ctx.lineWidth = 0.8+bass*0.8;
    ctx.stroke();
  });
  ctx.globalCompositeOperation = 'source-over';
}

function initAudioPlayer(audioSrc, visualiserMode) {
  const audio = new Audio(audioSrc);
  const playBtn = document.getElementById('play-btn');
  const fill = document.getElementById('audio-fill');
  const progressBar = document.getElementById('audio-progress');
  const timeEl = document.getElementById('audio-time');
  const canvas = document.getElementById('visualiser');
  if (!playBtn || !canvas) return;

  let actx, analyser, source, connected=false, rafId=null;
  const ctx = canvas.getContext('2d');

  function fmt(s) {
    const m=Math.floor(s/60), sec=Math.floor(s%60);
    return m+':'+(sec<10?'0':'')+sec;
  }

  playBtn.addEventListener('click', ()=>{
    if (!connected) {
      actx = new (window.AudioContext||window.webkitAudioContext)();
      analyser = actx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.82;
      source = actx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(actx.destination);
      connected = true;
    }
    if (audio.paused) {
      audio.play();
      playBtn.innerHTML='&#9646;&#9646;';
      if (rafId) cancelAnimationFrame(rafId);
      drawFrame();
    } else {
      audio.pause();
      playBtn.innerHTML='&#9654;';
      if (rafId) cancelAnimationFrame(rafId);
    }
  });

  audio.addEventListener('timeupdate', ()=>{
    if (!audio.duration) return;
    const pct=(audio.currentTime/audio.duration)*100;
    if (fill) fill.style.width=pct+'%';
    if (timeEl) timeEl.textContent=fmt(audio.currentTime)+' / '+fmt(audio.duration);
  });

  audio.addEventListener('ended', ()=>{ playBtn.innerHTML='&#9654;'; });

  if (progressBar) {
    progressBar.addEventListener('click', e=>{
      const rect=progressBar.getBoundingClientRect();
      audio.currentTime=(e.clientX-rect.left)/rect.width*audio.duration;
    });
  }

  let particles = [];
  let time = 0;
  let hueBase = 0;
  const mode = visualiserMode || 'orbital';

  function drawFrame() {
    if (!analyser || audio.paused) return;
    rafId = requestAnimationFrame(drawFrame);
    time += 0.008;
    hueBase += 0.2;
    const W = canvas.width, H = canvas.height;
    if (mode === 'orbital') { drawModeOrbital(ctx, analyser, W, H, time, hueBase); return; }
    if (mode === 'waveform') { drawModeWaveform(ctx, analyser, W, H, time, hueBase); return; }
    if (mode === 'particles') { particles = drawModeParticleField(ctx, analyser, W, H, time, hueBase, particles); return; }
    if (mode === 'geometric') { drawModeGeometric(ctx, analyser, W, H, time, hueBase); return; }
  }

  function resizeCanvas() {
    canvas.width=canvas.offsetWidth||500;
    canvas.height=canvas.offsetHeight||140;
  }
  resizeCanvas();
  window.addEventListener('resize',resizeCanvas);
}

// ── MAP PAN + ZOOM ────────────────────────────────────────────────────────────

function initMap() {
  const container=document.getElementById('map-container');
  const img=document.getElementById('map-img');
  if (!container||!img) return;

  let scale=1, minScale=0.15, maxScale=6, tx=0, ty=0;
  let dragging=false, lastX=0, lastY=0;

  img.onload=function(){
    const fw=container.clientWidth/img.naturalWidth;
    const fh=container.clientHeight/img.naturalHeight;
    // Use min of fit-to-container scale and 1.0 to prevent over-zoom on retina
    scale=Math.min(fw,fh,0.85);
    tx=(container.clientWidth-img.naturalWidth*scale)/2;
    ty=(container.clientHeight-img.naturalHeight*scale)/2;
    minScale=Math.min(fw,fh)*0.4; // Allow zoom out to 40% of fit
    apply();
  };

  function apply(){ img.style.transform=`translate(${tx}px,${ty}px) scale(${scale})`; img.style.transformOrigin='0 0'; }

  container.addEventListener('mousedown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;});
  window.addEventListener('mouseup',()=>dragging=false);
  window.addEventListener('mousemove',e=>{
    if(!dragging)return;
    tx+=e.clientX-lastX;ty+=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;apply();
  });
  container.addEventListener('wheel',e=>{
    e.preventDefault();
    const rect=container.getBoundingClientRect();
    const mx=e.clientX-rect.left,my=e.clientY-rect.top;
    const delta=e.deltaY<0?1.1:0.9;
    const ns=Math.min(maxScale,Math.max(minScale,scale*delta));
    tx=mx-(mx-tx)*(ns/scale);ty=my-(my-ty)*(ns/scale);scale=ns;apply();
  },{passive:false});

  let lastDist=0;
  container.addEventListener('touchstart',e=>{
    if(e.touches.length===1){dragging=true;lastX=e.touches[0].clientX;lastY=e.touches[0].clientY;}
    if(e.touches.length===2){lastDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);}
  });
  container.addEventListener('touchmove',e=>{
    e.preventDefault();
    if(e.touches.length===1&&dragging){tx+=e.touches[0].clientX-lastX;ty+=e.touches[0].clientY-lastY;lastX=e.touches[0].clientX;lastY=e.touches[0].clientY;apply();}
    if(e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);scale=Math.min(maxScale,Math.max(minScale,scale*(d/lastDist)));lastDist=d;apply();}
  },{passive:false});
  container.addEventListener('touchend',()=>dragging=false);
}

// ── NOVEL READER ─────────────────────────────────────────────────────────────

function initNovelReader(pages) {
  let current=0;
  const img=document.getElementById('novel-img');
  const counter=document.getElementById('novel-counter');
  const prevBtn=document.getElementById('novel-prev');
  const nextBtn=document.getElementById('novel-next');
  if(!img)return;

  function update(){
    img.src=pages[current];
    img.classList.remove('zoomed');
    if(counter)counter.textContent=(current+1)+' / '+pages.length;
    if(prevBtn)prevBtn.disabled=(current===0);
    if(nextBtn)nextBtn.disabled=(current===pages.length-1);
  }

  img.addEventListener('click',e=>{
    if(img.classList.contains('zoomed')){img.classList.remove('zoomed');return;}
    const rect=img.getBoundingClientRect();
    img.style.setProperty('--zoom-x',((e.clientX-rect.left)/rect.width*100)+'%');
    img.style.setProperty('--zoom-y',((e.clientY-rect.top)/rect.height*100)+'%');
    img.classList.add('zoomed');
  });

  if(prevBtn)prevBtn.addEventListener('click',()=>{if(current>0){current--;update();}});
  if(nextBtn)nextBtn.addEventListener('click',()=>{if(current<pages.length-1){current++;update();}});
  update();
}

// ── IMAGE ZOOM ───────────────────────────────────────────────────────────────

function initImageZoom() {
  document.querySelectorAll('.node-image, .zoomable, .char-portrait').forEach(img=>{
    img.style.cursor='zoom-in';
    img.addEventListener('click', e=>{
      if (img.classList.contains('zoomed')) {
        img.classList.remove('zoomed');
        img.style.cursor='zoom-in';
        img.style.transform='';
        img.style.zIndex='';
        return;
      }
      const rect=img.getBoundingClientRect();
      const ox=((e.clientX-rect.left)/rect.width*100)+'%';
      const oy=((e.clientY-rect.top)/rect.height*100)+'%';
      img.style.transformOrigin=`${ox} ${oy}`;
      img.style.transform='scale(2)';
      img.style.zIndex='500';
      img.style.cursor='zoom-out';
      img.classList.add('zoomed');
    });
  });
}

// ── COORDINATES ──────────────────────────────────────────────────────────────

function initCoordinates(){
  const el=document.querySelector('.coordinates');
  if(el&&el.dataset.coords)el.textContent=el.dataset.coords;
}

// ── RECORD VISIT ─────────────────────────────────────────────────────────────

function recordVisit(){
  EngineSession.addVisited(window.location.pathname);
}

// ── INIT ─────────────────────────────────────────────────────────────────────


// ── IMAGE ORIENTATION DETECTION ─────────────────────────────────────────────
function initOrientationLayout() {
  const layout = document.querySelector('.char-layout-v2');
  if (!layout) return;
  const portrait = layout.querySelector('.char-portrait');
  if (!portrait) return;

  function checkOrientation() {
    const w = portrait.naturalWidth;
    const h = portrait.naturalHeight;
    if (w > 0 && h > 0) {
      if (w > h) {
        layout.classList.add('landscape');
      } else {
        layout.classList.remove('landscape');
      }
    }
  }

  if (portrait.complete && portrait.naturalWidth > 0) {
    checkOrientation();
  } else {
    portrait.addEventListener('load', checkOrientation);
  }

  // Zoom handled by initImageZoom() for consistency
}


// ── TV STATIC / CHANNEL FLIP ─────────────────────────────────────────────────
function initTVStatic() {
  // Only run on video pages
  const vidPage = document.querySelector('.vid-page');
  if (!vidPage) return;

  // Create static overlay
  const overlay = document.createElement('div');
  overlay.className = 'tv-static active';
  const canvas = document.createElement('canvas');
  canvas.width = 320; canvas.height = 240;
  overlay.appendChild(canvas);
  document.body.appendChild(overlay);

  const ctx = canvas.getContext('2d');
  let frame = 0;
  const maxFrames = 18;

  function drawStatic() {
    if (frame >= maxFrames) {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 600);
      return;
    }
    const img = ctx.createImageData(canvas.width, canvas.height);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() > 0.5 ? 200 + Math.random() * 55 : Math.random() * 40;
      img.data[i] = img.data[i+1] = img.data[i+2] = v;
      img.data[i+3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    frame++;
    requestAnimationFrame(drawStatic);
  }
  drawStatic();
}

document.addEventListener('DOMContentLoaded',()=>{
  const overlay=document.getElementById('page-transition');
  if(overlay)overlay.classList.remove('active');
  recordVisit();
  initOrientationLayout();
  initTVStatic();
  initBackButton();
  initCoordinates();
  initImageZoom();
  initWarp();
});
