export const FIELDS = [
  { key: 'oxygen_saturation', label: 'SpO2 (%)', min: 50, max: 100 },
  { key: 'bp_systolic', label: 'Systolic BP (mmHg)', min: 40, max: 260 },
  { key: 'heart_rate', label: 'Heart rate (bpm)', min: 20, max: 250 },
  { key: 'temperature', label: 'Temperature (°C)', min: 30, max: 45 },
  { key: 'resp_rate', label: 'Respiratory rate (/min)', min: 4, max: 70 },
  { key: 'pain_score', label: 'Pain score (0-10)', min: 0, max: 10 },
]
export const REQUIRED = FIELDS.map(f => f.key)
const RANK = { EMERGENCY: 4, URGENT: 3, PRIORITY: 2, ROUTINE: 1 }
const OPS = {
  '<': (a, b) => a < b, '<=': (a, b) => a <= b,
  '>': (a, b) => a > b, '>=': (a, b) => a >= b, '==': (a, b) => a === b,
}
const blank = v => v === undefined || v === null || v === ''

export function validate(values) {
  return FIELDS.flatMap(f => {
    const v = values[f.key]
    if (blank(v)) return []
    const n = Number(v)
    return Number.isNaN(n) || n < f.min || n > f.max ? [`${f.label} must be between ${f.min} and ${f.max}`] : []
  })
}

export function evaluate(values, protocol) {
  const missing = REQUIRED.filter(k => blank(values[k]))
  const triggered = (protocol?.rules ?? []).filter(r =>
    !blank(values[r.observation_type]) && OPS[r.operator]?.(Number(values[r.observation_type]), r.threshold))
  let priority = 'ROUTINE'
  if (triggered.length) priority = [...triggered].sort((a, b) => RANK[b.level] - RANK[a.level])[0].level
  else if (missing.length) priority = 'INCOMPLETE'
  return { priority, triggered, missing }
}