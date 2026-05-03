
const Canvas = (() => {
  let mainCanvas, mainCtx;
  let overlayCanvas;
  let container;
  let scrollWrap;

  let _zoom = 1.0;
  const ZOOM_STEPS = [0.1, 0.25, 0.33, 0.5, 0.67, 0.75, 1, 1.25, 1.5, 2, 3, 4, 6, 8];
  let _zoomIndex = 6; //start at 1.0

  let _W = 1200, _H = 800;

  let _onDraw = null;
  let _onColorPick = null;

  function init({ width = 1200, height = 800, onDraw, onColorPick } = {}) 
  {
    _W = width; _H = height;

    _onDraw = onDraw;

    _onColorPick = onColorPick;

    mainCanvas = document.getElementById('main-canvas');

    overlayCanvas = document.getElementById('overlay-canvas');

    container = document.getElementById('canvas-container');

    scrollWrap = document.getElementById('canvas-scroll-wrap');

    mainCanvas.width = _W;
    mainCanvas.height = _H;
    overlayCanvas.width = _W;
    overlayCanvas.height = _H;

    mainCtx = mainCanvas.getContext('2d');
    mainCtx.fillStyle = '#ffffff';
    mainCtx.fillRect(0, 0, _W, _H);

    _applyZoom();
    _bindEvents();
    _updateZoomLabel();
    _updateCanvasInfo();
  }

  function _applyZoom() 
  {
    const z = _zoom;
    container.style.width = (_W * z) + 'px';
    container.style.height = (_H * z) + 'px';
    mainCanvas.style.width = (_W * z) + 'px';
    mainCanvas.style.height = (_H * z) + 'px';
    overlayCanvas.style.width = (_W * z) + 'px';
    overlayCanvas.style.height = (_H * z) + 'px';
  }

  function _updateZoomLabel() 
  {
    const el = document.getElementById('zoom-level');
    if (el) el.textContent = Math.round(_zoom * 100) + '%';
  }

  function _updateCanvasInfo() {
    const el = document.getElementById('canvas-info');
    if (el) el.textContent = `${_W} × ${_H}`;
  }

  function clientToCanvas(clientX, clientY) 
  {
    const rect = mainCanvas.getBoundingClientRect();

    return {
      x: (clientX - rect.left) * (_W / rect.width),
      y: (clientY - rect.top) * (_H / rect.height)
    };
  }

  function _bindEvents() 
  {
    mainCanvas.addEventListener('mousedown', _onMouseDown);

    mainCanvas.addEventListener('mousemove', _onMouseMove);

    mainCanvas.addEventListener('mouseup', _onMouseUp);

    mainCanvas.addEventListener('mouseleave', _onMouseLeave);

    mainCanvas.addEventListener('touchstart', _onTouchStart, { passive: false });

    mainCanvas.addEventListener('touchmove', _onTouchMove, { passive: false });

    mainCanvas.addEventListener('touchend', _onTouchEnd);

    scrollWrap.addEventListener('wheel', _onWheel, { passive: false });

    document.getElementById('zoom-in')?.addEventListener('click', zoomIn);

    document.getElementById('zoom-out')?.addEventListener('click', zoomOut);

    document.getElementById('zoom-fit')?.addEventListener('click', zoomFit);
  }

  let _isDrawing = false;

  function _onMouseDown(e) 
  {
    if (e.button !== 0) return;

    _isDrawing = true;

    const pos = clientToCanvas(e.clientX, e.clientY);

    if (_onDraw) _onDraw('begin', pos.x, pos.y, e);
  }

  function _onMouseMove(e) 
  {
    const pos = clientToCanvas(e.clientX, e.clientY);

    _updateCustomCursor(e.clientX, e.clientY, pos);

    if (_isDrawing) 
    {
      if (_onDraw) _onDraw('move', pos.x, pos.y, e);
    }
  }

  function _onMouseUp(e)
  {
    _isDrawing = false;

    if (_onDraw) _onDraw('end', 0, 0, e);
  }

  function _onMouseLeave() 
  {
    _isDrawing = false;

    if (_onDraw) _onDraw('end', 0, 0, {});
    _hideCursor();
  }

  function _onTouchStart(e) 
  {
    e.preventDefault();
    _isDrawing = true;
    const t = e.touches[0];
    const pos = clientToCanvas(t.clientX, t.clientY);
    if (_onDraw) _onDraw('begin', pos.x, pos.y, t);
  }

  function _onTouchMove(e) 
  {
    e.preventDefault();
    const t = e.touches[0];
    const pos = clientToCanvas(t.clientX, t.clientY);
    if (_isDrawing && _onDraw) _onDraw('move', pos.x, pos.y, t);
  }

  function _onTouchEnd(e) 
  {
    _isDrawing = false;
    if (_onDraw) _onDraw('end', 0, 0, {});
  }

  function _onWheel(e) 
  {

    if (e.ctrlKey || e.metaKey) 
    {
      e.preventDefault();
      if (e.deltaY < 0) zoomIn();
      else zoomOut();
    }
  }

  let _cursorEl = null;
  let _cursorSize = 20;
  let _cursorVisible = false;

  function _initCursor() 
  {
    _cursorEl = document.getElementById('custom-cursor');
  }

  function _updateCustomCursor(clientX, clientY, canvasPos) 
  {
    if (!_cursorEl) _initCursor();
    if (!_cursorEl) return;

    _cursorEl.style.display = 'block';

    _cursorEl.style.left = clientX + 'px';

    _cursorEl.style.top = clientY + 'px';

    const displaySize = _cursorSize * _zoom;

    _cursorEl.style.width = displaySize + 'px';

    _cursorEl.style.height = displaySize + 'px';

    _cursorVisible = true;
  }

  function _hideCursor() 
  {
    if (!_cursorEl) return;
    _cursorEl.style.display = 'none';
    _cursorVisible = false;
  }

  function setCursorSize(size) {
    _cursorSize = size;
  }

  function setCursorStyle(style) 
  {
    if (!_cursorEl) _initCursor();
    if (!_cursorEl) return;

    if (style === 'crosshair') 
    {
      _cursorEl.style.borderRadius = '0';
      _cursorEl.style.width = '12px';
      _cursorEl.style.height = '12px';
      _cursorEl.style.border = '1.5px solid rgba(255,255,255,0.8)';
      _cursorEl.style.transform = 'translate(-50%,-50%) rotate(45deg)';
    } 

    else if (style === 'circle') 
    {
      _cursorEl.style.borderRadius = '50%';
      _cursorEl.style.transform = 'translate(-50%,-50%)';
      _cursorEl.style.border = '1.5px solid rgba(255,255,255,0.8)';
    }
  }

  function zoomIn() 
  {
    _zoomIndex = Math.min(ZOOM_STEPS.length - 1, _zoomIndex + 1);
    _zoom = ZOOM_STEPS[_zoomIndex];
    _applyZoom();
    _updateZoomLabel();
  }

  function zoomOut() 
  {
    _zoomIndex = Math.max(0, _zoomIndex - 1);
    _zoom = ZOOM_STEPS[_zoomIndex];
    _applyZoom();
    _updateZoomLabel();
  }

  function zoomFit() 
  {
    const ww = scrollWrap.clientWidth - 40;
    const wh = scrollWrap.clientHeight - 40;
    const scaleX = ww / _W;
    const scaleY = wh / _H;
    _zoom = Math.min(scaleX, scaleY, 1);
    let closest = 0, minDiff = Infinity;

    ZOOM_STEPS.forEach((s, i) => {
      const d = Math.abs(s - _zoom);

      if (d < minDiff) 
      { 
          minDiff = d; closest = i; 
      }

    });

    _zoomIndex = closest;
    _zoom = ZOOM_STEPS[_zoomIndex];
    _applyZoom();
    _updateZoomLabel();
  }

  function floodFill(startX, startY, fillColor) 
  {

    startX = Math.floor(startX);
    startY = Math.floor(startY);
    if (startX < 0 || startY < 0 || startX >= _W || startY >= _H) return;

    const imageData = mainCtx.getImageData(0, 0, _W, _H);
    const data = imageData.data;
    const idx = (startY * _W + startX) * 4;
    const targetR = data[idx], targetG = data[idx+1], targetB = data[idx+2], targetA = data[idx+3];
    const { r: fillR, g: fillG, b: fillB } = fillColor;

    if (targetR === fillR && targetG === fillG && targetB === fillB && targetA === 255) return;

    const tolerance = 30;

    function match(i) 
    {
      return Math.abs(data[i] - targetR) <= tolerance &&
             Math.abs(data[i+1] - targetG) <= tolerance &&
             Math.abs(data[i+2] - targetB) <= tolerance &&
             Math.abs(data[i+3] - targetA) <= tolerance;
    }

    const stack = [[startX, startY]];
    const visited = new Uint8Array(_W * _H);

    while (stack.length > 0) 
    {

      const [x, y] = stack.pop();

      if (x < 0 || x >= _W || y < 0 || y >= _H) continue;

      const vi = y * _W + x;

      if (visited[vi]) continue;

      const di = vi * 4;

      if (!match(di)) continue;

      visited[vi] = 1;
      data[di] = fillR;
      data[di+1] = fillG;
      data[di+2] = fillB;
      data[di+3] = 255;
      stack.push([x+1, y], [x-1, y], [x, y+1], [x, y-1]);
    }

    mainCtx.putImageData(imageData, 0, 0);
  }

  function pickColor(x, y) 

  {
    x = Math.floor(x); y = Math.floor(y);
    if (x < 0 || y < 0 || x >= _W || y >= _H) return null;
    const px = mainCtx.getImageData(x, y, 1, 1).data;
    return { r: px[0], g: px[1], b: px[2] };
  }

  function clearCanvas() 
  {
    mainCtx.fillStyle = '#ffffff';
    mainCtx.fillRect(0, 0, _W, _H);
  }

  function resize(width, height) 
  {
    const temp = document.createElement('canvas');
    temp.width = _W; temp.height = _H;
    temp.getContext('2d').drawImage(mainCanvas, 0, 0);

    _W = width; _H = height;
    mainCanvas.width = _W;
    mainCanvas.height = _H;
    overlayCanvas.width = _W;
    overlayCanvas.height = _H;

    mainCtx.fillStyle = '#ffffff';
    mainCtx.fillRect(0, 0, _W, _H);
    mainCtx.drawImage(temp, 0, 0);

    _applyZoom();
    _updateCanvasInfo();
  }

  function getCtx() 
  { 
    return mainCtx; 
  }

  function getCanvas() 
  { 
    return mainCanvas; 
  }

  function getSize() 
  { 
    return { width: _W, height: _H }; 
  }

  function getZoom() 
  { 
    return _zoom; 
  }

  return {
    init,
    clientToCanvas,
    setCursorSize,
    setCursorStyle,
    zoomIn, zoomOut, zoomFit,
    floodFill,
    pickColor,
    clearCanvas,
    resize,
    getCtx,
    getCanvas,
    getSize,
    getZoom
  };
})();