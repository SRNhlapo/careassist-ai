export default function AgentCard({ name, title, skills, color, big }) {
  return (
    <div className={`fade-up rounded-2xl overflow-hidden border border-white/70 bg-white/90 shadow-lg ${big ? 'md:col-span-2' : ''}`}>
      <div className='h-2' style={{ background: color }} />
      <div className='p-4 flex gap-4'>
        <div className='shrink-0 w-16 h-16 rounded-2xl text-white text-2xl font-bold grid place-items-center' style={{ background: color }}>
          {name[0]}
        </div>
        <div className='space-y-2'>
          <div>
            <div className='text-lg font-bold text-teal-900 flex items-center gap-2'>
              {name}<span className='w-2 h-2 rounded-full bg-green-500 animate-pulse' title='Online' />
            </div>
            <div className='text-sm text-slate-600'>{title}</div>
          </div>
          <div className='flex flex-wrap gap-1'>
            {skills.map(s => <span key={s} className='text-xs bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full'>{s}</span>)}
          </div>
        </div>
      </div>
    </div>
  )
}