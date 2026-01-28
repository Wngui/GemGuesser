// Game configuration
const GRID_SIZE = 8;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

// Difficulty settings (easy to adjust)
const DIFFICULTY_EASY = 0.80;    // % covered
const DIFFICULTY_MEDIUM = 0.65;  // % covered
const DIFFICULTY_HARD = 0.50;    // % covered

let currentDifficulty = DIFFICULTY_EASY; // Default difficulty
let COLORED_CELLS_COUNT = Math.floor(TOTAL_CELLS * currentDifficulty);

// Available colors for the gems
const COLORS = ['red', 'blue', 'green', 'purple', 'orange'];

// Game state
let gameGrid = [];
let gridElement = null;
let columnCountsElement = null;
let rowCountsElement = null;
let selectedColor = null;
let remainingColors = {};
let initialColorOrder = []; // Store initial color ordering
let lives = 3; // Track remaining lives
let ghostMarks = {}; // Track ghost marks: {index: color}

// Function to explode heart and make gems fly
function explodeHeartAndGems() {
    const heartContainer = document.getElementById('heartContainer');
    const cells = document.querySelectorAll('.grid-cell');
    
    // Explode heart
    if (heartContainer) {
        heartContainer.classList.add('exploding');
    }
    
    // Make each revealed gem fly in a random direction
    cells.forEach((cell, index) => {
        // Only animate colored cells that have been revealed (not hidden)
        if (!cell.classList.contains('hidden') && !cell.classList.contains('empty')) {
            setTimeout(() => {
                const angle = Math.random() * Math.PI * 2;
                const distance = 400 + Math.random() * 600;
                const tx = Math.cos(angle) * distance;
                const ty = Math.sin(angle) * distance;
                const rotation = Math.random() * 1080 - 540;
                
                cell.style.transform = `translate(${tx}px, ${ty}px) rotate(${rotation}deg) scale(0.3)`;
                cell.style.opacity = '0';
                cell.style.transition = 'all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                cell.style.zIndex = '9999';
            }, index * 15);
        }
    });
    
    // Show modal after 2 seconds
    setTimeout(() => {
        showLossModal();
    }, 2000);
}

