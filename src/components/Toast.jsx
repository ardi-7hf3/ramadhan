const Toast = ({ msg, show }) => (
  <div
    className="fixed bottom-8 left-1/2 z-50 toast-wrap"
    style={{
      transform: `translateX(-50%) translateY(${show ? '0' : '70px'})`,
      opacity:   show ? 1 : 0,
    }}
  >
    <div
      className="flex items-center gap-2.5 px-6 py-3 rounded-lg font-poppins font-semibold text-sm text-white"
      style={{
        background:    'rgba(15,122,107,0.96)',
        border:        '1px solid rgba(62,203,184,0.3)',
        boxShadow:     '0 4px 22px rgba(15,122,107,0.4)',
        backdropFilter:'blur(14px)',
        whiteSpace:    'nowrap',
      }}
    >
      {/* Checkmark icon */}
      <svg
        width="14" height="14"
        viewBox="0 0 24 24"
        fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {msg}
    </div>
  </div>
)

export default Toast
