import { useState, useCallback } from 'react'
import { imageCatalog } from '../data/imageManifest'

export default function Photo({
  src,
  alt = '',
  sizes = '100vw',
  ratio,
  eager = false,
  className = '',
  imgClassName = '',
  onLoad,
  fit = 'cover',
}) {
  const [loaded, setLoaded] = useState(false)
  const info = imageCatalog[src]

  // Reveal the image if it is already complete (e.g. cached) when it mounts.
  // A cached <img> can fire onLoad before React attaches the handler, which
  // otherwise leaves the image at opacity-0 forever (blank space).
  const handleRef = useCallback(
    (el) => {
      if (!el) return
      if (el.complete) {
        setLoaded(true)
        onLoad?.(el)
      }
    },
    [onLoad]
  )

  if (!info) {
    return (
      <img
        ref={eager ? handleRef : undefined}
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className={className}
      />
    )
  }

  const aspect = ratio ?? info.width / info.height
  const placeholder = `url("data:image/webp;base64,${info.placeholder}")`
  const reveal = loaded ? 'opacity-100' : 'opacity-0'

  const commonImg = {
    ref: eager ? handleRef : undefined,
    src: info.src,
    srcSet: info.jpeg.join(', '),
    sizes,
    alt,
    loading: eager ? 'eager' : 'lazy',
    decoding: 'async',
    onLoad: (e) => {
      setLoaded(true)
      onLoad?.(e)
    },
    onError: () => setLoaded(true),
  }

  if (fit === 'contain') {
    return (
      <picture className={`relative block overflow-hidden w-fit mx-auto max-w-full ${className}`}>
        <source srcSet={info.webp.join(', ')} sizes={sizes} type="image/webp" />
        <source srcSet={info.jpeg.join(', ')} sizes={sizes} type="image/jpeg" />
        <img
          {...commonImg}
          className={`h-auto max-w-full object-contain transition-opacity duration-500 ${reveal} ${imgClassName}`}
          style={{ backgroundImage: placeholder, backgroundSize: 'cover' }}
        />
      </picture>
    )
  }

  return (
    <picture
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: aspect, backgroundImage: placeholder, backgroundSize: 'cover' }}
    >
      <source srcSet={info.webp.join(', ')} sizes={sizes} type="image/webp" />
      <source srcSet={info.jpeg.join(', ')} sizes={sizes} type="image/jpeg" />
      <img
        {...commonImg}
        className={`w-full h-full transition-opacity duration-500 ${reveal} ${imgClassName}`}
        style={{ objectFit: 'cover' }}
      />
    </picture>
  )
}
