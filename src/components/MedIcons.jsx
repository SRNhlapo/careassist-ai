const Svg = ({ size = 24, className = '', children }) => (
  <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor'
    strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className={className}>{children}</svg>
)

export const Stethoscope = p => (
  <Svg {...p}>
    <path d='M11 2v2' /><path d='M5 2v2' />
    <path d='M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1' />
    <path d='M8 15a6 6 0 0 0 12 0v-3' />
    <circle cx='20' cy='10' r='2' />
  </Svg>
)
export const HeartPulse = p => (
  <Svg {...p}>
    <path d='M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z' />
    <path d='M5 12h3l2-3 3 6 2-3h3' />
  </Svg>
)
export const Clipboard = p => (
  <Svg {...p}>
    <rect x='8' y='2' width='8' height='4' rx='1' />
    <path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' />
    <path d='M9 13h6M9 17h4' />
  </Svg>
)
export const AlertTriangle = p => (
  <Svg {...p}>
    <path d='M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z' />
    <path d='M12 9v4M12 17h.01' />
  </Svg>
)
export const Clock = p => (
  <Svg {...p}><circle cx='12' cy='12' r='9' /><path d='M12 6v6l4 2' /></Svg>
)

export const Logo = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox='0 0 32 32' aria-label='CareAssist AI logo'>
    <defs>
      <linearGradient id='ca-logo' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stopColor='#2dd4bf' /><stop offset='1' stopColor='#0891b2' />
      </linearGradient>
    </defs>
    <rect width='32' height='32' rx='9' fill='url(#ca-logo)' />
    <path d='M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6z' fill='#fff' />
  </svg>
)

export const MonitorArt = ({ className = '' }) => (
  <svg viewBox='0 0 360 220' className={className} role='img' aria-label='Patient monitor showing a heart rhythm'>
    <rect x='10' y='10' width='340' height='200' rx='18' fill='#042f2e' stroke='#5eead4' strokeWidth='2' />
    <text x='28' y='38' fill='#5eead4' fontSize='11' fontFamily='monospace'>SIMULATED PATIENT</text>
    <circle cx='330' cy='33' r='4' fill='#4ade80' className='animate-pulse' />
    <path d='M24 110 H90 L102 110 L112 80 L124 140 L136 60 L148 120 L156 110 H210 L222 100 L234 110 H336'
      fill='none' stroke='#14532d' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round' />
    <g className='ecg-line'>
      <path d='M24 110 H90 L102 110 L112 80 L124 140 L136 60 L148 120 L156 110 H210 L222 100 L234 110 H336'
        pathLength='100' fill='none' stroke='#4ade80' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round' />
    </g>
    <text x='28' y='180' fill='#4ade80' fontSize='30' fontFamily='monospace' fontWeight='700'>72</text>
    <text x='28' y='198' fill='#86efac' fontSize='10' fontFamily='monospace'>HR bpm</text>
    <text x='140' y='180' fill='#22d3ee' fontSize='30' fontFamily='monospace' fontWeight='700'>98%</text>
    <text x='140' y='198' fill='#67e8f9' fontSize='10' fontFamily='monospace'>SpO2</text>
    <text x='250' y='180' fill='#fde047' fontSize='26' fontFamily='monospace' fontWeight='700'>120/80</text>
    <text x='250' y='198' fill='#fef08a' fontSize='10' fontFamily='monospace'>BP mmHg</text>
  </svg>
)