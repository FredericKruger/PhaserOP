class Ability {

    constructor(config) {
        this.id = config.id;
        this.text = config.text;
        
        this.type = config.type;
        this.phases = config.phases || []; // When this ability can be triggered
        this.conditions = config.conditions || []; // Array of conditions that must be met
        this.states = config.states || []; // Array of states that must be met

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
     * @param {string} gamePhase
     * @returns {boolean}
     */
    canActivate(gamePhase) {
        // Check if in correct phase
        if (this.phases.length > 0 && !this.phases.includes(gamePhase)) {
            return false;
        }

        if (this.states.length > 0 && !this.states.includes(this.card.state)) {
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
            if (!this.evaluateCondition(condition, gamePhase)) {
                return false;
            }
        }

        return true;
    }

    /** Function to evalate the conditions 
     * @param {Object} condition
     * @param {string} gamePhase
     * @returns {boolean}
     */
    evaluateCondition(condition, gamePhase) {
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

    /** Function to handle the trigger of the action button */
    trigger() {this.card.scene.game.gameClient.requestPerformAbility(this.card.id, this.id);}

    update() {}
    action() {}
    onFail() {}

}