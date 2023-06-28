"use strict";
/**
 * Main Bingo Class
 * @param bingoBoardElement
 * @param speechInstance
 * @constructor
 */
var Bingo = function(bingoBoardElement, speechInstance) {
    /**
     * Array of the Bingo letters
     * @type {[*]}
     */
    var bingoLetters = ["B", "I", "N", "G", "O"];

    /**
     * Array to hold all of the potential bingo numbers
     * @type {Array}
     */
    var allBingoNumbers = [];

    /**
     * Array to hold called bingo numbers
     * @type {Array}
     */
    this.calledBingoNumbers = [];

    /**
     * Interval for calling balls
     * @type {number}
     */
    var ballCallingInterval = window.setInterval(null, parseInt(document.getElementById('range').value) * 1000);

    /**
     * States whether a game has started or not
     * @type {boolean}
     */
    var hasGameStarted = false;

    /**
     * Run the bingo process
     */
    this.run = function() {
        /**
         * Initialize the bingo board
         */
        generateBingoBoard();
        /**
         * Add event listeners to buttons
         */
        addEventListeners();
        /**
         * Initialize speech synthesis
         */
        speechInstance.initSpeechSynthesis();
    };

    /**
     * Generate the bingo board
     */
    function generateBingoBoard() {
        /**
         * Variable that holds the current bingo ball number
         * @type {number}
         */
        var currentBingoBall = 1;
        // Loop through the bingo letters, creating dom elements as needed - then append elements and bingo numbers
        for(var i = 0; i < bingoLetters.length; i++){
            var letterBlock = helper.createDomElement('div', 'letter-block valign-wrapper ');
            var bingoLetter = helper.createDomElement('div', 'letter valign red darken-1 white-text ', bingoLetters[i]);
            letterBlock.appendChild(bingoLetter);
            bingoBoardElement.appendChild(letterBlock);
            // get back the current ball we left off at for generating the next block
            currentBingoBall = add15Balls(allBingoNumbers, currentBingoBall, letterBlock, bingoLetters[i]);
        }
    }
    /**
     * Generate numbers for populating the bingo board
     * @param allBingoNumbers
     * @param currentBingoBall
     * @param letterBlock
     * @param letter
     * @returns {*}
     */
    function add15Balls(allBingoNumbers, currentBingoBall, letterBlock, letter) {
        var totalBingoBalls = currentBingoBall + 15;
        for (currentBingoBall; currentBingoBall < totalBingoBalls; currentBingoBall++) {
            var newBingoBall = helper.createDomElement('div', 'ball valign ' + letter + currentBingoBall);
            newBingoBall.appendChild(document.createTextNode(currentBingoBall));
            newBingoBall.setAttribute('id', letter + currentBingoBall);
            letterBlock.appendChild(newBingoBall);
            allBingoNumbers.push(letter + currentBingoBall);
        }
        return currentBingoBall;
    }

    /**
     * Add event listeners to buttons
     */
    function addEventListeners () {
        document.getElementById('startGame').addEventListener('click', startGameListener);
        document.getElementById('resetGame').addEventListener('click', resetGameListener);
        document.getElementById('pauseGame').addEventListener('click', pauseGameListener);
        document.getElementById('resumeGame').addEventListener('click', resumeGameListener);
        document.getElementById('range').addEventListener('change', changeDelayListener);
        document.getElementById("nextBall").addEventListener('click', callBingoBall);
    }
    /**
     *  Start Game Listener
     */
    function startGameListener(){
        hasGameStarted = true;
        speechInstance.say("Let's play bingo!");
        this.classList.add('disabled');
        document.getElementById('pauseGame').classList.remove('disabled');
        document.getElementById('resetGame').classList.remove('disabled');

        callBingoBall();
        ballCallingInterval = window.setInterval(callBingoBall, (parseInt(document.getElementById('range').value) * 1000));
    }

    /**
     * Pause Game Listener
     */
    function pauseGameListener(){
        clearInterval(ballCallingInterval);
        document.getElementById('resumeGame').classList.remove('disabled');
        document.getElementById('nextBall').classList.remove('disabled');
        this.classList.add('disabled');
    }

    /**
     * Resume Game Listener
     */
    function resumeGameListener(){
        document.getElementById('pauseGame').classList.remove('disabled');
        document.getElementById('nextBall').classList.add('disabled');
        this.classList.add('disabled');
        // if currently set to manual, change to the next value then continue calling
        if(parseInt(document.getElementById('range').value) === 16) {
            document.getElementById('range').value = 15;
        }
        callBingoBall();
        clearInterval(ballCallingInterval);
        ballCallingInterval = window.setInterval(callBingoBall, parseInt(document.getElementById('range').value) * 1000);
    }

    /**
     * Reset Game Listener
     */
    function resetGameListener(){
        // cancel any current speech
        window.speechSynthesis.cancel();
        // clear interval
        clearInterval(ballCallingInterval);
        // reset the called bingo numbers
        bingoInstance.calledBingoNumbers = [];
        // reset the array of all bingo numbers
        allBingoNumbers = [];
        // clear bingo board
        bingoBoardElement.innerHTML = '';
        // reset inner HTML for ball
        document.getElementById('callNumber').innerHTML = "";
        // clear the current ball
        document.getElementById('ballText').innerHTML = '';
        document.getElementById('ballGraphic').className = '';
        document.getElementById('startGame').classList.remove('disabled');
        document.getElementById('pauseGame').classList.add('disabled');
        document.getElementById('resumeGame').classList.add('disabled');
        document.getElementById('nextBall').classList.add('disabled');
        this.classList.add('disabled');
        // regenerate bingo board
        generateBingoBoard();
    }

    /**
     * Event listener for delay slider
     */
    function changeDelayListener() {
        if(hasGameStarted) {
            var delayValue = parseInt(document.getElementById('range').value);
            if (delayValue === 16) {
                document.getElementById('nextBall').classList.remove('disabled');
                document.getElementById('resumeGame').classList.remove('disabled');
                document.getElementById('pauseGame').classList.add('disabled');
                clearInterval(ballCallingInterval);
            } else {
                document.getElementById('nextBall').classList.add('disabled');
                clearInterval(ballCallingInterval);
                ballCallingInterval = window.setInterval(callBingoBall, parseInt(document.getElementById('range').value) * 1000);
            }
        } else {
            console.log("game hasn't started");
        }
    }

    /**
     * Function for calling bingo balls
     */
    function callBingoBall() {
        // if we have already called all possible numbers, quit.
        if(bingoInstance.calledBingoNumbers.length === 75){
            window.clearInterval(ballCallingInterval);
        } else {
            if ('speechSynthesis' in window) {
                // cancel any current speech
                window.speechSynthesis.cancel();
            }

            // set elements for displaying the current ball as variables
            var lastBallCalled = document.getElementById('ballText').innerHTML.replace('<br>',''),
                ballGraphicElement = document.getElementById('ballGraphic'),
                ballTextElement = document.getElementById('ballText'),
                // generate a new ball number
                newBallNumber = allBingoNumbers[Math.floor(Math.random() * allBingoNumbers.length)],
                // split the numbers for reading aloud
                split = newBallNumber.split(""),
                // generate ball text for appending to ball text element
                ballText = split[0] + "<br>" + split[1] + (split[2] ? split[2] : '');

            // if speech is enabled, call the numbers aloud
            speechInstance.say(newBallNumber);
            for (var a = 0; a < split.length; a++) {
                speechInstance.say(split[a].toLowerCase());
            }

            // using the letter from the bingo call, determine the color of the ball
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

            // set classes for the ball graphic elements
            ballGraphicElement.className = "valign-wrapper " + color;
            ballTextElement.className = "valign center-align " + (split[2] ? newBallNumber : 'single ' + newBallNumber);
            // Change ball text for the ball text element
            ballTextElement.innerHTML = ballText;

            // if there's a number called on the board, grab that element so we can change classes
            var lastCallOnBoard = document.getElementsByClassName('lastCall');
            if(lastCallOnBoard.length > 0){
                lastCallOnBoard[0].classList.add('called');
                lastCallOnBoard[0].classList.remove('lastCall');
            }
            // if not the first ball called, add last call to the most recent called ball
            if(lastBallCalled){
                document.getElementById(lastBallCalled).classList.add('lastCall');
            }

            // get the index of the new ball in all bingo numbers
            var index = allBingoNumbers.indexOf(newBallNumber);
            // remove the called number from the list of bingo numbers
            allBingoNumbers.splice(index,1);
            // add the called number to the list of called bingo numbers
            bingoInstance.calledBingoNumbers.push(newBallNumber);

            // keep track of number of balls called.
            document.getElementById('callNumber').innerHTML = "Ball #" + bingoInstance.calledBingoNumbers.length.toString() + "</span>";
        }
    }
};

