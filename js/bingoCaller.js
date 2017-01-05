/* Bingo Class */
var Bingo = function(bingoBoardElement) {

    /**
     * Array of the Bingo letters
     * @type {[*]}
     */
    this.letters = ["B", "I", "N", "G", "O"];
    /**
     * Array to hold all of the poential bingo numbers
     * @type {Array}
     */
    this.allBingoNumbers = [];
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
    this.delay = 8000;
    /**
     * Interval for calling bingo balls
     */
    this.interval = null;

    /**
     * Bool to hold whether speech is enabled or not
     * Defaults to false until the speech engine loads
     * @type {boolean}
     */
    this.speechEnabled = false;

    /**
     * Button Variables
     * @type {string}
     */
    var startGameButton = '',
        pauseGameButton = '',
        resumeGameButton = '',
        resetGameButton = '';

    /**
     * Public Function: Generate the bingo board
     */
    this.generateBingoBoard = function() {
        /**
         * Variable that holds the current bingo ball number
         * @type {number}
         */
        var currentBingoBall = 1;
        // Loop through the bingo letters, creating dom elements as needed
        // then appending those elements. Then add the bingo numbers
        for(var i = 0; i < this.letters.length; i++){
            var letterBlock = helper.createDomElement(
                'div', 'letter-block valign-wrapper ');
            var bingoLetter = helper.createDomElement(
                'div', 'letter valign red darken-1 white-text ', this.letters[i]);
            letterBlock.appendChild(bingoLetter);
            bingoBoardElement.appendChild(letterBlock);
            // get back the current ball we left off at for generating the next block
            currentBingoBall = add15Balls(currentBingoBall, letterBlock, this.letters[i]);
        }

        // generate the game control buttons
        generateButtons();
    };


    /**
     * Private Function: Generate the buttons that control the game / board
     */
    function generateButtons () {
        startGameButton = helper.createDomElement(
            'a', 'btn green waves-effect ', 'Start Game', '', ['id', 'startGame']);
        startGameButton.addEventListener('click', startGame);

        pauseGameButton = helper.createDomElement(
            'a', 'btn orange waves-effect disabled', 'Pause Game', '', ['id', 'pauseGame']);
        pauseGameButton.addEventListener('click', pauseGame);

        resumeGameButton = helper.createDomElement(
            'a', 'btn cyan waves-effect disabled', 'Resume Game', '', ['id', 'resumeGame']);
        resumeGameButton.addEventListener('click', resumeGame);

        resetGameButton = helper.createDomElement(
            'a', 'btn red waves-effect disabled', 'Reset Board', '', ['id', 'resetGame']);
        resetGameButton.addEventListener('click', resetGame);

        var buttons = [ startGameButton, pauseGameButton,
            resumeGameButton, resetGameButton ];

        for (var i = 0; i < buttons.length; i++) {
            document.getElementById('buttons').appendChild(buttons[i]);
        }
    }

    /**
     * Private Function: Start Game
     */
    function startGame (){
        if(bingo.speechEnabled) {
            speech.say("Let's play bingo!");
        }
        pauseGameButton.classList.remove('disabled');
        resetGameButton.classList.remove('disabled');
        this.classList.add('disabled');
        // call the first number right away
        callBingoBall();
        // set up interval for future calls
        bingo.interval = setInterval(callBingoBall, bingo.delay);
    }

    /**
     * Private Function: Pause Game
     */
    function pauseGame (){
        resumeGameButton.classList.remove('disabled');
        this.classList.add('disabled');
        clearInterval(bingo.interval);
    }

    /**
     * Private Function: Resume Game
     */
    function resumeGame (){
        pauseGameButton.classList.remove('disabled');
        this.classList.add('disabled');
        // call the first number right away
        callBingoBall();
        // set up interval for future calls
        bingo.interval = setInterval(callBingoBall, bingo.delay);
    }

    /**
     * Private Function: Reset Game
     */
    function resetGame (){
        // clear interval
        clearInterval(bingo.interval);
        // reset the called bingo numbers
        calledBingoNumbers = [];
        // remove buttons
        document.getElementById('buttons').innerHTML = '';
        // clear bingo board
        bingoBoardElement.innerHTML = '';
        // clear the last/current calls
        document.getElementById('lastCall').innerHTML = '';
        document.getElementById('currentCall').innerHTML = '';
        // regenerate bingo board
        bingo.generateBingoBoard();
    }

    /**
     * Private function to generate numbers for populating the bingo board
     * @param currentBingoBall
     * @param letterBlock
     * @returns {*}
     */
    function add15Balls(currentBingoBall, letterBlock, letter) {
        var totalBingoBalls = currentBingoBall + 15;
        for (currentBingoBall; currentBingoBall < totalBingoBalls; currentBingoBall++) {
            var newBingoBall = helper.createDomElement('div', 'ball valign ' + letter + currentBingoBall, currentBingoBall);
            letterBlock.appendChild(newBingoBall);
            bingo.allBingoNumbers.push(letter + currentBingoBall);
        }
        return currentBingoBall;
    }

    /**
     * Private function for calling bingo balls
     */
    function callBingoBall() {
        // if we have already called all possible numbers, quit.
        if(bingo.calledBingoNumbers.length === 75){
            clearInterval(bingo.interval);
        } else {
            // get variables for last call and current call elements
            var lastCall = document.getElementById('lastCall');
            var currentCall = document.getElementById('currentCall');

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
            var newBall = bingo.allBingoNumbers[Math.floor(Math.random() * bingo.allBingoNumbers.length)];

            // if speech is enabled, call the numbers aloud
            if(bingo.speechEnabled){
                speech.say(newBall);
                var split = newBall.split("");
                for (var a = 0; a < split.length; a++) {
                    speech.say(split[a].toLowerCase());
                }
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
            var newBallElement = helper.createDomElement('div', color + ' valign-wrapper', '', '', ['id', 'newBall']);
            currentCall.appendChild(newBallElement);
            var splitBallText = split[0] + "<br>" + split[1] + (split[2] ? split[2] : '');
            // generate ball text. If single digit number add a class for that (for padding purposes)
            var newBallText = helper.createDomElement('div', 'ballText valign center-align ' + (split[2] ? '' : 'single '), splitBallText);
            newBallElement.appendChild(newBallText);

            // get the index of the new ball in all bingo numbers
            var index = bingo.allBingoNumbers.indexOf(newBall);
            // remove the called number from the list of bingo numbers
            bingo.allBingoNumbers.splice(index,1);
            // add the called number to the list of called bingo numbers
            bingo.calledBingoNumbers.push(newBall);

            // get the current ball on the board and add the current class for blinking display
            var current = document.getElementsByClassName(newBall);
            for(var b = 0; b < current.length; b++){
                current[b].classList.add("current");
            }
        }
    }
};

/**
 * Speech class for all voice synthesis functionality
 * @constructor
 */
var Speech = function() {
    /**
     * Voice, populated by user input
     * @type {string}
     */
    this.voice = '';

    /**
     * Initialize speech synthesis
     */
    this.initSpeechSynthesis = function () {
        var voicesDiv = document.getElementById("voices");
        // if speech synthesis is supported by the browser populate the available voice choices. NOTE: Voice synthesis is not supported in IE or Android's native browser at this time.
        if ('speechSynthesis' in window) {
            bingo.speechEnabled = true;
            speech.say("");
            // wait for the voices to load before continuing
            window.speechSynthesis.onvoiceschanged = function() {
                var voiceList = window.speechSynthesis.getVoices();
                var availableVoices = [];

                // populate the list of voices
                voicesDiv.innerHTML = "<h4>Choose Your Bingo Caller!</h4>";
                for (var i = 0; i < voiceList.length; i++) {
                    if( voiceList[i].lang.substring(0, 2) === 'en' ) {
                        availableVoices.push(voiceList[i].name);
                    }
                }

                // set default voice to a random one on load
                speech.voice = availableVoices[Math.floor(Math.random() * availableVoices.length)];

                for (var a = 0; a < availableVoices.length; a++) {
                    var classes = 'voice cyan lighten-1 btn waves-effect ';
                    if(speech.voice === availableVoices[a]){
                        classes += ' disabled ';
                    }
                    var attributes = [];
                    attributes.push('data-voice', availableVoices[a]);
                    var button = helper.createDomElement('a', classes, availableVoices[a].replace('Google', ''), '', attributes);
                    button.addEventListener('click', function (){
                        var active = document.getElementsByClassName('voice');
                        if (active) {
                            for (var b = 0; b < active.length; b++) {
                                active[b].classList.remove("disabled");
                            }
                        }
                        speech.voice = this.getAttribute('data-voice');
                        speech.say("Let's play bingo!");
                        this.classList.add('disabled');
                    });
                    voicesDiv.append(button);
                }
            };
            // if speech synthesis is not supported, display an error
            // and a link to a supported browser
        } else {
            bingo.speechEnabled = false;
            voicesDiv.innerHTML = "Sorry, your browser does not support our voice caller. Please download <a href='https://www.google.com/chrome/browser/canary.html'>Google Chrome</a> for the best bingo experience we have to offer!";
            voicesDiv.classList.add('error');
        }
    };

    /**
     * Public function for speaking text aloud
     * @param text
     */
    this.say = function (text) {
        // Create a new instance of SpeechSynthesisUtterance.
        var msg = new SpeechSynthesisUtterance();
        // Set the text.
        msg.text = text;
        msg.voice = speech.voice;

        if (speech.voice !== '') {
            msg.voice = speechSynthesis.getVoices().filter(function(voice) {
                return voice.name == speech.voice;
            })[0];
        }

        // Queue this utterance.
        window.speechSynthesis.speak(msg, "Daniel");
    }

}

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
     * @param title
     * @param attributes
     * @returns {Element}
     */
    createDomElement: function(type, classes, content, title, attributes){

        classes = (typeof classes !== 'undefined') ?  classes : '';
        content = (typeof content !== 'undefined') ?  content : '';
        title = (typeof title !== 'undefined') ?  title : '';
        attributes = (typeof attributes !== 'undefined') ?  attributes : '';

        var element = document.createElement(type);

        if(classes !== ''){
            element.className = classes;
        }

        if(content !== ''){
            element.innerHTML = content;
        }

        if(title !== ''){
            element.appendChild(document.createTextNode(title));
        }

        for (var i = 0; i < attributes.length; i+=i+2) {
            element.setAttribute(attributes[i], attributes[i+1]);
        }

        return element;
    }
};


/**
 * Define the bingo board element
 * @type {Element}
 */
var bingoBoardElement = document.getElementById('bingoboard');

/**
 * Create new instance of the Bingo Board class
 * @type {BingoBoard}
 */
var bingo = new Bingo(bingoBoardElement);

/**
 * Create new instance of the speech class
 * @type {Speech}
 */
var speech = new Speech();

/**
 * Initialize the bingo board
 */
bingo.generateBingoBoard();
/**
 * Initialize speech synthesis
 */
speech.initSpeechSynthesis();