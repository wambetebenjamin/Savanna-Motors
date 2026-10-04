# Design system extraction — `carserv-1.0.0.zip`

Everything below was read out of the uploaded design source **before** any code was written.
Nothing here is guessed or substituted. Every value is applied as a CSS custom property at
`:root` in `src/app/globals.css`.

Source files inspected:

| File | What was extracted |
| --- | --- |
| `css/style.css` | `:root` palette, nav/footer type sizes, transitions, overlays, square button sizes, border colours |
| `scss/bootstrap.scss` | Sass theme overrides: palette, font families, body colour, heading colour/weight, border radius |
| `css/bootstrap.min.css` (compiled) | Resolved button hover tints/shades, shadow values, heading scale, body type |
| `index.html`, `about.html`, `service.html`, `booking.html`, `team.html`, `testimonial.html`, `contact.html`, `404.html` | Google Fonts request (families + weights), spacing rhythm, section structure, icon usage |
| `js/main.js` | Sticky-nav offset, counter-up timing, carousel timing/behaviour |

---

## 1. Colour

| Token | Value | Source |
| --- | --- | --- |
| `--sm-primary` | `#D81324` | `style.css :root --primary`, `bootstrap.scss $primary` |
| `--sm-primary-hover` | `#b8101f` | compiled `.btn-primary:hover` background |
| `--sm-primary-active` | `#ad0f1d` | compiled `.btn-primary:hover` border |
| `--sm-secondary` | `#0B2154` | `style.css :root --secondary`, `$secondary` |
| `--sm-secondary-hover` | `#091c47` | compiled `.btn-secondary:hover` background |
| `--sm-secondary-active` | `#091a43` | compiled `.btn-secondary:hover` border |
| `--sm-light` | `#F2F2F2` | `style.css :root --light` |
| `--sm-dark` | `#111111` | `style.css :root --dark` |
| `--sm-white` | `#FFFFFF` | used throughout `style.css` |
| `--sm-body` | `#596277` | `bootstrap.scss $body-color` |
| `--sm-heading` | `#0B2154` | `$headings-color: $secondary` |
| `--sm-border` | `#EEEEEE` | `.navbar-light .navbar-nav` border-top |
| `--sm-border-strong` | `#CCCCCC` | `.testimonial-carousel .owl-dot` border |
| `--sm-overlay-70` | `rgba(0, 0, 0, .7)` | `.carousel-caption`, `.page-header-inner`, `.fact`, `.booking` |
| `--sm-overlay-90` | `rgba(0, 0, 0, .9)` | `.footer` gradient |
| `--sm-rule-light` | `rgba(255, 255, 255, .1)` | `.footer .copyright` border-top |
| `--sm-rule-mid` | `rgba(255, 255, 255, .3)` | `.footer .footer-menu a` border-right |

No colour outside this list is introduced anywhere in the build.

## 2. Typography

Google Fonts request found in every template page:

```
https://fonts.googleapis.com/css2?family=Barlow:wght@600;700&family=Ubuntu:wght@400;500&display=swap
```

| Token | Value | Source |
| --- | --- | --- |
| `--sm-font-heading` | `'Barlow', sans-serif` | `$headings-font-family` |
| `--sm-font-body` | `'Ubuntu', sans-serif` | `$font-family-base` |
| `--sm-fw-regular` | `400` | Ubuntu weight requested |
| `--sm-fw-medium` | `500` | Ubuntu weight requested, `.btn { font-weight: 500 }` |
| `--sm-fw-semibold` | `600` | Barlow weight requested, `.fw-medium { 600 }` |
| `--sm-fw-bold` | `700` | Barlow weight requested, `$headings-font-weight`, `$display-font-weight` |
| `--sm-lh-heading` | `1.2` | compiled headings |
| `--sm-lh-body` | `1.5` | compiled `body` |

Ubuntu `700` is additionally requested because the brief fixes button weight at 700; it is the
same family already in the design source, not a substituted face.

Brief-mandated sizes (layered on top of the source families):

