const guessInput = document.getElementById("guessInput");
const guessBtn = document.getElementById("guessBtn");
const newBtn = document.getElementById("newBtn");

const messageEl = document.getElementById("message");
const attemptsEl = document.getElementById("attempts");
const bestAttemptsEl = document.getElementById("bestAttempts");

let secret = 0;
let attempts = 0;

function bestKey() {
  return "guess_best_attempts";
}

function loadBest() {
  const v = localStorage.getItem(bestKey());
  return v ? Number(v) : null;
}

function saveBest(v) {
  localStorage.setItem(bestKey(), String(v));
}

function renderBest() {
  const best = loadBest();
  bestAttemptsEl.textContent = best === null ? "—" : String(best);
}

function setMessage(text) {
  messageEl.textContent = text;
}

function newGame() {
  secret = Math.floor(Math.random() * 100) + 1; // 1..100
  attempts = 0;
  attemptsEl.textContent = "0";
  guessInput.value = "";
  setMessage("Good luck 🍀");
  renderBest();
}

function handleGuess() {
  const value = Number(guessInput.value);

  if (!value || value < 1 || value > 100) {
    setMessage("Enter a number between 1 and 100.");
    return;
  }

  attempts++;
  attemptsEl.textContent = String(attempts);

  if (value === secret) {
    setMessage(`Correct ✅ The number was ${secret}.`);

    const best = loadBest();
    if (best === null || attempts < best) {
      saveBest(attempts);
    }
    renderBest();
  } else if (value < secret) {
    setMessage("Too low ⬇️");
  } else {
    setMessage("Too high ⬆️");
  }

  guessInput.select();
}

guessBtn.addEventListener("click", handleGuess);
newBtn.addEventListener("click", newGame);
guessInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleGuess();
});

newGame();
