export function toSlug(src = '') {
  const match = src.match(/^\/images\/([^/]+)\/([^/]+)\.[^.]+$/)
  if (!match) return null
  return { category: match[1], name: match[2] }
}

export function workPath(src) {
  const parts = toSlug(src)
  if (!parts) return '#'
  return `/work/${parts.category}/${parts.name}`
}

export function titleFromName(name) {
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\.edit$/i, '')
    .trim()
    .replace(/\b\w/g, l => l.toUpperCase())
}

export function categoryLabel(folder) {
  const labels = {
    favorite: 'Favorite',
    street: 'Street',
    portrait: 'Portrait',
    architecture: 'Architecture',
    'summer-picnic': 'Summer Picnic',
    all: 'All',
    film: 'Film',
  }
  return labels[folder] || folder.charAt(0).toUpperCase() + folder.slice(1)
}