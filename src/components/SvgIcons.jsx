// ════════════════════════════════════════════════════════
//  SVG COMPONENTS — All custom-crafted, no emoji
// ════════════════════════════════════════════════════════

// ── Crescent Moon + Stars ──
export const CrescentMoon = ({ size = 80, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <radialGradient id="moonGrad" cx="35%" cy="30%">
        <stop offset="0%"   stopColor="#F5D87A" />
        <stop offset="100%" stopColor="#C9941A" />
      </radialGradient>
      <filter id="moonFilter" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.8" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Crescent body */}
    <path
      d="M40 8 A32 32 0 1 1 39.9 8 A20 20 0 1 0 40 8 Z"
      fill="url(#moonGrad)"
      transform="rotate(20 40 40)"
      filter="url(#moonFilter)"
    />

    {/* Large star */}
    <path
      d="M58 16 L59.7 21.2 L65.1 21.2 L60.8 24.4 L62.5 29.6 L58 26.4 L53.5 29.6 L55.2 24.4 L50.9 21.2 L56.3 21.2 Z"
      fill="#F5D87A"
      opacity="0.9"
    />

    {/* Small star */}
    <path
      d="M66 9 L66.9 11.8 L69.8 11.8 L67.5 13.5 L68.4 16.3 L66 14.6 L63.6 16.3 L64.5 13.5 L62.2 11.8 L65.1 11.8 Z"
      fill="#E8B84B"
      opacity="0.75"
    />

    {/* Tiny dot stars */}
    <circle cx="70" cy="28" r="1.5" fill="#F5D87A" opacity="0.6" />
    <circle cx="62" cy="36" r="1"   fill="#E8B84B" opacity="0.5" />
    <circle cx="72" cy="42" r="1"   fill="#F5D87A" opacity="0.4" />
  </svg>
)

// ── Mosque Illustration ──
export const MosqueSVG = ({ size = 120 }) => (
  <svg
    width={size}
    height={Math.round(size * 0.72)}
    viewBox="0 0 160 116"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="mGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor="#E8B84B" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#C9941A" stopOpacity="0.55" />
      </linearGradient>
      <filter id="mf" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation="0.8" result="b" />
        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>

    {/* Ground platform */}
    <rect x="0" y="104" width="160" height="12" rx="2"
      fill="rgba(201,148,26,0.12)" stroke="#C9941A" strokeWidth="0.8" />

    {/* === LEFT MINARET === */}
    <rect x="12" y="56" width="11" height="48" rx="2"
      fill="rgba(201,148,26,0.08)" stroke="#C9941A" strokeWidth="0.85" />
    {/* minaret arch windows */}
    <ellipse cx="17.5" cy="72" rx="3.5" ry="5"
      fill="none" stroke="#C9941A" strokeWidth="0.6" opacity="0.6" />
    <ellipse cx="17.5" cy="88" rx="3.5" ry="5"
      fill="none" stroke="#C9941A" strokeWidth="0.6" opacity="0.6" />
    {/* minaret dome */}
    <path d="M12 56 Q17.5 44 23 56"
      fill="rgba(201,148,26,0.18)" stroke="#C9941A" strokeWidth="0.9" />
    <circle cx="17.5" cy="43" r="2.8" fill="#E8B84B" stroke="#C9941A" strokeWidth="0.6" />
    {/* minaret finial */}
    <line x1="17.5" y1="40" x2="17.5" y2="32"
      stroke="#C9941A" strokeWidth="1.1" strokeLinecap="round" />
    <circle cx="17.5" cy="31" r="1.8" fill="#F5D87A" />

    {/* === RIGHT MINARET === */}
    <rect x="137" y="56" width="11" height="48" rx="2"
      fill="rgba(201,148,26,0.08)" stroke="#C9941A" strokeWidth="0.85" />
    <ellipse cx="142.5" cy="72" rx="3.5" ry="5"
      fill="none" stroke="#C9941A" strokeWidth="0.6" opacity="0.6" />
    <ellipse cx="142.5" cy="88" rx="3.5" ry="5"
      fill="none" stroke="#C9941A" strokeWidth="0.6" opacity="0.6" />
    <path d="M137 56 Q142.5 44 148 56"
      fill="rgba(201,148,26,0.18)" stroke="#C9941A" strokeWidth="0.9" />
    <circle cx="142.5" cy="43" r="2.8" fill="#E8B84B" stroke="#C9941A" strokeWidth="0.6" />
    <line x1="142.5" y1="40" x2="142.5" y2="32"
      stroke="#C9941A" strokeWidth="1.1" strokeLinecap="round" />
    <circle cx="142.5" cy="31" r="1.8" fill="#F5D87A" />

    {/* === MAIN BUILDING BODY === */}
    <path d="M26 104 V64 Q80 52 134 64 V104 Z"
      fill="rgba(201,148,26,0.07)" stroke="#C9941A" strokeWidth="0.9" />

    {/* === MAIN DOME === */}
    <path d="M46 64 Q80 18 114 64"
      fill="rgba(201,148,26,0.18)" stroke="#C9941A" strokeWidth="1.2" />
    {/* dome details */}
    <path d="M52 64 Q80 28 108 64"
      fill="none" stroke="rgba(201,148,26,0.25)" strokeWidth="0.6" />

    {/* === SIDE DOMES === */}
    <path d="M26 84 Q38 70 50 84"
      fill="rgba(201,148,26,0.12)" stroke="#C9941A" strokeWidth="0.8" />
    <path d="M110 84 Q122 70 134 84"
      fill="rgba(201,148,26,0.12)" stroke="#C9941A" strokeWidth="0.8" />

    {/* === MAIN DOOR (arch) === */}
    <path d="M70 104 V84 Q80 72 90 84 V104 Z"
      fill="rgba(201,148,26,0.12)" stroke="#C9941A" strokeWidth="0.9" />
    {/* door detail lines */}
    <line x1="80" y1="72" x2="80" y2="104"
      stroke="rgba(201,148,26,0.2)" strokeWidth="0.5" />

    {/* Side windows */}
    <ellipse cx="55" cy="82" rx="6" ry="8"
      fill="none" stroke="#C9941A" strokeWidth="0.7" opacity="0.55" />
    <ellipse cx="105" cy="82" rx="6" ry="8"
      fill="none" stroke="#C9941A" strokeWidth="0.7" opacity="0.55" />

    {/* Small round windows */}
    <circle cx="40" cy="96" r="4"
      fill="none" stroke="#C9941A" strokeWidth="0.6" opacity="0.45" />
    <circle cx="120" cy="96" r="4"
      fill="none" stroke="#C9941A" strokeWidth="0.6" opacity="0.45" />

    {/* === CENTER FINIAL === */}
    <line x1="80" y1="18" x2="80" y2="6"
      stroke="#C9941A" strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="80" cy="5" r="3.2" fill="#E8B84B" />

    {/* Horizontal decorative band */}
    <line x1="26" y1="68" x2="134" y2="68"
      stroke="rgba(201,148,26,0.2)" strokeWidth="0.6" />
  </svg>
)

// ── Geometric Islamic Divider ──
export const GeomDivider = ({ opacity = 1 }) => (
  <svg
    width="100%"
    height="20"
    viewBox="0 0 400 20"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity }}
  >
    <line x1="0"   y1="10" x2="148" y2="10"
      stroke="rgba(201,148,26,0.3)" strokeWidth="0.8" />
    <polygon points="154,10 162,3 170,10 162,17"
      fill="none" stroke="#C9941A" strokeWidth="0.9" />
    <polygon points="174,10 182,3 190,10 182,17"
      fill="rgba(201,148,26,0.22)" stroke="#C9941A" strokeWidth="0.9" />
    <polygon points="194,10 202,3 210,10 202,17"
      fill="none" stroke="#C9941A" strokeWidth="0.9" />
    <line x1="216" y1="10" x2="400" y2="10"
      stroke="rgba(201,148,26,0.3)" strokeWidth="0.8" />
  </svg>
)