| Token | Value |
| --- | --- |
| `--sm-fs-body` | `16px` (minimum 15px enforced by `--sm-fs-body-sm`) |
| `--sm-fs-body-sm` | `15px` — also the design source's nav/footer small size |
| `--sm-fs-nav` | `13px` |
| `--sm-fs-btn` | `12px` / weight `700` / uppercase (`text-transform: uppercase` from `.btn`) |
| `--sm-fs-meta` | `11px` |

Heading scale follows the compiled Bootstrap fluid scale from the source
(`display-1 … h6`, `line-height: 1.2`, colour `#0B2154`, weight `700`).

## 3. Spacing

Bootstrap spacer scale as compiled in the source (`$spacer: 1rem`), which is the rhythm used by
every template page (`py-5`, `p-4`, `mb-4`, `px-5`…):

| Token | Value |
| --- | --- |
| `--sm-space-1` | `0.25rem` |
| `--sm-space-2` | `0.5rem` |
| `--sm-space-3` | `1rem` |
| `--sm-space-4` | `1.5rem` |
| `--sm-space-5` | `3rem` |
| `--sm-section-y` | `3rem` (`py-5`, the section rhythm of every page) |
| `--sm-gutter` | `1.5rem` (Bootstrap `$grid-gutter-width`) |

Container max widths (compiled source): `540 / 720 / 960 / 1140 / 1320px`.

## 4. Shadows

| Token | Value | Source |
| --- | --- | --- |
| `--sm-shadow-sm` | `0 0.125rem 0.25rem rgba(0,0,0,0.075)` | compiled `.shadow-sm` |
| `--sm-shadow` | `0 0.5rem 1rem rgba(0,0,0,0.15)` | compiled `.shadow` — used by the source navbar |
| `--sm-shadow-lg` | `0 1rem 3rem rgba(0,0,0,0.175)` | compiled `.shadow-lg` — used for the card hover lift |

## 5. Borders & radii

| Token | Value | Source |
| --- | --- | --- |
| `--sm-radius` | `0` | `bootstrap.scss $border-radius: 0px` — the source is a square-cornered system |
| `--sm-radius-square-btn` | `2px` | `.btn-square, .btn-sm-square, .btn-lg-square { border-radius: 2px }` |
| `--sm-radius-circle` | `50%` | `.rounded-circle` usage (avatars, social buttons) |
| `--sm-border-width` | `1px` | compiled `$border-width` |
| `--sm-size-square-sm` | `32px` | `.btn-sm-square` |
| `--sm-size-square` | `38px` | `.btn-square` |
| `--sm-size-square-lg` | `48px` | `.btn-lg-square` |
| `--sm-social-size` | `35px` | `.footer .btn.btn-social` |
| `--sm-navbar-cta-h` | `75px` | `.navbar-light .navbar-brand, .navbar-light a.btn { height: 75px }` |

## 6. Motion

| Token | Value | Source |
| --- | --- | --- |
| `--sm-t-fast` | `0.25s` | brief: card hover 250ms |
| `--sm-t-base` | `0.3s` | `.footer .btn.btn-social { transition: .3s }` |
| `--sm-t-slow` | `0.5s` | `.btn`, `.navbar`, `.team-overlay`, `.service .nav-link { transition: .5s }` |
| `--sm-ease-hero` | `cubic-bezier(0.22, 1, 0.36, 1)` | animation direction brief |
| `--sm-sticky-offset` | `-100px` | `main.js` sticky navbar hidden offset / `.navbar-light.sticky-top { top: -100px }` |
| counter | `delay 10ms`, `time 2000ms` | `main.js` counterUp options (reused by the stats count-up) |
| carousel | `smartSpeed 1000` | `main.js` owlCarousel (testimonial crossfade timing basis) |

## 7. Iconography

The source uses Font Awesome 5 glyphs (`fa-car`, `fa-map-marker-alt`, `fa-phone-alt`,
`fa-clock`, `fa-check`, `fa-arrow-right`, `fa-tools`…). The brief fixes the icon set to
**Lucide**, so the same semantic glyphs are mapped one-for-one onto Lucide equivalents
(`Car`, `MapPin`, `PhoneCall`, `Clock`, `CheckCircle2`, `ArrowRight`, `Wrench`, `Gauge`,
`Calculator`, `Star`, `Calendar`, `Repeat`, `TrendingUp`). No decorative glyphs are used.
