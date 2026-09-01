import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

const categoryImports = {
  favorite: import.meta.glob('/public/images/favorite/*.{jpg,jpeg,png,webp}', { eager: true }),
  street: import.meta.glob('/public/images/street/*.{jpg,jpeg,png,webp}', { eager: true }),
  portrait: import.meta.glob('/public/images/portrait/*.{jpg,jpeg,png,webp}', { eager: true }),
  architecture: import.meta.glob('/public/images/architecture/*.{jpg,jpeg,png,webp}', { eager: true }),
  'summer-picnic': import.meta.glob('/public/images/summer-picnic/*.{jpg,jpeg,png,webp}', { eager: true }),
  all: import.meta.glob('/public/images/all/*.{jpg,jpeg,png,webp}', { eager: true }),
  film: import.meta.glob('/public/images/film/*.{jpg,jpeg,png,webp}', { eager: true }) // Pentax Espio 738
}

const CATEGORY_LABELS = {
  favorite: 'Favorite',
  street: 'Street',
  portrait: 'Portrait',
  architecture: 'Architecture',
  'summer-picnic': 'Summer Picnic',
  all: 'All',
  film: 'Film'
}

function generateProjects() {
  const projects = []
  let id = 1

  for (const [folder, files] of Object.entries(categoryImports)) {
    const category = CATEGORY_LABELS[folder] || folder.charAt(0).toUpperCase() + folder.slice(1)

    for (const [path, module] of Object.entries(files)) {
      const filename = path.split('/').pop().replace(/\.[^/.]+$/, '')
      projects.push({
        id: id++,
        title: filename.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        category,
        image: module.default,
      })
    }
  }

  return projects.sort(() => Math.random() - 0.5)
}

const categories = ['Favorite', 'Street', 'Portrait', 'Architecture', 'Summer Picnic', 'Film', 'All']
const INITIAL_VISIBLE = 12
const MIN_BATCH = 12
const GAP_TOLERANCE = 0.4
const GAP_PX = 16
const FADE_HEIGHT = 56