// ── Wax Seal ──
export const WaxSeal = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="sealGrad" cx="38%" cy="33%">
        <stop offset="0%"   stopColor="#C02020" />
        <stop offset="100%" stopColor="#5C0A0A" />
      </radialGradient>
    </defs>
    <circle cx="36" cy="36" r="32" fill="url(#sealGrad)" />
    <circle cx="36" cy="36" r="30" fill="none"
      stroke="#D03030" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.6" />
    <circle cx="36" cy="36" r="23" fill="none"
      stroke="rgba(255,200,150,0.2)" strokeWidth="0.8" />
    {/* Star pattern */}
    <path
      d="M36 20 L38.2 27 L45.6 24.4 L40.4 30 L45.6 35.6 L38.2 33 L36 40 L33.8 33 L26.4 35.6 L31.6 30 L26.4 24.4 L33.8 27 Z"
      fill="rgba(255,200,150,0.18)" stroke="rgba(255,200,150,0.42)" strokeWidth="0.8"
    />
    {/* Crescent center */}
    <path
      d="M36 27 A9 9 0 1 1 35.9 27 A5.5 5.5 0 1 0 36 27 Z"
      fill="rgba(255,220,150,0.6)" transform="rotate(15 36 36)"
    />
    {/* Arabic text on seal */}
    <text x="36" y="55" textAnchor="middle"
      fontSize="6.5" fontFamily="Amiri,serif"
      fill="rgba(255,220,150,0.65)" letterSpacing="0.5">
      بِسْمِ
    </text>
  </svg>
)

