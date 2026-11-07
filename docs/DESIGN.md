# DESIGN.md — sonychristanto.com

**Direction:** *Editorial Signal — Light*
A light-mode editorial look based on a dark "branding agency" reference. It keeps the reference's color logic (ink black, signal red, neutral grey), its huge uppercase type, rounded inset panels, corner labels, slash separators, the red band, and the ↗ arrows. All of it is moved onto warm paper and stone grey.

Site: personal branding for **Sony Christanto, SE., M.Si** — Anggota DPRD Kota Batam. Bilingual: **Bahasa Indonesia** (`/id`, primary) and **English** (`/en`). Spelling: "Christanto" (no "i").

Design source: Claude Design canvas "Eksplorasi Hero — Sony Christanto" (boards Landing, Biografi, Organisasi, Blog, Artikel, Kontak, Logo, Sampul mobile). Implementation map: §12.

---

## 1. Principles

1. **Paper, ink, signal.** Most of the page is warm paper and black ink. Red is a signal: it marks action, emphasis, and the single most important thing on screen. It never fills large areas, except the red band and one featured card.
2. **Type is the image.** Huge uppercase display lines with staggered alignment carry the personality, so the page needs few decorative graphics.
3. **Panels, not sections.** Content sits in large rounded panels inset from the viewport edge. The page reads like a stack of printed boards.
4. **Calm, credible, contemporary.** It should feel bold, not loud. This is a public official, not a campaign poster or a nightclub.
5. **Facts only.** Every name, number, and date comes from the client's CV. Missing content uses a clearly marked placeholder, or the section is hidden.

---

## 2. Color

| Token | Hex | Use |
|---|---|---|
| `paper` | `#F4F3F0` | Page background (warm off-white) |
| `white` | `#FFFFFF` | Inputs, inner cards on stone panels |
| `stone` | `#E8E6E1` | Panels and cards |
| `stone-deep` | `#D8D5CF` | Hairlines, borders, hover on stone, giant footer wordmark |
| `ink` | `#0B0B0B` | Primary text, headings, the one dark panel |
| `ink-soft` | `#5C5A56` | Secondary text, captions, metadata |
| `ink-ghost` | `#B4B1AB` | **Decorative display text only** (≥ 48 px). Never for readable small text. |
| `signal` | `#E10600` | Red fills: band, featured card, primary button, ↗ arrows, active states |
| `signal-ink` | `#C00000` | Red **small text** and links on paper (passes 4.5:1) |
| `signal-tint` | `#FCE9E7` | Subtle red background for badges and hover rows |

**Contrast rules**
- `ink` on `paper`/`stone`: AAA. `ink-soft` on `paper`: ≥ 6:1.
- `white` on `signal`: ~5:1, OK for all text.
- `ink` on `signal`: large text only (≥ 24 px / ≥ 19 px bold).
- `signal` text on `paper`: large text only. Use `signal-ink` below 24 px.

**Ratio guide:** paper/stone ~80%, ink ~15%, signal ≤ 5%.

---

## 3. Typography

| Role | Font | Settings |
|---|---|---|
| Display | **Archivo** (variable, width axis 112–118 "semi-expanded") | 600–700, UPPERCASE, line-height 0.86–0.92, letter-spacing −0.02…−0.035em |
| Body | **Inter** | 400/500, sentence case, line-height 1.6 |
| Label | **Inter** | 500–600, UPPERCASE, 12–13 px, letter-spacing 0.08–0.1em |
| Article prose | **Newsreader** (serif) | Blog list excerpts and article body only (Blog/Artikel boards) |

Fonts are self-hosted (`@fontsource-variable/*`), no Google CDN.

**Scale (desktop → mobile)**

| Token | Desktop | Mobile | Use |
|---|---|---|---|
| `display-xl` | clamp(48px, 7.3vw, 106px) | 26vw / 11.4vw (two lines) | Hero masthead |
| `display-l` | 88–124px | 44px–15vw | Page titles, statement / CTA lines |
| `h2` | 56px | 34px | Section titles |
| `h3` | 28px | 22px | Card titles, organization rows |
| `stat` | 72px | 48px | Quick-fact numbers |
| `body-l` | 20px | 18px | Lead paragraphs |
| `body` | 16px | 16px | Text |
| `label` | 13px | 12px | Corner labels, metadata, nav |

Rules: uppercase only for display, headings, and labels (set with CSS `text-transform`). Body text is always sentence case. One `<h1>` per page.

---

## 4. Layout, shape, spacing

