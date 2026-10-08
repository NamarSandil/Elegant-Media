/* ===== Gallery data (titles & labels come from i18n) =====
   The studio's own photographs (Batch 19, October 2026). The order here is
   the order on the page; the caption for each id is g1...g12 in i18n.js, and
   cat decides which filter button shows it.

   The files are made by tools/photos.py from the originals, which stay
   outside this public repository: for each id it writes 4:3 tiles in three
   widths (assets/gallery/g1-400.webp, -800, -1200) and the whole photo,
   uncropped, for the lightbox (assets/gallery/g1.webp). The crop - which part
   of a tall photo shows in the tile - is set there too. See assets/README.md.

   A single ready-made file still works for a quick swap:
       { id: 'g1', cat: 'wedding', file: 'assets/gallery/my-photo.jpg' }
   is shown as it is, cropped to the tile from its middle. */
const galleryItems = [
  { id: 'g1',  cat: 'wedding' },
  { id: 'g2',  cat: 'wedding' },
  { id: 'g3',  cat: 'outdoor' },
  { id: 'g4',  cat: 'wedding' },
  { id: 'g5',  cat: 'wedding' },
  { id: 'g6',  cat: 'wedding' },
  { id: 'g7',  cat: 'outdoor' },
  { id: 'g8',  cat: 'party' },
  { id: 'g9',  cat: 'wedding' },
  { id: 'g10', cat: 'wedding' },
  { id: 'g11', cat: 'outdoor' },
  { id: 'g12', cat: 'wedding' },
];

/* The tile widths tools/photos.py writes, so each device downloads only what
   it will show: a phone takes the 400 or 800 file, a large retina screen the
   1200 one. The tiles are already cropped to 4:3, the shape of --photo-ratio
   in styles.css. */
const THUMB_WIDTHS = [400, 800, 1200];
const THUMB_SIZES  = '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 92vw';

/* Pages in /en/ and /ar/ sit one folder down. The build marks them with
   <html data-root="../"> so a local photo such as assets/gallery/g1.webp
   resolves from the site root on every page. */
const ROOT = document.documentElement.dataset.root || '';

function thumbSet(item) {
  if (item.file) return { src: ROOT + item.file, srcset: '' };
  const at = n => `${ROOT}assets/gallery/${item.id}-${n}.webp`;
  return { src: at(800), srcset: THUMB_WIDTHS.map(n => `${at(n)} ${n}w`).join(', ') };
}

function pictureFor(item) {
  const s = thumbSet(item);
  return `<img src="${s.src}"${s.srcset ? ` srcset="${s.srcset}" sizes="${THUMB_SIZES}"` : ''}` +
    ` width="800" height="600" alt="" loading="lazy" decoding="async" />`;
}

/* Full-size version for the lightbox - uncropped, so the whole frame shows. */
function fullSize(item) {
  return ROOT + (item.file || `assets/gallery/${item.id}.webp`);
}

const grid = document.getElementById('galleryGrid');
let visibleItems = [];
let currentFilter = 'all';
/* Each language has its own address (/, /en/, /ar/), so the page's language
   is whatever its own <html lang> says. Nothing is stored in the browser. */
let currentLang = I18N[document.documentElement.lang] ? document.documentElement.lang : 'sv';

/* Earlier versions of the site saved the chosen language in the visitor's
   browser. Nothing reads it any more; clearing it keeps the privacy page's
   "stores nothing in your browser" true for returning visitors as well. */
try { localStorage.removeItem('elegantmedia_lang'); } catch (e) { /* storage blocked */ }

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
    fig.className = 'g-item';
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

/* ===== Filters =====
   A category with no photos hides its button instead of opening an empty
   gallery - engagements and special occasions, until the studio adds some.
   The button comes back by itself once a photo in galleryItems has that cat. */
