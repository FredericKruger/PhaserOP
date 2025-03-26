
class ServerAbility {

    constructor(config) {
        this.id = config.id;
        this.text = config.text;
        
        this.type = config.type;
        this.phases = config.phases || []; // When this ability can be triggered
        this.conditions = config.conditions || []; // Array of conditions that must be met
        this.states = config.states || []; // Array of states that must be met

        this.target = config.target || null; // Target of the ability

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
            if (!this.evaluateCondition(card, condition, gameState)) {
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
    evaluateCondition(card, condition, gameState) {
        // Example condition evaluation
        switch (condition.type) {
            case 'ATTACHED_DON':
                return card.attachedDon.length >= condition.value;
            case 'CHARACTER_COUNT':
                return card.playerScene.characterArea.length >= condition.value;
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
    executeActions(match, player, card, targets) {
        let actionResults = {};
        for (const action of this.actions) {
            const func = serverAbilityActions[action.name];
            if (func) {
                actionResults[action.name] = func(match, player, card, action.params, targets);
            }
        }
        return actionResults;
    }

    /** Function to reset the turn variables */
    resetTurn() {
        this.usedThisTurn = false;
    }

    action (card, player, match, targets) {
        return this.executeActions(match, player, card, targets);
    }
}

const serverAbilityActions = {
    addCounterToCard: (match, player, card, params, targets) => {
        let actionResults = {};
        actionResults.defenderId = -1;
        actionResults.counterAmount = 0;

        //find defender
        const counterAmount = params.amount;
        const defender = match.state.getCard(targets);
        defender.eventCounterAmount = counterAmount;

        actionResults.defenderId = defender.id;
        actionResults.counterAmount = counterAmount;

        return actionResults;
    },
    activateExertedDon: (match, player, card, params) => {
        let actionResults = {};
        actionResults.donId = [];

        const donAmount = params.amount;
        for(let i = 0; i < donAmount; i++) {
            //Find an exerted Don
            if(player.inExertenDon.length > 0) {
                let donCard = player.inExertenDon.pop();
                donCard.setState("DON_ACTIVE");
                player.inActiveDon.push(donCard);
                actionResults.donId.push(donCard.id);
            } else {
                return actionResults;
            }
        }
        return actionResults;
    }
};

module.exports = ServerAbility;