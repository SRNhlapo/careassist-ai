// Plausibility ranges only to catch typos. These flag, never auto-correct.
const RANGES = {
  heart_rate: [20, 300], resp_rate: [4, 80], temperature: [25, 45],
  oxygen_saturation: [30, 100], bp_systolic: [40, 300], bp_diastolic: [20, 200],
  pain_score: [0, 10], weight: [0.3, 500], height: [20, 260],
}

export function validateObservation(type, value) {
  const v = Number(value)
  if (Number.isNaN(v)) return 'Not a number'
  const r = RANGES[type]
  if (r && (v < r[0] || v > r[1])) return `Value looks implausible (${r[0]}-${r[1]})`
  return null
}