// Function to show loss modal
function showLossModal() {
    const modal = document.createElement('div');
    modal.className = 'victory-modal';
    modal.innerHTML = `
        <div class="victory-modal-content loss-modal-content">
            <h2>You Lost! 💔</h2>
            <p>Better luck next time!</p>
            <button onclick="closeLossModal()" class="play-again-btn">Try Again</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Fade in
    setTimeout(() => modal.classList.add('show'), 100);
}

// Function to close loss modal
function closeLossModal() {
    const modal = document.querySelector('.victory-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
    
    // Start new game
    startNewGame();
}

// Make closeLossModal available globally
window.closeLossModal = closeLossModal;

// Initialize modal button
document.addEventListener('DOMContentLoaded', function() {
    gridElement = document.getElementById('gameGrid');
    columnCountsElement = document.getElementById('columnCounts');
    rowCountsElement = document.getElementById('rowCounts');
    
    // Setup difficulty buttons
    setupDifficultyButtons();
    
    // Start the first game
    startNewGame();
});

// Function to setup difficulty button handlers
function setupDifficultyButtons() {
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    difficultyButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const difficulty = this.getAttribute('data-difficulty');
            setDifficulty(difficulty);
        });
    });
}

// Function to set difficulty and start new game
function setDifficulty(difficulty) {
    // Update current difficulty
    switch(difficulty) {
        case 'easy':
            currentDifficulty = DIFFICULTY_EASY;
            break;
        case 'medium':
            currentDifficulty = DIFFICULTY_MEDIUM;
            break;
        case 'hard':
            currentDifficulty = DIFFICULTY_HARD;
            break;
        default:
            currentDifficulty = DIFFICULTY_EASY;
    }
    
    // Update colored cells count
    COLORED_CELLS_COUNT = Math.floor(TOTAL_CELLS * currentDifficulty);
    
    // Update button states
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    difficultyButtons.forEach(btn => {
        if (btn.getAttribute('data-difficulty') === difficulty) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Start new game with new difficulty
    startNewGame();
}

// Function to start a new game
function startNewGame() {
    console.log('Starting new game...');
    lives = 3; // Reset lives
    
    // Reset heart
    const heartContainer = document.getElementById('heartContainer');
    if (heartContainer) {
        heartContainer.classList.remove('exploding');
    }
    
    // Reset any gem positions from previous explosion
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
        cell.style.transform = '';
        cell.style.opacity = '';
        cell.style.transition = '';
        cell.style.zIndex = '';
    });
    
    updateLivesDisplay();
    ghostMarks = {}; // Reset ghost marks
    generateGameGrid();
    
    // Sort colors by count initially and store the order
    initialColorOrder = COLORS.slice().sort((a, b) => {
        const countA = remainingColors[a] || 0;
        const countB = remainingColors[b] || 0;
        return countA - countB;
    });
    
    renderGrid();
    renderCounts();
    
    // Select the least common color by default
    selectLeastColor();
}

// Function to generate the game grid with random colors
function generateGameGrid() {
    // Initialize empty grid
    gameGrid = new Array(TOTAL_CELLS).fill(null);
    
    // Reset remaining colors count
    remainingColors = {};
    
    // Get random positions for colored cells, ensuring no empty rows or columns
    const coloredPositions = getRandomPositionsWithNoEmptyLines(COLORED_CELLS_COUNT, TOTAL_CELLS);
    
    // Assign random colors to the selected positions with balanced distribution
    coloredPositions.forEach(position => {
        let selectedColor;

        // Check if there's a cell to the left in the same row (75% chance to match it)
        const row = Math.floor(position / GRID_SIZE);
        const col = position % GRID_SIZE;
        
        if (col > 0) {
            const leftPosition = position - 1;
            const leftColor = gameGrid[leftPosition];
            
            // 75% chance to use the same color as the left neighbor
            if (leftColor && Math.random() < 0.35) {
                selectedColor = leftColor;
            }
        }
        
        // Check if there's a cell above in the same column (75% chance to match it)
        if (!selectedColor && row > 0) {
            const abovePosition = position - GRID_SIZE;
            const aboveColor = gameGrid[abovePosition];
            
            // 75% chance to use the same color as the cell above
            if (aboveColor && Math.random() < 0.35) {
                selectedColor = aboveColor;
            }
        }
        
        // If no color selected yet, choose weighted by lowest count
        if (!selectedColor) {
            selectedColor = selectWeightedColor();
        }
        
        gameGrid[position] = selectedColor;
        remainingColors[selectedColor] = (remainingColors[selectedColor] || 0) + 1;
    });

    console.log(`Generated grid with ${COLORED_CELLS_COUNT} colored cells out of ${TOTAL_CELLS} total cells`);
}

// Function to select a color weighted by current distribution (favoring less-used colors)
function selectWeightedColor() {
    // Calculate weights inversely proportional to current count
    // Colors with fewer cells get higher weights
    const weights = [];
    let totalWeight = 0;

    COLORS.forEach(color => {
        const count = remainingColors[color] || 0;
        // Weight formula: Higher weight for lower counts
        // Using exponential weighting to heavily favor rare colors
        const weight = Math.pow(COLORED_CELLS_COUNT - count + 1, 3);
        weights.push({ color, weight });
        totalWeight += weight;
    });

    console.log('Color weights:', weights.map(w => `${w.color}: ${w.weight} (count: ${remainingColors[w.color] || 0})`).join(', '));

    // Select random color based on weights
    let random = Math.random() * totalWeight;
    console.log(`Random value: ${random.toFixed(2)} out of ${totalWeight.toFixed(2)}`);

    for (let i = 0; i < weights.length; i++) {
        random -= weights[i].weight;
        if (random <= 0) {
            console.log(`Selected color: ${weights[i].color}`);
            return weights[i].color;
        }
    }

    // Fallback (should never reach here)
    console.warn('Fallback color selection used!');
    return COLORS[0];
}

// Function to get random unique positions
function getRandomPositions(count, max) {
    const positions = [];
    const availablePositions = Array.from({length: max}, (_, i) => i);
    
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * availablePositions.length);
        positions.push(availablePositions[randomIndex]);
        availablePositions.splice(randomIndex, 1);
    }
    
    return positions;
}

// Function to get random positions ensuring no empty rows or columns
function getRandomPositionsWithNoEmptyLines(count, max) {
    const positions = new Set();
    
    // First, ensure at least one cell per row and per column
    const rowsWithCells = new Set();
    const colsWithCells = new Set();
    
    // Place one cell in each row first
    for (let row = 0; row < GRID_SIZE; row++) {
        let col = Math.floor(Math.random() * GRID_SIZE);
        const position = row * GRID_SIZE + col;
        positions.add(position);
        rowsWithCells.add(row);
        colsWithCells.add(col);
    }
    
    // Now ensure every column has at least one cell
    for (let col = 0; col < GRID_SIZE; col++) {
        if (!colsWithCells.has(col)) {
            let row = Math.floor(Math.random() * GRID_SIZE);
            const position = row * GRID_SIZE + col;
            positions.add(position);
            colsWithCells.add(col);
        }
    }
    
    // Fill remaining positions randomly
    const remainingCount = count - positions.size;
    if (remainingCount > 0) {
        const availablePositions = [];
        for (let i = 0; i < max; i++) {
            if (!positions.has(i)) {
                availablePositions.push(i);
            }
        }
        
        // Shuffle and take the required number
        for (let i = 0; i < remainingCount && availablePositions.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availablePositions.length);
            positions.add(availablePositions[randomIndex]);
            availablePositions.splice(randomIndex, 1);
        }
    }
    
    return Array.from(positions);
}

// Function to render the grid in the DOM
function renderGrid() {
    // Clear existing grid
    gridElement.innerHTML = '';
    
    // Create cells
    for (let i = 0; i < TOTAL_CELLS; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.setAttribute('data-index', i);

        if (gameGrid[i]) {
            // Colored cell - initially hidden
            cell.classList.add(`color-${gameGrid[i]}`);
            cell.classList.add('hidden');
            cell.setAttribute('data-color', gameGrid[i]);
        } else {
            // Empty cell
            cell.classList.add('empty');
        }
        
        // Add click event listener for game interactions
        cell.addEventListener('click', function() {
            handleCellClick(i);
        });
        
        // Add right-click event listener for ghost marks
        cell.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            handleCellRightClick(i);
        });
        
        // Apply ghost mark if exists
        if (ghostMarks[i]) {
            cell.classList.add('ghost');
            cell.classList.add(`ghost-${ghostMarks[i]}`);
        }
        
        gridElement.appendChild(cell);
    }
    
    console.log('Grid rendered successfully');
}

// Function to calculate color counts for rows and columns
function calculateCounts() {
    const rowCounts = Array(GRID_SIZE).fill(null).map(() => ([]));
    const columnCounts = Array(GRID_SIZE).fill(null).map(() => ([]));
    
    // Calculate row counts with sequences
    for (let row = 0; row < GRID_SIZE; row++) {
        let lastColor = null;
        let startIndex = -1;
        for (let col = 0; col < GRID_SIZE; col++) {
            const index = row * GRID_SIZE + col;
            const color = gameGrid[index];
            
            if (color) {
                // If same color as last, increment count
                if (color === lastColor && rowCounts[row].length > 0) {
                    rowCounts[row][rowCounts[row].length - 1].count++;
                    rowCounts[row][rowCounts[row].length - 1].indices.push(index);
                } else {
                    // New color sequence
                    startIndex = index;
                    rowCounts[row].push({ color: color, count: 1, indices: [index] });
                    lastColor = color;
                }
            } else {
                lastColor = null;
            }
        }
    }
    
    // Calculate column counts with sequences
    for (let col = 0; col < GRID_SIZE; col++) {
        let lastColor = null;
        let startIndex = -1;
        for (let row = 0; row < GRID_SIZE; row++) {
            const index = row * GRID_SIZE + col;
            const color = gameGrid[index];
            
            if (color) {
                // If same color as last, increment count
                if (color === lastColor && columnCounts[col].length > 0) {
                    columnCounts[col][columnCounts[col].length - 1].count++;
                    columnCounts[col][columnCounts[col].length - 1].indices.push(index);
                } else {
                    // New color sequence
                    startIndex = index;
                    columnCounts[col].push({ color: color, count: 1, indices: [index] });
                    lastColor = color;
                }
            } else {
                lastColor = null;
            }
        }
    }
    
    return { rowCounts, columnCounts };
}

// Function to check if all cells in a segment are revealed
function isSegmentComplete(indices) {
    return indices.every(index => {
        const cell = gridElement.children[index];
        return cell && cell.classList.contains('revealed');
    });
}

// Function to render count displays
function renderCounts() {
    const { rowCounts, columnCounts } = calculateCounts();
    
    // Render column counts
    columnCountsElement.innerHTML = '';
    
    // Column count displays (no corner cell)
    for (let col = 0; col < GRID_SIZE; col++) {
        const countDisplay = document.createElement('div');
        countDisplay.className = 'count-display';

        const counts = columnCounts[col];
        if (counts.length > 0) {
            counts.forEach(item => {
                const countItem = document.createElement('div');
                countItem.className = `count-item color-${item.color}`;
                countItem.textContent = item.count;
                
                // Check if this segment is complete
                if (isSegmentComplete(item.indices)) {
                    countItem.classList.add('completed');
                }
                
                countDisplay.appendChild(countItem);
            });
        }
        
        columnCountsElement.appendChild(countDisplay);
    }
    
    // Render row counts
    rowCountsElement.innerHTML = '';
    
    for (let row = 0; row < GRID_SIZE; row++) {
        const countDisplay = document.createElement('div');
        countDisplay.className = 'count-display';
        
        const counts = rowCounts[row];
        if (counts.length > 0) {
            counts.forEach(item => {
                const countItem = document.createElement('div');
                countItem.className = `count-item color-${item.color}`;
                countItem.textContent = item.count;
                
                // Check if this segment is complete
                if (isSegmentComplete(item.indices)) {
                    countItem.classList.add('completed');
                }
                
                countDisplay.appendChild(countItem);
            });
        }
        
        rowCountsElement.appendChild(countDisplay);
    }
    
    console.log('Counts rendered successfully');
    
    // Match button dimensions to row counts after rendering
    matchButtonDimensions();
    
    // Render total color counts
    renderTotalColors();
}

// Function to render total color counts
function renderTotalColors() {
    const totalColorsElement = document.getElementById('totalColors');
    if (!totalColorsElement) return;
    
    totalColorsElement.innerHTML = '';
    
    // Use initial color order from game start
    const colorsToRender = initialColorOrder.length > 0 ? initialColorOrder : COLORS;
    
    colorsToRender.forEach(color => {
        const count = remainingColors[color] || 0;
        const colorBox = document.createElement('div');
        colorBox.className = `color-total color-${color}`;
        colorBox.textContent = count;
        colorBox.setAttribute('data-color', color);
        
        // Add disabled class if count is 0
        if (count === 0) {
            colorBox.classList.add('disabled');
        }
        
        // Add selected class if this is the selected color
        if (selectedColor === color) {
            colorBox.classList.add('selected');
        }
        
        // Add click handler
        colorBox.addEventListener('click', function() {
            selectColor(color);
        });
        
        totalColorsElement.appendChild(colorBox);
    });
}

// Function to select a color
function selectColor(color) {
    // Don't allow selecting colors with 0 remaining
    const count = remainingColors[color] || 0;
    if (count === 0) {
        return;
    }
    
    // Always set the color (no toggle/deselect)
    selectedColor = color;
    
    // Update the visual state
    const allColorBoxes = document.querySelectorAll('.color-total');
    allColorBoxes.forEach(box => {
        if (box.getAttribute('data-color') === selectedColor) {
            box.classList.add('selected');
        } else {
            box.classList.remove('selected');
        }
    });
}

// Function to select the least common color
function selectLeastColor() {
    // Find the color with the least remaining count
    let leastColor = COLORS[0];
    let leastCount = remainingColors[leastColor] || 0;
    
    COLORS.forEach(color => {
        const count = remainingColors[color] || 0;
        if (count > 0 && (leastCount === 0 || count < leastCount)) {
            leastCount = count;
            leastColor = color;
        }
    });
    
    // Select the least common color
    selectColor(leastColor);
}

// Function to select the next available color (with lowest count)
function selectNextAvailableColor() {
    // Find the color with the least remaining count (greater than 0)
    let nextColor = null;
    let lowestCount = Infinity;
    
    COLORS.forEach(color => {
        const count = remainingColors[color] || 0;
        if (count > 0 && count < lowestCount) {
            lowestCount = count;
            nextColor = color;
        }
    });
    
    // If we found a color with remaining gems, select it
    if (nextColor) {
        selectColor(nextColor);
    }
}

// Function to update the lives display
function updateLivesDisplay() {
    const heartContainer = document.getElementById('heartContainer');
    const livesText = document.getElementById('livesText');
    
    // Update lives text
    if (livesText) {
        livesText.textContent = lives;
    }
    
    // Update heartbeat speed and liquid level based on remaining lives
    if (heartContainer) {
        heartContainer.className = 'heart-container lives-' + lives;
    }
}

// Function to lose a life
function loseLife() {
    if (lives > 0) {
        lives--;
        updateLivesDisplay();
        
        if (lives === 0) {
            // Game over - trigger explosion
            setTimeout(() => {
                explodeHeartAndGems();
            }, 300);
        }
    }
}

// Function to match button dimensions to dynamic content
function matchButtonDimensions() {
    const topLeftCorner = document.getElementById('topLeftCorner');
    const rowCounts = document.getElementById('rowCounts');
    const columnCounts = document.getElementById('columnCounts');
    
    if (topLeftCorner && rowCounts && columnCounts) {
        // Use requestAnimationFrame to ensure DOM is fully rendered
        requestAnimationFrame(() => {
            // Get the computed dimensions including borders and padding
            const rowCountsWidth = rowCounts.getBoundingClientRect().width +1;
            const columnCountsHeight = columnCounts.getBoundingClientRect().height;
            
            // Set the dimensions
            topLeftCorner.style.width = `${rowCountsWidth}px`;
            topLeftCorner.style.height = `${columnCountsHeight}px`;
        });
    }
}

// Function to handle right-clicks for ghost marks
function handleCellRightClick(index) {
    const cell = gridElement.children[index];
    
    // Don't allow ghost marks on revealed cells
    if (cell.classList.contains('revealed')) {
        return;
    }
    
    // Check if no color is selected
    if (!selectedColor) {
        return;
    }
    
    // Check if there's already a ghost mark
    if (ghostMarks[index]) {
        // If same color, remove the ghost mark
        if (ghostMarks[index] === selectedColor) {
            delete ghostMarks[index];
            cell.classList.remove('ghost');
            cell.classList.remove(`ghost-${selectedColor}`);
        } else {
            // Different color, change the ghost mark
            const oldColor = ghostMarks[index];
            cell.classList.remove(`ghost-${oldColor}`);
            ghostMarks[index] = selectedColor;
            cell.classList.add(`ghost-${selectedColor}`);
        }
    } else {
        // No ghost mark, add one
        ghostMarks[index] = selectedColor;
        cell.classList.add('ghost');
        cell.classList.add(`ghost-${selectedColor}`);
    }
}

// Function to handle cell clicks (for future game features)
function handleCellClick(index) {
    const cell = gridElement.children[index];
    const color = gameGrid[index];
    
    // Don't allow clicking on already revealed cells
    if (cell.classList.contains('revealed')) {
        return;
    }
    
    // Check if no color is selected
    if (!selectedColor) {
        return;
    }
    
    // If clicking on a hidden colored cell
    if (color && cell.classList.contains('hidden')) {
        // Check if the guess is correct
        if (color === selectedColor) {
            // Correct guess - reveal the cell
            cell.classList.remove('hidden');
            cell.classList.add('revealed');
            
            // Remove ghost mark if exists
            if (ghostMarks[index]) {
                cell.classList.remove('ghost');
                cell.classList.remove(`ghost-${ghostMarks[index]}`);
                delete ghostMarks[index];
            }
            
            // Decrease the remaining count for this color
            remainingColors[color] = (remainingColors[color] || 1) - 1;
            
            // Update the counts display to check for completed segments
            renderCounts();
            
            // If this color reached 0, auto-select the next available color
            if (remainingColors[color] === 0) {
                selectNextAvailableColor();
            }
            
            // Check if game is won
            checkVictory();
            
            console.log(`Correct! Revealed ${color} at position ${index}`);
        } else {
            // Incorrect guess - lose a life and shake the board
            loseLife();
            
            const gridWithRows = document.querySelector('.grid-with-rows');
            gridWithRows.classList.add('shake');
            
            // Remove shake class after animation
            setTimeout(() => {
                gridWithRows.classList.remove('shake');
            }, 500);
            
            console.log(`Wrong! Cell is ${color}, you guessed ${selectedColor}`);
        }
    } else if (!color) {
        // Clicking on empty cell - lose a life and shake the board
        loseLife();
        
        const gridWithRows = document.querySelector('.grid-with-rows');
        gridWithRows.classList.add('shake');
        
        // Remove shake class after animation
        setTimeout(() => {
            gridWithRows.classList.remove('shake');
        }, 500);
        
        console.log(`Wrong! Cell is empty`);
    }
}

// Function to get grid statistics (for debugging)
function getGridStats() {
    const colorCounts = {};
    let emptyCount = 0;
    
    gameGrid.forEach(cell => {
        if (cell) {
            colorCounts[cell] = (colorCounts[cell] || 0) + 1;
        } else {
            emptyCount++;
        }
    });
    
    return {
        total: TOTAL_CELLS,
        colored: TOTAL_CELLS - emptyCount,
        empty: emptyCount,
        colorDistribution: colorCounts,
        coloredPercentage: ((TOTAL_CELLS - emptyCount) / TOTAL_CELLS * 100).toFixed(1) + '%'
    };
}

// Function to check if game is won
function checkVictory() {
    // Check if all colored cells are revealed
    const allRevealed = Array.from(gridElement.children).every(cell => {
        return cell.classList.contains('empty') || cell.classList.contains('revealed');
    });
    
    if (allRevealed) {
        celebrateVictory();
    }
}

// Function to celebrate victory
function celebrateVictory() {
    console.log('🎉 Victory!');
    
    // Add sparkle and pulsate to all revealed cells
    const revealedCells = gridElement.querySelectorAll('.revealed');
    revealedCells.forEach(cell => {
        cell.classList.add('victory-sparkle');
    });
    
    // Show victory modal
    showVictoryModal();
    
    // Create continuous fireworks
    createContinuousFireworks();
    
    // Create continuous diamond rain
    createContinuousDiamondRain();
}

// Function to show victory modal
function showVictoryModal() {
    const modal = document.createElement('div');
    modal.className = 'victory-modal';
    modal.innerHTML = `
        <div class="victory-modal-content">
            <h2>🎉 Congratulations! 🎉</h2>
            <p>You found all the gems!</p>
            <button onclick="closeVictoryModal()" class="play-again-btn">Play Again?</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Fade in
    setTimeout(() => modal.classList.add('show'), 100);
}

