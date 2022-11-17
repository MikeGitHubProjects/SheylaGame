"use strict";

// Sound effects
const winGame = new Audio("./assets/sounds/winGame.mp3");
const nextLevelSound = new Audio("./assets/sounds/nextLevel.mp3");
const rightWord = new Audio("./assets/sounds/rightWord.wav");
const wrongWord = new Audio("./assets/sounds/wrongWord.wav");
const winRPS = new Audio("./assets/sounds/winRPS.wav");
const loseRPS = new Audio("./assets/sounds/loseRPS.wav");
const tieRPS = new Audio("./assets/sounds/tieRPS.mp3");

// Global Variables
let playCategory = "practice";
const levels = ["practice", "easy", "medium", "hard"];
let currentLevel = 0;
let playLevel = levels[currentLevel];
const hintTries = { practice: 4, easy: 3, medium: 2, hard: 1 };

// player category buttons
const practiceButton = document.getElementById("practice");
const animalsButton = document.getElementById("animals");
const carsButton = document.getElementById("cars");
const geographyButton = document.getElementById("geography");

// game category selection
practiceButton.addEventListener("click", () => {
  playCategory = "practice";
  practiceButton.classList.add("active");
  animalsButton.classList.remove("active");
  carsButton.classList.remove("active");
  geographyButton.classList.remove("active");
});

animalsButton.addEventListener("click", () => {
  animalsButton.classList.add("active");
  carsButton.classList.remove("active");
  geographyButton.classList.remove("active");
  practiceButton.classList.remove("active");
  playCategory = "animals";
});

carsButton.addEventListener("click", () => {
  carsButton.classList.add("active");
  animalsButton.classList.remove("active");
  geographyButton.classList.remove("active");
  practiceButton.classList.remove("active");
  playCategory = "cars";
});

geographyButton.addEventListener("click", () => {
  geographyButton.classList.add("active");
  carsButton.classList.remove("active");
  animalsButton.classList.remove("active");
  practiceButton.classList.remove("active");
  playCategory = "geography";
});

// player name input
const player1NameInput = document.getElementById("player1-name");
let player1Name = "";
// player name show
const player1Show = document.querySelectorAll(".player1-name-show");

/**
 * Check if the name is correct and start game
 * @param {event} e
 */
const checkNameAndStart = (e) => {
  // check if player 1 name is empty
  if (player1NameInput.value === "") {
    player1NameInput.placeholder = "Please enter a name";
    player1NameInput.classList.add("is-invalid");
  } else {
    // if player 1 name is not empty
    player1NameInput.classList.remove("is-invalid");
    player1NameInput.classList.add("is-valid");
    player1Name = player1NameInput.value;
    window.location.hash = e.target.dataset.nextaction;
    preStartGame(e.target.dataset.nextaction);
  }
};

// player 1/single name check
const startButton = document.getElementById("start-game");
startButton.addEventListener("click", checkNameAndStart);

// checkNameAndStart on enter key
player1NameInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    startButton.click();
  }
});

/**
 * Clear inputs
 */
const clearInputs = () => {
  document.querySelectorAll("input").forEach((input) => {
    input.value = "";
    input.classList.remove("is-valid");
    input.classList.remove("is-invalid");
  });
};

// reset buttons
const resetButtons = document.querySelectorAll(".reset-button");
const resetGame = () => {
  window.location.hash = "#game-board";
  startGame();
};
resetButtons.forEach((button) => {
  button.addEventListener("click", resetGame);
});

/**
 * continue game, activates the continue button
 * @param {boolean} gamePlay if the game is being played or not
 */
const continueGame = (gamePlay) => {
  if (gamePlay === true) {
    document.getElementById("continue-button").classList.remove("disabled");
  } else {
    document.getElementById("continue-button").classList.add("disabled");
  }
};

// player(s) greeting
const playersGreeting = document.getElementById("start-greeting");
/**
 * Greet the players
 * @param {Object} player1
 */
const playersGreetingShow = (player1) => {
  // greeting for single player
  // creating greeting title
  const player1GreetingText = document.createElement("h3");
  player1GreetingText.textContent = `Hello ${player1.name}!`;

  // greeting punchline
  const botGreeting = document.createElement("h3");
  if (playCategory === "practice") {
    botGreeting.textContent = "Let's take it easy and practice!";
  } else {
    botGreeting.textContent = `Lets's test your knowledge about ${playCategory}!`;
  }

  // appending greeting title
  playersGreeting.innerHTML = "";
  playersGreeting.appendChild(player1GreetingText);
  playersGreeting.appendChild(botGreeting);
};

