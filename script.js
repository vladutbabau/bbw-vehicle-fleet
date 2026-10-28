/* ==========================================================================
   BBW vehicle fleet — script.js
   JavaScript Vanilla, fără dependențe.
   ========================================================================== */
'use strict';

/* --------------------------------------------------------------------------
   1. CONFIGURARE — modifică datele de contact DOAR aici
   -------------------------------------------------------------------------- */
const CONFIG = {
  fleetName: 'BBW vehicle fleet',

  // Telefon: cum apare pe site + formatul pentru apel (tel:)
  phoneDisplay: '0752 266 727',
  phoneTel: '+40752266727',

  // WhatsApp: format internațional, DOAR cifre (fără +, spații sau paranteze)
  whatsapp: '40752266727',

  email: 'babauvlad@gmail.com',
  emailSubject: 'Informații despre colaborarea cu flota',

  // Mesajul precompletat pentru butoanele WhatsApp generale (fără date personale)
  whatsappGreeting: 'Bună ziua! Aș dori mai multe informații despre colaborarea cu flota dumneavoastră.',

  // Fotografie opțională în hero (ex. 'images/hero.jpg'). Lasă gol pentru ilustrația animată.
  heroImage: '',
  heroImageAlt: 'Mașină modernă într-un context urban',

  // Condiții comerciale CONFIRMATE (comisioane, bonusuri, mașini disponibile etc.).
  // Se afișează pe site doar dacă adaugi elemente. Exemplu:
  // { title: 'Comision flotă', text: 'X% din încasări — detalii la discuție.' }
  offers: [],

  // Frazele care se schimbă în titlul hero, înainte de „Nu și la noi.”
  // Păstrează doar ce poți respecta 100% — fiecare frază e o promisiune.
  heroPhrases: [
    'Flote neserioase?',
    'Comision mult prea mare?',
    'Plătești contabil separat?',
    'Costuri ascunse?'
  ],
  heroPhraseInterval: 3200, // milisecunde între fraze

  // Cerințe pentru verificarea eligibilității mașinii (orientativ).
  // Surse: OUG 49/2019 și condițiile publicate de Bolt și Uber pentru România.
  vehicleRules: {
    maxAge: 15,          // vechime maximă (ani) pentru transport alternativ
    warnFromAge: 14,     // de la această vârstă, autorizația poate fi emisă doar până la 15 ani
    minDoors: 4,
    minSeats: 5,         // inclusiv șoferul
    maxSeats: 9,
    comfortMinYear: 2018,
    xlMinYear: 2009,
    xlMinSeats: 7        // minimum 6 locuri pentru pasageri + șofer
  }
};

/* --------------------------------------------------------------------------
   2. Utilitare
   -------------------------------------------------------------------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/** Construiește un link WhatsApp cu mesaj codificat corect pentru URL. */
function buildWhatsAppUrl(message) {
  const base = `https://wa.me/${CONFIG.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/* --------------------------------------------------------------------------
   3. Aplică configurarea în pagină
   -------------------------------------------------------------------------- */
function applyConfig() {
  const hrefs = {
    whatsapp: buildWhatsAppUrl(CONFIG.whatsappGreeting),
    phone: `tel:${CONFIG.phoneTel}`,
    email: `mailto:${CONFIG.email}?subject=${encodeURIComponent(CONFIG.emailSubject)}`
  };
  $$('[data-contact]').forEach((el) => {
    const type = el.dataset.contact;
    if (hrefs[type]) el.setAttribute('href', hrefs[type]);
  });

  const labels = { phone: CONFIG.phoneDisplay, email: CONFIG.email };
  $$('[data-contact-label]').forEach((el) => {
    const type = el.dataset.contactLabel;
    if (labels[type]) el.textContent = labels[type];
  });

  $$('[data-fleet-name]').forEach((el) => { el.textContent = CONFIG.fleetName; });

  renderOffers();
  renderHeroImage();
}

function renderOffers() {
  const wrap = $('#offers');
  const grid = $('#offers-grid');
  if (!wrap || !grid || !Array.isArray(CONFIG.offers) || CONFIG.offers.length === 0) return;

  const fragment = document.createDocumentFragment();
  CONFIG.offers.forEach(({ title, text }) => {
    const item = document.createElement('div');
    item.className = 'offer';
    const h = document.createElement('p');
    h.className = 'offer__title';
    h.textContent = title || '';
    const p = document.createElement('p');
    p.className = 'offer__text';
    p.textContent = text || '';
    item.append(h, p);
    fragment.appendChild(item);
  });
  grid.appendChild(fragment);
  wrap.hidden = false;
}

/** Imaginea hero e opțională; dacă nu se încarcă, rămâne ilustrația. */
function renderHeroImage() {
  const holder = $('#hero-photo');
  if (!holder || !CONFIG.heroImage) return;

  const img = new Image();
  img.alt = CONFIG.heroImageAlt;
  img.decoding = 'async';
  img.fetchPriority = 'high';
  img.addEventListener('load', () => {
    holder.appendChild(img);
    holder.hidden = false;
    holder.parentElement.classList.add('has-photo');
  });
  img.addEventListener('error', () => { holder.remove(); });
  img.src = CONFIG.heroImage;
}

/* --------------------------------------------------------------------------
   4. Header: stare la scroll + link activ
   -------------------------------------------------------------------------- */
function initHeader() {
  const header = $('#site-header');
  if (!header) return;

  let ticking = false;
  const update = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();

  // Marchează în meniu secțiunea vizibilă
  const links = $$('.nav__link');
  const sections = links
    .map((link) => document.getElementById(link.getAttribute('href').slice(1)))
    .filter(Boolean);
  if (!('IntersectionObserver' in window) || sections.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => {
        const active = link.getAttribute('href') === `#${entry.target.id}`;
        if (active) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => observer.observe(s));
}

