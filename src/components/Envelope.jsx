import { useCallback } from 'react'
import { WaxSeal, EnvelopePattern } from './SvgIcons.jsx'
import GreetingCard from './GreetingCard.jsx'

const Envelope = ({ t, opened, onOpen }) => {
  const handleOpen = useCallback(() => {
    if (opened) return
    onOpen()

    requestAnimationFrame(() => {
      const flap   = document.getElementById('env-flap')
      const seal   = document.getElementById('env-seal')
      const label  = document.getElementById('env-label')
      const inside = document.getElementById('env-inside')

      // 1) Open flap with 3D rotation
      if (flap) flap.classList.add('flap-open')

      // 2) Dissolve wax seal
      if (seal) setTimeout(() => seal.classList.add('seal-gone'), 100)

      // 3) Fade out Arabic label
      if (label) setTimeout(() => {
        label.style.opacity    = '0'
        label.style.transition = 'opacity 0.35s ease'
      }, 180)

      // 4) Reveal envelope inside
      if (inside) setTimeout(() => inside.classList.add('inside-show'), 540)
    })

    // 5) Slide card up and enable interaction
    setTimeout(() => {
      const card = document.getElementById('card-peek')
      if (card) {
        // Enable pointer events BEFORE the transition starts
        // so the card is clickable/scrollable as soon as it appears
        card.style.pointerEvents = 'auto'
        card.classList.add('card-visible')
      }
    }, 740)
  }, [opened, onOpen])

  return (
    /*
     * FIX: The scene wrapper is the single positioning parent for BOTH
     * the card and the envelope. The card (#card-peek) is rendered AFTER
     * the envelope in DOM order AND has a higher explicit z-index (50)
     * than anything inside the envelope (max z-index 6), so the card
     * always paints on top — no stacking-context trapping.
     *
     * perspective is on the outer wrapper so the flap 3D transform works,
     * but we avoid making the envelope body a transform-based stacking
     * context that would bury the card beneath it.
     */
    <div
      className="relative"
      style={{
        width:       'clamp(280px, 76vw, 448px)',
        perspective: '1200px',
      }}
    >

      {/* ══════════════════════════════════════════
          CARD PEEK
          - position: absolute, anchored to bottom of envelope
          - z-index: 50 → always above the flap (z 5) and seal (z 6)
          - pointer-events: starts 'none', set to 'auto' imperatively
            in handleOpen so it's interactive the moment it slides up
          - overflow-y: auto → card content is scrollable on small screens
      ══════════════════════════════════════════ */}
      <div
        id="card-peek"
        className="card-peek absolute left-1/2"
        style={{
          bottom:        'calc(100% - 28px)',
          transform:     'translateX(-50%)',
          width:         '95%',
          opacity:       0,
          zIndex:        50,
          pointerEvents: 'none',
          overflowY:     'auto',
          maxHeight:     '80vh',
          borderRadius:  '16px',
          /* subtle shadow so card floats above envelope */
          filter:        'drop-shadow(0 -8px 32px rgba(0,0,0,0.4))',
        }}
      >
        <GreetingCard t={t} visible={opened} />
      </div>

      {/* ══════════════════════════════════════════
          ENVELOPE BODY
          z-index: 10 (below card's 50)
          onClick only active when !opened
      ══════════════════════════════════════════ */}
      <div
        className={`relative select-none
          ${!opened ? 'envelope-hover cursor-pointer' : 'cursor-default'}`}
        onClick={!opened ? handleOpen : undefined}
        style={{
          paddingTop:   '64%',
          background:   'linear-gradient(162deg, #DEC07A 0%, #C4A15A 48%, #9A7830 100%)',
          boxShadow:    '0 24px 64px rgba(0,0,0,0.62), 0 8px 22px rgba(0,0,0,0.42)',
          borderRadius: '8px 8px 14px 14px',
          zIndex:       10,
        }}
      >

        {/* Inside gold (revealed after open) */}
        <div
          id="env-inside"
          className="env-inside absolute inset-0 rounded-lg pointer-events-none"
          style={{
            zIndex:     1,
            background: 'linear-gradient(180deg, #EACA6C 0%, #B8902A 100%)',
            opacity:    0,
          }}
        />

        {/* Islamic geometric tile pattern */}
        <div
          className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none"
          style={{ zIndex: 2, opacity: 0.1 }}
        >
          <EnvelopePattern />
        </div>

        {/* Side depth shadows */}
        <div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            zIndex:     3,
            background: 'linear-gradient(90deg, rgba(0,0,0,0.08) 0%, transparent 16%, transparent 84%, rgba(0,0,0,0.08) 100%)',
          }}
        />

        {/* ── Left bottom-fold triangle ── */}
        <div
          className="absolute bottom-0 left-0 pointer-events-none"
          style={{
            zIndex:     4,
            width:      '52%',
            height:     '56%',
            background: 'linear-gradient(138deg, #C8AA60 0%, #9A7830 100%)',
            clipPath:   'polygon(0 100%, 0 0, 100% 100%)',
          }}
        />

        {/* ── Right bottom-fold triangle ── */}
        <div
          className="absolute bottom-0 right-0 pointer-events-none"
          style={{
            zIndex:     4,
            width:      '52%',
            height:     '56%',
            background: 'linear-gradient(222deg, #C8AA60 0%, #9A7830 100%)',
            clipPath:   'polygon(100% 100%, 100% 0, 0 100%)',
          }}
        />

        {/* ── TOP FLAP — 3D rotates open ──
            z-index 5 inside the envelope's stacking context.
            The envelope body (z-index:10 on the PARENT) is below
            the card (z-index:50), so the flap never covers the card.
        ── */}
        <div
          id="env-flap"
          className="env-flap absolute top-0 left-0 right-0 pointer-events-none"
          style={{
            zIndex:     5,
            height:     '54%',
            background: 'linear-gradient(178deg, #DEC07A 0%, #B28C38 100%)',
            clipPath:   'polygon(0 0, 50% 100%, 100% 0)',
            boxShadow:  '0 5px 14px rgba(0,0,0,0.28)',
          }}
        >
          <div className="absolute bottom-0 left-1/4 right-1/4 h-px" style={{ background: 'rgba(0,0,0,0.12)' }} />
          <div className="absolute top-2 left-1/3 right-1/3 h-px"   style={{ background: 'rgba(255,255,255,0.18)' }} />
        </div>

        {/* ── Wax seal — z-index 6 inside envelope ── */}
        <div
          id="env-seal"
          className="seal-wrap absolute top-1/2 left-1/2"
          style={{
            zIndex:    6,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <WaxSeal />
        </div>

        {/* ── Arabic label ── */}
        <div
          id="env-label"
          className="absolute bottom-5 left-0 right-0 flex justify-center pointer-events-none"
          style={{ zIndex: 6 }}
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

      </div>{/* /envelope body */}

    </div>
  )
}

export default Envelope
