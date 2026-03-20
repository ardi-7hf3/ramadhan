import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { WaxSeal, EnvelopePattern } from './SvgIcons.jsx'
import GreetingCard from './GreetingCard.jsx'

/**
 * ALUR ANIMASI TUTUP KARTU:
 *
 *  FULLSCREEN
 *    ↓ klik close
 *  RETURNING    (300ms)  — overlay fade out
 *    ↓
 *  ABOVE_FLAP   (380ms)  — stage card muncul di ATAS amplop (z:20, flap masih terbuka)
 *    ↓
 *  ENTERING     (700ms)  — kartu meluncur masuk ke dalam amplop (z:20, TERLIHAT JELAS)
 *    ↓
 *  CLOSING_FLAP (650ms)  — flap menutup dari atas (setelah kartu sudah di dalam)
 *    ↓
 *  IDLE                  — amplop tertutup rapat
 *
 * z-index hierarchy:
 *   stageCard (ABOVE_FLAP+ENTERING) → z:20  ← DI ATAS SEGALANYA
 *   flap                            → z:15  ← di atas body, bawah stageCard
 *   envelope body                   → z:10
 *   inside card                     → z:3   (overflow:hidden)
 */

const PHASE = {
  IDLE:         0,
  OPENING:      1,
  PEEKING:      2,
  FLYING:       3,
  FULLSCREEN:   4,
  RETURNING:    5,
  ABOVE_FLAP:   6,
  ENTERING:     7,
  CLOSING_FLAP: 8,
}

const MemoCard = memo(GreetingCard)

