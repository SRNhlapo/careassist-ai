import { Link, useParams } from "react-router-dom";
import { modules } from "../data/learningModules";

export default function Learn() {
  const { id } = useParams();
  const mod = modules.find((m) => m.id === id);

  if (id && !mod) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <p>Module not found.</p>
        <Link className="text-teal-700 underline" to="/learn">Back to learning</Link>
      </div>
    );
  }

  if (mod) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Link className="text-sm text-teal-700 underline" to="/learn">← All modules</Link>
        <h1 className="mt-3 text-3xl font-bold text-teal-900">{mod.title}</h1>
        <p className="mt-1 text-sm text-gray-500">{mod.minutes} min read</p>
        <p className="mt-4 text-lg text-gray-700">{mod.intro}</p>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-gray-800">
          {mod.points.map((p, i) => <li key={i}>{p}</li>)}
        </ul>
        <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 p-4 text-teal-900">
          <strong>Tip: </strong>{mod.tip}
        </div>
        <Link to="/quiz" className="mt-6 inline-block rounded-full bg-teal-600 px-5 py-2 font-semibold text-white hover:bg-teal-700">
          Test yourself
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-bold text-teal-900">Learning centre</h1>
      <p className="mt-2 text-gray-600">Short modules for nursing and medical students. Read, then take the quiz.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {modules.map((m) => (
          <Link key={m.id} to={`/learn/${m.id}`} className="rounded-2xl bg-white p-5 shadow transition hover:shadow-lg">
            <h2 className="text-xl font-semibold text-teal-800">{m.title}</h2>
            <p className="mt-2 text-gray-600">{m.intro}</p>
            <p className="mt-3 text-sm text-gray-400">{m.minutes} min</p>
          </Link>
        ))}
      </div>
    </div>
  );
}