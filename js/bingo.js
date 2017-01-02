var bingoBoard = document.getElementById("bingoboard"),
    bingoLetters = ["B", "I", "N", "G", "O"],
    allBingoNumbers = [],
    calledBingoNumbers = [],
    availableVoices = [
        "Daniel", "Fiona", "Karen", "Moira", "Samantha", "Tessa",
        "Google US English", "Google UK English Male", "Google UK English Female"
    ],
    selectedVoice = 'Daniel',
    callBallInterval;

document.getElementById('startGame').addEventListener('click', startGame);
document.getElementById('pauseGame').addEventListener('click', pauseGame);
document.getElementById('resumeGame').addEventListener('click', resumeGame);
document.getElementById('resetBoard').addEventListener('click', resetBoard);

// set initial voice to a random one
selectedVoice = availableVoices[Math.floor(Math.random() * availableVoices.length)];
initSpeak();

// generate the bingo board to show on screen
function generateBoard(bingoBoard) {
    speak("");
    // loop through the bingo letters
    var currentBall = 1;
    for (var i = 0; i < bingoLetters.length; i++) {
        // Add a div that shows the current letter
        var bingoLetter = createDiv('letter', bingoLetters[i]);
        var letterBlock = createDiv('letter-block', "");
        bingoBoard.appendChild(letterBlock);
        letterBlock.appendChild(bingoLetter);
        currentBall = add15Balls(currentBall, letterBlock, bingoLetters[i]);
    }
}

// add the bingo balls to the board
function add15Balls(ballNumber, letterBlock, letter){
    var totalBalls = ballNumber + 15;
    for(ballNumber; ballNumber < totalBalls; ballNumber++){
        var newBall = createDiv('ball ' + letter + ballNumber, (ballNumber));
        letterBlock.appendChild(newBall);
        allBingoNumbers.push(letter + ballNumber);
    }
    return ballNumber;
}

// set the currently called ball
function setCurrentBall(ball) {
    var current = document.getElementsByClassName(ball);
    for (var i = 0; i < current.length; i++) {
        current[i].className += " current";
    }
}

// clear the currently called ball
function clearCurrentBall(){
    var currentElement = document.getElementsByClassName("current");
    if(currentElement) {
        for (var i = 0; i < currentElement.length; i++) {
            currentElement[i].classList.add("called");
            currentElement[i].classList.remove("current");
        }
    }
}

// start a new game
function startGame(){
    speak("Let's play bingo!");
    console.log("Start game!");
    calledBingoNumbers = [];
    callNumber(calledBingoNumbers);
    callBallInterval = setInterval(callNumber, 10000, calledBingoNumbers);
    document.getElementById("pauseGame").style.display = "inline-block";
    document.getElementById("resetBoard").style.display = "inline-block";
}

// pause the current game
function pauseGame(){
    console.log("Pause game!");
    clearInterval(callBallInterval);
    document.getElementById("pauseGame").style.display = "none";
    document.getElementById("resumeGame").style.display = "inline-block";
}

// resume the current game
function resumeGame(){
    console.log("Resume game!");
    document.getElementById("resumeGame").style.display = "none";
    document.getElementById("pauseGame").style.display = "inline-block";

    callNumber(calledBingoNumbers);
    callBallInterval = setInterval(callNumber, 10000, calledBingoNumbers);
}

// reset the board
function resetBoard(){
    console.log("Reset game!");
    bingoBoard.innerHTML = '';
    document.getElementById('lastCall').innerHTML = '';
    document.getElementById('newCall').innerHTML = '';
    generateBoard(bingoBoard);

    document.getElementById("pauseGame").style.display = "none";
    document.getElementById("resumeGame").style.display = "none";
    document.getElementById("resetBoard").style.display = "none";
}

// call a bingo number
function callNumber(calledBingoNumbers) {
    if(calledBingoNumbers.length == 75){
        clearInterval(callBallInterval);
    } else {
        clearCurrentBall();
    }
    var existingBall = document.getElementById('currentBall');
    if(existingBall){
        existingBall.setAttribute('id', 'lastBall');
        var lastCall = document.getElementById('lastCall');
        lastCall.innerHTML = '';
        lastCall.appendChild(existingBall);
    }

    var newBall = allBingoNumbers[Math.floor(Math.random() * allBingoNumbers.length)];
    // call the number aloud
    speak(newBall);
    var split = newBall.split("");
    for (var i = 0; i < split.length; i++) {
        speak(split[i].toLowerCase());
    }

    var color = '';
    switch (split[0]) {
        case 'B':
            color = 'blue';
            break;
        case 'I':
            color = 'red';
            break;
        case 'N':
            color = 'white';
            break;
        case 'G':
            color = 'green';
            break;
        case 'O':
            color = 'orange';
            break;
    }

    var newBallElement = document.createElement('div');
    newBallElement.setAttribute('id','currentBall');
    newBallElement.className = color;
    var newBallText = document.createElement('div');
    newBallText.className = 'ballText';
    var splitBall = newBall.split('');
    newBallText.innerHTML = splitBall[0] + "<br>" + splitBall[1];
    if(splitBall[2] !== undefined){
        newBallText.innerHTML += splitBall[2];
    }
    document.getElementById('newCall').appendChild(newBallElement);
    newBallElement.appendChild(newBallText);

    // pull this ball from the array of numbers
    var index = allBingoNumbers.indexOf(newBall);
    allBingoNumbers.splice(index, 1);
    // add this ball to the array of called numbers
    calledBingoNumbers = calledBingoNumbers.push(newBall);
    // set the current ball so it will blink
    setCurrentBall(newBall);
    return calledBingoNumbers;
}


// create a new div element
function createDiv(divClass, content) {
    var element = document.createElement('div');
    element.className = divClass;
    element.innerHTML = content;
    return element;
}

function initSpeak(){
    // SPEECH SYNTHESIS FOR CALLING OUT BALLS

    /*
     * Check for browser support
     */
    var supportMsg = document.getElementById('msg');

    if ('speechSynthesis' in window) {
        addVoiceEventListeners();
    } else {
        supportMsg.innerHTML = 'Sorry! Your browser <strong>does not support</strong> the reading of bingo balls out loud!<br>Try this in <a href="https://www.google.com/chrome/browser/canary.html">Chrome Canary</a>.';
        supportMsg.classList.add('not-supported');
    }
}

function addVoiceEventListeners(){
    var voiceButtons = document.getElementsByClassName('voice');
    for (var a = 0; a < voiceButtons.length; a++) {
        voiceButtons[a].addEventListener('click', function (){
           var active = document.getElementsByClassName('active');
           if(active) {
                for (var i = 0; i < active.length; i++) {
                    active[i].classList.remove("active");
                }
            }

           selectedVoice = this.getAttribute('data-voice');
           this.classList.add('active');
        });
    }
}

function speak(text) {
    // Create a new instance of SpeechSynthesisUtterance.
    var msg = new SpeechSynthesisUtterance();
    // Set the text.
    msg.text = text;

    if (selectedVoice !== undefined) {
        msg.voice = speechSynthesis.getVoices().filter(function(voice) {
            return voice.name == selectedVoice;
        })[0];
    }

    // Queue this utterance.
    window.speechSynthesis.speak(msg, selectedVoice);
}