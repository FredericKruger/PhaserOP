const Match = require('./match');
const { CARD_STATES } = require('./match_card');
const { PLAY_CARD_STATES, CARD_TYPES, ATTACH_DON_TO_CHAR_STATES, MATCH_CONSTANTS, TARGET_ACTION } = require('./match_enums');
const MatchPlayer = require('./match_player')
const {AttackManager} = require('../managers/attack_manager');
const {MatchCard} = require('./match_card');
const PlayCardManager = require('../managers/play_card_manager');

//#region MATCH PHASES OBJECT
const MATCH_PHASES = Object.freeze({
    WAITING_TO_START: 'Waiting to Start',
    SETUP: 'Setup',
    MULLIGAN_PHASE: 'Mulligan Phase',
    PREPARING_FIRST_TURN: 'Setup Phase',
    REFRESH_PHASE: 'Refresh Phase',
    DRAW_PHASE: 'Draw Phase',
    DON_PHASE: 'Don Phase',
    MAIN_PHASE: 'Main Phase',
    ATTACK_PHASE: 'Main: Attack',
    BLOCK_PHASE: 'Main: Block',
    COUNTER_PHASE: 'Main: Counter',
    TRIGGER_PHASE: 'Main: Trigger'
});
//#endregion

class MatchState {

    //#region CONSTRUCTOR
    /**
     * Constructor on the Match State class
     * @param {Match} match 
     * @param {number} player1Id
     * @param {number} player2Id
     */
    constructor(match, player1Id, player2Id) {
        this.match = match;

        this.current_active_player = null;
        this.current_passive_player = null;
        this.current_phase = MATCH_PHASES.WAITING_TO_START;

        this.resolving_pending_action = false;
        this.pending_action = null;

        this.player1 = new MatchPlayer(player1Id);
        this.player2 = new MatchPlayer(player2Id);
    }
    //#endregion

    //#region DRAW FUNCTION
    /** Function that makes a player draw a number of cards
     * @param {number} numberCards - number of cards to be drawn
     * @param {MatchPlayer} player - player: either 'a' or 'b'
     * @return {Array<number>} returns a list of card ids that where drawn
     * Function will remove the number of cards from the deck and add it to the player and
     */
    drawCards(player, numberCards) {
        let cards = [];
        
        for(let i=0; i<numberCards; i++) { //Draw required cards
            let card = player.deck.draw(); //Remove from player deck
            cards.push(card); //Add to hand and return list
            player.inHand.push(card);
            card.setState(CARD_STATES.IN_HAND);
        }
        return cards;
    }
    //#endregion

    //#region MULLIGAN FUNCTIONS
    /** Function that mulligans the cards
     * @param {MatchPlayer} player - player object
     * @param {Array<number>} cards - list of card ids to be mulliganed
     */
    mulliganCards(player, cards) {
        let newCards = []; //Store the new cards

        //Draw new cards
        for(let i=0; i<cards.length; i++) 
            newCards.push(player.deck.draw());

        //Add the old cards to the deck
        for(let card of player.inHand) {
            card.setState(CARD_STATES.IN_DECK);
            player.deck.add(card);
        }


        //Empty the hand and add new cards
        player.inHand = [];
        for(let card of newCards){
            card.setState(CARD_STATES.IN_HAND);
            player.inHand.push(card);
        } 

        //reshuffle the deck
        player.deck.shuffle();

        return newCards;
    }
    //#endregion

    //#region SETUP FUNCTIONS
    /** Function that distributes cards in the life pool for the player 
     * @param {MatchPlayer} player - player object
     */
    addCardToLifeDeck(player) {
        let cards = [];
        for(let i=0; i<player.inLeaderLocation.cardData.life; i++) {
            let card = player.deck.draw();
            card.setState(CARD_STATES.IN_LIFEDECK);
            cards.push(card.id);
            player.inLifeDeck.push(card);
        }
        return cards;
    }
    //#endregion

    //#region REFRESH FUNCTIONS
    /** Function that returns all attached DON cards to the don Area
     * @param {MatchPlayer} player - player object
     */
    refreshDon(player) { //TODO handle cards attached
        let cards = [];
        let numberOfExertedDon = player.inExertenDon.length; //Need to save initial value or the loop will break
        for(let i=0; i<numberOfExertedDon; i++) {
            let card = player.inExertenDon.pop();
            card.setState(CARD_STATES.DON_ACTIVE);
            player.inActiveDon.push(card);
            cards.push(card.id);
        }
        return cards;
    }

