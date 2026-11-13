import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABEL } from '../lib/labels'
import Backdrop from './Backdrop'
import { Logo } from './MedIcons'

const ALL = ['admin', 'nurse', 'doctor', 'receptionist', 'supervisor']
const LINKS = [
  ['/', 'Dashboard', ALL],
  ['/register', 'Add simulated case', ['nurse', 'receptionist']],
  ['/doctor', 'Supervisor dashboard', ['doctor']],
  ['/progress', 'Progress', ['nurse', 'doctor', 'supervisor']],
  ['/audit', 'Audit logs', ['admin', 'supervisor']],
]

export default function Layout({ children }) {
  const { profile } = useAuth()
  const { pathname } = useLocation()
  return (
    <div className='min-h-screen'>
      <Backdrop />
      <header className='sticky top-0 z-20 bg-teal-800/90 backdrop-blur text-white shadow-lg'>
        <div className='max-w-6xl mx-auto px-4 py-3 flex flex-wrap gap-x-4 gap-y-2 items-center'>
          <Link to='/' className='flex items-center gap-2 font-bold'>
            <Logo size={30} />
            <span>CareAssist AI <span className='font-normal text-teal-200'>· Student Edition</span></span>
          </Link>
          {LINKS.filter(l => l[2].includes(profile?.role)).map(l => (
            <Link key={l[0]} to={l[0]}
              className={`text-sm px-3 py-1 rounded-full transition ${pathname === l[0] ? 'bg-white/20' : 'hover:bg-white/10'}`}>
              {l[1]}
            </Link>
          ))}
          <span className='ml-auto text-sm text-teal-100'>{profile?.full_name} ({ROLE_LABEL[profile?.role]})</span>
          <button onClick={() => supabase.auth.signOut()} className='text-sm bg-white/15 hover:bg-white/25 px-3 py-1 rounded-full'>Sign out</button>
        </div>
      </header>
      <main className='max-w-6xl mx-auto px-3 py-6'>
        <div className='glass rounded-2xl'>{children}</div>
      </main>
      <footer className='text-center text-xs text-slate-600 pb-6'>
        Simulation for education. Fictional patients only. Not for real patient care.
      </footer>
    </div>
  )
}