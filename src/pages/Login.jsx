import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function signIn(e) {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else nav('/')
  }

  return (
    <div className='min-h-screen grid place-items-center bg-slate-50'>
      <form onSubmit={signIn} className='bg-white p-6 rounded shadow w-80 space-y-3'>
        <h1 className='text-xl font-semibold text-teal-700'>CareAssist AI</h1>
        <input className='border p-2 w-full rounded' placeholder='Email' value={email} onChange={e => setEmail(e.target.value)} />
        <input className='border p-2 w-full rounded' type='password' placeholder='Password' value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p className='text-red-600 text-sm'>{error}</p>}
        <button className='bg-teal-600 text-white w-full py-2 rounded'>Sign in</button>
      </form>
    </div>
  )
}