document.querySelectorAll('.filter').forEach(btn => {
  const cat = btn.dataset.filter;
  if (cat !== 'all' && !galleryItems.some(i => i.cat === cat)) btn.hidden = true;
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

/* ===== Language =====
   tools/build.py writes each language version with its text, fonts, <head>
   and language switcher already in place, and the switcher is plain links
   between the versions - so nothing here changes language any more.

   Filling the text in again is a safety net, not the main route: if i18n.js
   has been edited but the pages not yet rebuilt, visitors still see the new
   wording straight away. It also renders the gallery, which is built here. */
function applyLang(lang) {
  const dict = I18N[lang];
  if (!dict) return;
  currentLang = lang;

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

  renderGallery(currentFilter);
}

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

/* ===== Animated counters =====
   The page already says "12+" on its own, so it is right even if this
   never runs. The count-up from zero is decoration on top, and is skipped
   for visitors who have asked their device for less motion. */
const counters = matchMedia('(prefers-reduced-motion: reduce)').matches
  ? [] : document.querySelectorAll('[data-count]');
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = +el.dataset.count;
    let cur = 0;
    const step = Math.max(1, Math.ceil(target / 60));
    const tick = () => {
      cur += step;
      if (cur >= target) { el.innerHTML = target + '<span class="stat-plus">+</span>'; }
      else { el.textContent = cur; requestAnimationFrame(tick); }
    };
    tick();
    counterObs.unobserve(el);
  });
}, { threshold: 0.5 });
counters.forEach(c => counterObs.observe(c));

/* ===== Booking form =====
   History: the form used to show "your request has been received" and throw
   the data away (fixed in Batch 2 with a WhatsApp hand-off), and that
   hand-off pointed at a number with a missing digit (fixed in Batch 4b).

   There are now two ways to send, as the owner chose at the start:
   - "Skicka förfrågan" emails the enquiry to the studio through FormSubmit.
     This is the main button, the default, and what Enter submits.
   - "eller skicka via WhatsApp", the link-style line under it (Batch 11),
     opens WhatsApp with the enquiry written out. It is a submit button too,
     so the form's checks run first, and setBusy() disables it with the other.

   The visitor is only ever told their request was received when FormSubmit
   has actually confirmed it. Anything else - network failure, timeout, or
   the form not yet being activated - offers WhatsApp instead, with the
   details already filled in, so nobody is left not knowing.

   FormSubmit sends a one-time "Activate Form" email to BOOKING_EMAIL on the
   first submission. Until someone clicks it, submissions are held (for up to
   30 days, per formsubmit.co/help) and delivered on activation.

   When testing, never submit against the real endpoint - it emails the
   owner. Stub window.fetch and window.open instead. */

/* International format with no "+" and no leading 00, which is what wa.me
   expects. Confirmed by the owner on 2026-09-18 as +46 76 200 02 81.
   The number used before (4676200281) was missing a digit - it was not a
   valid Swedish mobile, so WhatsApp could not open a chat with it. */
const WHATSAPP_NUMBER = '46762000281';

/* Where email enquiries go. Given by the owner on 2026-09-18. If the
   activation email never arrives, this address is the first thing to check. */
const BOOKING_EMAIL = 'elegantmedia200@gmail.com';

/* How long to wait for FormSubmit before offering WhatsApp instead. */
const EMAIL_TIMEOUT_MS = 15000;

/* Event types -> the Swedish label, so the studio's inbox always reads the
   same way whichever language the visitor used. */
const TYPE_KEYS = {
  wedding: 'form_type_w', engagement: 'form_type_e', christening: 'form_type_c',
  special: 'form_type_s', video: 'form_type_v', drone: 'form_type_d'
};
const LANG_NAMES = { sv: 'Svenska', en: 'Engelska', ar: 'Arabiska' };