- **Grid:** max content width 1408px inside a 1440px wrapper, gutter 24px.
- **Panel inset:** panels sit 16px from the viewport edge (10px on mobile), stacked with a 16px gap.
- **Radius:** panel `28px` (mobile 24px), card `20–22px`, image inside card `14px`, button/pill `999px`.
- **Spacing scale (px):** 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. Section padding inside panels: 64–96 desktop, 32–48 mobile.
- **Shadows:** none on panels. Cards on stone: `0 1px 0 rgba(0,0,0,.04)`. Depth comes from color steps (paper → stone → white).
- **Hairlines:** 1px `stone-deep`.

---

## 5. Signature motifs

### 5.1 Kisi Cahaya (light grid)
A grid of 3×2 / 3×3 rounded window cells in `signal`, blurred 14–24px, 22–45% opacity, rotated −6°. Sits behind portraits and in panel corners. Meaning: *keterbukaan* (openness), a window toward the public. Component: `<LightGrid>`. The photo itself is never edited.

### 5.2 Corner labels (HUD)
Tiny uppercase labels in panel corners / breadcrumb.

### 5.3 Slash rhythm
Inline lists use spaced slashes: `IG / FB / WA`, `PERSPEKTIF SONY / AGENDA SONY`, nav.

### 5.4 Signal arrow
Every "more", outbound, or navigational link ends with a red `↗` (or `→` for in-page). It moves 2px up-right on hover (`.arrow-nudge`).

### 5.5 Staggered statement
Display lines broken and alternately indented. On scroll, words fill from `ink-ghost` to `ink` (`<InkStatement>`). Reduced motion: all words in `ink`.

### 5.6 Red band
Full-width `signal` pill band with a marquee of current organizations (logo disc + name, tanpa tanda pemisah). Pauses on hover/focus, has a visible pause control, static under reduced motion, plain list for screen readers (`<RedBand>`).

### 5.7 Giant cropped wordmark
Footer ends with "CHRISTANTO" in display type at ~12.5vw, `stone-deep`, cropped by the bottom edge; letters rise as the page end is reached.

---

## 6. Components

**Top bar**: logo lockup left; slash nav center (`BERANDA / BIOGRAFI / ORGANISASI / BLOG / KONTAK`); right: ID/EN switch + `HUBUNGI ↗`. On the landing it floats inside the hero panel; on inner pages it is a stone pill (72px). After scrolling, a slim paper bar with a hairline slides in. Mobile: logo + `MENU` pill opening a full-screen paper sheet with huge uppercase links.

**Buttons**
- Primary: `signal` fill, white text, pill, 48–56px, trailing ↗. Hover: `ink` fill.
- Ink: `ink` fill, paper text, red ↗. Hover: `signal`.
- Secondary: 1.5px `ink` outline pill. Hover: `ink` fill, paper text.
- Giant pill CTA: outlined pill with display text "HUBUNGI ↗"; hover fills `signal` from the bottom.

**Cards**: stone/white card 20px radius; featured split card (image + `signal` block, black display title) — max one per screen.

**Index row**: full-width row with hairline divider. Name `h3` uppercase, role `ink-soft`, period label right, ↗. Hover: `signal-tint` bg, name `signal-ink`, org logo slides in on a small light-grid thumbnail.

**Tabs**: slash-separated labels; active is `ink` with a 2px `signal` underline that glides between tabs. Pill tabs (organisation filter): active pill glides.

**Stat**: number in display type (counts up on view), label with small red square bullet, separated by vertical hairlines.

**Badge**: `signal-tint` bg, `signal-ink` text, label style, pill.

**Empty state ("Segera hadir")**: stone card, dashed `stone-deep` border, small light-grid mark, label, one line of text.

---

## 7. Landing page composition

1. **Hero — "Sampul Majalah"** (§7a), red band inside the hero.
2. **Statement + Sekilas fakta**: "YANG / MUDA / BERKARYA." ink-fill statement, short bio (draft from CV), 4 stats from the CV.
3. **Mengenal Sony Christanto** (stone panel): horizontal scroll-snap row of 5 cards (`01 PROFIL` … `05 KIPRAH KEPARTAIAN`), #02 featured red, round arrow buttons. No autoplay.
4. **Jejak Pendidikan**: photo stack (hanya foto + kode jenjang, mis. "SD"; tanpa badge dan keterangan) + illustrative route map Nabire → Madiun → Malang → Batam → Jakarta + 1980–2026 rail. Arrow keys / buttons step through stages.
5. **Kabar & gagasan terbaru**: slash tabs Perspektif / Agenda; featured red split card + 2 compact rows; `LIHAT SEMUA ARTIKEL ↗`. Empty state when no articles.
6. **Kiprah organisasi**: index rows for current organizations (max 4) + `LIHAT SEMUA ORGANISASI ↗`.
7. **CTA panel** (the one `ink` panel): `SAMPAIKAN / ASPIRASI / ANDA` (ANDA in signal), giant pill `HUBUNGI ↗`, WhatsApp + Email, office address, light grid in a corner.
8. **Footer**: lockup + tagline, slash nav, `IG / FB / WA`, address, `© 2026`, giant wordmark.

