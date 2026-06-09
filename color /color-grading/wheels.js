// wheels.js — Shadows / Midtones / Highlights Color Wheels
(function () 
{
    const RADIUS = 60;
    const CENTER = RADIUS + 10;
    const SIZE = CENTER * 2;

    const wheels = [
        { id: "wheel-shadows", label: "Shadows", range: [0, 85] },
        { id: "wheel-midtones", label: "Midtones", range: [85, 170] },
        { id: "wheel-highlights", label: "Highlights", range: [170, 255] },
    ];

    const state = {
        shadows: { x: 0, y: 0 },
        midtones: { x: 0, y: 0 },
        highlights: { x: 0, y: 0 },
    };

    const keys = ["shadows", "midtones", "highlights"];

    function init() 
    {
        wheels.forEach((w, idx) => {
            const container = document.getElementById(w.id);
            if (!container) return;

            const canvas = document.createElement("canvas");
            canvas.width = SIZE;
            canvas.height = SIZE;
            canvas.style.cursor = "crosshair";
            canvas.style.borderRadius = "50%";
            container.appendChild(canvas);

            drawWheel(canvas, keys[idx]);
            attachDrag(canvas, keys[idx]);
        });
    }

    function drawWheel(canvas, key) 
    {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, SIZE, SIZE);

        // Draw hue/saturation circle
        for (let angle = 0; angle < 360; angle += 1) 
        {
            const rad = (angle * Math.PI) / 180;
            const gradient = ctx.createRadialGradient(
                CENTER, CENTER, 0,
                CENTER, CENTER, RADIUS
            );
            gradient.addColorStop(0, "rgba(128,128,128,1)");
            gradient.addColorStop(1, `hsl(${angle}, 100%, 50%)`);

            ctx.beginPath();
            ctx.moveTo(CENTER, CENTER);
            ctx.arc(CENTER, CENTER, RADIUS, rad, rad + (2 * Math.PI) / 360 + 0.01);
            ctx.closePath();
            ctx.fillStyle = gradient;
            ctx.fill();
        }

        // Outer ring
        ctx.beginPath();
        ctx.arc(CENTER, CENTER, RADIUS, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Crosshair lines
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(CENTER, CENTER - RADIUS);
        ctx.lineTo(CENTER, CENTER + RADIUS);
        ctx.moveTo(CENTER - RADIUS, CENTER);
        ctx.lineTo(CENTER + RADIUS, CENTER);
        ctx.stroke();

        // Puck
        const s = state[key];
        const px = CENTER + s.x * RADIUS;
        const py = CENTER + s.y * RADIUS;

        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    function attachDrag(canvas, key) 
    {
        let dragging = false;

        function setFromEvent(e) 
        {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            let dx = (clientX - rect.left - CENTER) / RADIUS;
            let dy = (clientY - rect.top - CENTER) / RADIUS;
            // Clamp inside circle
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 1) { dx /= dist; dy /= dist; }
            state[key] = { x: dx, y: dy };
            drawWheel(canvas, key);
            if (window.applyEffects) window.applyEffects();
        }

        canvas.addEventListener("mousedown", (e) => { dragging = true; setFromEvent(e); });
        canvas.addEventListener("mousemove", (e) => { if (dragging) setFromEvent(e); });
        canvas.addEventListener("mouseup", ()  => { dragging = false; });
        canvas.addEventListener("mouseleave", ()  => { dragging = false; });
        canvas.addEventListener("touchstart", (e) => { dragging = true; setFromEvent(e); }, { passive: true });
        canvas.addEventListener("touchmove", (e) => { if (dragging) setFromEvent(e); }, { passive: true });
        canvas.addEventListener("touchend", ()  => { dragging = false; });
    }

    // Apply wheel shifts to a pixel range
    function applyWheels(pixels) 
    {
        for (let i = 0; i < pixels.length; i += 4) 
        {
            let r = pixels[i];
            let g = pixels[i + 1];
            let b = pixels[i + 2];

            const luma = 0.299 * r + 0.587 * g + 0.114 * b;

            keys.forEach((key) => {
                const wheel = wheels.find(w => w.id === `wheel-${key}`);
                const [lo, hi] = wheel.range;

                // Weight: how much this wheel affects this pixel
                let weight = 0;
                if (luma >= lo && luma <= hi) 
                {
                    weight = 1 - Math.abs((luma - (lo + hi) / 2) / ((hi - lo) / 2));
                    weight = Math.max(0, Math.min(1, weight));
                }

                if (weight === 0) return;

                const s = state[key];
                // Convert puck position to RGB offset
                // x maps to R-B axis, y maps to G axis (inverted)
                const strength = 30; // max shift in pixel value
                r += s.x * strength * weight;
                g -= s.y * strength * weight * 0.5;
                b -= s.x * strength * weight;
                g += (Math.abs(s.x) + Math.abs(s.y)) * strength * weight * 0.2;
            });

            pixels[i] = Math.max(0, Math.min(255, Math.round(r)));
            pixels[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
            pixels[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
        }
    }

    function reset() 
    {
        keys.forEach(k => { state[k] = { x: 0, y: 0 }; });
        wheels.forEach((w, idx) => {
            const canvas = document.querySelector(`#${w.id} canvas`);
            if (canvas) drawWheel(canvas, keys[idx]);
        });
    }

    window.ColorWheels = { init, applyWheels, reset };
})();