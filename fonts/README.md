# Fonts

The site's fonts live here, so visitors' browsers never contact Google (or
anyone else) to draw the text. Every file is declared in `styles.css` (the
"Fonts" section at the end), and a browser only downloads the ones the page
in front of it actually uses.

| File | Font | Used for | Size |
|---|---|---|---|
| `bodoni-moda-latin.woff2` | Bodoni Moda, upright, weights 500–600, optical sizing | Swedish and English titles and numerals | 45 KB |
| `bodoni-moda-italic-latin.woff2` | Bodoni Moda, italic 500 (display size) | The gold words in the home page's headline | 17 KB |
| `jost-latin.woff2` | Jost, weights 300–600 | All other Swedish and English text | 26 KB |
| `cormorant-garamond-logo.woff2` | Cormorant Garamond 700 - **only the letters of ELEGANT MEDIA** | The logo, in every language | 2 KB |
| `el-messiri-arabic.woff2`, `el-messiri-latin.woff2` | El Messiri, weights 400–700 | Arabic titles and buttons | 22 + 23 KB |
| `tajawal-300…700-arabic.woff2`, `tajawal-300…700-latin.woff2` | Tajawal 300, 400, 500, 700 | Arabic body text | 8–10 KB each |
| `*-latin-ext.woff2` | Bodoni Moda and Jost | Letters beyond Swedish and English (ł, ş, č…). Downloaded only by a page that contains one | 9–25 KB each |

`-latin` files cover Swedish, English and ordinary punctuation; `-arabic` files
cover Arabic script. The browser picks the file by the characters on the page.

## Where they came from

Downloaded on 22 September 2026 from Google Fonts' own file server
(fonts.gstatic.com): the same files the site used to load from Google, already
split by alphabet. The logo file was made by Google Fonts' "text" option, which
keeps only the listed letters. These are the requests that produced them:

```
https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,500..600;1,72,500&display=swap
https://fonts.googleapis.com/css2?family=Jost:wght@300..600&display=swap
https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&text=ELGANTMDI%20&display=swap
https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;600;700&display=swap
https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap
```

Opening one of those addresses in a browser shows the file links and the
`unicode-range` lines that `styles.css` copies.

## Licence

All five families are published under the **SIL Open Font License 1.1**, which
allows them to be used and hosted on any website, commercial ones included, as
long as the licence travels with the files. The `OFL-*.txt` files here are the
licences, taken from github.com/google/fonts.

## Changing something

- **If the logo's wording ever changes:** the logo file only has the letters
  E, L, G, A, N, T, M, D and I. Download a new one with the new letters in the
  `text=` part of the Cormorant address above, and update its `unicode-range`
  in `styles.css`.
- **To refresh a font:** open its address above, download the files the
  `/* latin */`, `/* latin-ext */` or `/* arabic */` blocks point to, save them
  under the same names, and check that the `unicode-range` lines in
  `styles.css` still match.
- **The first fonts a page needs are preloaded** from its `<head>`. That list
  lives in `tools/build.py` (`LTR_FONTS`, `RTL_FONTS`), not in the pages
  themselves.
