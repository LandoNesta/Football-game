// Game State
const gameState = {
    homeScore: 0,
    awayScore: 0,
    quarter: 1,
    possession: 'home',
    down: 1,
    distance: 10,
    yardLine: 20,
    selectedPlay: null
};

// DOM Elements
const homeScoreEl = document.getElementById('home-score');
const awayScoreEl = document.getElementById('away-score');
const quarterEl = document.getElementById('quarter');
const downDistanceEl = document.getElementById('down-distance');
const logContent = document.getElementById('log-content');
const executePlayBtn = document.getElementById('execute-play');
const newGameBtn = document.getElementById('new-game');
const playButtons = document.querySelectorAll('.play-btn');
const canvas = document.getElementById('field');
const ctx = canvas.getContext('2d');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    setupEventListeners();
    drawField();
});

function initGame() {
    gameState.homeScore = 0;
    gameState.awayScore = 0;
    gameState.quarter = 1;
    gameState.possession = 'home';
    gameState.down = 1;
    gameState.distance = 10;
    gameState.yardLine = 20;
    gameState.selectedPlay = null;
    
    updateDisplay();
    logContent.innerHTML = '<p>Welcome to Gridiron Strategy! Select a play to begin.</p>';
    drawField();
}

function setupEventListeners() {
    playButtons.forEach(btn => {
        btn.addEventListener('click', () => selectPlay(btn));
    });
    
    executePlayBtn.addEventListener('click', executePlay);
    newGameBtn.addEventListener('click', initGame);
}

function selectPlay(btn) {
    playButtons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    gameState.selectedPlay = btn.dataset.play;
    executePlayBtn.disabled = false;
}

function executePlay() {
    if (!gameState.selectedPlay) return;
    
    const result = calculatePlayResult(gameState.selectedPlay);
    const yards = result.yards;
    const success = result.success;
    
    // Update field position
    gameState.yardLine += yards;
    
    // Check for touchdown
    if (gameState.yardLine >= 100) {
        scoreTouchdown();
        return;
    }
    
    // Check for first down
    if (yards >= gameState.distance) {
        gameState.down = 1;
        gameState.distance = 10;
        addLog(`First down! Gained ${yards} yards. Ball at ${gameState.yardLine} yard line.`);
    } else {
        gameState.down++;
        gameState.distance -= yards;
        
        if (yards > 0) {
            addLog(`Gained ${yards} yards. ${getDownText()}`);
        } else if (yards < 0) {
            addLog(`Loss of ${Math.abs(yards)} yards. ${getDownText()}`);
        } else {
            addLog(`No gain. ${getDownText()}`);
        }
    }
    
    // Check for turnover on downs
    if (gameState.down > 4) {
        turnover();
        return;
    }
    
    updateDisplay();
    drawField();
    
    // Reset play selection
    playButtons.forEach(b => b.classList.remove('selected'));
    gameState.selectedPlay = null;
    executePlayBtn.disabled = true;
}

function calculatePlayResult(play) {
    // Simple random outcome based on play type
    const random = Math.random();
    let yards = 0;
    let success = true;
    
    switch(play) {
        case 'run-left':
        case 'run-middle':
        case 'run-right':
            // Running plays: -2 to 8 yards typically
            yards = Math.floor(Math.random() * 11) - 2;
            break;
            
        case 'pass-short':
            // Short pass: 0 to 12 yards, 70% completion
            if (random > 0.3) {
                yards = Math.floor(Math.random() * 13);
            } else {
                yards = 0;
                success = false;
            }
            break;
            
        case 'pass-medium':
            // Medium pass: 5 to 20 yards, 50% completion
            if (random > 0.5) {
                yards = Math.floor(Math.random() * 16) + 5;
            } else {
                yards = 0;
                success = false;
            }
            break;
            
        case 'pass-deep':
            // Deep pass: 15 to 40 yards, 30% completion
            if (random > 0.7) {
                yards = Math.floor(Math.random() * 26) + 15;
            } else {
                yards = 0;
                success = false;
            }
            break;
    }
    
    return { yards, success };
}

function scoreTouchdown() {
    if (gameState.possession === 'home') {
        gameState.homeScore += 7; // TD + extra point
        addLog('🎉 TOUCHDOWN! Home team scores! (+7)');
    } else {
        gameState.awayScore += 7;
        addLog('🎉 TOUCHDOWN! Away team scores! (+7)');
    }
    
    // Switch possession and reset field position
    gameState.possession = gameState.possession === 'home' ? 'away' : 'home';
    gameState.yardLine = 20;
    gameState.down = 1;
    gameState.distance = 10;
    
    updateDisplay();
    drawField();
}

function turnover() {
    addLog(`Turnover on downs! ${gameState.possession === 'home' ? 'Away' : 'Home'} team takes over.`);
    gameState.possession = gameState.possession === 'home' ? 'away' : 'home';
    gameState.yardLine = 100 - gameState.yardLine; // Flip field position
    gameState.down = 1;
    gameState.distance = 10;
    
    updateDisplay();
    drawField();
}

function getDownText() {
    const suffixes = ['st', 'nd', 'rd', 'th'];
    const suffix = gameState.down <= 3 ? suffixes[gameState.down - 1] : suffixes[3];
    return `${gameState.down}${suffix} & ${gameState.distance}`;
}

function updateDisplay() {
    homeScoreEl.textContent = gameState.homeScore;
    awayScoreEl.textContent = gameState.awayScore;
    quarterEl.textContent = `Q${gameState.quarter}`;
    downDistanceEl.textContent = getDownText();
}

function addLog(message) {
    const p = document.createElement('p');
    p.textContent = message;
    logContent.insertBefore(p, logContent.firstChild);
    
    // Keep only last 10 messages
    while (logContent.children.length > 10) {
        logContent.removeChild(logContent.lastChild);
    }
}

function drawField() {
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#2d5016';
    ctx.fillRect(0, 0, width, height);
    
    // Draw yard lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    for (let i = 0; i <= 10; i++) {
        const x = (width / 10) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
        
        // Yard markers
        if (i > 0 && i < 10) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            const yardNum = i * 10;
            ctx.fillText(yardNum.toString(), x, height / 2);
        }
    }
    
    // Draw line of scrimmage
    const losX = (gameState.yardLine / 100) * width;
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(losX, 0);
    ctx.lineTo(losX, height);
    ctx.stroke();
    
    // Draw ball
    ctx.fillStyle = '#8b4513';
    ctx.beginPath();
    ctx.ellipse(losX, height / 2, 15, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw possession indicator
    ctx.fillStyle = gameState.possession === 'home' ? '#4ade80' : '#f87171';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(gameState.possession.toUpperCase(), losX, 30);
}

// Initial execution disabled
executePlayBtn.disabled = true;
