const LangToggle = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="lang-btn fixed top-5 right-5 z-40 flex items-center gap-2
      font-poppins font-semibold text-xs uppercase tracking-widest
      rounded-full px-5 py-2"
    style={{
      background:    'rgba(201,148,26,0.1)',
      border:        '1.5px solid rgba(201,148,26,0.32)',
      color:         '#E8B84B',
      backdropFilter:'blur(14px)',
    }}
  >
    {/* Globe icon */}
    <svg
      width="13" height="13"
      viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 3C10 7 10 17 12 21M12 3C14 7 14 17 12 21M3 12h18M4.5 7.5h15M4.5 16.5h15"/>
    </svg>
    {label}
  </button>
)

export default LangToggle
