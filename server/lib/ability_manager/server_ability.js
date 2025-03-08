class ServerAbility {

    constructor(config) {
        this.id = config.id;
        this.text = config.text;
        
        this.type = config.type;
        this.phases = config.phases || []; // When this ability can be triggered
        this.conditions = config.conditions || []; // Array of conditions that must be met
        this.states = config.states || []; // Array of states that must be met

        this.actions = config.actions || []; // Array of actions to execute

        // Tracking
        this.usedThisTurn = false;
        this.usedThisGame = false;
    }


    /** Function that tests if an ability can be activated
     * @param {MatchCard} card 
     * @param {String} gameState
     * @returns {boolean}
     */
    canActivate(card, gameState) {
        // Check if in correct phase
        //console.log('Checking phases', this.phases, gameState);
        if (this.phases.length > 0 && !this.phases.includes(gameState)) {
            return false;
        }

        //console.log('Checking states', this.states, card.state);
        if (this.states.length > 0 && !this.states.includes(card.state)) {
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
     * @param {string} gameState
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

    /** Function to execute the actions 
     * @param {MatchCard} card
     * @param {Player} player
     * @param {Match} match
    */
    executeActions(match, player, card) {
        for (const action of this.actions) {
            const func = serverAbilityActions[action.name];
            if (func) {
                func(match, player, card, action.params);
            }
        }
    }

    /** Function to reset the turn variables */
    resetTurn() {
        this.usedThisTurn = false;
    }

    action (card, player, match) {
        this.executeActions(match, player, card);
    }
}

const serverAbilityActions = {
    addCounterToDefender: (match, player, card, params) => {
        //const defender = gameState.getDefender(params.defenderId);
        //defender.addCounter();
    },
    activateExertedDon: (match, player, card, params) => {
        //const don = gameState.getExertedDon(params.donId);
        //don.activate();
    }
};

module.exports = ServerAbility;