    /** Function that refreshed all exerted charactes to active
     * @param {MatchPlayer} player - player object
     * @returns {Array<number>} - list of card ids that were refreshed
     */
    refreshCards(player) {
        let cards = [];
        for(let i=0; i<player.inCharacterArea.length; i++) {
            let card = player.inCharacterArea[i];
            if(card.state === CARD_STATES.IN_PLAY_RESTED || card.state === CARD_STATES.IN_PLAY_FIRST_TURN) {
                card.setState(CARD_STATES.IN_PLAY);
                cards.push(card.id);

                card.attachedDon = []; //Reset the attach don pointer
            }
        }
        if(!player.isFirstTurn && 
            (player.inLeaderLocation.state === CARD_STATES.IN_PLAY_RESTED || player.inLeaderLocation.state === CARD_STATES.IN_PLAY_FIRST_TURN)) {
            player.inLeaderLocation.setState(CARD_STATES.IN_PLAY);
            cards.push(player.inLeaderLocation.id);

            player.inLeaderLocation.attachedDon = []; //Reset the attach don pointer
        }
        if(player.inStageLocation!== null && player.inStageLocation.state === CARD_STATES.IN_PLAY_RESTED) {
            player.inStageLocation.setState(CARD_STATES.IN_PLAY);
            cards.push(player.inStageLocation.id);
        }
        return cards;
    }

    /** Function that refreshed all exerted charactes to active
     * @param {MatchPlayer} player - player object
     */
    resetCards(player) {
        for(let card of player.inCharacterArea) card.resetTurn();
        player.inLeaderLocation.resetTurn();
        if(player.inStageLocation) player.inStageLocation.resetTurn();
    }
    //#endregion

    //#region PHASE FUNCTIONS
    /** Start Draw Phase. First players do not draw a card on their first turn
     * @param {MatchPlayer} player
     */
    startDrawPhase(player) {
        let playerCards = [];
        if(!(player.isFirstPlayer && player.isFirstTurn)) {
            playerCards = this.drawCards(player, 1);
        }

        return playerCards;
    }

    /**
     * Function that runs the Don Phase
     * @param {MatchPlayer} player 
     */
    startDonPhase(player) {
        //During the don phase the player draws a certain amount of don cards from the pile to the don area
        let donCards = [];
        if(player.isFirstPlayer && player.isFirstTurn) { //If the player is the first player and its the firs turn only draw a single DON
            let donCard = player.inDon.pop();
            player.inActiveDon.push(donCard);
            donCards.push(donCard.id);
            donCard.setState(CARD_STATES.DON_ACTIVE);
        } else {
            //If not draw up to 2 cards if possible
            for(let i=0; i<2; i++) {
                if(player.inDon.length > 0) {
                    let donCard = player.inDon.pop();
                    player.inActiveDon.push(donCard);
                    donCards.push(donCard.id);
                    donCard.setState(CARD_STATES.DON_ACTIVE);
                }
            }
        }

        //Returns cards to the match
        return donCards;
    }
    //#endregion

    //#region PLAY CARD FUNCTIONS
    /** Function that determines if a card can be played
     * @param {MatchPlayer} player - player object
     * @param {number} cardId - card id
     */
    startPlayCard(player, cardId) {
        //Check the card cost and wether there are enough resources to play the card
        let card = player.inHand.find(card => card.id === cardId);
        let cardCost = card.cardData.cost;
        let availableActiveDon = player.inActiveDon.length;

        if(cardCost>availableActiveDon) return {actionResult: PLAY_CARD_STATES.NOT_ENOUGH_DON, actionInfos: {playedCard: cardId}};
        else {
            this.match.playCardManager = new PlayCardManager(card);
            let actionInfos = player.playCard(cardId);
            return {actionResult: PLAY_CARD_STATES.CARD_BEING_PLAYED, actionInfos: actionInfos};
        }
    }

    /** Function to check if card needs to replace another
     * @param {MatchPlayer} player - player object
     * @param {MatchCard} card - card id
     */
    startPlayReplaceCard(player, card) {
        if(card.cardData.card === CARD_TYPES.CHARACTER && player.inCharacterArea.length >= MATCH_CONSTANTS.MAX_CHARACTERS_IN_AREA) {
            let targetData = {
                targetAction: TARGET_ACTION.PLAY_CARD_ACTION,
                requiredTargets: 1,
                targets: [
                    {
                        minrequiredtargets: 0,
                        player: ["active"],
                        cardtypes: [CARD_TYPES.CHARACTER],
                        states: ["IN_PLAY", "IN_PLAY_RESTED", "IN_PLAY_FIRST_TURN"],
                        exclude: ["SELF"]
                    }
                ]
            }

            return {actionResult: PLAY_CARD_STATES.SELECT_REPLACEMENT_TARGET, actionInfos: {actionId: 'PLAY_' + card.id, playedCard: card.id, targetData: targetData}};
        }
        if(card.cardData.card === CARD_TYPES.STAGE && player.inStageLocation !== null) {
            let targetData = {
                targetAction: TARGET_ACTION.PLAY_CARD_REPLACE_ACTION,
                requiredTargets: 1,
                targets: [
                    {
                        minrequiredtargets: 0,
                        player: ["active"],
                        cardtypes: [CARD_TYPES.STAGE],
                        states: ["IN_PLAY"],
                        exclude: ["SELF"]
                    }
                ]
            }
            return {actionResult: PLAY_CARD_STATES.SELECT_REPLACEMENT_TARGET, actionInfos: {actionId: 'PLAY_' + card.id, playedCard: card.id, targetData: targetData}};
        }
        return {actionResult: PLAY_CARD_STATES.NO_REPLACEMENT, actionInfos: {}};
    }