// functions to process the start game actions
/**
 * Prepare the game
 * @param {string} startButtonNextAction
 */
const preStartGame = (startButtonNextAction) => {
  // make sure the player is named
  playersGreetingShow({ name: player1Name });

  // populate players names on the game board
  player1Show.forEach((player) => {
    player.classList.remove("col-md-6");
    player.textContent = `${player1Name}`;
  });

  // set window to id game-board
  window.location.hash = startButtonNextAction;
  setTimeout(startGame, 3000);
  clearInputs();
};

/**
 * Start the game
 */
const startGame = () => {
  window.location.hash = "#game-board";

  // start the game
  playGame();

  // activate the continue button
  continueGame(true);
};

/**
 * Game Scramble
 */
const msg = document.querySelector(".msg");
const msgOpt = document.querySelector(".msgopt");
const triesLeft = document.getElementById("tries");
const triesImg = document.getElementById("tries-img");
const wordsLeftShow = document.getElementById("words-left");
const guess = document.getElementById("word-guess");
const btn = document.getElementById("guess");
const levelShow = document.getElementById("level");
const hintButton = document.getElementById("hint");
const hintTriesShow = document.querySelector("#hint sub");
const inGameReset = document.getElementById("in-game-reset");

let rawWordList = [];

document.addEventListener("DOMContentLoaded", () => {
  // check if data is in session storage
  if (sessionStorage.getItem("wordList")) {
    rawWordList = JSON.parse(sessionStorage.getItem("wordList"));
  } else {
    // grab words.json from one level up
    fetch("./assets/words.json")
      .then((response) => {
        // store the response in wordList
        return response.json();
      })
      .then((data) => {
        rawWordList = data;
        // store data in session storage
        sessionStorage.setItem("wordList", JSON.stringify(data));
        return data;
      });
  }
});

let play = false;
let splitWord = "";
let word;
let wordList = [];
const maxGuesses = 5;
let leftGuesses = maxGuesses;
const levelLength = 10;
let wordsLeft = levelLength;
let wordCount = 0;
let leftHints = 4;

/**
 * A new random word list
 * @param {string} playCategory
 * @param {string} playLevel
 * @param {int} length
 * @returns {object[]} array of object pairs of words and hints
 */
const makeWordList = (playCategory, playLevel, length) => {
  // select words for category and level
  let wordList;
  if (playCategory === "practice") {
    wordList = rawWordList[playCategory];
    length = wordList.length;
  } else {
    wordList = rawWordList[playCategory][playLevel];
  }

  //make unique word list of length
  let uniqueWordList = [];
  while (uniqueWordList.length < length) {
    let randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    if (!uniqueWordList.includes(randomWord)) {
      uniqueWordList.push(randomWord);
    }
  }

  // shuffle the word list
  uniqueWordList.sort(() => Math.random() - 0.5);

  console.log(uniqueWordList);

  return uniqueWordList;
};

/**
 * Scramble the word
 * @param {string} word
 * @returns {string} scrambled word
 */
function scramblingWord(word) {
  let arr = word.split("");
  do {
    arr.sort(() => Math.random() - 0.5);
  } while (arr.join("") === word);
  return arr.join("");
}

/**
 * Play the game
 */
const playGame = () => {
  
  if (guess.disabled === true) {
    play = true;
    guess.disabled = false;
    guess.value = "";
    guess.focus();
    btn.innerHTML = "Guess";
    btn.removeEventListener("click", playSecondChance);
    btn.addEventListener("click", checkGame);
    enableMainGameButtons();
  }

  if (inGameReset.innerHTML === "Quit") {
    msgOpt.classList.remove("show");

    // transform quit button into reset button
    inGameReset.innerHTML = "Reset";
    inGameReset.removeEventListener("click", quitGame);
    inGameReset.addEventListener("click", resetGame);
    inGameReset.classList.remove("btn-danger");
    inGameReset.classList.add("btn-warning");
  }


  currentLevel = 1;
  playLevel = levels[currentLevel];
  if (playCategory === "practice") {
    currentLevel = 0;
    playLevel = levels[currentLevel];
  }
  // make a new word list
  wordList = makeWordList(playCategory, playLevel, levelLength);

  wordCount = 0;
  if (playCategory === "practice") {
    wordsLeft = wordList.length;
  } else {
    wordsLeft = levelLength;
  }

  // set the word
  word = wordList[wordCount];

  // set the scrambled word
  splitWord = scramblingWord(word.word);

  // show level
  levelShow.textContent = playLevel;

  // show the scrambled word
  msg.innerHTML = splitWord;

  // show the number of guesses
  leftGuesses = maxGuesses;
  triesLeft.innerHTML = leftGuesses;

  // show the number of words left
  wordsLeftShow.innerHTML = `${wordsLeft}/${wordList.length}`;

  // show the hint tries
  leftHints = hintTries[playLevel];
  hintTriesShow.innerHTML = leftHints;
  triesImg.style.opacity = 1;
  triesImg.src = `./assets/images/tries-${leftGuesses}.png`;

  // set play to true
  play = true;

  // set the guess input to empty
  guess.value = "";

  // focus on the guess input
  guess.focus();
};

