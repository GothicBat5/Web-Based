// app.js — Main controller

const fileInput = document.getElementById("fileInput");
const brightnessSlider = document.getElementById("brightness");
const contrastSlider = document.getElementById("contrast");
const saturationSlider = document.getElementById("saturation");
const saveBtn = document.getElementById("saveBtn");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const canvasHint = document.getElementById("canvas-hint");

let originalImageData = null;


["brightness", "contrast", "saturation"].forEach(id => {
    const slider = document.getElementById(id);
    const val = document.getElementById(`${id}-val`);
    slider.addEventListener("input", () => {
        val.textContent = slider.value;
        applyEffects();
    });
});


document.addEventListener("DOMContentLoaded", () => {
    if (window.Histogram) Histogram.init();
    if (window.ColorWheels) ColorWheels.init();
    if (window.Curves) Curves.init();
});


fileInput.addEventListener("change", loadImage);
saveBtn.addEventListener("click", saveImage);

function loadImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        if (canvasHint) canvasHint.style.display = "none";
        applyEffects();
    };
    img.src = URL.createObjectURL(file);
}


function applyEffects() {
    if (!originalImageData) return;

    const imageData = new ImageData(
        new Uint8ClampedArray(originalImageData.data),
        originalImageData.width,
        originalImageData.height
    );
    const pixels = imageData.data;

    const brightness = parseInt(brightnessSlider.value);
    const contrast = parseInt(contrastSlider.value);
    const saturation = parseInt(saturationSlider.value);

    const contrastFactor =
        (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let i = 0; i < pixels.length; i += 4) {
        let r = pixels[i];
        let g = pixels[i + 1];
        let b = pixels[i + 2];

        // Brightness
        r += brightness;
        g += brightness;
        b += brightness;

        // Contrast
        r = contrastFactor * (r - 128) + 128;
        g = contrastFactor * (g - 128) + 128;
        b = contrastFactor * (b - 128) + 128;

        // Saturation
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        const satFactor = 1 + saturation / 100;
        r = gray + (r - gray) * satFactor;
        g = gray + (g - gray) * satFactor;
        b = gray + (b - gray) * satFactor;

        pixels[i]     = clamp(r);
        pixels[i + 1] = clamp(g);
        pixels[i + 2] = clamp(b);
    }

    if (window.ColorWheels) {
        ColorWheels.applyWheels(pixels);
    }

    if (window.Curves) {
        Curves.applyCurves(pixels);
    }

    ctx.putImageData(imageData, 0, 0);

    if (window.Histogram) {
        Histogram.update(imageData);
    }
}

window.applyEffects = applyEffects;


function clamp(value) {
    return Math.max(0, Math.min(255, Math.round(value)));
}

function saveImage() {
    const link = document.createElement("a");
    link.download = "edited-image.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
}