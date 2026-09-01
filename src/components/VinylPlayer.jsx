import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function VinylPlayer({ darkMode, minimized }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const audioRef = useRef(null)

  const tracks = [
    '/audio/01. Charlie Puth - The Way I Am.mp3',
    '/audio/02. Charlie Puth - Attention.mp3',
    '/audio/03. Charlie Puth - LA Girls.mp3',
  ]

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {})
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying, currentTrack])

  const shufflePlay = () => {
    if (tracks.length === 0) return
    const next = Math.floor(Math.random() * tracks.length)
    setCurrentTrack(next)
    setIsPlaying(true)
  }

  const togglePlay = () => {
    if (tracks.length === 0) return
    if (!isPlaying && tracks.length > 0) {
      shufflePlay()
    } else {
      setIsPlaying(!isPlaying)
    }
  }

  const handleEnded = () => {
    if (tracks.length === 0) return
    const next = Math.floor(Math.random() * tracks.length)
    setCurrentTrack(next)
  }

  return (
    <AnimatePresence>
      {!minimized ? (
        <motion.div
          key="full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, y: -100 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-8 right-8 z-30"
        >
          <button
            onClick={togglePlay}
            className="relative cursor-pointer group block"
            aria-label={isPlaying ? 'Stop music' : 'Play music'}
          >
            <div className="turntable">
              <div className="turntable-platter">
                <motion.div
                  className="vinyl-record"
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <div className="vinyl-grooves" />
                </motion.div>
              </div>

              <div
                className="tonearm"
                style={{
                  transform: isPlaying ? 'rotate(-18deg)' : 'rotate(8deg)',
                  transition: 'transform 0.4s ease',
                }}
              />
              <div className="turntable-control" />
            </div>
          </button>
        </motion.div>
      ) : (
        <motion.button
          key="mini"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={togglePlay}
          className={`fixed bottom-6 right-6 z-30 p-3 rounded-full transition-all ${
            darkMode 
              ? 'bg-dark-surface/90 backdrop-blur-sm hover:bg-dark-card' 
              : 'bg-light-surface/90 backdrop-blur-sm hover:bg-light-card'
          }`}
        >
          <div className="relative w-8 h-8">
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center"
            >
              <div className="w-2 h-2 rounded-full bg-accent" />
            </motion.div>
            <div className={`absolute -right-1 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full origin-top transition-transform duration-300 ${
              isPlaying ? 'rotate-[30deg]' : 'rotate-[15deg]'
            } ${darkMode ? 'bg-dark-muted' : 'bg-light-muted'}`}>
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                darkMode ? 'bg-dark-text' : 'bg-light-text'
              }`} />
            </div>
          </div>
        </motion.button>
      )}

      <audio
        ref={audioRef}
        src={tracks.length > 0 ? tracks[currentTrack] : undefined}
        onEnded={handleEnded}
      />
    </AnimatePresence>
  )
}