    /** Function to check if card needs to replace another
     * @param {MatchPlayer} player - player object
     * @param {MatchCard} card - card id
     */
    startOnEventPlayCard(player, card) {
        if(!card.getAbilityByType("ON_PLAY")) {
            return {actionResult: PLAY_CARD_STATES.NO_ON_PLAY_EVENT, actionInfos: {}};
        }
        let onPlayAbility = card.getAbilityByType("ON_PLAY");

        if(!onPlayAbility.canActivate(card, this.current_phase)) return {actionResult: PLAY_CARD_STATES.NO_ON_PLAY_EVENT, actionInfos: {}};
        
        //If the ability needs targeting
        let targets = onPlayAbility.target;
        if(targets) {
            let cardData = card.cardData;
            let actionInfos = {actionId: 'EVENT_' + card.id, playedCard: card.id, ability: onPlayAbility.id, targetData: targets, optional:onPlayAbility.optional};
            return {actionResult: PLAY_CARD_STATES.ON_PLAY_EVENT_TARGETS_REQUIRED, actionInfos: actionInfos};
        } else {
            //Gather ability infos for the client
            let abilityResults = this.match.resolveAbility(player, card.id, onPlayAbility.id);
            return {actionResult: PLAY_CARD_STATES.EVENT_RESOLVED, ability: onPlayAbility.id,  abilityResults: abilityResults};
        }
    }

    /** Function that determines if a card can be played
     * @param {MatchPlayer} player - player object
     * @param {number} cardId - card id
     */
    playCard(player, card) {
        if(card.cardData.card === CARD_TYPES.CHARACTER) {
            return player.playCharacter(card, this.match.playCardManager.replacedCard);
        }

        if(card.cardData.card === CARD_TYPES.STAGE) {
            return player.playStage(card, this.match.playCardManager.replacedCard);
        }

        if(card.cardData.card === CARD_TYPES.EVENT) {
            return player.playEvent(card);
        }
    }

    /**Function to replace and play a card
     * @param {MatchPlayer} player - player object
     * @param {number} cardID - card id
     * @param {Array<number>} replacementTargets - list of card ids to be replaced
     */
    playReplaceCard(player, cardID, replacementTargets) {
        let card = player.inHand.find(card => card.id === cardID);

        let actionInfos = {};
        if(card.cardData.card === CARD_TYPES.CHARACTER) {
            actionInfos = player.playCharacter(cardID, true, replacementTargets);
        } else {
            actionInfos = player.playStage(cardID, true, replacementTargets);
        }

        //Once action complete reset the pending action
        this.cancelPlayCard(player);

        return {actionResult: PLAY_CARD_STATES.CARD_PLAYED, actionInfos: actionInfos};
    }

    /**Function to replace and play a card
     * @param {MatchPlayer} player - player object
     * @param {number} cardID - card id
     * @param {Array<number>} targets - list of card ids to be targetted
     */
    playEventCard(player, cardID, targets) {
        let card = player.inHand.find(card => card.id === cardID);

        //Gather ability infos for the client
        let actionInfos = player.playEvent(cardID);
        actionInfos.eventTargeting = true; //to tell the server that the targeting was used

        let abilityResults = null;
        for(let ability of card.abilities) {
            abilityResults = this.match.resolveAbility(player, cardID, ability.id, targets);
        }
        actionInfos.abilityResults = abilityResults;

        return {actionResult: PLAY_CARD_STATES.CARD_PLAYED, actionInfos: actionInfos};
    }
    //#endregion

    //#region ATTACH COUNTER TO CARD
    /** Function to attach a counter to a card
     * @param {MatchPlayer} player - player object
     * @param {number} counterID - counter card id
     * @param {number} cardID - card id
     */
    attachCounterToCharacter(player, counterID, characterID) {
        let counterCard = player.inHand.find(card => card.id === counterID);
        let characterCard = player.getCard(characterID);

        //remove countercard from hand
        player.removeCardFromHand(counterCard);
        characterCard.attachedCounter.push(counterCard);
    }
    //#endregion

