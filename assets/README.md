# Adding the studio's real photographs

Every picture on the site right now is a **placeholder** from Unsplash — stock
photography, not Elegant Media's work. This folder is where the real
photographs go. The site is already built to use them; nothing needs
redesigning when they arrive.

---

## The gallery (12 images)

**1. Save the photos here**, named `g1.jpg` through `g12.jpg`:

```
assets/gallery/g1.jpg
assets/gallery/g2.jpg
...
```

**2. Open `script.js`** and find the list near the top. For each photo you've
replaced, change `photo:` to `file:`

```js
// before — Unsplash placeholder
{ id: 'g1', cat: 'wedding', photo: 'photo-1519225421980-715cb0215aed', tall: false },

// after — the studio's own photo
{ id: 'g1', cat: 'wedding', file: 'assets/gallery/g1.jpg', tall: false },
```

That's the whole change. You can do them one at a time — placeholders and real
photos can sit side by side while the set is being filled in.

**3. Change the caption** in `i18n.js` if you want a different title. Look for
`g1:`, `g2:` and so on near the bottom of each language block. There are three
to update per photo — Arabic, English and Swedish.

**4. Change the category** with `cat:` — one of `wedding`, `engagement`,
`party`, `special`, `outdoor`. This decides which filter button shows it.

### Still to add: a christening category

Christenings and church events are now listed as a service, but there is **no
gallery category for them yet** — deliberately. Adding a `Dop` filter button
that shows stock photographs of other people's christenings would be worse
than not having one.

When real christening photographs arrive:

1. Save them as above and set `cat: 'christening'` on each.
2. In `index.html`, add a filter button next to the others:
   ```html
   <button type="button" class="filter" data-filter="christening" aria-pressed="false" data-i18n="filter_christening">Dop</button>
   ```
3. In `i18n.js`, add `filter_christening` to all three languages —
   `'Dop'` (Swedish), `'Christenings'` (English), `'تعميد'` (Arabic).

### Sizes and shapes

| Setting | Shape | Export at |
|---|---|---|
| `tall: false` | Landscape, 4:3 | **1600 × 1200 px** |
| `tall: true` | Portrait, 3:4 | **1200 × 1600 px** |

Portrait photos (`tall: true`) are shown landscape on phones and portrait on
larger screens, so keep the subject near the middle.

---

## The hero (the big photo behind the title)

Save as `assets/hero/hero.jpg`, exported at **2400 × 1350 px** (16:9,
landscape). Then in `index.html`, find the `<img class="hero-bg">` tag and
replace the `src` and `srcset` with:

```html
<img class="hero-bg" alt="" fetchpriority="high" decoding="async"
     width="2400" height="1350" src="assets/hero/hero.jpg" />
```

Delete the `srcset` and `sizes` lines when you do — they only apply to the
Unsplash placeholders.

Pick something with space on one side: the headline sits over the left in
Swedish and English, and over the right in Arabic.

---

## The "About us" photo

Save as `assets/about/team.jpg`, **1800 × 1200 px** (3:2, landscape). In
`index.html`, find the `<img>` inside `class="about-media"` and do the same —
replace `src`, delete `srcset` and `sizes`.

---

## Before exporting

- **Format:** JPEG at quality 80 is right for photographs. The site converts
  the placeholders to WebP automatically; for local files, JPEG is fine.
- **File size:** aim under **400 KB** each, and under **700 KB** for the hero.
  If a file is much larger, the export quality is set too high.
- **Colour:** export as **sRGB**, not Adobe RGB, or the colours will look flat
  in browsers.
- **Don't** upload straight from a phone's camera roll without resizing — those
  files are often 5–10 MB and will make the site slow on mobile data.

## Permission

Wedding and christening photographs show identifiable people, often children.
Get the couple's or the family's written permission before any photo goes on
a public website. This matters legally under GDPR and it matters to clients.

---

## Once the real photos are in

Three things on the site still describe placeholder content and should be
revisited at the same time:

- The gallery says *"Browse a curated selection of our work"* — true only once
  these are real.
- The `og:image` in `index.html` (the picture shown when the site is shared on
  Facebook or WhatsApp) still points at Unsplash.
- The business listing data at the top of `index.html` has an `"image"` field
  pointing at Unsplash too.
