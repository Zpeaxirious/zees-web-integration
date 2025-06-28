// Configuration
const CONFIG = {
    updateInterval: 1000,
    initialDelay: 300,
    endpoint: '/player',
    // Default values (will be overridden by server data if available)
    defaultHealthMax: 20,
    defaultHungerMax: 20
};

// State management
const state = {
    healthMax: CONFIG.defaultHealthMax,
    hungerMax: CONFIG.defaultHungerMax
};

// DOM Elements
const elements = {
    statusIndicator: document.getElementById('connection-status'),
    playerData: document.getElementById('player-data'),
    container: document.querySelector('.glass-container')
};

// Initialize status indicator immediately
elements.statusIndicator.classList.add('status-indicator');

/**
 * Get color based on value percentage
 * @param {number} value - Current value
 * @param {number} max - Maximum value
 * @returns {string} CSS color variable
 */
function getStatusColor(value, max) {
    // Handle cases where max might be 0 or undefined
    if (!max || max <= 0) return "var(--danger)";
    
    const percent = value / max;
    if (percent >= 0.7) return "var(--success)";
    if (percent >= 0.35) return "var(--warning)";
    return "var(--danger)";
}

/**
 * Extract max values from server data if available
 * @param {Object} data - Server response data
 */
function updateMaxValues(data) {
    if (data.maxHealth !== undefined) {
        state.healthMax = data.maxHealth;
    }
    if (data.maxHunger !== undefined) {
        state.hungerMax = data.maxHunger;
    }
}

/**
 * Create loading spinner HTML
 * @returns {string} HTML string
 */
function createLoadingSpinner() {
    return `
        <div class="loading-spinner">
            <div class="spinner-sector spinner-red"></div>
            <div class="spinner-sector spinner-blue"></div>
            <div class="spinner-sector spinner-purple"></div>
        </div>
    `;
}

/**
 * Create error message HTML
 * @param {string} message - Error message
 * @param {boolean} [isWarning=false] - Whether to show warning style
 * @returns {string} HTML string
 */
function createErrorMessage(message, isWarning = false) {
    return `
        <div class="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                ${isWarning 
                    ? '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'
                    : '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>'
                }
            </svg>
            <span>${escapeHtml(message)}</span>
        </div>
    `;
}

/**
 * Create player stats HTML
 * @param {Object} data - Player data
 * @returns {string} HTML string
 */
function createPlayerStats(data) {
    return `
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-label">Player</div>
                <div class="stat-value">${escapeHtml(data.name)}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Health</div>
                <div class="stat-value" style="color: ${getStatusColor(data.health, state.healthMax)}">
                    ${data.health.toFixed(1)}/${state.healthMax}
                    <span class="stat-unit">HP</span>
                </div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Hunger</div>
                <div class="stat-value" style="color: ${getStatusColor(data.hunger, state.hungerMax)}">
                    ${data.hunger}/${state.hungerMax}
                    <span class="stat-unit">HL</span>
                </div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Saturation</div>
                <div class="stat-value">${data.saturation.toFixed(1)}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Biome</div>
                <div class="stat-value">${escapeHtml(data.biome)}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Position</div>
                <div class="stat-value">
                    ${data.x.toFixed(1)}, ${data.y.toFixed(1)}, ${data.z.toFixed(1)}
                </div>
            </div>
        </div>
    `;
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Fetch player data and update UI
 */
async function updatePlayerData() {
    try {
        // Show loading state
        elements.playerData.innerHTML = createLoadingSpinner();
        
        const response = await fetch(CONFIG.endpoint);
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update connection status
        elements.statusIndicator.classList.add('connected');
        
        // Handle server-side errors
        if (data.error) {
            elements.playerData.innerHTML = createErrorMessage(data.error, true);
            return;
        }
        
        // Update max values from server data if available
        updateMaxValues(data);
        
        // Update with player data
        elements.playerData.innerHTML = createPlayerStats(data);
        
    } catch (error) {
        // Update connection status
        elements.statusIndicator.classList.remove('connected');
        
        // Show appropriate error message
        const errorMessage = error.message.includes('Failed to fetch') 
            ? 'Connection failed - Server offline' 
            : error.message;
            
        elements.playerData.innerHTML = createErrorMessage(errorMessage);
        
        // Log error for debugging
        console.error('Player data update failed:', error);
    }
}

/**
 * Initialize the UI
 */
function init() {
    // Set up initial state
    elements.statusIndicator.style.opacity = '1';
    
    // Start updates with slight delay for animation
    setTimeout(() => {
        updatePlayerData();
        setInterval(updatePlayerData, CONFIG.updateInterval);
    }, CONFIG.initialDelay);
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        clearInterval(updateInterval);
    });
}

// Start the application
document.addEventListener('DOMContentLoaded', init);