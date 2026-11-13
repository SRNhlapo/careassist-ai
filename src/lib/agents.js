import { supabase } from './supabase'

const CRIT = ['accuracy', 'priority', 'completeness', 'concerns', 'structure']

async function call(role, payload) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch('/.netlify/functions/agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ role, payload }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || `${role} agent failed (${res.status})`)
  return json
}

export async function runColleague(ctx, emit, options = {}) {
  const t0 = Date.now()
  const log = (agent, msg) => emit({ agent, msg, t: Math.round((Date.now() - t0) / 1000) })
  log('System', 'Goal received: mark this handover, check the marking, coach the student.')

  const plan = await call('planner', ctx)
  log('Planner', `Plan: ${(plan.steps ?? []).join(' → ')}`)
  log('Planner', `Focus: ${plan.focus}`)

  let marks = await call('examiner', { ...ctx, focus: plan.focus, inject: !!options.inject })
  log('Examiner', `First pass: ${marks.total}/20${options.inject ? ' (demo fault injected)' : ''}`)

  let corrections = 0
  let approved = false
  for (let round = 1; round <= 3; round++) {
    const review = await call('reviewer', { ...ctx, marks })
    if (review.approved) { approved = true; log('Reviewer', 'Checked the marks against the evidence: approved.'); break }
    log('Reviewer', `Found ${review.issues.length} problem(s): ${review.issues.map(i => i.problem).join(' | ')}`)
    if (round === 3) break
    corrections++
    log('Reviewer', 'Sent the marks back to the Examiner.')
    marks = await call('examiner', { ...ctx, focus: plan.focus, issues: review.issues, previous: marks })
    log('Examiner', `Re-marked: ${marks.total}/20`)
  }
  if (!approved) log('System', 'The Reviewer and Examiner still disagree. Escalated to the supervisor.')

  const m = Object.fromEntries(CRIT.map(k => [k, Math.max(0, Math.min(4, Math.round(Number(marks.marks?.[k]) || 0)))]))
  const total = CRIT.reduce((a, k) => a + m[k], 0)
  const finalMarks = { ...marks, marks: m, total }

  const coach = await call('coach', { ...ctx, marks: finalMarks })
  log('Coach', 'Feedback and study plan written.')

  const percent = Math.round((total / 20) * 100)
  log('System', `Delivered: ${percent}%.`)
  return { plan, marks: finalMarks, coach, corrections, escalated: !approved, percent }
}