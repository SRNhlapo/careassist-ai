import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { audit } from '../lib/audit'

export default function PatientRegistration() {
  const { profile } = useAuth()
  const nav = useNavigate()
  const [f, setF] = useState({ first_name: '', surname: '', date_of_birth: '', phone: '', complaint: '' })
  const [matches, setMatches] = useState([])
  const set = k => e => setF({ ...f, [k]: e.target.value })

  async function startEncounter(patientId) {
    const { data: enc } = await supabase.from('encounters').insert({
      patient_id: patientId, presenting_complaint: f.complaint, status: 'screening',
      assigned_nurse_id: profile.role === 'nurse' ? profile.id : null,
    }).select().single()
    await audit(profile.id, 'encounter_created', 'encounter', enc.id)
    nav(profile.role === 'nurse' ? `/screening/${enc.id}` : '/')
  }

  async function createPatient() {
    const { data: p } = await supabase.from('patients').insert({
      first_name: f.first_name, surname: f.surname, date_of_birth: f.date_of_birth,
      phone: f.phone, created_by: profile.id,
    }).select().single()
    await audit(profile.id, 'patient_created', 'patient', p.id)
    startEncounter(p.id)
  }

  async function register() {
    if (!f.first_name || !f.surname || !f.date_of_birth) return
    const { data } = await supabase.from('patients').select('*')
      .ilike('surname', f.surname).eq('date_of_birth', f.date_of_birth)
    if (data?.length) setMatches(data)
    else createPatient()
  }

  return (
    <div className='max-w-xl mx-auto p-6 space-y-3'>
      <h1 className='text-2xl font-semibold text-teal-700'>Add simulated case</h1>
      <p className='text-sm text-slate-600'>Fictional patient data only.</p>
      <input className='border p-2 w-full rounded' placeholder='First name' onChange={set('first_name')} />
      <input className='border p-2 w-full rounded' placeholder='Surname' onChange={set('surname')} />
      <input className='border p-2 w-full rounded' type='date' onChange={set('date_of_birth')} />
      <input className='border p-2 w-full rounded' placeholder='Phone' onChange={set('phone')} />
      <input className='border p-2 w-full rounded' placeholder='Presenting complaint (fictional)' onChange={set('complaint')} />
      <button onClick={register} className='bg-teal-600 text-white px-4 py-2 rounded'>Add case and start assessment</button>
      {matches.length > 0 && (
        <div className='border border-orange-400 rounded p-3 space-y-2'>
          <p className='font-semibold'>Possible duplicate case. Staff must confirm:</p>
          {matches.map(m => (
            <div key={m.id} className='flex gap-2 items-center'>
              <span>{m.patient_reference}: {m.first_name} {m.surname}</span>
              <button className='bg-blue-600 text-white px-2 rounded' onClick={() => startEncounter(m.id)}>Use this case</button>
            </div>
          ))}
          <button className='text-sm underline' onClick={createPatient}>No, add as a new case</button>
        </div>
      )}
    </div>
  )
}