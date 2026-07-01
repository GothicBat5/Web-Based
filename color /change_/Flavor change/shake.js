const options = document.querySelectorAll('.option');
const confirmBtn = document.getElementById('confirmBtn');
const rippleCont = document.getElementById('ripple-container');

const rippleColors = {
  bubble: '#2ec4b6',
  blueberry: '#4da3d9',
  purple: '#9b5de5',
  raspberry:'#f72585',
};


function spawnRipple(x, y, color) 
{
  const ring = document.createElement('div');
  ring.classList.add('ripple-ring');
  ring.style.left = `${x}px`;
  ring.style.top = `${y}px`;
  ring.style.width = '80px';
  ring.style.height = '80px';
  ring.style.color = color;
  ring.style.borderColor = color;
  ring.style.boxShadow = `0 0 12px ${color}60`;
  rippleCont.appendChild(ring);

  ring.addEventListener('animationend', () => ring.remove());
}



function burstRipples(x, y, color, count = 3) 
{

  for (let i = 0; i < count; i++) 
  {
    setTimeout(() => {
      const ox = x + (Math.random() - 0.5) * 30;
      const oy = y + (Math.random() - 0.5) * 30; spawnRipple(ox, oy, color); }, i * 90);
  }
}

function spawnParticles(x, y, color) 
{
  const symbols = ['✦', '✧', '⋆', '·', '★'];

  for (let i = 0; i < 8; i++) 
  {

    const el = document.createElement('div');
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    const angle = (i / 8) * Math.PI * 2;
    const dist = 40 + Math.random() * 40;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;
    const size = 10 + Math.random() * 10;

    Object.assign(el.style, {
      position: 'fixed',
      left: `${x}px`,
      top: `${y}px`,
      color: color,
      fontSize:`${size}px`,
      lineHeight: '1',
      pointerEvents: 'none',
      zIndex: 9999,
      transform: 'translate(-50%,-50%)',
      opacity: '1',
      transition: `transform 0.6s ease-out, opacity 0.6s ease-out`,
      textShadow: `0 0 10px ${color}`,
    });

    document.body.appendChild(el);

    requestAnimationFrame(() => {
      el.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`;
      el.style.opacity = '0';
    });

    el.addEventListener('transitionend', () => el.remove());
  }
}

options.forEach(option => {
  option.addEventListener('click', (e) => {

    const rect = option.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const flavor = option.dataset.flavor;
    const color = rippleColors[flavor] || '#ffffff';

    options.forEach(o => o.classList.remove('selected', 'clicking'));
    option.classList.add('selected');
    option.classList.add('clicking');
    option.addEventListener('animationend', () => {
      option.classList.remove('clicking');
    }, { once: true });

    burstRipples(cx, cy, color, 4);
    spawnParticles(cx, cy, color);

    const gradients = {
      bubble: 'linear-gradient(135deg, #2ec4b6 0%, #5e86d6 100%)',
      blueberry: 'linear-gradient(135deg, #4da3d9 0%, #5b78d6 100%)',
      purple: 'linear-gradient(135deg, #9b5de5 0%, #c77dff 100%)',
      raspberry: 'linear-gradient(135deg, #f72585 0%, #b5179e 100%)',
    };

    confirmBtn.style.background = gradients[flavor];
    confirmBtn.classList.remove('confirmed');
    confirmBtn.querySelector('span').textContent = 'Confirm Choice';
  });
});

confirmBtn.addEventListener('click', (e) => {
  const selected = document.querySelector('.option.selected');

  if (!selected) 
  {
    return; 
  }

  const flavor = selected.dataset.flavor;
  const color = rippleColors[flavor];
  const rect = confirmBtn.getBoundingClientRect();
  const cx = rect.left + rect.width  / 2;
  const cy = rect.top  + rect.height / 2;
  burstRipples(cx, cy, color, 6);
  spawnParticles(cx, cy, color);
  confirmBtn.classList.add('confirmed');
  confirmBtn.style.background = '';
  confirmBtn.querySelector('span').textContent = 'ENJOY!';
});