/* --------------------------------------------------------------------------
   5. Meniu mobil
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const header = $('#site-header');
  const toggle = $('.nav__toggle');
  const menu = $('#primary-nav');
  if (!header || !toggle || !menu) return;

  const desktop = window.matchMedia('(min-width: 960px)');

  const setOpen = (open) => {
    header.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Închide meniul' : 'Deschide meniul');
    document.dispatchEvent(new CustomEvent('menu:toggle', { detail: { open } }));
    if (open) {
      const first = $('.nav__link', menu);
      if (first) first.focus({ preventScroll: true });
    }
  };

  toggle.addEventListener('click', () => setOpen(!header.classList.contains('is-open')));

  // Închide la click pe un link din meniu
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });

  // Închide cu Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && header.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Închide dacă fereastra trece la desktop
  desktop.addEventListener('change', (e) => { if (e.matches) setOpen(false); });
}

/* --------------------------------------------------------------------------
   6. Scroll lin (CSS face scroll-ul; aici mutăm focusul pentru accesibilitate)
   -------------------------------------------------------------------------- */
function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link || link.hasAttribute('data-open-privacy')) return;
    const id = link.getAttribute('href').slice(1);
    const target = id && document.getElementById(id);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: prefersReducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
    history.pushState(null, '', `#${id}`);

    // Pentru formular, focus pe primul câmp; altfel pe secțiune
    if (id === 'inscriere') {
      const first = $('#f-name');
      if (first && !$('#signup-form').hidden) setTimeout(() => first.focus({ preventScroll: true }), 500);
    } else {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  });
}

/* --------------------------------------------------------------------------
   7. Animații la apariție (IntersectionObserver)
   -------------------------------------------------------------------------- */
function initReveal() {
  const items = $$('.reveal');
  items.forEach((el) => {
    if (el.dataset.delay) el.style.setProperty('--d', el.dataset.delay);
  });

  if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  items.forEach((el) => observer.observe(el));
}

/** Efect de lumină care urmărește cursorul pe carduri (doar pe dispozitive cu mouse). */
function initCardGlow() {
  if (!window.matchMedia('(hover: hover)').matches) return;
  $$('.card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

/** Oprește animația mașinuței din hartă dacă utilizatorul preferă mișcare redusă. */
function initMapMotion() {
  const map = $('#hero-map');
  if (map && prefersReducedMotion.matches && typeof map.pauseAnimations === 'function') {
    map.pauseAnimations();
  }
}

/* --------------------------------------------------------------------------
   Titlu hero rotativ
   -------------------------------------------------------------------------- */
function initHeroRotator() {
  const holder = $('[data-rotator]');
  const phrases = Array.isArray(CONFIG.heroPhrases) ? CONFIG.heroPhrases.filter(Boolean) : [];
  if (!holder || phrases.length === 0) return;

  // Construiește toate frazele (cea mai lungă stabilește înălțimea titlului)
  holder.textContent = '';
  const items = phrases.map((text, i) => {
    const span = document.createElement('span');
    span.className = 'rotator__item' + (i === 0 ? ' is-active' : '');
    span.textContent = text.replace(/-/g, '\u2011'); // cratimă care nu se rupe la capăt de rând („nu-ți”)
    holder.appendChild(span);
    return span;
  });

  if (items.length < 2 || prefersReducedMotion.matches) return;

  let index = 0;
  let timer = null;
  const next = () => {
    const current = items[index];
    index = (index + 1) % items.length;
    current.classList.remove('is-active');
    current.classList.add('is-leaving');
    items[index].classList.remove('is-leaving');
    items[index].classList.add('is-active');
    window.setTimeout(() => current.classList.remove('is-leaving'), 700);
  };
  const start = () => { if (!timer) timer = window.setInterval(next, CONFIG.heroPhraseInterval || 3200); };
  const stop = () => { window.clearInterval(timer); timer = null; };

  // Rulează doar când titlul e vizibil și fila e activă
  let inView = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView && !document.hidden) start(); else stop();
    }).observe(holder);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else if (inView) start();
  });
  start();
}

/* --------------------------------------------------------------------------
   8. FAQ — accordion
   -------------------------------------------------------------------------- */
function initFaq() {
  $$('.faq__btn').forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      panel.classList.toggle('is-open', open);
    });
  });
}

/* --------------------------------------------------------------------------
   9. Formular de înscriere
   -------------------------------------------------------------------------- */

/** Normalizează numărul de telefon: păstrează doar cifrele și un + inițial. */
function normalizePhone(value) {
  const trimmed = value.trim();
  const plus = trimmed.startsWith('+') ? '+' : '';
  return plus + trimmed.replace(/\D/g, '');
}

