import { motion } from 'framer-motion'

const skills = [
  'Photography', 'Lightroom', 'Photoshop', 'Composition', 
  'Color Theory', 'Post-Processing', 'RAW Editing'
]

export default function About({ darkMode }) {

  return (
    <section
      id="about"
      className="min-h-screen pt-32 pb-20 relative"
      style={{
        background: darkMode
          ? 'linear-gradient(to bottom, #395144 0%, #000000 100%)'
          : 'linear-gradient(to bottom, #4E6C50 0%, #F0EBCE 100%)'
      }}
    >
      <div className="max-w-5xl mx-auto px-6">
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
              About
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-6xl font-medium tracking-tight">
            The Story <span className="italic text-gradient">Behind</span> the Lens
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <p className={`text-lg leading-relaxed ${darkMode ? 'text-dark-muted' : 'text-light-muted'}`}>
              I'm Atharva Goyal, a photographer based in Tempe, Arizona. 
              My work explores the interplay of light, color, and everyday moments 
              that often go unnoticed.
            </p>
            <p className={`text-lg leading-relaxed ${darkMode ? 'text-dark-muted' : 'text-light-muted'}`}>
              Growing up with an eye for detail, I find beauty in the ordinary — 
              a sunset through desert roads, the geometry of urban architecture, 
              or the quiet moments between people and nature.
            </p>
            <p className={`text-lg leading-relaxed ${darkMode ? 'text-dark-muted' : 'text-light-muted'}`}>
              When I'm not behind the lens, you'll find me curating playlists 
              and exploring the vibrant landscapes of Arizona.
            </p>

            <div className="pt-8">
              <h3 className="font-mono text-xs tracking-widest uppercase mb-4 text-accent">
                Tools & Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className={`px-4 py-2 rounded-full text-sm font-mono ${
                      darkMode 
                        ? 'bg-dark-surface border border-white/5' 
                        : 'bg-light-surface border border-black/5'
                    }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative"
          >
            <div className="aspect-[3/4] rounded-2xl overflow-hidden">
              <img
                src="/images/about-me.jpg"
                alt="Atharva Goyal"
                className="w-full h-full object-cover"
              />
            </div>
            <div className={`absolute -bottom-4 -right-4 w-full h-full rounded-2xl border ${
              darkMode ? 'border-accent/20' : 'border-accent/30'
            } -z-10`} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
