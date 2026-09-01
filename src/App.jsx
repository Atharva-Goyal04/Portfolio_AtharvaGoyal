import { useState, useEffect } from 'react'
import Navigation from './components/Navigation'
import VinylPlayer from './components/VinylPlayer'
import Home from './pages/Home'
import About from './pages/About'
import Projects from './pages/Projects'
import Contact from './pages/Contact'

function App() {
  const [darkMode, setDarkMode] = useState(true)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      darkMode 
        ? 'bg-dark-bg text-dark-text' 
        : 'bg-light-bg text-light-text'
    }`}>
      <div className="noise-overlay" />
      <Navigation darkMode={darkMode} setDarkMode={setDarkMode} scrolled={scrolled} />
      <VinylPlayer darkMode={darkMode} minimized={scrolled} />
      <main>
        <Home darkMode={darkMode} />
        <Projects darkMode={darkMode} />
        <About darkMode={darkMode} />
        <Contact darkMode={darkMode} />
      </main>
    </div>
  )
}

export default App
