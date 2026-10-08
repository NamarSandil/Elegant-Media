# The studio's photographs

Since October 2026 every picture on the site is Elegant Media's own work: the
photo behind the headline, the "About us" photo and the twelve gallery
photos. This folder holds the files the site shows. They are **made from the
originals by a script**, not copied by hand, because each photo needs
several sizes and a careful crop.

> **The originals are private.** They live in the folder
> **`photos (originals)`**, inside the website folder next to `assets`. That
> folder is on the ignore list (`.gitignore`), so it is never uploaded:
> this repository is public, and the originals include photos left off the
> site on purpose.
>
> **One rule:** never drag the whole website folder into GitHub's website to
> upload it. The ignore list only protects normal updates, not a manual
> drag-and-drop, which would publish the originals too.

---

## Changing the photos

1. **Put the originals in `photos (originals)`.** Straight from the camera is
   best — the script does the resizing.
2. **Open `tools/photos.py`** and name the photos you want near the top:
   - `HERO_SRC` — the photo behind the headline (must be landscape).
   - `ABOUT` — the "About us" photo.
   - `GALLERY` — the twelve gallery photos, `g1` to `g12`, in the order they
     appear.

   Each line has a **focus point**: which part of the photo stays in view
   when it is cropped. `0.5, 0.5` is the middle. A tall photo in a 4:3 tile
   loses half its height, so its second number says which half to keep —
   `0.3` keeps the upper part, where the faces usually are.
3. **Run it** from the website folder:

   ```
   python tools/photos.py
   ```

   It overwrites the files in this folder. Look at them before going on.
4. **Captions and categories.** Each gallery photo's caption is `g1:` …
   `g12:` in `i18n.js`, in all three languages. Its category — which filter
   button shows it — is `cat:` in the list at the top of `script.js`: one of
   `wedding`, `engagement`, `party`, `special`, `outdoor`. A filter button
   with no photos hides itself (engagements and special occasions, at the
   moment) and comes back on its own once a photo has that category.
5. **Build and commit** as usual: `python tools/build.py`.

## What the script makes

| Files | Shape | Used for |
|---|---|---|
| `hero/hero-ltr-768.webp` … `-1920` | 16:9 | Behind the headline, Swedish and English |
| `hero/hero-rtl-768.webp` … `-1920` | 16:9 | The same photo for Arabic |
| `about/about-450.webp` … `-1350` | 4:3 | "About us" |
| `gallery/g1-400.webp`, `-800`, `-1200` | 4:3 | A gallery tile — phones get the small one |
| `gallery/g1.webp` | as taken | The whole photo, when a tile is opened |
| `og.jpg` | 1200×630 | The picture shown when the site is shared |

- **Every file is drawn fresh.** Nothing stored inside the originals is copied
  over — no camera data, and no GPS position of where the photo was taken.
  Colours are converted to sRGB, which browsers expect.
- **Why the hero is cropped twice:** the headline sits on the left in Swedish
  and English and on the right in Arabic, so each version moves the couple to
  the other side. On a phone held upright only a narrow strip of the photo
  shows; `object-position` near the end of `styles.css` keeps that strip on the
  faces. If the hero photo changes, check those two values.
- **One shape for every photo.** All tiles and the About photo are 4:3
  landscape, so the gallery never mixes tall and wide pictures. To change the
  shape for the whole site, change `--photo-ratio` in `styles.css` and the
  `4 / 3` crops in `tools/photos.py` together.

## A quick swap without the script

For a single photo already sized and saved by hand, a gallery line in
`script.js` can point straight at it:

```js
{ id: 'g3', cat: 'outdoor', file: 'assets/gallery/my-photo.jpg' },
```

It is shown as it is, cropped to the tile from its middle. Keep it under
400 KB.

## A christening category

Christenings and church events are listed as a service, but the gallery has
no christening photos yet, so there is no filter for them. When there are:

1. Add them in `tools/photos.py` and set `cat: 'christening'` in `script.js`.
2. In `index.html`, add a filter button next to the others:
   ```html
   <button type="button" class="filter" data-filter="christening" aria-pressed="false" data-i18n="filter_christening">Dop</button>
   ```
3. In `i18n.js`, add `filter_christening` to all three languages —
   `'Dop'` (Swedish), `'Christenings'` (English), `'العماد'` (Arabic).

## Permission — read before adding any photo

Wedding and christening photos show identifiable people, often children, and
the site promises that photos are never shown publicly without permission.

- Have the couple's or family's **written permission** before a photo goes
  on the site. It matters under GDPR, and it matters to clients.
- **Guests** in the background are people too. A crowded party photo is
  better with the couple's blessing and no one who asked not to be shown.
- **Look for readable details** before choosing a photo, because opening a
  tile shows the whole picture: names engraved on glasses or written on a
  sign, a date, a car's number plate. Two photos were left out of the October
  2026 set for exactly this reason — one with a number plate and one with
  engraved names on the champagne glasses.