const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  const status = document.getElementById('formStatus');
  const failWa = document.getElementById('failWa');
  const fallback = document.getElementById('formFallback');
  const submitButtons = [...bookingForm.querySelectorAll('button[type="submit"]')];

  /* Show exactly one status message ("sending", "ok", "fail", "wa") or none. */
  function setStatus(state) {
    if (state) status.dataset.state = state;
    else delete status.dataset.state;
    status.querySelectorAll('[data-state-part]').forEach(el => {
      el.hidden = el.dataset.statePart !== state;
    });
  }

  function setBusy(busy) {
    submitButtons.forEach(b => { b.disabled = busy; });
    bookingForm.setAttribute('aria-busy', String(busy));
  }

  function readFields() {
    const get = id => (document.getElementById(id).value || '').trim();
    const typeSel = document.getElementById('type');
    return {
      name: get('name'), phone: get('phone'), email: get('email'),
      date: get('date'), message: get('message'),
      type: typeSel.value,
      /* the label as the visitor saw it, in their language */
      typeLabel: typeSel.selectedIndex > 0
        ? typeSel.options[typeSel.selectedIndex].textContent.trim() : ''
    };
  }

  /* The WhatsApp message is written in the visitor's language - it is their
     message, sent from their phone. */
  function whatsappUrl(f) {
    const lines = [t('wa_title'), ''];
    lines.push(`${t('wa_name')}: ${f.name}`);
    lines.push(`${t('wa_phone')}: ${f.phone}`);
    if (f.email) lines.push(`${t('wa_email')}: ${f.email}`);
    if (f.typeLabel) lines.push(`${t('wa_type')}: ${f.typeLabel}`);
    if (f.date) lines.push(`${t('wa_date')}: ${f.date}`);
    if (f.message) lines.push(`${t('wa_details')}: ${f.message}`);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
  }

  /* The email is a notification to the studio, so its labels are always
     Swedish, plus a note of which language the visitor was using - that is
     the language to reply in. */
  function emailPayload(f) {
    const sv = I18N.sv;
    const payload = {
      _subject: `Ny bokningsförfrågan – ${f.name}`,
      _template: 'table',
      'Namn': f.name,
      'Telefon': f.phone,
      'Typ av tillfälle': sv[TYPE_KEYS[f.type]] || f.type,
      'Önskat datum': f.date || '–',
      'Meddelande': f.message || '–',
      'Språk på webbplatsen': LANG_NAMES[currentLang] || currentLang
    };
    if (f.email) {
      payload.email = f.email;      // FormSubmit's reply-to convention
      payload._replyto = f.email;
    }
    return payload;
  }

  /* true only when FormSubmit confirms the message was accepted. It has been
     documented both as the string "true" and as a boolean, so both count. */
  async function sendEmail(f) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), EMAIL_TIMEOUT_MS);
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${BOOKING_EMAIL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(emailPayload(f)),
        signal: ctrl.signal
      });
      if (!res.ok) return false;
      const data = await res.json().catch(() => ({}));
      return data.success === true || data.success === 'true';
    } catch (err) {
      return false;   // offline, blocked, timed out - WhatsApp is offered instead
    } finally {
      clearTimeout(timer);
    }
  }

  bookingForm.addEventListener('submit', async e => {
    e.preventDefault();   // the browser has already enforced the required fields

    /* A filled spam trap: pretend it worked and send nothing. */
    if (document.getElementById('hp_check').value) { setStatus('ok'); return; }

    const f = readFields();
    const waUrl = whatsappUrl(f);
    failWa.href = waUrl;
    fallback.href = waUrl;

    /* Enter in a text field submits with the first button, so email is the
       default whenever no button was named. */
    const via = (e.submitter && e.submitter.value) || 'email';

    if (via === 'whatsapp') {
      setStatus('wa');
      /* Opened directly from the click so pop-up blockers allow it. If one
         intervenes anyway, the link in the status message has the same
         message. The form is NOT reset - the details stay if this fails. */
      window.open(waUrl, '_blank', 'noopener');
      return;
    }

    setBusy(true);
    setStatus('sending');
    const ok = await sendEmail(f);
    setBusy(false);

    if (ok) {
      setStatus('ok');
      bookingForm.reset();   // only once it has genuinely been received
    } else {
      setStatus('fail');     // details kept, WhatsApp offered with them filled in
    }
  });

  /* Choosing WhatsApp from the failure message swaps to the WhatsApp note. */
  failWa.addEventListener('click', () => setStatus('wa'));

  /* Booking date: no dates in the past */
  const dateField = document.getElementById('date');
  if (dateField) dateField.min = new Date().toISOString().split('T')[0];
}

/* ===== Year ===== */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ===== Init ===== */
applyLang(currentLang);
