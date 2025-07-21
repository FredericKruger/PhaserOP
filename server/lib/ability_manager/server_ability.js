
const MatchAura = require('../match_objects/match_aura');
const SelectionManager = require("../managers/selection_manager");
const TargetingManager = require("../managers/targeting_manager");
const MatchPlayer = require('../match_objects/match_player');

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
        this.currentActions = [...this.actions]; // Dynamic array of actions to execute

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
            case 'CHECK_TARGETS':
                if(condition.value) {
                    // Get all target actions from the ability
                    const targetActions = this.actions.filter(action => action.name === "target");
        
                    if(targetActions.length === 0) return true; // If no target actions, condition passes

                    // Check each target action to ensure at least one valid target exists
                    for(const targetAction of targetActions) {
                        const targetParams = targetAction.params.target;
                        
                        // Create a temporary targeting manager to check valid targets
                        const TargetingManager = require("../managers/targeting_manager");
                        const targetingManager = new TargetingManager(match);
                        
                        let hasValidTargets = false;
                        
                        // Check all possible targets based on the target parameters
                        hasValidTargets = match.findValidTargets(targetParams.targets);
                        
                        // If any target action has no valid targets, condition fails
                        if(!hasValidTargets) return false;
                    }
                    // All target actions have at least one valid target
                    return true;

                } else return true;
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
            case 'TOTAL_AVAILABLE_DON':
                if((cardPlayer.currentMatchPlayer.inActiveDon.length + cardPlayer.currentMatchPlayer.inExertenDon.length) >= condition.value) return true;
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
        let actionResults = {};
        for (let i = this.currentAction; i<this.currentActions.length; i++) {

            const action = this.currentActions[i];
            const func = serverAbilityActions[action.name];
            if (func) {
                let results = func(match, player, card, action.params, targets);
                results.actionIndex = i;

                this.currentAction++;

                if(action.name === "IF_THEN_ELSE") {
                    this.currentActions.splice(i + 1, 0, ...results.actionList);
                } else {
                    //this.currentAction++;
                    this.actionResults.push(results);

                    if(action.name === "target") {
                        actionResults = {
                            status: "TARGETING",
                            actionResults: this.actionResults,
                            targetData: results.targets
                        };
                        this.actionResults = [];
                        return actionResults;
                    } // Target action is not executed //Stop to start targeting
                    else if(action.name === "selectCards"){
                        actionResults = {
                            status: "SELECTING",
                            actionResults: this.actionResults
                        };
                        this.actionResults = [];
                        return actionResults;
                    } 
                }
            }
        }
    
        //If arrived at this stage it means it didnt leave for targeting anymore
        this.currentAction = 0;
        this.currentActions = [...this.actions];
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

    resetAction() {
        this.currentAction = 0;
        this.actionResults = []; // Reset action results
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
    //#region activeExertedDon
    /**
     * 
     * @param {Match} match 
     * @param {MatchPlayer} player 
     * @param {MatchCard} card 
     * @param {{
     *      player: 'owner' | 'opponent',
     *      amount: number
     * }} params
     * @returns 
     */
    activateExertedDon: (match, player, card, params) => {
        let actionResults = {name: "activateExertedDon"};
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
    //#endregion
    //#region addCounterToCard
    /**
     * 
     * @param {Match} match 
     * @param {MatchPlayer} player 
     * @param {MatchCard} card 
     * @param {{
     *      amount: number
     * }} params
     * @param {Array<integer>} targets 
     * @returns 
     */
    addCounterToCard: (match, player, card, params, targets) => {
        let actionResults = {name: "addCounterToCard"};
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
    //#endregion
    //#region addPowerToCard
    /**
     * 
     * @param {Match} match 
     * @param {MatchPlayer} player 
     * @param {MatchCard} card 
     * @param {{
     *      amount: number,
     *      duration: 'TURN' | 'GAME',
     *      target: 'SELF' | 'TARGET'
     * }} params
     * @param {Array<integer>} targets 
     * @returns 
     */
    addPowerToCard: (match, player, card, params, targets) => {
        let actionResults = {name: "addPowerToCard"};
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
    //#endregion
    //#region attachDonCard
    /**
     * 
     * @param {Match} match 
     * @param {MatchPlayer} player 
     * @param {MatchCard} card 
     * @param {{
     *      amount: number,
     *      target: 'SELF' | 'TARGET',
     *      pile: 'EXERTED' | 'ACTIVE'
     * }} params
     * @param {Object} targets 
     * @returns 
     */
    attachDonCard: (match, player, card, params, targets) => {
        let actionResults = {name: "attachDonCard"};
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
    //#endregion
    //#region block
    block: (match, player, card, params, targets) => {
        let actionResults = {name: "block"};
        actionResults.blockerID = card.id;
        // Blocker ability action
        match.attackManager.attack.switchDefender(card);
        //match.startBlockAttack(card.id);
        return actionResults;
    },
    //#endregion
    //#region changeCardState
    /**
     * 
     * @param {Match} match 
     * @param {MatchPlayer} player 
     * @param {MatchCard} card 
     * @param {{
     *     state: 'IN_PLAY_RESTED' | 'IN_PLAY_ACTIVE', 
     *     target: 'SELF' | 'TARGET'
     * }} params 
     * @param {Array<integer>} targets 
     * @returns 
     */
    changeCardState: (match, player, card, params, targets) => {
        let actionResults = {name: "changeCardState"};
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
    //#endregion
    //#region createAura
    /**
     * 
     * @param {Match} match 
     * @param {MatchPlayer} player 
     * @param {MatchCard} card 
     * @param {{
     *      target: 'SELF' | 'TARGET',
     *      aura: Object
     * }} params 
     * @param {Array<integer>} targets 
     * @returns 
     */
    createAura: (match, player, card, params, targets) => {
        let actionResults = {name: "createAura"};

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
    //#endregion
    //#region createSelectionManager
    /**
     * 
     * @param {Match} match 
     * @param {MatchPlayer} player 
     * @param {MatchCard} card 
     * @param {{
     *      amount: number,
     *      cardPool: 'DECK',
     * 
     * }} params 
     * @returns 
     */
    createSelectionManager: (match, player, card, params) => {
        let actionResults = {name: "createSelectionManager"};

        let selectedCards = [];
        let amount = params.amount;
        let cardPool = [];
        switch(params.cardPool) {
            case "DECK": 
                cardPool = player.deck.cards;
                break;
            default:
                cardPool = player.deck.cards;
                break;
        }

        let targetData = params.filter || {};
        const targetingManager = new TargetingManager(match);
        
        //Get the cards from the card Pool
        let currentCardIndex = 0;
        while(selectedCards.length < amount && currentCardIndex < cardPool.length) {
            for(let target of targetData)
                if(targetingManager.isValidTarget(cardPool[currentCardIndex], target, true)) 
                    selectedCards.push(cardPool[currentCardIndex]);
            currentCardIndex++;
        }

        //Remove from cardPool the selected Cards
        for(let i = 0; i < selectedCards.length; i++) {
            const cardIndex = cardPool.indexOf(selectedCards[i]);
            if(cardIndex > -1) {
                cardPool.splice(cardIndex, 1); 
            }
        }

        //Create a selection manager for the match
        let currentSelectionManager = new SelectionManager(match);
        currentSelectionManager.setCardPool(selectedCards);
        match.currentSelectionManager = currentSelectionManager;

        //Create Parameters
        actionResults.cardPool = selectedCards;

        return actionResults;
    },
    //#endregion
    //#region destroySelectionManager
    /**
     * 
     * @param {Match} match 
     * @param {MatchPlayer} player 
     * @param {MatchCard} card 
     * @returns 
     */
    destroySelectionManager: (match, player, card) => {
        let actionResults = {name: "destroySelectionManager"};

        console.log("Destroying selection manager");
        match.currentSelectionManager = null; //Remove the current selection manager from the match

        return actionResults;
    },
    //#endregion
    //#region discardCard
    /**
     * 
     * @param {Match} match 
     * @param {MatchPlayer} player 
     * @param {MatchCard} card 
     * @param {{
     *      target: 'SELF' | 'TARGET'
     * }} params 
     * @param {Array<integer>} targets 
     * @returns 
     */
    discardCard: (match, player, card, params, targets) => {
        let actionResults = {name: "discardCard"};

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
    //#endregion
    //#region drawCards
    /**
     * 
     * @param {Match} match 
     * @param {MatchPlayer} player 
     * @param {MatchCard} card 
     * @param {{
     *      cardPool: 'SELECTION' | 'DECK' | 'DISCARD',
     *      amount: number,
     *      reveal: boolean
     * }} params 
     * @returns 
     */
    drawCards: (match, player, card, params, targets) => {
        let actionResults = {name: "drawCards"};

        let cards = [];
        let amount = params.amount || 1;
        let cardPool = "";
        switch(params.cardPool) {
            case "SELECTION":
                let selectionIndex = params.selectionIndex;
                for(let i = 0; i < match.currentSelectionManager.selectedCards[selectionIndex].length; i++) {
                    //get Card from selection manager
                    let cardId = match.currentSelectionManager.selectedCards[selectionIndex][i]; //Get the first card from the selected cards
                    let cardToDraw = match.currentSelectionManager.cardPool.find(c => c.id === cardId); //Find the card in the card pool
                                        
                    cards.push(cardToDraw); //Add to hand and return list
                    player.inHand.push(cardToDraw);
                    cardToDraw.setState("IN_HAND");
                }
                cardPool = "DECK";
                break;
            case "DECK":
                cardToDraw = player.deck.draw(); //Remove from player deck
                cards.push(cardToDraw); //Add to hand and return list
                player.inHand.push(cardToDraw);
                cardToDraw.setState("IN_HAND");

                cardPool = "DECK";
                break;
            default:
                break;
        }

        actionResults.cardPool = cardPool;
        actionResults.reveal = params.reveal || false;
        actionResults.drawnCards = cards;

        return actionResults;
    },
    //#endregion
    //#region drawCardsToPanel
    /**
     * 
     * @param {Match} match 
     * @param {MatchPlayer} player 
     * @param {MatchCard} card 
     * @param {{
     *      player: 'opponent' | 'owner',
     *      amount: number
     * }} params 
     * @param {Object} targets 
     * @returns 
     */
    drawCardsToPanel: (match, player, card, params, targets) => {
        let actionResults = {name: "drawCardsToPanel"};

        actionResults.drawnCards = [];

        let targetPlayer = player;
        if(params.player === "opponent") targetPlayer = match.getOpponentPlayer(player.id).currentMatchPlayer;

        const drawAmount = params.amount;
        for(let i=0; i<targetPlayer.deck.cards.length; i++) {
            let card = targetPlayer.deck.cards[i];

            if(actionResults.drawCards.length < drawAmount) {
                actionResults.drawnCards.push({cardid: card.id, carddata: card.cardData});
            } else break;
        }

        return actionResults;
    },
    //#endregion
    //#region hideSelectionManager
    /**
     * 
     * @param {Match} match 
     * @param {MatchPlayer} player 
     * @param {MatchCard} card 
     * @returns 
     */
    hideSelectionManager: (match, player, card) => {
        return {name: "hideSelectionManager"};
    },
    //#endregion
    //#region IF_THEN_ELSE
    /**
     * 
     * @param {Match} match 
     * @param {MatchPlayer} player 
     * @returns 
     */
    IF_THEN_ELSE: (match, player, card, params) => {
        let actionResults = {name: "IF_THEN_ELSE"};

        //Check conditions
        let conditionResults = true;
        
        if(params.conditions) {
            for(let condition of params.conditions) {
                let conditionResult = false; //Reset condition result for each condition
                
                switch (condition.type) {
                    case "SELECTION_COUNT": {
                        const count = match.currentSelectionManager.selectedCards[condition.selectionIndex].length; //Get the first array of selected cards
                        
                        switch (condition.operator) {
                            case ">": 
                                conditionResult = count > condition.value;
                                break;
                            case ">=": 
                                conditionResult = count >= condition.value;
                                break;
                            case "=": 
                            case "==": 
                                conditionResult = count === condition.value;
                                break;
                            case "<=": 
                                conditionResult = count <= condition.value;
                                break;
                            case "<": 
                                conditionResult = count < condition.value;
                                break;
                            case "!=": 
                                conditionResult = count !== condition.value;
                                break;
                        }
                    }
                }

                if(!conditionResult) {
                    conditionResults = false;
                    break;
                }
            }
        }

        if(conditionResults) {
            //insert then actions behind this action
            console.log("IF_THEN_ELSE: Conditions met, executing then actions");
            actionResults.actionList = params.then;
        } else {
            //insert else actions behind this action
            console.log("IF_THEN_ELSE: Conditions not met, executing else actions");
            actionResults.actionList = params.else;
        }

        return actionResults;
    },
    //#endregion
    //#region moveCardsToDeck
    /**
     * 
     * @param {Match} match 
     * @param {MatchPlayer} player 
     * @param {MatchCard} card 
     * @param {{
     *      cardPool: 'SELECTION'
     *      selectionIndex: number,
    *       from: 'TOP' | 'BOTTOM',
    *       to: 'TOP' | 'BOTTOM'
     * }} params  
     * @returns 
     */
    moveCardsToDeck: (match, player, card, params) => {
        let actionResults = {name: "moveCardsToDeck"};

        let cardPool = [];
        switch(params.cardPool) {
            case "SELECTION":
                for(let i = 0; i < match.currentSelectionManager.selectedCards[params.selectionIndex].length; i++) {
                    //get Card from selection manager
                    let cardId = match.currentSelectionManager.selectedCards[params.selectionIndex][i]; //Get the first card from the selected cards
                    cardPool.push(match.currentSelectionManager.cardPool.find(c => c.id === cardId)); //Find the card in the card pool
                }
                break;
            default:
                break;
        }

        switch(params.to) {
            case "TOP":
                for(let i = cardPool.length-1; i < 0; i--) {
                    player.deck.cards.unshift(cardPool[i]); //Add to the top of the deck
                }
                break;
            case "BOTTOM":
            default:
                for(let i = 0; i < cardPool.length; i++) {
                    player.deck.cards.push(cardPool[i]); //Add to the bottom of the deck
                }
                break;
        }


        actionResults.from = params.from;
        actionResults.to = params.to;
        actionResults.numberOfCards = cardPool.length;

        return actionResults;
    },
    //#endregion
    //#region playCard
    /**
     * 
     * @param {Match} match 
     * @param {MatchPlayer} player 
     * @param {MatchCard} card 
     * @param {{
     *      target: 'TARGET' | 'SELF'
     * }} params 
     * @param {Array<integer>} targets 
     * @returns 
     */
    playCard: (match, player, card, params, targets) => {
        //creating Play Card Action
        let actionResults = {name: "playCard"};

        let cardToPlay = card;
        if(params.target === "TARGET") {
            cardToPlay = match.matchCardRegistry.get(targets[0]);
        } else if(params.target === "SELF") {
            cardToPlay = card;
        }
        
        actionResults.cardId = cardToPlay.id;

        let cardOwner = match.getPlayer(cardToPlay.owner); //Cannot be MatchPlayer

        match.startPlayCard(cardOwner, cardToPlay.id, true);

        return actionResults;
    },
    //#endregion
    //#region restDon
    /**
     * 
     * @param {Match} match 
     * @param {MatchPlayer} player 
     * @param {MatchCard} card 
     * @param {{
     *      player: 'owner' | 'player',
     *      amount: number
     * }} params 
     * @returns 
     */
    restDon: (match, player, card, params) => {
        let actionResults = {name: "restDon"};
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
    //#endregion
    //#region returnDonToDeck
    /**
     * 
     * @param {Match} match 
     * @param {MatchPlayer} player 
     * @param {MatchCard} card 
     * @param {{
     *      amount: number
     * }} params 
     * @returns 
     */
    returnDonToDeck: (match, player, card, params) => {
        let actionResults = {name: "returnDonToDeck"};
        actionResults.donId = [];
        actionResults.player = params.player;

        //Check if player is owner or opponent
        let targetPlayer = player;
        if(params.player === "opponent") targetPlayer = match.getOpponentPlayer(player.id).currentMatchPlayer;

        let donAmount = params.amount;
        while(donAmount > 0) {
            let currentDonId = null;

            //Start with exerted Dons
            for(let donCard of targetPlayer.inExertenDon) {
                if(donCard.state === "DON_RESTED") {
                    currentDonId = {id: donCard.id, location: "EXERTED"};
                    targetPlayer.inExertenDon.splice(targetPlayer.inExertenDon.indexOf(donCard), 1);
                    donCard.setState("DON_DECK");
                    targetPlayer.inDon.push(donCard);
                    break;
                }
            }

            //Continue with active Dons
            if(currentDonId === null) {
                for(let donCard of targetPlayer.inActiveDon) {

                    if(donCard.state === "DON_ACTIVE") {
                        currentDonId = {id: donCard.id, location: "ACTIVE"};
                        targetPlayer.inActiveDon.splice(targetPlayer.inActiveDon.indexOf(donCard), 1);
                        donCard.setState("DON_DECK");
                        targetPlayer.inDon.push(donCard);
                        break;
                    }
                }
            }

            if(currentDonId !== null) {
                actionResults.donId.push(currentDonId);
                donAmount--;
            }
        }

        return actionResults;
    },
    //#endregion
    //#region returnCardToHand
    /**
     * 
     * @param {Match} match 
     * @param {MatchPlayer} player 
     * @param {MatchCard} card 
     * @param {{
     *      target: 'TARGET' | 'SELF'
     * }} params 
     * @returns 
     */
    returnCardToHand: (match, player, card, params, targets) => {
        let actionResults = {name: "returnCardToHand"};

        let cardToReturn = card;
        if(params.target === "TARGET") 
            cardToReturn = match.matchCardRegistry.get(targets[0]);

        actionResults.cardId = cardToReturn.id;

        //Get the card owner
        let cardOwner = match.getPlayer(cardToReturn.owner).currentMatchPlayer; //Cannot be MatchPlayer

        //Remove the card from the card pool it currently is in
        if(cardOwner.characterAreaContains(cardToReturn)) {
            cardOwner.inCharacterArea.splice(cardOwner.inCharacterArea.indexOf(cardToReturn), 1);
        } else if(cardOwner.stageLocationContains(cardToReturn)) {
            cardOwner.inStageLocation = null;
        }
        cardToReturn.setState("IN_HAND");
        cardOwner.inHand.push(cardToReturn);

        return actionResults;
    },
    //#endregion
    //#region selectCards
    /**
     * 
     * @param {Match} match 
     * @param {MatchPlayer} player 
     * @param {MatchCard} card 
     * @param {{
     *      player: 'owner' | 'player',
     *      amount: number
     * }} params 
     * @returns 
     */
    selectCards: (match, player, card, params, targets) => {
        let actionResults = {name: "selectCards"};
        
        //Set the params to the server selection manager
        match.currentSelectionManager.setSelectionParams({
            target: params.target,
            amount: params.amount
        });

        //Prepare object to send to client
        actionResults.selectedTarget = params.target;
        actionResults.selectionText = params.selectionText || "Select Cards";
        actionResults.selectionAmount = params.amount || 1;
        actionResults.keepPreviousSelection = params.keepPreviousSelection !== undefined ? params.keepPreviousSelection : true;
        actionResults.orderCards = params.orderCards !== undefined ? params.orderCards : false;
        actionResults.confirmButtons = params.confirmButtons !== undefined ? params.confirmButtons : ["OK"];
        
        return actionResults;
    },
    //#endregion
    //#region target
    /**
     * 
     * @param {Match} match 
     * @param {MatchPlayer} player 
     * @param {MatchCard} card 
     * @param {Object} params 
     * @param {Object} targets 
     * @returns 
     */
    target: (match, player, card, params) => {
        return {
            name: "target",
            targets: params.target,
            playedCard: card.id,
            actionId: card.id
        }; // Return the target id
    },
    //#endregion
    //#region debug
    debug: (match, player, card, params) => {
        console.log("debug");
        return {
            name: "debug"
        };
    }
};

module.exports = ServerAbility;