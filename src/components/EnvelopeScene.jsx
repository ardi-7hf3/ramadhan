import { useState, useRef, useCallback } from 'react'
import GreetingCard from './GreetingCard.jsx'

// ── SVG: Wax Seal ──
const WaxSeal = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="sealGrad" cx="38%" cy="33%">
        <stop offset="0%"   stopColor="#C02020" />
        <stop offset="100%" stopColor="#5C0A0A" />
      </radialGradient>
    </defs>
    <circle cx="36" cy="36" r="32" fill="url(#sealGrad)" />
    <circle cx="36" cy="36" r="30" fill="none" stroke="#E03030" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.6" />
    <circle cx="36" cy="36" r="23" fill="none" stroke="rgba(255,200,150,0.25)" strokeWidth="0.8" />
    <path
      d="M36 18 L38.4 26 L46.8 23.2 L40.8 29.6 L46.8 36 L38.4 33.2 L36 41.2 L33.6 33.2 L25.2 36 L31.2 29.6 L25.2 23.2 L33.6 26 Z"
      fill="rgba(255,200,150,0.2)" stroke="rgba(255,200,150,0.45)" strokeWidth="0.8"
    />
    <path
      d="M36 27 A9 9 0 1 1 35.9 27 A5.5 5.5 0 1 0 36 27 Z"
      fill="rgba(255,220,150,0.6)" transform="rotate(15 36 36)"
    />
    <text x="36" y="54" textAnchor="middle" fontSize="7" fontFamily="Amiri,serif"
      fill="rgba(255,220,150,0.7)" letterSpacing="1">بِسْمِ</text>
  </svg>
)

// ── SVG: Islamic Pattern Tile ──
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

