import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navigation from './components/Navigation'
import VinylPlayer from './components/VinylPlayer'
import ScrollProgress from './components/ScrollProgress'
import BackToTop from './components/BackToTop'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import ProjectDetails from './pages/ProjectDetails'
import usePageMeta from './lib/seo'

export default function Root() {
  const [darkMode, setDarkMode] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  usePageMeta({
    title: 'THE.LUMENCODE | Atharva Goyal',
    description: 'Photography portfolio of Atharva Goyal — Tempe, Arizona. Film, street, portrait and architecture.',
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      darkMode ? 'bg-dark-bg text-dark-text' : 'bg-light-bg text-light-text'
    }`}>
      <div className="noise-overlay" />
      <Navigation darkMode={darkMode} setDarkMode={setDarkMode} scrolled={scrolled} />
      <ScrollProgress />
      <VinylPlayer darkMode={darkMode} minimized={scrolled} />
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing darkMode={darkMode} />} />
        <Route
          path="/work/:category/:name"
          element={<ProjectDetails darkMode={darkMode} />}
        />
      </Routes>
      <Footer darkMode={darkMode} />
      <BackToTop darkMode={darkMode} />
    </div>
  )
}