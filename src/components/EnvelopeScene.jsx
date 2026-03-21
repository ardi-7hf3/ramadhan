import { useState, useRef, useCallback } from 'react'
import GreetingCard from './GreetingCard.jsx'

const WaxSeal = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="sealGrad" cx="38%" cy="33%">
        <stop offset="0%" stopColor="#C02020" />
        <stop offset="100%" stopColor="#5C0A0A" />
      </radialGradient>
    </defs>
    <circle cx="36" cy="36" r="32" fill="url(#sealGrad)" />
    <circle cx="36" cy="36" r="30" fill="none" stroke="#E03030" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.6" />
    <circle cx="36" cy="36" r="23" fill="none" stroke="rgba(255,200,150,0.25)" strokeWidth="0.8" />
    <path d="M36 18 L38.4 26 L46.8 23.2 L40.8 29.6 L46.8 36 L38.4 33.2 L36 41.2 L33.6 33.2 L25.2 36 L31.2 29.6 L25.2 23.2 L33.6 26 Z"
      fill="rgba(255,200,150,0.2)" stroke="rgba(255,200,150,0.45)" strokeWidth="0.8" />
    <path d="M36 27 A9 9 0 1 1 35.9 27 A5.5 5.5 0 1 0 36 27 Z"
      fill="rgba(255,220,150,0.6)" transform="rotate(15 36 36)" />
    <text x="36" y="54" textAnchor="middle" fontSize="7" fontFamily="Amiri,serif"
      fill="rgba(255,220,150,0.7)" letterSpacing="1">بِسْمِ</text>
  </svg>
)

const IslamicPattern = () => (
  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="islamicPatEnv" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="rgba(60,30,0,0.5)" strokeWidth="0.8" />
        <circle cx="20" cy="20" r="6" fill="none" stroke="rgba(60,30,0,0.3)" strokeWidth="0.6" />
        <path d="M20 14 L23 18 L20 22 L17 18 Z" fill="none" stroke="rgba(60,30,0,0.25)" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#islamicPatEnv)" />
  </svg>
)

const CardModal = ({ t, phase, onClose }) => {
  if (phase === 'hidden') return null
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        background: 'rgba(7,14,28,0.82)',
        backdropFilter: 'blur(7px)',
        opacity: phase === 'closing' ? 0 : 1,
        transition: 'opacity 0.35s ease',
      }}
    >
      <div
        className={phase === 'opening' ? 'modal-enter' : phase === 'closing' ? 'modal-exit' : ''}
        style={{
          position: 'relative', width: '100%', maxWidth: '520px',
          maxHeight: '92dvh', overflowY: 'auto', borderRadius: '16px',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'sticky', top: '8px', float: 'right', zIndex: 210,
            width: '34px', height: '34px', margin: '8px 8px -42px auto',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer',
            background: 'rgba(7,14,28,0.88)',
            border: '1.5px solid rgba(201,148,26,0.45)',
            color: '#E8B84B',
            transition: 'background 0.2s, transform 0.25s, color 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='#C9941A'; e.currentTarget.style.color='#1A1005'; e.currentTarget.style.transform='scale(1.12) rotate(90deg)' }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(7,14,28,0.88)'; e.currentTarget.style.color='#E8B84B'; e.currentTarget.style.transform='none' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <GreetingCard t={t} />
      </div>
    </div>
  )
}

