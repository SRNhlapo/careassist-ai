import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { audit } from '../lib/audit'
import { SECTION_LABEL, STATUS_LABEL } from '../lib/labels'

const SECTIONS = ['presenting_complaint', 'reported_symptoms', 'relevant_history', 'recorded_observations',
  'missing_information', 'concerning_findings', 'suggested_department', 'nurse_comments']
const SINGLE = ['presenting_complaint', 'suggested_department', 'nurse_comments']

export default function Handover() {
  const { encounterId } = useParams()
  const { profile } = useAuth()
  const [draft, setDraft] = useState(null)
  const [content, setContent] = useState({})
  const [doctors, setDoctors] = useState([])
  const [doctorId, setDoctorId] = useState('')
  const [comment, setComment] = useState('')
  const [assessment, setAssessment] = useState('')
  const [msg, setMsg] = useState('')

  const load = async () => {
    const { data } = await supabase.from('handover_drafts').select('*')
      .eq('encounter_id', encounterId).order('created_at', { ascending: false }).limit(1).maybeSingle()
    setDraft(data)
    setContent(data?.current_content ?? {})
  }

  useEffect(() => {
    load()
    supabase.from('profiles').select('id, full_name').eq('role', 'doctor').then(({ data }) => setDoctors(data ?? []))
  }, [encounterId])

  async function generate() {
    setMsg('Generating...')
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/.netlify/functions/generate-handover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ encounterId }),
    })
    const json = await res.json()
    setMsg(res.ok ? '' : json.error || 'Failed')
    if (res.ok) load()
  }

  async function submit() {
    await supabase.from('handover_drafts').update({
      current_content: content, status: 'submitted', submitted_at: new Date().toISOString(),
    }).eq('id', draft.id)
    await supabase.from('encounters').update({ assigned_doctor_id: doctorId, status: 'doctor_review' }).eq('id', encounterId)
    await supabase.from('notifications').insert({ recipient_id: doctorId, encounter_id: encounterId, message: 'New handover submitted for review' })
    await audit(profile.id, 'handover_submitted', 'handover', draft.id)
    load()
  }

  async function review(status) {
    await supabase.from('doctor_reviews').insert({ handover_id: draft.id, doctor_id: profile.id, review_status: status, doctor_comments: comment })
    await supabase.from('handover_drafts').update({ status }).eq('id', draft.id)
    if (status === 'accepted' && assessment) {
      await supabase.from('clinical_notes').insert({ encounter_id: encounterId, author_id: profile.id, note_content: assessment })
    }
    await supabase.from('notifications').insert({ recipient_id: draft.nurse_id, encounter_id: encounterId, message: `Handover ${status.replace('_', ' ')}` })
    await audit(profile.id, `handover_${status}`, 'handover', draft.id)
    load()
  }

  const editable = profile.role === 'nurse' && ['draft_ai', 'info_requested'].includes(draft?.status)
  const show = v => (Array.isArray(v) ? v.join('\n') : v ?? '')
  const change = (k, v) => setContent({ ...content, [k]: SINGLE.includes(k) ? v : v.split('\n').filter(Boolean) })

  return (
    <div className='max-w-3xl mx-auto p-6 space-y-4'>
      <h1 className='text-2xl font-semibold text-teal-700'>Clinical handover (student practice)</h1>
      <p className='bg-yellow-100 border border-yellow-400 p-2 rounded text-sm'>AI practice draft. Not yet reviewed by your supervisor. Fictional patient only.</p>
      {!draft && profile.role === 'nurse' && <button onClick={generate} className='bg-blue-600 text-white px-4 py-2 rounded'>Generate AI draft</button>}
      {msg && <p>{msg}</p>}
      {draft && (
        <>
          <p className='text-sm'>Status: <b>{STATUS_LABEL[draft.status] ?? draft.status}</b></p>
          {SECTIONS.map(k => (
            <label key={k} className='block text-sm font-medium'>
              {SECTION_LABEL[k]}
              <textarea className='border p-2 w-full rounded font-normal' rows={SINGLE.includes(k) ? 2 : 3}
                disabled={!editable} value={show(content[k])} onChange={e => change(k, e.target.value)} />
            </label>
          ))}
          {editable && (
            <div className='flex gap-2 items-center'>
              <select className='border p-2 rounded' value={doctorId} onChange={e => setDoctorId(e.target.value)}>
                <option value=''>Choose supervisor...</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
              </select>
              <button disabled={!doctorId} onClick={submit} className='bg-teal-600 text-white px-4 py-2 rounded disabled:opacity-40'>Submit to supervisor</button>
            </div>
          )}
          {profile.role === 'doctor' && draft.status === 'submitted' && (
            <div className='border rounded p-3 space-y-2'>
              <textarea className='border p-2 w-full rounded' placeholder='Supervisor assessment (kept separate from the AI draft)'
                value={assessment} onChange={e => setAssessment(e.target.value)} />
              <textarea className='border p-2 w-full rounded' placeholder='Feedback to the student, or reason if rejecting / requesting info'
                value={comment} onChange={e => setComment(e.target.value)} />
              <button onClick={() => review('accepted')} className='bg-green-600 text-white px-3 py-1 rounded mr-2'>Accept</button>
              <button onClick={() => review('info_requested')} className='bg-orange-500 text-white px-3 py-1 rounded mr-2'>Request info</button>
              <button onClick={() => review('rejected')} className='bg-red-600 text-white px-3 py-1 rounded'>Reject</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}