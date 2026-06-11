
const DEFAULT_ENTRIES = [
  { label: "Pizza", color: "#7c6af7" },
  { label: "Tacos", color: "#f76a8a" },
  { label: "Sushi", color: "#6af7c8" },
  { label: "Burgers", color: "#f7c26a" },
  { label: "Pasta", color: "#6aaff7" },
  { label: "Ramen", color: "#f76ad4" },
];

let entries = [...DEFAULT_ENTRIES];
let currentRotation = 0;  // degrees, cumulative
let isSpinning = false;

const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const addBtn = document.getElementById("addBtn");
const newEntry = document.getElementById("newEntry");
const entryList = document.getElementById("entryList");
const entryCount = document.getElementById("entryCount");
const resultBanner = document.getElementById("resultBanner");
const resultText = document.getElementById("resultText");
const closeResult = document.getElementById("closeResult");
const clearAll = document.getElementById("clearAll");

function drawWheel(rotationDeg = 0) 
{
  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;
  const cy = H / 2;
  const radius = W / 2 - 4;

  ctx.clearRect(0, 0, W, H);

  if (entries.length === 0) 
  {
    // Empty placeholder
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#1a1a22";
    ctx.fill();
    ctx.strokeStyle = "#2e2e3e";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = "#7878a0";
    ctx.font = "bold 18px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Add entries to spin", cx, cy);

    return;
  }

  const sliceAngle = (2 * Math.PI) / entries.length;
  const rotRad = (rotationDeg * Math.PI) / 180;

  entries.forEach((entry, i) => {
    const startAngle = rotRad + i * sliceAngle;
    const endAngle = startAngle + sliceAngle;
    const midAngle = startAngle + sliceAngle / 2;

 
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = entry.color;
    ctx.fill();


    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

 
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(midAngle);

    const textRadius = radius * 0.62;
    ctx.translate(textRadius, 0);


    const maxTextWidth = radius * 0.48;
    const fontSize = entries.length > 12 ? 11 : entries.length > 8 ? 13 : 15;

    ctx.fillStyle = getContrastColor(entry.color);
    ctx.font = `bold ${fontSize}px 'Segoe UI', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let label = entry.label;
    if (ctx.measureText(label).width > maxTextWidth) 
    {

      while (ctx.measureText(label + "…").width > maxTextWidth && label.length > 1) 
      {
        label = label.slice(0, -1);
      }

      label += "…";
    }

    ctx.fillText(label, 0, 0);
    ctx.restore();
  });


  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.fillStyle = "#0f0f13";
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 3;
  ctx.stroke();


  ctx.beginPath();
  ctx.arc(cx, cy, 7, 0, Math.PI * 2);
  ctx.fillStyle = "#7c6af7";
  ctx.fill();
}

function getContrastColor(hex) 
{
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Perceived luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#111" : "#fff";
}

function spin() 
{
  if (isSpinning || entries.length < 2) return;

  isSpinning = true;
  spinBtn.disabled = true;
  resultBanner.classList.add("hidden");


  const extraSpins = (5 + Math.floor(Math.random() * 4)) * 360;
  const randomAngle = Math.random() * 360;
  const totalDelta = extraSpins + randomAngle;
  const targetRotation = currentRotation + totalDelta;


  const duration = 3800 + Math.random() * 600; // ms
  const startTime = performance.now();
  const startRotation = currentRotation;

  function easeOut(t) {
    // Cubic ease-out
    return 1 - Math.pow(1 - t, 3);
  }

  function animate(now) 
  {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    const easedT = easeOut(t);

    currentRotation = startRotation + easedT * totalDelta;
    drawWheel(currentRotation);

    if (t < 1) 
    {
      requestAnimationFrame(animate);
    } 
    else {
      currentRotation = targetRotation;
      isSpinning = false;
      spinBtn.disabled = false;
      showResult();
    }
  }

  requestAnimationFrame(animate);
}

function showResult() 
{

  const n = entries.length;
  const sliceDeg = 360 / n;


  const normalized = ((currentRotation % 360) + 360) % 360;
  // Pointer is at 270° in canvas (top). A slice i starts at rotation + i*sliceDeg degrees.
  // Pointer angle relative to wheel: (270 - normalized + 360) % 360
  const pointerRelative = (270 - normalized + 3600) % 360;
  const winnerIndex = Math.floor(pointerRelative / sliceDeg) % n;

  resultText.textContent = `🎉 You selected: ${entries[winnerIndex].label} !`;
  resultBanner.classList.remove("hidden");
}


function renderList() 
{
  entryList.innerHTML = "";

  if (entries.length === 0) 
  {
    entryList.innerHTML = `<li class="empty-state">
        No entries yet.<br>Add something to spin!
      </li>`;
    entryCount.textContent = "0 entries";
    drawWheel(currentRotation);
    return;
  }

  entries.forEach((entry, i) => {
    const li = document.createElement("li");
    li.className = "entry-item";

    const swatch = document.createElement("div");
    swatch.className = "color-swatch";
    swatch.style.background = entry.color;
    swatch.title = "Change color";

    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = entry.color;
    colorInput.addEventListener("input", (e) => {
      entries[i].color = e.target.value;
      swatch.style.background = e.target.value;
      drawWheel(currentRotation);
    });
    swatch.appendChild(colorInput);


    const label = document.createElement("span");
    label.className = "entry-label";
    label.textContent = entry.label;
    label.title = entry.label;


    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "✕";
    removeBtn.title = "Remove entry";
    removeBtn.addEventListener("click", () => {
      entries.splice(i, 1);
      renderList();
      drawWheel(currentRotation);
    });

    li.appendChild(swatch);
    li.appendChild(label);
    li.appendChild(removeBtn);
    entryList.appendChild(li);
  });

  entryCount.textContent = `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`;
  drawWheel(currentRotation);
}

function addEntry() 
{
  const val = newEntry.value.trim();
  if (!val) return;


  const color = randomWheelColor();
  entries.push({ label: val, color });
  newEntry.value = "";
  newEntry.focus();
  renderList();
}

function randomWheelColor() 
{
  const palette = [
    "#7c6af7","#f76a8a","#6af7c8","#f7c26a",
    "#6aaff7","#f76ad4","#a6f76a","#f7896a",
    "#6af7f0","#d46af7","#f7e46a","#6af78e",
  ];
  // Prefer colors not already in use
  const usedColors = new Set(entries.map(e => e.color));
  const unused = palette.filter(c => !usedColors.has(c));
  const pool = unused.length > 0 ? unused : palette;
  return pool[Math.floor(Math.random() * pool.length)];
}
spinBtn.addEventListener("click", spin);

addBtn.addEventListener("click", addEntry);

newEntry.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addEntry();
});

closeResult.addEventListener("click", () => {
  resultBanner.classList.add("hidden");
});

clearAll.addEventListener("click", () => {
  if (entries.length === 0) return;

  if (confirm("Remove all entries?")) 
  {
    entries = [];
    renderList();
    resultBanner.classList.add("hidden");
  }
});

renderList();