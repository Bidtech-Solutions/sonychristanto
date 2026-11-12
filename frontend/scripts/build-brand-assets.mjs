// Generates brand files from app/assets/brand/logo-source.jpeg (single source,
// "Sahabat Sony" badge) and placeholder images for photos that still have to
// come from the design.
//
//   npm run brand:build            logos + favicon + missing placeholders
//   npm run brand:build -- --force also overwrite existing placeholders
//
// Placeholders are ONLY written when the target file does not exist, so real
// photos dropped into public/images/** are never overwritten (without --force).
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..', 'public')
const SOURCE = join(here, '..', 'app', 'assets', 'brand', 'logo-source.jpeg')
const force = process.argv.includes('--force')
const out = (p) => join(root, p)
async function write(p, data) {
  await mkdir(dirname(out(p)), { recursive: true })
  await writeFile(out(p), data)
  console.log('wrote', p)
}

// ------------------------------------------------------------------ logos
// The source is a JPEG on white. The badge also contains white (outlines, the
// band inside the shield) that touches the page white, so a plain flood fill
// would eat it. Instead: morphological closing of the non-white mask (dilate
// R px, flood the outside, erode R px) — everything inside the closed
// silhouette keeps its original colour, only the outer page becomes transparent.
const { data: px, info } = await sharp(SOURCE).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const W = info.width
const H = info.height
{
  const R = 28
  const N = W * H
  const white = (p) => px[p * 4] > 228 && px[p * 4 + 1] > 228 && px[p * 4 + 2] > 228
  // Chamfer (3-4) distance to the nearest pixel where seed(p) is true; result / 3 ≈ px.
  const distance = (seed) => {
    const d = new Float32Array(N)
    for (let p = 0; p < N; p++) d[p] = seed(p) ? 0 : 1e9
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const p = y * W + x
      if (x > 0) d[p] = Math.min(d[p], d[p - 1] + 3)
      if (y > 0) {
        d[p] = Math.min(d[p], d[p - W] + 3)
        if (x > 0) d[p] = Math.min(d[p], d[p - W - 1] + 4)
        if (x < W - 1) d[p] = Math.min(d[p], d[p - W + 1] + 4)
      }
    }
    for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) {
      const p = y * W + x
      if (x < W - 1) d[p] = Math.min(d[p], d[p + 1] + 3)
      if (y < H - 1) {
        d[p] = Math.min(d[p], d[p + W] + 3)
        if (x < W - 1) d[p] = Math.min(d[p], d[p + W + 1] + 4)
        if (x > 0) d[p] = Math.min(d[p], d[p + W - 1] + 4)
      }
    }
    return d
  }
  const toInk = distance((p) => !white(p))
  // Flood the dilated outside from the image border.
  const outside = new Uint8Array(N)
  const stack = []
  for (let x = 0; x < W; x++) stack.push(x, (H - 1) * W + x)
  for (let y = 0; y < H; y++) stack.push(y * W, y * W + W - 1)
  while (stack.length) {
    const p = stack.pop()
    if (outside[p] || toInk[p] <= R * 3) continue
    outside[p] = 1
    const x = p % W
    if (x > 0) stack.push(p - 1)
    if (x < W - 1) stack.push(p + 1)
    if (p >= W) stack.push(p - W)
    if (p < N - W) stack.push(p + W)
  }
  // Erode back by R; the last ~1.5 px fade out for an anti-aliased edge.
  const toOut = distance((p) => outside[p] === 1)
  for (let p = 0; p < N; p++) {
    const t = (toOut[p] / 3 - R) / 1.5
    px[p * 4 + 3] = Math.round(Math.max(0, Math.min(1, t)) * 255)
  }
}
const raw = { raw: { width: W, height: H, channels: 4 } }
const trimmed = await sharp(px, raw).trim({ threshold: 1 }).png().toBuffer({ resolveWithObject: true })
const side = Math.round(Math.max(trimmed.info.width, trimmed.info.height) * 1.03)
const clear = { r: 0, g: 0, b: 0, alpha: 0 }
const badge = await sharp(trimmed.data)
  .extend({
    top: Math.floor((side - trimmed.info.height) / 2), bottom: Math.ceil((side - trimmed.info.height) / 2),
    left: Math.floor((side - trimmed.info.width) / 2), right: Math.ceil((side - trimmed.info.width) / 2),
    background: clear,
  })
  .png().toBuffer()

