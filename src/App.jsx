import { useState, useEffect, useCallback } from 'react'
import Starfield   from './components/Starfield.jsx'
import Loader      from './components/Loader.jsx'
import LangToggle  from './components/LangToggle.jsx'
import Envelope    from './components/Envelope.jsx'
import Toast       from './components/Toast.jsx'
import { LANG }    from './lang.js'

const App = () => {
  const [loaderDone,   setLoaderDone]   = useState(false)
  const [lang,         setLang]         = useState('id')
  const [envelopeOpen, setEnvelopeOpen] = useState(false)
  const [cardViewing,  setCardViewing]  = useState(false)
  const [showToast,    setShowToast]    = useState(false)

  const t = LANG[lang]

  useEffect(() => {
    const id = setTimeout(() => setLoaderDone(true), 2900)
    return () => clearTimeout(id)
  }, [])

  const toggleLang        = () => setLang(l => (l === 'id' ? 'en' : 'id'))
  const handleOpenEnvelope = useCallback(() => { if (!envelopeOpen) setEnvelopeOpen(true) }, [envelopeOpen])
  const handleViewCard     = useCallback(() => setCardViewing(true),  [])
  const handleCloseCard    = useCallback(() => setCardViewing(false), [])

  const triggerToast = useCallback(() => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }, [])

  const handleShare = useCallback(() => {
    const url = window.location.href
    const msg = lang === 'id'
      ? 'Minal Aaidiin Wal Faaiziin — Mohon Maaf Lahir dan Batin'
      : 'Happy Eid Mubarak — from MPK & OSIS'
    if (navigator.share) {
      navigator.share({ title: 'Eid Mubarak', text: msg, url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url).then(triggerToast).catch(triggerToast)
    }
  }, [lang, triggerToast])

  return (
    <div className="min-h-screen font-poppins" style={{ background: '#070E1C' }}>
      <Starfield />
      <Loader done={loaderDone} />
      <LangToggle label={t.langLabel} onClick={toggleLang} />

      <main
        className="relative z-10 flex flex-col items-center justify-center px-3 sm:px-6"
        style={{ minHeight:'100dvh', paddingTop:'72px', paddingBottom:'72px', overflow:'visible' }}
      >
        {!envelopeOpen && (
          <div className="hint-bounce mb-6 w-full flex justify-center">
            <div className="flex items-center gap-2 font-poppins font-medium px-4 py-2 sm:px-5 sm:py-2.5 rounded-full"
              style={{ fontSize:'clamp(0.7rem,3vw,0.875rem)', background:'rgba(201,148,26,0.08)', border:'1px solid rgba(201,148,26,0.22)', color:'#F5D87A' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4l8 6 8-6M4 4h16v16H4z"/>
              </svg>
              {t.hint}
            </div>
          </div>
        )}

        <Envelope
          t={t}
          envelopeOpen={envelopeOpen}
          cardViewing={cardViewing}
          onOpenEnvelope={handleOpenEnvelope}
          onViewCard={handleViewCard}
          onCloseCard={handleCloseCard}
          onShare={handleShare}
          onSave={triggerToast}
        />

        {!envelopeOpen && (
          <button onClick={handleOpenEnvelope}
            className="cta-pulse mt-6 sm:mt-8 flex items-center gap-2.5 font-poppins font-bold uppercase rounded-full"
            style={{ background:'rgba(201,148,26,0.1)', border:'1.5px solid rgba(201,148,26,0.38)', color:'#E8B84B', letterSpacing:'1.5px', fontSize:'clamp(0.65rem,2.5vw,0.75rem)', padding:'clamp(10px,2.5vw,14px) clamp(20px,5vw,32px)' }}
            onMouseEnter={e => { e.currentTarget.style.background='#C9941A'; e.currentTarget.style.color='#1A1005'; e.currentTarget.style.animation='none' }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(201,148,26,0.1)'; e.currentTarget.style.color='#E8B84B'; e.currentTarget.style.animation='' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4l8 6 8-6M4 4h16v16H4z"/>
            </svg>
            {t.ctaText}
          </button>
        )}
      </main>

      <footer className="relative z-10 text-center pb-6 font-poppins font-medium"
        style={{ fontSize:'clamp(0.55rem,2vw,0.65rem)', letterSpacing:'2px', textTransform:'uppercase', color:'rgba(250,243,224,0.18)' }}>
        <span style={{ color:'rgba(201,148,26,0.4)' }}>MPK &amp; OSIS</span>
        &nbsp;·&nbsp; {t.footer} &nbsp;·&nbsp; 1447 H
      </footer>

      <Toast msg={t.toast} show={showToast} />
    </div>
  )
}

export default App
