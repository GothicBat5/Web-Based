// histogram.js — Live RGB Histogram
(function () {
    const HIST_W = 256;
    const HIST_H = 100;

    let histCanvas, histCtx;

    function init() {
        const container = document.getElementById("histogram-container");
        if (!container) return;

        histCanvas = document.createElement("canvas");
        histCanvas.width = HIST_W;
        histCanvas.height = HIST_H;
        histCanvas.id = "histCanvas";
        container.appendChild(histCanvas);
        histCtx = histCanvas.getContext("2d");

        drawEmpty();
    }

    function drawEmpty() {
        histCtx.fillStyle = "#1a1a1a";
        histCtx.fillRect(0, 0, HIST_W, HIST_H);
    }

    function update(imageData) 
    {
        if (!histCtx) return;

        const pixels = imageData.data;
        const rBins = new Uint32Array(256);
        const gBins = new Uint32Array(256);
        const bBins = new Uint32Array(256);

        for (let i = 0; i < pixels.length; i += 4) 
        {
            rBins[pixels[i]]++;
            gBins[pixels[i + 1]]++;
            bBins[pixels[i + 2]]++;
        }

        // Find max for normalization
        let max = 1;
        for (let i = 0; i < 256; i++) 
        {
            if (rBins[i] > max) max = rBins[i];
            if (gBins[i] > max) max = gBins[i];
            if (bBins[i] > max) max = bBins[i];
        }

        histCtx.clearRect(0, 0, HIST_W, HIST_H);
        histCtx.fillStyle = "#1a1a1a";
        histCtx.fillRect(0, 0, HIST_W, HIST_H);

        // Draw grid lines
        histCtx.strokeStyle = "rgba(255,255,255,0.06)";
        histCtx.lineWidth = 1;
        for (let x = 64; x < 256; x += 64) 
        {
            histCtx.beginPath();
            histCtx.moveTo(x, 0);
            histCtx.lineTo(x, HIST_H);
            histCtx.stroke();
        }

        // Draw each channel with additive blending
        drawChannel(rBins, max, "rgba(220,60,60,0.75)");
        drawChannel(gBins, max, "rgba(60,200,60,0.75)");
        drawChannel(bBins, max, "rgba(60,120,220,0.75)");
    }

    function drawChannel(bins, max, color) 
    {
        histCtx.beginPath();
        histCtx.moveTo(0, HIST_H);

        for (let i = 0; i < 256; i++) 
        {
            const h = (bins[i] / max) * HIST_H;
            histCtx.lineTo(i, HIST_H - h);
        }
        histCtx.lineTo(255, HIST_H);
        histCtx.closePath();
        histCtx.globalCompositeOperation = "screen";
        histCtx.fillStyle = color;
        histCtx.fill();
        histCtx.globalCompositeOperation = "source-over";
    }

    // Expose
    window.Histogram = { init, update };
})();