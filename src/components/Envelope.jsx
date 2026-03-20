import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { WaxSeal, EnvelopePattern } from './SvgIcons.jsx'
import GreetingCard from './GreetingCard.jsx'

/**
 * PHASE MACHINE
 * ─────────────────────────────────────────────────────
 * IDLE       → amplop tertutup, segel terlihat
 * OPENING    → flap terbuka (3D flip), segel dissolve
 * PEEKING    → kartu muncul ~40% dari atas amplop
 *              user harus klik kartu untuk lanjut
 * FLYING     → kartu terbang ke tengah layar
 * FULLSCREEN → kartu penuh layar, interaktif
 * RETURNING  → kartu terbang balik ke amplop
 * ─────────────────────────────────────────────────────
 *
 * OPTIMISASI LAG:
 * - Semua animasi HANYA pakai `transform` + `opacity`
 *   (tidak ada transition pada `bottom`, `width`, `height`
 *   karena itu trigger layout reflow = lag)
 * - `will-change: transform, opacity` pada elemen animasi
 * - `translateZ(0)` untuk GPU compositing layer
 * - Fullscreen backdrop pakai `visibility` bukan mount/unmount
 * - GreetingCard di-memoize agar tidak re-render tiap phase
 */

const PHASE = {
  IDLE:       0,
  OPENING:    1,
  PEEKING:    2,  // kartu peek ~40% dari atas amplop
  FLYING:     3,
  FULLSCREEN: 4,
  RETURNING:  5,
}

// Peek offset: berapa % tinggi kartu yang muncul di atas amplop
// Nilai negatif = kartu masih di dalam amplop (overflow hidden)
// translateY(-35%) = 35% dari atas kartu muncul
const PEEK_Y    = '-35%'   // peek state: 35% kartu terlihat
const HIDDEN_Y  = '30%'    // hidden: kartu di dalam amplop
const RISEN_Y   = '-108%'  // fully risen (tidak dipakai lagi — skip ke fullscreen)

