import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Photo from './Photo'
import { categoryLabel, toSlug } from '../lib/work'
import { monthYear, INSTAGRAM_URL } from '../lib/projects'

export default function Lightbox({ open, items, index, onClose, onNavigateIndex }) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNavigateIndex((index + 1) % items.length)
      if (e.key === 'ArrowLeft') onNavigateIndex((index - 1 + items.length) % items.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, items.length, index, onClose, onNavigateIndex])

  if (!open || index < 0 || items.length === 0) return null

  const current = items[index]
  const slug = toSlug(current.image)
  const label = slug ? categoryLabel(slug.category) : current.category
  const camera = current.camera || ''
  const location = current.location || ''
  const date = monthYear(current.date)

  const goTo = (dir) => {
    onNavigateIndex((index + dir + items.length) % items.length)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={current.title}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-6 right-6 z-10 p-3 rounded-full text-[#F0EBCE]/70 hover:text-[#F0EBCE] hover:bg-white/10 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <span className="absolute top-6 left-6 z-10 font-mono text-xs tracking-widest text-[#F0EBCE]/60">
        {index + 1} / {items.length}
      </span>

      <button
        onClick={(e) => { e.stopPropagation(); goTo(-1) }}
        aria-label="Previous"
        className="hidden md:flex absolute left-4 z-10 p-3 rounded-full text-[#F0EBCE]/70 hover:text-[#F0EBCE] hover:bg-white/10 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="absolute inset-0 flex items-center justify-center px-4 md:px-20">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (Math.abs(info.offset.x) > 80) goTo(info.offset.x < 0 ? 1 : -1)
          }}
          onClick={(e) => e.stopPropagation()}
          className="max-h-full"
        >
          <Photo
            src={current.image}
            alt={current.title}
            eager
            fit="contain"
            sizes="90vw"
            className="rounded-lg shadow-2xl"
            imgClassName="max-h-[78vh]"
          />
        </motion.div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); goTo(1) }}
        aria-label="Next"
        className="hidden md:flex absolute right-4 z-10 p-3 rounded-full text-[#F0EBCE]/70 hover:text-[#F0EBCE] hover:bg-white/10 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="absolute bottom-0 inset-x-0 p-8 flex items-end justify-between gap-6 bg-gradient-to-t from-black/70 to-transparent">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="font-mono text-[10px] tracking-widest uppercase text-[#AA8B56]">{label}</span>
            {date && (
              <span className="font-mono text-[10px] tracking-wider uppercase text-[#F0EBCE]/50">
                {date}
              </span>
            )}
          </div>
          {(camera || location) && (
            <p className="text-[#F0EBCE] text-sm leading-snug">
              {location && <span>{location}</span>}
              {location && camera && <span className="mx-2 text-[#F0EBCE]/40">·</span>}
              {camera && <span className="text-[#F0EBCE]/80">{camera}</span>}
            </p>
          )}
        </div>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          aria-label="Open on Instagram"
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/40 hover:bg-black/60 text-[#F0EBCE] hover:text-white font-mono text-xs tracking-widest uppercase transition-colors"
        >
          Instagram
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H8M17 7v9" />
          </svg>
        </a>
      </div>
    </motion.div>
  )
}