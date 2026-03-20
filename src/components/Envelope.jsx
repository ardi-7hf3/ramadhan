import { useCallback } from 'react'
import { WaxSeal, EnvelopePattern } from './SvgIcons.jsx'
import GreetingCard from './GreetingCard.jsx'

const Envelope = ({ t, opened, onOpen }) => {
  const handleOpen = useCallback(() => {
    if (opened) return
    onOpen()

    requestAnimationFrame(() => {
      // Flap opens
      const flap   = document.getElementById('env-flap')
      const seal   = document.getElementById('env-seal')
      const label  = document.getElementById('env-label')
      const inside = document.getElementById('env-inside')

      if (flap)   flap.classList.add('flap-open')
      if (seal)   setTimeout(() => seal.classList.add('seal-gone'), 80)
      if (label)  setTimeout(() => {
        label.style.opacity    = '0'
        label.style.transition = 'opacity 0.35s ease'
      }, 200)
      if (inside) setTimeout(() => inside.classList.add('inside-show'), 520)
    })

    // Card slides up
    setTimeout(() => {
      const card = document.getElementById('card-peek')
      if (card) card.classList.add('card-visible')
    }, 720)
  }, [opened, onOpen])

  return (
    <div style={{ perspective: '1200px' }}>
      <div
        className={`relative select-none ${!opened ? 'envelope-hover cursor-pointer' : 'cursor-default'}`}
        onClick={!opened ? handleOpen : undefined}
        style={{ width: 'clamp(280px, 76vw, 448px)' }}
      >

        {/* ── CARD (peeks out from top) ── */}
        <div
          id="card-peek"
          className="card-peek absolute left-1/2 z-10"
          style={{
            bottom:     'calc(100% - 28px)',
            transform:  'translateX(-50%)',
            width:      '90%',
            opacity:    0,
            pointerEvents: opened ? 'auto' : 'none',
          }}
        >
          <GreetingCard t={t} visible={opened} />
        </div>

        {/* ── ENVELOPE BODY ── */}
        <div
          className="relative rounded-lg"
          style={{
            paddingTop: '64%',
            background: 'linear-gradient(162deg, #DEC07A 0%, #C4A15A 48%, #9A7830 100%)',
            boxShadow:  '0 24px 64px rgba(0,0,0,0.62), 0 8px 22px rgba(0,0,0,0.42)',
            borderRadius: '8px 8px 14px 14px',
          }}
        >
          {/* Inside reveal */}
          <div
            id="env-inside"
            className="env-inside absolute inset-0 rounded-lg"
            style={{
              background: 'linear-gradient(180deg, #EACA6C 0%, #B8902A 100%)',
              opacity: 0,
            }}
          />

          {/* Islamic tile pattern */}
          <div className="absolute inset-0 rounded-lg overflow-hidden opacity-10 pointer-events-none">
            <EnvelopePattern />
          </div>

          {/* Envelope side shadows for depth */}
          <div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, rgba(0,0,0,0.08) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.08) 100%)',
            }}
          />

          {/* ── LEFT FLAP ── */}
          <div
            className="absolute bottom-0 left-0 pointer-events-none"
            style={{
              width:      '52%',
              height:     '56%',
              background: 'linear-gradient(138deg, #C8AA60 0%, #9A7830 100%)',
              clipPath:   'polygon(0 100%, 0 0, 100% 100%)',
              boxShadow:  'inset -2px 0 4px rgba(0,0,0,0.1)',
            }}
          />

          {/* ── RIGHT FLAP ── */}
          <div
            className="absolute bottom-0 right-0 pointer-events-none"
            style={{
              width:      '52%',
              height:     '56%',
              background: 'linear-gradient(222deg, #C8AA60 0%, #9A7830 100%)',
              clipPath:   'polygon(100% 100%, 100% 0, 0 100%)',
              boxShadow:  'inset 2px 0 4px rgba(0,0,0,0.1)',
            }}
          />

          {/* ── TOP FLAP (opens with animation) ── */}
          <div
            id="env-flap"
            className="env-flap absolute top-0 left-0 right-0 z-20 pointer-events-none"
            style={{
              height:     '54%',
              background: 'linear-gradient(178deg, #DEC07A 0%, #B28C38 100%)',
              clipPath:   'polygon(0 0, 50% 100%, 100% 0)',
              boxShadow:  '0 5px 14px rgba(0,0,0,0.28)',
            }}
          >
            {/* Fold crease */}
            <div
              className="absolute bottom-0 left-1/4 right-1/4 h-px"
              style={{ background: 'rgba(0,0,0,0.12)' }}
            />
            {/* Subtle flap highlight */}
            <div
              className="absolute top-2 left-1/3 right-1/3 h-px"
              style={{ background: 'rgba(255,255,255,0.18)' }}
            />
          </div>

          {/* ── WAX SEAL ── */}
          <div
            id="env-seal"
            className="seal-wrap absolute top-1/2 left-1/2 z-30"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            <WaxSeal />
          </div>

          {/* ── ARABIC LABEL on envelope ── */}
          <div
            id="env-label"
            className="absolute bottom-5 left-0 right-0 flex justify-center z-10 pointer-events-none"
          >
            <span
              className="font-amiri"
              style={{
                direction:     'rtl',
                color:         'rgba(70,40,0,0.45)',
                fontSize:      '0.85rem',
                letterSpacing: '2.5px',
              }}
            >
              عِيدٌ مُبَارَكٌ
            </span>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Envelope
