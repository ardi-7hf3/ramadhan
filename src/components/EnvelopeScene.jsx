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

// ── Mini card preview (peek dari amplop — hanya ornamen & judul) ──
const CardPeek = () => (
  <div
    style={{
      background: 'linear-gradient(155deg, #FFFCF0 0%, #FDF5DA 42%, #F5E8BC 100%)',
      border:     '1px solid rgba(201,148,26,0.25)',
      borderRadius: '10px 10px 0 0',
      boxShadow:  '0 -8px 32px rgba(0,0,0,0.35)',
      padding:    '16px 20px 8px',
      display:    'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
    }}
  >
    {/* top ornament line */}
    <div style={{
      width: '60%', height: '1px',
      background: 'linear-gradient(90deg, transparent, rgba(201,148,26,0.5), transparent)',
    }} />
    {/* gold shimmer title hint */}
    <div style={{
      fontFamily: 'Poppins, sans-serif',
      fontWeight: 800,
      fontSize:   'clamp(0.85rem, 3vw, 1.1rem)',
      background: 'linear-gradient(90deg, #8B6310, #F5D87A, #C9941A, #F5D87A, #8B6310)',
      backgroundSize: '200% auto',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor:  'transparent',
      backgroundClip: 'text',
      animation: 'goldShimmer 3s linear infinite',
      letterSpacing: '1px',
    }}>
      Minal Aaidiin Wal Faaiziin
    </div>
    {/* bottom ornament dots */}
    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width: i === 1 ? '6px' : '4px',
          height: i === 1 ? '6px' : '4px',
          borderRadius: '50%',
          background: '#C9941A',
          opacity: i === 1 ? 0.8 : 0.4,
        }} />
      ))}
    </div>
  </div>
)

