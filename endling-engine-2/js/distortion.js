/* THE ENDLING SAGA — CURSOR DISTORTION
   A subtle ripple distortion that follows the cursor.
   "You are affecting reality by being here."
*/

(function() {
  const canvas = document.getElementById('distortion-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  let width, height;
  let mouseX = -999, mouseY = -999;
  let ripples = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  // Track mouse
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Add a ripple on move (throttled)
    if (Math.random() < 0.12) {
      ripples.push({
        x: mouseX,
        y: mouseY,
        radius: 0,
        maxRadius: 40 + Math.random() * 30,
        opacity: 0.35,
        speed: 0.8 + Math.random() * 0.6,
      });
    }
  });

  // Click creates a larger burst
  window.addEventListener('click', (e) => {
    for (let i = 0; i < 3; i++) {
      ripples.push({
        x: e.clientX + (Math.random() - 0.5) * 20,
        y: e.clientY + (Math.random() - 0.5) * 20,
        radius: 0,
        maxRadius: 60 + Math.random() * 40,
        opacity: 0.5,
        speed: 1.2 + Math.random() * 0.8,
      });
    }
  });

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Draw and update ripples
    ripples = ripples.filter(r => r.opacity > 0.01);

    for (const r of ripples) {
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(139, 26, 26, ${r.opacity})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Inner glow
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius * 0.6, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(192, 57, 43, ${r.opacity * 0.4})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      r.radius += r.speed;
      r.opacity *= 0.94;
    }

    // Subtle persistent glow at cursor position
    if (mouseX > 0) {
      const grad = ctx.createRadialGradient(
        mouseX, mouseY, 0,
        mouseX, mouseY, 25
      );
      grad.addColorStop(0, 'rgba(139, 26, 26, 0.08)');
      grad.addColorStop(1, 'rgba(139, 26, 26, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 25, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  draw();
})();
