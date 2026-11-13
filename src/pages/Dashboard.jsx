import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import PriorityBadge from '../components/PriorityBadge'
import { STATUS_LABEL } from '../lib/labels'
import { startPracticeCase } from '../lib/cases' // needs src/lib/cases.js (Phase 3)

const ORDER = { EMERGENCY: 0, URGENT: 1, PRIORITY: 2, ROUTINE: 3, INCOMPLETE: 4 }

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

  return (
    <div className='p-6 space-y-4'>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        {[['Waiting', count('waiting')], ['Being assessed', count('screening')], ['Supervisor review', count('doctor_review')],
          ['Emergency', rows.filter(r => r.workflow_priority === 'EMERGENCY').length]].map(([l, n]) => (
          <div key={l} className='border rounded p-4'><div className='text-2xl font-bold text-teal-700'>{n}</div><div className='text-sm'>{l}</div></div>
        ))}
      </div>
      {profile?.role === 'nurse' && (
        <button onClick={practice} className='bg-blue-600 text-white px-4 py-2 rounded'>Start practice case</button>
      )}
      <input className='border p-2 rounded w-full md:w-80 block' placeholder='Search case or reference' value={q} onChange={e => setQ(e.target.value)} />
      <div className='overflow-x-auto'>
        <table className='w-full text-sm text-left'>
          <thead><tr><th>Ref</th><th>Case</th><th>Presenting complaint</th><th>Priority</th><th>Status</th><th>Arrived</th><th></th></tr></thead>
          <tbody>
            {shown.map(r => (
              <tr key={r.id} className='border-t'>
                <td>{r.patients?.patient_reference}</td>
                <td>{r.patients?.first_name} {r.patients?.surname}</td>
                <td>{r.presenting_complaint}</td>
                <td><PriorityBadge level={r.workflow_priority} /></td>
                <td>{STATUS_LABEL[r.status] ?? r.status}</td>
                <td>{new Date(r.arrival_time).toLocaleTimeString()}</td>
                <td>
                  {profile?.role === 'nurse' && <Link className='text-teal-700 mr-2' to={`/screening/${r.id}`}>Assess</Link>}
                  {['nurse', 'doctor'].includes(profile?.role) && <Link className='text-blue-700' to={`/handover/${r.id}`}>Handover</Link>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}