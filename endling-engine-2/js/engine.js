/* THE ENDLING SAGA — ENGINE JS v6.2 — PHASE 2 */

// ── SESSION TRACKER ───────────────────────────────────────────────────────────

const EngineSession = {
  getVisited() {
    try { return JSON.parse(sessionStorage.getItem('es_visited')||'[]'); } catch(e) { return []; }
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

function navigateTo(url, delay=400) {
  const overlay = document.getElementById('page-transition');
  if (overlay) { overlay.classList.add('active'); setTimeout(()=>{ window.location.href=url; }, delay); }
  else window.location.href = url;
}

function smartRandom(pool) {
  const clicks = EngineSession.getClickCount();

  // Filter out visited nodes entirely after just 3 clicks
  // This is the key fix - don't just penalise, EXCLUDE visited
  let candidates = pool;
  
  if (clicks >= 3) {
    const unvisited = pool.filter(item => !EngineSession.hasVisited(item.url));
    // Only use unvisited if we have at least 2 options
    if (unvisited.length >= 2) {
      candidates = unvisited;
    } else if (unvisited.length === 1) {
      candidates = unvisited;
    } else {
      // All visited - use full pool but heavily randomise
      candidates = pool;
    }
  }

  // After 12 clicks: zone coherence kicks in (pools are already zone-aware)
  // The exclusion of visited nodes handles the repeat problem

  const total = candidates.reduce((s,i)=>s+(i.weight||1),0);
  let r = Math.random()*total;
  for (const item of candidates) {
    r -= (item.weight||1);
    if (r<=0) return item.url;
  }
  return candidates[candidates.length-1].url;
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
}

// ── ABSTRACT AUDIO VISUALISER ─────────────────────────────────────────────────

function initAudioPlayer(audioSrc) {
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
      drawAbstract();
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

  // Ethereal abstract visualiser - particles, tendrils, shifting colour
    let time = 0;
  let hueBase = 0;

  function drawAbstract() {
    if (!analyser || audio.paused) return;
    rafId = requestAnimationFrame(drawAbstract);
    time += 0.008;

    const W=canvas.width, H=canvas.height;
    const bufLen = analyser.frequencyBinCount;
    const freqData = new Uint8Array(bufLen);
    const waveData = new Uint8Array(analyser.fftSize);
    analyser.getByteFrequencyData(freqData);
    analyser.getByteTimeDomainData(waveData);

    const bass = freqData.slice(0,8).reduce((a,b)=>a+b,0)/8/255;
    const mid  = freqData.slice(8,60).reduce((a,b)=>a+b,0)/52/255;
    const high = freqData.slice(60,120).reduce((a,b)=>a+b,0)/60/255;
    const energy = (bass*0.5 + mid*0.3 + high*0.2);

    // Shift hue slowly with music energy
    hueBase += 0.15 + energy*0.8;

    // Very soft fade - long trail
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(0,0,0,${0.06 + bass*0.04})`;
    ctx.fillRect(0,0,W,H);

    const cx=W/2, cy=H/2;

    // Waveform as flowing tendril across full width
    ctx.globalCompositeOperation = 'screen';
    ctx.beginPath();
    for (let i=0; i<waveData.length; i++) {
      const x = (i/waveData.length)*W;
      const v = (waveData[i]-128)/128;
      const wobble = Math.sin(i*0.05+time*2)*mid*12;
      const y = cy + v*H*0.35 + wobble;
      i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    }
    const wHue = (hueBase + 10) % 360;
    ctx.strokeStyle = `hsla(${wHue},${60+high*40}%,${45+bass*30}%,${0.25+energy*0.35})`;
    ctx.lineWidth = 0.8 + bass*2;
    ctx.stroke();

    // Second waveform offset for depth
    ctx.beginPath();
    for (let i=0; i<waveData.length; i+=2) {
      const x = (i/waveData.length)*W;
      const v = (waveData[i]-128)/128;
      const y = cy*0.6 + v*H*0.15 + Math.cos(i*0.08+time)*mid*8;
      i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    }
    ctx.strokeStyle = `hsla(${(hueBase+180)%360},${40+mid*50}%,${35+high*30}%,${0.15+mid*0.2})`;
    ctx.lineWidth = 0.5 + mid;
    ctx.stroke();

    // Frequency blob - organic shape reacting to spectrum
    ctx.beginPath();
    const numPts = 80;
    for (let i=0; i<=numPts; i++) {
      const angle = (i/numPts)*Math.PI*2;
      const fi = Math.floor((i/numPts)*bufLen*0.5);
      const amp = (freqData[fi]||0)/255;
      const r = 12 + amp*38 + bass*18 + Math.sin(angle*4+time)*mid*6;
      const px = cx + Math.cos(angle)*r*2.2;
      const py = cy + Math.sin(angle)*r;
      i===0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py);
    }
    ctx.closePath();
    const bHue = hueBase % 360;
    ctx.strokeStyle = `hsla(${bHue},${70+bass*30}%,${40+bass*25}%,${0.3+bass*0.4})`;
    ctx.lineWidth = 0.6 + bass;
    ctx.stroke();

    // Subtle spectral dots on transients (not rising - just flash and fade)
    if (energy > 0.45 && Math.random() < energy*0.3) {
      const px = Math.random()*W;
      const py = Math.random()*H;
      ctx.beginPath();
      ctx.arc(px, py, 0.8+Math.random()*1.5, 0, Math.PI*2);
      ctx.fillStyle = `hsla(${(hueBase+Math.random()*90)%360},70%,65%,${0.15+energy*0.2})`;
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
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
    scale=Math.min(fw,fh,1);
    tx=(container.clientWidth-img.naturalWidth*scale)/2;
    ty=(container.clientHeight-img.naturalHeight*scale)/2;
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
  document.querySelectorAll('.node-image, .zoomable').forEach(img=>{
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

document.addEventListener('DOMContentLoaded',()=>{
  const overlay=document.getElementById('page-transition');
  if(overlay)overlay.classList.remove('active');
  recordVisit();
  initBackButton();
  initCoordinates();
  initImageZoom();
  initWarp();
});
