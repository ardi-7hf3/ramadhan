import { useState, useEffect, useCallback } from 'react'
import Starfield      from './components/Starfield.jsx'
import Loader         from './components/Loader.jsx'
import LangToggle     from './components/LangToggle.jsx'
import EnvelopeScene  from './components/EnvelopeScene.jsx'
import Toast          from './components/Toast.jsx'
import { LANG }       from './lang.js'

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

  return (
    <div className="min-h-screen font-poppins" style={{ background: '#070E1C' }}>
      <Starfield />
      <Loader done={loaderDone} />
      <LangToggle label={t.langLabel} onClick={toggleLang} />

      <main
        className="relative z-10 flex flex-col items-center justify-center px-3 sm:px-6"
        style={{ minHeight: '100dvh', paddingTop: '72px', paddingBottom: '72px' }}
      >
        <EnvelopeScene t={t} onToast={triggerToast} />
      </main>

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
