const board = document.getElementById("gameBoard");
const boardSizeSelect = document.getElementById("boardSize");
const restartBtn = document.getElementById("restartBtn");

const timeEl = document.getElementById("time");
const movesEl = document.getElementById("moves");
const pairsEl = document.getElementById("pairs");

const winModal = document.getElementById("winModal");
const winTimeEl = document.getElementById("winTime");
const winMovesEl = document.getElementById("winMoves");
const bestScoreEl = document.getElementById("bestScore");
const playAgainBtn = document.getElementById("playAgainBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

const EMOJIS = [
  "🐶","🐱","🐼","🐸","🦊","🐵","🐧","🐯","🐷","🐙","🦄","🐝",
  "🍎","🍇","🍓","🍉","🍒","🥝","🍋","🥑","🍕","🍔","🍟","🍩"
];

// game state
let firstCard = null;
let secondCard = null;
let lockBoard = false;

let moves = 0;
let matchedPairs = 0;
let totalPairs = 0;

let timerId = null;
let seconds = 0;
let timerStarted = false;

function formatTime(s) {
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}
function getBestKey() {
  return `memory_best_${boardSizeSelect.value}`;
}

function loadBest() {
  const raw = localStorage.getItem(getBestKey());
  return raw ? JSON.parse(raw) : null; // { seconds, moves }
}

function saveBest(best) {
  localStorage.setItem(getBestKey(), JSON.stringify(best));
}

function bestToText(best) {
  if (!best) return "—";
  return `${formatTime(best.seconds)} / ${best.moves} moves`;
}

function openModal() {
  winModal.classList.remove("hidden");
}

function closeModal() {
  winModal.classList.add("hidden");
}

function startTimer() {
  if (timerStarted) return;
  timerStarted = true;
  timerId = setInterval(() => {
    seconds++;
    timeEl.textContent = formatTime(seconds);
  }, 1000);
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
  timerStarted = false;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function getBoardDims() {
  const [cols, rows] = boardSizeSelect.value.split("x").map(Number);
  return { cols, rows, totalCards: cols * rows };
}

function pickSymbols(pairCount) {
  // take first pairCount emojis (enough for max board)
  return EMOJIS.slice(0, pairCount);
}

function updateUI() {
  movesEl.textContent = String(moves);
  pairsEl.textContent = `${matchedPairs}/${totalPairs}`;
  timeEl.textContent = formatTime(seconds);
}

function resetTurn() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function playShuffleEffect() {
  const cards = Array.from(document.querySelectorAll(".card"));

  cards.forEach((card) => {
    const delay = Math.floor(Math.random() * 120);
    setTimeout(() => {
      card.classList.add("shuffle");
    }, delay);
  });

  setTimeout(() => {
    cards.forEach((card) => card.classList.remove("shuffle"));
  }, 900);
}
function flipCard(cardEl) {
  if (lockBoard) return;
  if (cardEl.classList.contains("matched")) return;
  if (cardEl === firstCard) return;

  // start timer on first action
  startTimer();

  cardEl.classList.add("flipped");

  if (!firstCard) {
    firstCard = cardEl;
    return;
  }

  secondCard = cardEl;
  lockBoard = true;
  moves++;
  movesEl.textContent = String(moves);

  const a = firstCard.dataset.symbol;
  const b = secondCard.dataset.symbol;

  if (a === b) {
    // matched
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");
    matchedPairs++;
    pairsEl.textContent = `${matchedPairs}/${totalPairs}`;
    resetTurn();

  if (matchedPairs === totalPairs) {
    playShuffleEffect();

setTimeout(() => {
  buildBoard();
}, 1000);
  stopTimer();

  // check + update best score
  const current = { seconds, moves };
  const best = loadBest();

  const isBetter =
    !best ||
    current.seconds < best.seconds ||
    (current.seconds === best.seconds && current.moves < best.moves);

  if (isBetter) saveBest(current);

  // show modal
  winTimeEl.textContent = formatTime(seconds);
  winMovesEl.textContent = String(moves);
  bestScoreEl.textContent = bestToText(loadBest());

  setTimeout(openModal, 250);
}
  } else {
    // not matched -> flip back after a short delay
    setTimeout(() => {
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      resetTurn();
    }, 700);
  }
}

function createCard(symbol) {
  const card = document.createElement("button");
  card.className = "card";
  card.type = "button";
  card.dataset.symbol = symbol;
  card.setAttribute("aria-label", "Memory card");

  card.innerHTML = `
    <div class="card-inner">
      <div class="card-face card-front">?</div>
      <div class="card-face card-back">${symbol}</div>
    </div>
  `;

  card.addEventListener("click", () => flipCard(card));
  return card;
}
playAgainBtn.addEventListener("click", () => {
  closeModal();
  buildBoard();
});



closeModalBtn.addEventListener("click", closeModal);

winModal.addEventListener("click", (e) => {
  if (e.target === winModal) closeModal(); // click outside
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

function buildBoard() {
  // reset state
  firstCard = null;
  secondCard = null;
  lockBoard = false;

  moves = 0;
  matchedPairs = 0;
  seconds = 0;
  stopTimer();

  const { cols, totalCards } = getBoardDims();
  board.style.gridTemplateColumns = `repeat(${cols}, 90px)`;

  totalPairs = totalCards / 2;

  // create symbols -> pairs -> shuffle
  const symbols = pickSymbols(totalPairs);
  const cards = [...symbols, ...symbols];
  shuffle(cards);

  // render
  board.innerHTML = "";
  cards.forEach((sym) => board.appendChild(createCard(sym)));

  updateUI();
  bestScoreEl.textContent = bestToText(loadBest());
}

boardSizeSelect.addEventListener("change", buildBoard);
restartBtn.addEventListener("click", buildBoard);

buildBoard();
