import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { WaxSeal, EnvelopePattern } from './SvgIcons.jsx'
import GreetingCard from './GreetingCard.jsx'

/**
 * ANIMASI MASUK AMPLOP — Arsitektur final:
 *
 * Dua elemen kartu:
 *  1. STAGE CARD  — sibling di luar envelope body (bukan child)
 *     - z:8 → di BAWAH envelope body (z:10)
 *     - Saat slide turun, bagian yang overlap dengan body tertutup NATURAL oleh body
 *     - Aktif selama ABOVE_FLAP dan ENTERING
 *
 *  2. INSIDE CARD — child di dalam envelope body (overflow:hidden)
 *     - Aktif mulai PEEKING (normal) dan ENTERED (setelah stage card selesai)
 *     - top:5% = posisi peek
 *
 * Stage card bergerak dari ATAS ke BAWAH:
 *   ABOVE_FLAP : stage card di atas amplop penuh (tidak overlap body sama sekali)
 *   ENTERING   : stage card slide turun, body amplop progressively menutupi bagian bawahnya
 *
 * Saat ENTERED: stage card hilang, inside card snap ke peek — transisi seamless
 * karena pada saat itu stage card sudah separuh tertutup body (posisi mirip peek).
 *
 * z-index:
 *   stage card    → z:8   (sibling, di bawah body z:10 → body clip bagian bawahnya)
 *   envelope body → z:10
 *   inside card   → z:3   (child, overflow:hidden)
 *   pentagon      → z:4   (child, di atas inside card saat peek)
 *   flap          → z:15  (child)
 *
 * Pentagon TIDAK menutupi stage card karena stage card adalah sibling di luar body.
 * Pentagon hanya relevan untuk inside card (child).
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
  ENTERED:      8,
  CLOSING_FLAP: 9,
}

const MemoCard = memo(GreetingCard)

const Envelope = ({
  t,
  envelopeOpen,
  cardViewing,
  onOpenEnvelope,
  onViewCard,
  onCloseCard,
  onEnvelopeClosed,
  onShare,
  onSave,
}) => {
  const [phase, setPhase] = useState(PHASE.IDLE)
  const timers            = useRef([])
  const phaseRef          = useRef(PHASE.IDLE)

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
    go(PHASE.PEEKING, 760)
  }, [envelopeOpen, go])

  // ── Buka kartu fullscreen ──
  useEffect(() => {
    if (!cardViewing || phaseRef.current !== PHASE.PEEKING) return
    setPhase(PHASE.FLYING)
    go(PHASE.FULLSCREEN, 520)
  }, [cardViewing, go])

  // ── Tutup kartu ──
  // Alur: RETURNING → ABOVE_FLAP → ENTERING → ENTERED → CLOSING_FLAP → IDLE
  //
  // Timeline (ms dari user klik close):
  //   0    : RETURNING  — overlay mulai fade out
  //   300  : ABOVE_FLAP — stage card snap muncul di atas amplop
  //   650  : ENTERING   — stage card mulai slide turun (durasi 900ms)
  //   1550 : ENTERED    — stage card selesai di posisi, switch ke inside card
  //   1600 : CLOSING_FLAP — inside card di peek, flap mulai menutup (durasi 700ms)
  //   2300 : IDLE
  useEffect(() => {
    if (cardViewing || phaseRef.current !== PHASE.FULLSCREEN) return
    const T0 = 300   // overlay fade out sebelum stage card muncul
    const T1 = 350   // stage card diam sebentar di atas amplop
    const T2 = 900   // durasi slide stage card turun masuk
    const T3 = 50    // jeda kecil sebelum switch ke inside card
    const T4 = 700   // flap menutup
    setPhase(PHASE.RETURNING)
    go(PHASE.ABOVE_FLAP,   T0)
    go(PHASE.ENTERING,     T0 + T1)
    go(PHASE.ENTERED,      T0 + T1 + T2)
    go(PHASE.CLOSING_FLAP, T0 + T1 + T2 + T3)
    go(PHASE.IDLE,         T0 + T1 + T2 + T3 + T4)
    const doneId = setTimeout(() => {
      if (onEnvelopeClosed) onEnvelopeClosed()
    }, T0 + T1 + T2 + T3 + T4 + 50)
    timers.current.push(doneId)
  }, [cardViewing, go, onEnvelopeClosed])

  const is    = p       => phase === p
  const isAny = (...ps) => ps.includes(phase)

  const flapOpen = isAny(
    PHASE.OPENING, PHASE.PEEKING, PHASE.FLYING,
    PHASE.FULLSCREEN, PHASE.RETURNING,
    PHASE.ABOVE_FLAP, PHASE.ENTERING, PHASE.ENTERED
  )
  const sealGone   = !is(PHASE.IDLE)
  const insideShow = !is(PHASE.IDLE)

  // ─────────────────────────────────────────────────────────
  // STAGE CARD (sibling di luar envelope body)
  // ─────────────────────────────────────────────────────────
  //
  // Diposisikan relatif ke scene container (bukan ke envelope body).
  // Envelope body mulai dari top:0 (paddingTop:64% = tinggi body relatif).
  //
  // Anchor: bottom stage card = top envelope body.
  // Kita gunakan `bottom` dari scene container.
  // Scene container tingginya = tinggi envelope body = paddingTop:64% dari lebarnya.
  // Jadi bottom:100% = tepat di atas envelope body.
  //
  // ABOVE_FLAP : translateY(0)    — kartu penuh di atas amplop
  // ENTERING   : translateY(Xpx)  — slide turun, body menutupi bagian bawah kartu
  //
  // Berapa jauh harus turun? Kita ingin kartu ~60% masuk ke dalam body saat selesai.
  // Kartu tingginya ≈ lebar amplop × 1.3 (aspect ratio kartu).
  // Envelope body tingginya = 64% dari lebarnya.
  // Kita ingin bottom kartu berada di ~60% dari bawah envelope body.
  // → translateY = tinggi_kartu × 0.6 ≈ (lebar × 1.3) × 0.6 = lebar × 0.78
  // Tapi karena kita pakai %, translateY % dihitung dari tinggi ELEMEN itu sendiri.
  // translateY(60%) = geser ke bawah 60% dari tinggi kartu.
  // Ini membuat separuh lebih kartu masuk ke dalam body amplop.
  //
  // z:8 → di bawah body (z:10) → body menutupi bagian bawah stage card secara natural.

  const showStageCard = isAny(PHASE.ABOVE_FLAP, PHASE.ENTERING)

  const stageTransform = is(PHASE.ENTERING)
    ? 'translateY(62%)'   // turun 62% dari tinggi kartu → ~separuh lebih masuk ke body
    : 'translateY(0%)'    // di atas amplop

  const stageTransition = is(PHASE.ENTERING)
    ? 'transform 0.9s cubic-bezier(0.25,0.46,0.45,0.94)'
    : 'none'

  // ─────────────────────────────────────────────────────────
  // INSIDE CARD (child envelope body, overflow:hidden)
  // ─────────────────────────────────────────────────────────
  //
  // Hanya aktif saat PEEKING (normal) dan ENTERED/CLOSING_FLAP (setelah stage card).
  // Saat ENTERED: snap langsung ke top:5% — karena stage card baru saja di posisi
  // yang hampir sama (separuh masuk), transisi ke inside card nyaris tidak terasa.

  const cardInsideTop = (() => {
    if (isAny(PHASE.PEEKING, PHASE.FLYING, PHASE.FULLSCREEN,
              PHASE.ENTERED, PHASE.CLOSING_FLAP)) return '5%'
    return '110%'  // tersembunyi di bawah di semua fase lain
  })()

  const cardInsideOpacity = isAny(
    PHASE.PEEKING, PHASE.FLYING, PHASE.FULLSCREEN,
    PHASE.ENTERED, PHASE.CLOSING_FLAP
  ) ? 1 : 0

  const cardInsideVisibility = isAny(
    PHASE.IDLE, PHASE.OPENING,
    PHASE.ABOVE_FLAP, PHASE.ENTERING  // stage card yang handle, inside card hidden
  ) ? 'hidden' : 'visible'

  const cardInsideTransition = 'none'  // snap — stage card yang handle animasi visual

  const cardClickable = is(PHASE.PEEKING)

  // Pentagon: z:4 saat peek/close (menutupi bawah inside card), z:2 saat tidak perlu
  const pentagonZ = isAny(PHASE.PEEKING, PHASE.FLYING, PHASE.FULLSCREEN,
                           PHASE.ENTERED, PHASE.CLOSING_FLAP, PHASE.IDLE) ? 4 : 2

  // ── Overlay ──
  const overlayVisible = isAny(PHASE.FLYING, PHASE.FULLSCREEN, PHASE.RETURNING)
  const overlayFull    = is(PHASE.FULLSCREEN)
  const overlayCardTransform = overlayFull
    ? 'scale(1) translateY(0) translateZ(0)'
    : is(PHASE.FLYING)
      ? 'scale(0.7) translateY(38vh) translateZ(0)'
      : 'scale(0.55) translateY(28vh) translateZ(0)'
  const overlayCardOpacity    = overlayFull ? 1 : 0
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

        {/* Close button */}
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
          position:relative — semua absolute children relatif ke sini
      ══════════════════════════════════════════════ */}
      <div className="relative" style={{ width:'min(448px,92vw)', perspective:'1200px' }}>

        {/* ── STAGE CARD ──────────────────────────────────────
         * Sibling dari envelope body, bukan child.
         * Diposisikan dengan bottom:0 + transform agar bottom kartu
         * sejajar dengan TOP envelope body saat ABOVE_FLAP.
         *
         * z:8 → di BAWAH envelope body (z:10).
         * Saat stage card slide turun (ENTERING), bagian yang overlap
         * dengan envelope body tertutup oleh body secara NATURAL (z:10 > z:8).
         * Pentagon tidak relevan di sini karena stage card adalah sibling,
         * bukan child — pentagon (di dalam body) tidak bisa menutupi stage card.
         * ──────────────────────────────────────────────────── */}
        {showStageCard && (
          <div style={{
            position:   'absolute',
            left:       '5%',
            right:      '5%',
            bottom:     '100%',    // bottom stage card = top envelope body
            zIndex:     8,         // di bawah envelope body z:10
            transform:  stageTransform,
            transition: stageTransition,
            willChange: 'transform',
            pointerEvents: 'none',
            filter:     'drop-shadow(0 -6px 20px rgba(0,0,0,0.4))',
          }}>
            <MemoCard t={t} />
          </div>
        )}

        {/* ── ENVELOPE BODY ─────────────────────────────────── z:10 ── */}
        <div
          className={`relative select-none ${is(PHASE.IDLE) ? 'envelope-hover cursor-pointer' : 'cursor-default'}`}
          onClick={is(PHASE.IDLE) ? onOpenEnvelope : undefined}
          style={{
            paddingTop:   '64%',
            background:   'linear-gradient(162deg,#DEC07A 0%,#C4A15A 48%,#9A7830 100%)',
            boxShadow:    '0 20px 56px rgba(0,0,0,0.6), 0 6px 18px rgba(0,0,0,0.4)',
            borderRadius: '8px 8px 14px 14px',
            overflow:     'hidden',   // selalu hidden — body memotong stage card dari bawah
            zIndex:       10,
          }}
        >
          {/* ── INSIDE CARD ── overflow:hidden dari parent body ── */}
          <div style={{
            position:   'absolute', inset: 0,
            overflow:   'hidden',
            zIndex:     3,
            pointerEvents: 'none',
            borderRadius: 'inherit',
          }}>
            <div
              onClick={cardClickable ? onViewCard : undefined}
              style={{
                position:      'absolute',
                left: '5%', right: '5%',
                top:           cardInsideTop,
                opacity:       cardInsideOpacity,
                visibility:    cardInsideVisibility,
                transition:    cardInsideTransition,
                willChange:    'top',
                pointerEvents: cardClickable ? 'auto' : 'none',
                cursor:        cardClickable ? 'pointer' : 'default',
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
            transition: 'opacity 0.4s ease 0.2s',
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

          {/* Bottom fold pentagon
           * Ini hanya relevan untuk inside card (child).
           * Stage card (sibling) tidak dipengaruhi pentagon sama sekali.
           * z:4 → selalu di atas inside card (z:3) untuk menutupi bagian bawah kartu peek.
           */}
          <div className="absolute inset-0 pointer-events-none" style={{
            zIndex:    pentagonZ,
            background:'linear-gradient(160deg,#B8902A 0%,#C8AA60 30%,#B0882A 50%,#C8AA60 70%,#B8902A 100%)',
            clipPath:  'polygon(0 0, 50% 54%, 100% 0, 100% 100%, 0 100%)',
          }}/>

          {/* TOP FLAP — z:15 */}
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
            transition:    'opacity 0.3s ease 0.3s',
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