// ── Corner Ornament ──
export const CornerOrnament = ({ flipX = false, flipY = false }) => (
  <svg
    width="40" height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})`,
    }}
  >
    <path
      d="M4 36 L4 4 L36 4"
      stroke="rgba(201,148,26,0.48)"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 20 L20 4"
      stroke="rgba(201,148,26,0.22)"
      strokeWidth="0.8"
      strokeLinecap="round"
    />
    <circle cx="4" cy="4" r="2.5" fill="rgba(201,148,26,0.42)" />
  </svg>
)

// ── Lantern ──
export const LanternSVG = ({ size = 36 }) => (
  <svg
    width={size}
    height={Math.round(size * 1.5)}
    viewBox="0 0 36 54"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Hanger */}
    <line x1="18" y1="0" x2="18" y2="7"
      stroke="#9A7830" strokeWidth="1.5" strokeLinecap="round" />
    {/* Top cap */}
    <rect x="7" y="7" width="22" height="2.5" rx="1.2" fill="#9A7830" />
    {/* Body */}
    <path d="M5 12 Q18 9 31 12 L33 42 Q18 47 3 42 Z"
      fill="rgba(201,148,26,0.13)" stroke="#C9941A" strokeWidth="1" />
    {/* Inner glow */}
    <path d="M8 14 Q18 12 28 14 L30 40 Q18 44 6 40 Z"
      fill="rgba(232,184,75,0.1)" />
    {/* Vertical ribs */}
    <line x1="18" y1="12" x2="18" y2="42"
      stroke="rgba(201,148,26,0.22)" strokeWidth="0.7" />
    <line x1="10" y1="13" x2="9"  y2="41"
      stroke="rgba(201,148,26,0.12)" strokeWidth="0.5" />
    <line x1="26" y1="13" x2="27" y2="41"
      stroke="rgba(201,148,26,0.12)" strokeWidth="0.5" />
    {/* Horizontal band */}
    <line x1="4"  y1="27" x2="32" y2="27"
      stroke="rgba(201,148,26,0.22)" strokeWidth="0.6" />
    {/* Middle panel */}
    <path d="M9 19 L27 19 L28 35 L8 35 Z"
      fill="rgba(245,216,122,0.15)" stroke="rgba(201,148,26,0.2)" strokeWidth="0.5" />
    {/* Bottom cap */}
    <rect x="7" y="42" width="22" height="2.5" rx="1.2" fill="#9A7830" />
    {/* Tassel */}
    <path d="M13 44.5 Q18 50 23 44.5"
      fill="rgba(201,148,26,0.28)" stroke="#C9941A" strokeWidth="0.9" />
    <line x1="18" y1="50" x2="18" y2="54"
      stroke="#9A7830" strokeWidth="1" strokeLinecap="round" />
  </svg>
)

// ── Islamic Envelope Pattern (tile) ──
export const EnvelopePattern = () => (
  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="envPat" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
        <path d="M18 0 L36 18 L18 36 L0 18 Z"
          fill="none" stroke="rgba(50,25,0,0.55)" strokeWidth="0.8" />
        <circle cx="18" cy="18" r="5.5"
          fill="none" stroke="rgba(50,25,0,0.3)" strokeWidth="0.6" />
        <path d="M18 12.5 L20 16 L18 19.5 L16 16 Z"
          fill="none" stroke="rgba(50,25,0,0.22)" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#envPat)" />
  </svg>
)

// ── Ornamental star dot ──
export const StarDot = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7 1 L8.3 5 L12.5 5 L9.2 7.5 L10.5 11.5 L7 9 L3.5 11.5 L4.8 7.5 L1.5 5 L5.7 5 Z"
      fill="rgba(201,148,26,0.55)" stroke="#C9941A" strokeWidth="0.5"
    />
  </svg>
)
