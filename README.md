# plusonec2

An interactive study page for **Chapter 2 — Data Representation**, part of the
Plus One (Class XI) Computer Applications (Commerce) course under the 2026
SCERT syllabus.

Covers number systems (decimal/binary/octal/hex), number system conversions
(including the digit-grouping shortcut for octal/hex ↔ binary), binary
addition, integer representation (sign & magnitude, 1's complement, 2's
complement), floating point representation, character encoding
(ASCII/Extended ASCII/Unicode), and multimedia file formats (image/audio/
video) — with six interactive widgets so you can test every rule on your own
numbers instead of just reading a worked example.

## Source of truth

Content, worked examples and tables are checked against the Chapter 2 slide
deck kept at [`docs/source/Chapter_2_Data_Representation.pptx`](docs/source/Chapter_2_Data_Representation.pptx).
Anywhere that deck doesn't cover a detail, the page says so explicitly rather
than presenting an outside assumption as syllabus content (see the floating
point section in particular, which sticks closely to the deck's own
simplified mantissa/exponent treatment).

## Structure

```
index.html          — the Chapter 2 page
assets/css/          — styles
assets/js/           — widget logic (utils.js holds the shared, independently
                        verified conversion/decode functions every widget
                        builds on)
docs/source/          — source slide deck
```

Plain HTML/CSS/JS, no build step, no framework, zero external dependencies —
fonts (Fraunces, Space Grotesk, IBM Plex Mono) are bundled locally under
`assets/fonts/` rather than loaded from a CDN, so the page loads reliably on
any network. Deploys as a static site (e.g. GitHub Pages) straight from the
repo root.

## Local preview

Any static file server works, e.g.:

```
python3 -m http.server 8000
```

then open `http://localhost:8000/`.