// ═══════════════════════════════════════════
//  CARD MODAL — slides up from envelope, has X close
// ═══════════════════════════════════════════
const CardModal = ({ t, phase, onClose }) => {
  if (phase === 'hidden') return null

  return (
    <div
      className="card-modal-overlay"
      style={{ opacity: phase === 'closing' ? 0 : 1 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={`card-modal-inner ${
        phase === 'opening' ? 'modal-enter' :
        phase === 'closing' ? 'modal-exit'  : ''
      }`}>
        {/* Close Button */}
        <button className="close-btn" onClick={onClose} title="Tutup kartu">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6"  y2="18" />
            <line x1="6"  y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <GreetingCard t={t} />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
//  ENVELOPE SCENE — main export
// ═══════════════════════════════════════════
const EnvelopeScene = ({ t }) => {
  // 'closed' | 'opening' | 'open' | 'closing'
  const [envState,  setEnvState]  = useState('closed')
  // 'hidden' | 'opening' | 'open' | 'closing'
  const [cardPhase, setCardPhase] = useState('hidden')
  const [flapOpen,  setFlapOpen]  = useState(false)
  const [sealGone,  setSealGone]  = useState(false)
  const [insideShow,setInsideShow]= useState(false)
  const [labelHide, setLabelHide] = useState(false)
  const timerRef = useRef([])

  const addTimer = (fn, ms) => {
    const id = setTimeout(fn, ms)
    timerRef.current.push(id)
    return id
  }

  // ── OPEN sequence ──
  const handleOpen = useCallback(() => {
    if (envState !== 'closed') return
    setEnvState('opening')

    // 1. flap rotates open
    addTimer(() => setFlapOpen(true),   80)
    // 2. seal dissolves
    addTimer(() => setSealGone(true),   160)
    // 3. label fades
    addTimer(() => setLabelHide(true),  280)
    // 4. inside reveals
    addTimer(() => setInsideShow(true), 550)
    // 5. card modal begins rising
    addTimer(() => {
      setCardPhase('opening')
      setEnvState('open')
    }, 780)
    // 6. card settled
    addTimer(() => setCardPhase('open'), 780 + 700)
  }, [envState])

  // ── CLOSE sequence (called by CardModal's X button) ──
  const handleClose = useCallback(() => {
    if (envState !== 'open') return

    // 1. card starts sinking back
    setCardPhase('closing')

    // 2. after card sinks, collapse envelope
    addTimer(() => {
      setCardPhase('hidden')
      setEnvState('closing')
      setInsideShow(false)

      addTimer(() => {
        setFlapOpen(false)    // flap folds down
      }, 200)
      addTimer(() => {
        setSealGone(false)    // seal re-appears
        setLabelHide(false)
      }, 500)
      addTimer(() => {
        setEnvState('closed') // fully closed — clickable again
      }, 900)
    }, 520)
  }, [envState])

  const isClickable = envState === 'closed'

  return (
    <>
      {/* ── Card Modal (portal-like, fixed overlay) ── */}
      <CardModal t={t} phase={cardPhase} onClose={handleClose} />

      {/* ── Envelope wrapper ── */}
      <div
        className={`envelope-scene ${isClickable ? 'envelope-hover cursor-pointer' : 'cursor-default'}`}
        onClick={isClickable ? handleOpen : undefined}
        style={{ perspective: '1200px', width: 'clamp(280px, 75vw, 420px)' }}
      >
        {/* ── Hint label ── */}
        {isClickable && (
          <div className="hint-bounce flex justify-center mb-5">
            <div
              className="flex items-center gap-2.5 font-poppins font-medium text-sm px-5 py-2.5 rounded-full"
              style={{
                background: 'rgba(201,148,26,0.08)',
                border:     '1px solid rgba(201,148,26,0.22)',
                color:      '#F5D87A',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4l8 6 8-6M4 4h16v16H4z" />
              </svg>
              {t.hint}
            </div>
          </div>
        )}

        {/* ── Envelope body ── */}
        <div
          className="relative rounded-lg"
          style={{
            paddingTop:  '65%',
            background:  'linear-gradient(160deg, #DEC07A 0%, #C4A15A 50%, #9A7830 100%)',
            boxShadow:   '0 24px 60px rgba(0,0,0,0.6), 0 8px 20px rgba(0,0,0,0.4)',
            borderRadius:'8px 8px 12px 12px',
            overflow:    'visible',
          }}
        >
          {/* Inside revealed when open */}
          <div
            className="absolute inset-0 rounded-lg"
            style={{
              background: 'linear-gradient(180deg, #EDD58A 0%, #C8A040 100%)',
              opacity:    insideShow ? 1 : 0,
              transition: 'opacity 0.4s ease 0.3s',
            }}
          />

          {/* Islamic pattern overlay */}
          <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none" style={{ opacity: 0.1 }}>
            <IslamicPattern />
          </div>

          {/* Left bottom flap */}
          <div className="absolute bottom-0 left-0 pointer-events-none"
            style={{
              width: '52%', height: '55%',
              background: 'linear-gradient(135deg, #C4A15A 0%, #9A7830 100%)',
              clipPath: 'polygon(0 100%, 0 0, 100% 100%)',
            }}
          />

          {/* Right bottom flap */}
          <div className="absolute bottom-0 right-0 pointer-events-none"
            style={{
              width: '52%', height: '55%',
              background: 'linear-gradient(225deg, #C4A15A 0%, #9A7830 100%)',
              clipPath: 'polygon(100% 100%, 100% 0, 0 100%)',
            }}
          />

          {/* TOP FLAP — animates open/close */}
          <div
            className="absolute top-0 left-0 right-0 z-20 pointer-events-none"
            style={{
              height:          '52%',
              background:      'linear-gradient(180deg, #DEC07A 0%, #B59040 100%)',
              clipPath:        'polygon(0 0, 50% 100%, 100% 0)',
              boxShadow:       '0 4px 12px rgba(0,0,0,0.3)',
              transformStyle:  'preserve-3d',
              transformOrigin: 'top center',
              transform:       flapOpen ? 'rotateX(-185deg)' : 'rotateX(0deg)',
              transition:      'transform 0.75s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />

          {/* WAX SEAL */}
          <div
            className="absolute top-1/2 left-1/2 z-30"
            style={{
              transform:  `translate(-50%, -50%) scale(${sealGone ? 0 : 1}) rotate(${sealGone ? '30deg' : '0deg'})`,
              opacity:    sealGone ? 0 : 1,
              transition: 'transform 0.5s ease, opacity 0.4s ease',
            }}
          >
            <WaxSeal />
          </div>

          {/* Envelope label */}
          <div
            className="absolute bottom-4 left-0 right-0 flex justify-center z-10 pointer-events-none"
            style={{
              opacity:    labelHide ? 0 : 1,
              transition: 'opacity 0.35s ease',
            }}
          >
            <div className="font-amiri text-center"
              style={{ direction: 'rtl', color: 'rgba(80,50,0,0.5)', fontSize: '0.8rem', letterSpacing: '2px' }}>
              عِيدٌ مُبَارَكٌ
            </div>
          </div>

        </div>{/* end envelope body */}

      </div>
    </>
  )
}

export default EnvelopeScene
