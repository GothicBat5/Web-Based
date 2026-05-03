

(function () {

  let _activeTool = 'brush'; //brush | eraser | eyedropper | fill
  let _isDrawing = false;

  function init() {

    ColorPicker.init({
      onChange: (rgb) => {
        Brushes.setSettings({ color: rgb });
        updateBrushPreview();
      }
    });

    Canvas.init({
      width: 1200,
      height: 800,
      onDraw: handleDraw,
    });

    Brushes.setSettings({
      type: 'round',
      size: 20,
      opacity: 1.0,
      hardness: 0.8,
      spacing: 5,
      color: ColorPicker.getColor()
    });

    Eraser.setSettings({ size: 20, hardness: 0.8, opacity: 1.0 });

    bindToolbar();

    bindOptionsBar();

    bindMenu();

    buildSwatchesPalette();

    bindKeyboard();

    Canvas.setCursorStyle('circle');

    Canvas.setCursorSize(20);

    updateBrushPreview();

    _eyedropperPreview = document.getElementById('eyedropper-preview');
    _eyedropperColor = document.getElementById('eyedropper-color');
    _eyedropperHex = document.getElementById('eyedropper-hex');

    document.getElementById('fg-color-swatch')?.addEventListener('click', () => {
      document.getElementById('sv-canvas')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });


    document.getElementById('swap-colors')?.addEventListener('click', () => {
      ColorPicker.swapColors();
      Brushes.setSettings({ color: ColorPicker.getColor() });
      updateBrushPreview();
    });


    document.getElementById('reset-colors')?.addEventListener('click', () => {
      ColorPicker.resetColors();
      Brushes.setSettings({ color: ColorPicker.getColor() });
      updateBrushPreview();
    });
  }

  function handleDraw(phase, x, y, e) 
  {
    const ctx = Canvas.getCtx();

    switch (_activeTool) 
    {

      case 'brush':
        if (phase === 'begin') 
        {
          _isDrawing = true;
          Brushes.beginStroke(ctx, x, y);
        } 

        else if (phase === 'move' && _isDrawing) 
        {
          Brushes.continueStroke(x, y);
        } 

        else if (phase === 'end') 
        {
          Brushes.endStroke();
          _isDrawing = false;
        }
        break;

      case 'eraser':
        if (phase === 'begin') 
        {
          _isDrawing = true;
          Eraser.beginStroke(ctx, x, y);
        } 

        else if (phase === 'move' && _isDrawing) 
        {
          Eraser.continueStroke(x, y);
        } 

        else if (phase === 'end') 
        {
          Eraser.endStroke();
          _isDrawing = false;
        }
        break;

      case 'eyedropper':
        if (phase === 'begin' || (phase === 'move' && e && e.buttons === 1)) 
        {
          const rgb = Canvas.pickColor(x, y);

          if (rgb) 
          {
            _showEyedropperPreview(e.clientX || 0, e.clientY || 0, rgb);

            if (phase === 'begin') 
            {
              ColorPicker.setColor(rgb);
              Brushes.setSettings({ color: rgb });
              updateBrushPreview();
            }

          }
        } 
        else if (phase === 'end') 
        {
          _hideEyedropperPreview();
          //switch back to brush after picking
          setTimeout(() => setActiveTool('brush'), 100);
        }
        break;

      case 'fill':
        if (phase === 'begin') 
        {
          Canvas.floodFill(x, y, ColorPicker.getColor());
        }
        break;
    }
  }

  let _eyedropperPreview, _eyedropperColor, _eyedropperHex;

  function _showEyedropperPreview(cx, cy, rgb) 
  {
    if (!_eyedropperPreview)
    {
      return;
    }

    _eyedropperPreview.style.display = 'flex';

    _eyedropperPreview.style.left = cx + 'px';

    _eyedropperPreview.style.top = cy + 'px';

    const cssColor = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
    _eyedropperColor.style.background = cssColor;

    _eyedropperHex.textContent = '#' + [rgb.r, rgb.g, rgb.b]

      .map(x => x.toString(16).padStart(2, '0')).join('');
  }


  function _hideEyedropperPreview() 
  {
    if (_eyedropperPreview) 
    {
      _eyedropperPreview.style.display = 'none';
    }
  }

  function bindToolbar() 
  {

    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tool = btn.dataset.tool;
        setActiveTool(tool);
      });
    });
  }

  function setActiveTool(tool) 
  {
    _activeTool = tool;
    _isDrawing = false;
    Brushes.endStroke();
    Eraser.endStroke();
    _hideEyedropperPreview();

    //active state
    document.querySelectorAll('.tool-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tool === tool);
    });

    if (tool === 'brush') 
    {
      Canvas.setCursorStyle('circle');
      Canvas.setCursorSize(Brushes.getSettings().size);
    } 

    else if (tool === 'eraser') 
    {
      Canvas.setCursorStyle('circle');
      Canvas.setCursorSize(Eraser.getSize());
    } 

    else 
    {
      Canvas.setCursorStyle('crosshair');
    }

    updateOptionsBar(tool);
  }

  function bindOptionsBar() 
  {
    const sizeSlider = document.getElementById('brush-size');

    const sizeVal = document.getElementById('brush-size-val');

    const opacitySlider = document.getElementById('brush-opacity');

    const opacityVal = document.getElementById('brush-opacity-val');

    const hardnessSlider = document.getElementById('brush-hardness');

    const hardnessVal = document.getElementById('brush-hardness-val');

    const typeSelect = document.getElementById('brush-type-select');

    const spacingSlider = document.getElementById('brush-spacing');

    const spacingVal = document.getElementById('brush-spacing-val');

    sizeSlider?.addEventListener('input', () => {
      const v = parseInt(sizeSlider.value);
      sizeVal.textContent = v;
      Brushes.setSettings({ size: v });
      Eraser.setSettings({ size: v });
      Canvas.setCursorSize(v);
      updateBrushPreview();
    });


    opacitySlider?.addEventListener('input', () => {
      const v = parseInt(opacitySlider.value);
      opacityVal.textContent = v + '%';
      Brushes.setSettings({ opacity: v / 100 });
      Eraser.setSettings({ opacity: v / 100 });
      updateBrushPreview();
    });


    hardnessSlider?.addEventListener('input', () => {
      const v = parseInt(hardnessSlider.value);
      hardnessVal.textContent = v + '%';
      Brushes.setSettings({ hardness: v / 100 });
      Eraser.setSettings({ hardness: v / 100 });
      updateBrushPreview();
    });


    typeSelect?.addEventListener('change', () => {
      Brushes.setSettings({ type: typeSelect.value });
      updateBrushPreview();
      //spacing for spray
      const spacingGroup = document.getElementById('opt-spacing');
      if (spacingGroup) {
        spacingGroup.style.display = typeSelect.value === 'spray' ? 'flex' : 'none';
      }
    });


    spacingSlider?.addEventListener('input', () => {
      const v = parseInt(spacingSlider.value);
      spacingVal.textContent = v;
      Brushes.setSettings({ spacing: v });
    });
  }

  function updateOptionsBar(tool) 
  {

    const hardnessGroup = document.getElementById('opt-hardness');

    const spacingGroup = document.getElementById('opt-spacing');

    const brushTypeGroup = document.getElementById('opt-brush-type');

    if (tool === 'eraser') 
    {
      if (brushTypeGroup) brushTypeGroup.style.display = 'none';
      if (spacingGroup) spacingGroup.style.display = 'none';
      if (hardnessGroup) hardnessGroup.style.display = 'flex';
    } 

    else if (tool === 'brush') 
    {
      if (brushTypeGroup) brushTypeGroup.style.display = 'flex';
      if (hardnessGroup) hardnessGroup.style.display = 'flex';
    } 

    else 
    {
      if (brushTypeGroup) brushTypeGroup.style.display = 'none';
      if (hardnessGroup) hardnessGroup.style.display = 'none';
      if (spacingGroup) spacingGroup.style.display = 'none';
    }
  }

  function updateBrushPreview() 
  {
    const previewCanvas = document.getElementById('brush-preview-canvas');
    if (!previewCanvas) return;
    Brushes.drawPreview(previewCanvas);
  }

  function bindMenu() 
  {
    document.getElementById('btn-save')?.addEventListener('click', () => {
      FileIO.exportPNG(Canvas.getCanvas());
    });

    document.getElementById('btn-clear')?.addEventListener('click', () => {
      if (confirm('Clear the canvas? This cannot be undone.')) 
      {
        Canvas.clearCanvas();
      }
    });

    document.getElementById('btn-new')?.addEventListener('click', () => {
      FileIO.newCanvas((w, h) => {
        Canvas.resize(w, h);
        Canvas.clearCanvas();
      });
    });
  }

  function bindKeyboard() 
  {
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')
      {
        return;
      }

      switch (e.key.toLowerCase()) 
      {

        case 'b': setActiveTool('brush'); break;

        case 'e': setActiveTool('eraser'); break;

        case 'i': setActiveTool('eyedropper'); break;

        case 'g': setActiveTool('fill'); break;

        case 'x': ColorPicker.swapColors(); Brushes.setSettings({ color: ColorPicker.getColor() }); break;

        case 'd': ColorPicker.resetColors(); Brushes.setSettings({ color: ColorPicker.getColor() }); break;

        case '[': {
          const s = document.getElementById('brush-size');

          if (s) 
          { 

            s.value = Math.max(1, parseInt(s.value) - 5); 
            s.dispatchEvent(new Event('input')); 
          }
          break;
        }

        case ']': {
          const s = document.getElementById('brush-size');

          if (s) 
          {

            s.value = Math.min(200, parseInt(s.value) + 5); 
            s.dispatchEvent(new Event('input')); 
          }
          break;
        }

        case '+':
        case '=': Canvas.zoomIn(); break;

        case '-': Canvas.zoomOut(); break;

        case '0': Canvas.zoomFit(); break;

        case 's':
          if (e.ctrlKey || e.metaKey) 
          {
            e.preventDefault();
            FileIO.exportPNG(Canvas.getCanvas());
          }
          break;
      }
    });
  }

  const PALETTE = [
    '#000000','#2c2c2c','#555555','#808080','#aaaaaa','#d4d4d4','#f0f0f0','#ffffff',
    '#7f0000','#bf0000','#ff0000','#ff4040','#ff8080','#ffbfbf','#ffe0e0','#fff0f0',
    '#7f3f00','#bf5f00','#ff7f00','#ff9f40','#ffbf80','#ffd9b3','#ffedd9','#fff6ec',
    '#7f7f00','#bfbf00','#ffff00','#ffff40','#ffff80','#ffffb3','#ffffe0','#fffff0',
    '#007f00','#00bf00','#00ff00','#40ff40','#80ff80','#b3ffb3','#d9ffd9','#f0fff0',
    '#007f7f','#00bfbf','#00ffff','#40ffff','#80ffff','#b3ffff','#d9ffff','#f0ffff',
    '#00007f','#0000bf','#0000ff','#4040ff','#8080ff','#b3b3ff','#d9d9ff','#f0f0ff',
    '#7f007f','#bf00bf','#ff00ff','#ff40ff','#ff80ff','#ffb3ff','#ffd9ff','#fff0ff',
    '#4a1942','#6b2fa0','#8b5cf6','#a78bfa','#c4b5fd','#ddd6fe','#ede9fe','#f5f3ff',
    '#7c2d12','#c2410c','#ea580c','#f97316','#fb923c','#fdba74','#fed7aa','#ffedd5',
  ];

  function buildSwatchesPalette() 
  {
    const grid = document.getElementById('swatches-grid');
    if (!grid) return;

    PALETTE.forEach(hex => {
      const cell = document.createElement('div');
      cell.className = 'swatch-cell';
      cell.style.background = hex;
      cell.title = hex;
      
      cell.addEventListener('click', () => {
        ColorPicker.setColor(hex);
        Brushes.setSettings({ color: ColorPicker.getColor() });
        updateBrushPreview();
      });
      grid.appendChild(cell);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();