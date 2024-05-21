document.addEventListener("DOMContentLoaded", function() {
    const goodMole = document.querySelector('.good-mole');
    const badMole = document.querySelector('.bad-mole');
    const scoreboard = document.querySelector('.scoreboard-text');
    const scoreBlack = document.querySelector('.score-black');
    const scoreGradient = document.querySelector('.score-gradient');
    const freezeButton = document.querySelector('.freeze-button');
    const bigWhackButton = document.querySelector('.big-whack-button');
    const bonusHoleButton = document.querySelector('.bonus-hole-button');
    const x2ScoreButton = document.querySelector('.x2-score-button');
    const resignButton = document.querySelector('.resign-button');
    const finalScoreDiv = document.querySelector('.final-score');
    let isX2Active = false;
    const elementsToHide = document.querySelectorAll('.background, .wack-a-mole-black, .wack-a-mole-gradient, .wack-a-mole-text, .score-black, .score-gradient, .scoreboard-text, .main-grid-black, .main-grid-gradient, .hole-row-1, .hole-row-2, .hole-row-3, .bonus_hole-column-1, .bonus_hole-column-2, .freeze-button, .slow-mo-button, .big-whack-button, .x2-score-button, .bonus-hole-button, .resign-button, .good-mole, .bad-mole, .black-background, black-background-1, black-background-2, black-background-3');
    const bonusHoles = [
        document.getElementById('bonus_hole1'),
        document.getElementById('bonus_hole2'),
        document.getElementById('bonus_hole3'),
        document.getElementById('bonus_hole4'),
        document.getElementById('bonus_hole5'),
        document.getElementById('bonus_hole6')
    ];
    let bonusHolesRemaining = [...bonusHoles];
    let score = 0;
    let gameInterval;
    let freezeTimeout;
    let freezeEnabled = false;
    let whackEnabled = false;
    let whackCount = 0;
    let molesFrozen = false;
    const holes = [
        { top: 280, left: 615 },   // Hole 1
        { top: 280, left: 900 },   // Hole 2
        { top: 280, left: 1190 },  // Hole 3
        { top: 460, left: 615 },   // Hole 4
        { top: 460, left: 900 },   // Hole 5
        { top: 460, left: 1190 },  // Hole 6
        { top: 680, left: 615 },   // Hole 7
        { top: 680, left: 900 },   // Hole 8
        { top: 680, left: 1190 },  // Hole 9
    ];
    const bonusHolePositions = [
        { top: 280, left: 320 },    // Bonus Hole 1
        { top: 280, left: 1460 },   // Bonus Hole 2
        { top: 460, left: 320 },    // Bonus Hole 3
        { top: 460, left: 1460 },   // Bonus Hole 4
        { top: 680, left: 320 },    // Bonus Hole 5
        { top: 680, left: 1460 }    // Bonus Hole 6
    ];
    x2ScoreButton.disabled = true;
    const restartButton = document.querySelector('.restart-button');
    const gameOverBlack = document.querySelector('.game-over-black');
    const gameOverGradient = document.querySelector('.game-over-gradient');
    const gameOverText = document.querySelector('.game-over');
    const finalScoreText = document.querySelector('.final-score');
    const continueText = document.querySelector('.continue');

    // Function to show game over elements
    function showGameOverElements() {
        gameOverBlack.style.display = 'block';
        gameOverGradient.style.display = 'block';
        gameOverText.style.display = 'block';
        finalScoreText.style.display = 'block';
        continueText.style.display = 'block';
    }

    // Function to hide game over elements
    function hideGameOverElements() {
        gameOverBlack.style.display = 'none';
        gameOverGradient.style.display = 'none';
        gameOverText.style.display = 'none';
        finalScoreText.style.display = 'none';
        continueText.style.display = 'none';
    }
    
        // Initially hide game over elements
        hideGameOverElements();
    function showBonusHole() {
        if (bonusHolesRemaining.length > 0) {
            const index = Math.floor(Math.random() * bonusHolesRemaining.length);
            const hole = bonusHolesRemaining.splice(index, 1)[0];
            hole.style.display = 'block';
            
            const bonusHoleIndex = parseInt(hole.id.replace('bonus_hole', '')) - 1;
            holes.push(bonusHolePositions[bonusHoleIndex]);
        }
    }
    // Function to prompt the user with a confirmation dialog
    function confirmResign() {
        return confirm("Are you sure you want to quit?");
    }

    // Event listener for the resign button
    resignButton.addEventListener('click', () => {
        // Prompt the user with a confirmation dialog
        if (confirmResign()) {
            // If the user confirms, end the game
            endGame();
        }
    });
    function getRandomHolePosition() {
        return holes[Math.floor(Math.random() * holes.length)];
    }

    function getRandomMoles() {
        const moleTypes = [goodMole, badMole];
        return moleTypes[Math.floor(Math.random() * moleTypes.length)].cloneNode(true);
    }

    function showMole(mole, position, scoreValue = 1) {
        mole.style.top = position.top + 100 + 'px'; // Start from 100px below
        mole.style.left = position.left + 'px';
        mole.style.display = 'block';

        // Set z-index based on position
        if (position.top === 280) {
            mole.style.zIndex = '2';
        } else if (position.top === 460) {
            mole.style.zIndex = '3';
        } else if (position.top === 680) {
            mole.style.zIndex = '4';
        }

        document.body.appendChild(mole);

        // Triggering reflow to restart the animation
        void mole.offsetWidth;
        mole.style.top = position.top + 'px'; // Slide up
        setTimeout(() => {
            if (!molesFrozen) {
                mole.style.top = position.top + 150 + 'px'; // Slide down
                setTimeout(() => {
                    mole.style.display = 'none'; // Hide after sliding down
                    document.body.removeChild(mole);
                }, 500); // Wait for sliding down animation to finish
            }
        }, 1000); // Wait for 1 second before sliding down
    }

    function startGame() {
        gameInterval = setInterval(() => {
            const moleCount = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < moleCount; i++) {
                const randomMole = getRandomMoles();
                const position = getRandomHolePosition();
                const isBonusHole = bonusHolePositions.some(
                    bonusPos => bonusPos.top === position.top && bonusPos.left === position.left
                );
                showMole(randomMole, position, isBonusHole ? 2 : 1);
                addMoleEventListeners(randomMole, isBonusHole ? 2 : 1);
            }
        }, 2000); // Change mole every 2 seconds
    }

    function endGame() {
        clearInterval(gameInterval);
        // Show game over elements
        showGameOverElements();
        elementsToHide.forEach(element => {
            element.style.display = 'none'; // Make all elements invisible
            element.removeAttribute('class'); // Remove all classes
            element.removeAttribute('id'); // Remove all IDs
        });
        scoreboard.textContent = "SCORE: 0"; // Reset scoreboard
        finalScoreDiv.textContent = "FINAL SCORE : " + score; // Display final score
        finalScoreDiv.style.display = 'block'; // Show final score element
        isX2Active = false; // Reset x2 score status
    }
    
    

    function freezeMoles() {
        clearInterval(gameInterval);
        molesFrozen = true;
        let molesToFreeze = document.querySelectorAll('.good-mole, .bad-mole');
        
        molesToFreeze.forEach(mole => {
            const position = {
                top: parseInt(mole.style.top),
                left: parseInt(mole.style.left)
            };
            mole.style.top = position.top + 'px'; // Slide up
        });

        freezeTimeout = setTimeout(() => {
            if (molesFrozen) {
                molesToFreeze.forEach(mole => {
                    mole.style.top = parseInt(mole.style.top) + 100 + 'px';
                });
                setTimeout(() => {
                    molesToFreeze.forEach(mole => {
                        mole.style.display = 'none';
                        document.body.removeChild(mole);
                    });
                    molesFrozen = false;
                    startGame();
                }, 500); // Wait for sliding down animation to finish
            }
        }, 5000); // Freeze moles for 5 seconds
    }

    function activateX2Score() {
        isX2Active = true;
        x2ScoreButton.disabled = true;
        x2ScoreButton.style.opacity = '25%';
        setTimeout(() => {
            isX2Active = false;
        }, 5000); // x2 score lasts for 5 seconds
    }
    // Event listener for the restart button
    restartButton.addEventListener('click', () => {
        // Reload the page
        location.reload();
    });
    function addMoleEventListeners(mole, scoreValue = 1) {
        mole.addEventListener('click', () => {
            if (mole.classList.contains('good-mole')) {
                if (molesFrozen) {
                    molesFrozen = false;
                    clearTimeout(freezeTimeout);
                    let molesToFreeze = document.querySelectorAll('.good-mole, .bad-mole');
                    molesToFreeze.forEach(mole => {
                        mole.style.top = parseInt(mole.style.top) + 100 + 'px';
                    });
                    setTimeout(() => {
                        molesToFreeze.forEach(mole => {
                            mole.style.display = 'none';
                            document.body.removeChild(mole);
                        });
                        startGame();
                    }, 500); // Hide after sliding down animation
                } else {
                    score += scoreValue * (isX2Active ? 2 : 1); // Double score if x2 is active
                    scoreboard.textContent = "SCORE: " + score;
                    mole.style.top = parseInt(mole.style.top) + 100 + 'px';
                    setTimeout(() => {
                        mole.style.display = 'none';
                        document.body.removeChild(mole);
                    }, 500); // Hide after sliding down animation

                    // Increase difficulty and width of score elements when score reaches a multiple of 10
                    if (score == 10 ) {
                        clearInterval(gameInterval);
                        const newWidthBlack = parseInt(getComputedStyle(scoreBlack).width) + 10 + 'px';
                        const newWidthGradient = parseInt(getComputedStyle(scoreGradient).width) + 10 + 'px';
                        scoreBlack.style.width = newWidthBlack;
                        scoreGradient.style.width = newWidthGradient;
                        startGame();
                    }

                    if (score == 100 ) {
                        clearInterval(gameInterval);
                        const newWidthBlack = parseInt(getComputedStyle(scoreBlack).width) + 15 + 'px';
                        const newWidthGradient = parseInt(getComputedStyle(scoreGradient).width) + 15 + 'px';
                        scoreBlack.style.width = newWidthBlack;
                        scoreGradient.style.width = newWidthGradient;
                        startGame();
                    }

                    if (score == 1000 ) {
                        clearInterval(gameInterval);
                        const newWidthBlack = parseInt(getComputedStyle(scoreBlack).width) + 30 + 'px';
                        const newWidthGradient = parseInt(getComputedStyle(scoreGradient).width) + 30 + 'px';
                        scoreBlack.style.width = newWidthBlack;
                        scoreGradient.style.width = newWidthGradient;
                        startGame();
                    }

                    // Enable freeze button when score reaches a multiple of 10
                    if (score % 10 === 0) {
                        freezeButton.disabled = false;
                        freezeButton.style.opacity = '100%';
                        freezeEnabled = true;
                    }

                    // Enable big whack button when score reaches a multiple of 15
                    if (score % 15 === 0) {
                        whackEnabled = true;
                        whackCount = 0;
                        bigWhackButton.disabled = false;
                        bigWhackButton.style.opacity = '100%';
                    }

                    // Enable bonus hole button when score reaches a multiple of 20 and disable it after one click
                    if (score % 20 === 0) {
                        bonusHoleButton.disabled = false;
                        bonusHoleButton.style.opacity = '100%';
                    }

                    // Enable x2 score button when score reaches a multiple of 30
                    if (score % 30 === 0) {
                        x2ScoreButton.disabled = false;
                        x2ScoreButton.style.opacity = '100%';
                    }
                }
            } else if (mole.classList.contains('bad-mole')) {
                endGame();
            }
        });
    }

    function init() {
        startGame();

        // Freeze button functionality
        freezeButton.addEventListener('click', () => {
            if (freezeEnabled) {
                freezeButton.disabled = true;
                freezeButton.style.opacity = '25%';
                freezeMoles();
            }
        });

        // Big Whack button functionality
        bigWhackButton.addEventListener('click', () => {
            if (whackEnabled && whackCount < 3) {
                const goodMoles = document.querySelectorAll('.good-mole');
                if (goodMoles.length > 1) {
                    goodMoles.forEach(mole => {
                        mole.click();
                    });
                    whackCount++;
                    if (whackCount === 3) {
                        bigWhackButton.disabled = true;
                        whackEnabled = false;
                        bigWhackButton.style.opacity = '25%';
                    }
                }
            }
        });

        // Bonus Hole button functionality
        bonusHoleButton.addEventListener('click', () => {
            if (bonusHolesRemaining.length > 0) {
                showBonusHole();
                bonusHoleButton.disabled = true;
                bonusHoleButton.style.opacity = '25%';
            }
        });

        // x2 Score button functionality
        x2ScoreButton.addEventListener('click', () => {
            if (!x2ScoreButton.disabled) {
                activateX2Score();
            }
        });
    }

    init();
});