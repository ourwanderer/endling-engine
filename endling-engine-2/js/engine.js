/* THE ENDLING SAGA — ENGINE JS v6 */

// ── NAVIGATION ───────────────────────────────────────────────────────────────

function navigateTo(url, delay=400) {
  const overlay = document.getElementById('page-transition');
  if (overlay) { overlay.classList.add('active'); setTimeout(()=>{ window.location.href=url; }, delay); }
  else window.location.href = url;
}

function weightedRandom(pool) {
  const total = pool.reduce((s,i)=>s+(i.weight||1),0);
  let r = Math.random()*total;
  for (const item of pool) { r -= (item.weight||1); if (r<=0) return item.url; }
  return pool[pool.length-1].url;
}

function initDeeperButton(pool) {
  const btn = document.getElementById('btn-deeper');
  if (!btn) return;
  btn.addEventListener('click', e=>{ e.preventDefault(); navigateTo(weightedRandom(pool)); });
}

function initBackButton(fallback='../index.html') {
  const btn = document.getElementById('btn-back');
  if (!btn) return;
  btn.addEventListener('click', e=>{
    e.preventDefault();
    if (window.history.length>1) { navigateTo('javascript:void(0)',50); setTimeout(()=>window.history.back(),100); }
    else navigateTo(fallback);
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
    ts = 3+d*10; tf = 0.013+nx*0.006;
    if (!animating) { animating=true; requestAnimationFrame(tick); }
    clearTimeout(idle);
    idle = setTimeout(()=>{ ts=0; tf=0.015; }, 700);
  });

  function tick() {
    cs+=(ts-cs)*0.07; cf+=(tf-cf)*0.04;
    if (turb) turb.setAttribute('baseFrequency',cf.toFixed(4)+' 0.015');
    if (disp) disp.setAttribute('scale',cs.toFixed(2));
    if (Math.abs(cs-ts)>0.08||cs>0.08) requestAnimationFrame(tick);
    else { if(disp) disp.setAttribute('scale','0'); animating=false; }
  }

  // Hover warp on buttons
  const style = document.createElement('style');
  style.textContent=`.nav-btn:hover,.enter-btn:hover{filter:url(#reality-warp) !important;}`;
  document.head.appendChild(style);
}

// ── AUDIO PLAYER + VISUALISER ────────────────────────────────────────────────

function initAudioPlayer(audioSrc) {
  const audio = new Audio(audioSrc);
  const playBtn = document.getElementById('play-btn');
  const fill = document.getElementById('audio-fill');
  const progressBar = document.getElementById('audio-progress');
  const timeEl = document.getElementById('audio-time');
  const canvas = document.getElementById('visualiser');

  if (!playBtn || !canvas) return;

  let ctx, analyser, source, connected = false;
  const canvasCtx = canvas.getContext('2d');

  function fmt(s) {
    const m=Math.floor(s/60), sec=Math.floor(s%60);
    return m+':'+(sec<10?'0':'')+sec;
  }

  playBtn.addEventListener('click', ()=>{
    if (!connected) {
      ctx = new (window.AudioContext||window.webkitAudioContext)();
      analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source = ctx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(ctx.destination);
      connected = true;
    }
    if (audio.paused) { audio.play(); playBtn.innerHTML='&#9646;&#9646;'; drawVisualiser(); }
    else { audio.pause(); playBtn.innerHTML='&#9654;'; }
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
      const pct=(e.clientX-rect.left)/rect.width;
      audio.currentTime=pct*audio.duration;
    });
  }

  function drawVisualiser() {
    if (!analyser || audio.paused) return;
    requestAnimationFrame(drawVisualiser);
    const W=canvas.width, H=canvas.height;
    const data=new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    canvasCtx.clearRect(0,0,W,H);
    const barW=(W/data.length)*2.2;
    let x=0;
    for (let i=0;i<data.length;i++) {
      const h=(data[i]/255)*H;
      const r=Math.floor(139+(data[i]/255)*116);
      const g=Math.floor(26+(data[i]/255)*30);
      const b=Math.floor(26+(data[i]/255)*20);
      canvasCtx.fillStyle=`rgba(${r},${g},${b},0.85)`;
      canvasCtx.fillRect(x,H-h,barW-1,h);
      x+=barW;
    }
  }

  // Resize canvas
  function resizeCanvas() {
    canvas.width=canvas.offsetWidth;
    canvas.height=canvas.offsetHeight||100;
  }
  resizeCanvas();
  window.addEventListener('resize',resizeCanvas);
}

