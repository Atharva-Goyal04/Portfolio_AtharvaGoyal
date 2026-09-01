import { motion } from 'framer-motion'
import { Link } from 'react-scroll'

export default function Home({ darkMode }) {

  return (
    <section id="home" className="min-h-screen flex flex-col justify-center relative overflow-hidden">
      {/* Wallpaper backgrounds */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: darkMode
            ? 'url(/images/dark-wallpaper.jpg)'
            : 'url(/images/light-wallpaper.jpg)',
          filter: 'brightness(0.85) saturate(0.92)',
        }}
      />

      {/* Full-screen gradient overlay (editorial) */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(15,18,17,0.25) 0%, rgba(15,18,17,0.55) 45%, rgba(15,18,17,0.8) 100%)',
        }}
      />

      {/* Subtle vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 55%, rgba(15,18,17,0.45) 100%)',
        }}
      />

      {/* Soft radial gradient behind hero text */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[5] pointer-events-none"
        style={{
          height: '65%',
          background: 'radial-gradient(ellipse 80% 80% at 50% 80%, rgba(15,18,17,0.30) 0%, rgba(15,18,17,0.12) 45%, transparent 75%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col gap-6 items-center text-center"
        >
          <div className="flex items-center gap-3">
            <div className="glow-line w-12" />
            <span
              className="font-mono text-xs tracking-[0.3em] uppercase"
              style={{ color: 'rgba(240,235,206,0.72)' }}
            >
              Photographer
            </span>
            <div className="glow-line w-12" />
          </div>

          <h1
            className="font-display text-5xl md:text-7xl lg:text-8xl font-medium leading-[0.9] tracking-tight"
            style={{ color: '#F0EBCE', textShadow: '0 2px 18px rgba(0,0,0,0.25)' }}
          >
            ATHARVA GOYAL
          </h1>

          <div className="flex items-center gap-4 pt-4">
            <Link
              to="projects"
              smooth={true}
              offset={0}
              duration={500}
              className="group flex items-center gap-2 px-6 py-3 rounded-full font-mono text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer"
              style={{ background: '#AA8B56', color: '#1B1F1C' }}
            >
              View Work
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              to="contact"
              smooth={true}
              offset={0}
              duration={500}
              className="px-6 py-3 rounded-full font-mono text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer"
              style={{ background: 'transparent', border: '1px solid rgba(240,235,206,0.45)', color: '#F0EBCE' }}
            >
              Get in Touch
            </Link>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <Link
          to="about"
          smooth={true}
          offset={0}
          duration={500}
          className="flex flex-col items-center gap-2 cursor-pointer"
        >
          <span
            className="font-mono text-[10px] tracking-widest uppercase"
            style={{ color: 'rgba(240,235,206,0.5)' }}
          >
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-px h-8 bg-gradient-to-b from-[#F0EBCE]/50 to-transparent"
          />
        </Link>
      </motion.div>
    </section>
  )
}
