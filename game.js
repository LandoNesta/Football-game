// Hex Grid Constants
const HEX_SIZE = 15; // Size of each hexagon
const FIELD_LENGTH = 120; // 120 yards (100 + 10 yard endzones on each side)
const FIELD_WIDTH = 53; // Standard football field width in yards
const ISO_ANGLE = Math.PI / 6; // 30 degrees for isometric view

// Game State
const gameState = {
    homeScore: 0,
    awayScore: 0,
    quarter: 1,
    possession: 'home',
    down: 1,
    distance: 10,
    ballPosition: { q: 0, r: 20 }, // Hex coordinates (q=horizontal, r=vertical/yards)
    selectedPlay: null,
    playerPositions: [], // Will store hex positions of players
    camera: { x: 0, y: 0 } // Camera offset for scrolling
};

// Hex Grid Utilities
const HexUtils = {
    // Convert hex axial coordinates to pixel coordinates (isometric)
    hexToPixel(q, r, offsetX = 0, offsetY = 0) {
        const x = HEX_SIZE * (Math.sqrt(3) * q + Math.sqrt(3)/2 * r);
        const y = HEX_SIZE * (3/2 * r);

        // Apply isometric transformation
        const isoX = (x - y) * Math.cos(ISO_ANGLE);
        const isoY = (x + y) * Math.sin(ISO_ANGLE);

        return {
            x: isoX + offsetX,
            y: isoY + offsetY
        };
    },

    // Draw a hexagon at the given hex coordinates
    drawHex(ctx, q, r, offsetX, offsetY, fillStyle = null, strokeStyle = '#ffffff', lineWidth = 1) {
        const center = this.hexToPixel(q, r, offsetX, offsetY);
        const angles = [];

        for (let i = 0; i < 6; i++) {
            angles.push(Math.PI / 3 * i);
        }

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = angles[i];
            const x = center.x + HEX_SIZE * Math.cos(angle);
            const y = center.y + HEX_SIZE * Math.sin(angle) * 0.5; // Flatten for isometric

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();

        if (fillStyle) {
            ctx.fillStyle = fillStyle;
            ctx.fill();
        }

        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    },

    // Get yard line from r coordinate
    getYardLine(r) {
        // Field goes from r=0 (own endzone) to r=120 (opponent endzone)
        // Yard lines go from 0 to 100
        if (r < 10) return r; // Own endzone
        if (r > 110) return 110 - r; // Opponent endzone
        return r - 10; // Field position
    }
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
    gameState.ballPosition = { q: 0, r: 30 }; // Start at 20 yard line (10 yard endzone + 20)
    gameState.selectedPlay = null;
    gameState.playerPositions = [];

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

    // Keyboard controls for camera scrolling
    document.addEventListener('keydown', (e) => {
        const scrollSpeed = 20; // Pixels per keypress

        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                gameState.camera.y += scrollSpeed;
                drawField();
                break;
            case 'ArrowDown':
                e.preventDefault();
                gameState.camera.y -= scrollSpeed;
                drawField();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                gameState.camera.x += scrollSpeed;
                drawField();
                break;
            case 'ArrowRight':
                e.preventDefault();
                gameState.camera.x -= scrollSpeed;
                drawField();
                break;
        }
    });
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

    // Move ball in hex coordinates (r represents yards down the field)
    gameState.ballPosition.r += yards;

    // Random lateral movement for variety
    const lateralMove = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
    gameState.ballPosition.q += lateralMove;

    // Keep ball within field bounds (q should stay within reasonable range)
    gameState.ballPosition.q = Math.max(-8, Math.min(8, gameState.ballPosition.q));

    // Check for touchdown
    if (gameState.ballPosition.r >= 110) {
        scoreTouchdown();
        return;
    }

    // Check for safety (ball in own endzone)
    if (gameState.ballPosition.r < 10) {
        addLog('Safety! Ball went into own endzone.');
        gameState.ballPosition.r = 30; // Reset to 20 yard line
        gameState.down = 1;
        gameState.distance = 10;
    }

    // Check for first down
    if (yards >= gameState.distance) {
        gameState.down = 1;
        gameState.distance = 10;
        const yardLine = HexUtils.getYardLine(gameState.ballPosition.r);
        addLog(`First down! Gained ${yards} yards. Ball at ${yardLine} yard line.`);
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
    gameState.ballPosition = { q: 0, r: 30 }; // Reset to 20 yard line
    gameState.down = 1;
    gameState.distance = 10;

    updateDisplay();
    drawField();
}

