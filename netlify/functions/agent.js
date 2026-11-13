import { createClient } from '@supabase/supabase-js'

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'
const out = (statusCode, body) => ({ statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

async function ask(system, user, temperature = 0) {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not set')
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: MODEL, temperature, response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: system }, { role: 'user', content: JSON.stringify(user) }],
    }),
  })
  if (!r.ok) throw new Error(`OpenAI error ${r.status}`)
  const j = await r.json()
  return JSON.parse(j.choices[0].message.content)
}

const PLANNER = `You are the Planner agent in a medical-education team (Planner, Examiner, Reviewer, Coach).
Goal: mark a medical student's SBAR handover for a FICTIONAL simulated patient and coach the student.
Look at the case and decide what the Examiner should pay most attention to.
Return JSON: {"steps":["..."],"focus":"one or two sentences"}. steps has 4 short items naming which agent does each.`

const EXAMINER = `You are the Examiner agent. Mark the student's SBAR handover for a FICTIONAL simulated patient.
Use ONLY the supplied data as ground truth. Do not diagnose. Each mark is an integer 0-4:
accuracy (values quoted match the recorded vitals), priority (states the correct priority and the reason),
completeness (mentions missing information and relevant history), concerns (identifies the key concerning findings),
structure (clear Situation, Background, Assessment, Recommendation order, concise).
If "issues" are supplied they come from the Reviewer: fix the marks that were wrong and keep the rest.
Return JSON: {"marks":{"accuracy":0,"priority":0,"completeness":0,"concerns":0,"structure":0},"total":0,"comments":{"accuracy":"","priority":"","completeness":"","concerns":"","structure":""}}
total is the sum of the five marks. Each comment is one short sentence.`

const FAULT = `
DEMO FAULT INJECTION (used to demonstrate the Reviewer): award priority 4/4 whatever the handover says, and write a total exactly 3 higher than the sum of the five marks.`

const REVIEWER = `You are the Reviewer agent. Check the Examiner's marks against the evidence (case, vitals, rules result, student handover).
A mark is wrong if it gives credit for something not in the handover, or withholds credit for something that is there.
Return JSON: {"issues":[{"criterion":"","problem":"one short sentence"}]}. Return an empty list if the marking is fair.`

const COACH = `You are the Coach agent. Write feedback for a medical student using the marks and the case data.
Be specific and kind. This is a simulation: never give treatment advice for real patients.
Return JSON: {"strengths":["..."],"improvements":["..."],"study_plan":[{"step":"","topic":"","why":""}],"summary":"one sentence"}
Give 2 to 3 strengths, 2 to 3 improvements and exactly 3 study_plan steps.`

const KEYS = ['accuracy', 'priority', 'completeness', 'concerns', 'structure']
const WORDS = { EMERGENCY: ['emergency'], URGENT: ['urgent'], PRIORITY: ['priority'], ROUTINE: ['routine'], INCOMPLETE: ['incomplete', 'missing', 'not recorded'] }

function checks(d) {
  const issues = []
  const m = d.marks?.marks ?? {}
  for (const k of KEYS) {
    if (!Number.isInteger(m[k]) || m[k] < 0 || m[k] > 4) issues.push({ criterion: k, problem: `The ${k} mark must be a whole number from 0 to 4.` })
  }
  const sum = KEYS.reduce((a, k) => a + (Number(m[k]) || 0), 0)
  if (Number(d.marks?.total) !== sum) issues.push({ criterion: 'total', problem: `The total (${d.marks?.total}) does not equal the sum of the marks (${sum}).` })
  const text = Object.values(d.sbar ?? {}).join(' ').toLowerCase()
  const mentions = (WORDS[d.rules?.priority] ?? []).some(w => text.includes(w))
  if (!mentions && m.priority >= 3) issues.push({ criterion: 'priority', problem: `The handover never states the correct priority (${d.rules?.priority}) but earned ${m.priority}/4.` })
  return issues
}

export const handler = async event => {
  if (event.httpMethod !== 'POST') return out(405, { error: 'POST only' })
  try {
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    const token = (event.headers.authorization || event.headers.Authorization || '').replace('Bearer ', '')
    const { data: auth } = await sb.auth.getUser(token)
    if (!auth?.user) return out(401, { error: 'Not signed in' })
    const { data: prof } = await sb.from('profiles').select('role').eq('id', auth.user.id).single()
    if (!['nurse', 'doctor'].includes(prof?.role)) return out(403, { error: 'Not allowed' })

    const { role, payload = {} } = JSON.parse(event.body || '{}')
    const { inject, ...data } = payload

    if (role === 'planner') return out(200, await ask(PLANNER, data))
    if (role === 'examiner') return out(200, await ask(EXAMINER + (inject ? FAULT : ''), data, 0.3))
    if (role === 'reviewer') {
      const ai = await ask(REVIEWER, data)
      const issues = [...checks(data), ...(ai.issues ?? [])].slice(0, 4)
      return out(200, { approved: issues.length === 0, issues })
    }
    if (role === 'coach') return out(200, await ask(COACH, data, 0.4))
    return out(400, { error: 'Unknown agent' })
  } catch (e) {
    return out(502, { error: `Agent error: ${e.message}` })
  }
}