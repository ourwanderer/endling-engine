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
  const visited = EngineSession.getVisited();

  // Phase 1: pure weighted random (first 12 clicks)
  // Phase 2: deprioritise visited, let zone coherence emerge
  let adjusted = pool.map(item => {
    let w = item.weight || 1;
    if (clicks >= 12) {
      // After 12 clicks: heavily penalise visited nodes
      if (EngineSession.hasVisited(item.url)) w = Math.max(0.1, w * 0.15);
    } else {
      // Before 12 clicks: lightly penalise visited
      if (EngineSession.hasVisited(item.url)) w = Math.max(0.3, w * 0.5);
    }
    return { url: item.url, weight: w };
  });

  // If all options are visited, reset weights (avoid dead end)
  const totalWeight = adjusted.reduce((s,i)=>s+i.weight,0);
  if (totalWeight < 0.5) adjusted = pool;

  const total = adjusted.reduce((s,i)=>s+(i.weight||1),0);
  let r = Math.random()*total;
  for (const item of adjusted) {
    r -= (item.weight||1);
    if (r<=0) return item.url;
  }
  return adjusted[adjusted.length-1].url;
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

  // Abstract particle/waveform visualiser
  let particles = [];
  let time = 0;

  function drawAbstract() {
    if (!analyser || audio.paused) return;
    rafId = requestAnimationFrame(drawAbstract);
    time += 0.012;

    const W=canvas.width, H=canvas.height;
    const bufLen = analyser.frequencyBinCount;
    const freqData = new Uint8Array(bufLen);
    const waveData = new Uint8Array(analyser.fftSize);
    analyser.getByteFrequencyData(freqData);
    analyser.getByteTimeDomainData(waveData);

    // Bass, mid, high energy
    const bass = freqData.slice(0, 10).reduce((a,b)=>a+b,0)/10/255;
    const mid  = freqData.slice(10,80).reduce((a,b)=>a+b,0)/70/255;
    const high = freqData.slice(80,128).reduce((a,b)=>a+b,0)/48/255;

    // Fade trail
    ctx.fillStyle = 'rgba(10,6,8,0.18)';
    ctx.fillRect(0,0,W,H);

    const cx=W/2, cy=H/2;

    // Central pulsing orb
    const orbR = 6 + bass*28 + mid*8;
    const grd = ctx.createRadialGradient(cx,cy,0,cx,cy,orbR*2.5);
    grd.addColorStop(0, `rgba(${140+Math.floor(bass*115)},${26+Math.floor(mid*40)},${26+Math.floor(high*30)},0.9)`);
    grd.addColorStop(0.5, `rgba(80,15,15,0.4)`);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(cx,cy,orbR*2.5,0,Math.PI*2);
    ctx.fillStyle=grd;
    ctx.fill();

    // Orbiting frequency rings
    const numRings = 3;
    for (let r=0; r<numRings; r++) {
      const ringR = 18 + r*22 + bass*20;
      const numPts = 64;
      ctx.beginPath();
      for (let i=0; i<=numPts; i++) {
        const angle = (i/numPts)*Math.PI*2;
        const fi = Math.floor((i/numPts)*bufLen*0.6);
        const amp = (freqData[fi]||0)/255;
        const distort = amp*(8+r*6) + Math.sin(angle*3+time+r)*2*mid;
        const px = cx + Math.cos(angle+time*0.3*(r+1))*(ringR+distort);
        const py = cy + Math.sin(angle+time*0.3*(r+1))*(ringR+distort)*0.55;
        i===0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py);
      }
      ctx.closePath();
      const alpha = 0.15 + amp*0.5;
      const hue = 0 + r*15 + Math.floor(high*40);
      ctx.strokeStyle = `hsla(${hue},80%,${40+Math.floor(bass*30)}%,${0.4+mid*0.4})`;
      ctx.lineWidth = 0.8+bass*1.5;
      ctx.stroke();
    }

    // Waveform ribbon across centre
    ctx.beginPath();
    for (let i=0; i<waveData.length; i++) {
      const x = (i/waveData.length)*W;
      const v = (waveData[i]-128)/128;
      const y = cy + v*(H*0.22) + Math.sin(i*0.08+time)*mid*8;
      i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    }
    ctx.strokeStyle=`rgba(${180+Math.floor(bass*75)},${60+Math.floor(mid*60)},${60},${0.35+high*0.4})`;
    ctx.lineWidth=1+bass*1.5;
    ctx.stroke();

    // Particle burst on bass hits
    if (bass > 0.55) {
      for (let i=0; i<3; i++) {
        const angle = Math.random()*Math.PI*2;
        const speed = 1+Math.random()*3*bass;
        particles.push({
          x:cx, y:cy,
          vx:Math.cos(angle)*speed,
          vy:Math.sin(angle)*speed*0.5,
          life:1, decay:0.04+Math.random()*0.04,
          r: 160+Math.floor(Math.random()*95),
          g: 20+Math.floor(Math.random()*40),
          b: 20+Math.floor(Math.random()*20),
          size: 1+Math.random()*2.5
        });
      }
    }

    // Draw + age particles
    particles = particles.filter(p=>{
      p.x+=p.vx; p.y+=p.vy; p.vy+=0.04; p.life-=p.decay;
      if (p.life<=0) return false;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
      ctx.fillStyle=`rgba(${p.r},${p.g},${p.b},${p.life*0.8})`;
      ctx.fill();
      return true;
    });

    // Keep particles array sane
    if (particles.length>120) particles.splice(0, particles.length-120);
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

  let scale=1, minScale=0.3, maxScale=4, tx=0, ty=0;
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
