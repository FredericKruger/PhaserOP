
const MatchAura = require('../match_objects/match_aura.js');

class ServerAbility {

    constructor(config, cardId, matchId) {
        this.id = config.id;
        this.cardId = cardId;
        this.matchId = matchId;

        this.text = config.text;
        this.type = config.type;
        this.phases = config.phases || []; // When this ability can be triggered
        this.conditions = config.conditions || []; // Array of conditions that must be met
        this.states = config.states || []; // Array of states that must be met

        this.optional = config.optional || false; // If the ability is optional or not

        this.target = config.target || null; // Target of the ability

        this.actions = config.actions || []; // Array of actions to execute

        // Tracking
        this.usedThisTurn = false;
        this.usedThisGame = false;

        //Execution pile
        this.currentAction = 0; // Current action being executed
        this.actionResults = []; // Array of results from the actions executed
        this.currentTargets = []; // Array of targets selected by the player
    }


    /** Function that tests if an ability can be activated
     * @returns {boolean}
     */
    canActivate() {
        const match = matchRegistry.get(this.matchId);
        const card = match.matchCardRegistry.get(this.cardId);
        const gameState = match.state.current_phase
        // Check if in correct phase
        //console.log('Checking phases', this.phases, gameState);
        if (this.phases.length > 0 && !this.phases.includes(gameState)) {
            return false;
        }

       //console.log('Checking states', this.states, card.state, card.id);
        if (this.states.length > 0 && !this.states.includes(card.state)) {
            return false;
        }

        // Check all conditions
        for (const condition of this.conditions) {
            //console.log(condition);
            if (!this.evaluateCondition(card, condition, gameState)) {
                //console.log("FAILED")
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
        const match = matchRegistry.get(card.matchId);
        const cardPlayer =  match.getPlayer(card.owner);
        // Example condition evaluation
        switch (condition.type) {
            case 'ATTACHED_DON':
                return card.attachedDon.length >= condition.value;
            case 'AVAILABLE_DON':
                if(cardPlayer.currentMatchPlayer.inActiveDon.length >= condition.value) return true;
                return false;
            case 'CARD_RESTED':
                if(card.state === "IN_PLAY_RESTED" && condition.value) return true;
                else if(card.state !== "IN_PLAY_RESTED" && !condition.value) return true;
                return false;
            case 'CHARACTER_COUNT':
                return cardPlayer.currentMatchPlayer.inCharacterArea.length >= condition.value;
            case 'HAS_ATTACKED_THIS_TURN':
                if(card.hasAttackedThisTurn && condition.value) return true;
                if(!card.hasAttackedThisTurn && !condition.value) return true;
                return false;
            case 'MIN_CARDS_IN_HAND':
                return cardPlayer.currentMatchPlayer.inHand.length >= condition.value;
            case 'ONCE':
                if(this.usedThisTurn && condition.value === 'TURN') return false;
                if(this.usedThisGame && condition.value === 'GAME') return false;
                return true;
            case 'PLAYER_TURN':
                if(cardPlayer.id === match.state.current_active_player.id && condition.value) return true;
                return false;
            case 'PLAYED_THIS_TURN':
                if(card.turnPlayed === match.state.current_turn && condition.value) return true;
                if(card.turnPlayed !== match.state.current_turn && !condition.value) return true;
                return false;
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
        let actionResults = {}
        for (let i = this.currentAction; i<this.actions.length; i++) {

            const action = this.actions[i];
            const func = serverAbilityActions[action.name];
            if (func) {
                let results = func(match, player, card, action.params, targets);
                this.actionResults.push(results);

                this.currentAction++;
                if(action.name === "target") return {status: "TARGETING", targetData: results}; // Target action is not executed //Stop to start targeting
            }
        }
        
        //If arrived at this stage it means it didnt leave for targeting anymore
        this.currentAction = 0;
        actionResults = {
            status: "DONE",
            actionResults: this.actionResults
        };
        this.actionResults = []; // Reset action results

        //Set turn flags
        let condition = this.conditions.find(condition => condition.type === 'ONCE');
        if(condition) {
            if(condition.value === "TURN") this.usedThisTurn = true;
            if(condition.value === "GAME") this.usedThisGame = true;
        }

        return actionResults;
    }

    /** Function that returns a list of all targets
     * @returns {Array} targets
     */
    getTargets() {
        let targets = [];
        for(let i = 0; i < this.actions.length; i++) {
            const action = this.actions[i];
            if(action.name === "target") {
                targets.push(action.params.target);
            }
        }
        return targets;
    }

    /** Function to reset the turn variables */
    resetTurn() {
        this.usedThisTurn = false;
    }

    action (player, targets) {
        const match = matchRegistry.get(this.matchId);
        const card = match.matchCardRegistry.get(this.cardId);
        return this.executeActions(match, player, card, targets);
    }
}

const serverAbilityActions = {
    activateExertedDon: (match, player, card, params) => {
        let actionResults = {};
        actionResults.donId = [];
        actionResults.player = params.player;

        let targetPlayer = player;
        if(params.player === "opponent") targetPlayer = match.getOpponentPlayer(player.id).currentMatchPlayer;

        const donAmount = params.amount;
        for(let i = 0; i < donAmount; i++) {
            //Find an exerted Don
            if(targetPlayer.inExertenDon.length > 0) {
                let donCard = targetPlayer.inExertenDon.pop();
                donCard.setState("DON_ACTIVE");
                targetPlayer.inActiveDon.push(donCard);
                actionResults.donId.push(donCard.id);
            } else {
                return actionResults;
            }
        }
        return actionResults;
    },
    addCounterToCard: (match, player, card, params, targets) => {
        let actionResults = {};
        actionResults.defenderId = -1;
        actionResults.counterAmount = 0;

        //find defender
        const counterAmount = params.amount;
        const defender = match.state.getCard(targets[0]);
        defender.eventCounterAmount = counterAmount;

        actionResults.defenderId = defender.id;
        actionResults.counterAmount = counterAmount;

        return actionResults;
    },
    addPowerToCard: (match, player, card, params, targets) => {
        let actionResults = {};
        actionResults.cardId = -1;
        actionResults.addedPower = params.amount;
        actionResults.duration = params.duration;

        let targetCard = null;
        switch(params.target) {
            case "SELF":
                targetCard = card;
                break;
            case "TARGET":
            default:
                targetCard = match.matchCardRegistry.get(targets[0]);
                break;
        }
        actionResults.cardId = targetCard.id;

        switch(params.duration) {
            case "TURN":
                targetCard.turnEventPowerAmount += params.amount;
                break;
            case "GAME":
                targetCard.gameEventPowerAmount += params.amount;
                break;
        }

        return actionResults;
    },
    attachDonCard: (match, player, card, params, targets) => {
        let actionResults = {};
        actionResults.targetId = -1;
        actionResults.donId = [];
        actionResults.pile = params.pile;

        const donAmount = params.amount;
        const targetParam = params.target;

        //Retrieve target
        switch(targetParam) {
            case "SELF":
                actionResults.targetId = card.id;
                break;
            case "TARGET":
                actionResults.targetId = targets[0];
                break;
        }
        const targetCard = match.matchCardRegistry.get(actionResults.targetId);

        //Retrieve Don Pile
        let donLocation = null;
        switch(params.pile) {
            case "EXERTED":
                donLocation = player.inExertenDon;
                break;
            case "ACTIVE":
                donLocation = player.inActiveDon;
                break;
        }

        //Attach Don Cards
        for(let i = 0; i < donAmount; i++) {
            let cardAvailable = false;
            if(donLocation.length > 0) {
                let donCard = donLocation.find(don => don.state === params.state);
                if(donCard) {
                    cardAvailable = true;
                    donLocation.splice(donLocation.indexOf(donCard), 1);
                    donCard.setState("DON_ATTACHED");
                    player.inExertenDon.push(donCard);
                    targetCard.attachedDon.push(donCard.id);
                    actionResults.donId.push(donCard.id);
                }
            } 
            
            if(!cardAvailable) return actionResults;
            
        }
        return actionResults;
    },
    changeCardState: (match, player, card, params, targets) => {
        let actionResults = {};
        actionResults.restedCardId = -1;
        actionResults.cardState = params.state;

        let targetCard = null;
        switch(params.target) {
            case "SELF":
                targetCard = card;
                break;
            case "TARGET":
                targetCard = match.matchCardRegistry.get(targets[0]);
                break;
        }
        actionResults.restedCardId = targetCard.id;

        targetCard.state = params.state;

        return actionResults;
    },
    createAura: (match, player, card, params, targets) => {
        let actionResults = {};

        let targetCard = null;
        switch(params.target) {
            case "SELF":
                targetCard = card;
                break;
            case "TARGET":
            default:
                targetCard = match.matchCardRegistry.get(targets[0]);
                break;
        }

        //Create a new aura
        match.lastAuraID++;
        let auraId = match.lastAuraID;
        let newAura = new MatchAura(auraId, targetCard.id, match.id, params.aura);
        match.auraManager.addAura(newAura); //Add aura to the match

        actionResults.auraId = auraId;
        actionResults.targetId = targetCard.id;
        actionResults.auraData = params.aura;
        return actionResults;
    },
    playCard: (match, player, card, params, targets) => {
        //creating Play Card Action
        let actionResults = {};
        actionResults.cardId = card.id;

        let cardOwner = match.getPlayer(card.owner); //Cannot be MatchPlayer

        match.startPlayCard(cardOwner, card.id, true);

        return actionResults;
    },
    discardCard: (match, player, card, params, targets) => {
        let actionResults = {};

        switch(params.target) {
            case "SELF":
                actionResults.cardId = card.id;
                break;
            case "TARGET":
                actionResults.cardId = targets[0];
                break;
        }

        let cardToDiscard = match.matchCardRegistry.get(actionResults.cardId);
        actionResults.discardAction = player.discardCard(cardToDiscard);

        return actionResults;
    },
    restDon: (match, player, card, params) => {
        let actionResults = {};
        actionResults.donId = [];
        actionResults.player = params.player;

        let targetPlayer = player;
        if(params.player === "opponent") targetPlayer = match.getOpponentPlayer(player.id).currentMatchPlayer;

        const donAmount = params.amount;
        for(let i = 0; i < donAmount; i++) {
            //Find an exerted Don
            if(targetPlayer.inActiveDon.length > 0) {
                let donCard = targetPlayer.inActiveDon.pop();
                donCard.setState("DON_RESTED");
                targetPlayer.inExertenDon.push(donCard);
                actionResults.donId.push(donCard.id);
            } else {
                return actionResults;
            }
        }
        return actionResults;
    },
    target: (match, player, card, params) => {
        return params.target; // Return the target id
    }
};

module.exports = ServerAbility;