import { useState, useEffect, useRef } from 'react'
import { WaxSeal, EnvelopePattern } from './SvgIcons.jsx'
import GreetingCard from './GreetingCard.jsx'

/**
 * ANIMATION STATES:
 *  idle      — amplop tertutup, kartu tersembunyi
 *  opening   — flap terbuka, kartu naik dari dalam amplop
 *  idle-open — kartu mengambang di atas amplop, siap diklik
 *  flying    — kartu terbang ke tengah layar (fullscreen view)
 *  closing   — kartu terbang masuk ke amplop, flap menutup
 */

const PHASE = {
  IDLE:       'idle',       // tertutup
  OPENING:    'opening',    // amplop terbuka, kartu naik
  IDLE_OPEN:  'idle_open',  // kartu mengambang di atas amplop
  FLYING:     'flying',     // kartu terbang ke fullscreen
  FULLSCREEN: 'fullscreen', // kartu fullscreen
  CLOSING:    'closing',    // kartu masuk amplop lagi
}

const Envelope = ({ t, envelopeOpen, cardViewing, onOpenEnvelope, onViewCard, onCloseCard, onShare, onSave }) => {
  const [phase, setPhase] = useState(PHASE.IDLE)
  const timers = useRef([])

  const after = (fn, ms) => {
    const id = setTimeout(fn, ms)
    timers.current.push(id)
    return id
  }

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // ── Buka amplop ──
  useEffect(() => {
    if (!envelopeOpen || phase !== PHASE.IDLE) return
    setPhase(PHASE.OPENING)
    after(() => setPhase(PHASE.IDLE_OPEN), 1600)
  }, [envelopeOpen, phase])

  // ── User klik kartu → terbang ke fullscreen ──
  useEffect(() => {
    if (!cardViewing || phase !== PHASE.IDLE_OPEN) return
    setPhase(PHASE.FLYING)
    after(() => setPhase(PHASE.FULLSCREEN), 700)
  }, [cardViewing, phase])

  // ── User tutup fullscreen → kartu kembali ke amplop ──
  useEffect(() => {
    if (cardViewing || phase !== PHASE.FULLSCREEN) return
    setPhase(PHASE.CLOSING)
    // kartu terbang turun ke amplop
    after(() => {
      // amplop flap menutup lagi
      setPhase(PHASE.IDLE_OPEN)
    }, 900)
  }, [cardViewing, phase])

  const flapOpen   = phase !== PHASE.IDLE && phase !== PHASE.CLOSING
  const sealGone   = phase !== PHASE.IDLE
  const cardUp     = phase === PHASE.IDLE_OPEN || phase === PHASE.FLYING || phase === PHASE.FULLSCREEN || phase === PHASE.CLOSING
  const cardFull   = phase === PHASE.FULLSCREEN
  const cardFlying = phase === PHASE.FLYING
  const cardReturn = phase === PHASE.CLOSING

  return (
    <>
      {/* ═══════════════════════════════════════════════════
          FULLSCREEN CARD OVERLAY
      ═══════════════════════════════════════════════════ */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          background:   cardFull ? 'rgba(4,8,20,0.92)' : 'rgba(4,8,20,0)',
          backdropFilter: cardFull ? 'blur(8px)' : 'blur(0px)',
          transition:   'background 0.5s ease, backdrop-filter 0.5s ease',
          pointerEvents: cardFull ? 'auto' : 'none',
        }}
      >
        {/* Card in fullscreen — scales up from envelope position */}
        <div
          style={{
            width:      'min(520px, 92vw)',
            maxHeight:  '88dvh',
            overflowY:  'auto',
            transform:  cardFull
              ? 'scale(1) translateY(0)'
              : cardFlying
                ? 'scale(0.6) translateY(40vh)'
                : cardReturn
                  ? 'scale(0.5) translateY(50vh)'
                  : 'scale(0.5) translateY(50vh)',
            opacity:    cardFull ? 1 : cardFlying ? 0.5 : 0,
            transition: 'transform 0.65s cubic-bezier(0.22,1,0.36,1), opacity 0.5s ease',
            borderRadius: '16px',
            pointerEvents: cardFull ? 'auto' : 'none',
          }}
        >
          <GreetingCard t={t} visible={cardFull} />
        </div>

        {/* Close button */}
        <button
          onClick={onCloseCard}
          style={{
            position:   'fixed',
            top:        '20px',
            right:      '20px',
            width:      '44px',
            height:     '44px',
            borderRadius: '50%',
            background: 'rgba(201,148,26,0.15)',
            border:     '1.5px solid rgba(201,148,26,0.4)',
            color:      '#E8B84B',
            fontSize:   '1.2rem',
            cursor:     'pointer',
            display:    'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity:    cardFull ? 1 : 0,
            transition: 'opacity 0.3s ease 0.3s, background 0.2s ease',
            pointerEvents: cardFull ? 'auto' : 'none',
            zIndex:     60,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,148,26,0.35)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,148,26,0.15)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* Action buttons inside fullscreen */}
        <div
          style={{
            position:   'fixed',
            bottom:     '28px',
            left:       '50%',
            transform:  'translateX(-50%)',
            display:    'flex',
            gap:        '12px',
            opacity:    cardFull ? 1 : 0,
            transition: 'opacity 0.3s ease 0.4s',
            pointerEvents: cardFull ? 'auto' : 'none',
            zIndex:     60,
          }}
        >
          <button onClick={onShare} className="btn-gold flex items-center gap-2 font-poppins font-bold uppercase rounded-lg"
            style={{ color:'#1A1005', fontSize:'0.72rem', letterSpacing:'0.9px', padding:'10px 20px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
            </svg>
            {t.btnShare}
          </button>
          <button onClick={onSave} className="btn-teal-outline flex items-center gap-2 font-poppins font-semibold uppercase rounded-lg"
            style={{ border:'1.5px solid rgba(15,122,107,0.4)', color:'#12A08E', fontSize:'0.72rem', letterSpacing:'0.9px', padding:'10px 18px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {t.btnSave}
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          ENVELOPE + FLOATING CARD SCENE
      ═══════════════════════════════════════════════════ */}
      <div
        className="relative"
        style={{ width:'min(448px,92vw)', perspective:'1200px' }}
      >

        {/* ── CARD floating above envelope ── */}
        <div
          onClick={phase === PHASE.IDLE_OPEN ? onViewCard : undefined}
          style={{
            position:    'absolute',
            left:        '50%',
            /* start inside envelope (bottom=0, translateY=0 = at envelope top)
               rise to bottom=100%+16px when card-up */
            bottom:      cardUp ? 'calc(100% + 16px)' : '10%',
            transform:   `translateX(-50%) ${
              cardReturn ? 'translateY(80%) scale(0.85)' :
              cardFlying ? 'translateY(-20px) scale(0.92)' :
              cardUp     ? 'translateY(0)'
                         : 'translateY(20px)'
            }`,
            width:       '92%',
            opacity:     cardUp && !cardFlying ? 1 : cardFlying ? 0.4 : 0,
            zIndex:      cardUp ? 30 : 5,
            cursor:      phase === PHASE.IDLE_OPEN ? 'pointer' : 'default',
            transition:  [
              'bottom 0.9s cubic-bezier(0.22,1,0.36,1)',
              'transform 0.9s cubic-bezier(0.22,1,0.36,1)',
              'opacity 0.5s ease',
            ].join(', '),
            filter:      'drop-shadow(0 -8px 32px rgba(0,0,0,0.5))',
            pointerEvents: phase === PHASE.IDLE_OPEN ? 'auto' : 'none',
          }}
        >
          <GreetingCard t={t} visible={cardUp} />

          {/* "Tap to open" hint on card */}
          {phase === PHASE.IDLE_OPEN && (
            <div style={{
              position:   'absolute',
              bottom:     '-32px',
              left:       '50%',
              transform:  'translateX(-50%)',
              whiteSpace: 'nowrap',
              fontFamily: 'Poppins,sans-serif',
              fontSize:   '0.68rem',
              fontWeight: 600,
              color:      'rgba(245,216,122,0.7)',
              letterSpacing: '1.5px',
              animation:  'hintBounce 2s ease-in-out infinite',
            }}>
              {t.tapToOpen || '↑ Klik kartu untuk membuka'}
            </div>
          )}
        </div>

        {/* ── ENVELOPE BODY ── */}
        <div
          className={`relative select-none ${phase === PHASE.IDLE ? 'envelope-hover cursor-pointer' : 'cursor-default'}`}
          onClick={phase === PHASE.IDLE ? onOpenEnvelope : undefined}
          style={{
            paddingTop:   '64%',
            background:   'linear-gradient(162deg,#DEC07A 0%,#C4A15A 48%,#9A7830 100%)',
            boxShadow:    '0 24px 64px rgba(0,0,0,0.62), 0 8px 22px rgba(0,0,0,0.42)',
            borderRadius: '8px 8px 14px 14px',
            zIndex:       10,
          }}
        >
          {/* Inside pocket */}
          <div
            className="env-inside absolute inset-0 rounded-lg pointer-events-none"
            style={{
              zIndex:     1,
              background: 'linear-gradient(180deg,#EACA6C 0%,#B8902A 100%)',
              opacity:    sealGone ? 1 : 0,
              transition: 'opacity 0.5s ease 0.5s',
            }}
          />

          {/* Pattern */}
          <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none" style={{ zIndex:2, opacity:0.1 }}>
            <EnvelopePattern />
          </div>

          {/* Side shadows */}
          <div className="absolute inset-0 rounded-lg pointer-events-none" style={{
            zIndex:3, background:'linear-gradient(90deg,rgba(0,0,0,0.09) 0%,transparent 16%,transparent 84%,rgba(0,0,0,0.09) 100%)'
          }}/>

          {/* Left fold */}
          <div className="absolute bottom-0 left-0 pointer-events-none" style={{
            zIndex:4, width:'52%', height:'56%',
            background:'linear-gradient(138deg,#C8AA60 0%,#9A7830 100%)',
            clipPath:'polygon(0 100%,0 0,100% 100%)',
          }}/>

          {/* Right fold */}
          <div className="absolute bottom-0 right-0 pointer-events-none" style={{
            zIndex:4, width:'52%', height:'56%',
            background:'linear-gradient(222deg,#C8AA60 0%,#9A7830 100%)',
            clipPath:'polygon(100% 100%,100% 0,0 100%)',
          }}/>

          {/* TOP FLAP */}
          <div
            className="env-flap absolute top-0 left-0 right-0 pointer-events-none"
            style={{
              zIndex:     5,
              height:     '54%',
              background: 'linear-gradient(178deg,#DEC07A 0%,#B28C38 100%)',
              clipPath:   'polygon(0 0,50% 100%,100% 0)',
              boxShadow:  '0 5px 14px rgba(0,0,0,0.28)',
              transform:  flapOpen ? 'rotateX(-185deg)' : 'rotateX(0deg)',
              transformOrigin: 'top center',
              transformStyle: 'preserve-3d',
              transition: flapOpen
                ? 'transform 0.75s cubic-bezier(0.4,0,0.2,1)'
                : 'transform 0.65s cubic-bezier(0.4,0,0.2,1) 0.2s',
            }}
          >
            <div className="absolute bottom-0 left-1/4 right-1/4 h-px" style={{ background:'rgba(0,0,0,0.12)' }}/>
            <div className="absolute top-2 left-1/3 right-1/3 h-px"   style={{ background:'rgba(255,255,255,0.18)' }}/>
          </div>

          {/* Wax seal */}
          <div
            className="seal-wrap absolute top-1/2 left-1/2"
            style={{
              zIndex:    6,
              transform: sealGone
                ? 'translate(-50%,-50%) scale(0) rotate(30deg)'
                : 'translate(-50%,-50%) scale(1) rotate(0deg)',
              opacity:    sealGone ? 0 : 1,
              transition: 'transform 0.45s ease, opacity 0.4s ease',
            }}
          >
            <WaxSeal />
          </div>

          {/* Arabic label */}
          <div
            className="absolute bottom-5 left-0 right-0 flex justify-center pointer-events-none"
            style={{
              zIndex:   6,
              opacity:  sealGone ? 0 : 1,
              transition: 'opacity 0.3s ease',
            }}
          >
            <span className="font-amiri" style={{
              direction:'rtl', color:'rgba(70,40,0,0.45)',
              fontSize:'0.85rem', letterSpacing:'2.5px',
            }}>عِيدٌ مُبَارَكٌ</span>
          </div>

        </div>{/* /envelope body */}
      </div>
    </>
  )
}

export default Envelope