*Fokus perjuangan* stays hidden until the client provides material.

## 7a. Hero: Sampul Majalah

**Photo**: studio cutouts with background removed (transparent). Default `berdiri` (full body, facing camera). Never boxed. Soft blurred ellipse shadow under the feet.

**Desktop (stone panel, 868px)**: top bar; masthead `<h1>` "SONY CHRISTANTO" one line centered; cutout ~720px tall **in front of** the masthead (head covers at most the middle letters); cover lines left (`JABATAN`, `KIPRAH`, `PENDIDIKAN`) and right (`PESAN`, latest `PERSPEKTIF SONY` article — hidden if none, `KENALI LEBIH DEKAT ↗`) with 1px ink leader lines ending in an 8px dot; red band at the bottom, feet resting on it.

**Mobile (820px)**: logo + `MENU`; masthead two lines `SONY` (26vw) / `CHRISTANTO` (11.4vw); cutout ~600px; two paper chips (`JABATAN` left, `KIPRAH` right); band 52px. Name, title and "Anggota DPRD Kota Batam" visible without scrolling.

Cover lines show only CV facts, the latest real article, or placeholders. Leader lines and shadow are `aria-hidden`. Date of birth is not on the hero; it appears on Biografi (facts list + FAQ). Religion is never shown (PRD K-2).

---

## 8. Imagery

- Real photography only: official portrait/cutouts plus activity photos. No stock people.
- Natural color, slightly warm, gentle contrast. Light grid only on hero portraits and small accents.
- Activity photos in cards: 16:10, 16:9 or 4:3, 14–24px radius.
- Every image has meaningful `alt` text (both languages).
- Files live in `frontend/public/images/**` with **fixed names** (§12.3). Until the client's files arrive, generated placeholders sit at those paths.

---

## 9. Motion

Libraries: **Lenis** (smooth scroll), **GSAP + ScrollTrigger** (scroll-linked and timeline motion), **motion-v** (Motion for Vue — the Vue port of Framer Motion; springs, presence, layout animations).

- Easing `cubic-bezier(.2,.7,.2,1)` (`--ease-signal`), durations 200–400ms (UI), 600–1300ms (reveals/intro).
- **Allowed**:
  - Hero intro: masthead letters rise from a mask, figure rises 24px, leader lines draw from the outside in, dots pop, band slides up, light grid fades in.
  - Subtle pointer depth on the hero **figure and light grid only** (never text); figure sinks slightly on scroll.
  - Masked word reveals for page titles; fade/slide reveals for sections (once).
  - Scroll ink-fill on statements; career line draws on scroll; Gantt bars grow; route line on the education map draws with a spring.
  - Red band marquee whose speed follows scroll velocity (Lenis), pausable.
  - Magnetic pull on primary buttons (mouse only), arrow nudge, card lift 2–6px, image zoom 1.04–1.05 on hover.
  - Tab underline/pill glide, accordion height, photo/card swaps, mobile menu sheet wipe, page transition (fade + 18–26px lift), red loading bar.
  - Photo parallax (images only, ±5%).
- **Not allowed**: autoplay carousels, parallax or pointer movement on text, anything that flashes, scroll-jacking.
- `prefers-reduced-motion`: no smooth scroll, no marquee, no ink-fill, no reveals, instant page change — content is never hidden.

---

## 10. Accessibility

- Text contrast ≥ 4.5:1 (§2). `ink-ghost` is decorative only.
- Touch targets ≥ 44px. Focus ring: 2px `signal`, 2px offset.
- Uppercase via CSS `text-transform`.
- Split/animated headings keep the full text in `aria-label`; marquee content is also a static list; pause control.
- Skip link, landmarks, `lang` per locale (`id-ID` / `en-US`); articles carry `lang="id"`.

## 10a. Logo (approved 7 Nov 2026)

