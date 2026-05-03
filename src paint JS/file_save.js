
const FileIO = (() => {

  function exportPNG(canvas, filename = 'paintstudio-artwork') 
  {
    const link = document.createElement('a');

    link.download = filename + '.png';
    link.href = canvas.toDataURL('image/png');

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  }

  function newCanvas(onConfirm) 
  {

    const w = parseInt(prompt('Canvas width (px):', '1200')) || 1200;
    const h = parseInt(prompt('Canvas height (px):', '800')) || 800;
    if (onConfirm) onConfirm(w, h);
  }

  return { exportPNG, newCanvas };
})();