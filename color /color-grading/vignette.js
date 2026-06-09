// vignette.js
(function () {

    const state = {
        strength: 0, 
        feather:50, 
    };

    function init() {
        const container = document.getElementById("vignette-container");
        if (!container) return;

        container.innerHTML = "";

      
        const strengthLabel = document.createElement("label");
        strengthLabel.className = "slider-label";
        strengthLabel.innerHTML = `<span>Strength</span>
            <input type="range" id="vignette-strength" min="0" max="100" value="0">
            <span class="slider-val" id="vignette-strength-val">0</span>
        `;
        container.appendChild(strengthLabel);

        // Feather slider
        const featherLabel = document.createElement("label");
        featherLabel.className = "slider-label";
        featherLabel.innerHTML = `<span>Feather</span>
            <input type="range" id="vignette-feather" min="0" max="100" value="50">
            <span class="slider-val" id="vignette-feather-val">50</span>
        `;
        container.appendChild(featherLabel);

        document.getElementById("vignette-strength").addEventListener("input", (e) => {
            state.strength = parseInt(e.target.value);
            document.getElementById("vignette-strength-val").textContent = state.strength;

            if (window._scheduleApply) window._scheduleApply();
        });

        document.getElementById("vignette-feather").addEventListener("input", (e) => {
            state.feather = parseInt(e.target.value);
            document.getElementById("vignette-feather-val").textContent = state.feather;

            if (window._scheduleApply) window._scheduleApply();
        });
    }

    // Apply vignette directly to pixel data
    function applyVignette(pixels, width, height) 
    {
        if (state.strength === 0) return;

        const cx = width / 2;
        const cy = height / 2;

        const maxDist = Math.sqrt(cx * cx + cy * cy);
        const strength = state.strength / 100;

        const feather  = 0.3 + (state.feather / 100) * 0.65;

        for (let y = 0; y < height; y++) 
        {

            for (let x = 0; x < width; x++) 
            {
                const idx = (y * width + x) * 4;
                const dx = (x - cx) / maxDist;
                const dy = (y - cy) / maxDist;
                const dist = Math.sqrt(dx * dx + dy * dy); 

                const raw = Math.max(0, (dist - (1 - feather)) / feather);
                const factor = raw * raw; 
                const dark = 1 - factor * strength;

                pixels[idx] = pixels[idx] * dark | 0;
                pixels[idx + 1] = pixels[idx + 1] * dark | 0;
                pixels[idx + 2] = pixels[idx + 2] * dark | 0;
            }
        }
    }

    window.Vignette = { init, applyVignette };
})();