    //#region ATTACH DON FUNCTIONS
    /** Function that handles attaching a don card to a character
     * @param {MatchPlayer} player - player object
     * @param {number} donID - don card id
     * @param {number} characterID - character card id
     */
    startAttachDonToCharacter(player, donID, characterID) {
        let donCard = player.inActiveDon.find(card => card.id === donID);

        if(donCard.state === CARD_STATES.DON_ACTIVE) {
            let characterCard = null;
            if(player.inLeaderLocation.id === characterID) characterCard = player.inLeaderLocation; //First look in the leader location
            else characterCard = player.inCharacterArea.find(card => card.id === characterID); //If not found then look in the character area

            //Attach the don card to the character and modify the state
            player.inActiveDon.filter(card => card.id !== donID);
            donCard.setState(CARD_STATES.DON_ATTACHED);
            player.inExertenDon.push(donCard);
            characterCard.attachedDon.push(donID);

            return {actionResult: ATTACH_DON_TO_CHAR_STATES.DON_ATTACHED, actionInfos: {attachedDonCard: donID, receivingCharacter: characterID}};
        } else {
            return {actionResult: ATTACH_DON_TO_CHAR_STATES.DON_NOT_READY, actionInfos: {attachedDonCard: donID, receivingCharacter: characterID}};
        }
    }
    //#endregion

    //#region ATTACK FUNCTIONS

    /** Function to declare the attack phase
     * @param {MatchPlayer} player - player object
     * @param {MatchCard} attacker - attacker card id
     */
    declareAttackPhase(player, attacker) {
        //Set the state of the card
        attacker.setState(CARD_STATES.IN_PLAY_ATTACKING);
    }  
    
    /** Function to resolve the attack
     * @param {Object} attackResults - attack results
     * @param {MatchCard} attacker - attacker card
     * @param {MatchCard} defender - defender
     * @param {MatchPlayer} attackingPlayer - attacking player
     * @param {MatchPlayer} defendingPlayer - defending player
     */
    resolveAttack(attackResults, attacker, defender, attackingPlayer, defendingPlayer) {
        //If the defender lost discard
        if(attackResults.defenderDestroyed) {
            attackResults.defenderAttachedCards = defendingPlayer.discardCard(defender);
        } else {
            //If the defender is a character
            defender.state = defender.previousState;
            attackResults.newDefenderState = defender.state;
        }

        //Set the attacker state to exerte
        attacker.state = CARD_STATES.IN_PLAY_RESTED;
        attackResults.newAttackerState = attacker.state;

        return attackResults;
    }

    /** Function to draw a card from the life deck if needed
     * @param {Object} attackResults - attack results 
     * @param {MatchPlayer} defendingPlayer - defending player
    */
    drawLifeDeckCard(attackResults, defendingPlayer) {
        if(attackResults.lostLeaderLife) {
            defendingPlayer.life--;

            //draw card from lifedeck
            let card = null;
            if(defendingPlayer.inLifeDeck.length>0) {
                card = defendingPlayer.inLifeDeck.pop();
                card.setState(CARD_STATES.BEING_PLAYED);
            }

            //Append card information
            attackResults.playerAlive = defendingPlayer.life>=0; 
            attackResults.lifeCard = card;
            attackResults.lifeCardData = {};
            if(card) {
                attackResults.lifeCardData.cardId = card.id; 
                attackResults.lifeCardData.cardData = card.cardData;
            }

            /*if(defendingPlayer.life < 0) {
                //End the game
                //TODO Create end game
            }*/
        }
        return attackResults;
    }

    /** Function to handle the cleanup of the counter cards in the defender
     * @param {MatchPlayer} defendingPlayer - defending player
     * @returns {Object}
     */
    attackCleanup(player) {
        return player.attackCleanup();
    }
    //#endregion

    //#region UTILITY FUNCTIONS
    /** Function to get a card from either player
     * @param {number} cardId - card id
     * @returns {MatchCard} - returns the card object
     */
    getCard(cardId) {
        let card = this.player1.getCard(cardId);
        if(card === undefined) card = this.player2.getCard(cardId);
        return card;
    }

    /** Function to check if there are any available blockers */
    hasAvailableBlockers() {
        let player = this.current_passive_player;
        return player.hasAvailableBlockers(this.current_phase);
    }
    //#endregion
}


module.exports = {
    MATCH_PHASES: MATCH_PHASES,
    MatchState: MatchState
};