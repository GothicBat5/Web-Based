
const riddles = [
    {
        riddle: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
        answer: "echo",
        clue: "Think about sounds bouncing off walls in a canyon or cave."
    },
    {
        riddle: "The more you take, the more you leave behind. What am I?",
        answer: "footsteps",
        clue: "Consider what happens when you walk through snow or sand."
    },
    {
        riddle: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
        answer: "map",
        clue: "You might find me in your car, phone, or on a wall. I show places without having them."
    },
    {
        riddle: "What has a head and a tail but no body?",
        answer: "coin",
        clue: "Flip me to decide something randomly. I have two sides."
    },
    {
        riddle: "I am taken from a mine and shut up in a wooden case, from which I am never released, yet I am used by almost everyone. What am I?",
        answer: "pencil lead",
        clue: "I help you write on paper. Look inside a pencil and you'll find me."
    }
];


let gameState = {
    currentRiddleIndex: 0,
    score: 0,
    timeRemaining: 60,
    timerActive: false,
    gameOver: false,
    clueUsed: false,
    timerInterval: null
};


const riddleText = document.getElementById('riddleText');
const answerInput = document.getElementById('answerInput');
const submitBtn = document.getElementById('submitBtn');
const clueBtn = document.getElementById('clueBtn');
const timerCount = document.getElementById('timerCount');
const timerCircle = document.getElementById('timerCircle');
const feedbackMessage = document.getElementById('feedbackMessage');
const currentRiddleSpan = document.getElementById('currentRiddle');
const totalRiddlesSpan = document.getElementById('totalRiddles');
const gameCard = document.querySelector('.game-card');
const gameOverSection = document.getElementById('gameOverSection');
const gameOverTitle = document.getElementById('gameOverTitle');
const gameOverText = document.getElementById('gameOverText');
const solvedCount = document.getElementById('solvedCount');
const totalCount = document.getElementById('totalCount');
const restartBtn = document.getElementById('restartBtn');
const clueModal = document.getElementById('clueModal');
const clueText = document.getElementById('clueText');
const closeClueBtn = document.getElementById('closeClueBtn');
const modalOverlay = clueModal.querySelector('.modal-overlay');


document.addEventListener('DOMContentLoaded', () => {
    totalRiddlesSpan.textContent = riddles.length;
    totalCount.textContent = riddles.length;
    loadRiddle();
    startTimer();
    setupEventListeners();
});


function setupEventListeners() 
{
    submitBtn.addEventListener('click', handleSubmitAnswer);
    clueBtn.addEventListener('click', handleShowClue);
    restartBtn.addEventListener('click', restartGame);
    closeClueBtn.addEventListener('click', closeClueModal);
    modalOverlay.addEventListener('click', closeClueModal);
    answerInput.addEventListener('keypress', (e) => {

        if (e.key === 'Enter' && !gameState.gameOver) 
        {
            handleSubmitAnswer();
        }
    });
}


function loadRiddle() 
{
    const current = riddles[gameState.currentRiddleIndex];
    riddleText.textContent = current.riddle;
    currentRiddleSpan.textContent = gameState.currentRiddleIndex + 1;
    answerInput.value = '';
    answerInput.focus();
    feedbackMessage.classList.add('hidden');
    gameState.clueUsed = false;
    clueBtn.textContent = 'Show Clue';
    clueBtn.disabled = false;
}

function nextRiddle() 
{
    gameState.currentRiddleIndex++;
    
    if (gameState.currentRiddleIndex < riddles.length) 
    {
        resetTimer();
        loadRiddle();
    } 
    else {
        endGame();
    }
}
 

function handleSubmitAnswer() 
{
    if (gameState.gameOver || !gameState.timerActive) return;

    const userAnswer = answerInput.value.trim().toLowerCase();
    const correctAnswer = riddles[gameState.currentRiddleIndex].answer.toLowerCase();

    if (userAnswer === '') 
    {
        showFeedback('Please enter an answer', 'info');
        return;
    }

    if (userAnswer === correctAnswer) 
    {
        gameState.score++;
        solvedCount.textContent = gameState.score;
        showFeedback('Correct!', 'success');
        submitBtn.disabled = true;
        answerInput.disabled = true;
        clueBtn.disabled = true;

        setTimeout(() => {
            nextRiddle();
            submitBtn.disabled = false;
            answerInput.disabled = false;
            clueBtn.disabled = false;
        }, 2000);
    } else {
        showFeedback('Not quite right. Try again!', 'error');
    }
}


