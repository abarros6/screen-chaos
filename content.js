const chaosElements = {};
let chaosLevel = 3; // default

// Create a shadow root container so page styles don't interfere
const hostId = '__screen_chaos_host__';
let host = document.getElementById(hostId);
if (!host) {
  host = document.createElement('div');
  host.id = hostId;
  Object.assign(host.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: '2147483647' // max-ish
  });
  document.documentElement.appendChild(host);
  host.attachShadow({ mode: 'open' });
}
const root = host.shadowRoot;

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "clearChaos") {
    Object.keys(chaosElements).forEach(type => {
      if (chaosElements[type].cleanup) {
        chaosElements[type].cleanup();
      }
      if (chaosElements[type].el) {
        chaosElements[type].el.remove();
      }
      delete chaosElements[type];
    });
    return;
  }
  if (request.action === "setChaosLevel") {
    chaosLevel = request.level;
    return;
  }
  if (request.action === "toggleChaos") {
    if (request.enabled) {
      startChaos(request.chaosType);
    } else {
      stopChaos(request.chaosType);
    }
  }
});

function startChaos(type) {
  if (chaosElements[type]) return;
  if (type === "dvd") chaosElements.dvd = createDVD();
  else if (type === "confetti") chaosElements.confetti = createConfetti();
  else if (type === "snow") chaosElements.snow = createSnow();
  else if (type === "emoji") chaosElements.emoji = createEmoji();
  else if (type === "cursor") chaosElements.cursor = createCursorFollower();
}

function stopChaos(type) {
  if (!chaosElements[type]) return;
  if (chaosElements[type].cleanup) {
    chaosElements[type].cleanup();
  }
  if (chaosElements[type].el) {
    chaosElements[type].el.remove();
  }
  delete chaosElements[type];
}

// ======== DVD ========
function createDVD() {
  const el = document.createElement("div");
  el.textContent = "DVD";
  Object.assign(el.style, {
    position: "fixed", top: "50px", left: "50px", width: "100px", height: "50px",
    background: "#111827", color: "#fff", "text-align": "center", "line-height": "50px", zIndex: 999999, pointerEvents: "none"
  });
  document.body.appendChild(el);
  let x = 50, y = 50, dx = 2, dy = 2;
  let rafId;
  function anim() {
    x += dx * chaosLevel;
    y += dy * chaosLevel;
    if (x <= 0 || x + 100 >= window.innerWidth) dx *= -1;
    if (y <= 0 || y + 50 >= window.innerHeight) dy *= -1;
    el.style.left = x + "px";
    el.style.top = y + "px";
    rafId = requestAnimationFrame(anim);
  }
  anim();
  return { el, cleanup: () => cancelAnimationFrame(rafId) };
}

// ======== Confetti =======
function createConfetti() {
  let interval;
  function spawnConfettiBurst() {
    const count = 36;
    for (let i = 0; i < count * (chaosLevel/3); i++) { // Adjusted particle count based on chaos level
      const p = document.createElement('div');
      const size = 6 + Math.random() * 6;
      p.style.position = 'absolute';
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.background = 'hsl(' + Math.floor(Math.random() * 360) + ' 90% 60%)';
      p.style.left = Math.floor(Math.random() * window.innerWidth) + 'px';
      p.style.top = '-20px';
      p.style.opacity = '0.9';
      p.style.borderRadius = Math.random() > 0.5 ? '2px' : '999px';
      p.style.transform = 'translateZ(0)';
      p.style.pointerEvents = 'none';
      p.style.transition = 'transform 0s, opacity 0.5s linear';
      root.appendChild(p);
      const fall = 120 + Math.random() * 40;
      const drift = (Math.random() - 0.5) * 120;
      const duration = 2500 + Math.random() * 1500;
      const start = performance.now();
      function animate(t) {
        const dt = t - start;
        const progress = Math.min(dt / duration, 1);
        const y = progress * (window.innerHeight + 40);
        const x = Math.sin(progress * Math.PI * 2) * drift;
        p.style.transform = `translate(${x}px, ${y}px) rotate(${progress * 720}deg)`;
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          p.style.opacity = '0';
          setTimeout(() => p.remove(), 500);
        }
      }
      requestAnimationFrame(animate);
    }
  }

  spawnConfettiBurst();
  interval = setInterval(spawnConfettiBurst, 4000 / chaosLevel); // Speed up interval based on chaos level

  const cleanup = () => {
    clearInterval(interval);
    [...root.querySelectorAll('div')].forEach(el => {
      // Remove all elements in the shadow root except for the DVD if it's active
      if (!chaosElements.dvd || el !== chaosElements.dvd.el) {
        el.remove();
      }
    });
  };

  return { el: null, cleanup };
}

// ======== Snow ========
function createSnow() {
  const el = document.createElement("div");
  Object.assign(el.style, { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 999998 });
  document.body.appendChild(el);
  let flakes = [];
  for (let i = 0; i < 50 * chaosLevel; i++) {
    const f = document.createElement("div");
    f.textContent = "❄";
    f.style.position = "absolute";
    f.style.top = Math.random() * window.innerHeight + "px";
    f.style.left = Math.random() * window.innerWidth + "px";
    f.style.fontSize = (10 + Math.random() * 20) + "px";
    el.appendChild(f);
    flakes.push({ el: f, x: parseFloat(f.style.left), y: parseFloat(f.style.top), dx: (Math.random() - 0.5), dy: Math.random() });
  }
  let rafId;
  function anim() {
    flakes.forEach(f => {
      f.x += f.dx * chaosLevel;
      f.y += f.dy * chaosLevel;
      if (f.y > window.innerHeight) f.y = -20;
      f.el.style.left = f.x + "px";
      f.el.style.top = f.y + "px";
    });
    rafId = requestAnimationFrame(anim);
  }
  anim();
  return { el, cleanup: () => cancelAnimationFrame(rafId) };
}

// ======== Emoji Storm ========
function createEmoji() {
  const el = document.createElement("div");
  Object.assign(el.style, { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 999998 });
  document.body.appendChild(el);
  const emojis = ["💃", "🐱", "🍕", "😂", "🔥"];
  let interval = null;
  function burst() {
    for (let i = 0; i < 20 * chaosLevel; i++) {
      const e = document.createElement("div");
      e.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      e.style.position = "absolute";
      e.style.left = Math.random() * window.innerWidth + "px";
      e.style.top = "-20px";
      e.style.fontSize = (14 + Math.random() * 20) + "px";
      el.appendChild(e);
      const fall = (Math.random() * 2 + 2) * chaosLevel;
      const anim = function () {
        let y = parseFloat(e.style.top);
        if (y > window.innerHeight) {
          e.remove();
          return;
        }
        e.style.top = y + fall + "px";
        requestAnimationFrame(anim);
      };
      requestAnimationFrame(anim);
    }
  }
  interval = setInterval(burst, 2000);
  return { el, cleanup: () => clearInterval(interval) };
}

// ======== Cursor Follower ========
function createCursorFollower() {
  const el = document.createElement("div");
  el.textContent = "💀";
  Object.assign(el.style, { position: "fixed", top: "0", left: "0", fontSize: "30px", zIndex: 999999, pointerEvents: "none" });
  document.body.appendChild(el);
  const move = (e) => {
    el.style.left = (e.clientX + 5) + "px";
    el.style.top = (e.clientY + 5) + "px";
  };
  document.addEventListener("mousemove", move);
  return { el, cleanup: () => document.removeEventListener("mousemove", move) };
}