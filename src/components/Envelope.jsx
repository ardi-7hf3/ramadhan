import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { WaxSeal, EnvelopePattern } from './SvgIcons.jsx'
import GreetingCard from './GreetingCard.jsx'

/**
 * PEEK YANG BENAR
 * ───────────────────────────────────────────────────
 *
 *  ┌─────────────────────┐
 *  │  TOP KARTU (logo,   │  ← nongol sedikit di atas amplop (terlihat)
 *  │  assalamualaikum)   │
 *  ╠═════════════════════╣  ← mulut amplop (garis clip)
 *  │  sisa kartu ...     │  ← tersembunyi di dalam amplop
 *  └─────────────────────┘
 *
 * TEKNIK BARU — dua wrapper terpisah:
 *
 *  1. CARD OUTER: absolute, width = amplop, bottom = 0,
 *     diperpanjang ke atas (height = 200%).
 *     TIDAK ada overflow hidden → kartu bebas bergerak.
 *
 *  2. MASK DIV: absolute, inset = 0 (sama persis amplop),
 *     background = warna amplop, zIndex lebih tinggi dari
 *     kartu tapi lebih rendah dari flap/seal.
 *     → menutupi bagian kartu yang ada di DALAM amplop,
 *       tapi tidak menutupi bagian yang sudah naik ke atas.
 *
 * Dengan ini, kartu bergerak bebas dengan translateY,
 * bagian yang di dalam amplop tertutup mask,
 * bagian yang di atas amplop terlihat. ✓
 */