// Function to close victory modal and start new game
function closeVictoryModal() {
    const modal = document.querySelector('.victory-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
    
    // Stop continuous animations
    stopContinuousAnimations();
    
    // Start new game
    startNewGame();
}

// Continuous animation intervals
let fireworksInstance = null;
let diamondRainInterval = null;

// Function to create continuous fireworks
function createContinuousFireworks() {
    const container = document.querySelector('.container');
    let fireworksContainer = document.querySelector('.fireworks-container');
    
    if (!fireworksContainer) {
        fireworksContainer = document.createElement('div');
        fireworksContainer.className = 'fireworks-container';
        container.appendChild(fireworksContainer);
    }
    
    // Initialize fireworks.js
    fireworksInstance = new Fireworks.default(fireworksContainer, {
        autoresize: true,
        opacity: 0.5,
        acceleration: 1.05,
        friction: 0.97,
        gravity: 1.5,
        particles: 90,
        traceLength: 3,
        traceSpeed: 10,
        explosion: 5,
        intensity: 30,
        flickering: 50,
        lineStyle: 'round',
        hue: {
            min: 0,
            max: 360
        },
        delay: {
            min: 30,
            max: 60
        },
        rocketsPoint: {
            min: 50,
            max: 50
        },
        lineWidth: {
            explosion: {
                min: 1,
                max: 3
            },
            trace: {
                min: 1,
                max: 2
            }
        },
        brightness: {
            min: 50,
            max: 80
        },
        decay: {
            min: 0.015,
            max: 0.03
        },
        mouse: {
            click: false,
            move: false,
            max: 1
        }
    });
    
    fireworksInstance.start();
}

// Function to create continuous diamond rain
function createContinuousDiamondRain() {
    const container = document.querySelector('.container');
    let rainContainer = document.querySelector('.diamond-rain-container');
    
    if (!rainContainer) {
        rainContainer = document.createElement('div');
        rainContainer.className = 'diamond-rain-container';
        container.appendChild(rainContainer);
    }
    
    // Create diamonds every 500ms
    diamondRainInterval = setInterval(() => {
        const diamond = document.createElement('div');
        diamond.className = 'falling-diamond';
        diamond.textContent = '💎';
        diamond.style.left = Math.random() * 100 + '%';
        diamond.style.animationDuration = (2 + Math.random() * 2) + 's';
        rainContainer.appendChild(diamond);
        
        // Remove after animation
        setTimeout(() => diamond.remove(), 4000);
    }, 500);
}

// Function to stop continuous animations
function stopContinuousAnimations() {
    if (fireworksInstance) {
        fireworksInstance.stop();
        fireworksInstance = null;
    }
    
    if (diamondRainInterval) {
        clearInterval(diamondRainInterval);
        diamondRainInterval = null;
    }
    
    // Remove animation containers
    const fireworksContainer = document.querySelector('.fireworks-container');
    const rainContainer = document.querySelector('.diamond-rain-container');
    
    if (fireworksContainer) fireworksContainer.remove();
    if (rainContainer) rainContainer.remove();
}

// Debug function to trigger victory
function debugWin() {
    // Reveal all colored cells
    Array.from(gridElement.children).forEach((cell, index) => {
        if (gameGrid[index] && cell.classList.contains('hidden')) {
            cell.classList.remove('hidden');
            cell.classList.add('revealed');
        }
    });
    
    // Reset remaining colors
    COLORS.forEach(color => {
        remainingColors[color] = 0;
    });
    
    renderCounts();
    celebrateVictory();
}

// Expose some functions to global scope for debugging
window.getGridStats = getGridStats;
window.startNewGame = startNewGame;
window.debugWin = debugWin;
window.closeVictoryModal = closeVictoryModal;