/**
 * NEW LINE — Натяжные потолки любой сложности
 * Скрипты сайта и интерактивные компоненты
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollHeader();
  initScrollReveal();
  initHeroVisualizer();
  initBeforeAfterSlider();
  initEstimator();
  initModals();
  initStudioForms();
  initMobileDrawer();
});

/* 1. Header scroll effect */
function initScrollHeader() {
  const header = document.querySelector('.studio-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* 2. Scroll Reveal */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    reveals.forEach(el => observer.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('active'));
  }
}

/* 3. Before / After Interactive Slider */
function initBeforeAfterSlider() {
  const boxes = document.querySelectorAll('.before-after-box');
  boxes.forEach(box => {
    const cut = box.querySelector('.ba-after-cut');
    const divider = box.querySelector('.ba-divider');
    let isDown = false;

    if (!cut || !divider) return;

    function updatePos(clientX) {
      const rect = box.getBoundingClientRect();
      let pos = (clientX - rect.left) / rect.width;
      if (pos < 0) pos = 0;
      if (pos > 1) pos = 1;
      const pct = pos * 100;
      cut.style.width = `${pct}%`;
      divider.style.left = `${pct}%`;
    }

    box.addEventListener('mousedown', (e) => {
      isDown = true;
      updatePos(e.clientX);
    });

    window.addEventListener('mouseup', () => isDown = false);
    window.addEventListener('mousemove', (e) => {
      if (isDown) updatePos(e.clientX);
    });

    box.addEventListener('touchstart', (e) => {
      isDown = true;
      if (e.touches[0]) updatePos(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', () => isDown = false);
    window.addEventListener('touchmove', (e) => {
      if (isDown && e.touches[0]) updatePos(e.touches[0].clientX);
    }, { passive: true });
  });
}

/* 4. Studio Ceiling Estimator */
function initEstimator() {
  const range = document.getElementById('areaRange');
  const valDisplay = document.getElementById('areaValDisplay');
  const specArea = document.getElementById('specArea');
  const specTexture = document.getElementById('specTexture');
  const specProfile = document.getElementById('specProfile');
  const specDiscount = document.getElementById('specDiscount');
  const totalDisplay = document.getElementById('totalEstimateDisplay');
  const waBtn = document.getElementById('estimatorWaBtn');

  if (!range || !totalDisplay) return;

  const textureBtns = document.querySelectorAll('[data-est-texture]');
  const profileBtns = document.querySelectorAll('[data-est-profile]');
  const spotsInput = document.getElementById('estSpots');
  const linesInput = document.getElementById('estLines');
  const nicheCheckbox = document.getElementById('estNiche');

  const TEXTURES = {
    matte: { name: 'Матовый MSD', price: 490 },
    satin: { name: 'Сатиновый Bauf', price: 550 },
    fabric: { name: 'Тканевый Descor', price: 1450 }
  };

  const PROFILES = {
    classic: { name: 'Классический со вставкой', extraPerM: 0 },
    shadow: { name: 'Теневой EuroKRAAB 2.0', extraPerM: 550 },
    floating: { name: 'Парящий с LED контуром', extraPerM: 750 }
  };

  let selectedTexture = 'matte';
  let selectedProfile = 'shadow';

  textureBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      textureBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedTexture = btn.getAttribute('data-est-texture');
      recalc();
    });
  });

  profileBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      profileBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedProfile = btn.getAttribute('data-est-profile');
      recalc();
    });
  });

  range.addEventListener('input', () => {
    if (valDisplay) valDisplay.textContent = `${range.value} м²`;
    recalc();
  });

  [spotsInput, linesInput, nicheCheckbox].forEach(el => {
    if (el) {
      el.addEventListener('input', recalc);
      el.addEventListener('change', recalc);
    }
  });

  function recalc() {
    const area = parseFloat(range.value) || 18;
    const perim = Math.round(4 * Math.sqrt(area));

    const canvasSum = (TEXTURES[selectedTexture]?.price || 490) * area;
    const profileSum = (PROFILES[selectedProfile]?.extraPerM || 0) * perim;
    const spotsCount = parseInt(spotsInput?.value) || 0;
    const spotsSum = spotsCount * 450;
    const linesMeters = parseFloat(linesInput?.value) || 0;
    const linesSum = linesMeters * 1800;
    const nicheSum = nicheCheckbox?.checked ? 2400 : 0;

    let subtotal = canvasSum + profileSum + spotsSum + linesSum + nicheSum;
    if (subtotal < 4500) subtotal = 4500;

    let discountPct = 0;
    if (area >= 60) discountPct = 15;
    else if (area >= 30) discountPct = 10;

    const discountAmount = Math.round((subtotal * discountPct) / 100);
    const finalTotal = subtotal - discountAmount;

    if (specArea) specArea.textContent = `${area} м²`;
    if (specTexture) specTexture.textContent = TEXTURES[selectedTexture]?.name || '';
    if (specProfile) specProfile.textContent = PROFILES[selectedProfile]?.name || '';
    if (specDiscount) specDiscount.textContent = discountPct > 0 ? `-${discountAmount.toLocaleString('ru-RU')} ₽ (${discountPct}%)` : '0 ₽';
    if (totalDisplay) totalDisplay.textContent = `${finalTotal.toLocaleString('ru-RU')} ₽`;

    if (waBtn) {
      const msg = encodeURIComponent(
        `Здравствуйте, Пётр! Рассчитал предварительную смету на сайте NEW LINE:\n` +
        `• Площадь: ${area} м²\n` +
        `• Полотно: ${TEXTURES[selectedTexture]?.name}\n` +
        `• Профиль: ${PROFILES[selectedProfile]?.name}\n` +
        `• Светильников: ${spotsCount} шт, Световых линий: ${linesMeters} м\n` +
        `• Примерная сумма: ${finalTotal.toLocaleString('ru-RU')} ₽\n` +
        `Хочу согласовать точный бесплатный замер с образцами!`
      );
      waBtn.href = `https://wa.me/79088967372?text=${msg}`;
    }
  }

  recalc();
}