/**
 * Change the word
 */
const nextWord = () => {
  // set the word
  word = wordList[++wordCount];

  // set the scrambled word
  splitWord = scramblingWord(word.word);

  // show the scrambled word
  msg.innerHTML = splitWord;

  // show the number of guesses
  triesLeft.innerHTML = leftGuesses;

  // play right word sound
  rightWord.play();

  // set play to true
  play = true;

  // set the guess input to empty
  guess.value = "";

  // focus on the guess input
  guess.focus();
};

/**
 * Change the level
 */
const nextLevel = () => {
  // show the player that they have completed the level
  msg.innerHTML = `You have completed the ${playLevel} level!`;
  msg.classList.add("normal");

  // set the guess input to empty
  guess.value = "";

  // set play to false
  play = false;

  // disable the guess button
  disableMainGameButtons();

  // play next level sound
  nextLevelSound.play();

  // continue to the next level after 3 seconds
  if (playCategory !== "practice") {
    setTimeout(() => {
      // update level counter
      playLevel = levels[++currentLevel];

      // make a new word list
      wordList = makeWordList(playCategory, playLevel, levelLength);

      wordCount = 0;
      wordsLeft = levelLength;

      // set the word
      word = wordList[wordCount];

      // set the scrambled word
      splitWord = scramblingWord(word.word);

      // show level
      levelShow.textContent = playLevel;

      // show the scrambled word
      msg.classList.remove("normal");
      msg.innerHTML = splitWord;

      // enable the guess button
      enableMainGameButtons();

      // show the number of guesses
      triesLeft.innerHTML = leftGuesses;

      // show the number of words left
      wordsLeftShow.innerHTML = `${wordsLeft}/${wordList.length}`;

      // show the hint tries
      leftHints = hintTries[playLevel];
      hintTriesShow.innerHTML = leftHints;

      // set play to true
      play = true;

      // set the guess input to empty
      guess.value = "";

      // focus on the guess input
      guess.focus();
    }, 3000);
  }
};

/**
 * Show the hint
 */
const showHint = () => {
  if (leftHints > 0) {
    leftHints--;
    hintTriesShow.innerHTML = leftHints;
    msgOpt.innerHTML = `Hint: ${word.hint}`;
    msgOpt.classList.add("show");
    disableMainGameButtons();
    setTimeout(() => {
      msgOpt.classList.remove("show");
      enableMainGameButtons();
      guess.focus();
    }, 5000);
  } else {
    msgOpt.innerHTML = "No more hints";
    msgOpt.classList.add("show");
    disableMainGameButtons();
    setTimeout(() => {
      msgOpt.classList.remove("show");
      enableMainGameButtons();
      guess.focus();
    }, 3000);
  }
};

hintButton.addEventListener("click", showHint);

/**
 * Disable the main game buttons
 */
const disableMainGameButtons = () => {
  btn.disabled = true;
  hintButton.disabled = true;
};

/**
 * Enable the main game buttons
 */
const enableMainGameButtons = () => {
  btn.disabled = false;
  hintButton.disabled = false;
};

/**
 * End game
 */
const endGame = () => {
  // set play to false
  play = false;

  // set the guess input to empty
  guess.value = "";

  // show the name
  const playerNameShow = document.getElementById("win-single-text");

  playerNameShow.textContent = `Good job, ${player1Name}!`;

  // play win sound
  winGame.play();

  // show the end screen
  window.location.hash = "#win-single";
};

/**
 * Quit game
 */
const quitGame = () => {
  // set play to false
  play = false;

  // set the guess input to empty
  guess.value = "";

  // show the name
  const playerNameShow = document.getElementById("lose-single-text");

  playerNameShow.textContent = `Good try, ${player1Name}!`;

  // show the end screen
  window.location.hash = "#lose-single";
};

