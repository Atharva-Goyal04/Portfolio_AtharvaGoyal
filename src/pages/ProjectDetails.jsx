import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Photo from '../components/Photo'
import usePageMeta from '../lib/seo'
import { allProjects, projectByKey, neighbors, monthYear, INSTAGRAM_URL } from '../lib/projects'
import { categoryLabel } from '../lib/work'

export default function ProjectDetails({ darkMode }) {
  const { category, name } = useParams()
  usePageMeta({
    title: titleFor(category, name),
    description: `Work by Atharva Goyal — ${categoryLabel(category)} collection.`,
    image: `/images/${category}/${name}.jpg`,
  })

  const project = projectByKey(allProjects(), category ?? '', name ?? '')
  if (!project) {
    return (
      <main className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-dark-bg text-dark-text' : 'bg-light-bg text-light-text'}`}>
        <div className="text-center">
          <p className="font-display text-4xl mb-6">Project not found</p>
          <Link to="/#projects" className="px-6 py-3 rounded-full font-mono text-xs tracking-wider uppercase" style={{ background: '#AA8B56', color: '#1B1F1C' }}>
            Back to Work
          </Link>
        </div>
      </main>
    )
  }

  const { prev, next } = neighbors(allProjects(), project.folder, project.name)
  const camera = project.camera || ''
  const location = project.location || ''
  const date = monthYear(project.date)

  return (
    <main className="pt-28 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-8"
          >
            <Link
              to="/#projects"
              className="flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-accentLight hover:text-accent transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Work
            </Link>
          </motion.div>

          <motion.div
            key={project.name}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Photo src={project.image} alt={project.title} eager fit="contain" sizes="80vw" className="rounded-xl shadow-2xl" imgClassName="max-h-[80vh]" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
          >
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-xs tracking-[0.3em] uppercase text-accentLight">
                  {project.category}
                </span>
                {date && (
                  <span className={`font-mono text-xs tracking-wider ${darkMode ? 'text-dark-muted' : 'text-light-muted'}`}>
                    {date}
                  </span>
                )}
              </div>
              <p className={`mt-4 font-mono text-xs tracking-wider ${darkMode ? 'text-dark-muted' : 'text-light-muted'}`}>
                {location && <span>{location}</span>}
                {location && camera && <span className="mx-2">·</span>}
                {camera && <span>{camera}</span>}
              </p>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 w-fit px-4 py-2.5 rounded-full font-mono text-xs tracking-widest uppercase text-accent hover:bg-black/5 border transition-colors"
              >
                Instagram
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H8M17 7v9" />
                </svg>
              </a>
            </div>
          </motion.div>

          <div className="mt-14 flex items-center justify-between gap-4">
            {prev ? (
              <Link
                to={prev.path}
                className="group flex items-center gap-3 font-mono text-xs tracking-widest uppercase text-accentLight hover:text-accent transition-colors"
              >
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Prev
              </Link>
            ) : <span />}
            {next ? (
              <Link
                to={next.path}
                className="group flex items-center gap-3 font-mono text-xs tracking-widest uppercase text-accentLight hover:text-accent transition-colors"
              >
                Next
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : <span />}
          </div>
        </div>
      </main>
  )
}

function titleFor(category, name) {
  if (!category || !name) return 'THE.LUMENCODE'
  const pretty = name.replace(/[-_]/g, ' ').replace(/\.edit$/i, '').trim().replace(/\b\w/g, l => l.toUpperCase())
  return `${pretty} — ${categoryLabel(category)} | THE.LUMENCODE`
}