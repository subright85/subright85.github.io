// Three short studies for the decorative band above the navigation.
(() => {
  const canvas = document.querySelector('.motion-strip');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const study = new URLSearchParams(location.search).get('motion');
  const isContour = study !== 'print' && study !== 'field';
  canvas.classList.toggle('contour-landscape', isContour);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame;
  let started;

  function draw(time) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const progress = reduced.matches ? 1 : Math.min(1, (time - started) / 4000);
    const phase = 1 - (1 - progress) ** 3;
    ctx.clearRect(0, 0, width, height);
    const colors = ['#e2abd0', '#a99bc8', '#7fa8af'];
    if (study === 'print') {
      // Offset layers slide into register like ink passes on a press.
      ctx.globalCompositeOperation = 'screen';
      colors.forEach((color, layer) => {
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.52;
        for (let x = -48; x < width + 48; x += 12) {
          const y = height * (0.5 + 0.22 * Math.sin(x / 78));
          ctx.fillRect(x + layer * (2 + 10 * (1 - phase)), y + layer, 3, 7);
        }
      });
    } else if (study === 'field') {
      // A loose field of samples settles into a single distribution.
      for (let i = 0; i < width / 3; i++) {
        const x = i * 3;
        const noise = Math.sin(i * 78.21) * Math.cos(i * 13.17);
        const y = height * (0.5 + noise * (0.38 - 0.27 * phase) + phase * 0.18 * Math.sin(x / 80));
        ctx.fillStyle = colors[i % 3];
        ctx.fillRect(x, y, 2, 2);
      }
    } else {
      // Fine nested contours shift like a cropped topographic print.
      const rows = Math.ceil(height / 10) + 5;
      for (let row = -rows; row <= rows; row++) {
        ctx.strokeStyle = colors[Math.abs(row) % 3];
        ctx.globalAlpha = row % 4 === 0 ? 0.55 : 0.32;
        ctx.beginPath();
        for (let x = 0; x <= width + 4; x += 4) {
          const distance = x / width;
          const ridge = Math.sin(distance * 12 + phase * 0.55 + row * 0.06);
          const shoulder = Math.sin(distance * 21 - phase * 0.3 + row * 0.09);
          const y = height * (0.5 + 0.24 * ridge + 0.09 * shoulder) + row * 5;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    if (progress < 1) frame = requestAnimationFrame(draw);
  }
  function restart() {
    cancelAnimationFrame(frame);
    const scale = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * scale);
    canvas.height = Math.round(canvas.clientHeight * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    started = performance.now();
    draw(started);
  }
  new ResizeObserver(restart).observe(canvas);
  reduced.addEventListener('change', restart);
})();