const PHASE = {
  IDLE:       0,
  OPENING:    1,
  PEEKING:    2,
  FLYING:     3,
  FULLSCREEN: 4,
  RETURNING:  5,
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
  const timers    = useRef([])
  const phaseRef  = useRef(PHASE.IDLE)

  useEffect(() => { phaseRef.current = phase }, [phase])

  const go = useCallback((nextPhase, delay = 0) => {
    const id = setTimeout(() => setPhase(nextPhase), delay)
    timers.current.push(id)
  }, [])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  useEffect(() => {
    if (!envelopeOpen || phaseRef.current !== PHASE.IDLE) return
    setPhase(PHASE.OPENING)
    go(PHASE.PEEKING, 860)
  }, [envelopeOpen, go])

  useEffect(() => {
    if (!cardViewing || phaseRef.current !== PHASE.PEEKING) return
    setPhase(PHASE.FLYING)
    go(PHASE.FULLSCREEN, 520)
  }, [cardViewing, go])

  useEffect(() => {
    if (cardViewing || phaseRef.current !== PHASE.FULLSCREEN) return
    setPhase(PHASE.RETURNING)
    go(PHASE.PEEKING, 720)
  }, [cardViewing, go])

  const is    = p       => phase === p
  const isAny = (...ps) => ps.includes(phase)

  const flapOpen   = phase >= PHASE.OPENING
  const sealGone   = phase >= PHASE.OPENING
  const insideShow = phase >= PHASE.OPENING

  // ── Posisi kartu DI DALAM amplop (clip oleh overflow:hidden) ──
  // Animasi via `top`: dari bawah clip container (tersembunyi) ke atas yang terlihat.
  // Kartu tidak pernah keluar dari batas amplop — ditampilkan melalui bukaan flap.
  const cardInsideTop = (() => {
    switch (phase) {
      case PHASE.IDLE:
      case PHASE.OPENING:    return '110%'   // di bawah area clip → tersembunyi
      case PHASE.PEEKING:    return '5%'     // top kartu muncul di area dalam amplop
      case PHASE.FLYING:
      case PHASE.FULLSCREEN: return '5%'     // tetap, tapi opacity:0 (overlay ambil alih)
      case PHASE.RETURNING:  return '5%'     // kembali peek
      default:               return '110%'
    }
  })()

  const cardInsideOpacity = isAny(PHASE.PEEKING, PHASE.RETURNING) ? 1 : 0
  const cardClickable     = is(PHASE.PEEKING)

  const overlayVisible = isAny(PHASE.FLYING, PHASE.FULLSCREEN, PHASE.RETURNING)
  const overlayFull    = is(PHASE.FULLSCREEN)

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
        willChange:     'background',
      }}>
        {/* Kartu fullscreen */}
        <div style={{
          width:        'min(520px, 92vw)',
          maxHeight:    '88dvh',
          overflowY:    overlayFull ? 'auto' : 'hidden',
          borderRadius: '16px',
          transform:    overlayFull
            ? 'scale(1) translateY(0) translateZ(0)'
            : is(PHASE.RETURNING)
              ? 'scale(0.65) translateY(44vh) translateZ(0)'
              : 'scale(0.7) translateY(38vh) translateZ(0)',
          opacity:      overlayFull ? 1 : 0,
          transition:   'transform 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.38s ease',
          willChange:   'transform, opacity',
          pointerEvents: overlayFull ? 'auto' : 'none',
        }}>
          <MemoCard t={t} visible={overlayFull} />
        </div>

        {/* ── Close — KIRI atas, tidak bentrok lang toggle (kanan) ── */}
        <button
          onClick={onCloseCard}
          style={{
            position:       'fixed',
            top:            '18px',
            left:           '18px',   /* ← kiri, bukan kanan */
            width:          '44px',
            height:         '44px',
            borderRadius:   '50%',
            background:     'rgba(201,148,26,0.12)',
            border:         '1.5px solid rgba(201,148,26,0.4)',
            color:          '#E8B84B',
            cursor:         'pointer',
            display:        'flex', alignItems: 'center', justifyContent: 'center',
            opacity:        overlayFull ? 1 : 0,
            transform:      overlayFull ? 'scale(1) translateZ(0)' : 'scale(0.75) translateZ(0)',
            transition:     'opacity 0.22s ease 0.28s, transform 0.22s ease 0.28s, background 0.18s',
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

        {/* Share / Save */}
        <div style={{
          position:      'fixed', bottom: '28px', left: '50%',
          transform:     overlayFull
            ? 'translateX(-50%) translateY(0) translateZ(0)'
            : 'translateX(-50%) translateY(14px) translateZ(0)',
          display:       'flex', gap: '10px',
          opacity:       overlayFull ? 1 : 0,
          transition:    'opacity 0.25s ease 0.32s, transform 0.25s ease 0.32s',
          pointerEvents: overlayFull ? 'auto' : 'none',
          zIndex:        60, willChange: 'opacity, transform',
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

        {/* ── ENVELOPE BODY ── */}
        <div
          className={`relative select-none ${is(PHASE.IDLE) ? 'envelope-hover cursor-pointer' : 'cursor-default'}`}
          onClick={is(PHASE.IDLE) ? onOpenEnvelope : undefined}
          style={{
            paddingTop:   '64%',
            background:   'linear-gradient(162deg,#DEC07A 0%,#C4A15A 48%,#9A7830 100%)',
            boxShadow:    '0 20px 56px rgba(0,0,0,0.6), 0 6px 18px rgba(0,0,0,0.4)',
            borderRadius: '8px 8px 14px 14px',
            zIndex:       10,   /* z10 > kartu z8 → envelope menutupi bagian kartu yg di dalam ✓ */
          }}
        >
          {/* ── KARTU DI DALAM AMPLOP ──
           * Clip container (overflow:hidden) = kartu tidak pernah keluar dari batas amplop.
           * Kartu dianimasikan via `top`: dari bawah (tersembunyi) naik ke area bukaan flap.
           * z3 → di atas inner pocket/pattern, di bawah side-shadows (z3 DOM-order),
           *        folds (z4), dan flap (z5) → flap menutup kartu saat tertutup ✓.
           */}
          <div style={{
            position:      'absolute',
            inset:         0,
            overflow:      'hidden',
            zIndex:        3,
            pointerEvents: 'none',
            borderRadius:  'inherit',
          }}>
            <div
              onClick={cardClickable ? onViewCard : undefined}
              style={{
                position:      'absolute',
                left:          '5%',
                right:         '5%',
                top:           cardInsideTop,
                pointerEvents: cardClickable ? 'auto' : 'none',
                cursor:        cardClickable ? 'pointer' : 'default',
                opacity:       cardInsideOpacity,
                transition: [
                  `top ${
                    isAny(PHASE.IDLE, PHASE.OPENING) ? '0s'
                    : isAny(PHASE.PEEKING, PHASE.RETURNING) ? '0.85s cubic-bezier(0.22,1,0.36,1)'
                    : '0.48s cubic-bezier(0.4,0,0.2,1)'
                  }`,
                  `opacity ${isAny(PHASE.IDLE, PHASE.OPENING) ? '0.3s ease' : '0.4s ease'}`,
                ].join(', '),
                willChange: 'top, opacity',
                filter:     'drop-shadow(0 4px 18px rgba(0,0,0,0.45))',
              }}
            >
              <MemoCard t={t} visible={is(PHASE.PEEKING)} />
            </div>
          </div>

          {/* Inside pocket */}
          <div style={{
            position:'absolute', inset:0, zIndex:1,
            borderRadius:'8px 8px 14px 14px',
            background:'linear-gradient(180deg,#EACA6C 0%,#B8902A 100%)',
            opacity:    insideShow ? 1 : 0,
            transition: 'opacity 0.45s ease 0.35s',
            pointerEvents: 'none', willChange: 'opacity',
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
          <div style={{
            position:'absolute', top:0, left:0, right:0,
            zIndex:          5,
            height:          '54%',
            background:      'linear-gradient(178deg,#DEC07A 0%,#B28C38 100%)',
            clipPath:        'polygon(0 0,50% 100%,100% 0)',
            boxShadow:       '0 5px 14px rgba(0,0,0,0.28)',
            transformOrigin: 'top center',
            transformStyle:  'preserve-3d',
            transform:       flapOpen
              ? 'rotateX(-185deg) translateZ(0)'
              : 'rotateX(0deg) translateZ(0)',
            transition:      flapOpen
              ? 'transform 0.72s cubic-bezier(0.4,0,0.2,1)'
              : 'transform 0.6s cubic-bezier(0.4,0,0.2,1) 0.12s',
            willChange:      'transform', pointerEvents: 'none',
          }}>
            <div style={{ position:'absolute', bottom:0, left:'25%', right:'25%', height:'1px', background:'rgba(0,0,0,0.12)' }}/>
            <div style={{ position:'absolute', top:'8px', left:'33%', right:'33%', height:'1px', background:'rgba(255,255,255,0.18)' }}/>
          </div>

          {/* Wax seal */}
          <div style={{
            position:'absolute', top:'50%', left:'50%', zIndex:6,
            transform:  sealGone
              ? 'translate(-50%,-50%) scale(0) rotate(30deg) translateZ(0)'
              : 'translate(-50%,-50%) scale(1) rotate(0deg) translateZ(0)',
            opacity:    sealGone ? 0 : 1,
            transition: 'transform 0.4s ease, opacity 0.35s ease',
            willChange: 'transform, opacity',
          }}>
            <WaxSeal />
          </div>

          {/* Arabic label */}
          <div style={{
            position:'absolute', bottom:'18px', left:0, right:0, zIndex:6,
            display:'flex', justifyContent:'center',
            opacity:    sealGone ? 0 : 1,
            transition: 'opacity 0.28s ease',
            pointerEvents:'none', willChange:'opacity',
          }}>
            <span className="font-amiri" style={{
              direction:'rtl', color:'rgba(70,40,0,0.45)',
              fontSize:'0.85rem', letterSpacing:'2.5px',
            }}>عِيدٌ مُبَارَكٌ</span>
          </div>
        </div>{/* /envelope body */}

        {/* ── HINT teks di atas amplop ── */}
        <div style={{
          position:      'absolute',
          top:           '-28px',
          left:          0, right: 0,
          display:       'flex', justifyContent: 'center',
          zIndex:        30, pointerEvents: 'none',
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