/**
 * Check the word in the game
 */
const checkGame = () => {
  let tempWord = guess.value;
  if (tempWord === word.word) {
    play = false;
    msg.innerHTML = "Well done";
    // show the number of words left
    wordsLeftShow.innerHTML = `${--wordsLeft}/${wordList.length}`;
    if (wordsLeft === 0) {
      if (currentLevel !== 3 && playCategory !== "practice") {
        nextLevel();
      } else {
        endGame();
      }
    } else {
      nextWord();
    }
  } else {
    msgOpt.classList.add("show");
    msgOpt.innerHTML = "Try again";
    leftGuesses--;
    // play wrong word sound
    wrongWord.play();
    triesLeft.innerHTML = leftGuesses;

    // tries left display image
    if (leftGuesses <= 4 && leftGuesses > 0) {
      triesImg.src = `./assets/images/tries-${leftGuesses}.png`;
      triesImg.classList.add("animate__shakeX");
      setTimeout(() => triesImg.classList.remove("animate__shakeX"), 900);
    }

    // Lose game
    if (leftGuesses == 0) {
      play = false;
      msgOpt.innerHTML = "You ran out of tries";
      btn.innerHTML = "Play for a second chance";
      // disable tries left
      triesImg.style.opacity = 0;
      // disable input
      guess.disabled = true;
      // remove event listener from btn
      btn.removeEventListener("click", checkGame);
      // add event listener to btn
      btn.addEventListener("click", playSecondChance);
      // transform reset button into quit button
      inGameReset.innerHTML = "Quit";
      inGameReset.removeEventListener("click", resetGame);
      inGameReset.addEventListener("click", quitGame);
      inGameReset.classList.add("btn-danger");
      inGameReset.classList.remove("btn-warning");
    } else {
      disableMainGameButtons();
      setTimeout(() => {
        msgOpt.classList.remove("show");
        enableMainGameButtons();
      }, 1000);
    }
  }
};

btn.addEventListener("click", checkGame);
// event listener for the guess input on enter
guess.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    btn.click();
  }
});

// prevent space from appearing in input
guess.addEventListener("keydown", (e) => {
  if (e.key === " ") {
    e.preventDefault();
  }
});

/**
 * Add a new chance following RPS
 */
const addTryAndHintAndRestart = () => {
  // add a try
  leftGuesses++;
  triesLeft.innerHTML = leftGuesses;
  triesImg.style.opacity = 1;

  // add a hint
  leftHints++;
  hintTriesShow.innerHTML = leftHints;

  // restart the game
  play = true;
  guess.disabled = false;
  guess.value = "";
  guess.focus();
  btn.innerHTML = "Guess";
  btn.removeEventListener("click", playSecondChance);
  btn.addEventListener("click", checkGame);
  enableMainGameButtons();

  msgOpt.classList.remove("show");

  // transform quit button into reset button
  inGameReset.innerHTML = "Reset";
  inGameReset.removeEventListener("click", quitGame);
  inGameReset.addEventListener("click", resetGame);
  inGameReset.classList.remove("btn-danger");
  inGameReset.classList.add("btn-warning");

  // switch to main game screen
  setTimeout(() => {
    window.location.hash = "#game-board";
  }, 1000);
};

/**
 * Game RPS
 */
const winner = document.querySelector(".winner");
const scissorsButton = document.getElementById("scissors");
const paperButton = document.getElementById("paper");
const rockButton = document.getElementById("rock");
const timeText = document.querySelector(".time strong");
const time = document.querySelector(".time");
const backRPS = document.getElementById("backRPS");
const playerHand = document.querySelector(".player-hand");
const computerHand = document.querySelector(".computer-hand");

let timer;
let myChance = 0; // verify if i can get another guess for the word

/**
 * Play second chance
 */
const playSecondChance = () => {
  // set window to id game-board
  window.location.hash = "#game-rps-intro";
  clearInputs();
  myChance = 0;
  gameRPS();
};

/**
 * Give the new chance and reset RPS
 */
const giveNewChance = () => {
  addTryAndHintAndRestart();
  myChance = 0;
};

/**
 * Display the retry timer
 * @param {int} maxTime
 */
const retryTimer = (maxTime) => {
  disableButtonsRPS();
  timer = setInterval(() => {
    time.classList.add("show");
    if (maxTime > 0) {
      maxTime--;
      timeText.innerText = maxTime;
    }
  }, 1000);
  setTimeout(() => {
    timeText.innerText = 30;
    clearInterval(timer);
    time.classList.remove("show");
    restartGame();
    enableButtonsRPS();
  }, maxTime * 1000);
};