export default function Projects({ darkMode }) {
  const [activeCategory, setActiveCategory] = useState('Favorite')
  const [hoveredId, setHoveredId] = useState(null)
  const [projects, setProjects] = useState([])
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE)
  const heightsRef = useRef({})
  const columns = useColumnCount()

  useEffect(() => {
    setProjects(generateProjects())
  }, [])

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE)
  }, [activeCategory])

  const filteredProjects = projects.filter(p => p.category === activeCategory)

  const visibleProjects = filteredProjects.slice(0, visibleCount)
  const hasMore = visibleCount < filteredProjects.length

  const ratioOf = (p) => heightsRef.current[p.id] ?? 0.75

  const handleLoadMore = () => {
    const total = filteredProjects.length
    if (visibleCount >= total) return

    const remaining = filteredProjects.slice(visibleCount)
    const shortest = (h) => {
      let t = 0
      for (let c = 1; c < columns; c++) if (h[c] < h[t]) t = c
      return t
    }

    const colHeights = new Array(columns).fill(0)
    visibleProjects.forEach((p) => {
      colHeights[shortest(colHeights)] += ratioOf(p) + 0.1
    })

    let added = 0
    for (const p of remaining) {
      const maxH = Math.max(...colHeights)
      const minH = Math.min(...colHeights)
      if (added >= MIN_BATCH && maxH - minH <= GAP_TOLERANCE) break
      colHeights[shortest(colHeights)] += ratioOf(p) + 0.1
      added++
      if (visibleCount + added >= total) break
    }

    setVisibleCount(prev => prev + added)
  }

  const fadeColor = darkMode ? '#395144' : '#4E6C50'

  return (
    <section
      id="projects"
      className="min-h-screen pt-32 md:pt-40 pb-20 relative"
      style={{
        background: darkMode
          ? 'linear-gradient(to bottom, #000000 0%, #0B0E0D 8%, #395144 55%)'
          : 'linear-gradient(to bottom, #F0EBCE 0%, #FDFBF3 8%, #4E6C50 55%)'
      }}
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12"
        >
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="glow-line w-12" />
              <span className="font-mono text-sm tracking-[0.3em] uppercase text-[#AA8B56]">
                Portfolio
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-6xl font-medium tracking-tight">
              Work
            </h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex-1 min-w-0 flex flex-nowrap gap-2 overflow-x-auto"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveCategory(cat);
                }}
                className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-full font-mono text-xs tracking-wider uppercase transition-all ${
                  activeCategory === cat
                    ? 'bg-[#AA8B56] text-[#395144]'
                    : darkMode
                      ? 'text-[#F0EBCE]/70 hover:text-[#F0EBCE] border border-white/10'
                      : 'text-[#395144]/70 hover:text-[#395144] border border-black/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        </motion.div>

        <div className="relative">
          <MasonryGrid
            items={visibleProjects}
            hoveredId={hoveredId}
            setHoveredId={setHoveredId}
            heightsRef={heightsRef}
          />

          {hasMore && (
            <div
              className="absolute inset-x-0 bottom-0 flex items-center justify-center"
              style={{ height: `${FADE_HEIGHT}px` }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(to bottom, transparent 0%, ${fadeColor} 100%)`,
                }}
              />
              <div className="relative z-10 flex items-center justify-center gap-6">
                <span className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent to-[#AA8B56]/60" />
                <button
                  onClick={handleLoadMore}
                  className="px-8 py-3 rounded-full font-mono text-xs tracking-wider uppercase transition-all shadow-lg"
                  style={{ background: '#AA8B56', color: '#1B1F1C' }}
                >
                  Load More
                </button>
                <span className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent to-[#AA8B56]/60" />
              </div>
            </div>
          )}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-20">
            <p className={`font-mono text-sm ${darkMode ? 'text-dark-muted' : 'text-light-muted'}`}>
              No projects in this category yet.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

function MasonryGrid({ items, hoveredId, setHoveredId, heightsRef }) {
  const columns = useColumnCount()
  const [tick, setTick] = useState(0)

  const handleLoad = (id, e) => {
    const el = e.target
    const ratio = el.naturalHeight && el.naturalWidth
      ? el.naturalHeight / el.naturalWidth
      : 0.75
    if (heightsRef.current[id] !== ratio) {
      heightsRef.current[id] = ratio
      setTick(t => t + 1)
    }
  }

  const buckets = Array.from({ length: columns }, () => [])
  const colHeights = new Array(columns).fill(0)

  items.forEach((project) => {
    let target = 0
    for (let c = 1; c < columns; c++) {
      if (colHeights[c] < colHeights[target]) target = c
    }
    buckets[target].push(project)
    const ratio = heightsRef.current[project.id] ?? 0.75
    colHeights[target] += ratio + 0.1
  })

  return (
    <div className="flex gap-4 items-start">
      {buckets.map((bucket, colIndex) => (
        <div key={colIndex} className="flex-1 flex flex-col gap-4 min-w-0">
          {bucket.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: (project.id % INITIAL_VISIBLE) * 0.03 }}
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative rounded-xl overflow-hidden cursor-pointer"
            >
              <div style={{ aspectRatio: heightsRef.current[project.id] ?? 0.75 }}>
                <img
                  src={project.image}
                  alt={project.title}
                  onLoad={(e) => handleLoad(project.id, e)}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className={`absolute inset-0 transition-all duration-500 ${
                hoveredId === project.id
                  ? 'bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100'
                  : 'opacity-0'
              }`}>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="font-mono text-[9px] tracking-widest uppercase text-white/50">
                    {project.category}
                  </span>
                  <h3 className="font-display text-xl font-medium text-white">
                    {project.title}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  )
}

function useColumnCount() {
  const [cols, setCols] = useState(getCols())

  useEffect(() => {
    const onResize = () => setCols(getCols())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return cols
}

function getCols() {
  if (typeof window === 'undefined') return 3
  if (window.innerWidth < 768) return 1
  if (window.innerWidth < 1024) return 2
  return 3
}
