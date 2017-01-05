/**
 * Original code before I re-factored it to be object oriented
 */

var bingoBoard = document.getElementById("bingoboard"),
    buttons = document.getElementById("buttons"),
    bingoLetters = ["B", "I", "N", "G", "O"],
    allBingoNumbers = [],
    calledBingoNumbers = [],
    callBallInterval;

// generate the bingo board to show on screen
function generateBoard(bingoBoard) {
    initSpeak();
    // loop through the bingo letters
    var currentBall = 1;
    for (var i = 0; i < bingoLetters.length; i++) {
        // Add a div that shows the current letter
        var letterBlock = createDiv('letter-block valign-wrapper ', "");
        var bingoLetter = createDiv('letter valign red darken-1 white-text ', bingoLetters[i]);
        letterBlock.appendChild(bingoLetter);
        bingoBoard.appendChild(letterBlock);
        currentBall = add15Balls(currentBall, letterBlock, bingoLetters[i]);
    }
    generateButtons();
}

function generateButtons(){
    var startGameButton = document.createElement('a');
    startGameButton.className = 'btn green waves-effect ';
    startGameButton.setAttribute('id', 'startGame');
    startGameButton.addEventListener('click', startGame);
    startGameButton.appendChild(document.createTextNode("Start Game"));

    var resetBoardButton = document.createElement('a');
    resetBoardButton.className = 'btn red waves-effect disabled ';
    resetBoardButton.setAttribute('id', 'resetBoard');
    resetBoardButton.addEventListener('click', resetBoard);
    resetBoardButton.appendChild(document.createTextNode("Reset Board"));

    var pauseGameButton = document.createElement('a');
    pauseGameButton.className = 'btn orange waves-effect disabled ';
    pauseGameButton.setAttribute('id', 'pauseGame');
    pauseGameButton.addEventListener('click', pauseGame);
    pauseGameButton.appendChild(document.createTextNode("Pause"));

    var resumeGameButton = document.createElement('a');
    resumeGameButton.className = 'btn purple waves-effect disabled ';
    resumeGameButton.setAttribute('id', 'resumeGame');
    resumeGameButton.addEventListener('click', resumeGame);
    resumeGameButton.appendChild(document.createTextNode("Resume"));

    buttons.appendChild(startGameButton);
    buttons.appendChild(resetBoardButton);
    buttons.appendChild(pauseGameButton);
    buttons.appendChild(resumeGameButton);
}

// add the bingo balls to the board
function add15Balls(ballNumber, letterBlock, letter){
    var totalBalls = ballNumber + 15;
    for(ballNumber; ballNumber < totalBalls; ballNumber++){
        var newBall = createDiv('ball valign ' + letter + ballNumber, (ballNumber));
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

    if( responsiveVoice.voiceSupport()) {
        responsiveVoice.speak("Let's play bingo!");
    }
    document.getElementById('startGame').classList.add('disabled');
    document.getElementById('pauseGame').classList.remove('disabled');
    document.getElementById('resetBoard').classList.remove('disabled');
    calledBingoNumbers = [];
    callBallInterval = setInterval(callNumber, 10000, calledBingoNumbers);
}

// pause the current game
function pauseGame(){
    document.getElementById('pauseGame').classList.add('disabled');
    document.getElementById('resumeGame').classList.remove('disabled');
    clearInterval(callBallInterval);
}

// resume the current game
function resumeGame(){
    document.getElementById('resumeGame').classList.add('disabled');
    document.getElementById('pauseGame').classList.remove('disabled');
    callNumber(calledBingoNumbers);
    callBallInterval = setInterval(callNumber, 10000, calledBingoNumbers);
}

// reset the board
function resetBoard(){
    document.getElementById('startGame').classList.remove('disabled');
    document.getElementById('resetBoard').classList.add('disabled');
    document.getElementById('pauseGame').classList.add('disabled');
    document.getElementById('resumeGame').classList.add('disabled');
    document.getElementById('lastBall').innerHTML = '';
    document.getElementById('newBall').innerHTML = '';
    document.getElementById('buttons').innerHTML = '';
    bingoBoard.innerHTML = '';
    generateBoard(bingoBoard);
}

// call a bingo number
function callNumber(calledBingoNumbers) {
    if(calledBingoNumbers.length == 75){
        clearInterval(callBallInterval);
    } else {
        clearCurrentBall();
    }
    var existingBall = document.getElementById('newBall');
    if(existingBall){
        existingBall.setAttribute('id', 'lastBall');
        var lastCall = document.getElementById('lastCall');
        lastCall.innerHTML = '';
        lastCall.appendChild(existingBall);
    }

    var newBall = allBingoNumbers[Math.floor(Math.random() * allBingoNumbers.length)];
    // call the number aloud
    if( responsiveVoice.voiceSupport()) {
        responsiveVoice.speak(newBall);
        var split = newBall.split("");
        for (var i = 0; i < split.length; i++) {
            responsiveVoice.speak(split[i].toLowerCase());
        }
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
        newBallElement.setAttribute('id','newBall');
        newBallElement.className = color + " valign-wrapper ";
    var newBallText = document.createElement('div');
        newBallText.className = 'ballText valign center-align ';
    var splitBall = newBall.split('');
        newBallText.innerHTML = splitBall[0] + "<br>" + splitBall[1];
    if(splitBall[2] !== undefined){
        newBallText.innerHTML += splitBall[2];
    } else {
        newBallText.className += 'single ';
    }
    document.getElementById('currentCall').appendChild(newBallElement);
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
    var supportMsg = document.getElementById('msg');
    if( responsiveVoice.voiceSupport()) {
        var voiceList = responsiveVoice.getVoices(),
            availableVoices = [];
        for (var i = 0; i < voiceList.length; i++) {
            availableVoices.push(voiceList[i].name);
        }
        // start speak
        responsiveVoice.speak("");
        // set initial voice to a random one
        responsiveVoice.setDefaultVoice(availableVoices[Math.floor(Math.random() * availableVoices.length)]);
        addVoiceButtonsAndListeners(availableVoices);
    } else {
        supportMsg.innerHTML = 'Sorry! Your browser <strong>does not support</strong> the reading of bingo balls aloud!<br>Try this in <a href="https://www.google.com/chrome/browser/canary.html">Chrome</a>.';
        supportMsg.classList.add('not-supported');
    }
    return voiceList;
}

// generates the available voice buttons and adds event listeners to them
function addVoiceButtonsAndListeners() {
    var voicesDiv = document.getElementById("voices");
    for (var i = 0; i < availableVoices.length; i++) {
        var button = document.createElement('a');
        if(selectedVoice === availableVoices[i]) {
            button.className = 'voice cyan lighten-1 btn waves-effect disabled ';
        } else {
            button.className = 'voice cyan lighten-1 btn waves-effect ';
        }
        button.setAttribute('data-voice', availableVoices[i]);
        button.appendChild(document.createTextNode(availableVoices[i]));
        button.addEventListener('click', function (){
            var active = document.getElementsByClassName('voice');
            if (active) {
                for (var i = 0; i < active.length; i++) {
                    active[i].classList.remove("disabled");
                }
            }
            selectedVoice = this.getAttribute('data-voice');
            responsiveVoice.setDefaultVoice(selectedVoice);
            this.classList.add('disabled');
        });
        voicesDiv.appendChild(button);
    }
}