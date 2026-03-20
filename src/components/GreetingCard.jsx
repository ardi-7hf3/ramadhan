import {
  CrescentMoon,
  MosqueSVG,
  GeomDivider,
  CornerOrnament,
  LanternSVG,
  StarDot,
} from './SvgIcons.jsx'

// ── Logo circle ──
const LogoCircle = ({ src, alt, fallbackIcon }) => (
  <div className="flex flex-col items-center gap-1.5">
    <div
      className="logo-circle w-14 h-14 rounded-full overflow-hidden flex items-center justify-center"
      style={{
        border:     '1.5px solid rgba(201,148,26,0.45)',
        background: 'rgba(255,255,255,0.72)',
        boxShadow:  '0 2px 14px rgba(0,0,0,0.12)',
      }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={e => {
          e.target.style.display = 'none'
          e.target.nextSibling.style.display = 'flex'
        }}
      />
      <div
        className="hidden flex-col items-center justify-center w-full h-full"
        style={{ display: 'none' }}
      >
        {fallbackIcon}
      </div>
    </div>
    <span
      className="font-poppins font-bold tracking-widest uppercase"
      style={{ fontSize: '0.58rem', color: '#C9941A' }}
    >
      {alt}
    </span>
  </div>
)

// ── Wish item ──
const WishItem = ({ text }) => (
  <div
    className="wish-card flex items-center gap-2.5 rounded-lg px-3 py-2.5"
    style={{
      background: 'rgba(201,148,26,0.055)',
      border:     '1px solid rgba(201,148,26,0.14)',
    }}
  >
    <div
      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
      style={{ background: '#C9941A' }}
    />
    <span
      className="font-poppins font-semibold text-xs leading-tight"
      style={{ color: '#2E200A' }}
    >
      {text}
    </span>
  </div>
)

// ── Main card ──
const GreetingCard = ({ t, visible }) => (
  <div
    className={`relative overflow-hidden rounded-2xl font-poppins paper-lines
      ${visible ? 'reveal-stagger' : ''}`}
    style={{
      background: 'linear-gradient(155deg, #FFFCF0 0%, #FDF5DA 42%, #F5E8BC 100%)',
      boxShadow:
        '0 36px 90px rgba(0,0,0,0.52), 0 10px 28px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.85)',
      border: '1px solid rgba(201,148,26,0.22)',
    }}
  >
    {/* Gold inner frame */}
    <div
      className="absolute inset-3 rounded-xl pointer-events-none"
      style={{ border: '1px solid rgba(201,148,26,0.18)' }}
    >
      <div
        className="absolute inset-1 rounded-lg"
        style={{ border: '0.5px solid rgba(201,148,26,0.1)' }}
      />
    </div>

    {/* Corner ornaments */}
    <div className="absolute top-4 left-4">
      <CornerOrnament />
    </div>
    <div className="absolute top-4 right-4">
      <CornerOrnament flipX />
    </div>
    <div className="absolute bottom-4 left-4">
      <CornerOrnament flipY />
    </div>
    <div className="absolute bottom-4 right-4">
      <CornerOrnament flipX flipY />
    </div>

    {/* === CARD CONTENT === */}
    <div className="relative z-10 px-8 py-8 md:px-12 md:py-10">

      {/* ── 1. Logos row ── */}
      <div className="flex items-center justify-center gap-5 mb-5">
        <LogoCircle
          src="/mpk.png"
          alt="MPK"
          fallbackIcon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9941A" strokeWidth="1.5">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          }
        />

        {/* Mosque center */}
        <div className="flex-1 flex justify-center">
          <div className="moon-glow">
            <MosqueSVG size={110} />
          </div>
        </div>

        <LogoCircle
          src="/osis.png"
          alt="OSIS"
          fallbackIcon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9941A" strokeWidth="1.5">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          }
        />
      </div>

      {/* ── 2. Top divider ── */}
      <GeomDivider />

      {/* ── 3. Arabic text ── */}
      <div
        className="text-center my-3 font-amiri"
        style={{
          direction:     'rtl',
          fontSize:      'clamp(1rem, 3vw, 1.35rem)',
          color:         '#B8840E',
          letterSpacing: '2px',
          textShadow:    '0 1px 4px rgba(201,148,26,0.18)',
        }}
      >
        {t.arabic}
      </div>
      <p
        className="text-center font-poppins italic mb-2"
        style={{ fontSize: '0.68rem', color: 'rgba(46,32,10,0.55)', letterSpacing: '0.5px' }}
      >
        {t.arabicSub}
      </p>

      {/* ── 4. Divider ── */}
      <GeomDivider opacity={0.6} />

      {/* ── 5. Moon SVG ── */}
      <div className="flex justify-center my-3">
        <div className="moon-glow">
          <CrescentMoon size={72} />
        </div>
      </div>

      {/* ── 6. Lanterns ── */}
      <div className="flex items-end justify-center gap-7 mb-5">
        <div className="lantern-1"><LanternSVG size={26} /></div>
        <div className="lantern-2"><LanternSVG size={34} /></div>
        <div className="lantern-3"><LanternSVG size={26} /></div>
      </div>

      {/* ── 7. Main heading ── */}
      <div className="text-center mb-3">
        <h1
          className="font-poppins font-black gold-shimmer-text leading-none tracking-tight"
          style={{ fontSize: 'clamp(2.2rem, 8vw, 3.6rem)' }}
        >
          {t.line1}
        </h1>
        <h2
          className="font-poppins font-bold mt-1 tracking-wide"
          style={{ fontSize: 'clamp(1.15rem, 4vw, 1.85rem)', color: '#0F7A6B' }}
        >
          {t.line2}
        </h2>
      </div>

      {/* ── 8. Sub pill ── */}
      <div className="flex justify-center mb-2">
        <span
          className="font-poppins font-bold inline-block px-5 py-1.5 rounded-full text-sm tracking-wide"
          style={{
            background: 'rgba(15,122,107,0.1)',
            border:     '1px solid rgba(15,122,107,0.28)',
            color:      '#0F7A6B',
            fontSize:   'clamp(0.8rem,2.2vw,0.95rem)',
          }}
        >
          {t.sub}
        </span>
      </div>

      {/* Ornamental star divider */}
      <div className="ornament-line my-3">
        <StarDot size={16} />
      </div>

      {/* ── 9. Body text ── */}
      <p
        className="font-poppins font-normal text-center leading-relaxed mb-1"
        style={{
          fontSize:  'clamp(0.78rem, 2vw, 0.9rem)',
          color:     '#2E200A',
          maxWidth:  '400px',
          margin:    '0 auto 6px',
          lineHeight: 1.85,
        }}
      >
        {t.body}
      </p>
      <p
        className="text-center font-poppins font-semibold italic mb-4"
        style={{ fontSize: 'clamp(0.75rem, 1.8vw, 0.85rem)', color: '#C9941A' }}
      >
        — {t.dua} —
      </p>

      {/* ── 10. Year ribbon ── */}
      <div className="flex justify-center mb-5">
        <span
          className="font-poppins font-semibold text-white text-xs tracking-widest uppercase px-5 py-1.5 rounded"
          style={{
            background: 'linear-gradient(135deg, #0F7A6B, #12A08E)',
            boxShadow:  '0 2px 12px rgba(15,122,107,0.3)',
            letterSpacing: '2.5px',
          }}
        >
          {t.year}
        </span>
      </div>

      {/* ── 11. Wishes grid ── */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        {t.wishes.map((w, i) => (
          <WishItem key={i} text={w} />
        ))}
      </div>

      {/* ── 12. Sender box ── */}
      <div
        className="text-center pt-4 mb-3"
        style={{ borderTop: '1px solid rgba(201,148,26,0.2)' }}
      >
        <p
          className="font-poppins font-semibold uppercase tracking-widest mb-1.5"
          style={{ fontSize: '0.62rem', letterSpacing: '3px', color: '#0F7A6B' }}
        >
          {t.senderFrom}
        </p>
        <p
          className="font-poppins font-black"
          style={{ fontSize: 'clamp(1rem, 2.8vw, 1.2rem)', color: '#C9941A' }}
        >
          MPK &amp; OSIS
        </p>
        <p
          className="font-poppins font-normal italic mt-1"
          style={{ fontSize: '0.7rem', color: '#4A3520', opacity: 0.72 }}
        >
          {t.senderSub}
        </p>
      </div>

      {/* ── 13. Bottom divider ── */}
      <GeomDivider opacity={0.5} />

    </div>
  </div>
)

export default GreetingCard
