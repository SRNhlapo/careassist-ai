const COLORS = { EMERGENCY: 'bg-read-600', URGENT: 'bg-orange-500', PRIORITY: 'bg-yellow-500', ROUTINE: 'bg-green-600', INCOMPLETE: 'bg-slate-500' }

export default function PriorityBadge({level}) {
return <span ClassName={`text-white text-xs px-2 py-1 rounded ${COLORS[level] ?? 'bg-slate-400'}`}>{level}</span>
}