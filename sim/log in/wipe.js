
(function () {
  'use strict';

  const tabLogin   = document.getElementById('tab-login');

  const tabSignup = document.getElementById('tab-signup');

  const tabSlider = document.querySelector('.tab-slider');

  const formLogin = document.getElementById('form-login');

  const formSignup = document.getElementById('form-signup');

  const loginForm = document.getElementById('loginForm');

  const signupForm = document.getElementById('signupForm');

  const signupPassword = document.getElementById('signup-password');

  const strengthFill = document.querySelector('.strength-fill');

  const strengthLabel = document.querySelector('.strength-label');

  const successState = document.querySelector('.success-state');
  const authCard = document.querySelector('.auth-card');

  function switchTab(active) 
  {
    const isLogin = active === 'login';

    tabLogin.classList.toggle('tab--active', isLogin);

    tabLogin.setAttribute('aria-selected', isLogin);

    tabSignup.classList.toggle('tab--active', !isLogin);

    tabSignup.setAttribute('aria-selected', !isLogin);


    tabSlider.style.transform = isLogin ? 'translateX(0)' : 'translateX(calc(100% + 4px))';

s
    formLogin.classList.remove('active');
    formSignup.classList.remove('active');

    requestAnimationFrame(() => {
      const next = isLogin ? formLogin : formSignup;
      next.classList.add('active');
    });
  }

  tabLogin.addEventListener('click',  () => switchTab('login'));
  tabSignup.addEventListener('click', () => switchTab('signup'));


  document.querySelectorAll('.toggle-pw').forEach(btn => {
    btn.addEventListener('click', () => {
      const wrap = btn.closest('.input-wrap');
      const input = wrap.querySelector('.input');
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';

      btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');

      const icon = btn.querySelector('.eye-icon');
      icon.style.transform = 'scale(.7) rotate(180deg)';
      icon.style.transition = 'transform 200ms ease';


      setTimeout(() => {
        icon.style.transform = 'scale(1) rotate(0deg)';
      }, 180);
    });
  });

  const strengthLevels = [
    { 
      min: 0,  
      label: '',          
      color: '',          
      width: '0%'   },

    { 
      min: 1,  
      label: 'Weak',      
      color: '#e53e3e',   
      width: '25%'  },

    { 
      min: 3,  
      label: 'Fair',      
      color: '#ed8936',   
      width: '50%'  },

    { 
      min: 5,  
      label: 'Good',      
      color: '#48bb78',   
      width: '75%'  },

    { 
      min: 7,  
      label: 'Strong',    
      color: '#2a7a6a',   
      width: '100%' },
  ];

  function scorePassword(pw) 
  {
    let score = 0;

    if (!pw)
    {
      return 0;
    }

    if (pw.length >= 8)  
    {
      score += 2;
    }

    if (pw.length >= 12) 
    {
      score += 1;
    }

    if (/[A-Z]/.test(pw)) 
    {
      score += 1;
    }

    if (/[0-9]/.test(pw)) 
    {
      score += 1;
    }

    if (/[^A-Za-z0-9]/.test(pw)) 
    {
      score += 2;
    }

    if (pw.length >= 16) 
    {
      score += 1;
    }

    return score;
  }

  function updateStrength(pw) 
  {

    const score = scorePassword(pw);
    const level = strengthLevels.reduce((acc, l) => score >= l.min ? l : acc, strengthLevels[0]);

    strengthFill.style.width = level.width;
    strengthFill.style.backgroundColor = level.color;
    strengthLabel.textContent = level.label;
    strengthLabel.style.color = level.color;
  }

  if (signupPassword) 
  {
    signupPassword.addEventListener('input', e => updateStrength(e.target.value));
  }

  function validateEmail(email) 
  {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function setError(input, hasError) 
  {
    input.classList.toggle('error', hasError);

    if (hasError) 
    {
      input.setAttribute('aria-invalid', 'true');
      shakeElement(input);
    } 
    else 
    {
      input.removeAttribute('aria-invalid');
    }
  }

  function shakeElement(el) 
  {
    el.style.animation = 'none';

    el.getBoundingClientRect(); 
    el.style.animation = 'shake 380ms cubic-bezier(.36,.07,.19,.97) both';
    el.addEventListener('animationend', () => { el.style.animation = ''; }, { once: true });
  }

  const shakeStyle = document.createElement('style');
  shakeStyle.textContent = `
    @keyframes shake {
      10%, 90%  { transform: translateX(-2px); }
      20%, 80%  { transform: translateX(3px); }
      30%, 50%, 70% { transform: translateX(-4px); }
      40%, 60%  { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(shakeStyle);

  function createRipple(btn, e) 
  {
    const rect = btn.getBoundingClientRect();

    const size = Math.max(rect.width, rect.height) * 2;

    const x = (e.clientX - rect.left) - size / 2;

    const y = (e.clientY - rect.top)  - size / 2;

    const ripple = document.createElement('span');

    ripple.classList.add('ripple');
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }

  document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', e => createRipple(btn, e));
  });

  function setLoading(btn, on) 
  {
    btn.classList.toggle('loading', on);
    btn.disabled = on;
  }

  function simulateSubmit(btn, delay = 1400) 
  {

    setLoading(btn, true);

    return new Promise(resolve => setTimeout(() => {
      setLoading(btn, false);
      resolve();
    }, delay));
  }

  function showSuccess() 
  {

    const tabs  = authCard.querySelector('.tabs');

    const forms = authCard.querySelector('.forms-wrapper');

    [tabs, forms].forEach(el => {
      el.style.transition = 'opacity 300ms, transform 300ms';
      el.style.opacity    = '0';
      el.style.transform  = 'translateY(-12px)';
    });

    setTimeout(() => {
      [tabs, forms].forEach(el => el.style.display = 'none');
      successState.hidden = false;
    }, 320);
  }

  loginForm.addEventListener('submit', async e => {
    e.preventDefault();

    const email = document.getElementById('login-email');
    const password = document.getElementById('login-password');
    let valid = true;

    if (!validateEmail(email.value.trim())) 
    {
      setError(email, true);
      valid = false;
    } 

    else 
    {
      setError(email, false);
    }

    if (password.value.length < 6) 
    {
      setError(password, true);
      valid = false;
    } 

    else 
    {
      setError(password, false);
    }

    if (!valid)
    {
      return;
    }

    const btn = loginForm.querySelector('.btn-primary');
    await simulateSubmit(btn);
    showSuccess();
  });

  signupForm.addEventListener('submit', async e => {
    e.preventDefault();

    const name = document.getElementById('signup-name');
    const email = document.getElementById('signup-email');
    const password = document.getElementById('signup-password');
    const terms = document.getElementById('terms');
    let valid = true;

    if (name.value.trim().length < 2) 
    {
      setError(name, true);
      valid = false;
    } 
    else 
    {
      setError(name, false);
    }

    if (!validateEmail(email.value.trim())) 
    {
      setError(email, true);
      valid = false;
    } 
    else 
    {
      setError(email, false);
    }

    if (password.value.length < 8) 
    {
      setError(password, true);
      valid = false;
    } 
    else 
    {
      setError(password, false);
    }

    if (!terms.checked) 
    {
      shakeElement(terms.closest('.checkbox-row'));
      valid = false;
    }

    if (!valid)
    {
      return;
    }

    const btn = signupForm.querySelector('.btn-primary');
    await simulateSubmit(btn, 1600);
    showSuccess();
  });

  document.querySelectorAll('.input').forEach(input => {
    input.addEventListener('input', () => setError(input, false));
  });

  tabSlider.style.transform = 'translateX(0)';
  tabSlider.style.transition = 'transform 280ms cubic-bezier(.4,0,.2,1)';

})();