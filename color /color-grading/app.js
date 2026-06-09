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

// RAF-throttled apply prevents firing faster than 60fps
let _rafPending = false;
function _scheduleApply() {
    if (_rafPending) return;
    _rafPending = true;
    requestAnimationFrame(() => {
        _rafPending = false;
        applyEffects();
    });
}
window._scheduleApply = _scheduleApply;


["brightness", "contrast", "saturation"].forEach(id => {
    const slider = document.getElementById(id);
    const val    = document.getElementById(`${id}-val`);
    slider.addEventListener("input", () => {
        val.textContent = slider.value;
        _scheduleApply();
    });
});


document.addEventListener("DOMContentLoaded", () => {
    if (window.Histogram)   Histogram.init();
    if (window.ColorWheels) ColorWheels.init();
    if (window.Curves)      Curves.init();
    if (window.LUTPresets)  LUTPresets.init();
    if (window.Vignette)    Vignette.init();
});

fileInput.addEventListener("change", loadImage);
saveBtn.addEventListener("click", saveImage);

function loadImage(event) 
{
    const file = event.target.files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
        canvas.width  = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        if (canvasHint) canvasHint.style.display = "none";
        applyEffects();
    };
    img.src = URL.createObjectURL(file);
}


function applyEffects() 
{
    if (!originalImageData) return;

    const imageData = new ImageData(
        new Uint8ClampedArray(originalImageData.data),
        originalImageData.width,
        originalImageData.height
    );
    const pixels = imageData.data;

    const brightness = parseInt(brightnessSlider.value);
    const contrast  = parseInt(contrastSlider.value);
    const saturation = parseInt(saturationSlider.value);
    const cf = (259 * (contrast + 255)) / (255 * (259 - contrast));


    for (let i = 0; i < pixels.length; i += 4) 
    {
        let r = pixels[i] + brightness;
        let g = pixels[i + 1] + brightness;
        let b = pixels[i + 2] + brightness;

        r = cf * (r - 128) + 128;
        g = cf * (g - 128) + 128;
        b = cf * (b - 128) + 128;

        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        const sf   = 1 + saturation / 100;
        r = gray + (r - gray) * sf;
        g = gray + (g - gray) * sf;
        b = gray + (b - gray) * sf;

        pixels[i]     = r < 0 ? 0 : r > 255 ? 255 : r | 0;
        pixels[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g | 0;
        pixels[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b | 0;
    }


    if (window.LUTPresets) LUTPresets.applyPreset(pixels);


    if (window.ColorWheels) ColorWheels.applyWheels(pixels);


    if (window.Curves) Curves.applyCurves(pixels);


    if (window.Vignette) Vignette.applyVignette(pixels, imageData.width, imageData.height);

    // Render
    ctx.putImageData(imageData, 0, 0);

    // Update histogram
    if (window.Histogram) Histogram.update(imageData);
}

window.applyEffects = applyEffects;

function saveImage() 
{
    const link = document.createElement("a");
    link.download = "edited-image.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
}
