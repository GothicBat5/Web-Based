
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const canvasWrap = document.getElementById('canvasWrap');
const magnifier = document.getElementById('magnifier');
const magCanvas = document.getElementById('magCanvas');
const magCtx = magCanvas.getContext('2d');
const mainSwatch = document.getElementById('mainSwatch');
const swatchHint = document.getElementById('swatchHint');
const canvasBadge = document.getElementById('canvasBadge');
const clearImgBtn = document.getElementById('clearImgBtn');

let colorHistory = [];
let imgLoaded = false;

//files loading
dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => loadImage(e.target.files[0]));


dropZone.addEventListener('dragover', e => { e.preventDefault();
  dropZone.classList.add('drag-over');
});


dropZone.addEventListener('dragleave', () => { dropZone.classList.remove('drag-over');
});


dropZone.addEventListener('drop', e => {e.preventDefault();
  dropZone.classList.remove('drag-over');
  loadImage(e.dataTransfer.files[0]);
});


function loadImage(file) 
{

  if (!file || !file.type.startsWith('image/')) 
  {
    return;
  }

  const img = new Image();
  const reader = new FileReader();

  reader.onload = () => {
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      dropZone.style.display = 'none';
      canvasWrap.classList.add('visible');
      canvasBadge.textContent = `${img.width} × ${img.height}`;
      canvasBadge.classList.add('active');
      clearImgBtn.style.display = 'inline-block';
      imgLoaded = true;
    };

    img.src = reader.result;
  };

  reader.readAsDataURL(file);
}

//mouse
canvasWrap.addEventListener('mousemove', e => {

  if (!imgLoaded) 
  {
    return;
  }

  const { x, y } = getCanvasPos(e);
  updateColor(x, y, false);
  updateMagnifier(e, x, y);
});


canvasWrap.addEventListener('mouseleave', () => {
  magnifier.style.display = 'none';
});


canvasWrap.addEventListener('click', e => {

  if (!imgLoaded) 
  {
    return; 
  }

  const { x, y } = getCanvasPos(e);
  updateColor(x, y, true);
});

/**
 * Converts a mouse event into canvas pixel coordinates,
 * accounting for CSS scaling between the display size and
 * the actual canvas resolution.
 */

function getCanvasPos(e) 
{

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: Math.floor((e.clientX - rect.left) * scaleX),
    y: Math.floor((e.clientY - rect.top)  * scaleY),
  };
}


function updateColor(x, y, pick) 
{

  const pixel = ctx.getImageData(x, y, 1, 1).data;
  const r = pixel[0];
  const g = pixel[1];
  const b = pixel[2];

  const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
  const rgb = `rgb(${r}, ${g}, ${b})`;
  const hsl = rgbToHsl(r, g, b);

  //live la
  mainSwatch.style.background = rgb;
  swatchHint.classList.add('hidden');

  document.getElementById('hexVal').textContent = hex.toUpperCase();
  document.getElementById('rgbVal').textContent = `${r}, ${g}, ${b}`;
  document.getElementById('hslVal').textContent = `${hsl.h}°, ${hsl.s}%, ${hsl.l}%`;

  document.getElementById('barR').style.width = (r / 255 * 100) + '%';
  document.getElementById('barG').style.width = (g / 255 * 100) + '%';
  document.getElementById('barB').style.width = (b / 255 * 100) + '%';

  document.getElementById('valR').textContent = r;
  document.getElementById('valG').textContent = g;
  document.getElementById('valB').textContent = b;

  generateTints(r, g, b);

  if (pick) 
  {
    addToHistory(hex, rgb);
  }
}

/*
 * Positions the loupe relative to the canvas element (not the wrapper)
 * so it correctly accounts for object-fit letterbox padding.
 */
function updateMagnifier(e, cx, cy) 
{

  const canvasRect = canvas.getBoundingClientRect();
  const wrapRect = canvasWrap.getBoundingClientRect();

  const mx = canvasRect.left - wrapRect.left + (e.clientX - canvasRect.left);
  const my = canvasRect.top - wrapRect.top  + (e.clientY - canvasRect.top);

  magnifier.style.left = mx + 'px';
  magnifier.style.top = my + 'px';
  magnifier.style.display = 'block';

  const zoom = 5;
  const size = 90;
  const srcX = cx - size / zoom / 2;
  const srcY = cy - size / zoom / 2;

  magCtx.clearRect(0, 0, size, size);
  magCtx.imageSmoothingEnabled = false;
  magCtx.drawImage(canvas, srcX, srcY, size / zoom, size / zoom, 0, 0, size, size);
}