// Memoize GreetingCard agar tidak re-render saat phase berubah
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
  const timers            = useRef([])
  const phaseRef          = useRef(PHASE.IDLE)

  // Sync ref agar closure di setTimeout selalu dapat nilai terbaru
  useEffect(() => { phaseRef.current = phase }, [phase])

  const go = useCallback((nextPhase, delay = 0) => {
    const id = setTimeout(() => setPhase(nextPhase), delay)
    timers.current.push(id)
  }, [])

  // Cleanup timers on unmount
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // ── Trigger: amplop dibuka ──
  useEffect(() => {
    if (!envelopeOpen || phaseRef.current !== PHASE.IDLE) return
    setPhase(PHASE.OPENING)
    // Setelah flap terbuka (750ms), kartu mulai peek
    go(PHASE.PEEKING, 820)
  }, [envelopeOpen, go])

  // ── Trigger: user klik kartu (dari App) ──
  useEffect(() => {
    if (!cardViewing || phaseRef.current !== PHASE.PEEKING) return
    setPhase(PHASE.FLYING)
    go(PHASE.FULLSCREEN, 550)
  }, [cardViewing, go])

  // ── Trigger: user tutup fullscreen ──
  useEffect(() => {
    if (cardViewing || phaseRef.current !== PHASE.FULLSCREEN) return
    setPhase(PHASE.RETURNING)
    // kartu kembali ke peek setelah animasi return
    go(PHASE.PEEKING, 750)
  }, [cardViewing, go])

  // ── Derived booleans (tidak pakai useMemo — cukup murah) ──
  const is         = (p)  => phase === p
  const isAny      = (...ps) => ps.includes(phase)

  const flapOpen   = phase >= PHASE.OPENING
  const sealGone   = phase >= PHASE.OPENING
  const insideShow = phase >= PHASE.OPENING

  // Posisi kartu (transform only — tidak trigger reflow)
  const cardTransY = (() => {
    if (is(PHASE.IDLE))       return HIDDEN_Y
    if (is(PHASE.OPENING))    return HIDDEN_Y       // masih tersembunyi saat flap buka
    if (is(PHASE.PEEKING))    return PEEK_Y         // peek
    if (is(PHASE.FLYING))     return '-120%'        // terbang ke atas layar
    if (is(PHASE.FULLSCREEN)) return '-120%'        // sama — kartu fullscreen pakai overlay
    if (is(PHASE.RETURNING))  return PEEK_Y         // balik ke peek
    return HIDDEN_Y
  })()

  const cardOpacity = isAny(PHASE.IDLE, PHASE.OPENING) ? 0 : 1
  const cardScale   = is(PHASE.FLYING) ? 0.9 : 1
  const cardCursor  = is(PHASE.PEEKING) ? 'pointer' : 'default'
  const cardEvents  = is(PHASE.PEEKING) ? 'auto' : 'none'

  // Fullscreen overlay
  const showOverlay = isAny(PHASE.FLYING, PHASE.FULLSCREEN, PHASE.RETURNING)
  const overlayFull = is(PHASE.FULLSCREEN)

  return (
    <>
      {/* ═══════════════════════════════════════════════
          FULLSCREEN CARD OVERLAY
          visibility (not display) agar tidak unmount
          dan tidak trigger re-render GreetingCard
      ═══════════════════════════════════════════════ */}
      <div
        style={{
          position:   'fixed',
          inset:      0,
          zIndex:     50,
          display:    'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:     overlayFull ? 'rgba(4,8,20,0.93)' : 'rgba(4,8,20,0)',
          backdropFilter: overlayFull ? 'blur(10px)' : 'blur(0px)',
          transition: 'background 0.45s ease, backdrop-filter 0.45s ease',
          visibility: showOverlay ? 'visible' : 'hidden',
          pointerEvents: overlayFull ? 'auto' : 'none',
          willChange: 'background',
        }}
      >
        {/* Card inside overlay */}
        <div
          style={{
            width:       'min(520px, 92vw)',
            maxHeight:   '88dvh',
            overflowY:   overlayFull ? 'auto' : 'hidden',
            borderRadius:'16px',
            transform:   overlayFull
              ? 'translateZ(0) scale(1) translateY(0)'
              : is(PHASE.RETURNING)
                ? 'translateZ(0) scale(0.7) translateY(35vh)'
                : 'translateZ(0) scale(0.75) translateY(30vh)',
            opacity:     overlayFull ? 1 : 0,
            transition:  'transform 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease',
            willChange:  'transform, opacity',
            pointerEvents: overlayFull ? 'auto' : 'none',
          }}
        >
          <MemoCard t={t} visible={overlayFull} />
        </div>

        {/* Close ✕ button */}
        <button
          onClick={onCloseCard}
          style={{
            position:       'fixed',
            top:            '18px',
            right:          '18px',
            width:          '44px',
            height:         '44px',
            borderRadius:   '50%',
            background:     'rgba(201,148,26,0.12)',
            border:         '1.5px solid rgba(201,148,26,0.4)',
            color:          '#E8B84B',
            cursor:         'pointer',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            opacity:        overlayFull ? 1 : 0,
            transform:      overlayFull ? 'scale(1)' : 'scale(0.8)',
            transition:     'opacity 0.25s ease 0.3s, transform 0.25s ease 0.3s, background 0.2s ease',
            pointerEvents:  overlayFull ? 'auto' : 'none',
            zIndex:         60,
            willChange:     'opacity, transform',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,148,26,0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,148,26,0.12)' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* Share / Save buttons */}
        <div
          style={{
            position:      'fixed',
            bottom:        '28px',
            left:          '50%',
            transform:     overlayFull
              ? 'translateX(-50%) translateY(0)'
              : 'translateX(-50%) translateY(16px)',
            display:       'flex',
            gap:           '10px',
            opacity:       overlayFull ? 1 : 0,
            transition:    'opacity 0.25s ease 0.35s, transform 0.25s ease 0.35s',
            pointerEvents: overlayFull ? 'auto' : 'none',
            zIndex:        60,
            willChange:    'opacity, transform',
          }}
        >
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

      {/* ═══════════════════════════════════════════════
          ENVELOPE SCENE
      ═══════════════════════════════════════════════ */}
      <div
        className="relative"
        style={{
          width:      'min(448px, 92vw)',
          perspective:'1200px',
          // overflow hidden di sini untuk clip kartu yang peek
          // tapi hanya bagian BAWAH amplop yang meng-clip (top = terbuka)
        }}
      >

        {/* ── CARD PEEK WRAPPER ──
            Ini yang mengatur animasi naik/turun kartu.
            overflow:hidden di wrapper ini memastikan kartu
            tidak terlihat saat masih di dalam amplop.
            Wrapper setinggi amplop + ruang peek di atas.
        ── */}
        <div
          style={{
            position: 'absolute',
            left:     0,
            right:    0,
            // Mulai dari sedikit di dalam amplop sampai ke atas
            top:      '-45%',   // ruang untuk peek
            bottom:   0,
            overflow: 'hidden', // clip kartu saat di dalam
            zIndex:   25,
            pointerEvents: 'none',
          }}
        >
          {/* Kartu — bergerak via translateY saja (GPU only, no reflow) */}
          <div
            onClick={is(PHASE.PEEKING) ? onViewCard : undefined}
            style={{
              position:  'absolute',
              left:      '50%',
              bottom:    0,         // anchor di bawah wrapper
              width:     '92%',
              transform: `translateX(-50%) translateY(${cardTransY}) scale(${cardScale}) translateZ(0)`,
              opacity:   cardOpacity,
              cursor:    cardCursor,
              pointerEvents: cardEvents,
              transition: [
                `transform ${is(PHASE.OPENING) ? '0s' : is(PHASE.PEEKING) || is(PHASE.RETURNING) ? '0.75s cubic-bezier(0.22,1,0.36,1)' : '0.5s cubic-bezier(0.22,1,0.36,1)'}`,
                `opacity ${is(PHASE.OPENING) ? '0.35s ease' : '0.4s ease'}`,
              ].join(', '),
              willChange: 'transform, opacity',
              filter:    'drop-shadow(0 -6px 24px rgba(0,0,0,0.5))',
            }}
          >
            <MemoCard t={t} visible={is(PHASE.PEEKING)} />

            {/* Hint tap */}
            <div
              style={{
                position:   'absolute',
                bottom:     '-30px',
                left:       '50%',
                transform:  'translateX(-50%)',
                whiteSpace: 'nowrap',
                fontFamily: 'Poppins,sans-serif',
                fontSize:   '0.65rem',
                fontWeight: 600,
                color:      'rgba(245,216,122,0.75)',
                letterSpacing: '1.5px',
                opacity:    is(PHASE.PEEKING) ? 1 : 0,
                transition: 'opacity 0.3s ease 0.4s',
                animation:  is(PHASE.PEEKING) ? 'hintBounce 2s ease-in-out infinite' : 'none',
                pointerEvents: 'none',
              }}
            >
              {t.tapToOpen || '↑ Klik kartu untuk membuka'}
            </div>
          </div>
        </div>

        {/* ── ENVELOPE BODY ── */}
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
          {/* Inside pocket */}
          <div
            style={{
              position:   'absolute',
              inset:      0,
              zIndex:     1,
              borderRadius: '8px 8px 14px 14px',
              background: 'linear-gradient(180deg,#EACA6C 0%,#B8902A 100%)',
              opacity:    insideShow ? 1 : 0,
              transition: 'opacity 0.5s ease 0.4s',
              pointerEvents: 'none',
              willChange: 'opacity',
            }}
          />

          {/* Islamic pattern — static, no animation */}
          <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none"
            style={{ zIndex:2, opacity:0.1 }}>
            <EnvelopePattern />
          </div>

          {/* Side shadows */}
          <div className="absolute inset-0 rounded-lg pointer-events-none" style={{
            zIndex:3,
            background:'linear-gradient(90deg,rgba(0,0,0,0.09) 0%,transparent 16%,transparent 84%,rgba(0,0,0,0.09) 100%)',
          }}/>

          {/* Left fold triangle */}
          <div className="absolute bottom-0 left-0 pointer-events-none" style={{
            zIndex:4, width:'52%', height:'56%',
            background:'linear-gradient(138deg,#C8AA60 0%,#9A7830 100%)',
            clipPath:'polygon(0 100%,0 0,100% 100%)',
          }}/>

          {/* Right fold triangle */}
          <div className="absolute bottom-0 right-0 pointer-events-none" style={{
            zIndex:4, width:'52%', height:'56%',
            background:'linear-gradient(222deg,#C8AA60 0%,#9A7830 100%)',
            clipPath:'polygon(100% 100%,100% 0,0 100%)',
          }}/>

          {/* TOP FLAP — GPU accelerated */}
          <div
            style={{
              position:        'absolute',
              top:             0, left:0, right:0,
              zIndex:          5,
              height:          '54%',
              background:      'linear-gradient(178deg,#DEC07A 0%,#B28C38 100%)',
              clipPath:        'polygon(0 0,50% 100%,100% 0)',
              boxShadow:       '0 5px 14px rgba(0,0,0,0.28)',
              transformOrigin: 'top center',
              transformStyle:  'preserve-3d',
              transform:       flapOpen ? 'rotateX(-185deg) translateZ(0)' : 'rotateX(0deg) translateZ(0)',
              transition:      flapOpen
                ? 'transform 0.72s cubic-bezier(0.4,0,0.2,1)'
                : 'transform 0.6s cubic-bezier(0.4,0,0.2,1) 0.15s',
              willChange:      'transform',
              pointerEvents:   'none',
            }}
          >
            <div style={{ position:'absolute', bottom:0, left:'25%', right:'25%', height:'1px', background:'rgba(0,0,0,0.12)' }}/>
            <div style={{ position:'absolute', top:'8px', left:'33%', right:'33%', height:'1px', background:'rgba(255,255,255,0.18)' }}/>
          </div>

          {/* Wax seal — GPU */}
          <div
            style={{
              position:   'absolute',
              top:        '50%', left:'50%',
              zIndex:     6,
              transform:  sealGone
                ? 'translate(-50%,-50%) scale(0) rotate(30deg) translateZ(0)'
                : 'translate(-50%,-50%) scale(1) rotate(0deg) translateZ(0)',
              opacity:    sealGone ? 0 : 1,
              transition: 'transform 0.42s ease, opacity 0.38s ease',
              willChange: 'transform, opacity',
            }}
          >
            <WaxSeal />
          </div>

          {/* Arabic label */}
          <div
            style={{
              position:   'absolute',
              bottom:     '18px', left:0, right:0,
              zIndex:     6,
              display:    'flex',
              justifyContent: 'center',
              opacity:    sealGone ? 0 : 1,
              transition: 'opacity 0.28s ease',
              pointerEvents: 'none',
              willChange: 'opacity',
            }}
          >
            <span className="font-amiri" style={{
              direction:'rtl', color:'rgba(70,40,0,0.45)',
              fontSize:'0.85rem', letterSpacing:'2.5px',
            }}>
              عِيدٌ مُبَارَكٌ
            </span>
          </div>

        </div>{/* /envelope body */}
      </div>
    </>
  )
}

export default Envelope
