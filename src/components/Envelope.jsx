import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { WaxSeal, EnvelopePattern } from './SvgIcons.jsx'
import GreetingCard from './GreetingCard.jsx'

/**
 * ARSITEKTUR ANIMASI MASUK KE AMPLOP (sesuai gambar referensi):
 *
 * Gambar 1 - ABOVE_FLAP→ENTERING:
 *   Stage card (di LUAR envelope body, z:9) di atas amplop, bergerak turun.
 *   Saat stage card melewati batas atas envelope body, body amplop (z:10)
 *   SECARA NATURAL menutupi bagian bawah kartu → efek kartu masuk ke slot.
 *   Tidak perlu clip/overflow trick apapun.
 *
 * Gambar 2 - ENTERED:
 *   Stage card hilang. Inside card snap ke top:5% (peek).
 *   Body amplop menutupi bawah, hanya ujung atas kartu terlihat.
 *
 * Gambar 3 - CLOSING_FLAP:
 *   Inside card tetap di peek, flap menutup dari atas.
 *
 * z-index saat animasi masuk:
 *   stage card    → z:9   (di BAWAH envelope body z:10 → body menutupi bagian bawahnya)
 *   envelope body → z:10
 *   bottom fold   → z:4   (di dalam body, tidak perlu naik)
 *   flap          → z:15  (terbuka selama ENTERING, menutup di CLOSING_FLAP)
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

  // ── Tutup kartu → masukkan ke amplop → tutup flap ──
  useEffect(() => {
    if (cardViewing || phaseRef.current !== PHASE.FULLSCREEN) return
    const T0 = 300   // overlay fade out
    const T1 = 350   // stage card muncul diam sebentar di atas amplop
    const T2 = 750   // stage card slide turun masuk ke amplop
    const T2e = 500  // kartu sudah cukup masuk → switch ke inside card (ENTERED)
    const T3 = 700   // flap menutup
    setPhase(PHASE.RETURNING)
    go(PHASE.ABOVE_FLAP,   T0)
    go(PHASE.ENTERING,     T0 + T1)
    go(PHASE.ENTERED,      T0 + T1 + T2e)
    go(PHASE.CLOSING_FLAP, T0 + T1 + T2)
    go(PHASE.IDLE,         T0 + T1 + T2 + T3)
    const doneId = setTimeout(() => {
      if (onEnvelopeClosed) onEnvelopeClosed()
    }, T0 + T1 + T2 + T3 + 50)
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

  // ── Inside card (di dalam overflow:hidden envelope body) ──
  //
  // Animasi masuk ke amplop SEPENUHNYA via inside card + overflow:hidden.
  // Tidak ada stage card terpisah — overflow:hidden adalah "dinding" yang
  // memotong kartu secara alami saat slide turun dari atas.
  //
  // ABOVE_FLAP  : top:-100% → kartu penuh tersembunyi di atas (di luar overflow:hidden)
  // ENTERING    : top:5%    → slide turun 750ms, overflow:hidden memotong bagian atas
  //               yang belum masuk → efek kartu masuk dari bukaan amplop
  // ENTERED     : top:5%    → diam di posisi peek
  // CLOSING_FLAP: top:5%    → diam, flap menutup dari atas
  //
  // z-index inside card container saat ENTERING: 16 (di atas flap z:15)
  // agar kartu terlihat saat meluncur masuk melewati bukaan amplop.
  // Setelah ENTERED: turun ke z:3 agar flap & pentagon bisa menutup.

  const cardInsideTop = (() => {
    // Posisi peek normal (sebagian kecil terlihat dari dalam)
    if (isAny(PHASE.PEEKING, PHASE.FLYING, PHASE.FULLSCREEN, PHASE.CLOSING_FLAP)) return '5%'
    // ENTERED: kartu menjulur tinggi di atas amplop, hanya bagian bawah tertutup body
    // (seperti gambar referensi — kartu sebagian besar masih terlihat di atas)
    if (isAny(PHASE.ENTERING, PHASE.ENTERED)) return '-55%'
    // ABOVE_FLAP: kartu sepenuhnya di atas, tersembunyi oleh overflow:hidden
    if (is(PHASE.ABOVE_FLAP)) return '-100%'
    return '110%'  // IDLE, OPENING
  })()

  const cardInsideOpacity = isAny(
    PHASE.PEEKING, PHASE.FLYING, PHASE.FULLSCREEN,
    PHASE.ENTERING, PHASE.ENTERED, PHASE.CLOSING_FLAP
  ) ? 1 : 0

  const cardInsideVisibility = isAny(PHASE.IDLE, PHASE.OPENING) ? 'hidden' : 'visible'

  const cardInsideContainerZ = isAny(PHASE.ENTERING, PHASE.ENTERED) ? 16 : 3

  const cardInsideTransition = (() => {
    // ENTERING  : slide dari -100% ke -55% (kartu muncul menjulur dari bukaan)
    if (is(PHASE.ENTERING))     return 'top 0.75s cubic-bezier(0.4,0,0.55,1)'
    // CLOSING_FLAP: slide dari -55% ke 5% (kartu masuk ke dalam, flap menutup)
    if (is(PHASE.CLOSING_FLAP)) return 'top 0.5s cubic-bezier(0.4,0,0.6,1)'
    return 'none'
  })()

  const cardClickable = is(PHASE.PEEKING)

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
      ══════════════════════════════════════════════ */}
      <div className="relative" style={{ width:'min(448px,92vw)', perspective:'1200px' }}>

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
          {/* ── INSIDE CARD (overflow:hidden) ──
           * Animasi masuk sepenuhnya via inside card + overflow:hidden.
           * ABOVE_FLAP  : top:-100% (di atas, tersembunyi oleh overflow:hidden)
           * ENTERING    : top:5% + transition → slide masuk, z:16 agar terlihat di atas flap
           * ENTERED+    : top:5% diam, z:3 agar flap & pentagon bisa menutup
           */}
          <div style={{
            position:      'absolute', inset: 0,
            overflow:      'hidden',
            zIndex:        cardInsideContainerZ,
            pointerEvents: 'none',
            borderRadius:  'inherit',
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
           * z:4 hanya saat CLOSING_FLAP & IDLE → menutupi kartu peek dari depan
           * z:2 di fase lain → kartu (z:3) tampak di depan pentagon
           */}
          <div className="absolute inset-0 pointer-events-none" style={{
            // z:4 (di atas inside card z:3) di semua fase kecuali ENTERING
            // Saat ENTERING: stage card di luar body yang handle visual, pentagon tidak perlu cover
            // Saat PEEKING: pentagon z:4 menutupi bagian bawah kartu peek dengan benar
            zIndex: is(PHASE.ENTERING) ? 2 : 4,
            background:'linear-gradient(160deg,#B8902A 0%,#C8AA60 30%,#B0882A 50%,#C8AA60 70%,#B8902A 100%)',
            clipPath:'polygon(0 0, 50% 54%, 100% 0, 100% 100%, 0 100%)',
          }}/>

          {/* TOP FLAP — z:15
           * Terbuka selama ABOVE_FLAP, ENTERING, ENTERED.
           * Menutup di CLOSING_FLAP setelah kartu sudah di dalam (gambar 3).
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
