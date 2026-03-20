import { useCallback } from 'react'
import { WaxSeal, EnvelopePattern } from './SvgIcons.jsx'
import GreetingCard from './GreetingCard.jsx'

/**
 * ANIMATION SEQUENCE (ms):
 *   0   — user clicks
 *   0   — flap starts rotating open (3D flip up)
 *  100  — wax seal dissolves
 *  180  — arabic label fades
 *  500  — envelope inside brightens (card pocket visible)
 *  600  — card starts rising from inside envelope (clipped, only top visible)
 * 1500  — card fully risen above envelope, clip released, fully interactive
 *
 * KEY TECHNIQUE:
 *  The card lives inside a "clip window" that is exactly the height of the
 *  envelope body. While the card is inside the clip window, overflow:hidden
 *  hides everything below the envelope top — making the card appear to rise
 *  out of the envelope pocket. Once the card clears the top, overflow is
 *  released and the full card is visible above the envelope.
 */

const Envelope = ({ t, opened, onOpen }) => {

  const handleOpen = useCallback(() => {
    if (opened) return
    onOpen()

    requestAnimationFrame(() => {
      const flap   = document.getElementById('env-flap')
      const seal   = document.getElementById('env-seal')
      const label  = document.getElementById('env-label')
      const inside = document.getElementById('env-inside')

      // Step 1 — flap rotates open
      if (flap) flap.classList.add('flap-open')

      // Step 2 — seal dissolves
      if (seal) setTimeout(() => seal.classList.add('seal-gone'), 100)

      // Step 3 — label fades
      if (label) setTimeout(() => {
        label.style.opacity    = '0'
        label.style.transition = 'opacity 0.3s ease'
      }, 180)

      // Step 4 — envelope inside brightens (pocket visible)
      if (inside) setTimeout(() => inside.classList.add('inside-show'), 500)
    })

    // Step 5 — card begins rising from inside the envelope
    setTimeout(() => {
      const card    = document.getElementById('card-inner')
      const clipWin = document.getElementById('card-clip-window')
      if (card) card.classList.add('card-rising')

      // Step 6 — once card has cleared the envelope top, release the clip
      // and make it fully interactive
      setTimeout(() => {
        if (clipWin) {
          clipWin.style.overflow  = 'visible'
          clipWin.style.zIndex    = '50'
        }
        if (card) {
          card.style.pointerEvents = 'auto'
          card.classList.add('card-risen')
        }
      }, 950)
    }, 600)

  }, [opened, onOpen])

  return (
    <div
      className="relative"
      style={{
        width:       'clamp(280px, 76vw, 448px)',
        perspective: '1200px',
      }}
    >

      {/*
        ╔══════════════════════════════════════════════════════╗
        ║  CARD CLIP WINDOW                                    ║
        ║                                                      ║
        ║  Sits directly on top of the envelope body,          ║
        ║  same width, overflow:hidden initially.              ║
        ║  The card (#card-inner) starts fully below the top  ║
        ║  edge (translateY = 0 = flush with envelope top),   ║
        ║  then animates to translateY(-100%) — rising up.    ║
        ║                                                      ║
        ║  While card is still inside the clip window,        ║
        ║  overflow:hidden makes it look like it's coming     ║
        ║  out of the envelope pocket.                         ║
        ╚══════════════════════════════════════════════════════╝
      */}
      <div
        id="card-clip-window"
        className="absolute left-0 right-0"
        style={{
          /* sits at the very top of the envelope */
          bottom:   0,
          top:      0,
          zIndex:   20,
          overflow: 'hidden',      /* clips card while still inside */
          pointerEvents: 'none',
        }}
      >
        {/*
          The card starts translated DOWN so it is fully hidden
          inside the envelope (below the clip window top edge).
          translateY(0) = card top is at envelope top (still hidden
          behind the envelope face because clip window clips it).
          On .card-rising → translateY(-100%) = card fully above envelope.
        */}
        <div
          id="card-inner"
          className="card-inner absolute left-1/2"
          style={{
            bottom:        0,
            transform:     'translateX(-50%) translateY(100%)',
            width:         '92%',
            pointerEvents: 'none',
            zIndex:        20,
            filter:        'drop-shadow(0 -6px 24px rgba(0,0,0,0.45))',
          }}
        >
          <GreetingCard t={t} visible={opened} />
        </div>
      </div>

      {/*
        ╔══════════════════════════════════════════════════════╗
        ║  ENVELOPE BODY  (z-index 10, below clip window 20)  ║
        ╚══════════════════════════════════════════════════════╝
      */}
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
        {/* Envelope inside / pocket */}
        <div
          id="env-inside"
          className="env-inside absolute inset-0 rounded-lg pointer-events-none"
          style={{
            zIndex:     1,
            background: 'linear-gradient(180deg, #EACA6C 0%, #B8902A 100%)',
            opacity:    0,
          }}
        />

        {/* Islamic geometric pattern overlay */}
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
            background: 'linear-gradient(90deg, rgba(0,0,0,0.09) 0%, transparent 16%, transparent 84%, rgba(0,0,0,0.09) 100%)',
          }}
        />

        {/* Left bottom-fold triangle */}
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

        {/* Right bottom-fold triangle */}
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

        {/* TOP FLAP — 3D rotates open, z-5 inside envelope stacking ctx */}
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
          <div className="absolute bottom-0 left-1/4 right-1/4 h-px"
            style={{ background: 'rgba(0,0,0,0.12)' }} />
          <div className="absolute top-2 left-1/3 right-1/3 h-px"
            style={{ background: 'rgba(255,255,255,0.18)' }} />
        </div>

        {/* Wax seal */}
        <div
          id="env-seal"
          className="seal-wrap absolute top-1/2 left-1/2"
          style={{ zIndex: 6, transform: 'translate(-50%, -50%)' }}
        >
          <WaxSeal />
        </div>

        {/* Arabic label */}
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
