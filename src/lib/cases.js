import { supabase } from './supabase'

export const CASES = [
  { first_name: 'Zanele', surname: 'Mthembu', dob: '1988-04-12', complaint: 'Shortness of breath after a fall',
    history: ['Fell from a ladder 2 hours ago', 'Chest pain on deep breaths', 'No known allergies'],
    vitals: { oxygen_saturation: 86, bp_systolic: 118, heart_rate: 112, temperature: 36.8, resp_rate: 30, pain_score: 4 },
    keyFindings: ['Very low oxygen saturation', 'Fast breathing', 'Fast heart rate'],
    teaching: 'Oxygen saturation below 90 triggers the Emergency rule even when blood pressure looks normal. One critical value is enough.' },
  { first_name: 'Pieter', surname: 'Botha', dob: '1962-09-30', complaint: 'Dizzy and faint after heavy bleeding',
    history: ['Deep leg cut, bleeding for 45 minutes', 'Feels cold and light-headed', 'Takes a blood thinner'],
    vitals: { oxygen_saturation: 95, bp_systolic: 84, heart_rate: 132, temperature: 36.4, resp_rate: 24, pain_score: 5 },
    keyFindings: ['Very low blood pressure', 'Very fast heart rate', 'Ongoing bleeding'],
    teaching: 'Two rules fire here. The highest level wins (Emergency), but a good handover names both findings.' },
  { first_name: 'Amahle', surname: 'Zulu', dob: '2001-01-18', complaint: 'Fever and cough for three days',
    history: ['Productive cough', 'Shivering at night', 'Works in a crowded office'],
    vitals: { oxygen_saturation: 96, bp_systolic: 122, heart_rate: 104, temperature: 39.2, resp_rate: 22, pain_score: 2 },
    keyFindings: ['High temperature', 'Raised heart rate', 'Cough for three days'],
    teaching: 'A temperature of 39 or above is an Urgent rule. The heart rate is raised but below the demo threshold of 130.' },
  { first_name: 'Kagiso', surname: 'Molefe', dob: '1995-06-07', complaint: 'Severe headache since this morning',
    history: ['Sudden onset', 'Light hurts the eyes', 'No head injury'],
    vitals: { oxygen_saturation: 98, bp_systolic: 138, heart_rate: 92, temperature: 37.1, resp_rate: 16, pain_score: 9 },
    keyFindings: ['Severe pain score', 'Normal oxygen and breathing'],
    teaching: 'Severe pain alone is Priority, not Emergency. Normal vitals do not make severe pain Routine.' },
  { first_name: 'Fatima', surname: 'Cassim', dob: '2003-11-23', complaint: 'Sprained ankle',
    history: ['Twisted ankle playing football', 'Swelling and bruising', 'Can bear some weight'],
    vitals: { oxygen_saturation: 99, bp_systolic: 120, heart_rate: 78, temperature: 36.6, resp_rate: 14, pain_score: 4 },
    keyFindings: ['All observations within thresholds', 'Localised injury'],
    teaching: 'When no rule fires and every observation is recorded, the case is Routine.' },
  { first_name: 'Johan', surname: 'Pretorius', dob: '1970-02-02', complaint: 'Abdominal pain, observations incomplete',
    history: ['Pain started last night', 'Nausea, no vomiting', 'Temperature and breathing rate were not taken'],
    vitals: { oxygen_saturation: 97, bp_systolic: 125, heart_rate: 88, temperature: '', resp_rate: '', pain_score: 5 },
    keyFindings: ['Temperature not recorded', 'Respiratory rate not recorded'],
    teaching: 'No rule fired, but two observations are missing, so the engine says Incomplete instead of assuming the patient is fine.' },
]

export async function startPracticeCase(profile) {
  const s = CASES[Math.floor(Math.random() * CASES.length)]
  const { data: p, error } = await supabase.from('patients').insert({
    first_name: s.first_name, surname: s.surname, date_of_birth: s.dob, phone: '0000000000', created_by: profile.id,
  }).select().single()
  if (error) throw error
  const { data: enc, error: e2 } = await supabase.from('encounters').insert({
    patient_id: p.id, presenting_complaint: s.complaint, status: 'screening', assigned_nurse_id: profile.id,
  }).select().single()
  if (e2) throw e2
  await supabase.from('sim_cases').insert({ encounter_id: enc.id, scenario: s })
  return enc.id
}