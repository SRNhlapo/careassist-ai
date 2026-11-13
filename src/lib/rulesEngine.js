export const REQUIRED = ['oxygen_saturation', 'bp_systolic', 'heart_rate', 'temperature', 'resp_rate', 'pain_score']
const RANK = { EMERGENCY: 4, URGENT: 3, PRIORITY: 2, ROUTINE: 1 }
const OPS = {
  '<': (a, b) => a < b, '<=': (a, b) => a <= b,
  '>': (a, b) => a > b, '>=': (a, b) => a >= b, '==': (a, b) => a === b,
}
const blank = v => v === undefined || v === null || v === ''

export function evaluate(values, protocol) {
  const missing = REQUIRED.filter(k => blank(values[k]))
  const triggered = (protocol?.rules ?? []).filter(r =>
    !blank(values[r.observation_type]) && OPS[r.operator]?.(Number(values[r.observation_type]), r.threshold))
  let priority = 'ROUTINE'
  if (triggered.length) priority = [...triggered].sort((a, b) => RANK[b.level] - RANK[a.level])[0].level
  else if (missing.length) priority = 'INCOMPLETE'
  return { priority, triggered, missing }
}