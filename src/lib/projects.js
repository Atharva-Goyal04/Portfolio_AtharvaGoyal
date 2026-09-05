import { titleFromName, categoryLabel } from './work'
import { projectMetadata, DEFAULT_CAMERA } from '../data/projects.metadata.mjs'

const categoryImports = {
  favorite: import.meta.glob('/public/images/favorite/*.{jpg,jpeg,png,webp}', { eager: true }),
  street: import.meta.glob('/public/images/street/*.{jpg,jpeg,png,webp}', { eager: true }),
  portrait: import.meta.glob('/public/images/portrait/*.{jpg,jpeg,png,webp}', { eager: true }),
  architecture: import.meta.glob('/public/images/architecture/*.{jpg,jpeg,png,webp}', { eager: true }),
  'summer-picnic': import.meta.glob('/public/images/summer-picnic/*.{jpg,jpeg,png,webp}', { eager: true }),
  all: import.meta.glob('/public/images/all/*.{jpg,jpeg,png,webp}', { eager: true }),
  film: import.meta.glob('/public/images/film/*.{jpg,jpeg,png,webp}', { eager: true }),
}

const srcPathFromGlobKey = (globKey) => globKey.replace(/^\/public/, '')

export function allProjects() {
  const list = []
  for (const [folder, files] of Object.entries(categoryImports)) {
    const category = categoryLabel(folder)
    for (const [globKey] of Object.entries(files)) {
      const src = srcPathFromGlobKey(globKey)
      const parts = src.match(/^\/images\/([^/]+)\/([^/]+)\.[^.]+$/)
      const name = parts ? parts[2] : globKey.split('/').pop().replace(/\.[^/.]+$/, '')
      const meta = projectMetadata[`${folder}/${name}`] || {}
      list.push({
        folder,
        category,
        name,
        image: src,
        path: `/work/${folder}/${name}`,
        title: titleFromName(name),
        camera: meta.camera || DEFAULT_CAMERA,
        location: meta.location || '',
        date: meta.date || '',
      })
    }
  }
  return list
}

export function projectByKey(list, folder, name) {
  return list.find(p => p.folder === folder && p.name === name) || null
}

export function neighbors(list, folder, name) {
  const sameFolder = list.filter(p => p.folder === folder)
  const idx = sameFolder.findIndex(p => p.name === name)
  if (idx === -1) return { prev: null, next: null }
  return {
    prev: sameFolder[(idx - 1 + sameFolder.length) % sameFolder.length],
    next: sameFolder[(idx + 1) % sameFolder.length],
  }
}

export const cameraFor = (folder) => {
  if (folder === 'film') return 'Pentax Espio 738 · 35mm film'
  if (folder === 'street') return 'Nikon D5600 · 35mm'
  return 'Nikon D5600'
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function monthYear(date) {
  if (!date) return ''
  const m = String(date).match(/^(\d{4})(?:-(\d{1,2}))?/)
  if (!m) return String(date)
  const year = m[1]
  const month = m[2] ? MONTHS[Number(m[2]) - 1] : ''
  return month ? `${month} ${year}` : year
}

export const INSTAGRAM_URL = 'https://www.instagram.com/the.lumencode/'