import { useEffect } from 'react'

function setMeta(attr, key, content) {
  if (!content) return
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

export default function usePageMeta({ title, description, image }) {
  useEffect(() => {
    if (title) document.title = title
    const desc = description || 'Photography portfolio of Atharva Goyal — THE.LUMENCODE.'
    setMeta('name', 'description', desc)
    setMeta('property', 'og:title', title || 'THE.LUMENCODE')
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:type', 'website')
    if (image) setMeta('property', 'og:image', image)
  }, [title, description, image])
}