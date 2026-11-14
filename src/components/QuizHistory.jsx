import { Link } from "react-router-dom";
import { loadResults } from "../lib/quizStorage";
import { modules } from "../data/learningModules";

export default function QuizHistory() {
  const results = loadResults();
  const latestMissed = results[0]?.missed || [];

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow">
        <h2 className="text-xl font-semibold text-teal-800">Recommended study plan</h2>
        {results.length === 0 ? (
          <p className="mt-2 text-gray-500">Take a quiz and we'll recommend what to review.</p>
        ) : latestMissed.length === 0 ? (
          <p className="mt-2 text-gray-700">Nothing to review from your last quiz. Great work!</p>
        ) : (
          <ul className="mt-3 space-y-1">
            {latestMissed.map((id) => (
              <li key={id}>
                <Link className="text-teal-700 underline" to={`/learn/${id}`}>
                  {modules.find((m) => m.id === id)?.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow">
        <h2 className="text-xl font-semibold text-teal-800">Quiz history</h2>
        {results.length === 0 ? (
          <p className="mt-2 text-gray-500">No quizzes taken yet.</p>
        ) : (
          <ul className="mt-3 space-y-1">
            {results.map((r, i) => (
              <li key={i} className="flex justify-between text-gray-700">
                <span>{new Date(r.date).toLocaleString()}</span>
                <strong>{r.score}/{r.total}</strong>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}