const EnvelopeScene = ({ t }) => {
  const [envState,   setEnvState]   = useState('closed')
  const [cardPhase,  setCardPhase]  = useState('hidden')
  const [flapOpen,   setFlapOpen]   = useState(false)
  const [sealGone,   setSealGone]   = useState(false)
  const [insideShow, setInsideShow] = useState(false)
  const [labelHide,  setLabelHide]  = useState(false)
  const timers = useRef([])
  const after = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id) }

  // Klik amplop → flap buka → tampilkan kartu
  const handleOpen = useCallback(() => {
    if (envState !== 'closed') return
    setEnvState('opening')

    after(() => setFlapOpen(true),    100)
    after(() => setSealGone(true),    200)
    after(() => setLabelHide(true),   300)
    after(() => setInsideShow(true),  550)
    after(() => {
      setCardPhase('opening')
      setEnvState('open')
    }, 800)
    after(() => setCardPhase('open'), 800 + 650)
  }, [envState])

  // Klik close → kartu hilang → flap tutup
  const handleClose = useCallback(() => {
    if (envState !== 'open') return
    setCardPhase('closing')
    after(() => {
      setCardPhase('hidden')
      setEnvState('closing')
      setInsideShow(false)
      after(() => setFlapOpen(false),   200)
      after(() => { setSealGone(false); setLabelHide(false) }, 500)
      after(() => setEnvState('closed'), 950)
    }, 500)
  }, [envState])

  const isClickable = envState === 'closed'

  return (
    <>
      <CardModal t={t} phase={cardPhase} onClose={handleClose} />

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: 'clamp(280px, 75vw, 420px)',
      }}>

        {/* Hint */}
        {isClickable && (
          <div style={{ marginBottom: '20px', animation: 'hintBounce 2s ease-in-out infinite' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              fontFamily: 'Poppins, sans-serif', fontWeight: 500, fontSize: '0.875rem',
              padding: '10px 20px', borderRadius: '9999px',
              background: 'rgba(201,148,26,0.08)',
              border: '1px solid rgba(201,148,26,0.22)',
              color: '#F5D87A',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4l8 6 8-6M4 4h16v16H4z" />
              </svg>
              {t.hint}
            </div>
          </div>
        )}

        {/* Envelope */}
        <div
          onClick={isClickable ? handleOpen : undefined}
          style={{
            position: 'relative',
            width: '100%',
            cursor: isClickable ? 'pointer' : 'default',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={e => { if (isClickable) e.currentTarget.style.transform = 'translateY(-6px)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <div style={{
            position: 'relative',
            paddingTop: '65%',
            background: 'linear-gradient(160deg, #DEC07A 0%, #C4A15A 50%, #9A7830 100%)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 8px 20px rgba(0,0,0,0.4)',
            borderRadius: '8px 8px 12px 12px',
          }}>
            {/* Inside */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 'inherit',
              background: 'linear-gradient(180deg, #EDD58A 0%, #C8A040 100%)',
              opacity: insideShow ? 1 : 0,
              transition: 'opacity 0.4s ease 0.3s',
            }} />

            {/* Pattern */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 'inherit',
              overflow: 'hidden', pointerEvents: 'none', opacity: 0.1,
            }}>
              <IslamicPattern />
            </div>

            {/* Left flap */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, pointerEvents: 'none',
              width: '52%', height: '55%',
              background: 'linear-gradient(135deg, #C4A15A 0%, #9A7830 100%)',
              clipPath: 'polygon(0 100%, 0 0, 100% 100%)',
            }} />

            {/* Right flap */}
            <div style={{
              position: 'absolute', bottom: 0, right: 0, pointerEvents: 'none',
              width: '52%', height: '55%',
              background: 'linear-gradient(225deg, #C4A15A 0%, #9A7830 100%)',
              clipPath: 'polygon(100% 100%, 100% 0, 0 100%)',
            }} />

            {/* Top flap */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              zIndex: 20, pointerEvents: 'none',
              height: '52%',
              background: 'linear-gradient(180deg, #DEC07A 0%, #B59040 100%)',
              clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              transformStyle: 'preserve-3d',
              transformOrigin: 'top center',
              transform: flapOpen ? 'rotateX(-185deg)' : 'rotateX(0deg)',
              transition: 'transform 0.75s cubic-bezier(0.4,0,0.2,1)',
            }} />

            {/* Wax seal */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%', zIndex: 30,
              transform: `translate(-50%,-50%) scale(${sealGone ? 0 : 1}) rotate(${sealGone ? '30deg' : '0deg'})`,
              opacity: sealGone ? 0 : 1,
              transition: 'transform 0.5s ease, opacity 0.4s ease',
            }}>
              <WaxSeal />
            </div>

            {/* Label */}
            <div style={{
              position: 'absolute', bottom: '16px', left: 0, right: 0,
              display: 'flex', justifyContent: 'center',
              zIndex: 10, pointerEvents: 'none',
              opacity: labelHide ? 0 : 1,
              transition: 'opacity 0.35s ease',
            }}>
              <div style={{
                fontFamily: 'Amiri, serif', direction: 'rtl',
                color: 'rgba(80,50,0,0.5)', fontSize: '0.8rem', letterSpacing: '2px',
              }}>
                عِيدٌ مُبَارَكٌ
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default EnvelopeScene
