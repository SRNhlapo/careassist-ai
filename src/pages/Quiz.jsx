import { useState } from "react";
import { Link } from "react-router-dom";
import { questions } from "../data/quizQuestions";
import { modules } from "../data/learningModules";
import { saveResult } from "../lib/quizStorage";

export default function Quiz() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);

  const q = questions[index];
  const answered = selected !== null;

  function next() {
    const updated = [...answers, { id: q.id, correct: selected === q.answer }];
    setAnswers(updated);
    if (index + 1 === questions.length) {
      const score = updated.filter((a) => a.correct).length;
      const missed = [
        ...new Set(
          updated.filter((a) => !a.correct).map((a) => questions.find((x) => x.id === a.id).moduleId)
        ),
      ];
      saveResult({ date: new Date().toISOString(), score, total: questions.length, missed });
      setFinished(true);
    } else {
      setIndex(index + 1);
      setSelected(null);
    }
  }

  function restart() {
    setIndex(0);
    setSelected(null);
    setAnswers([]);
    setFinished(false);
  }

  if (finished) {
    const score = answers.filter((a) => a.correct).length;
    const missedIds = [
      ...new Set(answers.filter((a) => !a.correct).map((a) => questions.find((x) => x.id === a.id).moduleId)),
    ];
    return (
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="text-3xl font-bold text-teal-900">Quiz complete</h1>
        <p className="mt-3 text-5xl font-bold text-teal-600">{score}/{questions.length}</p>
        {missedIds.length > 0 ? (
          <div className="mt-6">
            <h2 className="text-xl font-semibold">Your study plan</h2>
            <p className="text-gray-600">Review these modules, based on what you missed:</p>
            <ul className="mt-3 space-y-2">
              {missedIds.map((id) => (
                <li key={id}>
                  <Link className="text-teal-700 underline" to={`/learn/${id}`}>
                    {modules.find((m) => m.id === id)?.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-4 text-gray-700">Perfect score. Great work!</p>
        )}
        <button onClick={restart} className="mt-6 rounded-full bg-teal-600 px-5 py-2 font-semibold text-white hover:bg-teal-700">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <p className="text-sm text-gray-500">Question {index + 1} of {questions.length}</p>
      <h1 className="mt-2 text-2xl font-bold text-teal-900">{q.q}</h1>
      <div className="mt-5 space-y-3">
        {q.options.map((opt, i) => {
          let style = "border-gray-300 bg-white hover:border-teal-500";
          if (answered && i === q.answer) style = "border-green-600 bg-green-50";
          else if (answered && i === selected) style = "border-red-500 bg-red-50";
          return (
            <button key={i} disabled={answered} onClick={() => setSelected(i)}
              className={`w-full rounded-xl border-2 p-4 text-left ${style}`}>
              {opt}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="mt-5 rounded-xl bg-teal-50 p-4 text-teal-900">
          <strong>{selected === q.answer ? "Correct. " : "Not quite. "}</strong>{q.explanation}
          <div>
            <button onClick={next} className="mt-4 rounded-full bg-teal-600 px-5 py-2 font-semibold text-white hover:bg-teal-700">
              {index + 1 === questions.length ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}