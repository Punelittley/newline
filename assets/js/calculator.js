/**
 * NEW LINE - Натяжные Потолки
 * Модуль калькулятора стоимости натяжных потолков
 */

document.addEventListener('DOMContentLoaded', () => {
  initCeilingCalculator();
});

function initCeilingCalculator() {
  const calcForm = document.getElementById('ceilingCalcForm');
  if (!calcForm) return;

  // Inputs
  const areaSlider = document.getElementById('calcArea');
  const areaValueDisplay = document.getElementById('calcAreaVal');
  const textureBtns = calcForm.querySelectorAll('[data-calc-texture]');
  const profileBtns = calcForm.querySelectorAll('[data-calc-profile]');
  const spotsInput = document.getElementById('calcSpots');
  const chandelierInput = document.getElementById('calcChandelier');
  const linesInput = document.getElementById('calcLines');
  const tracksInput = document.getElementById('calcTracks');
  const curtainCheckbox = document.getElementById('calcCurtain');
  const pipeCheckbox = document.getElementById('calcPipes');

  // Outputs
  const outArea = document.getElementById('outArea');
  const outTexture = document.getElementById('outTexture');
  const outProfile = document.getElementById('outProfile');
  const outDiscount = document.getElementById('outDiscount');
  const outTotal = document.getElementById('outTotal');
  const whatsappCalcBtn = document.getElementById('calcWhatsAppBtn');

  // Pricing constants (руб)
  const TEXTURE_PRICES = {
    matte: 490,       // MSD Premium матовый
    satin: 520,       // MSD Premium сатиновый
    glossy: 550,      // MSD Premium глянцевый
    fabric: 1450      // Тканевый Descor / Clipso
  };

  const TEXTURE_NAMES = {
    matte: 'Матовый (MSD Premium)',
    satin: 'Сатиновый (шелковистый)',
    glossy: 'Глянцевый (зеркальный)',
    fabric: 'Тканевый дышащий (Германия)'
  };

  const PROFILE_PRICES_PER_M = {
    classic: 0,       // базовый багет включен в базовый монтаж
    shadow: 550,      // EuroKRAAB теневой зазор (п.м)
    floating: 750     // Парящий с LED лентой и блоком питания (п.м)
  };

  const PROFILE_NAMES = {
    classic: 'Классический (со вставкой)',
    shadow: 'Теневой EuroKRAAB 2.0 (без вставки)',
    floating: 'Парящий с мягкой подсветкой'
  };

  const SPOT_PRICE = 450;          // монтаж стойки + светильника
  const CHANDELIER_PRICE = 700;    // монтаж люстры с закладной
  const LINE_PRICE_PER_M = 1900;   // световая линия с профилем и лентой
  const TRACK_PRICE_PER_M = 2900;  // магнитный шинопровод / трек
  const CURTAIN_PRICE = 2400;      // скрытая ниша под карниз (ПК-5)
  const PIPE_PRICE = 400;          // обвод труб отопления

  let currentTexture = 'matte';
  let currentProfile = 'classic';

  // Texture selector buttons
  textureBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      textureBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTexture = btn.getAttribute('data-calc-texture');
      calculate();
    });
  });

  // Profile selector buttons
  profileBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      profileBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentProfile = btn.getAttribute('data-calc-profile');
      calculate();
    });
  });

  // Area slider change
  if (areaSlider) {
    areaSlider.addEventListener('input', () => {
      if (areaValueDisplay) areaValueDisplay.textContent = `${areaSlider.value} м²`;
      calculate();
    });
  }

  // Counters and checkboxes
  [spotsInput, chandelierInput, linesInput, tracksInput, curtainCheckbox, pipeCheckbox].forEach(el => {
    if (el) {
      el.addEventListener('input', calculate);
      el.addEventListener('change', calculate);
    }
  });

  function calculate() {
    const area = areaSlider ? parseFloat(areaSlider.value) : 18;
    // Estimate room perimeter roughly as 4 * sqrt(area)
    const estimatedPerimeter = Math.round(4 * Math.sqrt(area));

    const canvasPrice = (TEXTURE_PRICES[currentTexture] || 490) * area;
    const profilePrice = (PROFILE_PRICES_PER_M[currentProfile] || 0) * estimatedPerimeter;
    
    const spotsCount = spotsInput ? parseInt(spotsInput.value) || 0 : 0;
    const chandeliersCount = chandelierInput ? parseInt(chandelierInput.value) || 0 : 0;
    const linesMeters = linesInput ? parseFloat(linesInput.value) || 0 : 0;
    const tracksMeters = tracksInput ? parseFloat(tracksInput.value) || 0 : 0;

    const spotsPrice = spotsCount * SPOT_PRICE;
    const chandeliersPrice = chandeliersCount * CHANDELIER_PRICE;
    const linesPrice = linesMeters * LINE_PRICE_PER_M;
    const tracksPrice = tracksMeters * TRACK_PRICE_PER_M;

    const curtainPrice = (curtainCheckbox && curtainCheckbox.checked) ? CURTAIN_PRICE : 0;
    const pipePrice = (pipeCheckbox && pipeCheckbox.checked) ? PIPE_PRICE : 0;

    let subtotal = canvasPrice + profilePrice + spotsPrice + chandeliersPrice + linesPrice + tracksPrice + curtainPrice + pipePrice;

    // Minimum order sum
    if (subtotal < 4500) subtotal = 4500;

    // Volume discount (10% for >= 30m², 15% for >= 60m²)
    let discountPercent = 0;
    if (area >= 60) {
      discountPercent = 15;
    } else if (area >= 30) {
      discountPercent = 10;
    }

    const discountAmount = Math.round((subtotal * discountPercent) / 100);
    const finalTotal = subtotal - discountAmount;

    // Update UI
    if (outArea) outArea.textContent = `${area} м²`;
    if (outTexture) outTexture.textContent = TEXTURE_NAMES[currentTexture];
    if (outProfile) outProfile.textContent = PROFILE_NAMES[currentProfile];
    if (outDiscount) {
      outDiscount.textContent = discountPercent > 0 ? `-${discountAmount.toLocaleString('ru-RU')} ₽ (${discountPercent}%)` : '0 ₽';
    }
    if (outTotal) {
      outTotal.textContent = `${finalTotal.toLocaleString('ru-RU')} ₽`;
    }

    // Build WhatsApp message link
    if (whatsappCalcBtn) {
      const msg = encodeURIComponent(
        `Здравствуйте, Пётр! Я рассчитал стоимость потолка на сайте NEW LINE:\n` +
        `• Площадь: ${area} м²\n` +
        `• Фактура: ${TEXTURE_NAMES[currentTexture]}\n` +
        `• Профиль: ${PROFILE_NAMES[currentProfile]}\n` +
        `• Светильников: ${spotsCount} шт, Люстр: ${chandeliersCount} шт\n` +
        `• Световых линий: ${linesMeters} м, Треков: ${tracksMeters} м\n` +
        `• Примерная смета: ${finalTotal.toLocaleString('ru-RU')} ₽\n` +
        `Хочу записаться на точный бесплатный замер с образцами!`
      );
      whatsappCalcBtn.href = `https://wa.me/79088967372?text=${msg}`;
    }
  }

  // Initial calculation run
  calculate();
}