/**
 * Speech class for all voice synthesis functionality
 * @constructor
 */
var Speech = function() {
    /**
     * Voice object, populated by user input
     * @type {object}
     */
    this.voice = null;
    /**
     * Bool to hold whether speech is enabled or not
     * Defaults to false until the speech engine loads
     * @type {boolean}
     */
    var speechEnabled = false;

    /**
     * Initialize speech synthesis
     */
    this.initSpeechSynthesis = function () {
        var voicesDiv = document.getElementById("voices");
        // if speech synthesis is supported by the browser populate the available voice choices.
        // NOTE: Voice synthesis is not supported in IE or Android's native browser at this time.
        if ('speechSynthesis' in window) {
            speechEnabled = true;
            this.say("");

            var voices = window.speechSynthesis.getVoices();
            if(window.navigator.userAgent.toLowerCase().indexOf("chrome") == -1) {
                loadVoices();
            } else {
                // wait for voices to load
                window.speechSynthesis.onvoiceschanged = function() {
                    loadVoices();
                }
            }
        // if speech synthesis is not supported, display an error
        // and a link to a supported browser
        } else {
            speechEnabled = false;
            voicesDiv.innerHTML = "Sorry, your browser does not support our voice caller. Please download <a href='https://www.google.com/chrome/browser/canary.html'>Google Chrome</a> for the best bingo experience we have to offer!";
            voicesDiv.classList.add('error');
        }

        function loadVoices() {
            var voiceList = window.speechSynthesis.getVoices();
            var englishVoices = [];
            voicesDiv.innerHTML = "<strong>Callers: </strong>";

            // populate the array of english voices
            for (var i = 0; i < voiceList.length; i++) {
                if (voiceList[i].lang.substring(0, 2) === 'en' && voiceList[i].name.substring(0, 6) !== 'Google') {
                    if(voiceList[i].voiceURI.substr(voiceList[i].voiceURI.length-7) !== 'premium') {
                        englishVoices.push(voiceList[i]);
                    }
                }
            }

            // set default voice object to a random one on load
            speechInstance.voice = englishVoices[Math.floor(Math.random() * englishVoices.length)];

            for (var a = 0; a < englishVoices.length; a++) {
                var classes = 'voice cyan lighten-1 btn waves-effect ';
                if(speechInstance.voice === englishVoices[a]){
                    classes += ' disabled ';
                }
                var button = helper.createDomElement('a', classes, englishVoices[a].name);
                button.setAttribute('data-voice', englishVoices[a].name);
                button.addEventListener('click', function(){
                    setVoice(this, englishVoices);
                });
                voicesDiv.appendChild(button);
            }
        }
    };

    /**
     * Sets the voice object and handles button styling,
     * enabling and disabling - will also allow the voice
     * buttons to say hi if a game isn't currently going
     * @param button
     * @param englishVoices
     */
    function setVoice(button, englishVoices) {
        var active = document.getElementsByClassName('voice');
        if (active) {
            for (var i = 0; i < active.length; i++) {
                active[i].classList.remove("disabled");
            }
        }
        // go through all of the voices and set the matching one to the speech instance voice name
        for (var a = 0; a < englishVoices.length; a++){
            if(englishVoices[a].name === button.getAttribute('data-voice')){
                speechInstance.voice = englishVoices[a];
                button.classList.add('disabled');
            }
        }
        // if the bingo game hasn't started yet, play a test vocal for hearing the voice options
        if(bingoInstance.calledBingoNumbers.length == 0){
            // cancel any current speech
            window.speechSynthesis.cancel();
            speechInstance.say("Hi, I'm " + speechInstance.voice.name + "!");
        }
    }

    /**
     * Public function for speaking text aloud
     * @param text
     */
    this.say = function (text) {
        if(speechEnabled) {
            // Create a new instance of SpeechSynthesisUtterance.
            var msg = new SpeechSynthesisUtterance();
            // Set the text.
            msg.text = text;
            // set the voice
            msg.voice = speechInstance.voice;
            // queue the speech
            window.speechSynthesis.speak(msg, msg.voice);
        }
    };
};

/**
 * Helper object for any static helper methods
 * @constructor
 */
var helper = {
    /**
     * Private function that will generate a new dom element
     * @param type
     * @param classes
     * @param content
     * @returns {Element}
     */
    createDomElement: function(type, classes, content){
        var element = document.createElement(type);
        element.className = typeof classes !== 'undefined' || classes == '' ? classes : '';
        element.innerHTML = typeof content !== 'undefined' || content == '' ? content : '';
        return element;
    }
};

/**
 * Define the bingo board element
 * @type {Element}
 */
var bingoBoardElement = document.getElementById('bingoboard');

/**
 * Create new instance of the speech class
 * @type {Speech}
 */
var speechInstance = new Speech();

/**
 * Create new instance of the Bingo Board class
 * @type {Bingo}
 */
var bingoInstance = new Bingo(bingoBoardElement, speechInstance);

bingoInstance.run();
