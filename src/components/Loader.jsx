const Loader = ({ done }) => (
  <div
    className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-6
      transition-all duration-700 ${done ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    style={{
      background: 'radial-gradient(ellipse at 50% 45%, #0E1F3D 0%, #05090F 100%)',
    }}
  >
    {/* Crescent spinner */}
    <div className="relative w-36 h-36 flex items-center justify-center">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(201,148,26,0.18) 0%, transparent 70%)',
        }}
      />

      <svg
        width="144" height="144"
        viewBox="0 0 144 144"
        className="animate-spin-slow"
        style={{ filter: 'drop-shadow(0 0 18px rgba(201,148,26,0.4))' }}
      >
        {/* Orbit ring */}
        <circle cx="72" cy="72" r="62"
          stroke="rgba(201,148,26,0.1)" strokeWidth="1" fill="none" strokeDasharray="5 4" />

        {/* Crescent body */}
        <path
          d="M72 18 A54 54 0 1 1 71.9 18 A34 34 0 1 0 72 18 Z"
          fill="#C9941A"
          transform="rotate(20 72 72)"
        />

        {/* Orbit dots */}
        <circle cx="72"  cy="10"  r="5.5" fill="#F5D87A" />
        <circle cx="134" cy="72"  r="4"   fill="#E8B84B" />
        <circle cx="10"  cy="72"  r="4"   fill="#E8B84B" />
        <circle cx="72"  cy="134" r="3"   fill="#C9941A" />

        <defs>
          <filter id="loaderMoonFilter">
            <feGaussianBlur stdDeviation="1.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>

    {/* Arabic calligraphy */}
    <div
      className="font-amiri text-center animate-shimmer"
      style={{
        fontSize:   'clamp(1.4rem, 4vw, 2rem)',
        color:      '#F5D87A',
        direction:  'rtl',
        letterSpacing: '3px',
        textShadow: '0 0 32px rgba(201,148,26,0.6)',
      }}
    >
      رَمَضَانُ كَرِيمٌ
    </div>

    {/* Tagline */}
    <p
      className="font-poppins font-semibold text-xs tracking-widest uppercase animate-blink-fade"
      style={{ color: '#3ECBB8' }}
    >
      Memuat Kartu Ucapan...
    </p>

    {/* Progress bar */}
    <div
      className="w-52 h-0.5 rounded-full overflow-hidden"
      style={{ background: 'rgba(201,148,26,0.15)' }}
    >
      <div
        className="h-full rounded-full bar-fill"
        style={{
          width:      0,
          background: 'linear-gradient(90deg, #12A08E, #E8B84B, #12A08E)',
        }}
      />
    </div>
  </div>
)

export default Loader
