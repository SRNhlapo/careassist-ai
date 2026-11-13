export const ROLE_LABEL = {
  admin: 'Admin', nurse: 'Tutor', doctor: 'Coordinator',
  receptionist: 'Registrar', supervisor: 'Programme manager',
}
export const PRIORITY_LABEL = {
  EMERGENCY: 'At risk', URGENT: 'Needs support', PRIORITY: 'Monitor',
  ROUTINE: 'On track', INCOMPLETE: 'Incomplete',
}
export const STATUS_LABEL = {
  waiting: 'Waiting', screening: 'Being assessed', doctor_review: 'Coordinator review',
  closed: 'Closed', draft_ai: 'AI draft', submitted: 'Submitted',
  accepted: 'Approved', rejected: 'Rejected', info_requested: 'More info requested',
}
export const SECTION_LABEL = {
  presenting_complaint: 'Learning goal',
  reported_symptoms: 'Reported struggles',
  relevant_history: 'Relevant background',
  recorded_observations: 'Recorded scores',
  missing_information: 'Missing information',
  concerning_findings: 'Areas of concern',
  suggested_department: 'Suggested support (e.g. maths tutoring)',
  nurse_comments: 'Tutor comments',
}