import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import PriorityBadge from '../components/PriorityBadge'
import { audit } from '../lib/audit'

export default function DoctorDashboard() {
  const { profile } = useAuth()
  const [cases, setCases] = useState([])
  const [notes, setNotes] = useState([])

  const load = async () => {
    const a = await supabase.from('encounters')
      .select('*, patients(patient_reference, first_name, surname)')
      .eq('assigned_doctor_id', profile.id).neq('status', 'closed')
    setCases(a.data ?? [])
    const n = await supabase.from('notifications').select('*').eq('recipient_id', profile.id).eq('read_status', false)
    setNotes(n.data ?? [])
  }

  useEffect(() => {
    load()
    const ch = supabase.channel('doc')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, load)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [profile.id])

  async function markRead(id) {
    await supabase.from('notifications').update({ read_status: true }).eq('id', id)
    load()
  }

  async function closeEncounter(id) {
    await supabase.from('encounters').update({ status: 'closed' }).eq('id', id)
    await audit(profile.id, 'encounter_closed', 'encounter', id)
    load()
  }

  return (
    <div className='p-6 space-y-6'>
      <section>
        <h2 className='text-xl font-semibold text-teal-700'>Notifications ({notes.length})</h2>
        {notes.map(n => (
          <div key={n.id} className='border rounded p-2 my-1 flex justify-between'>
            <span>{n.message}</span>
            <button className='text-sm underline' onClick={() => markRead(n.id)}>Mark read</button>
          </div>
        ))}
      </section>
      <section>
        <h2 className='text-xl font-semibold text-teal-700'>Student cases to review</h2>
        {cases.map(c => (
          <div key={c.id} className='border rounded p-3 my-2 flex flex-wrap gap-3 items-center'>
            <PriorityBadge level={c.workflow_priority} />
            <span>{c.patients?.patient_reference} {c.patients?.first_name} {c.patients?.surname}</span>
            <span className='text-sm text-slate-600'>{c.presenting_complaint}</span>
            <Link className='text-blue-700 ml-auto' to={`/handover/${c.id}`}>Open</Link>
            <button className='text-sm underline' onClick={() => closeEncounter(c.id)}>Close case</button>
          </div>
        ))}
      </section>
    </div>
  )
}