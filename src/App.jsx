import { useState, useEffect, useCallback } from 'react'
import Starfield     from './components/Starfield.jsx'
import Loader        from './components/Loader.jsx'
import LangToggle    from './components/LangToggle.jsx'
import GreetingCard  from './components/GreetingCard.jsx'
import Toast         from './components/Toast.jsx'
import { LANG }      from './lang.js'

const App = () => {
  const [loaderDone, setLoaderDone] = useState(false)
  const [lang,       setLang]       = useState('id')
  const [showToast,  setShowToast]  = useState(false)

  const t = LANG[lang]

  useEffect(() => {
    const id = setTimeout(() => setLoaderDone(true), 2900)
    return () => clearTimeout(id)
  }, [])

  const toggleLang = () => setLang(l => (l === 'id' ? 'en' : 'id'))

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
        style={{ minHeight: '100dvh', paddingTop: '72px', paddingBottom: '72px' }}
      >
        {/* Kartu ucapan langsung tampil */}
        <div style={{ width: 'min(520px, 92vw)' }}>
          <GreetingCard t={t} />
        </div>

        {/* Tombol Share & Save */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleShare}
            className="btn-gold flex items-center gap-2 font-poppins font-bold uppercase rounded-lg"
            style={{ color: '#1A1005', fontSize: '0.72rem', letterSpacing: '0.9px', padding: '10px 20px' }}
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
            style={{ border: '1.5px solid rgba(15,122,107,0.4)', color: '#12A08E', fontSize: '0.72rem', letterSpacing: '0.9px', padding: '10px 18px' }}
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
      </main>

      <footer className="relative z-10 text-center pb-6 font-poppins font-medium"
        style={{ fontSize: 'clamp(0.55rem,2vw,0.65rem)', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(250,243,224,0.18)' }}>
        <span style={{ color: 'rgba(201,148,26,0.4)' }}>MPK &amp; OSIS</span>
        &nbsp;·&nbsp; {t.footer} &nbsp;·&nbsp; 1447 H
      </footer>

      <Toast msg={t.toast} show={showToast} />
    </div>
  )
}

export default App