/**
 * Restart the game
 */
const restartGame = () => {
  winner.textContent = "Choose an option";
  playMatch();
};

/**
 * Start the RPS game
 */
const startGameRPS = () => {
  const playBtn = document.querySelector(".intro button");

  winner.textContent = "Choose an option";

  playerHand.src = `./assets/images/rock.png`;
  computerHand.src = `./assets/images/rock.png`;

  // check if playBtn has event listener
  playBtn.addEventListener("click", () => {
    window.location.hash = playBtn.dataset.nextaction;
  });
};

const optionsOnClick = (e) => {
  const computerOptions = ["rock", "paper", "scissors"];
  const playerChoice = e.currentTarget.id;
  const computerNumber = Math.floor(Math.random() * 3);
  const computerChoice = computerOptions[computerNumber];

  playerHand.src = `./assets/images/rock.png`;
  computerHand.src = `./assets/images/rock.png`;

  setTimeout(
    (player, computer) => {
      //Here is where we call compare hands
      compareHands(player, computer);
      //Update Images
      playerHand.src = `./assets/images/${player}.png`;
      computerHand.src = `./assets/images/${computer}.png`;
    },
    2000,
    playerChoice,
    computerChoice
  );
  //Animation
  playerHand.style.animation = "shakePlayer 2s ease";
  computerHand.style.animation = "shakeComputer 2s ease";
};

/**
 * Play the match
 */
const playMatch = () => {
  const options = document.querySelectorAll(".options button");

  const hands = document.querySelectorAll(".hands img");

  hands.forEach((hand) => {
    hand.addEventListener("animationend", (e) => {
      e.target.style.animation = "";
    });
  });

  // remove event listener from options
  // options.forEach((option) => {
  //   option.removeEventListener("click", optionsOnClick);
  // });

  options.forEach((option) => {
    option.addEventListener("click", optionsOnClick, { once: true });
  });
};

/**
 * Compare hands
 * @param {string} playerChoice
 * @param {string} computerChoice
 */
const compareHands = (playerChoice, computerChoice) => {
  //Checking for a tie
  if (playerChoice === computerChoice) {
    winner.textContent = "It is a tie";
    tieRPS.play();
    myChance = 0;
  } else {
    //Check for Rock
    if (playerChoice === "rock") {
      if (computerChoice === "scissors") {
        winner.textContent = "Player Wins";
        winRPS.play();
        myChance = 1;
      } else {
        winner.textContent = "Computer Wins";
        loseRPS.play();
        myChance = -1;
      }
    }
    //Check for Paper
    if (playerChoice === "paper") {
      if (computerChoice === "scissors") {
        winner.textContent = "Computer Wins";
        loseRPS.play();
        myChance = -1;
      } else {
        winner.textContent = "Player Wins";
        winRPS.play();
        myChance = 1;
      }
    }
    //Check for Scissors
    if (playerChoice === "scissors") {
      if (computerChoice === "rock") {
        winner.textContent = "Computer Wins";
        loseRPS.play();
        myChance = -1;
      } else {
        winner.textContent = "Player Wins";
        winRPS.play();
        myChance = 1;
      }
    }
  }

  switch (myChance) {
    case 0:
      if (playCategory === "practice") {
        retryTimer(3);
      } else {
        retryTimer(3);
      }
      break;
    case -1:
      if (playCategory === "practice") {
        retryTimer(3);
      } else {
        retryTimer(3);
      }
      break;
    case 1:
      giveNewChance();
      break;
  }
};

/**
 * Game RPS
 */
const gameRPS = () => {
  //Is call all the inner function
  enableButtonsRPS();
  startGameRPS();
  playMatch();
};

/**
 * Disable buttons RPS
 */
const disableButtonsRPS = () => {
  rockButton.disabled = true;
  paperButton.disabled = true;
  scissorsButton.disabled = true;
  backRPS.disabled = true;
  time.classList.add("show");
};

/**
 * Enable buttons RPS
 */
const enableButtonsRPS = () => {
  rockButton.disabled = false;
  paperButton.disabled = false;
  scissorsButton.disabled = false;
  backRPS.disabled = false;
  time.classList.remove("show");
};

// return from rps game
backRPS.addEventListener("click", () => {
  window.location.hash = backRPS.dataset.nextaction;
  disableButtonsRPS();
});
