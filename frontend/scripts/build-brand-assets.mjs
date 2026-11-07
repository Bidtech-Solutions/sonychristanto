// Generates brand files from app/assets/brand/logo-paths.ts (single source)
// and placeholder images for photos that still have to come from the design.
//
//   npm run brand:build            logos + favicon + missing placeholders
//   npm run brand:build -- --force also overwrite existing placeholders
//
// Placeholders are ONLY written when the target file does not exist, so real
// photos dropped into public/images/** are never overwritten (without --force).
// Requires Node >= 22.18 (native TypeScript type stripping for the .ts import).
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { logoSvg } from '../app/assets/brand/logo-paths.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
const force = process.argv.includes('--force')
const out = (p) => join(root, p)
async function write(p, data) {
  await mkdir(dirname(out(p)), { recursive: true })
  await writeFile(out(p), data)
  console.log('wrote', p)
}

// ------------------------------------------------------------------ logos
for (const v of ['red', 'mono', 'on-red']) {
  const name = v === 'red' ? 'logo-sony-christanto' : `logo-sony-christanto-${v}`
  await write(`images/logo/${name}.svg`, logoSvg(v, 512))
}
await write('images/logo/logo-sony-christanto-512.png', await sharp(Buffer.from(logoSvg('red', 512))).png().toBuffer())
await write('apple-touch-icon.png', await sharp(Buffer.from(logoSvg('red', 180))).flatten({ background: '#F4F3F0' }).png().toBuffer())

// Favicon: logo bulat yang sama dengan desain (Logo.dc.html, versi 64/32/16 px).
// SVG untuk browser modern, ICO (16/32/48) + PNG 32/64 untuk sisanya.
const faviconPng = (n) => sharp(Buffer.from(logoSvg('red', 512))).resize(n, n).png().toBuffer()
await write('favicon.svg', logoSvg('red', 64))
await write('favicon-32x32.png', await faviconPng(32))
await write('favicon-64x64.png', await faviconPng(64))
{
  // ICO berisi PNG (didukung semua browser modern): header 6 byte + 16 byte per gambar.
  const sizes = [16, 32, 48]
  const pngs = await Promise.all(sizes.map(faviconPng))
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