const badgeAt = (n) => sharp(badge).resize(n, n)
const webp = (img) => img.webp({ quality: 85, alphaQuality: 95, effort: 6 }).toBuffer()

for (const n of [128, 256, 512]) await write(`images/logo/logo-sony-christanto-${n}.webp`, await webp(badgeAt(n)))

// Square social/print version on white (badge at 72% so a circular avatar crop keeps it whole).
const social = async (mono) => {
  const inner = Math.round(1080 * 0.72)
  let img = sharp({ create: { width: 1080, height: 1080, channels: 3, background: '#FFFFFF' } })
    .composite([{ input: await badgeAt(inner).png().toBuffer(), gravity: 'centre' }])
  if (mono) img = sharp(await img.png().toBuffer()).grayscale()
  return webp(img)
}
await write('images/logo/logo-bulat-sony-christanto.webp', await social(false))
await write('images/logo/logo-bulat-sony-christanto-mono.webp', await social(true))

// iOS fills transparency with black, so the touch icon sits on white.
await write('apple-touch-icon.png', await sharp({ create: { width: 180, height: 180, channels: 3, background: '#FFFFFF' } })
  .composite([{ input: await badgeAt(164).png().toBuffer(), gravity: 'centre' }]).png().toBuffer())

// Favicon: the full badge is unreadable at 16–64 px, so the small sizes use
// the face cropped into a round disc; 192 px (Android/PWA) uses the badge.
const FACE = { left: 450, top: 250, width: 580, height: 580 } // in source pixels
const faceDisc = await (async () => {
  const s = FACE.width
  const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><circle cx="${s / 2}" cy="${s / 2}" r="${s / 2}"/></svg>`)
  const face = await sharp(px, raw).extract(FACE).png().toBuffer()
  return sharp({ create: { width: s, height: s, channels: 4, background: '#9B181B' } })
    .composite([{ input: face }, { input: mask, blend: 'dest-in' }])
    .png().toBuffer()
})()
const faceAt = (n) => sharp(faceDisc).resize(n, n)
await write('favicon-32x32.webp', await webp(faceAt(32)))
await write('favicon-64x64.webp', await webp(faceAt(64)))
await write('favicon-192x192.webp', await webp(badgeAt(192)))
{
  // ICO (fallback for /favicon.ico requests) holds PNGs: 6-byte header + 16 bytes per image.
  const sizes = [16, 32, 48]
  const pngs = await Promise.all(sizes.map((n) => faceAt(n).png().toBuffer()))
  const head = Buffer.alloc(6 + 16 * sizes.length)
  head.writeUInt16LE(1, 2)
  head.writeUInt16LE(sizes.length, 4)
  let offset = head.length
  sizes.forEach((n, i) => {
    const o = 6 + 16 * i
    head.writeUInt8(n, o)
    head.writeUInt8(n, o + 1)
    head.writeUInt16LE(1, o + 4)
    head.writeUInt16LE(32, o + 6)
    head.writeUInt32LE(pngs[i].length, o + 8)
    head.writeUInt32LE(offset, o + 12)
    offset += pngs[i].length
  })
  await write('favicon.ico', Buffer.concat([head, ...pngs]))
}

// ----------------------------------------------------------- placeholders
const paper = '#F4F3F0'
const label = (text, y, size = 22, fill = '#5C5A56') =>
  `<text x="50%" y="${y}" font-family="Arial, sans-serif" font-size="${size}" font-weight="700" letter-spacing="2" fill="${fill}" text-anchor="middle">${text}</text>`

/** Transparent "cutout" silhouette (standing figure) — replace with the real PNG/WebP cutout. */
function silhouette(w, h, pose) {
  const cx = w / 2
  const head = `<ellipse cx="${cx}" cy="${h * 0.11}" rx="${w * 0.12}" ry="${h * 0.075}" fill="#CFCBC4"/>`
  const neck = `<rect x="${cx - w * 0.05}" y="${h * 0.17}" width="${w * 0.1}" height="${h * 0.04}" fill="#CFCBC4"/>`
  const full = pose === 'full'
  const torsoH = full ? h * 0.36 : h * 0.79
  const torso = `<path d="M${cx - w * 0.3},${h * 0.24} Q${cx},${h * 0.19} ${cx + w * 0.3},${h * 0.24} L${cx + w * 0.34},${h * 0.21 + torsoH} L${cx - w * 0.34},${h * 0.21 + torsoH} Z" fill="#FFFFFF" stroke="#D8D5CF" stroke-width="3"/>`
  const legs = full
    ? `<rect x="${cx - w * 0.2}" y="${h * 0.57}" width="${w * 0.18}" height="${h * 0.4}" rx="${w * 0.04}" fill="#2A2927"/><rect x="${cx + w * 0.02}" y="${h * 0.57}" width="${w * 0.18}" height="${h * 0.4}" rx="${w * 0.04}" fill="#2A2927"/>`
    : ''
  const note = label('FOTO MENYUSUL', h * (full ? 0.42 : 0.55), Math.round(w * 0.045), '#B4B1AB')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${legs}${torso}${neck}${head}${note}</svg>`
}

/** Square org logo placeholder: initials in a soft circle (UI shows it inside a white disc). */
const initials = (txt) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><circle cx="128" cy="128" r="120" fill="${paper}"/><text x="128" y="150" font-family="Arial, sans-serif" font-size="78" font-weight="800" fill="#B4B1AB" text-anchor="middle">${txt}</text></svg>`

/** 4:3 building photo placeholder. */
const photo = (title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900"><rect width="1200" height="900" fill="#E8E6E1"/><g fill="#D8D5CF"><rect x="260" y="330" width="680" height="380"/><polygon points="220,340 600,170 980,340"/></g><g fill="#E8E6E1">${[0, 1, 2, 3, 4].map((i) => `<rect x="${310 + i * 124}" y="410" width="70" height="90" rx="6"/>`).join('')}<rect x="555" y="560" width="90" height="150" rx="6"/></g>${label(title, 790, 30)}${label('FOTO MENYUSUL', 835, 20, '#B4B1AB')}</svg>`

const placeholders = [
  // [path, svg, transparent?]
  ['images/sony/berdiri.webp', silhouette(480, 1080, 'full'), true],
  ['images/sony/bersedekap.webp', silhouette(810, 1080, 'half'), true],
  ['images/sony/tangan-bertaut.webp', silhouette(810, 1080, 'half'), true],
  ['images/sony/melirik.webp', silhouette(810, 1080, 'half'), true],
  ['images/sony/blog.webp', silhouette(810, 1080, 'half'), true],
  ...[
    ['bmps-kepri', 'BM'], ['pgiw-kepri', 'PG'], ['gempar-indonesia-kepri', 'GI'], ['perbakin-kota-batam', 'PB'],
    ['bamagnas-kepri', 'BG'], ['koni-kota-batam', 'KO'], ['kadin-batam', 'KD'], ['mpk-kepri', 'MP'],
    ['bkag-batam', 'BK'], ['dewan-pendidikan-kota-batam', 'DP'], ['psi', 'PS'], ['nasdem', 'ND'],
  ].map(([slug, ini]) => [`images/organisasi/${slug}.webp`, initials(ini), true]),
  ...[
    ['sd', 'SD INPRES NABARUA'], ['sma', 'SMA ST. BONAVENTURA'], ['s1', 'STIE MALANGKUCECWARA'], ['s2', 'UNIVERSITAS BATAM'], ['ppnk', 'LEMHANNAS RI'],
  ].map(([code, title]) => [`images/pendidikan/${code}.webp`, photo(title), false]),
]

for (const [p, svg, alpha] of placeholders) {
  if (existsSync(out(p)) && !force) {
    console.log('keep ', p)
    continue
  }
  const img = sharp(Buffer.from(svg))
  await write(p, await (alpha ? img : img.flatten({ background: '#E8E6E1' })).webp({ quality: 80, alphaQuality: 90 }).toBuffer())
}