/* 5. Modals */
function initModals() {
  const triggers = document.querySelectorAll('[data-modal-target]');
  const closeBtns = document.querySelectorAll('.modal-close');
  const modals = document.querySelectorAll('.modal-overlay');

  triggers.forEach(trig => {
    trig.addEventListener('click', (e) => {
      e.preventDefault();
      const target = trig.getAttribute('data-modal-target');
      const m = document.getElementById(target);
      if (m) {
        m.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modals.forEach(m => m.classList.remove('active'));
      document.body.style.overflow = '';
    });
  });

  modals.forEach(m => {
    m.addEventListener('click', (e) => {
      if (e.target === m) {
        m.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });
}

/* 6. Forms */
function initStudioForms() {
  const forms = document.querySelectorAll('form.ajax-form');
  forms.forEach(f => {
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const phone = f.querySelector('input[type="tel"]');
      if (phone && phone.value.trim().length < 6) {
        showStudioToast('Укажите контактный номер телефона');
        phone.focus();
        return;
      }

      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
      document.body.style.overflow = '';

      showStudioToast('Заявка принята! Мастер Пётр свяжется с вами в течение 10 минут.');
      f.reset();
    });
  });
}

/* 7. Mobile Drawer */
function initMobileDrawer() {
  const toggle = document.querySelector('.mobile-toggle-btn');
  const menu = document.querySelector('.studio-nav');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.style.display === 'flex';
    menu.style.display = isOpen ? 'none' : 'flex';
    menu.style.flexDirection = 'column';
    menu.style.position = 'absolute';
    menu.style.top = '70px';
    menu.style.left = '20px';
    menu.style.right = '20px';
    menu.style.background = '#0E1217';
    menu.style.padding = '20px';
    menu.style.borderRadius = '16px';
    menu.style.boxShadow = '0 10px 30px rgba(0,0,0,0.8)';
  });
}

/* Toast */
function showStudioToast(msg) {
  let c = document.querySelector('.toast-container');
  if (!c) {
    c = document.createElement('div');
    c.className = 'toast-container';
    c.style.cssText = 'position: fixed; bottom: 24px; left: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;';
    document.body.appendChild(c);
  }

  const t = document.createElement('div');
  t.style.cssText = 'background: #141922; border: 1px solid #FF4800; color: #fff; padding: 14px 20px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); font-size: 0.9rem; animation: slideInLeft 0.3s ease;';
  t.innerHTML = `🔥 ${msg}`;

  c.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transition = 'opacity 0.3s';
    setTimeout(() => t.remove(), 300);
  }, 3500);
}

/* 8. Hero Architectural Visualizer */
function initHeroVisualizer() {
  const tabs = document.querySelectorAll('.stage-tab-btn');
  const stageImg = document.getElementById('stageMainImage');
  const tagEl = document.getElementById('stageInfoTag');
  const titleEl = document.getElementById('stageInfoTitle');
  const priceEl = document.getElementById('stageInfoPrice');
  const ambientBtn = document.getElementById('ambientToggleBtn');
  const ambientOverlay = document.getElementById('stageAmbientOverlay');

  const STAGE_DATA = {
    eurokraab: {
      img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
      tag: 'Теневой зазор 6 мм',
      title: 'EuroKRAAB 2.0',
      price: 'от 950 ₽ / м²'
    },
    lines: {
      img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      tag: 'Световые линии SWG',
      title: 'Линии 30 / 50 мм',
      price: 'от 1 800 ₽ / п.м.'
    },
    tracks: {
      img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
      tag: 'Магнитный шинопровод 48V',
      title: 'Магнитные треки',
      price: 'от 2 700 ₽ / п.м.'
    },
    floating: {
      img: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
      tag: 'Мягкий контурный свет',
      title: 'Парящий профиль LED',
      price: 'от 750 ₽ / п.м.'
    }
  };

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const stageKey = btn.dataset.stage;
      const data = STAGE_DATA[stageKey];
      if (!data) return;

      tabs.forEach(t => t.classList.remove('active'));
      btn.classList.add('active');

      if (stageImg) {
        stageImg.style.opacity = '0.35';
        stageImg.style.transform = 'scale(0.98)';
        setTimeout(() => {
          stageImg.src = data.img;
          stageImg.style.opacity = '1';
          stageImg.style.transform = 'scale(1)';
        }, 160);
      }

      if (tagEl) tagEl.textContent = data.tag;
      if (titleEl) titleEl.textContent = data.title;
      if (priceEl) priceEl.textContent = data.price;
    });
  });

  if (ambientBtn && ambientOverlay) {
    ambientBtn.addEventListener('click', () => {
      ambientBtn.classList.toggle('active');
      ambientOverlay.classList.toggle('active');
    });
  }
}
