/* THE ENDLING SAGA — CURSOR WARP
   A subtle reality distortion that follows the cursor.
   The background warps and bulges where you move.
   You are affecting this reality by being here.
*/

(function() {

  // Inject SVG filter
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  svg.innerHTML = `
    <defs>
      <filter id="reality-warp" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence
          id="warp-turbulence"
          type="turbulence"
          baseFrequency="0.015 0.015"
          numOctaves="3"
          seed="2"
          result="noise"/>
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale="0"
          xChannelSelector="R"
          yChannelSelector="G"
          result="displaced"/>
      </filter>
    </defs>
  `;
  document.body.appendChild(svg);

  const turbulence = document.getElementById('warp-turbulence');
  const displacementMap = svg.querySelector('feDisplacementMap');

  // Apply to background images only — text stays crisp
  function applyFilter() {
    document.querySelectorAll('.bg-image').forEach(bg => {
      const existing = bg.style.filter || '';
      if (!existing.includes('reality-warp')) {
        bg.style.filter = 'url(#reality-warp) ' + existing;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyFilter);
  } else {
    applyFilter();
  }

  let targetScale = 0;
  let currentScale = 0;
  let targetFreq = 0.015;
  let currentFreq = 0.015;
  let animating = false;
  let idleTimer = null;

  window.addEventListener('mousemove', (e) => {
    const nx = e.clientX / window.innerWidth;
    const ny = e.clientY / window.innerHeight;
    const distFromCentre = Math.sqrt(Math.pow(nx - 0.5, 2) + Math.pow(ny - 0.5, 2));

    targetScale = 3 + distFromCentre * 10;
    targetFreq = 0.012 + nx * 0.008;

    if (!animating) {
      animating = true;
      requestAnimationFrame(tick);
    }

    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      targetScale = 0;
      targetFreq = 0.015;
    }, 600);
  });

  function tick() {
    currentScale += (targetScale - currentScale) * 0.07;
    currentFreq += (targetFreq - currentFreq) * 0.04;

    if (turbulence) turbulence.setAttribute('baseFrequency', `${currentFreq.toFixed(4)} 0.015`);
    if (displacementMap) displacementMap.setAttribute('scale', currentScale.toFixed(2));

    if (Math.abs(currentScale - targetScale) > 0.1 || currentScale > 0.1) {
      requestAnimationFrame(tick);
    } else {
      if (displacementMap) displacementMap.setAttribute('scale', '0');
      animating = false;
    }
  }

  // Hover warp on interactive text elements
  const style = document.createElement('style');
  style.textContent = `
    .nav-btn:hover,
    .enter-btn:hover {
      filter: url(#reality-warp) !important;
    }
  `;
  document.head.appendChild(style);

})();
