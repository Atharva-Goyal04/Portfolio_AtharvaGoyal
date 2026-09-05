import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function scroller() {
  return document.scrollingElement || document.documentElement
}

export default function BackToTop({ darkMode }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible((scroller().scrollTop || window.scrollY) > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = useCallback(() => {
    const el = scroller()

    const forceSettle = () => {
      el.scrollTop = 0
      document.body.scrollTop = 0
      window.scrollTo(0, 0)
    }

    const start = el.scrollTop
    const duration = Math.min(1800, 900 + start * 0.08)
    const t0 = performance.now()
    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
    const step = (now) => {
      const p = Math.min(1, (now - t0) / duration)
      el.scrollTop = start * (1 - ease(p))
      if (p < 1) requestAnimationFrame(step)
      else forceSettle()
    }
    requestAnimationFrame(step)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          onClick={scrollToTop}
          aria-label="Back to top"
          className={`fixed bottom-24 right-6 z-40 p-3 rounded-full border transition-colors shadow-lg ${
            darkMode
              ? 'bg-dark-surface/90 border-white/10 text-[#F0EBCE] hover:bg-dark-card'
              : 'bg-light-surface/90 border-black/10 text-[#395144] hover:bg-light-card'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 15l7-7 7 7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  )
}