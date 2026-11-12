const ORDER = ['EMERGENCY', 'URGENT', 'PRIORITY', 'ROUTINE']

export const REQUIRED_FIELDS = [
  'heart_rate', 'resp_rate', 'temperature', 'oxygen_saturation',
  'bp_systolic', 'bp_diastolic', 'pain_score',
]

const ops = {
  '<': (a, b) => a < b, '>': (a, b) => a > b,
  '<=': (a, b) => a <= b, '>=': (a, b) => a >= b,
}

export function evaluateScreening({ observations, allergyStatus, rules, protocol }) {
  const latest = {}
  for (const o of observations) latest[o.observation_type] = Number(o.value)

  const missing = REQUIRED_FIELDS.filter(f => latest[f] === undefined)
  if (!allergyStatus) missing.push('allergy_status')

  const triggered = rules
    .filter(r => latest[r.observation_type] !== undefined && ops[r.operator](latest[r.observation_type], r.threshold))
    .map(r => ({
      rule: r.name, level: r.level,
      protocol: `${protocol.protocol_name} v${protocol.version}`,
      value: latest[r.observation_type],
    }))

  let priority = 'ROUTINE'
  for (const lvl of ORDER) {
    if (triggered.some(t => t.level === lvl)) { priority = lvl; break }
  }
  if (priority === 'ROUTINE' && missing.length) priority = 'INCOMPLETE'

  return { priority, triggered, missing }
}