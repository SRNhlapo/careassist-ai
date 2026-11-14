import QuizHistory from "../components/QuizHistory";

export default function Progress() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold text-teal-900">Your progress</h1>
      <p className="mt-2 text-gray-600">
        Track your quiz scores and see which modules to review next.
      </p>
      <QuizHistory />
    </div>
  );
}