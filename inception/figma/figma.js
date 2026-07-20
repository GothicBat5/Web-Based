const frames = document.querySelectorAll('.frame');
const layerItems = document.querySelectorAll('.layer-item');
const propX = document.getElementById('prop-x');
const propY = document.getElementById('prop-y');
const propW = document.getElementById('prop-w');
const propH = document.getElementById('prop-h');
const noSel = document.getElementById('no-selection');
const propSec = document.querySelector('.prop-section');

let selected = null;
let dragging = false;
let offsetX = 0;
let offsetY = 0;
let maxZ = 10;

function select(frame) 
{
  if (selected) selected.classList.remove('selected');
  selected = frame;

  if (!selected) {
    layerItems.forEach(li => li.classList.remove('selected'));
    clearProps();
    return;
  }

  selected.classList.add('selected');
  selected.style.zIndex = ++maxZ;
  updateProps();

  layerItems.forEach(li => {
    li.classList.toggle('selected', li.dataset.id === selected.id);
  });
}

function updateProps() {
  if (!selected) return;
  propX.textContent = Math.round(parseInt(selected.style.left))  + '';
  propY.textContent = Math.round(parseInt(selected.style.top))   + '';
  propW.textContent = selected.offsetWidth  + '';
  propH.textContent = selected.offsetHeight + '';
  noSel.style.display = 'none';
  propSec.style.display = 'flex';
}

function clearProps() {
  propX.textContent = '—';
  propY.textContent = '—';
  propW.textContent = '—';
  propH.textContent = '—';
  noSel.style.display = 'block';
  propSec.style.display = 'none';
}

frames.forEach(frame => {
  frame.addEventListener('mousedown', e => {
    e.stopPropagation();
    select(frame);
    dragging = true;
    frame.classList.add('dragging');
    offsetX = e.clientX - frame.offsetLeft;
    offsetY = e.clientY - frame.offsetTop;
  });
});

layerItems.forEach(li => {
  li.addEventListener('click', () => {
    const frame = document.getElementById(li.dataset.id);
    if (frame) select(frame);
  });
});

document.addEventListener('mousemove', e => {
  if (!dragging || !selected) return;
  selected.style.left = (e.clientX - offsetX) + 'px';
  selected.style.top  = (e.clientY - offsetY) + 'px';
  updateProps();
});

document.addEventListener('mouseup', () => {
  if (selected) selected.classList.remove('dragging');
  dragging = false;
});

document.getElementById('canvas').addEventListener('mousedown', () => {
  select(null);
});

clearProps();
