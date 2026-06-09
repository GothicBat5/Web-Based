// lut-presets.js 
(function () {

   
    const presets = [
        {
            name: "None",
            fn: { r: v => v, g: v => v, b: v => v }
        },
        {
            name: "Golden Hour",
          
            fn: {
                r: v => clamp(v * 1.12 + 10),
                g: v => clamp(v * 0.97 + 4),
                b: v => clamp(v * 0.72 - 5),
            }
        },
        {
            name: "Teal & Orange",
            
            fn: {
                r: v => {
                    const t = v / 255;
                    return clamp(v + 30 * t * t - 8 * (1 - t));
                },
                g: v => clamp(v * 0.95),
                b: v => {
                    const t = v / 255;
                    return clamp(v + 28 * (1 - t) * (1 - t) - 10 * t);
                },
            }
        },
        {
            name: "Bleach Bypass",
         
            fn: {
                r: v => clamp(((v - 128) * 1.3) + 128 + 8),
                g: v => clamp(((v - 128) * 1.25) + 128 + 6),
                b: v => clamp(((v - 128) * 1.2) + 128 + 4),
            }
        },
        {
            name: "Kodachrome",
    
            fn: {
                r: v => clamp(v * 1.08 + 8),
                g: v => clamp(v * 1.0 + 2),
                b: v => clamp(v * 0.85 + 6),
            }
        },
        {
            name: "Fade",
      
            fn: {
                r: v => clamp(v * 0.82 + 35),
                g: v => clamp(v * 0.80 + 32),
                b: v => clamp(v * 0.78 + 38),
            }
        },
        {
            name: "Deep Night",
         
            fn: {
                r: v => clamp(v * 0.88 - 4),
                g: v => clamp(v * 0.92 + 2),
                b: v => clamp(v * 1.10 + 6),
            }
        },
        {
            name: "Warm Print",
       
            fn: {
                r: v => clamp(sCurve(v, 1.05) + 12),
                g: v => clamp(sCurve(v, 1.02) + 4),
                b: v => clamp(sCurve(v, 0.95) - 8),
            }
        },
    ];

    // Helpers
    function clamp(v) 
    { 
        return v < 0 ? 0 : v > 255 ? 255 : Math.round(v); 
    }

    function sCurve(v, strength) 
    {
        const t = v / 255;
        const s = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        return (s * strength + (1 - strength) * t) * 255;
    }


    let activeLUTs = null;

    function buildLUTs(preset) 
    {
        const rLut = new Uint8ClampedArray(256);
        const gLut = new Uint8ClampedArray(256);
        const bLut = new Uint8ClampedArray(256);

        for (let i = 0; i < 256; i++) 
        {
            rLut[i] = preset.fn.r(i);
            gLut[i] = preset.fn.g(i);
            bLut[i] = preset.fn.b(i);
        }
        return { r: rLut, g: gLut, b: bLut };
    }


    let activePreset = 0;
    activeLUTs = buildLUTs(presets[0]);

    function init() 
    {
        const container = document.getElementById("presets-container");
        if (!container) return;

        const grid = document.createElement("div");
        grid.className = "presets-grid";

        presets.forEach((p, idx) => {
            const btn = document.createElement("button");
            btn.className = "preset-btn" + (idx === 0 ? " active" : "");
            btn.textContent = p.name;
            btn.addEventListener("click", () => {
                activePreset = idx;
                activeLUTs = buildLUTs(p);
                grid.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                if (window._scheduleApply) window._scheduleApply();
            });
            grid.appendChild(btn);
        });

        container.appendChild(grid);
    }

    function applyPreset(pixels) 
    {
        if (!activeLUTs || activePreset === 0) return;

        const { r, g, b } = activeLUTs;

        for (let i = 0; i < pixels.length; i += 4) 
        {
            pixels[i] = r[pixels[i]];
            pixels[i + 1] = g[pixels[i + 1]];
            pixels[i + 2] = b[pixels[i + 2]];
        }
    }

    window.LUTPresets = { init, applyPreset };
})();
