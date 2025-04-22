// Elements
var themeSelect = document.getElementById("themeSelect");
var difficultySelect = document.getElementById("difficultySelect");
var startBtn = document.getElementById("startBtn");
var restartBtn = document.getElementById("restartBtn");
var moveCounter = document.getElementById("moveCounter");
var timer = document.getElementById("timer");
var board = document.getElementById("gameBoard");

// Sounds
var flipSound = document.getElementById("flipSound");
var matchSound = document.getElementById("matchSound");
var startSound = document.getElementById("startSound");
var endSound = document.getElementById("endSound");

// Game State Variables
var flipped = [];
var matched = [];
var interval;
var moves = 0;
var seconds = 0;

// Themes
var themes = {
  animals: ["🐶", "🐱", "🐭", "🦊", "🐸", "🐵", "🐔", "🦁", "🐷", "🐨", "🐰", "🐮", "🐼", "🦄", "🐙", "🦉", "🐢", "🦕", "🐍", "🐦", "🦋", "🦀", "🦑", "🐧", "🦓", "🐊", "🐳", "🦜", "🐞", "🐝", "🪲", "🐬"],
  fruits: ["🍎", "🍌", "🍇", "🍉", "🍓", "🍒", "🥝", "🍍", "🍑", "🍊", "🍈", "🥭", "🥥", "🍋", "🍐", "🍅", "🍆", "🌽", "🥒", "🥕", "🧄", "🧅", "🍠", "🥔", "🍞", "🥯", "🧀", "🥜", "🌰", "🥨", "🍪", "🍫", "🍬", "🍭"],
  numbers: ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟", "🔢", "➕", "➖", "➗", "✖️", "🧮", "🔠", "🔡", "🔤", "🔟", "🆎", "🆑", "🆘", "🔛", "🔝", "🔙", "🔚", "🔜", "🈁", "🈯", "🈲", "🈵"]
};

// Page Initialization
window.onload = function () {
  // Set the board difficulty from localStorage
  var savedDifficulty = localStorage.getItem("difficulty");
  if (savedDifficulty) {
    difficultySelect.value = savedDifficulty;
    setBoardSize(savedDifficulty);
  }

  // Set the selected theme from localStorage
  var savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    themeSelect.value = savedTheme;
  }

  // Set the mute status from localStorage
  var isMuted = localStorage.getItem("mute") === "true";
  if (isMuted) {
    muteSounds();
  }
};

// Start Game Logic
startBtn.onclick = startGame;
restartBtn.onclick = startGame;

function startGame() {
  var selectedTheme = themeSelect.value;
  localStorage.setItem("theme", selectedTheme); // Save selected theme

  var selectedDifficulty = difficultySelect.value;
  localStorage.setItem("difficulty", selectedDifficulty); // Save selected difficulty
  setBoardSize(selectedDifficulty); // Set board size based on difficulty

  startSound.play(); // Play the start sound
  moves = 0; seconds = 0;
  flipped = [];
  matched = [];
  moveCounter.textContent = "0";
  timer.textContent = "00:00";
  if (interval) clearInterval(interval); // Reset timer

  // Start the timer
  interval = setInterval(function () {
    seconds++;
    var mins = ("0" + Math.floor(seconds / 60)).slice(-2);
    var secs = ("0" + (seconds % 60)).slice(-2);
    timer.textContent = mins + ":" + secs;
  }, 1000);

  generateCards(); // Generate new cards
}

// Generate Cards Function
function generateCards() {
  board.innerHTML = "";
  var size = board.className.indexOf("medium") !== -1 ? 36 :
    board.className.indexOf("hard") !== -1 ? 64 : 16;

  var selectedTheme = localStorage.getItem("theme") || "animals";
  var icons = themes[selectedTheme].slice(0, size / 2);
  var cards = icons.concat(icons); // Create pairs of icons
  shuffle(cards); // Shuffle cards

  // Create card elements
  for (var i = 0; i < cards.length; i++) {
    var icon = cards[i];
    var card = document.createElement("div");
    card.className = "card";
    card.setAttribute("data-icon", icon);
    card.innerHTML = "?";
    card.onclick = (function (c) {
      return function () {
        flipCard(c);
      };
    })(card);
    board.appendChild(card);
  }
}

// Set Board Size Based on Difficulty
function setBoardSize(difficulty) {
  if (difficulty === "easy") {
    board.className = "board easy";
  } else if (difficulty === "medium") {
    board.className = "board medium";
  } else if (difficulty === "hard") {
    board.className = "board hard";
  }
}

// Card Flipping and Matching Logic
function flipCard(card) {
  if (flipped.length >= 2 || hasClass(card, "flipped") || matched.indexOf(card) !== -1) return;

  flipSound.play(); // Play flip sound
  card.innerHTML = card.getAttribute("data-icon");
  card.className += " flipped"; // Add flipped class
  flipped.push(card);

  if (flipped.length === 2) {
    moves++; // Increment move count
    moveCounter.textContent = moves;
    var first = flipped[0];
    var second = flipped[1];

    if (first.getAttribute("data-icon") === second.getAttribute("data-icon")) {
      matchSound.play(); // Play match sound
      matched.push(first, second);
      flipped = [];

      // Check if all cards are matched
      if (matched.length === board.children.length) {
        clearInterval(interval); // Stop the timer
        endSound.play(); // Play win sound
        alert("🎉 You won in " + moves + " moves and " + formatTime(seconds)); // Display win message
        saveScore(moves, seconds); // Save score
      }
    } else {
      // Flip back the cards if no match
      setTimeout(function () {
        for (var i = 0; i < flipped.length; i++) {
          flipped[i].className = flipped[i].className.replace("flipped", "").trim();
          flipped[i].innerHTML = "?";
        }
        flipped = [];
      }, 800);
    }
  }
}

// Time Formatting
function formatTime(sec) {
  var m = ("0" + Math.floor(sec / 60)).slice(-2);
  var s = ("0" + (sec % 60)).slice(-2);
  return m + ":" + s;
}

// Save Score Function
function saveScore(moves, timeInSec) {
  var difficulty = localStorage.getItem("difficulty") || "easy";
  var scores = JSON.parse(localStorage.getItem("scores") || "{}");
  if (!scores[difficulty]) scores[difficulty] = [];

  var playerName = prompt("Congratulations! Please enter your name to save your score:");

  if (playerName) {
    scores[difficulty].push({
      name: playerName,
      moves: moves,
      time: timeInSec
    });

    localStorage.setItem("scores", JSON.stringify(scores)); // Save scores to localStorage
    alert("Your score has been saved!"); // Notify user
  }
}

// Shuffle the cards
function shuffle(array) {
  var i, j, temp;
  for (i = array.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

// Check if an element has a specific class
function hasClass(el, cls) {
  return (" " + el.className + " ").indexOf(" " + cls + " ") > -1;
}

// Mute Sounds
function muteSounds() {
  localStorage.setItem("mute", "true");
  flipSound.muted = true;
  matchSound.muted = true;
  startSound.muted = true;
  endSound.muted = true;
}

// Unmute Sounds
function unmuteSounds() {
  localStorage.setItem("mute", "false");
  flipSound.muted = false;
  matchSound.muted = false;
  startSound.muted = false;
  endSound.muted = false;
}