- **Icon:** stencil portrait of Sony Christanto in three tones (paper `#F4F3F0`, stone `#CFCBC4`, ink `#0B0B0B`) inside a perfect `signal` circle. No ring/ornament/text inside.
- **Wordmark:** "SONY CHRISTANTO" Archivo 700 semi-expanded, two lines; optional tagline "YANG MUDA BERKARYA" Inter 600, 0.22em, `signal-ink`.
- **Lockups:** navbar = icon 52px + wordmark 15px; footer = icon 88px + wordmark 34px + tagline.
- **Variants:** red (primary), mono, on-red.
- **Favicon:** logo bulat yang sama dengan Logo.dc.html (versi 64/32/16 px): `favicon.svg`, `favicon.ico` (16/32/48), `favicon-32x32.png`, `favicon-64x64.png`, `apple-touch-icon.png`; semuanya dibuat `npm run brand:build`.
- A designer should hand-refine the traced paths before final production.

## 11. Do / Don't

**Do**: generous whitespace; one red focal point per viewport; big type with small labels; rounded inset panels; real CV facts.

**Don't**: dark mode as default; red behind long text; gradients and glassmorphism; stock imagery; invented quotes/numbers; org logos without permission; more than two UI typefaces (Newsreader is reserved for article reading).

---

## 12. Implementation map (frontend)

### 12.1 Tokens → code
Tailwind v4 `@theme` in `frontend/app/assets/css/main.css` (`bg-paper`, `bg-stone`, `text-ink-soft`, `bg-signal`, `text-signal-ink`, …). Utilities: `font-display-x` (Archivo 118% uppercase), `font-display-m` (112%), `label`, `label-sm`, `eyebrow`, `h2-display`, `panel`, `sec`, `page-root`, `btn-signal|ink|line|line-paper`, `arrow-nudge`. Legacy `navy/gold/cream` names are remapped to the new palette for the dashboard.

### 12.2 Components
| Motif | Component |
|---|---|
| Logo | `brand/BrandMark`, `brand/BrandLockup` (files from `app/assets/brand/logo-paths.ts` via `npm run brand:build`) |
| Top bar / footer | `site/SiteHeader` (`variant="hero" | "pill"`), `site/SiteFooter` |
| Light grid | `site/LightGrid` |
| Red band | `motion/RedBand` |
| Reveals | `[data-reveal="up|fade|scale|left|right"]`, `[data-reveal-delay]`, `motion/RevealText` (masked words), `motion/InkStatement`, `motion/CountUp`, `[data-parallax]` (images) |
| Interaction | `motion/MagneticWrap`, `site/LanguageSwitcher`, `site/FaqList`, `site/OrgTimeline`, `home/EduJourney` |
| Pages | `home/HomeHero`, `home/HomeNews`, `home/HomeCta`, `blog/BlogMasthead`, `blog/BlogListing`, `blog/ArticleCard`, `blog/ReadingProgress`, `site/PageHero` |

Reveal contract: SSR HTML is fully visible. An inline head script adds `html.js` (only if motion is allowed) so `[data-reveal]` can start hidden; `plugins/motion.client.ts` animates them in; a CSS fallback shows everything after 2.5s if JS fails.

### 12.3 Image files (fixed names)
Design assets imported 7 Nov 2026 (cutouts, org logos, education photos), converted to WebP (fit ≤1920×1080, q80; cutouts keep transparency). To update, replace the file with the same name.

| Path | Design source |
|---|---|
| `public/images/sony/berdiri.webp` | Hero cutout, full body facing camera (`full-front`) |
| `public/images/sony/berdiri-saku.webp` | Alternate full body, hands in pockets (`full-pocket`) — not used yet |
| `public/images/sony/bersedekap.webp` | Biografi hero, arms crossed (`crossed-front`) |
| `public/images/sony/tangan-bertaut.webp` | Kontak hero, hands clasped (`clasp`) |
| `public/images/sony/melirik.webp` | Landing featured card fallback, glancing sideways (`crossed-look`) |
| `public/images/sony/blog.webp` | Blog masthead / card fallback, checking his watch (`watch`) |
| `public/images/organisasi/<slug>.webp` | Org logos: `bmps-kepri`, `pgiw-kepri`, `gempar-indonesia-kepri`, `perbakin-kota-batam`, `bamagnas-kepri`, `koni-kota-batam`, `kadin-batam`, `mpk-kepri`, `bkag-batam`, `dewan-pendidikan-kota-batam`, `psi`, `nasdem` (square, transparent) |
| `public/images/pendidikan/{sd,sma,s1,s2,ppnk}.webp` | Education building photos (4:3) — **photo credits still required** |
| `public/images/sosial/{instagram,linkedin,facebook,tiktok}.webp` | Official social icons, 128px, rounded (Kontak rows, footer) |
| `public/images/logo/logo-bulat-sony-christanto(-mono).svg` | Round badge logo with name + tagline (social media, print) |

New photos: `npm run images:optimize -- <folder> public/images/<dir>`. `npm run brand:build` regenerates logos/favicon and only writes placeholders for files that are **missing**.
