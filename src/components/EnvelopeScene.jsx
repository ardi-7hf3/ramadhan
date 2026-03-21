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

// Card Modal (full overlay setelah kartu keluar penuh)
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

// ════════════════════════════════════════════
//  ENVELOPE SCENE
// ════════════════════════════════════════════
const EnvelopeScene = ({ t }) => {
  // States
  const [envState,   setEnvState]   = useState('closed')   // closed|opening|peeking|open|closing
  const [cardPhase,  setCardPhase]  = useState('hidden')   // hidden|opening|open|closing
  const [flapOpen,   setFlapOpen]   = useState(false)
  const [sealGone,   setSealGone]   = useState(false)
  const [insideShow, setInsideShow] = useState(false)
  const [labelHide,  setLabelHide]  = useState(false)
  const [peekStep,   setPeekStep]   = useState(0)
  // 0 = kartu tersembunyi di bawah (dalam amplop)
  // 1 = kartu naik setengah (peek, kelihatan dari mulut amplop)
  // 2 = pause di posisi peek
  // 3 = kartu terbang ke atas (hilang, modal muncul)
  const timers = useRef([])
  const after = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id) }

  const handleOpen = useCallback(() => {
    if (envState !== 'closed') return
    setEnvState('opening')

    after(() => setFlapOpen(true),    100)   // flap buka
    after(() => setSealGone(true),    200)   // seal hilang
    after(() => setLabelHide(true),   320)   // label hilang
    after(() => setInsideShow(true),  560)   // dalam amplop terlihat
    after(() => setPeekStep(1),       780)   // kartu mulai naik dari dalam
    after(() => setPeekStep(2),      1480)   // kartu pause di setengah jalan
    after(() => {                            // kartu terbang ke atas + modal muncul
      setPeekStep(3)
      setCardPhase('opening')
      setEnvState('open')
    }, 2100)
    after(() => {                            // modal settled, peek card hilang
      setPeekStep(0)
      setCardPhase('open')
    }, 2700)
  }, [envState])

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

  // ── Posisi kartu peek (translateY relatif terhadap amplop) ──
  // Kartu diposisikan absolute di dalam envelope, bottom: 0
  // Step 0: tersembunyi di bawah (translateY 0, tidak kelihatan karena di dalam amplop)
  // Step 1: naik sampai setengah keluar dari mulut amplop
  // Step 2: diam
  // Step 3: terbang jauh ke atas
  const peekTranslateY =
    peekStep === 0 ? '10%'   :   // tersembunyi di dalam (hampir di bawah amplop)
    peekStep === 1 ? '-52%'  :   // setengah keluar dari atas amplop
    peekStep === 2 ? '-52%'  :   // pause
    peekStep === 3 ? '-160%' :   // terbang ke atas
    '10%'

  const peekOpacity =
    peekStep === 0 ? 0 :
    peekStep === 3 ? 0 : 1

  const peekTransition =
    peekStep === 1 ? 'transform 0.7s cubic-bezier(0.22,1,0.36,1), opacity 0.25s ease' :
    peekStep === 3 ? 'transform 0.5s cubic-bezier(0.4,0,1,1), opacity 0.2s ease' :
    'none'

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

        {/*
          ── STRUKTUR KUNCI ──

          [envelope-outer]  → position: relative, overflow: VISIBLE
            [peek-card]     → position: absolute, bottom: 0, z-index: 5
                              naik via translateY negatif melewati mulut amplop
            [envelope-body] → position: relative, z-index: 10
                              menutupi bagian bawah peek-card (ilusi kartu di dalam)
        */}
        <div
          onClick={isClickable ? handleOpen : undefined}
          style={{
            position: 'relative',
            width: '100%',
            // ruang ekstra di atas agar kartu peek tidak terpotong saat naik
            paddingTop: '90px',
            cursor: isClickable ? 'pointer' : 'default',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={e => { if (isClickable) e.currentTarget.style.transform = 'translateY(-6px)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
        >

          {/* ══ PEEK CARD ══ */}
          {peekStep > 0 && (
            <div style={{
              position:   'absolute',
              bottom:     0,
              left:       '50%',
              width:      '84%',
              zIndex:     5,           // di BAWAH envelope body (z:10)
              pointerEvents: 'none',
              transform:  `translateX(-50%) translateY(${peekTranslateY})`,
              opacity:    peekOpacity,
              transition: peekTransition,
            }}>
              {/* Mini preview kartu */}
              <div style={{
                position: 'relative',
                background: 'linear-gradient(155deg, #FFFCF0 0%, #FDF5DA 45%, #F5E8BC 100%)',
                border: '1px solid rgba(201,148,26,0.3)',
                borderRadius: '10px 10px 0 0',
                boxShadow: '0 -8px 32px rgba(0,0,0,0.4), 0 -2px 8px rgba(0,0,0,0.2)',
                padding: '18px 22px 14px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px',
                backgroundImage: 'repeating-linear-gradient(transparent 0px, transparent 29px, rgba(160,120,40,0.065) 30px)',
              }}>
                {/* Corner ornament kiri */}
                <div style={{ position: 'absolute', top: 8, left: 8 }}>
                  <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                    <path d="M4 36 L4 4 L36 4" stroke="rgba(201,148,26,0.55)" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="4" cy="4" r="2.5" fill="rgba(201,148,26,0.55)"/>
                  </svg>
                </div>
                {/* Corner ornament kanan */}
                <div style={{ position: 'absolute', top: 8, right: 8 }}>
                  <svg width="20" height="20" viewBox="0 0 40 40" fill="none" style={{ transform: 'scaleX(-1)' }}>
                    <path d="M4 36 L4 4 L36 4" stroke="rgba(201,148,26,0.55)" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="4" cy="4" r="2.5" fill="rgba(201,148,26,0.55)"/>
                  </svg>
                </div>

                {/* Garis emas */}
                <div style={{
                  width: '50%', height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(201,148,26,0.6), transparent)',
                }} />

                {/* Teks arab */}
                <div style={{
                  fontFamily: 'Amiri, serif', direction: 'rtl',
                  fontSize: 'clamp(0.78rem, 2.5vw, 0.95rem)',
                  color: '#B8840E', letterSpacing: '2px',
                }}>
                  مِنَ الْعَائِدِيْنَ وَالْفَائِزِيْنَ
                </div>

                {/* Judul shimmer */}
                <div style={{
                  fontFamily: 'Poppins, sans-serif', fontWeight: 800,
                  fontSize: 'clamp(0.85rem, 3vw, 1.05rem)',
                  background: 'linear-gradient(90deg, #8B6310 0%, #F5D87A 35%, #C9941A 60%, #F5D87A 80%, #8B6310 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'goldShimmer 3s linear infinite',
                  letterSpacing: '0.5px', textAlign: 'center',
                }}>
                  Minal Aaidiin Wal Faaiziin
                </div>

                {/* Sub */}
                <div style={{
                  fontFamily: 'Poppins, sans-serif', fontWeight: 600,
                  fontSize: 'clamp(0.58rem, 1.8vw, 0.68rem)',
                  color: '#0F7A6B', letterSpacing: '1px',
                }}>
                  Mohon Maaf Lahir dan Batin
                </div>

                {/* Dot ornamen */}
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                  {[4,7,4].map((s,i) => (
                    <div key={i} style={{
                      width: s, height: s, borderRadius: '50%',
                      background: '#C9941A', opacity: i===1 ? 0.85 : 0.4,
                    }}/>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ ENVELOPE BODY (z:10, menutupi bagian bawah peek card) ══ */}
          <div style={{
            position: 'relative',
            zIndex: 10,
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

            {/* Top flap — animasi buka/tutup */}
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

          </div>{/* end envelope body */}
        </div>{/* end clickable wrapper */}
      </div>
    </>
  )
}

export default EnvelopeScene
