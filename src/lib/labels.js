export const ROLE_LABEL = {
  admin: 'Admin', nurse: 'Medical student', doctor: 'Supervising doctor',
  receptionist: 'Simulation coordinator', supervisor: 'Programme lead',
}
export const PRIORITY_LABEL = {
  EMERGENCY: 'Emergency', URGENT: 'Urgent', PRIORITY: 'Priority',
  ROUTINE: 'Routine', INCOMPLETE: 'Incomplete',
}
export const STATUS_LABEL = {
  waiting: 'Waiting', screening: 'Being assessed', doctor_review: 'Supervisor review',
  closed: 'Closed', draft_ai: 'AI practice draft', submitted: 'Submitted',
  accepted: 'Approved', rejected: 'Rejected', info_requested: 'More info requested',
}
export const SECTION_LABEL = {
  presenting_complaint: 'Presenting complaint',
  reported_symptoms: 'Reported symptoms',
  relevant_history: 'Relevant history',
  recorded_observations: 'Recorded observations',
  missing_information: 'Missing information',
  concerning_findings: 'Concerning findings',
  suggested_department: 'Suggested department',
  nurse_comments: 'Student comments',
}