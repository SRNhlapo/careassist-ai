import { createClient } from '@supabase/supabase-js'

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['presenting_complaint', 'reported_symptoms', 'relevant_history', 'recorded_observations',
    'missing_information', 'concerning_findings', 'suggested_department', 'nurse_comments'],
  properties: {
    presenting_complaint: { type: 'string' },
    reported_symptoms: { type: 'array', items: { type: 'string' } },
    relevant_history: { type: 'array', items: { type: 'string' } },
    recorded_observations: { type: 'array', items: { type: 'string' } },
    missing_information: { type: 'array', items: { type: 'string' } },
    concerning_findings: { type: 'array', items: { type: 'string' } },
    suggested_department: { type: 'string' },
    nurse_comments: { type: 'string' },
  },
}

const SYSTEM = `You are a documentation assistant for nurses. You do NOT diagnose, prescribe, recommend treatment, or decide triage.
Use ONLY the supplied data. Never invent information. If something is not supplied, list it under missing_information.
Distinguish patient-reported symptoms from recorded measurements. Do not downgrade any protocol flag provided.
suggested_department is a routing suggestion only.`

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const token = (req.headers.get('authorization') || '').replace('Bearer ', '')
  const { data: { user } } = await sb.auth.getUser(token)
  if (!user) return new Response('Unauthorised', { status: 401 })

  const { data: profile } = await sb.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'nurse') return new Response('Forbidden', { status: 403 })

  const { encounterId } = await req.json()

  const { data: enc } = await sb.from('encounters')
    .select('id, encounter_reference, presenting_complaint, nurse_notes, workflow_priority, priority_reasons, missing_information')
    .eq('id', encounterId).single()
  const { data: obs } = await sb.from('observations')
    .select('observation_type, value, unit, recorded_at').eq('encounter_id', encounterId)
  if (!enc) return new Response('Not found', { status: 404 })

  let summary
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 25000)
    const r = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: JSON.stringify({ encounter: enc, observations: obs }) },
        ],
        text: { format: { type: 'json_schema', name: 'handover', schema: SCHEMA, strict: true } },
      }),
    })
    clearTimeout(t)
    if (!r.ok) throw new Error(`OpenAI ${r.status}`)
    const data = await r.json()
    const msg = data.output.find(o => o.type === 'message')
    summary = JSON.parse(msg.content[0].text)
  } catch (e) {
    await sb.from('audit_logs').insert({ user_id: user.id, action: 'ai_handover', resource_type: 'encounter', resource_id: encounterId, outcome: 'failure' })
    return Response.json({ error: 'AI unavailable. You can still complete the handover manually.' }, { status: 502 })
  }

  const { data: draft } = await sb.from('handover_drafts').insert({
    encounter_id: encounterId, nurse_id: user.id,
    ai_generated_summary: summary, current_content: summary, status: 'draft_ai',
  }).select().single()

  await sb.from('audit_logs').insert({ user_id: user.id, action: 'ai_handover_generated', resource_type: 'handover', resource_id: draft.id })
  return Response.json({ draft })
}