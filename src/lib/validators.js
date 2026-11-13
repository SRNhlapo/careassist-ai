export const RANGES = {
  oxygen_saturation: [50, 100, 'SpO2 (%)'],
  bp_systolic: [40, 260, 'Systolic BP (mmHg)'],
  heart_rate: [20, 250, 'Heart rate (bpm)'],
  temperature: [30, 45, 'Temperature (°C)'],
  resp_rate: [4, 70, 'Respiratory rate (/min)'],
  pain_score: [0, 10, 'Pain score (0-10)'],
}

export function validate(values) {
  const errors = []
  for (const [k, [min, max, label]] of Object.entries(RANGES)) {
    const v = values[k]
    if (v === '' || v === undefined || v === null) continue
    const n = Number(v)
    if (Number.isNaN(n) || n < min || n > max) errors.push(`${label} must be between ${min} and ${max}`)
  }
  return errors
}