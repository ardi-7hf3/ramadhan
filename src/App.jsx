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

      <Starfield />
      <Loader done={loaderDone} />
      <LangToggle label={t.langLabel} onClick={toggleLang} />

      {/* ══ MAIN SCENE ══ */}
      <main
        className="relative z-10 flex flex-col items-center justify-center px-3 sm:px-6"
        style={{
          minHeight:  '100dvh',
          paddingTop: opened ? '80px' : '72px',
          paddingBottom: '80px',
          overflow: 'visible',
        }}
      >

        {/* Hint text */}
        {!opened && (
          <div className="hint-bounce mb-6 sm:mb-8 w-full flex justify-center">
            <div
              className="flex items-center gap-2 font-poppins font-medium px-4 py-2 sm:px-5 sm:py-2.5 rounded-full"
              style={{
                fontSize:   'clamp(0.7rem, 3vw, 0.875rem)',
                background: 'rgba(201,148,26,0.08)',
                border:     '1px solid rgba(201,148,26,0.22)',
                color:      '#F5D87A',
                maxWidth:   '90vw',
                textAlign:  'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4l8 6 8-6M4 4h16v16H4z"/>
              </svg>
              {t.hint}
            </div>
          </div>
        )}

        {/* Envelope + Card */}
        <Envelope t={t} opened={opened} onOpen={handleOpen} />

        {/* Action buttons — after open */}
        {opened && (
          <div className="flex flex-wrap gap-3 justify-center mt-6 sm:mt-7 animate-fade-up w-full px-2">
            <button
              onClick={handleShare}
              className="btn-gold flex items-center gap-2 font-poppins font-bold uppercase rounded-lg"
              style={{
                color:         '#1A1005',
                letterSpacing: '0.9px',
                fontSize:      'clamp(0.65rem, 2.5vw, 0.75rem)',
                padding:       'clamp(10px,2.5vw,12px) clamp(16px,4vw,24px)',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
              </svg>
              {t.btnShare}
            </button>

            <button
              onClick={triggerToast}
              className="btn-teal-outline flex items-center gap-2 font-poppins font-semibold uppercase rounded-lg"
              style={{
                border:        '1.5px solid rgba(15,122,107,0.38)',
                color:         '#12A08E',
                letterSpacing: '0.9px',
                fontSize:      'clamp(0.65rem, 2.5vw, 0.75rem)',
                padding:       'clamp(10px,2.5vw,12px) clamp(14px,3.5vw,20px)',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {t.btnSave}
            </button>
          </div>
        )}

        {/* Open CTA button */}
        {!opened && (
          <button
            onClick={handleOpen}
            className="cta-pulse mt-6 sm:mt-8 flex items-center gap-2.5 font-poppins font-bold uppercase rounded-full"
            style={{
              background:    'rgba(201,148,26,0.1)',
              border:        '1.5px solid rgba(201,148,26,0.38)',
              color:         '#E8B84B',
              letterSpacing: '1.5px',
              fontSize:      'clamp(0.65rem, 2.5vw, 0.75rem)',
              padding:       'clamp(10px,2.5vw,14px) clamp(20px,5vw,32px)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#C9941A'
              e.currentTarget.style.color      = '#1A1005'
              e.currentTarget.style.animation  = 'none'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(201,148,26,0.1)'
              e.currentTarget.style.color      = '#E8B84B'
              e.currentTarget.style.animation  = ''
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4l8 6 8-6M4 4h16v16H4z"/>
            </svg>
            {t.ctaText}
          </button>
        )}

      </main>

      {/* Footer */}
      <footer
        className="relative z-10 text-center pb-6 font-poppins font-medium"
        style={{
          fontSize:      'clamp(0.55rem, 2vw, 0.65rem)',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color:         'rgba(250,243,224,0.18)',
        }}
      >
        <span style={{ color: 'rgba(201,148,26,0.4)' }}>MPK &amp; OSIS</span>
        &nbsp;·&nbsp; {t.footer} &nbsp;·&nbsp; 1447 H
      </footer>

      <Toast msg={t.toast} show={showToast} />

    </div>
  )
}

export default App