const Envelope = ({
  t,
  envelopeOpen,
  cardViewing,
  onOpenEnvelope,
  onViewCard,
  onCloseCard,
  onShare,
  onSave,
}) => {
  const [phase, setPhase] = useState(PHASE.IDLE)
  const timers   = useRef([])
  const phaseRef = useRef(PHASE.IDLE)

  useEffect(() => { phaseRef.current = phase }, [phase])

  const go = useCallback((nextPhase, delay = 0) => {
    const id = setTimeout(() => setPhase(nextPhase), delay)
    timers.current.push(id)
  }, [])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // ── Buka amplop ──
  useEffect(() => {
    if (!envelopeOpen || phaseRef.current !== PHASE.IDLE) return
    setPhase(PHASE.OPENING)
    go(PHASE.PEEKING, 860)
  }, [envelopeOpen, go])

  // ── Buka kartu fullscreen ──
  useEffect(() => {
    if (!cardViewing || phaseRef.current !== PHASE.PEEKING) return
    setPhase(PHASE.FLYING)
    go(PHASE.FULLSCREEN, 520)
  }, [cardViewing, go])

  // ── Tutup kartu ──
  // Seperti orang sungguhan memasukkan kartu ke amplop:
  // 1. Kartu kecil tampak di atas amplop (flap masih terbuka)
  // 2. Kartu meluncur masuk ke dalam amplop (kartu tetap terlihat, di atas flap)
  // 3. BARU SETELAH kartu masuk, flap menutup dari atas
  useEffect(() => {
    if (cardViewing || phaseRef.current !== PHASE.FULLSCREEN) return
    const T0 = 300   // overlay fade out
    const T1 = 380   // stage card diam di atas flap
    const T2 = 700   // slide kartu masuk ke amplop
    const T3 = 650   // flap menutup
    setPhase(PHASE.RETURNING)
    go(PHASE.ABOVE_FLAP,   T0)
    go(PHASE.ENTERING,     T0 + T1)
    go(PHASE.CLOSING_FLAP, T0 + T1 + T2)
    go(PHASE.IDLE,         T0 + T1 + T2 + T3)
  }, [cardViewing, go])

  const is    = p       => phase === p
  const isAny = (...ps) => ps.includes(phase)

  // Flap terbuka selama kartu masuk, baru menutup di CLOSING_FLAP
  const flapOpen = isAny(
    PHASE.OPENING, PHASE.PEEKING, PHASE.FLYING,
    PHASE.FULLSCREEN, PHASE.RETURNING,
    PHASE.ABOVE_FLAP, PHASE.ENTERING
  )
  const sealGone   = phase >= PHASE.OPENING && !is(PHASE.IDLE)
  const insideShow = phase >= PHASE.OPENING

  // ── Stage card ──
  // z:20 saat ABOVE_FLAP & ENTERING → PASTI di atas flap (z:15) dan envelope (z:10)
  // Kartu terlihat jelas saat di atas amplop dan saat meluncur masuk
  const showStageCard = isAny(PHASE.ABOVE_FLAP, PHASE.ENTERING, PHASE.CLOSING_FLAP)

  const stageZIndex = isAny(PHASE.ABOVE_FLAP, PHASE.ENTERING) ? 20 : 8

  const stageTransform = (() => {
    if (is(PHASE.ABOVE_FLAP))    return 'translateY(0) translateZ(0)'
    if (is(PHASE.ENTERING))      return 'translateY(62%) translateZ(0)'
    if (is(PHASE.CLOSING_FLAP))  return 'translateY(62%) translateZ(0)'
    return 'translateY(0) translateZ(0)'
  })()

  const stageOpacity = (() => {
    if (is(PHASE.ABOVE_FLAP))    return 1
    if (is(PHASE.ENTERING))      return 1   // TETAP TERLIHAT saat meluncur!
    if (is(PHASE.CLOSING_FLAP))  return 0   // baru hilang setelah masuk
    return 0
  })()

  const stageTrans = (() => {
    if (is(PHASE.ABOVE_FLAP))    return 'opacity 0.3s ease'
    if (is(PHASE.ENTERING))      return 'transform 0.65s cubic-bezier(0.4,0,0.55,1)'
    if (is(PHASE.CLOSING_FLAP))  return 'opacity 0.12s ease'
    return 'none'
  })()

  // ── Inside card (overflow:hidden) ──
  const cardInsideTop = (() => {
    switch (phase) {
      case PHASE.PEEKING:
      case PHASE.FLYING:
      case PHASE.FULLSCREEN: return '5%'
      default:               return '10%'
    }
  })()
  const cardInsideOpacity    = is(PHASE.PEEKING) ? 1 : 0
  const cardInsideTransition = is(PHASE.PEEKING)
    ? 'top 0.85s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease 0.05s'
    : 'top 0s, opacity 0s'
  const cardClickable = is(PHASE.PEEKING)

  // ── Overlay ──
  const overlayVisible = isAny(PHASE.FLYING, PHASE.FULLSCREEN, PHASE.RETURNING)
  const overlayFull    = is(PHASE.FULLSCREEN)
  const overlayCardTransform = overlayFull
    ? 'scale(1) translateY(0) translateZ(0)'
    : is(PHASE.FLYING)
      ? 'scale(0.7) translateY(38vh) translateZ(0)'
      : 'scale(0.55) translateY(28vh) translateZ(0)'
  const overlayCardOpacity   = overlayFull ? 1 : 0
  const overlayCardTransition = is(PHASE.RETURNING)
    ? 'transform 0.32s cubic-bezier(0.4,0,1,1), opacity 0.28s ease'
    : 'transform 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.38s ease'

  return (
    <>
      {/* ══════════════════════════════════════════════
          FULLSCREEN OVERLAY
      ══════════════════════════════════════════════ */}
      <div style={{
        position:       'fixed', inset: 0, zIndex: 50,
        display:        'flex', alignItems: 'center', justifyContent: 'center',
        background:     overlayFull ? 'rgba(4,8,20,0.93)' : 'rgba(4,8,20,0)',
        backdropFilter: overlayFull ? 'blur(10px)' : 'blur(0px)',
        transition:     'background 0.4s ease, backdrop-filter 0.4s ease',
        visibility:     overlayVisible ? 'visible' : 'hidden',
        pointerEvents:  overlayFull ? 'auto' : 'none',
      }}>
        {/* Kartu fullscreen */}
        <div style={{
          width:         'min(520px, 92vw)',
          maxHeight:     '88dvh',
          overflowY:     overlayFull ? 'auto' : 'hidden',
          borderRadius:  '16px',
          transform:     overlayCardTransform,
          opacity:       overlayCardOpacity,
          transition:    overlayCardTransition,
          willChange:    'transform, opacity',
          pointerEvents: overlayFull ? 'auto' : 'none',
        }}>
          <MemoCard t={t} />
        </div>

        {/* ── Close button ── */}
        <button
          onClick={onCloseCard}
          style={{
            position:      'fixed', top: '18px', left: '18px',
            width: '44px', height: '44px', borderRadius: '50%',
            background:    'rgba(201,148,26,0.12)',
            border:        '1.5px solid rgba(201,148,26,0.4)',
            color:         '#E8B84B', cursor: 'pointer',
            display:       'flex', alignItems: 'center', justifyContent: 'center',
            opacity:       overlayFull ? 1 : 0,
            transform:     overlayFull ? 'scale(1)' : 'scale(0.75)',
            transition:    'opacity 0.22s ease 0.28s, transform 0.22s ease 0.28s, background 0.18s',
            pointerEvents: overlayFull ? 'auto' : 'none',
            zIndex: 60,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,148,26,0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,148,26,0.12)' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* Share / Save */}
        <div style={{
          position:      'fixed', bottom: '28px', left: '50%',
          transform:     overlayFull
            ? 'translateX(-50%) translateY(0)'
            : 'translateX(-50%) translateY(14px)',
          display:       'flex', gap: '10px',
          opacity:       overlayFull ? 1 : 0,
          transition:    'opacity 0.25s ease 0.32s, transform 0.25s ease 0.32s',
          pointerEvents: overlayFull ? 'auto' : 'none',
          zIndex: 60,
        }}>
          <button onClick={onShare}
            className="btn-gold flex items-center gap-2 font-poppins font-bold uppercase rounded-lg"
            style={{ color:'#1A1005', fontSize:'0.72rem', letterSpacing:'0.9px', padding:'10px 20px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
            </svg>
            {t.btnShare}
          </button>
          <button onClick={onSave}
            className="btn-teal-outline flex items-center gap-2 font-poppins font-semibold uppercase rounded-lg"
            style={{ border:'1.5px solid rgba(15,122,107,0.4)', color:'#12A08E', fontSize:'0.72rem', letterSpacing:'0.9px', padding:'10px 18px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {t.btnSave}
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          ENVELOPE SCENE
      ══════════════════════════════════════════════ */}
      <div className="relative" style={{ width:'min(448px,92vw)', perspective:'1200px' }}>

        {/* ── STAGE CARD ──
         * z:20 saat ABOVE_FLAP & ENTERING → selalu di ATAS flap (z:15) dan envelope (z:10).
         * Saat ABOVE_FLAP : kartu terlihat penuh di atas amplop (flap terbuka)
         * Saat ENTERING   : kartu meluncur masuk ke bawah, TERLIHAT JELAS melewati flap
         * Saat CLOSING_FLAP: kartu sudah di dalam (opacity 0), flap mulai menutup
         */}
        {showStageCard && (
          <div style={{
            position:      'absolute',
            left: '5%',    right: '5%',
            bottom:        '46%',
            zIndex:        stageZIndex,
            transform:     stageTransform,
            opacity:       stageOpacity,
            transition:    stageTrans,
            willChange:    'transform, opacity',
            filter:        'drop-shadow(0 -10px 32px rgba(0,0,0,0.55))',
            pointerEvents: 'none',
          }}>
            <MemoCard t={t} />
          </div>
        )}

        {/* ── ENVELOPE BODY ── z:10 */}
        <div
          className={`relative select-none ${is(PHASE.IDLE) ? 'envelope-hover cursor-pointer' : 'cursor-default'}`}
          onClick={is(PHASE.IDLE) ? onOpenEnvelope : undefined}
          style={{
            paddingTop:   '64%',
            background:   'linear-gradient(162deg,#DEC07A 0%,#C4A15A 48%,#9A7830 100%)',
            boxShadow:    '0 20px 56px rgba(0,0,0,0.6), 0 6px 18px rgba(0,0,0,0.4)',
            borderRadius: '8px 8px 14px 14px',
            zIndex:       10,
          }}
        >
          {/* ── KARTU DI DALAM AMPLOP (overflow:hidden) ── z:3 */}
          <div style={{
            position:      'absolute', inset: 0,
            overflow:      'hidden',
            zIndex:        3,
            pointerEvents: 'none',
            borderRadius:  'inherit',
          }}>
            <div
              onClick={cardClickable ? onViewCard : undefined}
              style={{
                position:      'absolute',
                left: '5%', right: '5%',
                top:           cardInsideTop,
                pointerEvents: cardClickable ? 'auto' : 'none',
                cursor:        cardClickable ? 'pointer' : 'default',
                opacity:       cardInsideOpacity,
                transition:    cardInsideTransition,
                willChange:    'top, opacity',
                filter:        'drop-shadow(0 4px 18px rgba(0,0,0,0.45))',
              }}
            >
              <MemoCard t={t} />
            </div>
          </div>

          {/* Inside pocket */}
          <div style={{
            position:'absolute', inset:0, zIndex:1,
            borderRadius:'8px 8px 14px 14px',
            background:'linear-gradient(180deg,#EACA6C 0%,#B8902A 100%)',
            opacity:    insideShow ? 1 : 0,
            transition: 'opacity 0.45s ease 0.35s',
            pointerEvents:'none',
          }}/>

          {/* Islamic pattern */}
          <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none"
            style={{ zIndex:2, opacity:0.1 }}>
            <EnvelopePattern />
          </div>

          {/* Side shadows */}
          <div className="absolute inset-0 rounded-lg pointer-events-none" style={{
            zIndex:3,
            background:'linear-gradient(90deg,rgba(0,0,0,0.09) 0%,transparent 16%,transparent 84%,rgba(0,0,0,0.09) 100%)',
          }}/>

          {/* Bottom fold pentagon — z:4 */}
          <div className="absolute inset-0 pointer-events-none" style={{
            zIndex:4,
            background:'linear-gradient(160deg,#B8902A 0%,#C8AA60 30%,#B0882A 50%,#C8AA60 70%,#B8902A 100%)',
            clipPath:'polygon(0 0, 50% 54%, 100% 0, 100% 100%, 0 100%)',
          }}/>

          {/* TOP FLAP — z:15
           * Di bawah stageCard (z:20) tapi di atas envelope body (z:10).
           * Flap TETAP TERBUKA selama ABOVE_FLAP dan ENTERING.
           * Baru menutup di CLOSING_FLAP setelah kartu masuk sepenuhnya.
           */}
          <div style={{
            position:'absolute', inset:0,
            zIndex:          15,
            background:      'linear-gradient(178deg,#DEC07A 0%,#B28C38 60%,#9A7830 100%)',
            clipPath:        'polygon(0 0, 50% 54%, 100% 0)',
            boxShadow:       '0 5px 14px rgba(0,0,0,0.28)',
            transformOrigin: 'top center',
            transformStyle:  'preserve-3d',
            transform:       flapOpen
              ? 'rotateX(-185deg) translateZ(0)'
              : 'rotateX(0deg) translateZ(0)',
            transition:      flapOpen
              ? 'transform 0.72s cubic-bezier(0.4,0,0.2,1)'
              : 'transform 0.65s cubic-bezier(0.4,0,0.2,1)',
            willChange:      'transform',
            pointerEvents:   'none',
          }}>
            <div style={{ position:'absolute', top:'46%', left:'18%', right:'18%', height:'1px', background:'rgba(0,0,0,0.10)' }}/>
            <div style={{ position:'absolute', top:'8px', left:'33%', right:'33%', height:'1px', background:'rgba(255,255,255,0.18)' }}/>
          </div>

          {/* Wax seal */}
          <div style={{
            position:'absolute', top:'50%', left:'50%', zIndex:6,
            transform:  sealGone
              ? 'translate(-50%,-50%) scale(0) rotate(30deg)'
              : 'translate(-50%,-50%) scale(1) rotate(0deg)',
            opacity:    sealGone ? 0 : 1,
            transition: 'transform 0.4s ease, opacity 0.35s ease',
          }}>
            <WaxSeal />
          </div>

          {/* Arabic label */}
          <div style={{
            position:'absolute', bottom:'18px', left:0, right:0, zIndex:6,
            display:'flex', justifyContent:'center',
            opacity:    sealGone ? 0 : 1,
            transition: 'opacity 0.28s ease',
            pointerEvents:'none',
          }}>
            <span className="font-amiri" style={{
              direction:'rtl', color:'rgba(70,40,0,0.45)',
              fontSize:'0.85rem', letterSpacing:'2.5px',
            }}>عِيدٌ مُبَارَكٌ</span>
          </div>
        </div>{/* /envelope body */}

        {/* ── HINT teks ── */}
        <div style={{
          position:   'absolute', top: '-28px', left:0, right:0,
          display:    'flex', justifyContent:'center',
          zIndex:     30, pointerEvents:'none',
        }}>
          <span style={{
            fontFamily:    'Poppins,sans-serif',
            fontSize:      '0.63rem', fontWeight: 600,
            color:         'rgba(245,216,122,0.85)',
            letterSpacing: '1.5px', whiteSpace: 'nowrap',
            opacity:       is(PHASE.PEEKING) ? 1 : 0,
            transition:    'opacity 0.3s ease 0.5s',
            animation:     is(PHASE.PEEKING) ? 'hintBounce 2s ease-in-out infinite' : 'none',
          }}>
            {t.tapToOpen || '↑ Klik kartu untuk membuka'}
          </span>
        </div>

      </div>
    </>
  )
}

export default Envelope
