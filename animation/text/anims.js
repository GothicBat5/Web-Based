const inputBox = document.getElementById("inputBox");
const display = document.getElementById("display");
const effectGrid = document.getElementById("effectGrid");
const themeToggle = document.getElementById("themeToggle");
const charCount = document.getElementById("charCount");
const html = document.documentElement;

let currentEffect = "wave";
let frameIds = [];          // track rAF handles so we can cancel them

themeToggle.addEventListener("click", () => {
  html.dataset.theme = html.dataset.theme === "dark" ? "light" : "dark";
});

effectGrid.addEventListener("click", e => {
  const btn = e.target.closest(".effect-btn");
  if (!btn) return;
  document.querySelectorAll(".effect-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  currentEffect = btn.dataset.effect;
  updateText();           // re-render with new effect immediately
});

inputBox.addEventListener("input", updateText);

function updateText() {
  // Cancel all running animation frames
  frameIds.forEach(id => cancelAnimationFrame(id));
  frameIds = [];

  display.innerHTML = "";
  const text = inputBox.value;
  charCount.textContent = text.length;

  if (!text) 
  {
    display.innerHTML = '<span class="stage-placeholder">Your text will animate here…</span>';
    return;
  }

  for (let i = 0; i < text.length; i++) 
  {
    const span = document.createElement("span");

    if (text[i] === " ") 
    {
      span.classList.add("space");
      span.textContent = "\u00A0"; // non-breaking space keeps layout
    } 

    else {
      span.textContent = text[i];
    }

    display.appendChild(span);
    const id = animateLetter(span, i, text.length);
    if (id !== null) frameIds.push(id);
  }
}

function animateLetter(span, index, total) 
{

  switch (currentEffect) 
  {
    case "wave": return effectWave(span, index);
    case "bounce": return effectBounce(span, index);
    case "spin": return effectSpin(span, index);
    case "rainbow": return effectRainbow(span, index);
    case "shake": return effectShake(span, index);
    case "fade": return effectFade(span, index);
    case "zoom": return effectZoom(span, index);
    case "flip": return effectFlip(span, index);
    default: return null;
  }
}

function loop(fn) 
{
  let id;

  function tick() 
  {
    fn(Date.now());
    id = requestAnimationFrame(tick);
  }
  id = requestAnimationFrame(tick);
  return id;
}

const τ = Math.PI * 2;

function effectWave(span, i)
{
  return loop(t => {
    const y = Math.sin(t / 200 + i * 0.5) * 14;
    span.style.transform = `translateY(${y}px)`;
  });
}

function effectBounce(span, i) 
{
  return loop(t => {
    const raw = Math.abs(Math.sin((t / 350) + i * 0.45));
    const y  = -raw * 22;
    const sx  = 1 - raw * 0.15;
    const sy  = 1 + raw * 0.15;
    span.style.transform = `translateY(${y}px) scaleX(${sx}) scaleY(${sy})`;
  });
}

function effectSpin(span, i) 
{
  return loop(t => {
    const deg = ((t / 1200) + i * 0.3) * 360 % 360;
    span.style.transform = `rotate(${deg}deg)`;
  });
}

function effectRainbow(span, i) 
{
  return loop(t => {
    const hue = (t / 30 + i * (360 / 10)) % 360;
    span.style.color = `hsl(${hue}, 90%, 60%)`;
    const y = Math.sin(t / 250 + i * 0.4) * 8;
    span.style.transform = `translateY(${y}px)`;
  });
}

function effectShake(span, i) 
{
  let lastFrame = 0;
  let rx = 0, ry = 0;
  return loop(t => {
    // update jitter every ~60ms
    if (t - lastFrame > 60) 
    {
      rx = (Math.random() - 0.5) * 10;
      ry = (Math.random() - 0.5) * 10;
      lastFrame = t;
    }
    span.style.transform = `translate(${rx}px, ${ry}px)`;
  });
}

function effectFade(span, i) 
{
  return loop(t => {
    const alpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t / 500 + i * 0.7));
    span.style.opacity = alpha;
    // soft vertical drift
    const y = Math.sin(t / 700 + i * 0.4) * 6;
    span.style.transform = `translateY(${y}px)`;
  });
}

function effectZoom(span, i) 
{
  return loop(t => {
    const s = 1 + 0.25 * Math.abs(Math.sin(t / 400 + i * 0.55));
    span.style.transform = `scale(${s})`;
  });
}

function effectFlip(span, i) 
{
  span.style.display = "inline-block";
  return loop(t => {
    const deg = ((t / 1000) + i * 0.4) * 180 % 360;
    span.style.transform = `perspective(400px) rotateY(${deg}deg)`;
  });
}