// ═══════════════════════════════════════════
//  CARD MODAL
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
//  ENVELOPE SCENE
// ═══════════════════════════════════════════
const EnvelopeScene = ({ t }) => {
  // envelope states: 'closed' | 'opening' | 'peeking' | 'open' | 'closing'
  const [envState,   setEnvState]   = useState('closed')
  // card peek states: 'hidden' | 'peeking-in' | 'peeked' | 'peeking-out'
  const [peekPhase,  setPeekPhase]  = useState('hidden')
  // modal states
  const [cardPhase,  setCardPhase]  = useState('hidden')
  const [flapOpen,   setFlapOpen]   = useState(false)
  const [sealGone,   setSealGone]   = useState(false)
  const [insideShow, setInsideShow] = useState(false)
  const [labelHide,  setLabelHide]  = useState(false)
  const timers = useRef([])

  const after = (fn, ms) => {
    const id = setTimeout(fn, ms)
    timers.current.push(id)
  }

  // ── OPEN sequence ──
  const handleOpen = useCallback(() => {
    if (envState !== 'closed') return
    setEnvState('opening')

    // 1. flap opens
    after(() => setFlapOpen(true),    80)
    // 2. seal dissolves
    after(() => setSealGone(true),   180)
    // 3. label fades
    after(() => setLabelHide(true),  300)
    // 4. inside colour shows
    after(() => setInsideShow(true), 560)
    // 5. card peeks out (keluar setengah)
    after(() => {
      setEnvState('peeking')
      setPeekPhase('peeking-in')
    }, 680)
    // 6. card fully peeked — pause sebentar biar keliatan
    after(() => setPeekPhase('peeked'), 680 + 650)
    // 7. kartu naik ke modal
    after(() => {
      setPeekPhase('peeking-out')
      setCardPhase('opening')
      setEnvState('open')
    }, 680 + 650 + 500)
    // 8. card settled in modal
    after(() => {
      setPeekPhase('hidden')
      setCardPhase('open')
    }, 680 + 650 + 500 + 650)
  }, [envState])

  // ── CLOSE sequence ──
  const handleClose = useCallback(() => {
    if (envState !== 'open') return

    // 1. modal card sinks
    setCardPhase('closing')

    after(() => {
      setCardPhase('hidden')
      setEnvState('closing')
      setInsideShow(false)

      after(() => setFlapOpen(false),   200)
      after(() => {
        setSealGone(false)
        setLabelHide(false)
      }, 520)
      after(() => setEnvState('closed'), 950)
    }, 520)
  }, [envState])

  const isClickable = envState === 'closed'

  // peek card translateY: hidden=100%, peeking-in → -50%, peeked → -50%, peeking-out → -120%
  const peekY = {
    hidden:      '100%',
    'peeking-in':'−50%',   // akan pakai nilai nyata di bawah
    peeked:      '-50%',
    'peeking-out':'-130%',
  }

  const cardTranslateY =
    peekPhase === 'hidden'       ? '100%'   :
    peekPhase === 'peeking-in'   ? '-48%'   :
    peekPhase === 'peeked'       ? '-48%'   :
    peekPhase === 'peeking-out'  ? '-130%'  : '100%'

  const cardOpacity =
    peekPhase === 'hidden'      ? 0 :
    peekPhase === 'peeking-out' ? 0 : 1

  const cardTransition =
    peekPhase === 'peeking-in'  ? 'transform 0.65s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease' :
    peekPhase === 'peeked'      ? 'none' :
    peekPhase === 'peeking-out' ? 'transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease' :
    'none'

  return (
    <>
      <CardModal t={t} phase={cardPhase} onClose={handleClose} />

      <div
        className={`envelope-scene ${isClickable ? 'envelope-hover cursor-pointer' : 'cursor-default'}`}
        onClick={isClickable ? handleOpen : undefined}
        style={{ perspective: '1200px', width: 'clamp(280px, 75vw, 420px)' }}
      >
        {/* Hint */}
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

        {/* ── Envelope + peek card wrapper (overflow hidden atas, visible bawah) ── */}
        <div style={{ position: 'relative' }}>

          {/* ── PEEK CARD — muncul dari dalam amplop, keluar setengah ── */}
          {peekPhase !== 'hidden' && (
            <div
              style={{
                position:   'absolute',
                bottom:     0,
                left:       '50%',
                transform:  `translateX(-50%) translateY(${cardTranslateY})`,
                opacity:    cardOpacity,
                transition: cardTransition,
                width:      '88%',
                zIndex:     5,
                pointerEvents: 'none',
              }}
            >
              <CardPeek />
            </div>
          )}

          {/* ── Envelope body ── */}
          <div
            className="relative rounded-lg"
            style={{
              position:    'relative',
              zIndex:      10,
              paddingTop:  '65%',
              background:  'linear-gradient(160deg, #DEC07A 0%, #C4A15A 50%, #9A7830 100%)',
              boxShadow:   '0 24px 60px rgba(0,0,0,0.6), 0 8px 20px rgba(0,0,0,0.4)',
              borderRadius:'8px 8px 12px 12px',
              overflow:    'visible',
            }}
          >
            {/* Inside */}
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                background: 'linear-gradient(180deg, #EDD58A 0%, #C8A040 100%)',
                opacity:    insideShow ? 1 : 0,
                transition: 'opacity 0.4s ease 0.3s',
              }}
            />

            {/* Pattern */}
            <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none" style={{ opacity: 0.1 }}>
              <IslamicPattern />
            </div>

            {/* Left flap */}
            <div className="absolute bottom-0 left-0 pointer-events-none"
              style={{
                width: '52%', height: '55%',
                background: 'linear-gradient(135deg, #C4A15A 0%, #9A7830 100%)',
                clipPath: 'polygon(0 100%, 0 0, 100% 100%)',
              }}
            />

            {/* Right flap */}
            <div className="absolute bottom-0 right-0 pointer-events-none"
              style={{
                width: '52%', height: '55%',
                background: 'linear-gradient(225deg, #C4A15A 0%, #9A7830 100%)',
                clipPath: 'polygon(100% 100%, 100% 0, 0 100%)',
              }}
            />

            {/* Top flap */}
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

            {/* Wax seal */}
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

            {/* Label */}
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
        </div>{/* end relative wrapper */}

      </div>
    </>
  )
}

export default EnvelopeScene
