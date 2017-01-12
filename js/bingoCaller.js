"use strict";
/**
 * Main Bingo Class
 * @param bingoBoardElement
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
     * Delay between ball calls
     * @todo make this selectable by users
     * @type {number}
     */
    var ballCallingDelay = 8000;
    /**
     * Interval for calling bingo balls
     */
    var ballCallingInterval = setInterval(null, ballCallingDelay);

    /**
     * Button Variables
     * @type {Element}
     */
    var startGameButton,
        pauseGameButton,
        resumeGameButton,
        resetGameButton;

    /**
     * Run the bingo process
     */
    this.run = function() {

        /**
         * Initialize the bingo board
         */
        generateBingoBoard();

        /**
         * Generate Buttons
         */
        generateButtons();

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

        // Loop through the bingo letters, creating dom elements as needed
        // then appending those elements. Then add the bingo numbers
        for(var i = 0; i < bingoLetters.length; i++){
            var letterBlock = helper.createDomElement('div', 'letter-block valign-wrapper ');
            var bingoLetter = helper.createDomElement('div', 'letter valign red darken-1 white-text ', bingoLetters[i]);
            letterBlock.appendChild(bingoLetter);
            bingoBoardElement.appendChild(letterBlock);
            // get back the current ball we left off at for generating the next block
            currentBingoBall = add15Balls(currentBingoBall, letterBlock, bingoLetters[i]);
        }
    }

    /**
     * Generate numbers for populating the bingo board
     * @param currentBingoBall
     * @param letterBlock
     * @param letter
     * @returns {*}
     */
    function add15Balls(currentBingoBall, letterBlock, letter) {
        var totalBingoBalls = currentBingoBall + 15;
        for (currentBingoBall; currentBingoBall < totalBingoBalls; currentBingoBall++) {
            var newBingoBall = helper.createDomElement('div', 'ball valign ' + letter + currentBingoBall);
            newBingoBall.appendChild(document.createTextNode(currentBingoBall));
            letterBlock.appendChild(newBingoBall);
            allBingoNumbers.push(letter + currentBingoBall);
        }
        return currentBingoBall;
    }


    /**
     * Generate the buttons that control the game / board
     */
    function generateButtons () {
        startGameButton = helper.createDomElement('a', 'btn green waves-effect ', 'Start Game');
        startGameButton.setAttribute('id', 'startGame');
        startGameButton.addEventListener('click', startGameListener);

        pauseGameButton = helper.createDomElement('a', 'btn orange waves-effect disabled', 'Pause Game');
        pauseGameButton.setAttribute('id', 'pauseGame');
        pauseGameButton.addEventListener('click', pauseGameListener);

        resumeGameButton = helper.createDomElement('a', 'btn cyan waves-effect disabled', 'Resume Game');
        resumeGameButton.setAttribute('id', 'resumeGame');
        resumeGameButton.addEventListener('click', resumeGameListener);

        resetGameButton = helper.createDomElement('a', 'btn red waves-effect disabled', 'Reset Board');
        resetGameButton.setAttribute('id', 'resetGame');
        resetGameButton.addEventListener('click', resetGameListener);

        var buttons = [ startGameButton, pauseGameButton, resumeGameButton, resetGameButton ];

        for (var i = 0; i < buttons.length; i++) {
            document.getElementById('buttons').appendChild(buttons[i]);
        }
    }

    /**
     *  Start Game
     */
    function startGameListener(){
        speechInstance.say("Let's play bingo!");
        pauseGameButton.classList.remove('disabled');
        resetGameButton.classList.remove('disabled');
        this.classList.add('disabled');
        // call the first number right away
        callBingoBall();
        // set up interval for future calls
        ballCallingInterval = setInterval(callBingoBall, ballCallingDelay);
    }

    /**
     * Pause Game
     */
    function pauseGameListener(){
        resumeGameButton.classList.remove('disabled');
        this.classList.add('disabled');
        clearInterval(ballCallingInterval);
    }

    /**
     * Resume Game
     */
    function resumeGameListener(){
        pauseGameButton.classList.remove('disabled');
        this.classList.add('disabled');
        // call the first number right away
        callBingoBall();
        // set up interval for future calls
        ballCallingInterval = setInterval(callBingoBall, ballCallingDelay);
    }

    /**
     * Reset Game
     */
    function resetGameListener(){
        // cancel any current speech
        window.speechSynthesis.cancel();
        // clear interval
        clearInterval(ballCallingInterval);
        // reset the called bingo numbers
        bingoInstance.calledBingoNumbers = [];
        // remove buttons
        document.getElementById('buttons').innerHTML = '';
        // clear bingo board
        bingoBoardElement.innerHTML = '';
        // reset inner HTML for ball
        document.getElementById('callNumber').innerHTML = "Current Call";
        // clear the last/current calls
        document.getElementById('lastCall').innerHTML = '';
        document.getElementById('currentCall').innerHTML = '';
        // regenerate bingo board
        generateBingoBoard();
        generateButtons();
    }

    /**
     * Private function for calling bingo balls
     */
    function callBingoBall() {
        // if we have already called all possible numbers, quit.
        if(bingoInstance.calledBingoNumbers.length === 75){
            clearInterval(ballCallingInterval);
        } else {
            // cancel any current speech
            window.speechSynthesis.cancel();
            // get variables for last call and current call elements
            var lastCall = document.getElementById('lastCall');
            var currentCall = document.getElementById('currentCall');
            var callNumber = document.getElementById('callNumber');

            // get any current elements on the board
            var currentBallOnBoard = document.getElementsByClassName("current");

            if(currentBallOnBoard){
                // if there is a ball on board that is marked as current, change it to called
                for (var i = 0; i < currentBallOnBoard.length; i++){
                    currentBallOnBoard[i].classList.add("called");
                    currentBallOnBoard[i].classList.remove("current");
                }
            }

            // get current call ball if it exists
            var existingBall = document.getElementById('newBall');

            if(existingBall){
                // if current call ball exists, move to last ball space
                existingBall.setAttribute('id', 'lastBall');
                lastCall.innerHTML = '';
                lastCall.appendChild(existingBall);
            }

            // generate a new ball out of the remaining bingo numbers
            var newBall = allBingoNumbers[Math.floor(Math.random() * allBingoNumbers.length)];

            var split = newBall.split("");

            // if speech is enabled, call the numbers aloud
            speechInstance.say(newBall);
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


            // create the new ball element that will display in the current call box
            var newBallElement = helper.createDomElement('div', color + ' valign-wrapper');
            newBallElement.setAttribute('id', 'newBall');
            currentCall.appendChild(newBallElement);
            var splitBallText = split[0] + "<br>" + split[1] + (split[2] ? split[2] : '');
            // generate ball text. If single digit number add a class for that (for padding purposes)
            var newBallText = helper.createDomElement('div', 'ballText valign center-align ' + (split[2] ? '' : 'single '), splitBallText);
            newBallElement.appendChild(newBallText);

            // get the index of the new ball in all bingo numbers
            var index = allBingoNumbers.indexOf(newBall);
            // remove the called number from the list of bingo numbers
            allBingoNumbers.splice(index,1);
            // add the called number to the list of called bingo numbers
            bingoInstance.calledBingoNumbers.push(newBall);

            // get the current ball on the board and add the current class for blinking display
            var current = document.getElementsByClassName(newBall);
            for(var b = 0; b < current.length; b++){
                current[b].classList.add("current");
            }

            // keep track of number of balls called.
            var ballCount = bingoInstance.calledBingoNumbers.length;
            callNumber.innerHTML = "Current Call / <span>Ball # " + ballCount.toString() + "</span>";
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
            // wait for the voices to load before continuing
            window.speechSynthesis.onvoiceschanged = function() {
                var voiceList = window.speechSynthesis.getVoices();
                var englishVoices = [];

                // populate the list of voices
                voicesDiv.innerHTML = "<h4>Choose Your Bingo Caller!</h4>";

                // populate the array of english voices
                for (var i = 0; i < voiceList.length; i++) {
                    if (voiceList[i].lang.substring(0, 2) === 'en' && voiceList[i].name.substring(0, 6) !== 'Google') {
                        englishVoices.push(voiceList[i]);
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
                };
        // if speech synthesis is not supported, display an error
        // and a link to a supported browser
        } else {
            speechEnabled = false;
            voicesDiv.innerHTML = "Sorry, your browser does not support our voice caller. Please download <a href='https://www.google.com/chrome/browser/canary.html'>Google Chrome</a> for the best bingo experience we have to offer!";
            voicesDiv.classList.add('error');
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