function turnover() {
    addLog(`Turnover on downs! ${gameState.possession === 'home' ? 'Away' : 'Home'} team takes over.`);
    gameState.possession = gameState.possession === 'home' ? 'away' : 'home';
    // Flip field position (120 total yards - current position)
    gameState.ballPosition.r = 120 - gameState.ballPosition.r;
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
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Center the field on canvas with camera offset
    const offsetX = width / 2 + gameState.camera.x;
    const offsetY = height / 2 + gameState.camera.y;

    // Draw hexagonal grid
    const gridWidth = 20; // Number of hexes wide (covers ~53 yards)
    const gridLength = FIELD_LENGTH; // Number of hexes long (120 yards)

    // Calculate starting position to center the grid
    const startQ = -gridWidth / 2;

    // Draw the hex grid
    for (let r = 0; r < gridLength; r++) {
        for (let q = startQ; q < startQ + gridWidth; q++) {
            // Determine hex color based on field position
            let hexColor;

            // Endzones
            if (r < 10) {
                hexColor = 'rgba(239, 68, 68, 0.3)'; // Home endzone (red)
            } else if (r >= 110) {
                hexColor = 'rgba(59, 130, 246, 0.3)'; // Away endzone (blue)
            } else {
                // Main field - alternating green shades for grass effect
                const shade = (q + r) % 2 === 0 ? 0.15 : 0.2;
                hexColor = `rgba(45, 80, 22, ${shade})`;
            }

            // Highlight yard line markers every 10 yards
            if ((r - 10) % 10 === 0 && r >= 10 && r < 110) {
                hexColor = 'rgba(255, 255, 255, 0.1)';
            }

            // Draw the hex
            HexUtils.drawHex(ctx, q, r, offsetX, offsetY, hexColor, 'rgba(255, 255, 255, 0.2)', 0.5);
        }
    }

    // Draw yard line numbers
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';

    for (let yard = 10; yard <= 100; yard += 10) {
        const r = yard + 10; // Account for endzone offset
        const yardDisplay = yard <= 50 ? yard : 100 - yard;
        const pos = HexUtils.hexToPixel(0, r, offsetX, offsetY);
        ctx.fillText(yardDisplay.toString(), pos.x, pos.y);
    }

    // Draw line of scrimmage (highlighted row)
    const losR = gameState.ballPosition.r;
    for (let q = startQ; q < startQ + gridWidth; q++) {
        HexUtils.drawHex(ctx, q, losR, offsetX, offsetY, null, '#fbbf24', 2);
    }

    // Draw ball at current position
    const ballPos = HexUtils.hexToPixel(gameState.ballPosition.q, gameState.ballPosition.r, offsetX, offsetY);

    // Draw ball
    ctx.fillStyle = '#8b4513';
    ctx.beginPath();
    ctx.ellipse(ballPos.x, ballPos.y, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw possession indicator above ball
    ctx.fillStyle = gameState.possession === 'home' ? '#4ade80' : '#f87171';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(gameState.possession.toUpperCase(), ballPos.x, ballPos.y - 15);

    // Draw field info
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    const yardLine = HexUtils.getYardLine(gameState.ballPosition.r);
    ctx.fillText(`Ball at ${yardLine} yard line (Hex: ${gameState.ballPosition.q}, ${gameState.ballPosition.r})`, 10, 20);

    // Draw camera controls hint
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '11px Arial';
    ctx.fillText('Use Arrow Keys to scroll', 10, height - 10);
}

// Initial execution disabled
executePlayBtn.disabled = true;
