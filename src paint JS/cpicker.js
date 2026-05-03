
const ColorPicker = (() => {
  let _h = 0, _s = 0, _v = 0;
  let _fgColor = { r: 0, g: 0, b: 0 };
  let _bgColor = { r: 255, g: 255, b: 255 };
  let _onChange = null;

  let svCanvas, svCtx, svCursor;

  let hueCanvas, hueCtx, hueCursor;

  let hexInput, rInput, gInput, bInput;

  let newPreview, oldPreview;

  let fgSwatch, bgSwatch;

  let _draggingSV = false;
  let _draggingHue = false;

  function hsvToRgb(h, s, v) 
  {

    let r, g, b;
    const i = Math.floor(h / 60) % 6;

    const f = h / 60 - Math.floor(h / 60);

    const p = v * (1 - s);

    const q = v * (1 - f * s);

    const t = v * (1 - (1 - f) * s);

    switch (i) 
    {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  function rgbToHsv(r, g, b) 
  {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;

    let h = 0, s = max === 0 ? 0 : d / max, v = max;

    if (d !== 0) 
    {

      switch (max) 
      {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: h * 360, s, v };
  }

  function rgbToHex(r, g, b) 
  {
    return [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  function hexToRgb(hex) 
  {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const n = parseInt(hex, 16);
    if (isNaN(n)) return null;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function rgbToCss(rgb) 
  {
    return `rgb(${rgb.r},${rgb.g},${rgb.b})`;
  }

  function drawSVBox() 
  {
    if (!svCtx) return;
    const w = svCanvas.width, h = svCanvas.height;

    const hueRgb = hsvToRgb(_h, 1, 1);

    const gradH = svCtx.createLinearGradient(0, 0, w, 0);

    gradH.addColorStop(0, '#ffffff');
    gradH.addColorStop(1, `rgb(${hueRgb.r},${hueRgb.g},${hueRgb.b})`);
    svCtx.fillStyle = gradH;
    svCtx.fillRect(0, 0, w, h);

    const gradV = svCtx.createLinearGradient(0, 0, 0, h);
    gradV.addColorStop(0, 'rgba(0,0,0,0)');
    gradV.addColorStop(1, 'rgba(0,0,0,1)');
    svCtx.fillStyle = gradV;
    svCtx.fillRect(0, 0, w, h);
  }

  function drawHueBar() 
  {
    if (!hueCtx) return;
    const w = hueCanvas.width, h = hueCanvas.height;

    const grad = hueCtx.createLinearGradient(0, 0, 0, h);

    const stops = [0, 60, 120, 180, 240, 300, 360];


    stops.forEach(deg => {
      const rgb = hsvToRgb(deg, 1, 1);
      grad.addColorStop(deg / 360, `rgb(${rgb.r},${rgb.g},${rgb.b})`);
    });


    hueCtx.fillStyle = grad;
    hueCtx.fillRect(0, 0, w, h);
  }

  function updateSVCursor() 
  {
    if (!svCursor || !svCanvas) return;
    const x = _s * svCanvas.width;

    const y = (1 - _v) * svCanvas.height;

    svCursor.style.left = x + 'px';
    svCursor.style.top = y + 'px';
  }

  function updateHueCursor() 
  {
    if (!hueCursor || !hueCanvas) return;
    const y = (_h / 360) * hueCanvas.height;

    hueCursor.style.top = y + 'px';
  }

  function _updateAll(silent = false) 
  {

    const rgb = hsvToRgb(_h, _s, _v);
    _fgColor = rgb;
    drawSVBox();
    updateSVCursor();
    updateHueCursor();
    _syncInputs(rgb);
    _syncSwatches();
    if (!silent && _onChange) 
    {
      _onChange(rgb);
    }

  }

  function _syncInputs(rgb) 
  {

    if (hexInput) 
    {
      hexInput.value = rgbToHex(rgb.r, rgb.g, rgb.b);
    }

    if (rInput) 
    {
      rInput.value = rgb.r;
    }

    if (gInput) 
    {
      gInput.value = rgb.g;
    }

    if (bInput) 
    {
      bInput.value = rgb.b;
    }

    if (newPreview) 
    {
      newPreview.style.background = rgbToCss(rgb);
    }

  }

  function _syncSwatches() 
  {

    if (fgSwatch) 
    {
      fgSwatch.style.background = rgbToCss(_fgColor);
    }

    if (bgSwatch) 
    {
      bgSwatch.style.background = rgbToCss(_bgColor);
    }
  }

  function onSVMouseDown(e) 
  {
    _draggingSV = true;
    onSVMove(e);
  }
  function onSVMove(e) 
  {
    if (!_draggingSV) return;
    const rect = svCanvas.getBoundingClientRect();

    const scaleX = svCanvas.width / rect.width;

    const scaleY = svCanvas.height / rect.height;

    let x = (e.clientX - rect.left) * scaleX;

    let y = (e.clientY - rect.top) * scaleY;

    x = Math.max(0, Math.min(svCanvas.width, x));

    y = Math.max(0, Math.min(svCanvas.height, y));

    _s = x / svCanvas.width;
    _v = 1 - y / svCanvas.height;
    _updateAll();
  }

  function onHueMouseDown(e) {
    _draggingHue = true;
    onHueMove(e);
  }
  function onHueMove(e) 
  {
    if (!_draggingHue) return;
    const rect = hueCanvas.getBoundingClientRect();

    let y = e.clientY - rect.top;

    y = Math.max(0, Math.min(hueCanvas.height, y));

    _h = (y / hueCanvas.height) * 360;
    _updateAll();
  }

  function onHexInput() 
  {
    const rgb = hexToRgb(hexInput.value);

    if (!rgb) return;
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

    _h = hsv.h; _s = hsv.s; _v = hsv.v;
    _updateAll();
  }

  function onRgbInput() 
  {
    const r = parseInt(rInput.value) || 0;

    const g = parseInt(gInput.value) || 0;

    const b = parseInt(bInput.value) || 0;

    const hsv = rgbToHsv(Math.max(0, Math.min(255, r)),Math.max(0, Math.min(255, g)),Math.max(0, Math.min(255, b)) );

    _h = hsv.h; _s = hsv.s; _v = hsv.v;
    _updateAll();
  }

  function init(opts = {}) 
  {
    _onChange = opts.onChange || null;

    svCanvas = document.getElementById('sv-canvas');
    svCtx = svCanvas.getContext('2d');
    svCursor = document.getElementById('sv-cursor');

    hueCanvas = document.getElementById('hue-canvas');
    hueCtx = hueCanvas.getContext('2d');
    hueCursor = document.getElementById('hue-cursor');

    hexInput = document.getElementById('hex-input');
    rInput = document.getElementById('r-input');
    gInput = document.getElementById('g-input');
    bInput = document.getElementById('b-input');

    newPreview = document.getElementById('new-color-preview');
    oldPreview = document.getElementById('old-color-preview');

    fgSwatch = document.getElementById('fg-color-swatch');
    bgSwatch = document.getElementById('bg-color-swatch');

    drawHueBar();
    _updateAll(true);

    svCanvas.addEventListener('mousedown', onSVMouseDown);

    svCanvas.addEventListener('touchstart', e => {
      e.preventDefault();
      _draggingSV = true;
      onSVMove(e.touches[0]);
    }, { passive: false });

    hueCanvas.addEventListener('mousedown', onHueMouseDown);

    hueCanvas.addEventListener('touchstart', e => {
      e.preventDefault();
      _draggingHue = true;
      onHueMove(e.touches[0]);
    }, { passive: false });

    window.addEventListener('mousemove', e => {
      onSVMove(e);
      onHueMove(e);
    });


    window.addEventListener('mouseup', () => {
      if (_draggingSV || _draggingHue) 
      {

        if (oldPreview) 
        {
          oldPreview.style.background = rgbToCss(_fgColor);
        }
      }
      _draggingSV = false;
      _draggingHue = false;
    });


    window.addEventListener('touchmove', e => {
      onSVMove(e.touches[0]);
      onHueMove(e.touches[0]);
    });


    window.addEventListener('touchend', () => {
      _draggingSV = false;
      _draggingHue = false;
    });


    hexInput.addEventListener('change', onHexInput);
    hexInput.addEventListener('keydown', e => { if (e.key === 'Enter') onHexInput(); });
    rInput.addEventListener('input', onRgbInput);
    gInput.addEventListener('input', onRgbInput);
    bInput.addEventListener('input', onRgbInput);

    if (oldPreview) 
    {
      oldPreview.style.background = '#000000';

      oldPreview.addEventListener('click', () => {
        const rgb = _fgColor;
        // swap to old
        const bg = oldPreview.style.background;
        setColor(bg, false);
      });

    }

    if (fgSwatch) 
    {

      fgSwatch.addEventListener('click', () => {
        svCanvas.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  }

  function setColor(colorVal, silent = false) 
  {

    let rgb;

    if (typeof colorVal === 'string') 
    {

      const m = colorVal.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);

      if (m) rgb = { r: +m[1], g: +m[2], b: +m[3] };
      else rgb = hexToRgb(colorVal);
    } else {
      rgb = colorVal;
    }

    if (!rgb) return;
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    _h = hsv.h; _s = hsv.s; _v = hsv.v;
    _updateAll(silent);
  }

  function getColor() 
  { 
    return { ..._fgColor }; 
  }

  function getBgColor() 
  { 
    return { ..._bgColor }; 
  }

  function getColorCss() 
  { 
    return rgbToCss(_fgColor); 
  }

  function getBgColorCss() 
  { 
    return rgbToCss(_bgColor); 
  }

  function getRgbToHex(r,g,b) 
  { 
    return rgbToHex(r,g,b); 
  }

  function swapColors() 
  {

    const tmp = { ..._fgColor };
    _fgColor = { ..._bgColor };
    _bgColor = tmp;
    const hsv = rgbToHsv(_fgColor.r, _fgColor.g, _fgColor.b);
    _h = hsv.h; _s = hsv.s; _v = hsv.v;
    _updateAll();
  }

  function resetColors() 
  {
    _bgColor = { r: 255, g: 255, b: 255 };
    setColor({ r: 0, g: 0, b: 0 });
  }

  return { init, setColor, getColor, getBgColor, getColorCss, getBgColorCss, swapColors, resetColors, rgbToHex: getRgbToHex, hsvToRgb };
})();