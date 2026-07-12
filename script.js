/* =========================================================
   NITHIN MANGALI — PORTFOLIO SCRIPT
   Vanilla JS. No frameworks, no build step.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- LOADER ---------------- */
  (function loader() {
    const rpmFill = document.getElementById('rpmFill');
    const speedFill = document.getElementById('speedFill');
    const rpmValue = document.getElementById('rpmValue');
    const speedValue = document.getElementById('speedValue');
    const status = document.getElementById('loaderStatus');
    const barFill = document.getElementById('loaderBarFill');
    const loaderEl = document.getElementById('loader');
    const CIRC = 251;

    const statuses = ['SYSTEMS CHECK…', 'FUEL LOADED…', 'ENGINE IGNITION…', 'FORMATION LAP…', 'LIGHTS OUT!'];
    let progress = 0;
    let statusIndex = 0;

    function tick() {
      progress += prefersReducedMotion ? 20 : Math.random() * 9 + 4;
      if (progress > 100) progress = 100;

      const rpm = Math.min(9, (progress / 100) * 9);
      const speed = Math.min(320, (progress / 100) * 320);
      rpmFill.style.strokeDashoffset = CIRC - (CIRC * (rpm / 9));
      speedFill.style.strokeDashoffset = CIRC - (CIRC * (speed / 320));
      rpmValue.textContent = rpm.toFixed(1);
      speedValue.textContent = Math.round(speed);
      barFill.style.width = progress + '%';

      const newStatusIndex = Math.min(statuses.length - 1, Math.floor((progress / 100) * statuses.length));
      if (newStatusIndex !== statusIndex) {
        statusIndex = newStatusIndex;
        status.textContent = statuses[statusIndex];
      }

      if (progress < 100) {
        setTimeout(tick, prefersReducedMotion ? 60 : 140);
      } else {
        setTimeout(() => {
          loaderEl.classList.add('hidden');
          document.body.classList.add('loaded');
          startHeroTyping();
          revealOnLoad();
        }, 350);
      }
    }
    tick();
  })();

  /* ---------------- CUSTOM CURSOR ---------------- */
  if (window.matchMedia('(pointer: fine)').matches) {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });
    function raf() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(raf);
    }
    raf();
    document.querySelectorAll('a, button, .tilt-card, input, textarea, .skill-card').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
    });
  }

  /* ---------------- BACKGROUND PARTICLES (racing lines + stars) ---------------- */
  (function background() {
    const canvas = document.getElementById('bgCanvas');
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const COUNT = prefersReducedMotion ? 0 : 60;
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: -(Math.random() * 1.2 + 0.3), r: Math.random() * 1.6 + 0.4,
        alpha: Math.random() * 0.5 + 0.15
      });
    }

    let shootingStar = null;
    function maybeSpawnStar() {
      if (!shootingStar && Math.random() < 0.004) {
        shootingStar = { x: Math.random() * w * 0.6 + w * 0.2, y: 0, vx: 6, vy: 3, life: 60 };
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(0,217,255,0.55)';
      particles.forEach(p => {
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.vx;
        if (p.x < -10) p.x = w + 10;
      });
      ctx.globalAlpha = 1;

      maybeSpawnStar();
      if (shootingStar) {
        const s = shootingStar;
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 6, s.y - s.vy * 6);
        ctx.stroke();
        s.x += s.vx; s.y += s.vy; s.life--;
        if (s.life <= 0 || s.x > w || s.y > h) shootingStar = null;
      }

      if (!prefersReducedMotion) requestAnimationFrame(draw);
    }
    draw();
  })();

  /* ---------------- NAVBAR ---------------- */
  const navbar = document.getElementById('navbar');
  const navLinks = document.getElementById('navLinks');
  const hamburger = document.getElementById('hamburger');
  const sections = document.querySelectorAll('main .section, .hero');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('solid', window.scrollY > 40);
    updateScrollProgress();
    updateTelemetry();
    updateBackToTop();
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
    });
  });

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.section === id));
        updateTelemetrySector(id);
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.forEach(s => navObserver.observe(s));

  /* ---------------- THEME SWITCHER (team liveries) ---------------- */
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themePanel = document.getElementById('themePanel');
  const savedTheme = localStorage.getItem('nm-theme') || 'ferrari';
  document.body.dataset.theme = savedTheme;

  themeToggleBtn.addEventListener('click', () => {
    const open = themePanel.classList.toggle('open');
    themeToggleBtn.setAttribute('aria-expanded', open);
  });
  document.addEventListener('click', (e) => {
    if (!themePanel.contains(e.target) && e.target !== themeToggleBtn) themePanel.classList.remove('open');
  });
  document.querySelectorAll('.theme-option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.body.dataset.theme = btn.dataset.theme;
      localStorage.setItem('nm-theme', btn.dataset.theme);
      themePanel.classList.remove('open');
    });
  });

  /* ---------------- SCROLL PROGRESS + BACK TO TOP ---------------- */
  const scrollProgressEl = document.getElementById('scrollProgress');
  function updateScrollProgress() {
    const h = document.documentElement;
    const pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    scrollProgressEl.style.width = pct + '%';
  }
  const backToTop = document.getElementById('backToTop');
  function updateBackToTop() { backToTop.classList.toggle('show', window.scrollY > 600); }
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }));

  document.getElementById('scrollCue').addEventListener('click', () => {
    document.getElementById('about').scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  /* ---------------- TELEMETRY HUD ---------------- */
  const telemetrySector = document.getElementById('telemetrySector');
  const telemetryLap = document.getElementById('telemetryLap');
  const telemetryThrottle = document.getElementById('telemetryThrottle');
  const sectorNames = { home: '01 · GARAGE', about: '02 · BRIEFING', skills: '03 · SETUP', projects: '04 · RACE LOG', stats: '05 · TIMING', certs: '06 · PODIUM', contact: '07 · PIT LANE' };
  function updateTelemetrySector(id) { if (sectorNames[id]) telemetrySector.textContent = sectorNames[id]; }
  function updateTelemetry() {
    const h = document.documentElement;
    const pct = Math.min(100, Math.max(0, (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100));
    telemetryThrottle.textContent = Math.round(pct) + '%';
  }
  const pageStart = Date.now();
  setInterval(() => {
    const elapsed = (Date.now() - pageStart) / 1000;
    const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const secs = (elapsed % 60).toFixed(1).padStart(4, '0');
    telemetryLap.textContent = `${mins}:${secs}`;
  }, 100);

  /* ---------------- HERO TYPING EFFECT ---------------- */
  function startHeroTyping() {
    const roles = ['Software Developer', 'Full-Stack Enthusiast', 'Problem Solver · 350+ LeetCode', 'Fresher, Ready to Race'];
    const el = document.getElementById('typedRole');
    if (prefersReducedMotion) { el.textContent = roles[0]; return; }
    let roleIdx = 0, charIdx = 0, deleting = false;

    function step() {
      const current = roles[roleIdx];
      if (!deleting) {
        charIdx++;
        el.textContent = current.slice(0, charIdx);
        if (charIdx === current.length) { deleting = true; setTimeout(step, 1400); return; }
      } else {
        charIdx--;
        el.textContent = current.slice(0, charIdx);
        if (charIdx === 0) { deleting = false; roleIdx = (roleIdx + 1) % roles.length; }
      }
      setTimeout(step, deleting ? 35 : 65);
    }
    step();
  }

  /* ---------------- REVEAL ON SCROLL ---------------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  function revealOnLoad() { document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el)); }

  /* ---------------- COUNTERS ---------------- */
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      let cur = 0;
      const step = Math.max(1, Math.round(target / 60));
      const timer = setInterval(() => {
        cur += step;
        if (cur >= target) { cur = target; clearInterval(timer); }
        el.textContent = cur + suffix;
      }, 20);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.counter-num').forEach(el => counterObserver.observe(el));

  /* ---------------- SKILLS DATA ---------------- */
  const skills = [
    { name: 'Java', icon: '☕', pct: 85, cat: 'lang' },
    { name: 'Python', icon: '🐍', pct: 82, cat: 'lang' },
    { name: 'HTML / CSS', icon: '🎨', pct: 88, cat: 'web' },
    { name: 'JavaScript', icon: '⚡', pct: 78, cat: 'web' },
    { name: 'React.js', icon: '⚛️', pct: 72, cat: 'web' },
    { name: 'MySQL', icon: '🗄️', pct: 80, cat: 'data' },
    { name: 'MongoDB', icon: '🍃', pct: 70, cat: 'data' },
    { name: 'Linux', icon: '🐧', pct: 60, cat: 'ops' },
  ];
  const skillsGrid = document.getElementById('skillsGrid');
  function renderSkills(filter) {
    skillsGrid.innerHTML = '';
    skills.filter(s => filter === 'all' || s.cat === filter).forEach(s => {
      const card = document.createElement('div');
      card.className = 'skill-card';
      card.innerHTML = `
        <div class="skill-top"><span class="skill-icon">${s.icon}</span><span class="skill-name">${s.name}</span></div>
        <div class="skill-bar-track"><div class="skill-bar-fill" style="width:0%" data-pct="${s.pct}"></div></div>
        <span class="skill-pct">${s.pct}%</span>`;
      skillsGrid.appendChild(card);
    });
    requestAnimationFrame(() => {
      skillsGrid.querySelectorAll('.skill-bar-fill').forEach(f => { f.style.width = f.dataset.pct + '%'; });
    });
  }
  renderSkills('all');
  document.getElementById('skillFilters').addEventListener('click', (e) => {
    if (!e.target.classList.contains('filter-chip')) return;
    document.querySelectorAll('#skillFilters .filter-chip').forEach(c => c.classList.remove('active'));
    e.target.classList.add('active');
    renderSkills(e.target.dataset.filter);
  });

  /* ---------------- PROJECTS DATA ---------------- */
  const projects = [
    {
      title: 'Paddy Disease Detection using Vision Transformers', tag: 'ML Project',
      desc: 'Deep learning solution for early detection of paddy diseases using Vision Transformers, deployed with Streamlit for agricultural applications.',
      stack: ['Python', 'Vision Transformers', 'Deep Learning', 'Streamlit', 'Computer Vision'],
      code: 'https://github.com/nithin849/paddy-Disease'
    },
    {
      title: 'Electricity Bill Management System', tag: 'Java Project',
      desc: 'A Java application with GUI built in Swing and MySQL integration, streamlining billing and shift management for utility providers.',
      stack: ['Java', 'Swing', 'MySQL', 'GUI Development', 'Database'],
      code: 'https://github.com/nithin849/Electricity_bill_project', demo: 'https://drive.google.com/file/d/1mYFql4JJvEui-JO98uSohDrOJR3tUBSt/preview'
    },
    {
      title: 'House Price Prediction using Machine Learning', tag: 'ML Project',
      desc: 'A machine learning model predicting house prices from location, size, and amenities, comparing multiple algorithms for optimal accuracy.',
      stack: ['Python', 'Machine Learning', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib'],
      code: 'https://github.com/nithin849/HousePricePrediction'
    },
    {
      title: 'Hate Speech Detection using NLP', tag: 'NLP Project',
      desc: 'An NLP pipeline that classifies text content to identify harmful language patterns, demonstrating text processing and classification skills.',
      stack: ['Python', 'NLP', 'Text Classification', 'Machine Learning', 'Scikit-learn'],
      code: 'https://github.com/nithin849/Hate_Speech_Detection'
    },
    {
      title: 'Interactive Number Game', tag: 'Beginner Project',
      desc: 'A beginner-friendly Java application showcasing fundamental programming concepts through an interactive number guessing game.',
      stack: ['Java', 'Core Programming', 'Game Logic'],
      code: 'https://github.com/nithin849/NumberGame', demo: 'https://drive.google.com/file/d/1VeAELXdpxXd6x9UE4fFdAUVi_LBc4otL/preview'
    },
  ];
  const projectsGrid = document.getElementById('projectsGrid');
  function renderProjects(filter, query) {
    projectsGrid.innerHTML = '';
    const q = (query || '').toLowerCase();
    projects
      .filter(p => filter === 'all' || p.tag === filter)
      .filter(p => !q || p.title.toLowerCase().includes(q) || p.stack.join(' ').toLowerCase().includes(q))
      .forEach(p => {
        const card = document.createElement('div');
        card.className = 'tilt-card';
        card.innerHTML = `
          <span class="project-tag">${p.tag}</span>
          <h3 class="project-title">${p.title}</h3>
          <p class="project-desc">${p.desc}</p>
          <div class="project-stack">${p.stack.map(s => `<span class="stack-pill">${s}</span>`).join('')}</div>
          <div class="project-links">
            <a class="project-link" href="${p.code}" target="_blank" rel="noopener">View Code →</a>
            ${p.demo ? `<a class="project-link" href="${p.demo}" target="_blank" rel="noopener">Watch Demo →</a>` : ''}
          </div>`;
        projectsGrid.appendChild(card);
      });
    if (!projectsGrid.children.length) {
      projectsGrid.innerHTML = `<p style="color:var(--ink-faint)">No projects match that search — try another term.</p>`;
    }
  }
  renderProjects('all', '');
  document.getElementById('projectFilters').addEventListener('click', (e) => {
    if (!e.target.classList.contains('filter-chip')) return;
    document.querySelectorAll('#projectFilters .filter-chip').forEach(c => c.classList.remove('active'));
    e.target.classList.add('active');
    renderProjects(e.target.dataset.filter, document.getElementById('projectSearch').value);
  });
  document.getElementById('projectSearch').addEventListener('input', (e) => {
    const activeFilter = document.querySelector('#projectFilters .filter-chip.active').dataset.filter;
    renderProjects(activeFilter, e.target.value);
  });

  /* Tilt effect (event delegation since cards re-render) */
  projectsGrid.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.tilt-card');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const rotX = ((y / rect.height) - 0.5) * -8;
    const rotY = ((x / rect.width) - 0.5) * 8;
    card.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
    card.style.setProperty('--mx', x + 'px');
    card.style.setProperty('--my', y + 'px');
  });
  projectsGrid.addEventListener('mouseleave', (e) => {
    const card = e.target.closest && e.target.closest('.tilt-card');
    if (card) card.style.transform = '';
  }, true);

  /* ---------------- CERT CAROUSEL ---------------- */
  const certTrack = document.getElementById('certTrack');
  document.getElementById('certNext').addEventListener('click', () => certTrack.scrollBy({ left: 280, behavior: 'smooth' }));
  document.getElementById('certPrev').addEventListener('click', () => certTrack.scrollBy({ left: -280, behavior: 'smooth' }));

  /* ---------------- CONTACT FORM VALIDATION ---------------- */
  const form = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    const fields = [
      { id: 'fName', err: 'errName', test: v => v.trim().length > 1, msg: 'Please enter your name.' },
      { id: 'fEmail', err: 'errEmail', test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: 'Please enter a valid email.' },
      { id: 'fSubject', err: 'errSubject', test: v => v.trim().length > 2, msg: 'Please add a subject.' },
      { id: 'fMessage', err: 'errMessage', test: v => v.trim().length > 9, msg: 'Message should be at least 10 characters.' },
    ];
    fields.forEach(f => {
      const input = document.getElementById(f.id);
      const errEl = document.getElementById(f.err);
      const ok = f.test(input.value);
      input.closest('.form-row').classList.toggle('invalid', !ok);
      errEl.textContent = ok ? '' : f.msg;
      if (!ok) valid = false;
    });

    if (valid) {
      const name = document.getElementById('fName').value.trim();
      const subject = document.getElementById('fSubject').value.trim();
      const message = document.getElementById('fMessage').value.trim();
      const email = document.getElementById('fEmail').value.trim();
      const mailto = `mailto:mnithinmangali@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')')}`;
      formNote.textContent = 'Opening your email app to send this — thanks for reaching out!';
      window.location.href = mailto;
      form.reset();
    } else {
      formNote.textContent = 'Please fix the highlighted fields.';
    }
  });

  /* ---------------- KEYBOARD SHORTCUTS + KONAMI EASTER EGG ---------------- */
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Home') { window.scrollTo({ top: 0, behavior: 'smooth' }); }
    if (e.key === 'End') { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }
  });

  const konamiCode = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let konamiProgress = 0;
  window.addEventListener('keydown', (e) => {
    konamiProgress = (e.key === konamiCode[konamiProgress]) ? konamiProgress + 1 : 0;
    if (konamiProgress === konamiCode.length) { konamiProgress = 0; launchConfetti(); }
  });

  function launchConfetti() {
    if (prefersReducedMotion) return;
    const canvas = document.getElementById('confettiCanvas');
    canvas.style.display = 'block';
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    const colors = ['#e10600', '#ffb800', '#00d9ff', '#ffffff'];
    const pieces = Array.from({ length: 140 }, () => ({
      x: Math.random() * canvas.width, y: -20 - Math.random() * canvas.height * 0.5,
      vx: (Math.random() - 0.5) * 4, vy: Math.random() * 3 + 2,
      size: Math.random() * 6 + 4, color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 360, vr: (Math.random() - 0.5) * 10
    }));
    let frames = 0;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });
      frames++;
      if (frames < 220) requestAnimationFrame(animate);
      else canvas.style.display = 'none';
    }
    animate();
  }

  /* ---------------- FOOTER YEAR ---------------- */
  document.getElementById('year').textContent = new Date().getFullYear();
});
