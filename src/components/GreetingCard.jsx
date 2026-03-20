import {
  CrescentMoon,
  MosqueSVG,
  GeomDivider,
  CornerOrnament,
  LanternSVG,
  StarDot,
} from './SvgIcons.jsx'

// ── Logo circle (tanpa label teks) ──
const LogoCircle = ({ src, alt, fallbackIcon, size = 'sm' }) => (
  <div
    className="logo-circle rounded-full overflow-hidden flex items-center justify-center"
    style={{
      width:      size === 'lg' ? 'clamp(52px, 14vw, 72px)' : 'clamp(40px, 11vw, 56px)',
      height:     size === 'lg' ? 'clamp(52px, 14vw, 72px)' : 'clamp(40px, 11vw, 56px)',
      border:     size === 'lg' ? '2px solid rgba(201,148,26,0.6)' : '1.5px solid rgba(201,148,26,0.45)',
      background: 'rgba(255,255,255,0.80)',
      boxShadow:  '0 2px 14px rgba(0,0,0,0.12)',
      flexShrink: 0,
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
    <div className="hidden flex-col items-center justify-center w-full h-full" style={{ display: 'none' }}>
      {fallbackIcon}
    </div>
  </div>
)

// ── Main card ──
const GreetingCard = ({ t }) => (
  <div
    className="relative overflow-hidden rounded-2xl font-poppins paper-lines"
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
    <div className="absolute top-4 left-4"><CornerOrnament /></div>
    <div className="absolute top-4 right-4"><CornerOrnament flipX /></div>
    <div className="absolute bottom-4 left-4"><CornerOrnament flipY /></div>
    <div className="absolute bottom-4 right-4"><CornerOrnament flipX flipY /></div>

    {/* === CARD CONTENT === */}
    <div className="relative z-10"
      style={{ padding: 'clamp(16px, 5vw, 44px) clamp(14px, 4.5vw, 40px)' }}>

      {/* ── 1. Logos row (tanpa label teks) ── */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 mb-3">
        <LogoCircle src="/mpk.png" alt="MPK"
          fallbackIcon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9941A" strokeWidth="1.5">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          }
        />
        <LogoCircle src="/smantas.png" alt="SMAN 13" size="lg"
          fallbackIcon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C9941A" strokeWidth="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
          }
        />
        <LogoCircle src="/osis.png" alt="OSIS"
          fallbackIcon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9941A" strokeWidth="1.5">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          }
        />
      </div>

      {/* ── 2. Top divider ── */}
      <GeomDivider />

      {/* ── 3. Arabic text ── */}
      <div className="text-center my-2 font-amiri"
        style={{
          direction:     'rtl',
          fontSize:      'clamp(0.85rem, 3.5vw, 1.35rem)',
          color:         '#B8840E',
          letterSpacing: '2px',
          textShadow:    '0 1px 4px rgba(201,148,26,0.18)',
        }}>
        {t.arabic}
      </div>

      {/* ── 4. Divider ── */}
      <GeomDivider opacity={0.6} />

      {/* ── 5. Mosque SVG ── */}
      <div className="flex justify-center my-2">
        <div className="moon-glow">
          <MosqueSVG size={Math.min(110, window?.innerWidth ? window.innerWidth * 0.22 : 90)} />
        </div>
      </div>

      {/* ── 6. Lanterns ── */}
      <div className="flex items-end justify-center gap-4 sm:gap-7 mb-3">
        <div className="lantern-1"><LanternSVG size={22} /></div>
        <div className="lantern-2"><LanternSVG size={30} /></div>
        <div className="lantern-3"><LanternSVG size={22} /></div>
      </div>

      {/* ── 7. Main heading ── */}
      <div className="text-center mb-3">
        <h1 className="font-poppins font-black gold-shimmer-text leading-none tracking-tight"
          style={{ fontSize: 'clamp(1.7rem, 7.5vw, 3.6rem)' }}>
          {t.line1}
        </h1>
        <h2 className="font-poppins font-bold mt-1 tracking-wide"
          style={{ fontSize: 'clamp(0.95rem, 4vw, 1.85rem)', color: '#0F7A6B' }}>
          {t.line2}
        </h2>

        <div
          className="font-amiri mt-2"
          style={{
            direction:     'rtl',
            fontSize:      'clamp(1.1rem, 4.5vw, 1.75rem)',
            color:         '#B8840E',
            letterSpacing: '3px',
            lineHeight:    1.6,
            textShadow:    '0 1px 8px rgba(201,148,26,0.25)',
          }}
        >
          مِنَ الْعَائِدِيْنَ وَالْفَائِزِيْنَ
        </div>
      </div>

      {/* ── 8. Sub pill ── */}
      <div className="flex justify-center mb-2">
        <span className="font-poppins font-bold inline-block rounded-full tracking-wide"
          style={{
            padding:    'clamp(4px,1.5vw,6px) clamp(12px,3.5vw,20px)',
            background: 'rgba(15,122,107,0.1)',
            border:     '1px solid rgba(15,122,107,0.28)',
            color:      '#0F7A6B',
            fontSize:   'clamp(0.7rem, 2.5vw, 0.95rem)',
          }}>
          {t.sub}
        </span>
      </div>

      {/* ── 9. Ornamental star divider ── */}
      <div className="ornament-line my-2">
        <StarDot size={14} />
      </div>

      {/* ── 10. Body text ── */}
      <p className="font-poppins font-normal text-center leading-relaxed"
        style={{
          fontSize:   'clamp(0.7rem, 2.2vw, 0.9rem)',
          color:      '#2E200A',
          maxWidth:   '400px',
          margin:     '0 auto 4px',
          lineHeight: 1.8,
        }}>
        {t.body}
      </p>
      <p className="text-center font-poppins font-semibold italic mb-3"
        style={{ fontSize: 'clamp(0.65rem, 1.8vw, 0.82rem)', color: '#C9941A' }}>
        — {t.dua} —
      </p>

      {/* ── 11. Year ribbon ── */}
      <div className="flex justify-center mb-4">
        <span className="font-poppins font-semibold text-white uppercase rounded"
          style={{
            fontSize:      'clamp(0.58rem, 1.8vw, 0.72rem)',
            letterSpacing: '2px',
            padding:       'clamp(4px,1.2vw,6px) clamp(12px,3vw,20px)',
            background:    'linear-gradient(135deg, #0F7A6B, #12A08E)',
            boxShadow:     '0 2px 12px rgba(15,122,107,0.3)',
          }}>
          {t.year}
        </span>
      </div>

      {/* ── 12. Sender box ── */}
      <div className="text-center pt-3 mb-2"
        style={{ borderTop: '1px solid rgba(201,148,26,0.2)' }}>
        <p className="font-poppins font-semibold uppercase tracking-widest mb-1"
          style={{ fontSize: 'clamp(0.55rem, 1.5vw, 0.62rem)', letterSpacing: '3px', color: '#0F7A6B' }}>
          {t.senderFrom}
        </p>
        <p className="font-poppins font-black"
          style={{ fontSize: 'clamp(0.9rem, 3vw, 1.2rem)', color: '#C9941A' }}>
          MPK &amp; OSIS
        </p>
        <p className="font-poppins font-bold uppercase mt-0.5"
          style={{ fontSize: 'clamp(0.6rem, 1.8vw, 0.72rem)', color: '#0F7A6B', letterSpacing: '0.5px' }}>
          SMA Negeri 13 Pontianak
        </p>
      </div>

      {/* ── 13. Bottom divider ── */}
      <GeomDivider opacity={0.5} />

    </div>
  </div>
)

export default GreetingCard
