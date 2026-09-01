import { motion } from 'framer-motion'
import { useForm, ValidationError } from '@formspree/react'

export default function Contact({ darkMode }) {
  const [state, handleSubmit] = useForm('xjyvwgaw')

  const cardCls = darkMode
    ? 'bg-white/5 hover:bg-white/10 border-white/10'
    : 'bg-black/5 hover:bg-black/10 border-black/10'
  const inputCls = darkMode
    ? 'bg-white/5 border-white/10 text-[#F0EBCE] placeholder-white/30'
    : 'bg-black/5 border-black/10 text-[#395144] placeholder-black/30'
  const bodyTextCls = darkMode ? 'text-[#F0EBCE]' : 'text-[#395144]'
  const mutedTextCls = darkMode ? 'text-[#F0EBCE]/80' : 'text-[#395144]/80'
  const headingCls = darkMode ? 'text-[#F0EBCE]' : 'text-[#395144]'

  return (
    <section
      id="contact"
      className="min-h-screen pt-32 pb-20 relative"
      style={{ background: darkMode ? '#0B0E0D' : '#F0EBCE' }}
    >
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="glow-line w-12" />
            <span className="font-mono text-sm tracking-[0.3em] uppercase text-[#AA8B56]">
              Contact
            </span>
          </div>
          <h2 className={`font-display text-4xl md:text-6xl font-medium tracking-tight ${headingCls}`}>
            Let's <span className="italic text-gradient">Connect</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            <p className={`text-lg leading-relaxed ${mutedTextCls}`}>
              Have a project in mind? Want to collaborate? Or just want to say hello?
              I'd love to hear from you.
            </p>

            <div className="space-y-4">
              <a
                href="mailto:the.lumencode@asu.edu"
                className={`flex items-center gap-4 p-4 rounded-xl transition-all group ${cardCls}`}
              >
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-mono text-xs tracking-wider uppercase text-accent">Email</p>
                  <p className={`font-body ${bodyTextCls}`}>the.lumencode@asu.edu</p>
                </div>
                <svg className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>

              <a
                href="https://www.linkedin.com/in/atharva--goyal/"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-4 p-4 rounded-xl transition-all group ${cardCls}`}
              >
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-mono text-xs tracking-wider uppercase text-accent">LinkedIn</p>
                  <p className={`font-body ${bodyTextCls}`}>Atharva Goyal</p>
                </div>
                <svg className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>

              <a
                href="https://www.instagram.com/atharva__goyal"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-4 p-4 rounded-xl transition-all group ${cardCls}`}
              >
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-mono text-xs tracking-wider uppercase text-accent">Instagram</p>
                  <p className={`font-body ${bodyTextCls}`}>@atharva__goyal</p>
                </div>
                <svg className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="font-mono text-xs tracking-wider uppercase text-accent mb-2 block">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  required
                  className={`w-full px-4 py-3 rounded-xl font-body transition-all outline-none focus:ring-2 focus:ring-accent/30 ${inputCls}`}
                  placeholder="Your name"
                />
                <ValidationError prefix="Name" field="name" errors={state.errors} />
              </div>
              <div>
                <label htmlFor="email" className="font-mono text-xs tracking-wider uppercase text-accent mb-2 block">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  className={`w-full px-4 py-3 rounded-xl font-body transition-all outline-none focus:ring-2 focus:ring-accent/30 ${inputCls}`}
                  placeholder="your@email.com"
                />
                <ValidationError prefix="Email" field="email" errors={state.errors} />
              </div>
              <div>
                <label htmlFor="message" className="font-mono text-xs tracking-wider uppercase text-accent mb-2 block">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  className={`w-full px-4 py-3 rounded-xl font-body transition-all outline-none focus:ring-2 focus:ring-accent/30 resize-none ${inputCls}`}
                  placeholder="Tell me about your project..."
                />
                <ValidationError prefix="Message" field="message" errors={state.errors} />
              </div>

              {state.succeeded ? (
                <div className={`w-full py-4 rounded-xl text-center font-mono text-xs tracking-wider uppercase ${darkMode ? 'bg-dark-surface text-dark-text' : 'bg-light-surface text-light-text'}`}>
                  Message sent - I'll get back to you soon.
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={state.submitting}
                  className="w-full py-4 rounded-xl font-mono text-xs tracking-wider uppercase transition-colors disabled:opacity-60"
                  style={{ background: '#AA8B56', color: '#1B1F1C' }}
                >
                  {state.submitting ? 'Sending...' : 'Send Message'}
                </button>
              )}

              {state.errors && state.errors.length > 0 && !state.submitting && (
                <p className={`text-center font-mono text-xs ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                  Something went wrong. Please try again.
                </p>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
