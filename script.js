/* ===== Gallery data (titles & labels come from i18n) =====
   These are Unsplash placeholders until the studio's own photographs arrive.
   To swap one in: put the file in assets/gallery/ and replace
       photo: 'photo-1519225421980-715cb0215aed'
   with
       file:  'assets/gallery/g1.jpg'
   Nothing else needs changing. See assets/README.md. */
const galleryItems = [
  { id: 'g1',  cat: 'wedding',    photo: 'photo-1519225421980-715cb0215aed', tall: false },
  { id: 'g2',  cat: 'engagement', photo: 'photo-1606216794074-735e91aa2c92', tall: true  },
  { id: 'g3',  cat: 'outdoor',    photo: 'photo-1583939003579-730e3918a45a', tall: false },
  { id: 'g4',  cat: 'wedding',    photo: 'photo-1465495976277-4387d4b0b4c6', tall: false },
  { id: 'g5',  cat: 'party',      photo: 'photo-1530103862676-de8c9debad1d', tall: false },
  { id: 'g6',  cat: 'special',    photo: 'photo-1523580494863-6f3031224c94', tall: true  },
  { id: 'g7',  cat: 'wedding',    photo: 'photo-1511285560929-80b456fea0bc', tall: false },
  { id: 'g8',  cat: 'engagement', photo: 'photo-1591604466107-ec97de577aff', tall: false },
  { id: 'g9',  cat: 'outdoor',    photo: 'photo-1522673607200-164d1b6ce486', tall: false },
  { id: 'g10', cat: 'party',      photo: 'photo-1492684223066-81342ee5ff30', tall: true  },
  { id: 'g11', cat: 'special',    photo: 'photo-1464366400600-7168b8af9bc3', tall: false },
  { id: 'g12', cat: 'wedding',    photo: 'photo-1525258946800-98cfd641d0de', tall: false },
];

/* Unsplash resizes and crops straight from URL parameters, so each device can
   download only the pixels it will actually show rather than the same 800px
   file everywhere. Local files are used exactly as they are. */
const THUMB_WIDTHS = [400, 600, 800, 1000, 1200];
const THUMB_SIZES  = '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 92vw';

const LANDSCAPE = 3 / 4;   // height ÷ width -> 4:3
const PORTRAIT  = 4 / 3;   // height ÷ width -> 3:4

/* The wider variants are only ever picked by large or high-density displays,
   where compression artefacts are far harder to see - so quality can come
   down as width goes up with no visible difference. A 1200px file at q=55 is
   27% smaller than the same file at q=75 and looks identical on a retina
   screen. Without this, serving retina-sharp images would have doubled the
   page weight. */
const qualityFor = w => w >= 1200 ? 55 : w >= 1000 ? 62 : w >= 800 ? 68 : 75;

function thumbSet(item, ratio) {
  if (item.file) return { src: item.file, srcset: '' };
  const at = n =>
    `https://images.unsplash.com/${item.photo}?w=${n}&h=${Math.round(n * ratio)}` +
    `&fit=crop&q=${qualityFor(n)}&fm=webp`;
  return { src: at(800), srcset: THUMB_WIDTHS.map(n => `${at(n)} ${n}w`).join(', ') };
}

/* "tall" tiles are 4:3 on phones and only become 3:4 from 768px up, so the
   portrait crop is served only where it is actually displayed. Without this,
   phones downloaded a 3:4 image and then cropped most of it away. */
function pictureFor(item) {
  const attrs = 'width="800" height="600" alt="" loading="lazy" decoding="async"';
  const wide = thumbSet(item, LANDSCAPE);
  const img = s =>
    `<img src="${s.src}"${s.srcset ? ` srcset="${s.srcset}" sizes="${THUMB_SIZES}"` : ''} ${attrs} />`;

  if (!item.tall) return img(wide);

  const tall = thumbSet(item, PORTRAIT);
  return `<picture>
          ${tall.srcset ? `<source media="(min-width: 768px)" srcset="${tall.srcset}" sizes="${THUMB_SIZES}" />` : ''}
          ${img(wide)}
        </picture>`;
}

/* Full-size version for the lightbox - uncropped, so the whole frame shows. */
function fullSize(item) {
  return item.file || `https://images.unsplash.com/${item.photo}?w=1600&q=80&fm=webp`;
}

