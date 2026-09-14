/* ===== Gallery data (titles & labels come from i18n) ===== */
const galleryItems = [
  { id: 'g1',  cat: 'wedding',    img: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80', tall: false },
  { id: 'g2',  cat: 'engagement', img: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80', tall: true },
  { id: 'g3',  cat: 'outdoor',    img: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80', tall: false },
  { id: 'g4',  cat: 'wedding',    img: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80', tall: false },
  { id: 'g5',  cat: 'party',      img: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80', tall: false },
  { id: 'g6',  cat: 'special',    img: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80', tall: true },
  { id: 'g7',  cat: 'wedding',    img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80', tall: false },
  { id: 'g8',  cat: 'engagement', img: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80', tall: false },
  { id: 'g9',  cat: 'outdoor',    img: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80', tall: false },
  { id: 'g10', cat: 'party',      img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80', tall: true },
  { id: 'g11', cat: 'special',    img: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80', tall: false },
  { id: 'g12', cat: 'wedding',    img: 'https://images.unsplash.com/photo-1525258946800-98cfd641d0de?w=800&q=80', tall: false },
];

const grid = document.getElementById('galleryGrid');
let visibleItems = [];
let currentFilter = 'all';
let currentLang = localStorage.getItem('elegantmedia_lang') || 'sv';

function t(key) { return (I18N[currentLang] && I18N[currentLang][key]) || ''; }

function renderGallery(filter = currentFilter) {
  currentFilter = filter;
  grid.innerHTML = '';
  visibleItems = galleryItems
    .filter(i => filter === 'all' || i.cat === filter)
    .map(i => ({ ...i, title: t(i.id), label: t('filter_' + i.cat) }));

  visibleItems.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'g-item reveal visible' + (item.tall ? ' tall' : '');
    div.innerHTML = `
      <img src="${item.img}" alt="${item.title} - ${item.label}" loading="lazy" />
      <div class="g-zoom">⤢</div>
      <div class="g-overlay">
        <h4>${item.title}</h4>
        <span>${item.label}</span>
      </div>`;
    div.addEventListener('click', () => openLightbox(idx));
    grid.appendChild(div);
  });
}

/* ===== Filters ===== */
document.querySelectorAll('.filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.filter.active').classList.remove('active');
    btn.classList.add('active');
    renderGallery(btn.dataset.filter);
  });
});

/* ===== Lightbox ===== */
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbCaption = document.getElementById('lbCaption');
let currentIndex = 0;

function openLightbox(idx) {
  currentIndex = idx;
  updateLightbox();
  lb.classList.add('open');
  lb.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function updateLightbox() {
  const item = visibleItems[currentIndex];
  lbImg.src = item.img.replace('w=800', 'w=1400');
  lbImg.alt = item.title;
  lbCaption.textContent = `${item.title} — ${item.label}`;
}
function closeLightbox() {
  lb.classList.remove('open');
  lb.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
function navLightbox(dir) {
  currentIndex = (currentIndex + dir + visibleItems.length) % visibleItems.length;
  updateLightbox();
}

document.getElementById('lbClose').addEventListener('click', closeLightbox);
document.getElementById('lbPrev').addEventListener('click', () => navLightbox(-1));
document.getElementById('lbNext').addEventListener('click', () => navLightbox(1));
lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  const rtl = document.documentElement.dir === 'rtl';
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') navLightbox(rtl ? 1 : -1);
  if (e.key === 'ArrowRight') navLightbox(rtl ? -1 : 1);
});

/* ===== Language ===== */
function applyLang(lang) {
  const dict = I18N[lang];
  if (!dict) return;
  currentLang = lang;
  localStorage.setItem('elegantmedia_lang', lang);

  document.documentElement.lang = lang;
  document.documentElement.dir = dict._dir;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = dict[el.dataset.i18n];
    if (v != null) el.innerHTML = v;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const v = dict[el.dataset.i18nPh];
    if (v != null) el.placeholder = v;
  });
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  renderGallery(currentFilter);
}

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => applyLang(btn.dataset.lang));
});

/* ===== Navbar scroll + mobile menu ===== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

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

/* ===== Booking form ===== */
document.getElementById('bookingForm').addEventListener('submit', e => {
  e.preventDefault();
  const note = document.getElementById('formNote');
  note.hidden = false;
  e.target.reset();
  setTimeout(() => { note.hidden = true; }, 6000);
});

/* ===== Year ===== */
document.getElementById('year').textContent = new Date().getFullYear();

/* ===== Booking date: no dates in the past ===== */
const dateField = document.getElementById('date');
dateField.min = new Date().toISOString().split('T')[0];

/* ===== Init ===== */
applyLang(currentLang);
