const textDisplay = document.getElementById("textdisplay");
const startButton = document.querySelector(".startbutton");
const hiddenInput = document.querySelector(".hiddeninput");

const values = document.querySelectorAll(".stats-bar .stats-group:first-child .stat .value");
const wpmEl = values[0];
const accEl = values[1];
const timeEl = values[2];

const targetText = textDisplay.textContent.replace(/\s+/g, " ").trim();
const TEST_DURATION = 60;

let startTime = null;
let timerId = null;
let isRunning = false;
let timeLeft = TEST_DURATION;

function formatTime(seconds) {
  return `0:${String(seconds).padStart(2, "0")}`;
}

function render(typed, showCurrent = true) {
  typed = typed || "";
  let html = "";

  for (let i = 0; i < targetText.length; i++) {
    const targetChar = targetText[i];
    const typedChar = typed[i];

    let cls = "char";

    if (typedChar == null) {
      if (showCurrent && i === typed.length) cls += " current";
    } else if (typedChar === targetChar) {
      cls += " correct";
    } else {
      cls += " wrong";
    }

    const safeChar = targetChar === " " ? " " : targetChar;
    html += `<span class="${cls}">${safeChar}</span>`;
  }

  textDisplay.innerHTML = html;
}

function calcStats(typed) {
  const typedLen = typed.length;
  const targetLen = targetText.length;

  let correct = 0;

  const compareLen = Math.min(typedLen, targetLen);
  for (let i = 0; i < compareLen; i++) {
    if (typed[i] === targetText[i]) correct++;
  }

  const accuracy = typedLen === 0 ? 100 : (correct / typedLen) * 100;

  const now = performance.now();
  const minutes = startTime ? (now - startTime) / 60000 : 0;
  const wpm = minutes > 0 ? (correct / 5) / minutes : 0;

  return { wpm, accuracy };
}

function updateUI(typed) {
  const { wpm, accuracy } = calcStats(typed);
  wpmEl.textContent = String(Math.floor(wpm));
  accEl.textContent = `${Math.round(accuracy)}%`;
  timeEl.textContent = formatTime(timeLeft);
}

function resetTestUI() {
  textDisplay.classList.add("textblurred");
  textDisplay.classList.remove("textdisplay");

  startButton.style.display = "inline-block";
  startButton.textContent = "Start Typing Test";

  hiddenInput.value = "";
  hiddenInput.disabled = false;

  timeLeft = TEST_DURATION;
  wpmEl.textContent = "0";
  accEl.textContent = "100%";
  timeEl.textContent = formatTime(timeLeft);

  render("", true);
}

function endTest() {
  if (!isRunning) return; // evita chamar duas vezes
  isRunning = false;

  clearInterval(timerId);
  timerId = null;

  hiddenInput.disabled = true;
  hiddenInput.blur();

  // tira cursor e deixa o texto final renderizado
  render(hiddenInput.value, false);

  // volta blur
  textDisplay.classList.add("textblurred");
  textDisplay.classList.remove("textdisplay");

  // trava tempo no 0
  timeLeft = 0;
  timeEl.textContent = formatTime(0);

  startButton.style.display = "inline-block";
  startButton.textContent = "Go Again";
}

function startTest() {
  textDisplay.classList.remove("textblurred");
  textDisplay.classList.add("textdisplay");
  startButton.style.display = "none";

  hiddenInput.disabled = false;
  hiddenInput.value = "";
  hiddenInput.focus();

  startTime = performance.now();
  isRunning = true;
  timeLeft = TEST_DURATION;

  render("", true);
  updateUI("");

  clearInterval(timerId);
  timerId = setInterval(() => {
    timeLeft = Math.max(0, timeLeft - 1);
    timeEl.textContent = formatTime(timeLeft);

    if (timeLeft === 0) endTest();
  }, 1000);
}

startButton.addEventListener("click", () => {
  if (startButton.textContent === "Go Again") resetTestUI();
  startTest();
});

hiddenInput.addEventListener("input", () => {
  if (!isRunning) return;

  const typed = hiddenInput.value;
  render(typed, true);
  updateUI(typed);

  if (typed.length >= targetText.length) endTest();
});

resetTestUI();