const grid = document.getElementById('galleryGrid');
let visibleItems = [];
let currentFilter = 'all';
let currentLang = (() => {
  try { return localStorage.getItem('elegantmedia_lang') || 'sv'; } catch (e) { return 'sv'; }
})();

function t(key) { return (I18N[currentLang] && I18N[currentLang][key]) || ''; }

function renderGallery(filter = currentFilter) {
  if (!grid) return;            // pages that have no gallery (e.g. webbdesign.html)
  currentFilter = filter;
  grid.innerHTML = '';
  visibleItems = galleryItems
    .filter(i => filter === 'all' || i.cat === filter)
    .map(i => ({ ...i, title: t(i.id), label: t('filter_' + i.cat) }));

  visibleItems.forEach((item, idx) => {
    /* <figure> wrapping a <button>: the button makes each image reachable by
       keyboard, and keeping only phrasing content inside it stays valid HTML.
       The button carries the accessible name, so the <img> is marked
       decorative to avoid the name being announced twice. */
    const fig = document.createElement('figure');
    fig.className = 'g-item' + (item.tall ? ' tall' : '');
    fig.innerHTML = `
      <button type="button" class="g-btn">
        ${pictureFor(item)}
        <span class="g-zoom" aria-hidden="true"><svg class="icon"><use href="#i-expand"/></svg></span>
        <span class="g-overlay">
          <span class="g-title">${item.title}</span>
          <span class="g-cat">${item.label}</span>
        </span>
      </button>`;
    const btn = fig.querySelector('.g-btn');
    btn.setAttribute('aria-label', `${t('a11y_view')}: ${item.title} — ${item.label}`);
    btn.addEventListener('click', () => openLightbox(idx));
    grid.appendChild(fig);
  });
}

/* ===== Filters ===== */
document.querySelectorAll('.filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(b => {
      const on = b === btn;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));   // state, not just colour
    });
    renderGallery(btn.dataset.filter);
  });
});

/* ===== Lightbox ===== */
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbCaption = document.getElementById('lbCaption');
let currentIndex = 0;

let lastFocused = null;   // where focus was before the dialog opened

function openLightbox(idx) {
  lastFocused = document.activeElement;
  currentIndex = idx;
  updateLightbox();
  lb.classList.add('open');
  lb.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  document.getElementById('lbClose').focus();
}
function updateLightbox() {
  const item = visibleItems[currentIndex];
  lbImg.src = fullSize(item);
  lbImg.alt = item.title;
  lbCaption.textContent = `${item.title} — ${item.label}`;
}
function closeLightbox() {
  lb.classList.remove('open');
  lb.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  /* Return focus to the image that opened it, so keyboard users don't get
     dumped back at the top of the page. */
  if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
  lastFocused = null;
}
function navLightbox(dir) {
  currentIndex = (currentIndex + dir + visibleItems.length) % visibleItems.length;
  updateLightbox();
}

/* Wired up only where a lightbox exists - webbdesign.html has no gallery. */
if (lb) {
  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  document.getElementById('lbPrev').addEventListener('click', () => navLightbox(-1));
  document.getElementById('lbNext').addEventListener('click', () => navLightbox(1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    const rtl = document.documentElement.dir === 'rtl';
    if (e.key === 'Escape') { closeLightbox(); return; }
    if (e.key === 'ArrowLeft') navLightbox(rtl ? 1 : -1);
    if (e.key === 'ArrowRight') navLightbox(rtl ? -1 : 1);

    /* Keep Tab inside the dialog while it is open. */
    if (e.key === 'Tab') {
      const f = [...lb.querySelectorAll('button')];
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}

/* ===== Language ===== */

/* Must stay in step with the loader in index.html's <head>. Only one of these
   is ever loaded at a time - Latin readers never download the Arabic faces
   and vice versa. */
const FONTS = {
  ltr: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Jost:wght@300;400;500;600&display=swap',
  rtl: 'https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;600;700&family=Tajawal:wght@300;400;500;700&display=swap'
};

function applyLang(lang) {
  const dict = I18N[lang];
  if (!dict) return;
  currentLang = lang;
  try { localStorage.setItem('elegantmedia_lang', lang); } catch (e) { /* storage blocked */ }

  document.documentElement.lang = lang;
  document.documentElement.dir = dict._dir;

  const fontLink = document.getElementById('langFonts');
  if (fontLink) {
    const href = FONTS[dict._dir] || FONTS.ltr;
    if (fontLink.href !== href) fontLink.href = href;
  }

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = dict[el.dataset.i18n];
    if (v != null) el.innerHTML = v;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const v = dict[el.dataset.i18nPh];
    if (v != null) el.placeholder = v;
  });
  /* Interface labels announced by screen readers - these used to stay
     Swedish no matter which language was selected. */
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const v = dict[el.dataset.i18nAria];
    if (v != null) el.setAttribute('aria-label', v);
  });
  document.querySelectorAll('[data-i18n-alt]').forEach(el => {
    const v = dict[el.dataset.i18nAlt];
    if (v != null) el.alt = v;
  });
  document.querySelectorAll('.lang-btn').forEach(btn => {
    const on = btn.dataset.lang === lang;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-pressed', String(on));
  });

  renderGallery(currentFilter);
}

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => applyLang(btn.dataset.lang));
});

