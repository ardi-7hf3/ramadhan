/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        amiri:   ['Amiri', 'serif'],
      },
      colors: {
        gold: {
          DEFAULT: '#C9941A',
          mid:     '#E8B84B',
          hi:      '#F5D87A',
          pale:    '#FDF3DC',
          dark:    '#8B6310',
        },
        teal: {
          DEFAULT: '#0F7A6B',
          mid:     '#12A08E',
          hi:      '#3ECBB8',
          dark:    '#074E45',
        },
        navy: {
          DEFAULT: '#070E1C',
          mid:     '#0D1830',
          light:   '#13254A',
        },
        ink: {
          DEFAULT: '#1A1005',
          mid:     '#2E200A',
          light:   '#4A3520',
        },
        cream: {
          DEFAULT: '#FAF2E0',
          mid:     '#F0E4C4',
          dark:    '#D4C090',
        },
        env: {
          body:  '#C4A15A',
          dark:  '#9A7830',
          light: '#DEC07A',
          flap:  '#B59040',
        },
        seal: {
          DEFAULT: '#7A1515',
          mid:     '#A01E1E',
        },
      },
      boxShadow: {
        'gold-glow': '0 0 40px rgba(201,148,26,0.35), 0 0 80px rgba(201,148,26,0.1)',
        'card':      '0 32px 80px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.35)',
        'envelope':  '0 24px 60px rgba(0,0,0,0.6), 0 8px 20px rgba(0,0,0,0.4)',
      },
      animation: {
        'spin-slow':  'spin 5s linear infinite',
        'float':      'float 3s ease-in-out infinite',
        'shimmer':    'shimmer 2.2s ease-in-out infinite alternate',
        'fade-up':    'fadeUp 0.7s ease both',
        'lang-in':    'langIn 0.35s ease both',
        'hint-bounce':'hintBounce 2s ease-in-out infinite',
        'cta-pulse':  'ctaPulse 2.2s ease-in-out infinite',
        'moon-glow':  'moonGlow 3s ease-in-out infinite',
        'bar-fill':   'barFill 2.6s ease forwards',
        'star-float': 'starFloat linear infinite',
        'lantern-swing': 'lanternSwing 2.2s ease-in-out infinite',
        'gold-shimmer': 'goldShimmer 4s linear infinite',
      },
      keyframes: {
        float:        { '0%,100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(-8px)' } },
        shimmer:      { from:{ opacity:'0.5', transform:'scale(0.97)' }, to:{ opacity:'1', transform:'scale(1)' } },
        fadeUp:       { from:{ opacity:'0', transform:'translateY(18px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        langIn:       { from:{ opacity:'0', transform:'translateY(8px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        hintBounce:   { '0%,100%':{ transform:'translateY(0)', opacity:'0.7' }, '50%':{ transform:'translateY(-6px)', opacity:'1' } },
        ctaPulse:     { '0%,100%':{ boxShadow:'0 0 0 0 rgba(201,148,26,0.35)' }, '50%':{ boxShadow:'0 0 0 12px rgba(201,148,26,0)' } },
        moonGlow:     { '0%,100%':{ filter:'drop-shadow(0 0 10px rgba(201,148,26,0.5))' }, '50%':{ filter:'drop-shadow(0 0 28px rgba(245,216,122,0.85))' } },
        barFill:      { to:{ width:'100%' } },
        starFloat:    { '0%':{ transform:'translateY(0) rotate(0deg)', opacity:'0' }, '5%':{ opacity:'0.7' }, '95%':{ opacity:'0.4' }, '100%':{ transform:'translateY(-110vh) rotate(720deg)', opacity:'0' } },
        lanternSwing: { '0%,100%':{ transform:'rotate(-9deg)' }, '50%':{ transform:'rotate(9deg) translateY(-4px)' } },
        goldShimmer:  { '0%':{ backgroundPosition:'-200% center' }, '100%':{ backgroundPosition:'200% center' } },
      },
    },
  },
  plugins: [],
}
