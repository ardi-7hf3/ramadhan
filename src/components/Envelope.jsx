import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { WaxSeal, EnvelopePattern } from './SvgIcons.jsx'
import GreetingCard from './GreetingCard.jsx'

/**
 * VISUALISASI PEEK (benar):
 *
 *  ┌──────────────────────┐  ← bagian atas kartu (TERLIHAT, di atas mulut amplop)
 *  │   TOP KARTU          │
 *  ╠══════════════════════╣  ← MULUT AMPLOP (garis clip)
 *  │   sisa kartu         │  ← tersembunyi dalam amplop (di-clip)
 *  │   ...                │
 *  └──────────────────────┘
 *
 * TEKNIK:
 *  - clip wrapper: absolute, top=0, bottom=0, left=0, right=0
 *    (sama persis dengan amplop), overflow:hidden
 *    → semua konten di DALAM wrapper (di bawah top amplop) tersembunyi
 *    → konten yang keluar ke ATAS wrapper = terlihat
 *
 *  - kartu: anchor bottom:0 (bawah wrapper = bawah amplop)
 *    translateY(0)    → kartu mepet bawah wrapper, seluruhnya tersembunyi di dalam
 *    translateY(-20%) → kartu naik 20% dari tingginya → 20% atas kartu keluar = PEEK
 *    translateY(-110%)→ kartu naik sepenuhnya ke atas = FLYING
 *
 * Kartu bergerak dari BAWAH ke ATAS ✓
 */

