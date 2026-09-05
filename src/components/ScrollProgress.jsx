import { motion, useScroll, useSpring } from 'framer-motion'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 z-[90] h-0.5 origin-left"
      aria-hidden="true"
    >
      <div className="w-full h-full" style={{ background: '#AA8B56' }} />
    </motion.div>
  )
}