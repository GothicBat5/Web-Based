
const Eraser = (() => {
  let _ctx = null;
  let _lastX = 0, _lastY = 0;
  let _size = 20;
  let _hardness = 0.8;
  let _opacity = 1.0;

  function interpolatePoints(x0, y0, x1, y1, spacing) 
  {

    const dx = x1 - x0, dy = y1 - y0;

    const dist = Math.sqrt(dx * dx + dy * dy);

    const steps = Math.max(1, Math.floor(dist / spacing));

    const pts = [];

    for (let i = 0; i <= steps; i++) 
    {
      pts.push({ x: x0 + (dx * i) / steps, y: y0 + (dy * i) / steps });
    }
    return pts;
  }

  function eraseDab(x, y) 
  {
    if (!_ctx) return;
    const r = _size / 2;

    _ctx.save();
    _ctx.globalCompositeOperation = 'destination-out';

    const grad = _ctx.createRadialGradient(x, y, 0, x, y, r);

    grad.addColorStop(0, `rgba(0,0,0,${_opacity})`);
    grad.addColorStop(_hardness, `rgba(0,0,0,${_opacity})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    _ctx.fillStyle = grad;
    _ctx.beginPath();
    _ctx.arc(x, y, r, 0, Math.PI * 2);
    _ctx.fill();
    _ctx.restore();
  }

  function beginStroke(ctx, x, y) 
  {
    _ctx = ctx;
    _lastX = x; _lastY = y;
    eraseDab(x, y);
  }

  function continueStroke(x, y) 
  {
    if (!_ctx) return;
    const spacing = Math.max(1, _size * 0.15);

    const pts = interpolatePoints(_lastX, _lastY, x, y, spacing);

    for (let i = 1; i < pts.length; i++) 
    {
      eraseDab(pts[i].x, pts[i].y);
    }
    _lastX = x; _lastY = y;
  }

  function endStroke() 
  {
    _ctx = null;
  }

  function setSettings({ size, hardness, opacity } = {}) 
  {

    if (size !== undefined) 
    {
      _size = size;
    }

    if (hardness !== undefined) 
    {
      _hardness = hardness;
    }

    if (opacity !== undefined) 
    {
      _opacity = opacity;
    }
  }

  function getSize() { return _size; }

  return { beginStroke, continueStroke, endStroke, setSettings, getSize };
})();