const VALIDATORS = {
  name(value) {
    const v = value.trim();
    if (!v) return 'Te rugăm să introduci numele și prenumele.';
    if (!/^[\p{L}][\p{L}\s'.-]*$/u.test(v)) return 'Numele poate conține doar litere, spații, apostrof și cratimă.';
    if (v.length < 4 || !/\s/.test(v)) return 'Te rugăm să introduci atât numele, cât și prenumele.';
    return '';
  },
  phone(value) {
    const v = normalizePhone(value);
    if (!v) return 'Te rugăm să introduci numărul de telefon.';
    // Român: 07xxxxxxxx / 02xxxxxxxx / 03xxxxxxxx, cu sau fără prefix +40 / 0040 / 40
    const ro = /^(?:\+40|0040|40|0)[237]\d{8}$/;
    // Internațional: + și 10–15 cifre
    const intl = /^\+\d{10,15}$/;
    if (!ro.test(v) && !intl.test(v)) return 'Numărul nu pare valid. Exemplu: 0712 345 678 sau +40 712 345 678.';
    return '';
  },
  email(value) {
    const v = value.trim();
    if (!v) return ''; // opțional
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Adresa de e-mail nu pare validă. Exemplu: nume@exemplu.ro';
    return '';
  },
  city(value) {
    return value ? '' : 'Te rugăm să alegi orașul.';
  },
  platform(value) {
    return value ? '' : 'Alege platforma de interes.';
  },
  experience(value) {
    return value ? '' : 'Te rugăm să alegi o variantă.';
  },
  car(value) {
    return value ? '' : 'Te rugăm să alegi o variantă.';
  },
  message(value) {
    return value.length > 500 ? 'Mesajul poate avea maximum 500 de caractere.' : '';
  },
  consent(_value, form) {
    return form.elements.consent.checked ? '' : 'Este necesar să confirmi că ai luat la cunoștință politica de confidențialitate.';
  }
};

const FIELD_ORDER = ['name', 'phone', 'email', 'city', 'platform', 'experience', 'car', 'message', 'consent'];

function getValue(form, name) {
  const el = form.elements[name];
  if (!el) return '';
  if (el.type === 'checkbox') return el.checked ? 'da' : '';
  return el.value || '';
}

function setFieldState(form, name, error) {
  const wrap = $(`[data-field="${name}"]`, form);
  if (!wrap) return;
  const errorEl = $('.field__error', wrap);
  const controls = $$('input, select, textarea', wrap);

  wrap.classList.toggle('is-invalid', Boolean(error));
  const hasValue = getValue(form, name) !== '';
  wrap.classList.toggle('is-valid', !error && hasValue && name !== 'consent');
  controls.forEach((c) => {
    if (error) c.setAttribute('aria-invalid', 'true');
    else c.removeAttribute('aria-invalid');
  });
  if (errorEl) errorEl.textContent = error || '';
}

function validateField(form, name) {
  const error = VALIDATORS[name](getValue(form, name), form);
  setFieldState(form, name, error);
  return !error;
}

function collectData(form) {
  return {
    name: getValue(form, 'name').trim().replace(/\s+/g, ' '),
    phone: getValue(form, 'phone').trim(),
    email: getValue(form, 'email').trim(),
    city: getValue(form, 'city'),
    platform: getValue(form, 'platform'),
    experience: getValue(form, 'experience'),
    car: getValue(form, 'car'),
    vehicle: getValue(form, 'car') === 'Da' ? checkedVehicleSummary : '',
    message: getValue(form, 'message').trim()
  };
}

function buildSignupMessage(d) {
  return [
    'Bună ziua! Doresc să mă înscriu în flota dumneavoastră.',
    '',
    `Nume: ${d.name}`,
    `Telefon: ${d.phone}`,
    `E-mail: ${d.email || 'nespecificat'}`,
    `Oraș: ${d.city}`,
    `Platformă: ${d.platform}`,
    `Experiență ca șofer ridesharing: ${d.experience}`,
    `Mașină proprie: ${d.car}`,
    ...(d.vehicle ? [`Mașina: ${d.vehicle}`] : []),
    `Mesaj: ${d.message || '-'}`,
    '',
    'Aștept să mă contactați pentru mai multe detalii. Mulțumesc!'
  ].join('\n');
}

/** Copiere în clipboard, cu variantă de rezervă pentru browsere mai vechi. */
async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand('copy');
  ta.remove();
  if (!ok) throw new Error('copy failed');
}

function initForm() {
  const form = $('#signup-form');
  const review = $('#review');
  if (!form || !review) return;

  const submitBtn = $('#form-submit');
  const preview = $('#review-preview');
  const sendLink = $('#wa-send');
  const editBtn = $('#review-edit');
  const copyBtn = $('#review-copy');
  const status = $('#review-status');
  const counter = $('#c-message');
  const touched = new Set();
  let currentMessage = '';

  // Validare la părăsirea câmpului, apoi „live” după prima interacțiune
  FIELD_ORDER.forEach((name) => {
    const el = form.elements[name];
    if (!el) return;
    const controls = el instanceof RadioNodeList ? Array.from(el) : [el];
    controls.forEach((c) => {
      const onCommit = () => { touched.add(name); validateField(form, name); };
      c.addEventListener('blur', () => {
        // pentru radio validăm doar după ce s-a ales ceva sau la submit
        if (c.type !== 'radio' && c.type !== 'checkbox' && (c.value || touched.has(name))) onCommit();
      });
      c.addEventListener('change', onCommit);
      c.addEventListener('input', () => {
        if (touched.has(name)) validateField(form, name);
      });
    });
  });

  // Contor caractere mesaj
  const msg = form.elements.message;
  if (msg && counter) {
    const updateCounter = () => { counter.textContent = `${msg.value.length} / 500`; };
    msg.addEventListener('input', updateCounter);
    updateCounter();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (submitBtn.classList.contains('is-loading')) return;

    let firstInvalid = null;
    FIELD_ORDER.forEach((name) => {
      touched.add(name);
      const ok = validateField(form, name);
      if (!ok && !firstInvalid) firstInvalid = name;
    });

    if (firstInvalid) {
      const el = form.elements[firstInvalid];
      const target = el instanceof RadioNodeList ? el[0] : el;
      target.focus();
      return;
    }

    // Stare de încărcare scurtă, cât se pregătește mesajul
    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    currentMessage = buildSignupMessage(collectData(form));
    preview.textContent = currentMessage;
    // Datele intră în URL-ul WhatsApp doar acum, la cererea explicită a utilizatorului
    sendLink.href = buildWhatsAppUrl(currentMessage);
    status.hidden = true;
    status.innerHTML = '';

    window.setTimeout(() => {
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
      form.hidden = true;
      review.hidden = false;
      review.classList.remove('is-entering');
      void review.offsetWidth; // repornește animația
      review.classList.add('is-entering');
      review.focus({ preventScroll: true });
      review.scrollIntoView({ behavior: prefersReducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
    }, 350);
  });

  // Deschiderea WhatsApp: NU afișăm „trimis cu succes”, doar instrucțiuni clare
  sendLink.addEventListener('click', () => {
    if (sendLink.getAttribute('aria-disabled') === 'true') return;
    sendLink.setAttribute('aria-disabled', 'true');
    window.setTimeout(() => sendLink.removeAttribute('aria-disabled'), 2500);

    status.hidden = false;
    status.innerHTML = '';
    const p1 = document.createElement('p');
    p1.innerHTML = '<strong>Am deschis WhatsApp cu mesajul tău.</strong> Înscrierea ajunge la noi doar după ce apeși <strong>Trimite</strong> în conversație.';
    const p2 = document.createElement('p');
    p2.textContent = `Nu s-a deschis WhatsApp? Copiază mesajul și trimite-l la ${CONFIG.phoneDisplay} sau sună-ne direct.`;
    status.append(p1, p2);
  });

  editBtn.addEventListener('click', () => {
    review.hidden = true;
    form.hidden = false;
    sendLink.href = buildWhatsAppUrl(CONFIG.whatsappGreeting); // scoate datele din link
    currentMessage = '';
    const first = form.elements.name;
    form.scrollIntoView({ behavior: prefersReducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
    first.focus({ preventScroll: true });
  });

  copyBtn.addEventListener('click', async () => {
    const label = $('.btn__label', copyBtn);
    const original = 'Copiază mesajul';
    copyBtn.disabled = true;
    try {
      await copyText(currentMessage);
      label.textContent = 'Copiat!';
    } catch {
      label.textContent = 'Copiere indisponibilă';
    }
    window.setTimeout(() => {
      label.textContent = original;
      copyBtn.disabled = false;
    }, 2000);
  });
}

/* --------------------------------------------------------------------------
   Verificare eligibilitate mașină (orientativă, totul rulează în browser)
   -------------------------------------------------------------------------- */
let checkedVehicleSummary = ''; // apare în mesajul de înscriere dacă șoferul a verificat mașina

const OTHER = '__other'; // valoarea opțiunii „Altă marcă” / „Alt model”
const FREE_TEXT = /^[\p{L}\p{N}][\p{L}\p{N} .'+-]*$/u;
const freeText = (what) => (v) => {
  const t = v.trim();
  if (!t) return `Scrie ${what}.`;
  if (!FREE_TEXT.test(t)) return 'Folosește doar litere, cifre, spații și cratimă.';
  return '';
};
const CAR_VALIDATORS = {
  brand: (v) => (v ? '' : 'Alege marca mașinii.'),
  model: (v) => (v ? '' : 'Alege modelul mașinii.'),
  brandOther: freeText('marca'),
  modelOther: freeText('modelul'),
  year: (v) => (v ? '' : 'Alege anul fabricației.'),
  fuel: (v) => (v ? '' : 'Alege tipul de combustibil.'),
  doors: (v) => (v ? '' : 'Alege numărul de uși.'),
  seats: (v) => (v ? '' : 'Alege numărul de locuri.'),
  ac: (v) => (v ? '' : 'Alege o variantă.')
};

/** Câmpurile care trebuie validate acum, în funcție de ce a ales șoferul. */
function activeCarFields(form) {
  const brand = getValue(form, 'brand');
  const fields = ['brand'];
  if (brand === OTHER) fields.push('brandOther', 'modelOther');
  else {
    fields.push('model');
    if (getValue(form, 'model') === OTHER) fields.push('modelOther');
  }
  return fields.concat(['year', 'fuel', 'doors', 'seats', 'ac']);
}

const ICON_PATHS = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  alert: '<path d="M12 8v5M12 16.5h.01"/><circle cx="12" cy="12" r="9"/>'
};
function iconSvg(name) {
  return `<svg class="icon" aria-hidden="true" viewBox="0 0 24 24">${ICON_PATHS[name]}</svg>`;
}
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Evaluează datele mașinii după regulile din CONFIG.vehicleRules. */
function evaluateVehicle(d) {
  const r = CONFIG.vehicleRules;
  const year = Number(d.year);
  const age = new Date().getFullYear() - year;
  const seats = Number(d.seats);
  const checks = [];

  if (age > r.maxAge) {
    checks.push({ state: 'fail', text: `Vechime: ${age} ani. Depășește limita legală de ${r.maxAge} ani pentru transport alternativ.` });
  } else if (age >= r.warnFromAge) {
    checks.push({ state: 'warn', text: `Vechime: ${age} ani. E aproape de limita de ${r.maxAge} ani, iar autorizația (copia conformă) poate fi emisă doar până mașina împlinește ${r.maxAge} ani.` });
  } else {
    checks.push({ state: 'ok', text: `Vechime: ${age < 1 ? 'sub 1 an' : age + (age === 1 ? ' an' : ' ani')} (limita legală este de ${r.maxAge} ani).` });
  }

  checks.push(d.doors === '4-5'
    ? { state: 'ok', text: '4–5 uși (minimum necesar: 4).' }
    : { state: 'fail', text: 'Sunt necesare minimum 4 uși. Mașinile coupé nu sunt acceptate.' });

  if (seats < r.minSeats) checks.push({ state: 'fail', text: `Sunt necesare minimum ${r.minSeats} locuri, inclusiv șoferul.` });
  else if (seats > r.maxSeats) checks.push({ state: 'fail', text: `Pentru transport alternativ sunt acceptate maximum ${r.maxSeats} locuri, inclusiv șoferul.` });
  else checks.push({ state: 'ok', text: `Număr de locuri potrivit (${r.minSeats}–${r.maxSeats}, inclusiv șoferul).` });

  checks.push(d.ac === 'Da'
    ? { state: 'ok', text: 'Aer condiționat funcțional.' }
    : { state: 'fail', text: 'Aerul condiționat trebuie să funcționeze. Odată reparat, mașina poate fi verificată din nou.' });

  const status = checks.some((c) => c.state === 'fail') ? 'fail'
    : checks.some((c) => c.state === 'warn') ? 'warn' : 'ok';

  const extras = [];
  if (status !== 'fail') {
    extras.push('Bolt și UberX (standard)');
    if (year >= r.comfortMinYear) extras.push('Posibil Comfort, în funcție de model');
    if (seats >= r.xlMinSeats && year >= r.xlMinYear) extras.push('Posibil XL');
    if (d.fuel === 'Electric') extras.push('Posibil Bolt Green / Uber Green');
    if (d.fuel === 'Hibrid') extras.push('Posibil Bolt Green, dacă e full hybrid');
  }
  return { status, checks, extras, age };
}

function renderVehicleResult(container, d, result) {
  const titles = { ok: 'Eligibilă', warn: 'Eligibilă, la limită', fail: 'Neeligibilă' };
  const icons = { ok: 'check', warn: 'alert', fail: 'x' };
  const carName = `${d.brand.trim()} ${d.model.trim()}, ${d.year}, ${d.fuel}`;

  container.className = `car-result car-result--${result.status}`;
  container.textContent = '';

  const verdict = el('div', 'verdict');
  const vIcon = el('span', 'verdict__icon');
  vIcon.innerHTML = iconSvg(icons[result.status]);
  const vText = el('div');
  vText.append(el('p', 'verdict__label', 'Rezultat orientativ'), el('p', 'verdict__title', titles[result.status]));
  verdict.append(vIcon, vText);
  container.append(verdict, el('p', 'verdict__car', carName));

  // Bolt / Uber
  const platforms = el('div', 'platform-verdicts');
  ['Bolt', 'Uber'].forEach((name) => {
    const chip = el('span', `platform-verdict platform-verdict--${result.status}`);
    const dot = el('span', 'platform-verdict__dot');
    dot.innerHTML = iconSvg(icons[result.status]);
    chip.append(dot, document.createTextNode(name));
    platforms.appendChild(chip);
  });
  container.appendChild(platforms);

  // Verificări
  const list = el('ul', 'checks');
  result.checks.forEach((c) => {
    const li = el('li', `check-row check-row--${c.state}`);
    const ic = el('span', 'check-row__icon');
    ic.innerHTML = iconSvg(c.state === 'ok' ? 'check' : c.state === 'warn' ? 'alert' : 'x');
    li.append(ic, el('span', '', c.text));
    list.appendChild(li);
  });
  container.appendChild(list);

  // Categorii posibile
  if (result.extras.length) {
    const box = el('div', 'car-extras');
    box.appendChild(el('p', 'car-extras__title', 'Categorii posibile'));
    const ul = el('ul', 'car-extras__list');
    result.extras.forEach((x) => ul.appendChild(el('li', '', x)));
    box.appendChild(ul);
    container.appendChild(box);
  }

  // Documente
  if (result.status !== 'fail') {
    const docs = el('p', 'car-docs');
    docs.innerHTML = '<strong>Urmează actele:</strong> ITP la 6 luni, RCA, asigurare pentru pasageri și bagaje și copia conformă. Te ajutăm noi cu toate.';
    container.appendChild(docs);
  }

  // Acțiuni
  const actions = el('div', 'car-actions');
  const waText = [
    'Bună ziua! Aș vrea să verificăm eligibilitatea mașinii mele:',
    '',
    `Mașina: ${d.brand.trim()} ${d.model.trim()}`,
    `An fabricație: ${d.year}`,
    `Combustibil: ${d.fuel}`,
    `Uși: ${d.doors}`,
    `Locuri (cu șoferul): ${d.seats === '10' ? '10+' : d.seats === '8' ? '8–9' : d.seats}`,
    `Aer condiționat funcțional: ${d.ac}`,
    '',
    `Rezultat verificare pe site: ${titles[result.status]}`
  ].join('\n');
  const wa = el('a', 'btn btn--wa');
  wa.href = buildWhatsAppUrl(waText);
  wa.target = '_blank';
  wa.rel = 'noopener';
  wa.textContent = result.status === 'fail' ? 'Întreabă-ne pe WhatsApp' : 'Trimite datele pe WhatsApp';

  if (result.status !== 'fail') {
    const next = el('a', 'btn btn--primary', 'Continuă cu înscrierea');
    next.href = '#inscriere';
    next.addEventListener('click', () => {
      const form = $('#signup-form');
      const yes = form && form.querySelector('input[name="car"][value="Da"]');
      if (yes) { yes.checked = true; yes.dispatchEvent(new Event('change', { bubbles: true })); }
    });
    actions.append(next, wa);
  } else {
    actions.append(wa);
  }
  container.appendChild(actions);

  container.appendChild(el('p', 'car-disclaimer',
    'Verificare orientativă, pe baza cerințelor generale (OUG 49/2019 și condițiile publicate de Bolt și Uber). Decizia finală aparține platformei, după verificarea mașinii și a documentelor. Datele nu sunt salvate.'));
}

/** Fără diacritice și litere mici, pentru căutare („Citroën” = „citroen”). */
function normalizeText(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/**
 * Transformă un <select> într-o listă cu câmp „Caută”.
 * <select>-ul rămâne în pagină (ascuns) și păstrează valoarea, deci validarea
 * și restul codului funcționează la fel.
 */
function createCombo(select, searchLabel) {
  const wrapEl = select.closest('.select-wrap');
  wrapEl.classList.add('combo');
  select.classList.add('combo__native');
  select.tabIndex = -1;
  select.setAttribute('aria-hidden', 'true');

  const button = el('button', 'field__input combo__button');
  button.type = 'button';
  button.id = `${select.id}-btn`;
  button.setAttribute('aria-haspopup', 'listbox');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-describedby', select.getAttribute('aria-describedby') || '');
  const valueSpan = el('span', 'combo__value');
  button.appendChild(valueSpan);
  const label = document.querySelector(`label[for="${select.id}"]`);
  if (label) label.htmlFor = button.id;

  const panel = el('div', 'combo__panel');
  panel.hidden = true;
  const search = el('input', 'combo__search');
  search.type = 'text';
  search.placeholder = 'Caută';
  search.autocomplete = 'off';
  search.spellcheck = false;
  search.setAttribute('aria-label', searchLabel);
  search.setAttribute('role', 'combobox');
  search.setAttribute('aria-expanded', 'true');
  search.setAttribute('aria-autocomplete', 'list');
  const list = el('ul', 'combo__list');
  list.id = `${select.id}-list`;
  list.setAttribute('role', 'listbox');
  search.setAttribute('aria-controls', list.id);
  panel.append(search, list);
  wrapEl.append(button, panel);

  let items = [];
  let active = -1;

  const setActive = (i) => {
    items.forEach((li, j) => li.classList.toggle('is-active', j === i));
    active = i;
    if (i >= 0) {
      search.setAttribute('aria-activedescendant', items[i].id);
      items[i].scrollIntoView({ block: 'nearest' });
    } else {
      search.removeAttribute('aria-activedescendant');
    }
  };

  // Afișează opțiunile care încep cu literele scrise
  const render = () => {
    const q = normalizeText(search.value.trim());
    list.textContent = '';
    items = [];
    const opts = Array.from(select.options).filter((o) => o.value !== '');
    const matches = opts.filter((o) => o.value === OTHER || !q || normalizeText(o.textContent).startsWith(q));
    if (q && !matches.some((o) => o.value !== OTHER)) {
      list.appendChild(el('li', 'combo__empty', `Niciun rezultat pentru „${search.value.trim()}”`));
    }
    matches.forEach((o, i) => {
      const li = el('li', `combo__option${o.value === OTHER ? ' combo__option--other' : ''}`, o.textContent);
      li.id = `${select.id}-opt-${i}`;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(o.value === select.value));
      li.dataset.value = o.value;
      li.addEventListener('mousedown', (ev) => ev.preventDefault()); // nu pierde focusul din „Caută”
      li.addEventListener('click', () => choose(o.value));
      list.appendChild(li);
      items.push(li);
    });
    const selectedIndex = items.findIndex((li) => li.dataset.value === select.value);
    setActive(items.length ? (selectedIndex >= 0 && !q ? selectedIndex : 0) : -1);
  };

  const sync = () => {
    const o = select.selectedOptions[0];
    valueSpan.textContent = o ? o.textContent : '';
    valueSpan.classList.toggle('is-placeholder', !select.value);
    button.disabled = select.disabled;
  };
  const open = () => {
    if (select.disabled) return;
    panel.hidden = false;
    wrapEl.classList.add('is-open');
    button.setAttribute('aria-expanded', 'true');
    search.value = '';
    render();
    search.focus();
  };
  const close = (focusButton) => {
    if (panel.hidden) return;
    panel.hidden = true;
    wrapEl.classList.remove('is-open');
    button.setAttribute('aria-expanded', 'false');
    if (focusButton) button.focus();
  };
  const choose = (value) => {
    select.value = value;
    sync();
    close(true);
    select.dispatchEvent(new Event('change', { bubbles: true }));
  };

  button.addEventListener('click', () => (panel.hidden ? open() : close(false)));
  button.addEventListener('keydown', (ev) => {
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') { ev.preventDefault(); open(); }
  });
  search.addEventListener('input', render);
  search.addEventListener('keydown', (ev) => {
    if (ev.key === 'ArrowDown') { ev.preventDefault(); if (items.length) setActive(Math.min(active + 1, items.length - 1)); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); if (items.length) setActive(Math.max(active - 1, 0)); }
    else if (ev.key === 'Enter') { ev.preventDefault(); if (active >= 0) choose(items[active].dataset.value); }
    else if (ev.key === 'Escape') { ev.preventDefault(); close(true); }
    else if (ev.key === 'Tab') { close(false); }
  });
  document.addEventListener('click', (ev) => { if (!wrapEl.contains(ev.target)) close(false); });

  sync();
  select._combo = { sync, button, close };
  return select._combo;
}

/** Anii de producție ai modelului ales, din cars.js (sau null dacă nu se știe). */
function productionYears(catalog, brand, model) {
  if (!brand || brand === OTHER || !model || model === OTHER) return null;
  const range = catalog[brand] && catalog[brand][model];
  return Array.isArray(range) ? range : null;
}

function initCarChecker() {
  const form = $('#car-form');
  const result = $('#car-result');
  if (!form || !result) return;
  const catalog = typeof CAR_CATALOG === 'object' ? CAR_CATALOG : {};
  const now = new Date().getFullYear();
  const oldest = now - 25; // ultimul an afișat separat; mai vechi = o singură opțiune

  const brandSelect = form.elements.brand;
  const modelSelect = form.elements.model;
  const yearSelect = form.elements.year;
  const yearHint = $('#h-year');
  const fuelSelect = form.elements.fuel;
  const fuelHint = $('#h-fuel');
  const allFuels = Array.from(fuelSelect.options).filter((o) => o.value).map((o) => o.value);

  // Combustibilii posibili pentru modelul ales (ex. Tesla = doar Electric)
  const fillFuels = () => {
    const range = productionYears(catalog, brandSelect.value, modelSelect.value);
    const fuels = range && Array.isArray(range[2]) ? range[2] : allFuels;
    // o valoare aleasă automat (ex. „Electric” la Tesla) nu se păstrează la alt model
    const previous = fuelSelect.dataset.auto ? '' : fuelSelect.value;
    delete fuelSelect.dataset.auto;
    fuelSelect.textContent = '';
    if (fuels.length > 1) fuelSelect.appendChild(new Option('Alege', ''));
    fuels.forEach((f) => fuelSelect.appendChild(new Option(f, f)));

    if (fuels.length === 1) {
      fuelSelect.value = fuels[0]; // un singur combustibil posibil: îl alegem noi
      fuelSelect.dataset.auto = '1';
      setFieldState(form, 'fuel', '');
    } else {
      const ok = fuels.includes(previous);
      fuelSelect.value = ok ? previous : '';
      if (previous && !ok) setFieldState(form, 'fuel', 'Combustibilul ales nu există la acest model. Alege din nou.');
    }

    if (range && Array.isArray(range[2])) {
      const name = `${brandSelect.value} ${modelSelect.value}`;
      fuelHint.textContent = fuels.length === 1 && fuels[0] === 'Electric'
        ? `${name} e 100% electrică.`
        : (() => {
          const list = fuels.map((f) => f.toLowerCase().replace('gpl', 'GPL'));
          const joined = list.length > 1 ? `${list.slice(0, -1).join(', ')} sau ${list[list.length - 1]}` : list[0];
          return `${name} există doar ${list.length > 1 ? 'în variantele' : 'în variantă'} ${joined}.`;
        })();
      fuelHint.hidden = false;
    } else {
      fuelHint.hidden = true;
      fuelHint.textContent = '';
    }
  };

  // Mărcile din cars.js + „Altă marcă”
  Object.keys(catalog).sort((a, b) => a.localeCompare(b, 'ro')).forEach((b) => brandSelect.appendChild(new Option(b, b)));
  brandSelect.appendChild(new Option('Altă marcă (nu e în listă)', OTHER));
  createCombo(brandSelect, 'Caută marca');
  createCombo(modelSelect, 'Caută modelul');

  const wrap = (name) => $(`[data-field="${name}"]`, form);
  const showField = (name, show) => {
    wrap(name).hidden = !show;
    if (!show) { form.elements[name].value = ''; setFieldState(form, name, ''); }
  };

  // Anii posibili pentru modelul ales (an de final + 1, pentru înmatriculările din anul următor)
  const fillYears = () => {
    const range = productionYears(catalog, brandSelect.value, modelSelect.value);
    const from = range ? range[0] : 0;
    const to = range && range[1] ? Math.min(range[1] + 1, now) : now;
    const previous = yearSelect.value;

    yearSelect.textContent = '';
    yearSelect.appendChild(new Option('Alege anul', ''));
    for (let y = to; y >= Math.max(from, oldest); y -= 1) yearSelect.appendChild(new Option(String(y), String(y)));
    if (from < oldest) yearSelect.appendChild(new Option(`${oldest - 1} sau mai vechi`, String(oldest - 1)));

    const stillValid = Array.from(yearSelect.options).some((o) => o.value === previous && previous !== '');
    yearSelect.value = stillValid ? previous : '';
    if (previous && !stillValid) {
      setFieldState(form, 'year', 'Anul ales nu se potrivește cu modelul. Alege din nou.');
    }

    if (range) {
      const name = `${brandSelect.value} ${modelSelect.value}`;
      yearHint.textContent = range[1]
        ? `${name} s-a produs între ${range[0]} și ${range[1]}.`
        : `${name} se produce din ${range[0]} până în prezent.`;
      yearHint.hidden = false;
    } else {
      yearHint.hidden = true;
      yearHint.textContent = '';
    }
  };

  // Marca aleasă → modelele ei
  const fillModels = () => {
    const brand = brandSelect.value;
    modelSelect.textContent = '';
    if (!brand || brand === OTHER) {
      modelSelect.appendChild(new Option(brand === OTHER ? '—' : 'Alege întâi marca', ''));
      modelSelect.disabled = true;
    } else {
      modelSelect.appendChild(new Option('Alege modelul', ''));
      Object.keys(catalog[brand] || {}).forEach((m) => modelSelect.appendChild(new Option(m, m)));
      modelSelect.appendChild(new Option('Alt model (nu e în listă)', OTHER));
      modelSelect.disabled = false;
    }
    modelSelect._combo.sync();
    setFieldState(form, 'model', '');
    wrap('model').hidden = brand === OTHER;
    showField('brandOther', brand === OTHER);
    showField('modelOther', brand === OTHER);
    fillYears();
    fillFuels();
    if (brand === OTHER) form.elements.brandOther.focus();
  };
  brandSelect.addEventListener('change', fillModels);
  fuelSelect.addEventListener('change', () => { delete fuelSelect.dataset.auto; });
  modelSelect.addEventListener('change', () => {
    if (brandSelect.value !== OTHER) showField('modelOther', modelSelect.value === OTHER);
    fillYears();
    fillFuels();
    if (!wrap('modelOther').hidden && modelSelect.value === OTHER) form.elements.modelOther.focus();
  });
  fillYears();

  const validate = (name) => {
    const error = CAR_VALIDATORS[name](getValue(form, name));
    setFieldState(form, name, error);
    return !error;
  };
  const touched = new Set();
  Object.keys(CAR_VALIDATORS).forEach((name) => {
    const ctrl = form.elements[name];
    const controls = ctrl instanceof RadioNodeList ? Array.from(ctrl) : [ctrl];
    controls.forEach((c) => {
      c.addEventListener('change', () => { touched.add(name); validate(name); });
      c.addEventListener('input', () => { if (touched.has(name)) validate(name); });
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fields = activeCarFields(form);
    let firstInvalid = null;
    fields.forEach((name) => {
      touched.add(name);
      if (!validate(name) && !firstInvalid) firstInvalid = name;
    });
    if (firstInvalid) {
      const ctrl = form.elements[firstInvalid];
      if (ctrl._combo) ctrl._combo.button.focus();
      else (ctrl instanceof RadioNodeList ? ctrl[0] : ctrl).focus();
      return;
    }

    const d = {};
    ['year', 'fuel', 'doors', 'seats', 'ac'].forEach((name) => { d[name] = getValue(form, name); });
    const brand = getValue(form, 'brand');
    const model = getValue(form, 'model');
    d.brand = brand === OTHER ? getValue(form, 'brandOther').trim() : brand;
    d.model = brand === OTHER || model === OTHER ? getValue(form, 'modelOther').trim() : model;

    const outcome = evaluateVehicle(d);
    renderVehicleResult(result, d, outcome);
    const labels = { ok: 'eligibilă', warn: 'eligibilă, la limită', fail: 'neeligibilă' };
    checkedVehicleSummary = `${d.brand} ${d.model}, ${d.year}, ${d.fuel} (verificare pe site: ${labels[outcome.status]})`;

    result.classList.remove('is-entering');
    void result.offsetWidth;
    result.classList.add('is-entering');
    // Pe ecrane înguste rezultatul e sub formular: îl aducem în vizor
    if (window.matchMedia('(max-width: 1023px)').matches) {
      result.scrollIntoView({ behavior: prefersReducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
    }
    result.focus({ preventScroll: true });
  });
}

/** În formularul de înscriere: notă când șoferul nu are mașină proprie. */
function initCarNote() {
  const note = $('#car-note');
  const form = $('#signup-form');
  if (!note || !form) return;
  form.querySelectorAll('input[name="car"]').forEach((r) => {
    r.addEventListener('change', () => { note.hidden = getValue(form, 'car') !== 'Nu'; });
  });
}

/* --------------------------------------------------------------------------
   10. Buton WhatsApp flotant — ascuns în zona formularului și cu meniul deschis
   -------------------------------------------------------------------------- */
function initFloatingWhatsApp() {
  const btn = $('#wa-float');
  if (!btn) return;
  const hideIn = [$('#inscriere'), $('.footer')].filter(Boolean);
  const visible = new Set();
  let menuOpen = false;

  const update = () => btn.classList.toggle('is-hidden', visible.size > 0 || menuOpen);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      update();
    }, { threshold: 0.05 });
    hideIn.forEach((el) => observer.observe(el));
  }

  document.addEventListener('menu:toggle', (e) => { menuOpen = e.detail.open; update(); });
}

/* --------------------------------------------------------------------------
   11. Politica de confidențialitate (dialog)
   -------------------------------------------------------------------------- */
function initPrivacyDialog() {
  const dialog = $('#politica-confidentialitate');
  if (!dialog) return;

  const open = () => {
    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  };
  const close = () => {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  };

  $$('[data-open-privacy]').forEach((el) => {
    el.addEventListener('click', (e) => { e.preventDefault(); open(); });
  });
  $$('[data-close-privacy]', dialog).forEach((el) => el.addEventListener('click', close));

  // Închide la click pe fundal
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });

  // Deschide direct dacă adresa conține #politica-confidentialitate
  if (location.hash === '#politica-confidentialitate') open();
}

/* --------------------------------------------------------------------------
   12. Anul curent în footer
   -------------------------------------------------------------------------- */
function setYear() {
  const el = $('#year');
  if (el) el.textContent = String(new Date().getFullYear());
}

/* --------------------------------------------------------------------------
   Pornire
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  applyConfig();
  initHeader();
  initMobileMenu();
  initSmoothScroll();
  initReveal();
  initCardGlow();
  initMapMotion();
  initHeroRotator();
  initFaq();
  initForm();
  initCarChecker();
  initCarNote();
  initFloatingWhatsApp();
  initPrivacyDialog();
  setYear();
});
