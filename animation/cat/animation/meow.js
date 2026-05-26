const cat = document.getElementById('cat');
const message = document.getElementById('message');
const leftPupil = document.getElementById('leftPupil');
const rightPupil = document.getElementById('rightPupil');
const irisL = document.getElementById('irisL');
const irisR = document.getElementById('irisR');
const shineL = document.getElementById('shineL');
const shineL2 = document.getElementById('shineL2');
const shineR = document.getElementById('shineR');
const shineR2 = document.getElementById('shineR2');

const LEFT_EYE = { x: 158, y: 195 };
const RIGHT_EYE = { x: 242, y: 195 };
const MAX_RADIUS = 8;

/**
 * Converts a mouse event's screen coordinates into SVG viewBox coordinates,
 * accounting for the SVG element's position and scale on the page.
 */
function toSVGPoint(evt) {
  const rect = cat.getBoundingClientRect();
  const scaleX = 400 / rect.width;
  const scaleY = 400 / rect.height;
  return {
    x: (evt.clientX - rect.left) * scaleX,
    y: (evt.clientY - rect.top) * scaleY,
  };
}

/**
 * Moves a pupil (and its iris + shine highlights) toward the mouse cursor,
 * clamped to a max radius within the eye.
 */
function movePupil(pupilEl, irisEl, shine1, shine2, eyeCenter, mx, my) {
  const dx = mx - eyeCenter.x;
  const dy = my - eyeCenter.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const r = Math.min(dist / 12, MAX_RADIUS);
  const angle = Math.atan2(dy, dx);
  const ox = Math.cos(angle) * r;
  const oy = Math.sin(angle) * r;
  const tx = eyeCenter.x + ox;
  const ty = eyeCenter.y + oy;

  pupilEl.setAttribute('cx', tx);
  pupilEl.setAttribute('cy', ty);
  irisEl.setAttribute('cx', tx);
  irisEl.setAttribute('cy', ty);
  shine1.setAttribute('cx', tx + 5);
  shine1.setAttribute('cy', ty - 6);
  shine2.setAttribute('cx', tx - 5);
  shine2.setAttribute('cy', ty + 6);
}

let idleTimer;

document.addEventListener('mousemove', (e) => {
  const p = toSVGPoint(e);
  movePupil(leftPupil, irisL, shineL, shineL2, LEFT_EYE, p.x, p.y);
  movePupil(rightPupil, irisR, shineR, shineR2, RIGHT_EYE, p.x, p.y);

  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    movePupil(leftPupil, irisL, shineL, shineL2, LEFT_EYE, LEFT_EYE.x, LEFT_EYE.y);
    movePupil(rightPupil, irisR, shineR, shineR2, RIGHT_EYE, RIGHT_EYE.x, RIGHT_EYE.y);
  }, 1500);
});

const reactions = [
  '😾 Hey!',
  '😺 That tickles!',
  '🙀 Excuse me!',
  '😸 Hehe!',
  '🐾 Poke received!',
];

cat.addEventListener('click', () => {
  message.textContent = reactions[Math.floor(Math.random() * reactions.length)];
  cat.style.transform = 'scale(1.08) rotate(4deg)';
  setTimeout(() => {
    cat.style.transform = '';
  }, 200);
});

function blink() {
  leftPupil.setAttribute('ry', '2');
  rightPupil.setAttribute('ry', '2');
  irisL.setAttribute('ry', '3');
  irisR.setAttribute('ry', '3');
  setTimeout(() => {
    leftPupil.setAttribute('ry', '14');
    rightPupil.setAttribute('ry', '14');
    irisL.setAttribute('ry', '22');
    irisR.setAttribute('ry', '22');
  }, 140);
}

setInterval(blink, 3800);