/* ===== Navbar scroll + mobile menu ===== */
const navbar = document.getElementById('navbar');
/* Pages without a full-height hero behind the bar (webbdesign.html) keep it
   solid at all times, so the scroll toggle is skipped there. */
if (navbar && !navbar.classList.contains('navbar--static')) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });
}
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

function setMenu(open) {
  navLinks.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
}
navToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
/* Escape closes the menu and hands focus back to the button that opened it. */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navLinks.classList.contains('open')) {
    setMenu(false);
    navToggle.focus();
  }
});

/* ===== Reveal on scroll ===== */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* ===== Animated counters ===== */
const counters = document.querySelectorAll('[data-count]');
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = +el.dataset.count;
    let cur = 0;
    const step = Math.max(1, Math.ceil(target / 60));
    const tick = () => {
      cur += step;
      if (cur >= target) { el.textContent = target + '+'; }
      else { el.textContent = cur; requestAnimationFrame(tick); }
    };
    tick();
    counterObs.unobserve(el);
  });
}, { threshold: 0.5 });
counters.forEach(c => counterObs.observe(c));

/* ===== Booking form =====
   The form used to call preventDefault(), show "your request has been
   received" and then throw the data away - it had no destination at all, so
   every enquiry ever submitted was lost.

   It now hands the details to WhatsApp, which is the one contact route on
   this site already known to work. The visitor still presses send in
   WhatsApp themselves, so the confirmation below says exactly that rather
   than claiming the booking is done.

   When a real email destination is available this is the place to add it -
   post to the form service, and keep WhatsApp as the alternative. */

/* One place to change the number when the correct one is confirmed. */
const WHATSAPP_NUMBER = '4676200281';

const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  const status = document.getElementById('formStatus');
  const fallback = document.getElementById('formFallback');

  function bookingMessage() {
    const get = id => (document.getElementById(id).value || '').trim();
    const typeSel = document.getElementById('type');
    const typeLabel = typeSel.selectedIndex > 0
      ? typeSel.options[typeSel.selectedIndex].textContent.trim()
      : '';

    const lines = [t('wa_title'), ''];
    lines.push(`${t('wa_name')}: ${get('name')}`);
    lines.push(`${t('wa_phone')}: ${get('phone')}`);
    if (typeLabel) lines.push(`${t('wa_type')}: ${typeLabel}`);
    if (get('date')) lines.push(`${t('wa_date')}: ${get('date')}`);
    if (get('message')) lines.push(`${t('wa_details')}: ${get('message')}`);
    return lines.join('\n');
  }

  bookingForm.addEventListener('submit', e => {
    e.preventDefault();   // the browser has already enforced the required fields

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(bookingMessage())}`;
    fallback.href = url;
    status.hidden = false;

    /* Opened from a click, so this is normally allowed. If a pop-up blocker
       stops it, the fallback link above is already pointing at the same
       message. The form is deliberately NOT reset - if the hand-off fails
       the visitor still has everything they typed. */
    window.open(url, '_blank', 'noopener');
  });

  /* Booking date: no dates in the past */
  const dateField = document.getElementById('date');
  if (dateField) dateField.min = new Date().toISOString().split('T')[0];
}

/* ===== Year ===== */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ===== Init ===== */
applyLang(currentLang);
