import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { audit } from '../lib/audit'
import { FIELDS, validate, evaluate } from '../lib/triage'
import PriorityBadge from '../components/PriorityBadge'
import ColleagueRun from '../components/ColleagueRun'

const CHOICES = ['EMERGENCY', 'URGENT', 'PRIORITY', 'ROUTINE', 'INCOMPLETE']
const age = dob => (dob ? Math.floor((Date.now() - new Date(dob)) / 31557600000) : '?')
const label = k => FIELDS.find(f => f.key === k)?.label ?? k

export default function Screening() {
  const params = useParams()
  const encounterId = params.encounterId ?? params.id
  const { profile } = useAuth()
  const start = useRef(Date.now())
  const [enc, setEnc] = useState(null)
  const [scenario, setScenario] = useState(null)
  const [protocol, setProtocol] = useState(null)
  const [vitals, setVitals] = useState(Object.fromEntries(FIELDS.map(f => [f.key, ''])))
  const [pick, setPick] = useState('')
  const [errors, setErrors] = useState([])
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    supabase.from('encounters').select('*, patients(first_name, surname, date_of_birth, patient_reference)')
      .eq('id', encounterId).single().then(({ data }) => setEnc(data))
    supabase.from('sim_cases').select('scenario').eq('encounter_id', encounterId).maybeSingle()
      .then(({ data }) => setScenario(data?.scenario ?? null))
    supabase.from('clinical_protocols').select('*').eq('approval_status', 'approved')
      .order('approved_at', { ascending: false }).limit(1).maybeSingle().then(({ data }) => setProtocol(data))
    supabase.from('sim_assessments').select('*').eq('encounter_id', encounterId).eq('student_id', profile.id)
      .order('created_at', { ascending: false }).limit(1).maybeSingle()
      .then(({ data }) => { if (data) { setResult(data); setVitals(data.vitals) } })
  }, [encounterId])

  const measure = () => setVitals(Object.fromEntries(FIELDS.map(f => [f.key, scenario.vitals[f.key] ?? ''])))

  async function submit() {
    const errs = validate(vitals)
    if (!pick) errs.push('Choose your triage decision first.')
    if (!protocol) errs.push('No approved protocol found in the database.')
    setErrors(errs)
    if (errs.length) return
    setBusy(true)
    const r = evaluate(vitals, protocol)
    const row = {
      encounter_id: encounterId, student_id: profile.id, vitals,
      rule_priority: r.priority, triggered: r.triggered, missing: r.missing,
      predicted_priority: pick, prediction_correct: pick === r.priority,
      seconds_taken: Math.round((Date.now() - start.current) / 1000),
      protocol_version: `${protocol.protocol_name} v${protocol.version}`,
    }
    const { data, error } = await supabase.from('sim_assessments').insert(row).select().single()
    if (error) { setErrors([error.message]); setBusy(false); return }
    const upd = await supabase.from('encounters')
      .update({ workflow_priority: r.priority, assigned_nurse_id: profile.id }).eq('id', encounterId)
    if (upd.error) setErrors(['Result saved, but the queue priority could not be updated: ' + upd.error.message])
    await audit(profile.id, 'triage_submitted', 'encounter', encounterId)
    setResult(data)
    setBusy(false)
  }

  const chosen = result?.predicted_priority ?? pick

  return (
    <div className='max-w-3xl mx-auto p-6 space-y-5'>
      <div>
        <h1 className='text-2xl font-semibold text-teal-700'>Assess case</h1>
        {enc && (
          <p className='text-sm text-slate-600'>
            {enc.patients?.patient_reference} · {enc.patients?.first_name} {enc.patients?.surname} · {age(enc.patients?.date_of_birth)} y · <b>{enc.presenting_complaint}</b>
          </p>
        )}
        <p className='text-xs text-slate-500'>Simulated patient. Fictional data only.</p>
      </div>

      {scenario?.history && (
        <ul className='list-disc ml-5 text-sm'>{scenario.history.map(h => <li key={h}>{h}</li>)}</ul>
      )}

      <section className='space-y-2'>
        <div className='flex items-center gap-3'>
          <h2 className='font-semibold'>1. Observations</h2>
          {scenario && !result && (
            <button onClick={measure} className='text-sm bg-blue-600 text-white px-3 py-1 rounded'>Measure vitals</button>
          )}
        </div>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
          {FIELDS.map(f => (
            <label key={f.key} className='text-sm'>{f.label}
              <input type='number' step='any' className='border p-2 w-full rounded' disabled={!!result}
                value={vitals[f.key] ?? ''} onChange={e => setVitals({ ...vitals, [f.key]: e.target.value })} />
            </label>
          ))}
        </div>
      </section>

      <section className='space-y-2'>
        <h2 className='font-semibold'>2. Your triage decision</h2>
        <div className='flex flex-wrap gap-2'>
          {CHOICES.map(c => (
            <button key={c} onClick={() => !result && setPick(c)}
              className={`p-1 rounded border ${chosen === c ? 'ring-2 ring-teal-600' : ''}`}>
              <PriorityBadge level={c} />
            </button>
          ))}
        </div>
        {errors.map(e => <p key={e} className='text-red-600 text-sm'>{e}</p>)}
        {!result && (
          <button disabled={busy} onClick={submit} className='bg-teal-600 text-white px-4 py-2 rounded disabled:opacity-40'>
            Lock in my decision
          </button>
        )}
      </section>

      {result && (
        <section className='border rounded p-4 space-y-2'>
          <div className='flex gap-3 items-center flex-wrap'>
            <span className='text-sm'>Your decision:</span><PriorityBadge level={result.predicted_priority} />
            <span className='text-sm'>Rules engine:</span><PriorityBadge level={result.rule_priority} />
            <b className={result.prediction_correct ? 'text-green-700' : 'text-red-700'}>
              {result.prediction_correct ? 'Correct' : 'Not quite'}
            </b>
          </div>
          {result.triggered?.length > 0 ? (
            <ul className='list-disc ml-5 text-sm'>
              {result.triggered.map(t => (
                <li key={t.name}>{t.name}: {label(t.observation_type)} {t.operator} {t.threshold} → <b>{t.level}</b></li>
              ))}
            </ul>
          ) : <p className='text-sm'>No rule was triggered.</p>}
          {result.missing?.length > 0 && (
            <p className='text-sm text-orange-700'>Missing observations: {result.missing.map(label).join(', ')}</p>
          )}
          <p className='text-xs text-slate-500'>{result.protocol_version} · {result.seconds_taken}s · thresholds are invented demo values</p>
          {scenario?.teaching && (
            <p className='text-sm bg-blue-50 border border-blue-200 rounded p-2'>Teaching point: {scenario.teaching}</p>
          )}
        </section>
      )}

      {enc && result && <ColleagueRun enc={enc} scenario={scenario} assessment={result} />}
    </div>
  )
}