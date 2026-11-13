import AgentCard from '../components/AgentCard'

// Change to true ONLY after Study Studio is built and tested
const STUDY_READY = false

const MARKING = [
  { name: 'Planner', title: 'Plans the marking workflow', color: '#4f46e5', skills: ['Goal breakdown', 'Task assignment'] },
  { name: 'Examiner', title: 'Marks student handovers', color: '#0d9488', skills: ['SBAR rubric', 'Evidence-based marks'] },
  { name: 'Reviewer', title: 'Checks the marking', color: '#7c3aed', skills: ['Error detection', 'Sends work back', 'Escalation'] },
  { name: 'Coach', title: 'Gives feedback and study plans', color: '#ea580c', skills: ['Feedback', '3-step study plan'] },
]
const STUDY = [
  { name: 'Librarian', title: 'Summarises medical notes', color: '#0891b2', skills: ['Key points', 'Key terms'] },
  { name: 'Quiz Master', title: 'Writes exam-style questions', color: '#059669', skills: ['MCQs', 'Explanations', 'Quotes from notes'] },
  { name: 'Fact-Checker', title: 'Verifies every question', color: '#be185d', skills: ['Quote checking', 'Answer checking'] },
  { name: 'Tutor', title: 'Answers from your notes only', color: '#ca8a04', skills: ['Grounded answers', 'Says "not in notes"'] },
]

const team = STUDY_READY ? [...MARKING, ...STUDY] : MARKING
const lead = {
  name: 'Nova', title: 'Digital Clinical Practice Colleague', color: '#0f766e', big: true,
  skills: [
    'Rules-based triage', 'SBAR handover marking', 'Self-checking review', 'Personal study plans',
    ...(STUDY_READY ? ['Source-grounded quizzes', 'Medical notes tutor'] : []),
    'Audit trail', 'Human sign-off',
  ],
}

export default function Colleague() {
  return (
    <div className='p-4 md:p-6 space-y-5'>
      <div>
        <h1 className='text-2xl font-semibold text-teal-700'>Meet your digital colleague</h1>
        <p className='text-sm text-slate-600'>
          Nova leads a team of {team.length} agents. A supervising doctor stays in charge. Fictional patients only.
        </p>
      </div>
      <div className='grid md:grid-cols-2 gap-4'>
        <AgentCard {...lead} />
        {team.map(a => <AgentCard key={a.name} {...a} />)}
      </div>
    </div>
  )
}