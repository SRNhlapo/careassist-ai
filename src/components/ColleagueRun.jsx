import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { audit } from '../lib/audit'
import { runColleague } from '../lib/agents'

const PARTS = [
  ['situation', 'Situation: who is the patient and what is happening?'],
  ['background', 'Background: relevant history and context'],
  ['assessment', 'Assessment: observations, priority and why'],
  ['recommendation', 'Recommendation: what you ask the supervisor to do'],
]
const COLORS = { Planner: 'bg-indigo-600', Examiner: 'bg-teal-600', Reviewer: 'bg-purple-600', Coach: 'bg-orange-500', System: 'bg-slate-500' }
const CRIT = ['accuracy', 'priority', 'completeness', 'concerns', 'structure']

export default function ColleagueRun({ enc, scenario, assessment }) {
  const { profile } = useAuth()
  const [sbar, setSbar] = useState({ situation: '', background: '', assessment: '', recommendation: '' })
  const [feed, setFeed] = useState([])
  const [running, setRunning] = useState(false)
  const [out, setOut] = useState(null)
  const [err, setErr] = useState('')
  const [inject, setInject] = useState(false)

  useEffect(() => {
    supabase.from('agent_runs').select('*').eq('encounter_id', enc.id).eq('student_id', profile.id)
      .order('created_at', { ascending: false }).limit(1).maybeSingle()
      .then(({ data }) => {
        if (data) { setOut(data.result); setFeed(data.log ?? []); if (data.result?.sbar) setSbar(data.result.sbar) }
      })
  }, [enc.id])

  async function run() {
    if (Object.values(sbar).join(' ').trim().length < 40) return setErr('Write your handover first (a few sentences).')
    setErr(''); setRunning(true); setOut(null); setFeed([])
    const ctx = {
      case: { complaint: enc.presenting_complaint, history: scenario?.history ?? [], keyFindings: scenario?.keyFindings ?? [] },
      vitals: assessment.vitals,
      rules: { priority: assessment.rule_priority, triggered: (assessment.triggered ?? []).map(t => t.name), missing: assessment.missing ?? [] },
      student: { predicted: assessment.predicted_priority, correct: assessment.prediction_correct },
      sbar,
    }
    const log = []
    try {
      const res = await runColleague(ctx, e => { log.push(e); setFeed([...log]) }, { inject })
      const result = { ...res, sbar }
      setOut(result)
      await supabase.from('agent_runs').insert({
        encounter_id: enc.id, student_id: profile.id, goal: 'Mark the handover and coach the student',
        log, result, score: res.percent, corrections: res.corrections,
      })
      await audit(profile.id, 'colleague_run', 'encounter', enc.id)
      const { data: docs } = await supabase.from('profiles').select('id').eq('role', 'doctor').limit(1)
      if (docs?.[0]) {
        await supabase.from('notifications').insert({
          recipient_id: docs[0].id, encounter_id: enc.id, message: `Practice result ready: ${res.percent}%`,
        })
      }
    } catch (e) {
      setErr(e.message || 'The colleague team could not finish. Your triage result is saved.')
    }
    setRunning(false)
  }

  return (
    <section className='border-t pt-5 space-y-4'>
      <h2 className='font-semibold'>3. Write your handover (SBAR) and hand it to the colleague team</h2>
      {PARTS.map(([k, ph]) => (
        <textarea key={k} rows={2} className='border p-2 w-full rounded text-sm' placeholder={ph}
          value={sbar[k]} onChange={e => setSbar({ ...sbar, [k]: e.target.value })} />
      ))}
      <label className='text-xs text-slate-600 flex gap-2 items-center'>
        <input type='checkbox' checked={inject} onChange={e => setInject(e.target.checked)} />
        Demo mode: inject a marking error so the Reviewer has something to catch
      </label>
      <button disabled={running} onClick={run} className='bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-40'>
        {running ? 'Colleague team working...' : 'Run colleague team'}
      </button>
      {err && <p className='text-red-600 text-sm'>{err}</p>}

      {feed.length > 0 && (
        <div className='bg-slate-900 text-slate-100 rounded p-3 font-mono text-xs space-y-1'>
          {feed.map((e, i) => (
            <div key={i}>
              <span className='text-slate-400'>{String(e.t).padStart(2, '0')}s </span>
              <span className={`px-1 rounded text-white ${COLORS[e.agent] ?? 'bg-slate-500'}`}>{e.agent}</span> {e.msg}
            </div>
          ))}
          {running && <div className='animate-pulse'>working...</div>}
        </div>
      )}

      {out && (
        <div className='border rounded p-4 space-y-3'>
          <div className='flex flex-wrap gap-6 items-end'>
            <div><div className='text-4xl font-bold text-teal-700'>{out.percent}%</div><div className='text-xs'>handover score</div></div>
            <div className='text-sm'>Agents: 4 · Corrections made: <b>{out.corrections}</b> · Human interventions: <b>{out.escalated ? 1 : 0}</b></div>
          </div>
          {out.escalated && <p className='text-sm text-orange-700'>The Reviewer and Examiner did not fully agree, so this result is flagged for your supervisor.</p>}
          <div className='space-y-2'>
            {CRIT.map(c => (
              <div key={c} className='text-sm'>
                <div className='flex justify-between'><span className='capitalize'>{c}</span><span>{out.marks?.marks?.[c]}/4</span></div>
                <div className='h-2 bg-slate-200 rounded'><div className='h-2 bg-teal-600 rounded' style={{ width: `${(out.marks?.marks?.[c] ?? 0) * 25}%` }} /></div>
                <p className='text-xs text-slate-600'>{out.marks?.comments?.[c]}</p>
              </div>
            ))}
          </div>
          <div className='grid md:grid-cols-2 gap-3 text-sm'>
            <div><b>Strengths</b><ul className='list-disc ml-5'>{out.coach?.strengths?.map(s => <li key={s}>{s}</li>)}</ul></div>
            <div><b>To improve</b><ul className='list-disc ml-5'>{out.coach?.improvements?.map(s => <li key={s}>{s}</li>)}</ul></div>
          </div>
          <div className='text-sm'>
            <b>Your 3-step study plan</b>
            <ol className='list-decimal ml-5'>
              {out.coach?.study_plan?.map(s => <li key={s.step}><b>{s.topic}:</b> {s.step} <i>({s.why})</i></li>)}
            </ol>
          </div>
          <p className='text-xs text-slate-500'>{out.coach?.summary} · AI-generated practice feedback, not medical advice.</p>
        </div>
      )}
    </section>
  )
}