import { readdir, writeFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const BASE = join(ROOT, 'public/images')

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp']
const CATEGORIES = ['favorite', 'street', 'portrait', 'architecture', 'summer-picnic', 'film', 'all']

async function main() {
  const rows = []
  for (const folder of CATEGORIES) {
    let entries = []
    try { entries = await readdir(join(BASE, folder)) } catch { continue }
    for (const name of entries) {
      const ext = name.slice(name.lastIndexOf('.')).toLowerCase()
      if (IMAGE_EXTS.includes(ext)) {
        const base = name.slice(0, -ext.length)
        rows.push(`${folder}/${base}`)
      }
    }
  }
  rows.sort()
  const csv = 'folder/name,camera,location,date\n' + rows.map((r) => `"${r}",,,`).join('\n') + '\n'
  await writeFile(join(ROOT, 'starter.csv'), csv)
  console.log(`✓ Wrote starter.csv with ${rows.length} image keys`)
}

main().catch((err) => { console.error(err); process.exit(1) })
