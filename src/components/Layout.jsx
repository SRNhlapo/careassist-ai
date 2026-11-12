import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const ALL = ['admin', 'nurse', 'doctor', 'receptionist', 'supervisor']
const LINKS = [
  ['/', 'Dashboard', ALL],
  ['/register', 'Register patient', ['nurse', 'receptionist']],
  ['/doctor', 'Doctor dashboard', ['doctor']],
  ['/audit', 'Audit logs', ['admin', 'supervisor']],
]

export default function Layout({ children }) {
  const { profile } = useAuth()
  return (
    <div className='min-h-screen bg-white'>
      <header className='bg-teal-700 text-white px-4 py-3 flex flex-wrap gap-4 items-center'>
        <b>CareAssist AI</b>
        {LINKS.filter(l => l[2].includes(profile?.role)).map(l => <Link key={l[0]} to={l[0]}>{l[1]}</Link>)}
        <span className='ml-auto text-sm'>{profile?.full_name} ({profile?.role})</span>
        <button onClick={() => supabase.auth.signOut()}>Sign out</button>
      </header>
      <main>{children}</main>
    </div>
  )
}