// ── MAP PAN + ZOOM ────────────────────────────────────────────────────────────

function initMap() {
  const container = document.getElementById('map-container');
  const img = document.getElementById('map-img');
  if (!container || !img) return;

  let scale=1, minScale=0.3, maxScale=4;
  let tx=0, ty=0;
  let dragging=false, lastX=0, lastY=0;

  img.onload = function() {
    // Fit to screen initially
    const fw=container.clientWidth/img.naturalWidth;
    const fh=container.clientHeight/img.naturalHeight;
    scale=Math.min(fw,fh,1);
    tx=(container.clientWidth - img.naturalWidth*scale)/2;
    ty=(container.clientHeight - img.naturalHeight*scale)/2;
    apply();
  };

  function apply() {
    img.style.transform=`translate(${tx}px,${ty}px) scale(${scale})`;
    img.style.transformOrigin='0 0';
  }

  container.addEventListener('mousedown',e=>{ dragging=true; lastX=e.clientX; lastY=e.clientY; });
  window.addEventListener('mouseup',()=>dragging=false);
  window.addEventListener('mousemove',e=>{
    if (!dragging) return;
    tx+=e.clientX-lastX; ty+=e.clientY-lastY;
    lastX=e.clientX; lastY=e.clientY;
    apply();
  });

  container.addEventListener('wheel',e=>{
    e.preventDefault();
    const rect=container.getBoundingClientRect();
    const mx=e.clientX-rect.left, my=e.clientY-rect.top;
    const delta=e.deltaY<0?1.1:0.9;
    const ns=Math.min(maxScale,Math.max(minScale,scale*delta));
    tx=mx-(mx-tx)*(ns/scale);
    ty=my-(my-ty)*(ns/scale);
    scale=ns; apply();
  }, {passive:false});

  // Touch support
  let lastDist=0;
  container.addEventListener('touchstart',e=>{
    if (e.touches.length===1) { dragging=true; lastX=e.touches[0].clientX; lastY=e.touches[0].clientY; }
    if (e.touches.length===2) { lastDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY); }
  });
  container.addEventListener('touchmove',e=>{
    e.preventDefault();
    if (e.touches.length===1&&dragging) {
      tx+=e.touches[0].clientX-lastX; ty+=e.touches[0].clientY-lastY;
      lastX=e.touches[0].clientX; lastY=e.touches[0].clientY; apply();
    }
    if (e.touches.length===2) {
      const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
      const delta=d/lastDist;
      scale=Math.min(maxScale,Math.max(minScale,scale*delta));
      lastDist=d; apply();
    }
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
  if (!img) return;

  function update() {
    img.src=pages[current];
    img.classList.remove('zoomed');
    if (counter) counter.textContent=(current+1)+' / '+pages.length;
    if (prevBtn) prevBtn.disabled=(current===0);
    if (nextBtn) nextBtn.disabled=(current===pages.length-1);
  }

  img.addEventListener('click', e=>{
    if (img.classList.contains('zoomed')) { img.classList.remove('zoomed'); return; }
    const rect=img.getBoundingClientRect();
    const px=((e.clientX-rect.left)/rect.width)*100;
    const py=((e.clientY-rect.top)/rect.height)*100;
    img.style.setProperty('--zoom-x',px+'%');
    img.style.setProperty('--zoom-y',py+'%');
    img.classList.add('zoomed');
  });

  if (prevBtn) prevBtn.addEventListener('click',()=>{ if(current>0){current--;update();} });
  if (nextBtn) nextBtn.addEventListener('click',()=>{ if(current<pages.length-1){current++;update();} });

  update();
}

// ── COORDINATES ──────────────────────────────────────────────────────────────

function initCoordinates() {
  const el=document.querySelector('.coordinates');
  if (!el||!el.dataset.coords) return;
  el.textContent=el.dataset.coords;
}

// ── INIT ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', ()=>{
  const overlay=document.getElementById('page-transition');
  if (overlay) overlay.classList.remove('active');
  initBackButton();
  initCoordinates();
  initWarp();
});
