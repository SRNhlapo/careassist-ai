const CROSSES = [
  { left: '8%', size: 28, dur: 26, delay: 0 },
  { left: '22%', size: 18, dur: 32, delay: 6 },
  { left: '38%', size: 36, dur: 38, delay: 12 },
  { left: '55%', size: 22, dur: 28, delay: 3 },
  { left: '70%', size: 30, dur: 35, delay: 9 },
  { left: '86%', size: 20, dur: 30, delay: 15 },
]

export default function Backdrop() {
  return (
    <>
      <div className='bg-aurora' />
      <div className='blob blob-a' /><div className='blob blob-b' /><div className='blob blob-c' />
      {CROSSES.map(c => (
        <span key={c.left} className='float-cross' style={{ left: c.left, animationDuration: `${c.dur}s`, animationDelay: `-${c.delay}s` }}>
          <svg width={c.size} height={c.size} viewBox='0 0 24 24' fill='currentColor'><path d='M9 2h6v7h7v6h-7v7H9v-7H2V9h7z' /></svg>
        </span>
      ))}
    </>
  )
}