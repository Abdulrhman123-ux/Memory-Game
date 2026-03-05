const box = document.getElementById("box");
const lastEl = document.getElementById("last");
const bestEl = document.getElementById("best");
const resetBestBtn = document.getElementById("resetBest");

let startTime = 0;
let timeoutId = null;

// states: idle -> waiting -> green
let state = "idle";

function bestKey() {
  return "reaction_best_ms";
}

function loadBest() {
  const v = localStorage.getItem(bestKey());
  return v ? Number(v) : null;
}

function saveBest(ms) {
  localStorage.setItem(bestKey(), String(ms));
}

function renderBest() {
  const best = loadBest();
  bestEl.textContent = best === null ? "—" : `${best} ms`;
}

function setBox(color, text) {
  box.style.background = color;
  box.textContent = text;
}

function startRound() {
  state = "waiting";
  setBox("#ef4444", "Wait for green...");

  const delay = Math.floor(Math.random() * 2500) + 1500; // 1500-4000ms

  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    state = "green";
    setBox("#22c55e", "CLICK!");
    startTime = Date.now();
  }, delay);
}

box.addEventListener("click", () => {
  if (state === "idle") {
    startRound();
    return;
  }

  if (state === "waiting") {
    // clicked too early
    clearTimeout(timeoutId);
    state = "idle";
    setBox("#111827", "Too early! Click to try again");
    lastEl.textContent = "—";
    return;
  }

  if (state === "green") {
    const ms = Date.now() - startTime;
    lastEl.textContent = `${ms} ms`;

    const best = loadBest();
    if (best === null || ms < best) {
      saveBest(ms);
    }
    renderBest();

    state = "idle";
    setBox("#111827", "Nice! Click to play again");
  }
});

resetBestBtn.addEventListener("click", () => {
  localStorage.removeItem(bestKey());
  renderBest();
});

function init() {
  renderBest();
  setBox("#111827", "Click to start");
}
init();
