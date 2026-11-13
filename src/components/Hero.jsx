import { MonitorArt } from './MedIcons'

export default function Hero({ name, children }) {
  return (
    <section className='fade-up relative overflow-hidden rounded-2xl text-white p-6 md:p-8 flex flex-col md:flex-row items-center gap-6'
      style={{ background: 'linear-gradient(135deg, #0f766e, #0891b2)' }}>
      <div className='flex-1 space-y-3'>
        <p className='text-xs uppercase tracking-widest text-teal-100'>Clinical practice lab{name ? ` · Welcome, ${name}` : ''}</p>
        <h1 className='text-2xl md:text-4xl font-bold leading-tight'>Practise like a doctor. Learn before the ward.</h1>
        <p className='text-teal-50 text-sm md:text-base max-w-xl'>
          Triage simulated patients, write your handover, and let your digital colleague team mark it, check its own marking and coach you.
        </p>
        <div className='flex gap-2 flex-wrap text-xs'>
          {['Rules-based triage', 'Four-agent marking', 'Self-checking Reviewer', 'Personal study plan'].map(t => (
            <span key={t} className='bg-white/15 px-3 py-1 rounded-full'>{t}</span>
          ))}
        </div>
        {children}
      </div>
      <MonitorArt className='w-full max-w-xs md:max-w-sm drop-shadow-2xl' />
    </section>
  )
}