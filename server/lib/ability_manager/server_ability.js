
const MatchAura = require('../match_objects/match_aura');
const SelectionManager = require("../managers/selection_manager");
const TargetingManager = require("../managers/targeting_manager");
const MatchPlayer = require('../match_objects/match_player');
const { CARD_STATES } = require('../match_objects/match_card');
const ConditionEvaluator = require('../utils/condition_evaluator');


class ServerAbility {

    constructor(config, cardId, matchId) {
        this.id = config.id;
        this.cardId = cardId;
        this.matchId = matchId;

        this.text = config.text;
        this.type = config.type;
        //this.phases = config.phases || []; // When this ability can be triggered
        this.conditions = config.conditions || []; // Array of conditions that must be met
        //this.states = config.states || []; // Array of states that must be met

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

        // Ability metadata
        this.up_toStack = [];
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
        /*if (this.phases.length > 0 && !this.phases.includes(gameState)) {
            return false;
        }*/

       //console.log('Checking states', this.states, card.state, card.id);
        /*if (this.states.length > 0 && !this.states.includes(card.state)) {
            return false;
        }*/

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
            case 'PHASES':
                return condition.value.includes(gameState);
            case 'PLAYER_TURN':
                if(cardPlayer.id === match.state.current_active_player.id && condition.value) return true;
                return false;
            case 'PLAYED_THIS_TURN':
                if(card.turnPlayed === match.state.current_turn && condition.value) return true;
                if(card.turnPlayed !== match.state.current_turn && !condition.value) return true;
                return false;
            case 'STATES':
                return condition.value.includes(card.state);
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
                //Certain actions will require to send animations already to the server
                if(action.name === "playCard" && this.actionResults.length>0) {
                    actionResults = {
                        status: "WAIT_FOR_ANIMATION",
                        actionResults: this.actionResults
                    };
                    this.actionResults = [];
                    return actionResults;
                }

                let results = func(match, player, card, this, action.params, targets);
                results.actionIndex = i;

                this.currentAction++;

                //Test if the game ended, stop the animation and start game end process
                if(results.gameEnded && results.gameEnded === true) {
                    actionResults = {
                        status: "GAME_OVER",
                        actionResults: this.actionResults
                    };
                    this.actionResults = []; // Reset action results
                }

                if(action.name === "IF_THEN_ELSE") {
                    this.currentActions.splice(i + 1, 0, ...results.actionList);
                } else if(action.name === "UP_TO") {
                    let up_to_id = this.currentActions[i].params.id;
                    let up_to = this.up_toStack.find(a => a.id === up_to_id);
                    
                    if(results.continue) {
                        results.actionList.push(
                            {name: "UP_TO_NEXT", params: {"id": up_to_id}}
                        );
                        this.currentActions.splice(i + 1, 0, ...results.actionList);
                    }
                    else {
                        this.up_toStack.splice(this.up_toStack.indexOf(up_to), 1); //Remove the up_to from the stack
                    }
                } else if(action.name === "UP_TO_NEXT") {
                    let up_to_id = this.currentActions[i].params.id;
                    let up_to = this.up_toStack.find(a => a.id === up_to_id);
                    //remove all actions between i and up_to.startIndex from this.currentActions
                    this.currentActions.splice(up_to.startIndex+1, i - up_to.startIndex);
                    i = up_to.startIndex-1; // Set the current action to the index of the next action
                } else {
                    this.actionResults.push(results);

                    if(action.name === "target") {

                        actionResults = {
                            status: "TARGETING",
                            actionResults: this.actionResults,
                            targetData: results.targets,
                            optional: results.targets.optional === undefined ? false : results.targets.optional
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
                    else if(action.name === "playCard") {
                        actionResults = {
                            status: "WAIT_FOR_ANIMATION",
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
                if(!action.params.target.ignoreTesting) targets.push(action.params.target);
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
     * @param {ServerAbility} ability
     * @param {{
     *      player: 'owner' | 'opponent',
     *      amount: number
     * }} params
     * @returns 
     */
    activateExertedDon: (match, player, card, ability, params) => {
        let actionResults = {name: "activateExertedDon"};
        actionResults.donId = [];
        actionResults.player = params.player;

        let targetPlayer = player;
        if(params.player === "OPPONENT") targetPlayer = match.getOpponentPlayer(player.id).currentMatchPlayer;

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
    //#region addActiveDonFromDeck
    /**
     * 
     * @param {Match} match 
     * @param {MatchPlayer} player 
     * @param {MatchCard} card 
     * @param {ServerAbility} ability
     * @param {{
     *      amount: number,
     *      player: 'PLAYER'|'OPPONENT',
     * }} params
     * @returns 
     */
    addActiveDonFromDeck: (match, player, card, ability, params) => {
        let actionResults = {name: "addActiveDonFromDeck"};

        actionResults.donId = [];
        actionResults.player = params.player;

        //Check if player is owner or opponent
        let targetPlayer = player;
        if(params.player === "OPPONENT") targetPlayer = match.getOpponentPlayer(player.id).currentMatchPlayer;

        for(let i=0; i<params.amount; i++) {
            if(targetPlayer.inDon.length > 0) {
                let donCard = targetPlayer.inDon.pop();
                donCard.setState("DON_ACTIVE");
                targetPlayer.inActiveDon.push(donCard);
                actionResults.donId.push(donCard.id);
            } else {
                break;
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
     * @param {ServerAbility} ability
     * @param {{
     *      amount: number,
     *      target: 'TARGET',
     * }} params
     * @param {Array<integer>} targets 
     * @returns 
     */
    addCounterToCard: (match, player, card, ability, params, targets) => {
        let actionResults = {name: "addCounterToCard"};
        actionResults.defenderId = -1;
        actionResults.counterAmount = 0;

        //find defender
        const counterAmount = params.amount;
        let defender = null; 
        switch(params.target) {
            case "TARGET":
            default: 
                defender = match.state.getCard(targets[0]);
                break;
        }

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
     * @param {ServerAbility} ability
     * @param {{
     *      amount: number,
     *      duration: 'TURN' | 'GAME',
     *      target: 'SELF' | 'TARGET'
     * }} params
     * @param {Array<integer>} targets 
     * @returns 
     */
    addPowerToCard: (match, player, card, ability, params, targets) => {
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
     * @param {ServerAbility} ability
     * @param {{
     *      amount: number,
     *      target: 'SELF' | 'TARGET',
     *      pile: 'EXERTED' | 'ACTIVE'
     * }} params
     * @param {Object} targets 
     * @returns 
     */
    attachDonCard: (match, player, card, ability, params, targets) => {
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
    block: (match, player, card, ability, params, targets) => {
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
     * @param {ServerAbility} ability
     * @param {{
     *     state: 'IN_PLAY_RESTED' | 'IN_PLAY_ACTIVE', 
     *     target: 'SELF' | 'TARGET'
     * }} params 
     * @param {Array<integer>} targets 
     * @returns 
     */
    changeCardState: (match, player, card, ability, params, targets) => {
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
     * @param {ServerAbility} ability
     * @param {{
     *      target: 'SELF' | 'TARGET',
     *      aura: Object
     * }} params 
     * @param {Array<integer>} targets 
     * @returns 
     */
    createAura: (match, player, card, ability, params, targets) => {
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
     * @param {ServerAbility} ability
     * @param {{
     *      amount: number,
     *      cardPool: 'DECK' | 'DISCARD',
     * 
     * }} params 
     * @returns 
     */
    createSelectionManager: (match, player, card, ability, params) => {
        let actionResults = {name: "createSelectionManager"};

        let selectedCards = [];
        let amount = params.amount || -1;
        let uniquesOnly = params.uniquesOnly || false;
        let cardPool = [];
        switch(params.cardPool) {
            case "DECK": 
                cardPool = player.deck.cards;
                break;
            case "DISCARD":
                cardPool = player.inDiscard;
                break;
            default:
                cardPool = player.deck.cards;
                break;
        }

        let targetData = params.filter || {};
        const targetingManager = new TargetingManager(match);
        
        //Get the cards from the card Pool
        let currentCardIndex = 0;
        while((amount===-1 || selectedCards.length < amount) && currentCardIndex < cardPool.length) {
            for(let target of targetData) {
                if(targetingManager.isValidTarget(cardPool[currentCardIndex], target, true)) {
                    //Keep all matching cards except if uniques are required
                    if(
                        !uniquesOnly
                        || !selectedCards.some(selectedCard => selectedCard.cardData.id === cardPool[currentCardIndex].cardData.id)
                    ) selectedCards.push(cardPool[currentCardIndex]);
                } 
            }
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
        currentSelectionManager.setCardPool(selectedCards, params.cardPool);
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
     * @param {ServerAbility} ability
     * @returns 
     */
    destroySelectionManager: (match, player, card, ability) => {
        let actionResults = {name: "destroySelectionManager"};

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
     * @param {ServerAbility} ability
     * @param {{
     *      target: 'SELF' | 'TARGET'
     * }} params 
     * @param {Array<integer>} targets 
     * @returns 
     */
    discardCard: (match, player, card, ability, params, targets) => {
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
     * @param {ServerAbility} ability
     * @param {{
     *      cardPool: 'SELECTION' | 'DECK' | 'DISCARD',
     *      amount: number,
     *      reveal: boolean
     * }} params 
     * @returns 
     */
    drawCards: (match, player, card, ability, params, targets) => {
        let actionResults = {name: "drawCards"};

        let cards = [];
        let amount = params.amount || 1;
        let cardPool = "";

        if(params.cardPool === "DECK") {
            for(let i = 0; i < amount; i++) {
                if(player.deck.cards.size > 0) {
                    let cardToDraw = player.deck.draw(); //Remove from player deck
                    cards.push(cardToDraw); //Add to hand and return list
                    player.inHand.push(cardToDraw);
                    cardToDraw.setState("IN_HAND");
                } else {
                    //If no cards left in deck, stop drawing
                    actionResults.gameEnded = true;
                    break;
                }
            }
            cardPool = "DECK";
        } else if(params.cardPool.startsWith("SELECTION")) {
            let selectionIndex = parseInt(params.cardPool.split("[")[1].split("]")[0]);
            for(let i = 0; i < match.currentSelectionManager.selectedCards[selectionIndex].length; i++) {
                //get Card from selection manager
                let cardId = match.currentSelectionManager.selectedCards[selectionIndex][i]; //Get the first card from the selected cards
                let cardToDraw = match.currentSelectionManager.cardPool.find(c => c.id === cardId); //Find the card in the card pool
                                    
                cards.push(cardToDraw); //Add to hand and return list
                player.inHand.push(cardToDraw);
                cardToDraw.setState("IN_HAND");
            }
            cardPool = "DECK";
        }

        actionResults.cardPool = cardPool;
        actionResults.reveal = params.reveal || false;
        actionResults.drawnCards = cards;

        return actionResults;
    },
    //#endregion
    //#region drawCardAnimation
    /**
     * 
     * @param {Match} match 
     * @param {MatchPlayer} player 
     * @param {MatchCard} card 
     * @param {ServerAbility} ability
     * @param {{
     *      target: 'SELECTION'
     * }} params 
     * @param {Object} targets 
     * @returns 
     */
    drawCardAnimation: (match, player, scene, ability, params, targets) => {
        let actionResults = {name: "drawCardAnimation"};

        let cards = [];
        let cardPool = "";
        if(params.target.startsWith("SELECTION")) {
            let selectionIndex = parseInt(params.target.split("[")[1].split("]")[0]);
            for(let i = 0; i < match.currentSelectionManager.selectedCards[selectionIndex].length; i++) {
                //get Card from selection manager
                let cardId = match.currentSelectionManager.selectedCards[selectionIndex][i]; //Get the first card from the selected cards
                let cardToDraw = match.currentSelectionManager.cardPool.find(c => c.id === cardId); //Find the card in the card pool
                                    
                cards.push(cardToDraw); //Add to hand and return list
            }
            cardPool = "DECK";
        }

        actionResults.cardPool = cardPool;
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
     * @param {ServerAbility} ability
     * @param {{
     *      player: 'OPPONENT' | 'PLAYER',
     *      amount: number
     * }} params 
     * @param {Object} targets 
     * @returns 
     */
    drawCardsToPanel: (match, player, card, ability, params, targets) => {
        let actionResults = {name: "drawCardsToPanel"};

        actionResults.drawnCards = [];

        let targetPlayer = player;
        if(params.player === "OPPONENT") targetPlayer = match.getOpponentPlayer(player.id).currentMatchPlayer;

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
     * @param {ServerAbility} ability 
     * @param {{
     *      returnCardsToPool: Array<'CARD_POOL' | 'REMAINING_CARDS'>
     * }}
     * @returns 
     */
    hideSelectionManager: (match, player, card, ability, params) => {
        if(params.returnCardsToDeck && match.currentSelectionManager) {
            for(let cardsType of params.returnCardsToDeck){
                let cardPool = [];
                //Determine the card pool from which to return the cards to
                switch(cardsType) {
                    case "CARD_POOL":
                        cardPool = match.currentSelectionManager.cardPool;
                        break;
                    case "REMAINING_CARDS":
                        cardPool = match.currentSelectionManager.remainingCards;
                        break;
                }
                //For each card in the pool
                for(let card of cardPool){
                    //REmove it from the selected Pool
                    const cardIndex = cardPool.indexOf(card);
                    if(cardIndex > -1) {
                        cardPool.splice(cardIndex, 1); 
                    }
                    //Return the card to the card pool of origin
                    switch(match.currentSelectionManager.cardPoolOrigin) {
                        case "DECK":
                            player.deck.cards.push(card);
                            break;
                        case "DISCARD":
                            player.inDiscard.push(card);
                            break;
                        default: 
                            player.deck.cards.push(card);   
                            break;
                    }
                }
            }
        }
        return {name: "hideSelectionManager"};
    },
    //#endregion
    //#region IF_THEN_ELSE
    /**
     * 
     * @param {Match} match 
     * @param {MatchPlayer} player 
     * @param {MatchCard} card
     * @param {ServerAbility} ability
     * @param {Object} params
     * @param {Array} targets
     * @returns 
     */
    IF_THEN_ELSE: (match, player, card, ability, params, targets) => {
        let actionResults = {name: "IF_THEN_ELSE"};

        //Check conditions
        const context = ConditionEvaluator.createContext({
            match,
            player,
            card,
            targets
        });
    
        const conditionResults = ConditionEvaluator.evaluateConditions(params.if, context);

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
     * @param {ServerAbility} ability
     * @param {{
     *      cardPool: 'SELECTION' | 'TARGET'
    *       from: 'DECK_TOP' | 'DECK_BOTTOM' | 'CHARACTER_AREA' | 'HAND',
    *       to: 'DECK_TOP' | 'DECK_BOTTOM'
     * }} params  
     * @returns 
     */
    moveCardsToDeck: (match, player, card, ability, params, targets) => {
        let actionResults = {name: "moveCardsToDeck"};

        // Get the cards from the cardpool
        let cardPool = [];
        if(params.cardPool === "TARGET") {
            for(let i = 0; i < targets.length; i++) {
                let cardToReturn = match.matchCardRegistry.get(targets[i]);
                let cardOwner = match.getPlayer(cardToReturn.owner).currentMatchPlayer; //Cannot be MatchPlayer

                if(cardOwner.characterAreaContains(cardToReturn)) {
                    cardOwner.inCharacterArea.splice(cardOwner.inCharacterArea.indexOf(cardToReturn), 1);
                } else if(cardOwner.stageLocationContains(cardToReturn)) {
                    cardOwner.inStageLocation = null;
                } else if(cardOwner.inHand.includes(cardToReturn)) {
                    cardOwner.inHand.splice(cardOwner.inHand.indexOf(cardToReturn), 1);
                }
                cardPool.push(cardToReturn);
            }
        } else if(params.cardPool.startsWith("SELECTION")) {
            //extract the selection index from the params.cardPool in the shape of SELECTION[index]
            let selectionIndex = parseInt(params.cardPool.split("[")[1].split("]")[0]);
            //Make sure selectionIndex is valid. default should take index 0
            if(isNaN(selectionIndex) || selectionIndex < 0 || selectionIndex >= match.currentSelectionManager.selectedCards.length) {
                selectionIndex = 0;
            }

            for(let i = 0; i < match.currentSelectionManager.selectedCards[selectionIndex].length; i++) {
                //get Card from selection manager
                let cardId = match.currentSelectionManager.selectedCards[selectionIndex][i]; //Get the first card from the selected cards
                cardPool.push(match.currentSelectionManager.cardPool.find(c => c.id === cardId)); //Find the card in the card pool
            }
            params.cardPool = "SELECTION";
        }

        //Remove the card from the card pool it currently is in
        //Get destionation
        let toDestination = "";
        if(params.to.startsWith("SELECTION_DESTINATION")) {
            let selectionIndex = parseInt(params.to.split("[")[1].split("]")[0]);
            toDestination = match.currentSelectionManager.selectedCardsDestinations[selectionIndex];
        } else {
            toDestination = params.to;
        }

        //Send the cards to the right place
        switch(toDestination) {
            case "DECK_TOP":
                for(let i = cardPool.length-1; i < 0; i--) {
                    player.deck.cards.unshift(cardPool[i]); //Add to the top of the deck
                }
                break;
            case "DECK_BOTTOM":
            default:
                for(let i = 0; i < cardPool.length; i++) {
                    player.deck.cards.push(cardPool[i]); //Add to the bottom of the deck
                }
                break;
        }

        actionResults.cardPool = params.cardPool;
        actionResults.cardIds = cardPool.map(card => card.id); //Return the ids of the cards moved
        actionResults.from = params.from;
        actionResults.to = toDestination;
        actionResults.numberOfCards = cardPool.length;

        return actionResults;
    },
    //#endregion
    //#region moveCardsToHand
    /**
     * 
     * @param {Match} match 
     * @param {MatchPlayer} player 
     * @param {MatchCard} card 
     * @param {ServerAbility} ability
     * @param {{
     *      cardPool: 'SELECTION' | 'TARGET',
     *      from: 'DISCARD'
     * }} params 
     * @param {Array<integer>} targets 
     * @returns 
     */
    moveCardsToHand: (match, player, card, ability, params, targets) => {
        //creating Play Card Action
        let actionResults = {name: "moveCardsToHand"};

        // Get the cards from the cardpool
        let cardPool = [];
        if(params.cardPool.startsWith("SELECTION")) {
            //extract the selection index from the params.cardPool in the shape of SELECTION[index]
            let selectionIndex = parseInt(params.cardPool.split("[")[1].split("]")[0]);
            //Make sure selectionIndex is valid. default should take index 0
            if(isNaN(selectionIndex) || selectionIndex < 0 || selectionIndex >= match.currentSelectionManager.selectedCards.length) {
                selectionIndex = 0;
            }

            for(let i = 0; i < match.currentSelectionManager.selectedCards[selectionIndex].length; i++) {
                //get Card from selection manager
                let cardId = match.currentSelectionManager.selectedCards[selectionIndex][i]; //Get the first card from the selected cards
                cardPool.push(match.currentSelectionManager.cardPool.find(c => c.id === cardId)); //Find the card in the card pool
            }
        }

        for(let card of cardPool) {
            player.inHand.push(card); //Add to hand
        }

        actionResults.cardPool = cardPool;
        actionResults.from = params.from;
        return actionResults;
    },
    //#endregion
    //#region playCard
    /**
     * 
     * @param {Match} match 
     * @param {MatchPlayer} player 
     * @param {MatchCard} card
     * @param {ServerAbility} ability 
     * @param {{
     *      target: 'TARGET' | 'SELF' | 'SELECTION'
     * }} params 
     * @param {Array<integer>} targets 
     * @returns 
     */
    playCard: (match, player, card, ability, params, targets) => {
        //creating Play Card Action
        let actionResults = {name: "playCard"};

        let cardToPlay = card;
        if(params.target === "TARGET") {
            cardToPlay = match.matchCardRegistry.get(targets[0]);
        } else if(params.target === "SELF") {
            cardToPlay = card;
        } else if(params.target.startsWith("SELECTION")) {
            let selectionIndex = parseInt(params.target.split("[")[1].split("]")[0]);
            let cardId = match.currentSelectionManager.selectedCards[selectionIndex][0]; //Get the first card from the selected cards
            cardToPlay = match.currentSelectionManager.cardPool.find(c => c.id === cardId);
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
     * @param {ServerAbility} ability
     * @param {{
     *      player: 'PLAYER' | 'OPPONENT',
     *      amount: number
     * }} params 
     * @returns 
     */
    restDon: (match, player, card, ability, params) => {
        let actionResults = {name: "restDon"};
        actionResults.donId = [];
        actionResults.player = params.player;

        let targetPlayer = player;
        if(params.player === "OPPONENT") targetPlayer = match.getOpponentPlayer(player.id).currentMatchPlayer;

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
     * @param {ServerAbility} ability
     * @param {{
     *      amount: number,
     *      player: 'PLAYER'|'OPPONENT'
     * }} params 
     * @returns 
     */
    returnDonToDeck: (match, player, card, ability, params) => {
        let actionResults = {name: "returnDonToDeck"};
        actionResults.donId = [];
        actionResults.player = params.player;

        //Check if player is owner or opponent
        let targetPlayer = player;
        if(params.player === "OPPONENT") targetPlayer = match.getOpponentPlayer(player.id).currentMatchPlayer;

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
    //#region returnCardToDeck
    /**
     * 
     * @param {Match} match 
     * @param {MatchPlayer} player 
     * @param {MatchCard} card
     * @param {ServerAbility} ability 
     * @param {{
     *      target: 'TARGET' | 'SELF',
     *      to: 'BOTTOM' | 'TOP'
     * }} params 
     * @returns 
     */
    returnCardToDeck: (match, player, card, ability, params, targets) => {
        let actionResults = {name: "returnCardToDeck"};

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
        } else if(cardOwner.inHand.includes(cardToReturn)) {
            cardOwner.inHand.splice(cardOwner.inHand.indexOf(cardToReturn), 1);
        }

        cardToReturn.setState("IN_DECK");
        if(params.to){
            if(params.to === "TOP")
                cardOwner.deck.cards.unshift(cardToReturn);
            else if(params.to === "BOTTOM")
                cardOwner.deck.cards.push(cardToReturn);
        } else 
            cardOwner.deck.cards.push(cardToReturn);

        return actionResults;
    },
    //#endregion
    //#region returnCardToHand
    /**
     * 
     * @param {Match} match 
     * @param {MatchPlayer} player 
     * @param {MatchCard} card 
     * @param {ServerAbility} ability
     * @param {{
     *      target: 'TARGET' | 'SELF'
     * }} params 
     * @returns 
     */
    returnCardToHand: (match, player, card, ability, params, targets) => {
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
     * @param {ServerAbility} ability
     * @param {{
     *      player: 'owner' | 'player',
     *      amount: number
     * }} params 
     * @returns 
     */
    selectCards: (match, player, card, ability, params, targets) => {
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
    //#region shuffleDeck
    /**
     * 
     * @param {Match} match 
     * @param {MatchPlayer} player 
     * @param {MatchCard} card 
     * @param {ServerAbility} ability
     * @param {Object} params 
     * @returns 
     */
    shuffleDeck: (match, player, card, ability, params) => {
        let actionResults = {name: "shuffleDeck"};

        player.deck.shuffle();

        return actionResults;
    },
    //#endregion
    //#region target
    /**
     * 
     * @param {Match} match 
     * @param {MatchPlayer} player 
     * @param {MatchCard} card 
     * @param {ServerAbility} ability
     * @param {Object} params 
     * @param {Object} targets 
     * @returns 
     */
    target: (match, player, card, ability, params) => {
        return {
            name: "target",
            targets: params.target,
            playedCard: card.id,
            actionId: card.id
        }; // Return the target id
    },
    //#endregion
    //#region UP_TO
    UP_TO: (match, player, card, ability, params, targets) => {
        let actionResults = {name: "UP_TO"};
        console.log("UP_TO");

        const context = ConditionEvaluator.createContext({
            match,
            player,
            card,
            targets
        });
    
        let conditionResults = ConditionEvaluator.evaluateConditions(params.while, context);
    
        // Test if it's the first call
        if(ability.up_toStack.find(a => a.id === params.id) === undefined) {
           ability.up_toStack.push({
                id: params.id,
                from: 0,
                startIndex: ability.currentAction,
                stopped: false
           }); 
        }
        let up_to = ability.up_toStack.find(a => a.id === params.id);
        conditionResults = conditionResults && up_to.from < params.to && !up_to.stopped;

        console.log("continue? ", conditionResults);
        if(conditionResults) {
            //insert then actions behind this action
            actionResults.actionList = params.do;
            actionResults.continue = true;
        } else {
            actionResults.actionList = [];
            actionResults.continue = false;
        }
        
        return actionResults;
    },
    //#endregion
    //#region UP_TO_NEXT
    UP_TO_NEXT: (match, player, card, ability, params,) => {
        let actionResults = {name: "UP_TO_NEXT"};
        return actionResults;
    },
    //#endregion
    //#region UP_TO_INC
    UP_TO_INC: (match, player, card, ability, params,) => {
        let actionResults = {name: "UP_TO_INC"};
        ability.up_toStack.find(a => a.id === params.id).from++;
        return actionResults;
    },
    //#endregion
    //#region debug
    debug: (match, player, card, ability, params) => {
        console.log(params.text);
        return {
            name: "debug"
        };
    }
};

module.exports = ServerAbility;