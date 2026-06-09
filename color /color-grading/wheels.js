// wheels.js — Shadows / Midtones / Highlights Color Wheels
(function () {
    const RADIUS = 72;
    const CENTER = RADIUS + 12;
    const SIZE = CENTER * 2;

    const wheelDefs = [
        { id: "wheel-shadows", key: "shadows", range: [0, 85]  },
        { id: "wheel-midtones", key: "midtones", range: [85, 170] },
        { id: "wheel-highlights", key: "highlights", range: [170, 255] },
    ];

    const state = {
        shadows: { x: 0, y: 0 },
        midtones: { x: 0, y: 0 },
        highlights: { x: 0, y: 0 },
    };

    // Cached wheel background ImageData — drawn once per canvas, reused on every puck redraw
    const bgCache = {};

    function buildWheelBg(canvas) 
    {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, SIZE, SIZE);


        for (let angle = 0; angle < 360; angle += 1) 
        {
            const rad = (angle * Math.PI) / 180;
            const grad = ctx.createRadialGradient(CENTER, CENTER, 0, CENTER, CENTER, RADIUS);
            grad.addColorStop(0, "rgba(128,128,128,1)");
            grad.addColorStop(1, `hsl(${angle},100%,50%)`);
            ctx.beginPath();
            ctx.moveTo(CENTER, CENTER);
            ctx.arc(CENTER, CENTER, RADIUS, rad, rad + (2 * Math.PI / 360) + 0.015);
            ctx.closePath();
            ctx.fillStyle = grad;
            ctx.fill();
        }


        ctx.globalCompositeOperation = "destination-in";
        ctx.beginPath();
        ctx.arc(CENTER, CENTER, RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";


        ctx.beginPath();
        ctx.arc(CENTER, CENTER, RADIUS, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.18)";
        ctx.lineWidth = 1.5;
        ctx.stroke();


        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(CENTER, CENTER - RADIUS); 
        ctx.lineTo(CENTER, CENTER + RADIUS);
        ctx.moveTo(CENTER - RADIUS, CENTER); 
        ctx.lineTo(CENTER + RADIUS, CENTER);
        ctx.stroke();

        return ctx.getImageData(0, 0, SIZE, SIZE);
    }

    function drawWheel(canvas, key) 
    {
        const ctx = canvas.getContext("2d");

        // Restore cached background
        if (bgCache[key]) 
        {
            ctx.putImageData(bgCache[key], 0, 0);
        }

        // Puck
        const s = state[key];
        const px = CENTER + s.x * RADIUS;
        const py = CENTER + s.y * RADIUS;

        // Shadow for readability
        ctx.shadowColor = "rgba(0,0,0,0.6)";
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1.5;
        ctx.stroke();


        if (Math.abs(s.x) < 0.02 && Math.abs(s.y) < 0.02) 
        {
            ctx.beginPath();
            ctx.arc(CENTER, CENTER, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.fill();
        }
    }

    function attachDrag(canvas, key) 
    {
        let dragging = false;

        function setFromEvent(e) 
        {
            const rect = canvas.getBoundingClientRect();
            const scaleX = SIZE / rect.width;
            const scaleY = SIZE / rect.height;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            let dx = ((clientX - rect.left) * scaleX - CENTER) / RADIUS;
            let dy = ((clientY - rect.top)  * scaleY - CENTER) / RADIUS;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 1) 
            { 
                dx /= dist; 
                dy /= dist; 
            }

            state[key] = { x: dx, y: dy };
            drawWheel(canvas, key);

            if (window._scheduleApply) window._scheduleApply();
        }

        canvas.addEventListener("mousedown", (e) => { dragging = true;  setFromEvent(e); });
        canvas.addEventListener("mousemove", (e) => { 
            if (dragging) setFromEvent(e); });

        canvas.addEventListener("mouseup", () => { dragging = false; });
        canvas.addEventListener("mouseleave", () => { dragging = false; });
        canvas.addEventListener("touchstart", (e) => { dragging = true;  setFromEvent(e); }, { passive: true });
        canvas.addEventListener("touchmove", (e) => { 
            if (dragging) setFromEvent(e); }, { passive: true });
        canvas.addEventListener("touchend", ()  => { dragging = false; });
    }

    function init() 
    {
        wheelDefs.forEach(({ id, key }) => {
            const container = document.getElementById(id);
            if (!container) return;
            const canvas = document.createElement("canvas");
            canvas.width = SIZE;
            canvas.height = SIZE;
            canvas.style.cursor = "crosshair";
            canvas.style.borderRadius = "50%";
            canvas.style.width = SIZE + "px";
            canvas.style.height = SIZE + "px";
            container.appendChild(canvas);

            bgCache[key] = buildWheelBg(canvas);
            drawWheel(canvas, key);
            attachDrag(canvas, key);
        });
    }

    function applyWheels(pixels) 
    {
   
        const wData = wheelDefs.map(({ key, range }) => ({
            x: state[key].x,
            y: state[key].y,
            lo: range[0],
            mid: (range[0] + range[1]) / 2,
            half: (range[1] - range[0]) / 2,
        }));

        const strength = 32;

        for (let i = 0; i < pixels.length; i += 4) 
        {
            let r = pixels[i];
            let g = pixels[i + 1];
            let b = pixels[i + 2];

            const luma = (0.299 * r + 0.587 * g + 0.114 * b) | 0;

            for (let w = 0; w < 3; w++) 
            {
                const wd = wData[w];
                const dist = luma - wd.mid;
                if (dist < -wd.half || dist > wd.half) continue;
                const weight = 1 - Math.abs(dist) / wd.half;

                r += wd.x  *  strength * weight;
                b -= wd.x  *  strength * weight;
                g -= wd.y  *  strength * weight * 0.6;
                r -= wd.y  *  strength * weight * 0.2;
                b -= wd.y  *  strength * weight * 0.2;
            }

            pixels[i] = r < 0 ? 0 : r > 255 ? 255 : r | 0;
            pixels[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g | 0;
            pixels[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b | 0;
        }
    }

    function reset() 
    {
        wheelDefs.forEach(({ key, id }) => {
            state[key] = { x: 0, y: 0 };
            const canvas = document.querySelector(`#${id} canvas`);
            if (canvas) drawWheel(canvas, key);
        });
    }

    window.ColorWheels = { init, applyWheels, reset };
})();
