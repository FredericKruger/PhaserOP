class Ability {

    constructor(config) {
        this.id = config.id;
        this.text = config.text;
        
        this.type = config.type;
        this.phases = config.phases || []; // When this ability can be triggered
        this.conditions = config.conditions || []; // Array of conditions that must be met

        // Tracking
        this.usedThisTurn = false;
        this.usedThisGame = false;
        /** @type {GameCardUI} */
        this.card = null
    }

    /** Function to attach the card
     * @param {GameCardUI} card
     */
    attachTo(card) {
        this.card = card;
    }

    /** Function that tests if an ability can be activated
     * @param {GameState} gameState
     * @returns {boolean}
     */
    canActivate(gameState) {
        // Check if in correct phase
        if (this.phases.length > 0 && !this.phases.includes(gameState.name)) {
            return false;
        }

        // Check if already used (if once-per-turn/game)
        if (this.once === 'turn' && this.usedThisTurn) {
            return false;
        }
        if (this.once === 'game' && this.usedThisGame) {
            return false;
        }

        // Check all conditions
        for (const condition of this.conditions) {
            if (!this.evaluateCondition(condition, gameState)) {
                return false;
            }
        }

        return true;
    }

    /** Function to evalate the conditions 
     * @param {Object} condition
     * @param {GameState} gameState
     * @returns {boolean}
     */
    evaluateCondition(condition, gameState) {
        // Example condition evaluation
        switch (condition.type) {
            case 'MIN_DON':
                return this.card.attachedDons.length >= condition.value;
            case 'CHARACTER_COUNT':
                return this.card.playerScene.characterArea.length >= condition.value;
            // More conditions...
            default:
                return true;
        }
    }

    /** Function to reset the turn variables */
    resetTurn() {
        this.usedThisTurn = false;
    }

    update() {}

}