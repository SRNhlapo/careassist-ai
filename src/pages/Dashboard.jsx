import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import PriorityBadge from '../components/PriorityBadge'
import Hero from '../components/Hero'
import { Clipboard, Stethoscope, AlertTriangle, Clock } from '../components/MedIcons'
import { STATUS_LABEL } from '../lib/labels'
import { startPracticeCase } from '../lib/cases'

const ORDER = { EMERGENCY: 0, URGENT: 1, PRIORITY: 2, ROUTINE: 3, INCOMPLETE: 4 }
const EDGE = {
  EMERGENCY: 'border-l-red-500', URGENT: 'border-l-orange-500', PRIORITY: 'border-l-yellow-500',
  ROUTINE: 'border-l-green-600', INCOMPLETE: 'border-l-slate-400',
}

function Count({ to }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    let raf, start
    const step = t => {
      if (start === undefined) start = t
      const p = Math.min((t - start) / 600, 1)
      setN(Math.round(to * p))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [to])
  return n
}

export default function Dashboard() {
  const { profile } = useAuth()
  const nav = useNavigate()
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')

  async function practice() {
    try { nav(`/screening/${await startPracticeCase(profile)}`) } catch (e) { alert(e.message) }
  }

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('encounters')
        .select('*, patients(patient_reference, first_name, surname)')
        .neq('status', 'closed')
      setRows((data ?? []).sort((a, b) => (ORDER[a.workflow_priority] ?? 9) - (ORDER[b.workflow_priority] ?? 9)))
    }
    load()
    const ch = supabase.channel('queue')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'encounters' }, load)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  const text = r => `${r.patients?.first_name} ${r.patients?.surname} ${r.patients?.patient_reference}`.toLowerCase()
  const shown = rows.filter(r => text(r).includes(q.toLowerCase()))
  const count = s => rows.filter(r => r.status === s).length
  const stats = [
    ['Waiting', count('waiting'), Clock, 'text-slate-600 bg-slate-100'],
    ['Being assessed', count('screening'), Stethoscope, 'text-teal-700 bg-teal-100'],
    ['Supervisor review', count('doctor_review'), Clipboard, 'text-cyan-700 bg-cyan-100'],
    ['Emergency', rows.filter(r => r.workflow_priority === 'EMERGENCY').length, AlertTriangle, 'text-red-700 bg-red-100'],
  ]

  return (
    <div className='p-4 md:p-6 space-y-6'>
      <Hero name={profile?.full_name}>
        {profile?.role === 'nurse' && (
          <button onClick={practice}
            className='mt-2 bg-white text-teal-800 font-semibold px-5 py-2 rounded-full shadow hover:shadow-lg hover:scale-105 transition'>
            Start practice case
          </button>
        )}
      </Hero>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {stats.map(([label, n, Icon, tone], i) => (
          <div key={label} className='fade-up rounded-xl border border-white/70 bg-white/80 p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition'
            style={{ animationDelay: `${i * 80}ms` }}>
            <span className={`rounded-lg p-2 ${tone}`}><Icon size={22} /></span>
            <div>
              <div className='text-2xl font-bold text-teal-800'><Count to={n} /></div>
              <div className='text-xs text-slate-600'>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <input className='border p-2 rounded-lg w-full md:w-80 block bg-white/80 focus:outline-none focus:ring-2 focus:ring-teal-500'
        placeholder='Search case or reference' value={q} onChange={e => setQ(e.target.value)} />

      <div className='overflow-x-auto rounded-xl border bg-white/80'>
        <table className='w-full text-sm text-left'>
          <thead className='bg-teal-50 text-teal-900'>
            <tr>
              <th className='px-3 py-2'>Ref</th><th className='px-3 py-2'>Case</th><th className='px-3 py-2'>Presenting complaint</th>
              <th className='px-3 py-2'>Priority</th><th className='px-3 py-2'>Status</th><th className='px-3 py-2'>Arrived</th><th></th>
            </tr>
          </thead>
          <tbody>
            {shown.map(r => (
              <tr key={r.id} className='border-t hover:bg-teal-50/70 transition'>
                <td className={`px-3 py-2 border-l-4 ${EDGE[r.workflow_priority] ?? 'border-l-slate-300'}`}>{r.patients?.patient_reference}</td>
                <td className='px-3 py-2'>{r.patients?.first_name} {r.patients?.surname}</td>
                <td className='px-3 py-2'>{r.presenting_complaint}</td>
                <td className='px-3 py-2'><PriorityBadge level={r.workflow_priority} /></td>
                <td className='px-3 py-2'>{STATUS_LABEL[r.status] ?? r.status}</td>
                <td className='px-3 py-2'>{new Date(r.arrival_time).toLocaleTimeString()}</td>
                <td className='px-3 py-2 whitespace-nowrap'>
                  {profile?.role === 'nurse' && <Link className='text-teal-700 font-medium mr-3 hover:underline' to={`/screening/${r.id}`}>Assess</Link>}
                  {['nurse', 'doctor'].includes(profile?.role) && <Link className='text-blue-700 font-medium hover:underline' to={`/handover/${r.id}`}>Handover</Link>}
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr><td colSpan={7} className='px-3 py-8 text-center text-slate-500'>No cases yet. Start a practice case to begin.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}