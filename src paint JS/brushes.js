
const Brushes = (() => {

  let _ctx = null;
  let _lastX = 0, _lastY = 0;
  let _lastPressure = 1.0;
  let _lastTime = 0;
  let _strokeStarted = false; //for path-based brushes::round, calligraphy

  const settings = {
    type: 'round',
    size: 20,
    opacity: 1.0,
    hardness: 0.8,
    spacing: 5,
    color: { r: 0, g: 0, b: 0 }
  };

  function getPressure(x, y) 
  {

    const now = performance.now();

    const dt = Math.max(now - _lastTime, 1);

    const dx = x - _lastX, dy = y - _lastY;

    const speed = Math.sqrt(dx * dx + dy * dy) / dt;
    _lastTime = now;

    const raw = Math.max(0.2, 1 - speed * 0.08);
    _lastPressure = _lastPressure * 0.7 + raw * 0.3; //smooth
    return _lastPressure;
  }

  function interpolatePoints(x0, y0, x1, y1, spacing) 
  {
    const dx = x1 - x0, dy = y1 - y0;

    const dist = Math.sqrt(dx * dx + dy * dy);

    const steps = Math.max(1, Math.floor(dist / spacing));

    const pts = [];

    for (let i = 0; i <= steps; i++) 
    {
      pts.push({x: x0 + (dx * i) / steps, y: y0 + (dy * i) / steps});
    }
    return pts;
  }

  function colorStr(alpha) 
  {

    const { r, g, b } = settings.color;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function _setRoundStrokeStyle(pressure = 1) 
  {

    const { r, g, b } = settings.color;
    _ctx.strokeStyle = `rgba(${r},${g},${b},${settings.opacity})`;
    _ctx.lineWidth = Math.max(1, settings.size * pressure);
    _ctx.lineCap = 'round';
    _ctx.lineJoin = 'round';
  }

  function beginRoundStroke(x, y, pressure = 1) 
  {

    if (!_ctx) return;
    _ctx.save();
    _setRoundStrokeStyle(pressure);
    _ctx.beginPath();
    _ctx.moveTo(x, y);
    _ctx.lineTo(x + 0.01, y + 0.01);
    _ctx.stroke();
    _ctx.beginPath();
    _ctx.moveTo(x, y);
  }

  function continueRoundStroke(x, y, pressure = 1) 
  {
    if (!_ctx) return;
    _setRoundStrokeStyle(pressure);
    _ctx.lineTo(x, y);
    _ctx.stroke();
    _ctx.beginPath();
    _ctx.moveTo(x, y);
  }

  function endRoundStroke() 
  {
    if (_ctx) _ctx.restore();
  }

  function drawSoftDab(x, y, pressure = 1) 
  {
    if (!_ctx) return;
    const r = (settings.size / 2) * pressure;
    const alpha = settings.opacity * 0.15 * pressure;

    _ctx.save();
    const grad = _ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, colorStr(alpha));
    grad.addColorStop(0.5, colorStr(alpha * 0.6));
    grad.addColorStop(1, colorStr(0));
    _ctx.fillStyle = grad;
    _ctx.beginPath();
    _ctx.arc(x, y, r, 0, Math.PI * 2);
    _ctx.fill();
    _ctx.restore();
  }

  function drawSprayDab(x, y, pressure = 1) 
  {
    if (!_ctx) return;
    const r = (settings.size / 2) * pressure;
    const density = Math.floor(r * 3 * settings.opacity);
    const dotSize = Math.max(0.5, settings.size * 0.025);

    _ctx.save();
    _ctx.fillStyle = colorStr(settings.opacity * 0.6 * pressure);

    for (let i = 0; i < density; i++) 
    {
      const angle = Math.random() * Math.PI * 2;
      const rnd = Math.sqrt(-2 * Math.log(Math.random() + 0.001));
      const dist = (rnd / 3) * r;
      const px = x + Math.cos(angle) * dist;
      const py = y + Math.sin(angle) * dist;

      _ctx.beginPath();
      _ctx.arc(px, py, dotSize, 0, Math.PI * 2);
      _ctx.fill();
    }

    _ctx.restore();
  }

  function drawPixelDab(x, y) 
  {
    if (!_ctx) return;
    const size = Math.max(1, Math.round(settings.size));

    const px = Math.floor(x - size / 2);

    const py = Math.floor(y - size / 2);

    const { r, g, b } = settings.color;

    const a = Math.round(settings.opacity * 255);

    _ctx.save();
    _ctx.fillStyle = `rgba(${r},${g},${b},${settings.opacity})`;
    _ctx.imageSmoothingEnabled = false;
    _ctx.fillRect(px, py, size, size);
    _ctx.restore();
  }

  const CALLI_ANGLE = -Math.PI / 5; //36° nib slant
  const CALLI_RATIO = 0.18;         //thin-axis / size ratio


  function _calliOffsets(pressure = 1) 
  {

    const halfW = (settings.size / 2) * pressure;

    const halfH = halfW * CALLI_RATIO;

    const wx =  Math.cos(CALLI_ANGLE) * halfW;

    const wy =  Math.sin(CALLI_ANGLE) * halfW;

    const hx = -Math.sin(CALLI_ANGLE) * halfH;

    const hy =  Math.cos(CALLI_ANGLE) * halfH;

    return { wx, wy, hx, hy };
  }

  function _calliSetStyle(pressure = 1) 
  {
    const { r, g, b } = settings.color;
    _ctx.fillStyle = `rgba(${r},${g},${b},${settings.opacity})`;
  }

  function _calliStampNib(x, y, pressure = 1) 
  {

    const { wx, wy, hx, hy } = _calliOffsets(pressure);
    _ctx.beginPath();

    _ctx.moveTo(x - wx - hx, y - wy - hy);
    _ctx.lineTo(x + wx - hx, y + wy - hy);
    _ctx.lineTo(x + wx + hx, y + wy + hy);
    _ctx.lineTo(x - wx + hx, y - wy + hy);
    _ctx.closePath();
    _ctx.fill();
  }

  function beginCalligraphyStroke(x, y, pressure = 1) 
  {
    if (!_ctx) return;
    _ctx.save();
    _calliSetStyle(pressure);
    _calliStampNib(x, y, pressure);
  }

function continueCalligraphyStroke(x, y, pressure = 1) 
{
  if (!_ctx) return;

  const spacing = Math.max(1, settings.spacing);
  const pts = interpolatePoints(_lastX, _lastY, x, y, spacing);

  for (let i = 1; i < pts.length; i++) 
  {
    const p = pts[i];

    // Smooth pressure across segment
    const pPressure = _lastPressure * 0.6 + pressure * 0.4;

    const cur = _calliOffsets(pPressure);
    const prev = _calliOffsets(_lastPressure);

    _ctx.beginPath();

    // Build a proper ribbon (consistent edges)
    _ctx.moveTo(_lastX - prev.wx, _lastY - prev.wy);
    _ctx.lineTo(_lastX + prev.wx, _lastY + prev.wy);
    _ctx.lineTo(p.x + cur.wx,  p.y + cur.wy);
    _ctx.lineTo(p.x - cur.wx,  p.y - cur.wy);

    _ctx.closePath();
    _ctx.fill();

    _lastX = p.x;
    _lastY = p.y;
    _lastPressure = pPressure;
  }
}

  function endCalligraphyStroke() 
  {
    if (_ctx) _ctx.restore();
  }


  function _stampBased(x, y, pressure) 
  {

    switch (settings.type) 
    {
      case 'soft':  drawSoftDab(x, y, pressure); break;
      case 'spray': drawSprayDab(x, y, pressure); break;
      case 'pixel': drawPixelDab(x, y); break;
    }
  }

  function _isPathBased() 
  {
    return settings.type === 'round' || settings.type === 'calligraphy';
  }

  function beginStroke(ctx, x, y) 
  {
    _ctx = ctx;
    _lastX = x;
    _lastY = y;
    _lastTime = performance.now();
    _lastPressure = 1.0;

    if (settings.type === 'round') 
    {
      beginRoundStroke(x, y, 1.0);
    } 

    else if (settings.type === 'calligraphy') 
    {
      beginCalligraphyStroke(x, y, 1.0);
    } 

    else {
      _stampBased(x, y, 1.0);
    }
  }

  function continueStroke(x, y) 
  {
    if (!_ctx) return;
    const pressure = getPressure(x, y);

    if (settings.type === 'round') 
    {
      continueRoundStroke(x, y, pressure);
    } 

    else if (settings.type === 'calligraphy') 
    {
      continueCalligraphyStroke(x, y, pressure);
    } 

    else {
      const spacing = Math.max(1, settings.spacing);
      const pts = interpolatePoints(_lastX, _lastY, x, y, spacing);

      for (let i = 1; i < pts.length; i++) 
      {
        _stampBased(pts[i].x, pts[i].y, pressure);
      }
    }
    _lastX = x;
    _lastY = y;
    _lastPressure = pressure;
  }

  function endStroke() 
  {
    if (settings.type === 'round') endRoundStroke();
    else if (settings.type === 'calligraphy') endCalligraphyStroke();

    _ctx = null;
  }

  function drawPreview(canvas) 
  {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, w, h);

    const savedCtx = _ctx;
    _ctx = ctx;
    const savedColor = { ...settings.color };
    settings.color = { r: 255, g: 255, b: 255 };

    const y = h / 2;
    const margin = 16;
    const savedType = settings.type;

    _lastX = margin;
    _lastY = y;
    _lastTime = performance.now() - 100;
    _lastPressure = 1.0;
    beginStroke(ctx, margin, y);

    const steps = 30;

    for (let i = 1; i <= steps; i++) 
    {
      const t = i / steps;
      const px = margin + t * (w - margin * 2);
      const py = y + Math.sin(t * Math.PI * 2) * (h * 0.2);
      _lastTime = performance.now() - (steps - i) * 3;
      continueStroke(px, py);
    }

    endStroke();

    _ctx = savedCtx;
    settings.color = savedColor;
  }

  function setSettings(opts) 
  {
    Object.assign(settings, opts);
  }

  function getSettings() {
    return { ...settings };
  }

  return {
    beginStroke,
    continueStroke,
    endStroke,
    setSettings,
    getSettings,
    drawPreview
  };
})();