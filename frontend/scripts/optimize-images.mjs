// Converts static images for the website (not dashboard uploads — the backend
// handles those) to WebP, max 1920x1080, quality 80, EXIF stripped/rotated.
//   npm run images:optimize -- <input-dir> [output-dir]
// Example: npm run images:optimize -- ~/foto-mentah public/images/galeri
import { mkdir, readdir } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'
import sharp from 'sharp'

const [input, output = 'public/images/optimized'] = process.argv.slice(2)
if (!input) {
  console.error('Usage: npm run images:optimize -- <input-dir> [output-dir]')
  process.exit(1)
}
await mkdir(output, { recursive: true })
const files = (await readdir(input)).filter((f) => /\.(jpe?g|png|webp|gif|tiff?|avif|heic)$/i.test(f))
for (const f of files) {
  const out = join(output, `${basename(f, extname(f)).toLowerCase().replace(/[^a-z0-9]+/g, '-')}.webp`)
  const info = await sharp(join(input, f))
    .rotate()
    .resize({ width: 1920, height: 1080, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(out)
  console.log(`${f} -> ${out} (${info.width}x${info.height}, ${Math.round(info.size / 1024)} KB)`)
}
