"""Turn the studio's original photographs into the files the site shows.

    python tools/photos.py "<folder with the originals>"

The originals stay wherever they are (they are never copied into this public
repository). For each photo named below, this writes small, ready-to-serve
WebP files into assets/:

  assets/hero/hero-ltr-768.webp ... -1920.webp   16:9, behind the headline
  assets/hero/hero-rtl-768.webp ... -1920.webp   the same, cropped for Arabic
  assets/about/about-450.webp ... about-1350.webp  4:3, the "About us" photo
  assets/gallery/g1-400.webp ... g1-1200.webp      4:3 gallery tiles
  assets/gallery/g1.webp                           the whole photo, uncropped,
                                                   for when a tile is opened
  assets/og.jpg                                    1200x630, the picture shown
                                                   when the site is shared

Every file is drawn fresh from the pixels: nothing the camera or phone stored
inside the original (EXIF, the GPS position where it was taken, serial
numbers, editing history) is carried over. Colours are converted to sRGB,
the colour space browsers assume.

Several sizes of each tile let a phone download a small file and a large
screen a sharp one (the browser picks, via srcset). The quality steps down
as the size goes up, the same trade-off script.js used for the Unsplash
placeholders: large files are only chosen by dense screens, where the
compression is invisible.

To change a crop, change that photo's focus below and run this again.
"""
import io
import os
import sys

from PIL import Image, ImageCms, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Each photo: the original's file name, then the point (x, y) that should
# stay in the middle of the crop, as fractions of the width and height.
# (0.5, 0.5) is the centre. A tall photo shown in a 4:3 tile loses half its
# height, so its y says which half to keep: 0.3 keeps the upper part.
#
# The hero (the first dance) is cropped twice, so the couple is never behind
# the headline: to their right for Swedish and English, where the headline
# sits on the left, and mirrored for Arabic. The fourth number zooms in
# (1.2 = 20% closer), which is what makes room to move them sideways; the
# faces stay in the band above the headline.
HERO_SRC = "WhatsApp Image 2026-10-06 at 17.45.56.jpeg"
HERO = {"ltr": (0.0, 0.39, 1.2),    # crop from the left edge: couple on the right
        "rtl": (1.0, 0.33, 1.35)}   # crop from the right edge: couple on the left
ABOUT = ("WhatsApp Image 2026-10-06 at 17.44.06.jpeg", 0.45, 0.5)     # black and white, stone bench

# The ids match galleryItems in script.js (category) and g1...g12 in i18n.js
# (the caption); the order there is the order on the page.
GALLERY = [
    ("g1",  "WhatsApp Image 2026-10-06 at 17.48.12.jpeg", 0.42, 0.5),   # veil in the wind
    ("g2",  "WhatsApp Image 2026-10-06 at 17.42.07.jpeg", 0.5, 0.3),    # black and white, close
    ("g3",  "WhatsApp Image 2026-10-06 at 17.52.58.jpeg", 0.45, 0.5),   # the jetty
    ("g4",  "WhatsApp Image 2026-10-06 at 17.45.06.jpeg", 0.56, 0.5),   # the ceremony
    ("g5",  "WhatsApp Image 2026-10-06 at 17.57.24.jpeg", 0.5, 0.5),    # the tiara
    ("g6",  "WhatsApp Image 2026-10-06 at 17.51.18.jpeg", 0.5, 0.38),   # beneath the veil
    ("g7",  "WhatsApp Image 2026-10-06 at 17.52.13.jpeg", 0.5, 0.55),   # under open skies
    ("g8",  "WhatsApp Image 2026-10-06 at 18.08.23.jpeg", 0.5, 0.5),    # the dance floor
    ("g9",  "WhatsApp Image 2026-10-06 at 17.58.17.jpeg", 0.5, 0.4),    # black and white, in the light
    ("g10", "WhatsApp Image 2026-10-06 at 18.06.07.jpeg", 0.5, 0.45),   # the buttonhole rose
    ("g11", "WhatsApp Image 2026-10-06 at 18.19.01.jpeg", 0.5, 0.7),    # hand in hand, brick courtyard
    ("g12", "WhatsApp Image 2026-10-06 at 17.59.42.jpeg", 0.5, 0.6),    # the bouquet
]
# Left out on purpose: the photo with a car's number plate, and the champagne
# glasses engraved with the couple's names and date - both readable when the
# photo is opened full size.