//conversations

function rgbToHsl(r, g, b) 
{

  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;

  if (max === min) 
  {
    h = s = 0;
  } 

  else 
  {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) 
    {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function generateTints(r, g, b) 
{

  const row = document.getElementById('tintsRow');
  const steps = [0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 0.9];
  row.innerHTML = '';

  // Shades (darkest → base)
  for (let i = steps.length - 1; i >= 0; i--) 
  {
    const f = steps[i];
    const hex = toHex(Math.round(r * f), Math.round(g * f), Math.round(b * f));
    row.appendChild(makeSwatch(hex, false));
  }

  const baseHex = toHex(r, g, b);
  row.appendChild(makeSwatch(baseHex, true));

  for (let i = 0; i < steps.length; i++) 
  {

    const f = steps[i];
    const hex = toHex(Math.round(r + (255 - r) * f),Math.round(g + (255 - g) * f), Math.round(b + (255 - b) * f),);
    row.appendChild(makeSwatch(hex, false));
  }
}

function toHex(r, g, b) 
{
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function makeSwatch(hex, isBase) 
{
  const el = document.createElement('div');
  el.className = 'tint-swatch';
  el.style.background = hex;
  el.title = hex + (isBase ? ' (base)' : '');

  if (isBase) 
  {
    el.style.outline = '2px solid white';
    el.style.outlineOffset = '2px';
  }

  el.addEventListener('click', () => copyText(hex));
  return el;
}

//clear image

function clearImage() 
{

  imgLoaded = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvasWrap.classList.remove('visible');
  dropZone.style.display = '';
  magnifier.style.display = 'none';

  canvasBadge.textContent = 'No image loaded';
  canvasBadge.classList.remove('active');
  clearImgBtn.style.display = 'none';
  fileInput.value = ''; //allows re-selecting the same file
  mainSwatch.style.background = '#1e1e24';
  swatchHint.classList.remove('hidden');

  document.getElementById('hexVal').textContent = '—';
  document.getElementById('rgbVal').textContent = '—';
  document.getElementById('hslVal').textContent = '—';

  document.getElementById('barR').style.width = '0%';
  document.getElementById('barG').style.width = '0%';
  document.getElementById('barB').style.width = '0%';
  document.getElementById('valR').textContent = '0';
  document.getElementById('valG').textContent = '0';
  document.getElementById('valB').textContent = '0';

  document.getElementById('tintsRow').innerHTML =
    '<div style="font-size:0.7rem;color:var(--muted);font-family:\'DM Mono\',monospace">Pick a color to generate palette</div>';
}

function addToHistory(hex, rgb) 
{

  if (colorHistory.find(c => c.hex === hex.toUpperCase())) return;
  colorHistory.unshift({ hex: hex.toUpperCase(), rgb });
  if (colorHistory.length > 16) colorHistory.pop();
  renderHistory();
}

function renderHistory() 
{

  const grid = document.getElementById('historyGrid');

  if (!colorHistory.length) 
  {
    grid.innerHTML = '<div class="history-empty">No colors picked yet</div>';
    return;
  }

  grid.innerHTML = '';
  colorHistory.forEach(c => {
    const el = document.createElement('div');
    el.className = 'history-swatch';
    el.style.background = c.rgb;
    el.setAttribute('data-hex', c.hex);
    el.addEventListener('click', () => copyText(c.hex));
    grid.appendChild(el);
  });
}

function clearHistory() 
{
  colorHistory = [];
  renderHistory();
}

const copyValues = {
  hex: () => document.getElementById('hexVal').textContent,
  rgb: () => `rgb(${document.getElementById('rgbVal').textContent})`,
  hsl: () => `hsl(${document.getElementById('hslVal').textContent})`,
};

function copyValue(type) 
{

  const val = copyValues[type]?.();

  if (val && val !== '—') 
  {
    copyText(val);
  }
}

function copyText(text) 
{
  navigator.clipboard.writeText(text).then(() => showToast(`Copied ${text}`));
}

function showToast(msg) 
{
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}
