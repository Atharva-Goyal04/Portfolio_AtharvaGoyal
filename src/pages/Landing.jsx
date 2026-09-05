import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Home from './Home'
import About from './About'
import Projects from './Projects'
import Contact from './Contact'

export default function Landing({ darkMode }) {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1)
      const el = document.getElementById(id)
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 50)
      }
    }
  }, [location])

  return (
    <main>
      <Home darkMode={darkMode} />
      <Projects darkMode={darkMode} />
      <About darkMode={darkMode} />
      <Contact darkMode={darkMode} />
    </main>
  )
}