function handleShowClue() 
{
    const current = riddles[gameState.currentRiddleIndex];
    clueText.textContent = current.clue;
    clueModal.classList.remove('hidden');
    gameState.clueUsed = true;
    clueBtn.textContent = 'CLUE SHOWN';
    clueBtn.disabled = true;
}

function closeClueModal() 
{
    clueModal.classList.add('hidden');
}


function showFeedback(message, type) 
{
    feedbackMessage.textContent = message;
    feedbackMessage.className = `feedback-message ${type}`;
    feedbackMessage.classList.remove('hidden');

    if (type !== 'error') 
    {
        setTimeout(() => {
            feedbackMessage.classList.add('hidden');
        }, 3000);
    }
}


function startTimer() 
{
    gameState.timerActive = true;
    gameState.timeRemaining = 60;
    updateTimerDisplay();

    gameState.timerInterval = setInterval(() => {
        gameState.timeRemaining--;
        updateTimerDisplay();

        if (gameState.timeRemaining <= 0) {
            clearInterval(gameState.timerInterval);
            endGame();
        }
    }, 1000);
}

function resetTimer() 
{
    clearInterval(gameState.timerInterval);
    gameState.timeRemaining = 60;
    updateTimerDisplay();
    startTimer();
}

function updateTimerDisplay() 
{
    timerCount.textContent = gameState.timeRemaining;

    // Update circular progress
    const circumference = 2 * Math.PI * 45;
    const progress = (gameState.timeRemaining / 60) * circumference;
    timerCircle.style.strokeDashoffset = circumference - progress;

    // Change color based on time remaining
    if (gameState.timeRemaining <= 10) 
    {
        timerCircle.classList.add('critical');
        timerCircle.classList.remove('warning');
    } 
    else if (gameState.timeRemaining <= 20) 
    {
        timerCircle.classList.add('warning');
        timerCircle.classList.remove('critical');
    } 
    else {
        timerCircle.classList.remove('warning', 'critical');
    }
}


function endGame() 
{
    gameState.gameOver = true;
    gameState.timerActive = false;
    clearInterval(gameState.timerInterval);

    answerInput.disabled = true;
    submitBtn.disabled = true;
    clueBtn.disabled = true;

    setTimeout(() => {
        showGameOverScreen();
    }, 500);
}

function showGameOverScreen() 
{
    gameCard.style.opacity = '0';
    gameCard.style.pointerEvents = 'none';

    setTimeout(() => {
        gameOverSection.classList.remove('hidden');
        updateGameOverStats();
    }, 300);
}

function updateGameOverStats()
{
    solvedCount.textContent = gameState.score;
    totalCount.textContent = riddles.length;
    gameOverText.innerHTML = `You solved <strong>${gameState.score}</strong> out of <strong>${riddles.length}</strong> riddles`;

    if (gameState.score === riddles.length) 
    {
        gameOverTitle.textContent = 'Perfect Score!';
    } 
    else if (gameState.score >= riddles.length * 0.7) 
    {
        gameOverTitle.textContent = 'Great Job!';
    } 
    else if (gameState.score >= riddles.length * 0.4) 
    {
      
        gameOverTitle.textContent = 'Good Effort!';
    } 
    else {
        gameOverTitle.textContent = 'Time\'s Up!';
    }
}


function restartGame() 
{
    // Reset game state
    gameState = {
        currentRiddleIndex: 0,
        score: 0,
        timeRemaining: 60,
        timerActive: false,
        gameOver: false,
        clueUsed: false,
        timerInterval: null
    };

    // Reset UI
    gameOverSection.classList.add('hidden');
    gameCard.style.opacity = '1';
    gameCard.style.pointerEvents = 'auto';
    answerInput.disabled = false;
    submitBtn.disabled = false;
    clueBtn.disabled = false;
    answerInput.focus();

    // Start new game
    loadRiddle();
    startTimer();
}


answerInput.addEventListener('focus', () => {
    answerInput.setAttribute('autocomplete', 'off');

});

