import { readdir, writeFile } from 'fs/promises'
import { join, extname } from 'path'

const BASE = './public/images'
const OUT = './public/sitemap.xml'
const CATEGORIES = ['favorite', 'street', 'portrait', 'architecture', 'summer-picnic', 'film', 'all']
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp']

const SITE_URL = process.env.SITE_URL || ''

const urls = ['/']

for (const category of CATEGORIES) {
  const dir = join(BASE, category)
  let files = []
  try {
    files = await readdir(dir)
  } catch {
    continue
  }
  for (const name of files) {
    if (!IMAGE_EXTS.includes(extname(name).toLowerCase())) continue
    const base = name.replace(/\.[^/.]+$/, '')
    urls.push(`/work/${category}/${base}`)
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE_URL}${u}</loc></url>`).join('\n')}
</urlset>
`

await writeFile(OUT, xml)
console.log(`✓ sitemap.xml (${urls.length} URLs)${SITE_URL ? ` with base ${SITE_URL}` : ' — set SITE_URL env for absolute URLs'}`)