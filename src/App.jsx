import { useState, useEffect, useCallback } from 'react'
import Starfield   from './components/Starfield.jsx'
import Loader      from './components/Loader.jsx'
import LangToggle  from './components/LangToggle.jsx'
import Envelope    from './components/Envelope.jsx'
import Toast       from './components/Toast.jsx'
import { LANG }    from './lang.js'

const App = () => {
  const [loaderDone, setLoaderDone] = useState(false)
  const [lang,       setLang]       = useState('id')
  const [opened,     setOpened]     = useState(false)
  const [showToast,  setShowToast]  = useState(false)

  const t = LANG[lang]

  // Hide loader after delay
  useEffect(() => {
    const id = setTimeout(() => setLoaderDone(true), 2900)
    return () => clearTimeout(id)
  }, [])

  const toggleLang = () =>
    setLang(l => (l === 'id' ? 'en' : 'id'))

  const handleOpen = useCallback(() => setOpened(true), [])

  const triggerToast = useCallback(() => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3200)
  }, [])

  const handleShare = useCallback(() => {
    const url = window.location.href
    const msg =
      lang === 'id'
        ? 'Minal Aaidiin Wal Faaiziin — Mohon Maaf Lahir dan Batin'
        : 'Happy Eid Mubarak — from MPK & OSIS'

    if (navigator.share) {
      navigator
        .share({ title: 'Eid Mubarak', text: msg, url })
        .catch(() => {})
    } else {
      navigator.clipboard
        .writeText(url)
        .then(triggerToast)
        .catch(triggerToast)
    }
  }, [lang, triggerToast])

  return (
    <div className="min-h-screen font-poppins" style={{ background: '#070E1C' }}>

      {/* Animated starfield background */}
      <Starfield />

      {/* Full-screen intro loader */}
      <Loader done={loaderDone} />

      {/* Language toggle button */}
      <LangToggle label={t.langLabel} onClick={toggleLang} />

      {/* ══ MAIN SCENE ══ */}
      <main
        className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20"
      >

        {/* Hint text — visible before open */}
        {!opened && (
          <div className="hint-bounce mb-8">
            <div
              className="flex items-center gap-2.5 font-poppins font-medium text-sm px-5 py-2.5 rounded-full"
              style={{
                background: 'rgba(201,148,26,0.08)',
                border:     '1px solid rgba(201,148,26,0.22)',
                color:      '#F5D87A',
              }}
            >
              {/* Mail icon */}
              <svg
                width="15" height="15"
                viewBox="0 0 24 24"
                fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M4 4l8 6 8-6M4 4h16v16H4z"/>
              </svg>
              {t.hint}
            </div>
          </div>
        )}

        {/* Envelope + Card */}
        <Envelope t={t} opened={opened} onOpen={handleOpen} />

        {/* Action buttons — shown after card revealed */}
        {opened && (
          <div className="flex flex-wrap gap-3 justify-center mt-7 animate-fade-up">

            {/* Share */}
            <button
              onClick={handleShare}
              className="btn-gold flex items-center gap-2 font-poppins font-bold
                text-xs uppercase tracking-wider px-6 py-3 rounded-lg"
              style={{ color: '#1A1005', letterSpacing: '0.9px' }}
            >
              <svg
                width="13" height="13"
                viewBox="0 0 24 24"
                fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="18" cy="5"  r="3"/>
                <circle cx="6"  cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
              </svg>
              {t.btnShare}
            </button>

            {/* Save */}
            <button
              onClick={triggerToast}
              className="btn-teal-outline flex items-center gap-2 font-poppins font-semibold
                text-xs uppercase tracking-wider px-5 py-3 rounded-lg"
              style={{
                border:        '1.5px solid rgba(15,122,107,0.38)',
                color:         '#12A08E',
                letterSpacing: '0.9px',
              }}
            >
              <svg
                width="13" height="13"
                viewBox="0 0 24 24"
                fill="none" stroke="currentColor"
                strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {t.btnSave}
            </button>

          </div>
        )}

        {/* Open CTA button — visible before open */}
        {!opened && (
          <button
            onClick={handleOpen}
            className="cta-pulse mt-8 flex items-center gap-2.5 font-poppins font-bold
              text-xs uppercase tracking-widest px-8 py-3.5 rounded-full"
            style={{
              background:    'rgba(201,148,26,0.1)',
              border:        '1.5px solid rgba(201,148,26,0.38)',
              color:         '#E8B84B',
              letterSpacing: '1.5px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background    = '#C9941A'
              e.currentTarget.style.color         = '#1A1005'
              e.currentTarget.style.animation     = 'none'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background    = 'rgba(201,148,26,0.1)'
              e.currentTarget.style.color         = '#E8B84B'
              e.currentTarget.style.animation     = ''
            }}
          >
            {/* Envelope icon */}
            <svg
              width="14" height="14"
              viewBox="0 0 24 24"
              fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M4 4l8 6 8-6M4 4h16v16H4z"/>
            </svg>
            {t.ctaText}
          </button>
        )}

      </main>

      {/* Footer */}
      <footer
        className="relative z-10 text-center pb-8 font-poppins font-medium"
        style={{
          fontSize:      '0.62rem',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color:         'rgba(250,243,224,0.18)',
        }}
      >
        <span style={{ color: 'rgba(201,148,26,0.4)' }}>MPK &amp; OSIS</span>
        &nbsp;·&nbsp; {t.footer} &nbsp;·&nbsp; 1446 H
      </footer>

      {/* Toast notification */}
      <Toast msg={t.toast} show={showToast} />

    </div>
  )
}

export default App
