import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Backdrop from '../components/Backdrop'
import { Logo, MonitorArt } from '../components/MedIcons'

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function signIn(e) {
    e.preventDefault()
    setBusy(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (error) setError(error.message)
    else nav('/')
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <Backdrop />
      <div className='grid md:grid-cols-2 gap-10 max-w-5xl w-full items-center'>
        <div className='hidden md:block space-y-5 fade-up'>
          <div className='flex items-center gap-3'>
            <Logo size={46} /><span className='text-2xl font-bold text-teal-800'>CareAssist AI</span>
          </div>
          <h1 className='text-4xl font-bold text-teal-900 leading-tight'>The practice ward for tomorrow's doctors.</h1>
          <p className='text-slate-700'>
            Triage simulated patients, write your handover, and let a team of digital colleagues mark it, check the marks and coach you.
          </p>
          <MonitorArt className='w-full max-w-md drop-shadow-xl' />
        </div>
        <form onSubmit={signIn} className='glass rounded-2xl p-6 space-y-3 w-full max-w-sm mx-auto fade-up'>
          <div className='flex items-center gap-2 md:hidden'><Logo size={32} /><b className='text-teal-800'>CareAssist AI</b></div>
          <h2 className='text-xl font-semibold text-teal-800'>Sign in</h2>
          <input type='email' required className='border p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500'
            placeholder='Email' value={email} onChange={e => setEmail(e.target.value)} />
          <input type='password' required className='border p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500'
            placeholder='Password' value={password} onChange={e => setPassword(e.target.value)} />
          {error && <p className='text-red-600 text-sm'>{error}</p>}
          <button disabled={busy} className='bg-teal-600 hover:bg-teal-700 text-white w-full py-2 rounded-lg transition disabled:opacity-50'>
            {busy ? 'Signing in...' : 'Sign in'}
          </button>
          <p className='text-xs text-slate-500'>Simulation for education. Fictional patients only.</p>
        </form>
      </div>
    </div>
  )
}