const PHASE = {
  IDLE:       0,
  OPENING:    1,  // flap terbuka, kartu masih di dalam
  PEEKING:    2,  // 20% atas kartu nongol dari mulut amplop
  FLYING:     3,  // kartu terbang ke overlay
  FULLSCREEN: 4,  // kartu fullscreen
  RETURNING:  5,  // kartu kembali ke peek
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
  const timers            = useRef([])
  const phaseRef          = useRef(PHASE.IDLE)

  useEffect(() => { phaseRef.current = phase }, [phase])

  const go = useCallback((nextPhase, delay = 0) => {
    const id = setTimeout(() => setPhase(nextPhase), delay)
    timers.current.push(id)
  }, [])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // Buka amplop → flap buka dulu, baru kartu naik sedikit
  useEffect(() => {
    if (!envelopeOpen || phaseRef.current !== PHASE.IDLE) return
    setPhase(PHASE.OPENING)
    go(PHASE.PEEKING, 860)   // setelah flap terbuka
  }, [envelopeOpen, go])

  // Klik kartu → terbang fullscreen
  useEffect(() => {
    if (!cardViewing || phaseRef.current !== PHASE.PEEKING) return
    setPhase(PHASE.FLYING)
    go(PHASE.FULLSCREEN, 520)
  }, [cardViewing, go])

  // Tutup fullscreen → kartu kembali peek
  useEffect(() => {
    if (cardViewing || phaseRef.current !== PHASE.FULLSCREEN) return
    setPhase(PHASE.RETURNING)
    go(PHASE.PEEKING, 720)
  }, [cardViewing, go])

  const is    = (p)      => phase === p
  const isAny = (...ps)  => ps.includes(phase)

  const flapOpen   = phase >= PHASE.OPENING
  const sealGone   = phase >= PHASE.OPENING
  const insideShow = phase >= PHASE.OPENING

  /**
   * cardTransY — translateY relatif terhadap tinggi KARTU
   *
   * Kartu di-anchor bottom:0 (dasar amplop).
   * Kartu ~2.5x lebih tinggi dari amplop.
   * overflow:hidden clip wrapper = clip pada batas TOP amplop.
   *
   * Untuk nongol di mulut amplop:
   *   translateY(0)    = kartu di dasar, semuanya di dalam → hidden ✓
   *   translateY(-85%) = kartu naik, ~15% atas kartu nongol keluar ← PEEK ✓
   *   translateY(-130%)= kartu terbang ke atas layar
   */
  const cardTransY = (() => {
    switch (phase) {
      case PHASE.IDLE:       return '0%'
      case PHASE.OPENING:    return '0%'
      case PHASE.PEEKING:    return '-85%'   // bagian atas kartu nongol sedikit
      case PHASE.FLYING:     return '-130%'  // terbang ke atas
      case PHASE.FULLSCREEN: return '-130%'
      case PHASE.RETURNING:  return '-85%'   // kembali peek
      default:               return '0%'
    }
  })()

  const cardOpacity   = isAny(PHASE.IDLE, PHASE.OPENING) ? 0
                      : is(PHASE.FLYING)                 ? 0.25
                      : 1
  const cardClickable = is(PHASE.PEEKING)

  const overlayVisible = isAny(PHASE.FLYING, PHASE.FULLSCREEN, PHASE.RETURNING)
  const overlayFull    = is(PHASE.FULLSCREEN)

  return (
    <>
      {/* ══════════════════════════════════════════════════
          FULLSCREEN OVERLAY
      ══════════════════════════════════════════════════ */}
      <div style={{
        position:       'fixed',
        inset:          0,
        zIndex:         50,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        background:     overlayFull ? 'rgba(4,8,20,0.93)' : 'rgba(4,8,20,0)',
        backdropFilter: overlayFull ? 'blur(10px)'        : 'blur(0px)',
        transition:     'background 0.4s ease, backdrop-filter 0.4s ease',
        visibility:     overlayVisible ? 'visible' : 'hidden',
        pointerEvents:  overlayFull ? 'auto' : 'none',
        willChange:     'background',
      }}>

        {/* Kartu di overlay */}
        <div style={{
          width:        'min(520px, 92vw)',
          maxHeight:    '88dvh',
          overflowY:    overlayFull ? 'auto' : 'hidden',
          borderRadius: '16px',
          transform:    overlayFull
            ? 'translateZ(0) scale(1) translateY(0)'
            : is(PHASE.RETURNING)
              ? 'translateZ(0) scale(0.65) translateY(42vh)'
              : 'translateZ(0) scale(0.7) translateY(36vh)',
          opacity:      overlayFull ? 1 : 0,
          transition:   'transform 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.38s ease',
          willChange:   'transform, opacity',
          pointerEvents: overlayFull ? 'auto' : 'none',
        }}>
          <MemoCard t={t} visible={overlayFull} />
        </div>

        {/* Tombol Close — pojok KIRI atas (tidak bentrok dengan lang toggle kanan) */}
        <button
          onClick={onCloseCard}
          style={{
            position:       'fixed',
            top:            '18px',
            left:           '18px',
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
            transform:      overlayFull
              ? 'scale(1) translateZ(0)'
              : 'scale(0.75) translateZ(0)',
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
          position:      'fixed',
          bottom:        '28px',
          left:          '50%',
          transform:     overlayFull
            ? 'translateX(-50%) translateY(0) translateZ(0)'
            : 'translateX(-50%) translateY(14px) translateZ(0)',
          display:       'flex',
          gap:           '10px',
          flexWrap:      'wrap',
          justifyContent:'center',
          opacity:       overlayFull ? 1 : 0,
          transition:    'opacity 0.22s ease 0.3s, transform 0.22s ease 0.3s',
          pointerEvents: overlayFull ? 'auto' : 'none',
          zIndex:        60,
          willChange:    'opacity, transform',
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

      {/* ══════════════════════════════════════════════════
          ENVELOPE SCENE
      ══════════════════════════════════════════════════ */}
      <div className="relative" style={{ width:'min(448px,92vw)', perspective:'1200px' }}>

        {/*
         * ── CLIP WRAPPER ─────────────────────────────────
         *
         * FIX PEEK:
         * top: -30% → wrapper diperpanjang 30% ke ATAS amplop.
         * Ini memberi ruang agar porsi peek kartu (yang naik
         * ke atas mulut amplop) TERLIHAT dan tidak dipotong.
         *
         * overflow:hidden HANYA memotong dari batas BAWAH wrapper
         * ke atas, tapi ruang top:-30% adalah area "bebas" tempat
         * peek kartu muncul tanpa terpotong.
         *
         * Kartu anchor bottom:0 = bawah kartu di dasar amplop.
         * translateY(0)    = kartu sepenuhnya di dalam → hidden
         * translateY(-20%) = 20% atas kartu nongol di mulut ✓
         * ─────────────────────────────────────────────────
         */}
        <div style={{
          position:      'absolute',
          top:           '-30%',    /* ← ruang di atas mulut amplop untuk peek */
          left:          0,
          right:         0,
          bottom:        0,
          overflow:      'hidden',
          zIndex:        25,
          pointerEvents: 'none',
        }}>
          <div
            onClick={cardClickable ? onViewCard : undefined}
            style={{
              position:      'absolute',
              bottom:        0,
              left:          '50%',
              width:         '92%',
              transform:     `translateX(-50%) translateY(${cardTransY}) translateZ(0)`,
              opacity:       cardOpacity,
              cursor:        cardClickable ? 'pointer' : 'default',
              pointerEvents: cardClickable ? 'auto' : 'none',
              transition:    [
                `transform ${
                  isAny(PHASE.IDLE, PHASE.OPENING) ? '0s'
                  : isAny(PHASE.PEEKING, PHASE.RETURNING) ? '0.82s cubic-bezier(0.22,1,0.36,1)'
                  : '0.46s cubic-bezier(0.4,0,0.2,1)'
                }`,
                `opacity ${isAny(PHASE.IDLE, PHASE.OPENING) ? '0.3s ease' : '0.36s ease'}`,
              ].join(', '),
              willChange:  'transform, opacity',
              filter:      'drop-shadow(0 -8px 28px rgba(0,0,0,0.5))',
            }}
          >
            <MemoCard t={t} visible={is(PHASE.PEEKING)} />
          </div>
        </div>

        {/* Hint — di luar clip wrapper agar terlihat di atas amplop */}
        <div style={{
          position:      'absolute',
          top:           '-30px',
          left:          0, right: 0,
          display:       'flex',
          justifyContent:'center',
          zIndex:        26,
          pointerEvents: 'none',
        }}>
          <div style={{
            whiteSpace:    'nowrap',
            fontFamily:    'Poppins,sans-serif',
            fontSize:      '0.63rem',
            fontWeight:    600,
            color:         'rgba(245,216,122,0.85)',
            letterSpacing: '1.5px',
            opacity:       is(PHASE.PEEKING) ? 1 : 0,
            transition:    'opacity 0.3s ease 0.5s',
            animation:     is(PHASE.PEEKING) ? 'hintBounce 2s ease-in-out infinite' : 'none',
          }}>
            {t.tapToOpen || '↑ Klik kartu untuk membuka'}
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
          {/* Bagian dalam amplop */}
          <div style={{
            position:'absolute', inset:0, zIndex:1,
            borderRadius:'8px 8px 14px 14px',
            background:'linear-gradient(180deg,#EACA6C 0%,#B8902A 100%)',
            opacity:    insideShow ? 1 : 0,
            transition: 'opacity 0.45s ease 0.35s',
            pointerEvents: 'none',
            willChange: 'opacity',
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

          {/* TOP FLAP — 3D open */}
          <div style={{
            position:        'absolute',
            top:0, left:0, right:0,
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
            willChange:      'transform',
            pointerEvents:   'none',
          }}>
            <div style={{ position:'absolute', bottom:0, left:'25%', right:'25%', height:'1px', background:'rgba(0,0,0,0.12)' }}/>
            <div style={{ position:'absolute', top:'8px', left:'33%', right:'33%', height:'1px', background:'rgba(255,255,255,0.18)' }}/>
          </div>

          {/* Wax seal */}
          <div style={{
            position:   'absolute',
            top:'50%', left:'50%',
            zIndex:     6,
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
            position:'absolute', bottom:'18px', left:0, right:0,
            zIndex:6, display:'flex', justifyContent:'center',
            opacity:    sealGone ? 0 : 1,
            transition: 'opacity 0.28s ease',
            pointerEvents:'none',
            willChange: 'opacity',
          }}>
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
