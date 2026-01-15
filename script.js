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
  let wrong = 0;

  const compareLen = Math.min(typedLen, targetLen);
  for (let i = 0; i < compareLen; i++) {
    if (typed[i] === targetText[i]) correct++;
    else wrong++;
  }

  if (typedLen > targetLen) wrong += (typedLen - targetLen);

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
  // volta estado “pré-teste”
  textDisplay.classList.add("textblurred");
  textDisplay.classList.remove("textdisplay");

  startButton.style.display = "inline-block";
  startButton.textContent = "Start Typing Test";

  hiddenInput.value = "";
  hiddenInput.disabled = false;

  timeLeft = TEST_DURATION;
  wpmEl.textContent = "0";
  accEl.textContent = "100%";
  timeEl.textContent = formatTime(TEST_DURATION);

  // mostra o texto “limpo” com cursor na 1ª letra (ainda sem rodar)
  render("", true);
}

function endTest() {
  function endTest() {
    isRunning = false;
    clearInterval(timerId);
    timerId = null;
  
    hiddenInput.disabled = true;
    hiddenInput.blur();
  
    // tira cursor e deixa o texto final renderizado
    render(hiddenInput.value, false);
  
    // VOLTA O BLUR (garantido)
    textDisplay.classList.add("textblurred");
    textDisplay.classList.remove("textdisplay");
  
    startButton.style.display = "inline-block";
    startButton.textContent = "Go Again";
    timeLeft = 0;
    timeEl.textContent = formatTime(0);
  }
}

function startTest() {
  // visual
  textDisplay.classList.remove("textblurred");
  textDisplay.classList.add("textdisplay");
  startButton.style.display = "none";

  // reset estado
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
    timeLeft--;
    timeEl.textContent = formatTime(timeLeft);

    if (timeLeft <= 0) endTest();
  }, 1000);
}

// clique serve tanto pra Start quanto pra Go Again
startButton.addEventListener("click", () => {
  // se tá mostrando “Go Again”, reseta antes
  if (startButton.textContent === "Go Again") {
    resetTestUI();
  }
  startTest();
});

hiddenInput.addEventListener("input", () => {
  if (!isRunning) return;

  const typed = hiddenInput.value;
  render(typed, true);
  updateUI(typed);

  if (typed.length >= targetText.length) endTest();
});

// inicializa a tela certinha
resetTestUI();
