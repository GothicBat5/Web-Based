// curves.js — RGB Tone Curves with draggable control points
(function () {
    const W = 200;
    const H = 200;
    const POINT_RADIUS = 6;

    const channels = ["rgb", "r", "g", "b"];
    const channelColors = {
        rgb: { line: "#ffffff", bg: "#1e1e1e", point: "#ffffff" },
        r: { line: "#e05555", bg: "#1e1212", point: "#e05555" },
        g: { line: "#55cc55", bg: "#121e12", point: "#55cc55" },
        b: { line: "#4488ee", bg: "#12121e", point: "#4488ee" },
    };

    // Default control points per channel: input -> output (0..1)
    function defaultPoints() 
    {
        return [{ x: 0, y: 0 }, { x: 1, y: 1 }];
    }

    const state = {
        activeChannel: "rgb",
        curves: {
            rgb: defaultPoints(),
            r: defaultPoints(),
            g: defaultPoints(),
            b: defaultPoints(),
        },
        luts: {
            rgb: buildLUT(defaultPoints()),
            r: buildLUT(defaultPoints()),
            g: buildLUT(defaultPoints()),
            b: buildLUT(defaultPoints()),
        },
    };

    let curveCanvas, curveCtx;

    function buildLUT(points) 
    {
        const sorted = [...points].sort((a, b) => a.x - b.x);
        const lut = new Uint8ClampedArray(256);

        for (let i = 0; i < 256; i++) 
        {
            const t = i / 255;
            lut[i] = Math.round(clamp01(cubicInterp(sorted, t)) * 255);
        }
        return lut;
    }

    function cubicInterp(pts, t) 
    {
        if (pts.length === 1) return pts[0].y;
        if (t <= pts[0].x) return pts[0].y;
        if (t >= pts[pts.length - 1].x) return pts[pts.length - 1].y;

        // Find segment
        let i = 0;
        while (i < pts.length - 2 && pts[i + 1].x < t) i++;

        const p0 = pts[Math.max(0, i - 1)];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[Math.min(pts.length - 1, i + 2)];

        const t0 = (t - p1.x) / (p2.x - p1.x);

        // Catmull-Rom
        const m1 = (p2.y - p0.y) / (p2.x - p0.x + 1e-10);
        const m2 = (p3.y - p1.y) / (p3.x - p1.x + 1e-10);
        const dx = p2.x - p1.x;

        return (
            (2 * t0 * t0 * t0 - 3 * t0 * t0 + 1) * p1.y +
            (t0 * t0 * t0 - 2 * t0 * t0 + t0) * m1 * dx +
            (-2 * t0 * t0 * t0 + 3 * t0 * t0) * p2.y +
            (t0 * t0 * t0 - t0 * t0) * m2 * dx
        );
    }

    function clamp01(v) { return Math.max(0, Math.min(1, v)); }

    function drawCurve() 
    {
        const ch = state.activeChannel;
        const col = channelColors[ch];
        const pts = state.curves[ch];

        curveCtx.fillStyle = col.bg;
        curveCtx.fillRect(0, 0, W, H);

        // Grid
        curveCtx.strokeStyle = "rgba(255,255,255,0.07)";
        curveCtx.lineWidth = 1;

        for (let i = 1; i < 4; i++) 
        {
            const v = (i / 4) * W;
            curveCtx.beginPath();
            curveCtx.moveTo(v, 0); curveCtx.lineTo(v, H);
            curveCtx.moveTo(0, v); curveCtx.lineTo(W, v);
            curveCtx.stroke();
        }

        // Diagonal reference
        curveCtx.strokeStyle = "rgba(255,255,255,0.1)";
        curveCtx.lineWidth = 1;
        curveCtx.setLineDash([4, 4]);
        curveCtx.beginPath();
        curveCtx.moveTo(0, H); curveCtx.lineTo(W, 0);
        curveCtx.stroke();
        curveCtx.setLineDash([]);

        // Curve line
        const lut = state.luts[ch];
        curveCtx.strokeStyle = col.line;
        curveCtx.lineWidth = 2;
        curveCtx.beginPath();

        for (let x = 0; x < 256; x++) 
        {
            const cx = (x / 255) * W;
            const cy = H - (lut[x] / 255) * H;
            x === 0 ? curveCtx.moveTo(cx, cy) : curveCtx.lineTo(cx, cy);
        }
        curveCtx.stroke();

        // Control points
        pts.forEach((pt, idx) => {
            const cx = pt.x * W;
            const cy = H - pt.y * H;
            curveCtx.beginPath();
            curveCtx.arc(cx, cy, POINT_RADIUS, 0, Math.PI * 2);
            curveCtx.fillStyle = col.point;
            curveCtx.fill();
            curveCtx.strokeStyle = "#000";
            curveCtx.lineWidth = 1.5;
            curveCtx.stroke();
        });
    }

    let draggingIdx = -1;

    function getPos(e) {
        const rect = curveCanvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clamp01((clientX - rect.left) / W),
            y: clamp01(1 - (clientY - rect.top) / H),
        };
    }

    function hitTest(pos) 
    {
        const pts = state.curves[state.activeChannel];

        for (let i = 0; i < pts.length; i++) 
        {
            const dx = pos.x - pts[i].x;
            const dy = pos.y - pts[i].y;
            if (Math.sqrt(dx * dx + dy * dy) < POINT_RADIUS / W * 1.8) return i;
        }
        return -1;
    }

    function onDown(e) 
    {
        e.preventDefault();
        const pos = getPos(e);
        const hit = hitTest(pos);
        const pts = state.curves[state.activeChannel];

        if (hit !== -1) {
            draggingIdx = hit;
        } 
        else {
            // Add new point (not on endpoints)
            if (pos.x > 0.02 && pos.x < 0.98) 
            {
                pts.push({ x: pos.x, y: pos.y });
                pts.sort((a, b) => a.x - b.x);
                draggingIdx = pts.findIndex(p => p.x === pos.x && p.y === pos.y);
            }
        }
        rebuildAndDraw();
    }

    function onMove(e) {
        if (draggingIdx === -1) return;
        e.preventDefault();
        const pos = getPos(e);
        const pts = state.curves[state.activeChannel];
        const pt = pts[draggingIdx];

        // Lock endpoints to x=0 and x=1
        if (draggingIdx === 0) 
        {
            pt.y = pos.y; pt.x = 0;
        } 
        else if (draggingIdx === pts.length - 1) 
        {
            pt.y = pos.y; pt.x = 1;
        } 
        else {
            pt.x = clamp01(pos.x);
            pt.y = clamp01(pos.y);
        }

        rebuildAndDraw();
        if (window.applyEffects) window.applyEffects();
    }

    function onUp(e) {
        draggingIdx = -1;
    }

    function onDblClick(e) 
    {
        const pos = getPos(e);
        const pts = state.curves[state.activeChannel];
        const hit = hitTest(pos);

        if (hit !== -1 && hit !== 0 && hit !== pts.length - 1) 
        {
            pts.splice(hit, 1);
            rebuildAndDraw();
            if (window.applyEffects) window.applyEffects();
        }
    }

    function rebuildAndDraw() 
    {
        const ch = state.activeChannel;
        state.luts[ch] = buildLUT(state.curves[ch]);
        drawCurve();
    }

    function init() 
    {
        const container = document.getElementById("curves-container");
        if (!container) return;

        // Channel tabs
        const tabs = document.createElement("div");
        tabs.className = "curves-tabs";
        channels.forEach(ch => {
            const btn = document.createElement("button");
            btn.textContent = ch.toUpperCase();
            btn.className = "curves-tab" + (ch === "rgb" ? " active" : "");
            btn.dataset.ch = ch;
            btn.addEventListener("click", () => {
                state.activeChannel = ch;
                tabs.querySelectorAll(".curves-tab").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                drawCurve();
            });
            tabs.appendChild(btn);
        });

        // Reset button
        const resetBtn = document.createElement("button");
        resetBtn.textContent = "Reset";
        resetBtn.className = "curves-tab curves-reset";
        resetBtn.addEventListener("click", () => {
            channels.forEach(ch => {
                state.curves[ch] = defaultPoints();
                state.luts[ch]   = buildLUT(defaultPoints());
            });
            drawCurve();
            if (window.applyEffects) window.applyEffects();
        });
        tabs.appendChild(resetBtn);

        container.appendChild(tabs);

        // Canvas
        curveCanvas = document.createElement("canvas");
        curveCanvas.width  = W;
        curveCanvas.height = H;
        curveCanvas.style.cursor = "crosshair";
        container.appendChild(curveCanvas);
        curveCtx = curveCanvas.getContext("2d");

        // Hint
        const hint = document.createElement("p");
        hint.className = "curves-hint";
        hint.textContent = "Click to add point · Double-click to remove";
        container.appendChild(hint);

        curveCanvas.addEventListener("mousedown", onDown);
        curveCanvas.addEventListener("mousemove", onMove);
        curveCanvas.addEventListener("mouseup", onUp);
        curveCanvas.addEventListener("dblclick", onDblClick);
        curveCanvas.addEventListener("touchstart", onDown, { passive: false });
        curveCanvas.addEventListener("touchmove", onMove, { passive: false });
        curveCanvas.addEventListener("touchend", onUp);

        drawCurve();
    }

    function applyCurves(pixels) {
        const rgbLut = state.luts.rgb;
        const rLut = state.luts.r;
        const gLut = state.luts.g;
        const bLut = state.luts.b;

        for (let i = 0; i < pixels.length; i += 4) 
        {
            pixels[i] = rLut[rgbLut[pixels[i]]];
            pixels[i + 1] = gLut[rgbLut[pixels[i + 1]]];
            pixels[i + 2] = bLut[rgbLut[pixels[i + 2]]];
        }
    }

    window.Curves = { init, applyCurves };
})();