# (width, WebP quality). The widths match the srcset lists in index.html and
# script.js - change them together.
TILE_SIZES = [(400, 75), (800, 68), (1200, 58)]
HERO_SIZES = [(768, 72), (1280, 62), (1920, 52)]   # the zoomed crops are ~2000px wide; no 2560
ABOUT_SIZES = [(450, 75), (675, 70), (900, 66), (1350, 56)]
FULL_LONG_SIDE, FULL_QUALITY = 2000, 74
OG_SIZE = (1200, 630)

SRGB = ImageCms.createProfile("sRGB")


def load(folder, name):
    """Open an original upright and in sRGB, with nothing else attached."""
    path = os.path.join(folder, name)
    if not os.path.exists(path):
        sys.exit("Missing original: %s" % path)
    im = ImageOps.exif_transpose(Image.open(path))
    icc = im.info.get("icc_profile")
    if icc:
        src = ImageCms.ImageCmsProfile(io.BytesIO(icc))
        if "srgb" not in ImageCms.getProfileDescription(src).lower():
            im = ImageCms.profileToProfile(im, src, SRGB, outputMode="RGB")
    return im.convert("RGB")


def crop(im, aspect, fx, fy, zoom=1.0):
    """The largest crop of the given width/height ratio (divided by zoom),
    centred as near to the focus point as the edges allow."""
    w, h = im.size
    if w / h > aspect:
        cw, ch = round(h * aspect), h
    else:
        cw, ch = w, round(w / aspect)
    cw, ch = round(cw / zoom), round(ch / zoom)
    left = min(max(round(fx * w - cw / 2), 0), w - cw)
    top = min(max(round(fy * h - ch / 2), 0), h - ch)
    return im.crop((left, top, left + cw, top + ch))


def save_webp(im, path, quality):
    # No exif=, no icc_profile=: the file carries pixels only.
    im.save(path, "WEBP", quality=quality, method=6)


def sizes(im, path_for, steps, report):
    w, h = im.size
    for width, quality in steps:
        if width > w * 1.2:
            report.append("  note: %s is only %dpx wide, so its %dpx version is enlarged" % (path_for(width), w, width))
        out = im.resize((width, round(width * h / w)), Image.LANCZOS)
        save_webp(out, path_for(width), quality)


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    folder = sys.argv[1]
    report = []
    rel = lambda *p: os.path.join(ROOT, "assets", *p)

    hero = load(folder, HERO_SRC)
    for d, (fx, fy, zoom) in HERO.items():
        im = crop(hero, 16 / 9, fx, fy, zoom)
        sizes(im, lambda w: rel("hero", "hero-%s-%d.webp" % (d, w)), HERO_SIZES, report)
    og = crop(hero, OG_SIZE[0] / OG_SIZE[1], 0.5, 0.42).resize(OG_SIZE, Image.LANCZOS)
    og.save(rel("og.jpg"), "JPEG", quality=82, optimize=True, progressive=True)

    im = crop(load(folder, ABOUT[0]), 4 / 3, ABOUT[1], ABOUT[2])
    sizes(im, lambda w: rel("about", "about-%d.webp" % w), ABOUT_SIZES, report)

    for gid, name, fx, fy in GALLERY:
        whole = load(folder, name)
        tile = crop(whole, 4 / 3, fx, fy)
        sizes(tile, lambda w: rel("gallery", "%s-%d.webp" % (gid, w)), TILE_SIZES, report)
        full = whole.copy()
        full.thumbnail((FULL_LONG_SIDE, FULL_LONG_SIDE), Image.LANCZOS)   # never enlarges
        save_webp(full, rel("gallery", "%s.webp" % gid), FULL_QUALITY)

    print("Wrote the hero, the About photo, %d gallery photos and og.jpg." % len(GALLERY))
    print("\n".join(report))


if __name__ == "__main__":
    main()
