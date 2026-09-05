import { Link } from 'react-router-dom'

const quickLinks = [
  { to: 'home', label: 'Home' },
  { to: 'projects', label: 'Work' },
  { to: 'about', label: 'About' },
  { to: 'contact', label: 'Contact' },
]

export default function Footer({ darkMode }) {
  return (
    <footer className={`border-t ${darkMode ? 'border-white/5 bg-[#0B0E0D]' : 'border-black/5 bg-[#F0EBCE]'}`}>
      <div className="max-w-7xl mx-auto px-6 py-14 flex flex-col md:flex-row md:items-start justify-between gap-10">
        <div className="space-y-3">
          <span className="font-display text-lg tracking-wide" style={{ color: '#AA8B56' }}>
            THE.LUMENCODE
          </span>
          <p className={`font-mono text-xs max-w-xs leading-relaxed ${darkMode ? 'text-dark-muted' : 'text-light-muted'}`}>
            Photography by Atharva Goyal — light, color, and the moments in between.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className={`font-mono text-[10px] tracking-[0.3em] uppercase mb-2 ${darkMode ? 'text-dark-muted' : 'text-light-muted'}`}>
            Navigate
          </span>
          {quickLinks.map((l) => (
            <Link
              key={l.to}
              to={`/#${l.to}`}
              className={`font-mono text-xs tracking-widest uppercase transition-colors ${
                darkMode
                  ? 'text-[#F0EBCE]/70 hover:text-[#D2B377]'
                  : 'text-[#395144]/70 hover:text-[#AA8B56]'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <span className={`font-mono text-[10px] tracking-[0.3em] uppercase mb-2 ${darkMode ? 'text-dark-muted' : 'text-light-muted'}`}>
            Connect
          </span>
          <a href="mailto:the.lumencode@asu.edu" className={`font-mono text-xs tracking-widest uppercase transition-colors ${
            darkMode ? 'text-[#F0EBCE]/70 hover:text-[#D2B377]' : 'text-[#395144]/70 hover:text-[#AA8B56]'
          }`}>
            Email
          </a>
          <a href="https://www.instagram.com/the.lumencode/" target="_blank" rel="noopener noreferrer" className={`font-mono text-xs tracking-widest uppercase transition-colors ${
            darkMode ? 'text-[#F0EBCE]/70 hover:text-[#D2B377]' : 'text-[#395144]/70 hover:text-[#AA8B56]'
          }`}>
            Instagram
          </a>
          <a href="https://www.linkedin.com/in/atharva--goyal/" target="_blank" rel="noopener noreferrer" className={`font-mono text-xs tracking-widest uppercase transition-colors ${
            darkMode ? 'text-[#F0EBCE]/70 hover:text-[#D2B377]' : 'text-[#395144]/70 hover:text-[#AA8B56]'
          }`}>
            LinkedIn
          </a>
        </div>
      </div>

      <div className="border-t border-black/5 border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className={`font-mono text-[10px] tracking-widest uppercase ${darkMode ? 'text-dark-muted/60' : 'text-light-muted/60'}`}>
            © {new Date().getFullYear()} THE.LUMENCODE
          </p>
          <p className={`font-mono text-[10px] tracking-widest uppercase ${darkMode ? 'text-dark-muted/40' : 'text-light-muted/40'}`}>
            Tempe, Arizona
          </p>
        </div>
      </div>
    </footer>
  )
}