import { useRef, useEffect, useState } from 'react'

const Starfield = () => {
  const [stars, setStars] = useState([])

  useEffect(() => {
    const count = 160
    setStars(
      Array.from({ length: count }, (_, i) => ({
        id:       i,
        left:     Math.random() * 100,
        size:     Math.random() * 2.2 + 0.4,
        duration: Math.random() * 28 + 15,
        delay:    Math.random() * 22,
        gold:     Math.random() > 0.72,
        opacity:  Math.random() * 0.6 + 0.3,
      }))
    )
  }, [])

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {stars.map(s => (
        <div
          key={s.id}
          className="star-particle"
          style={{
            left:              `${s.left}%`,
            bottom:            '-6px',
            width:             s.size,
            height:            s.size,
            background:        s.gold ? '#E8B84B' : '#FFFFFF',
            animationDuration: `${s.duration}s`,
            animationDelay:    `${s.delay}s`,
            opacity:           0,
          }}
        />
      ))}
    </div>
  )
}

export default Starfield
