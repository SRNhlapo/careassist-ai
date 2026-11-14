const KEY = "careassist_quiz_results";

export function loadResults() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function saveResult(result) {
  try {
    localStorage.setItem(KEY, JSON.stringify([result, ...loadResults()].slice(0, 20)));
  } catch {
    /* storage unavailable: ignore */
  }
}