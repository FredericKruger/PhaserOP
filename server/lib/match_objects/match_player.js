const { MatchFlags } = require('../managers/state_manager.js');
const { MatchDonCard, MatchCard } = require('./match_card.js');
const MatchDeck = require('./match_deck.js');
const { CARD_STATES } = require('./match_card.js');

class MatchPlayer {

    constructor(id, matchId) {
        this.id = id;
        this.matchId = matchId;

        /** @type {number} */
        this.life = 0;

        /** @type {MatchDeck} */
        this.deck = null;

        /** @type {Array<MatchCard>} */
        this.inHand = [];
        /** @type {MatchCard} */
        this.inStageLocation = null;
        /** @type {MatchCard} */
        this.inLeaderLocation = null;
        /** @type {Array<MatchCard>} */
        this.inCharacterArea = [];
        /** @type {Array<MatchCard>} */
        this.inDiscard = [];
        /** @type {Array<MatchDonCard} */
        this.inDon = [];
        /** @type {Array<MatchDonCard} */
        this.inActiveDon = [];
        /** @type {Array<MatchDonCard} */
        this.inExertenDon = [];
        /** @type {Array<MatchCard>} */
        this.inLifeDeck = [];

        this.isFirstTurn = true;
        this.isFirstPlayer = false;

        this.matchFlags = new MatchFlags();

        this.deck = new MatchDeck();
    }

    /** Function that removes a card from the hand 
     * @param {MatchCard} Card - card to be removed
    */
    removeCardFromHand(card) {
        this.inHand = this.inHand.filter(c => c.id !== card.id);
    }

    /** Function that removes a card from the hand 
     * @param {MatchCard} Card - card to be removed
    */
    removeCardFromCharacterArea(card) {
        this.inCharacterArea = this.inCharacterArea.filter(c => c.id !== card.id);
    }

    /** Function that return a card from the player from the card id
     * @param {number} cardid - ID of the card to be returned
     * @return {MatchCard} - Card to be returned
     */
    getCard(cardid) {
        let card = this.inHand.find(c => c.id === cardid);
        if(card === undefined) card = this.inCharacterArea.find(c => c.id === cardid);
        if(card === undefined) card = this.inDiscard.find(c => c.id === cardid);
        if(card === undefined) card = this.inLifeDeck.find(c => c.id === cardid);

        if(card === undefined) this.inLeaderLocation === null ? card = undefined : card = this.inLeaderLocation.id === cardid ? this.inLeaderLocation : undefined;
        if(card === undefined) this.inStageLocation === null ? card = undefined : card = this.inStageLocation.id === cardid ? this.inStageLocation : undefined;

        return card;
    }

    /** Function that return a card from the player from the card id
     * @param {number} cardid - ID of the card to be returned
     * @return {MatchDonCard} - Card to be returned
     */
    getDonCard(cardid) {
        let card = this.inDon.find(c => c.id === cardid);
        if(card === undefined) card = this.inActiveDon.find(c => c.id === cardid);
        if(card === undefined) card = this.inExertenDon.find(c => c.id === cardid);
        return card;
    }

    /** Function that returns a card from Hand from the card id
     * @param {number} cardid - ID of the card to be returned
     */
    getCardFromHand(cardid) {return this.inHand.find(c => c.id === cardid);}

    /** Function that fills the Don Deck at setup 
     * @param {number} amount - amount of cards to be added to deck
     * @param {number} startID - starting ID for the cards
     * @param {string} player - player object
    */
    fillDonDeck(amount, startID, player) {
        for(let i=0; i<amount; i++) {
            this.inDon.push(new MatchDonCard(startID));
            startID++;
        }
        return startID;
    }

    //#region PLAY CARD
    /** Function that plays the card and spends the required DON 
     * @param {number} cardID - ID of the card to be played
     * @param {boolean} event - flag to indicate if the card is an event
    */
    playCard(cardID, event = false) {
        let match = matchRegistry.get(this.matchId); //Get the match
        let card = match.matchCardRegistry.get(cardID);

        card.setState(CARD_STATES.BEING_PLAYED); //Set the state to being played
        card.turnPlayed = match.state.current_turn; //Set the turn played

        //Remove the resources from the active don if it's not played as part of an event
        let donIDs = [];
        if(!event) {
            for(let i=0; i<card.cardData.cost; i++) {
                let donCard = this.inActiveDon.pop();
                donCard.setState(CARD_STATES.DON_RESTED);
                this.inExertenDon.push(donCard);
                donIDs.push(donCard.id);
            }
        }

        return {playedCard: cardID, playedCardData: card.cardData, spentDonIds: donIDs};
    }

    /** Function to cancel playing a card
     * @param {number} cardID - ID of the card to be played
     * @param {number} replacedCardId - ID of the card to be replaced
     * @param {Array<number>} spentDonIds - IDs of the DON cards spent to play the card
     */
    cancelPlayCard(cardID, replacedCardId, spentDonIds) {
        let card = this.getCard(cardID); //Get the card

        card.setState(CARD_STATES.IN_HAND); //Set the state to being played

        if(replacedCardId) {
            let replacedCard = this.getCard(replacedCardId); //Get the card
            replacedCard.setState(replacedCard.previousState); //Set the state to being played
        }

        //Remove the resources from the active don
        for(let i=0; i<spentDonIds.length; i++) {
            let donCard = this.getDonCard(spentDonIds[i]);
            donCard.setState(CARD_STATES.DON_ACTIVE);
            this.inExertenDon = this.inExertenDon.filter(c => c.id !== donCard.id); //Remove the card from the exerten don
            this.inActiveDon.push(donCard);
        }
    }

    //#endregion

    //#region PLAY EVENT
    /** Function that plays an event 
     * @param {MatchCard} card - ID of the card to be played
    */
    playEvent(card) {
        this.removeCardFromHand(card); //remove the card from the hand

        this.discardCard(card); //discard the card
    }
    //#endregion

    //#region PLAY STAGE
    /** Function that plays a stage card and replaces the previous one if needed
     * @param {number} cardID - ID of the card to be played
     * @param {boolean} replacePreviousCard - flag to replace the
     */
    playStage(card, replacedCard = null) {
        if(replacedCard) {
            let previousCard = this.inStageLocation;    //Get the previous card
            this.inDiscard.push(previousCard); //push the previous card to the discard if it needs to be replaced
            previousCard.setState(CARD_STATES.IN_DISCARD); //set the state  
        }

        this.inStageLocation = card; //Add stage to the location
        this.removeCardFromHand(card); //Remove the card from the hand
        card.setState(CARD_STATES.IN_PLAY); //Set the state

        return;
    }
    //#endregion

    //#region PLAY CHARACTER
    /** Function to play a character
     * @param {number} cardID - ID of the card to be played
     * @param {boolean} replacePreviousCard - flag to replace the previous card
     * @param {number} replacedCardID - ID of the card to be replaced
     */

    playCharacter(card, replacedCard = null) {
        //If a card is replaced remove it from the character area and add it to the discard
        if(replacedCard) {
            let previousCard = this.getCard(replacedCard); //Get the card
            this.discardCard(previousCard); //discard the card
            this.inCharacterArea = this.inCharacterArea.filter(c => c.id !== replacedCard); //remove it from the character area
        }

        //Add the card to the character area
        this.inCharacterArea.push(card); //add to the character area
        this.removeCardFromHand(card); //remove from the hand
        card.setState(CARD_STATES.IN_PLAY_FIRST_TURN); //set the state

        //Return the info for the client
        return;
    }
    //#endregion

    //#region HAS AVAILABLE BLOCKERS
    /** Function that checks if the players has available blockers for the given game phase
     * @param {string} gamePhase - phase of the game
     * @return {boolean} - true if the player has available blockers, false otherwise
     */
    hasAvailableBlockers(gamePhase) {
        for(let card of this.inCharacterArea) {
            if(card.getAbilityByType('BLOCKER') !== undefined && card.getAbilityByType('BLOCKER').canActivate(card, gamePhase) && card.canBlock()) return true;
        }
        return false;
    }
    //#endregion

    //#region DISCARD FUNCTION
    /** Function that discards a card
     * @param {MatchCard} card - card to be discarded
     * @returns {Object} 
     */
    discardCard(card){
        let cardsToBeReturned = {
            attachedDon: [],
            attachedCounter: []
        };

        //If the card has any attached don, return to don pile as set the state
        while(card.attachedDon.length > 0) {
            let donid = card.attachedDon.pop();
            let don = this.getDonCard(donid);
            don.state = CARD_STATES.DON_RESTED;
            cardsToBeReturned.attachedDon.push(don);
        }

        //If the card has any attached counter discard
        while(card.attachedCounter.length > 0) {
            let counter = card.attachedCounter.pop();
            this.discardCard(counter);
            cardsToBeReturned.attachedCounter.push(counter.id);
        }

        //Reset counterPower of card
        card.eventCounterAmount = 0;

        this.removeCardFromCharacterArea(card); //remove it from the character area
        this.inDiscard.push(card); //push it to the discard
        card.state = CARD_STATES.IN_DISCARD; //set the state

        //return object
        return cardsToBeReturned;
    }
    //#endregion

    //#region ATTACK CLEANUP
    /** Function to cleanup all the counters from characters after an attack
     * @returns {Array<Object>}
     */
    attackCleanup() {
        let cardsToBeReturned = [];

        //First the cards in the character area
        for(let card of this.inCharacterArea) {
            //reset eventCounter
            card.eventCounterAmount = 0;

            while(card.attachedCounter.length > 0) {
                let counter = card.attachedCounter.pop();
                this.discardCard(counter);
                cardsToBeReturned.push({card: card.id, counter: counter.id});
            }
        }

        //Then the leader
        this.inLeaderLocation.eventCounterAmount = 0;
        while(this.inLeaderLocation.attachedCounter.length > 0) {
            let counter = this.inLeaderLocation.attachedCounter.pop();
            this.discardCard(counter);
            cardsToBeReturned.push({card: this.inLeaderLocation.id, counter: counter.id});
        }

        return cardsToBeReturned;
    }
    //#endregion

    //#region UTILS

    /** Function to find a card in the player's character area
     * @param {MatchCard} cardToFind 
     * @returns {boolean}
     */
    characterAreaContains(cardToFind) {
        for(let card of this.inCharacterArea) {
            if(card.id === cardToFind.id) return true;
        }
        return false;
    }

    /** Function to find a card in the player's leader area
     * @param {MatchCard} cardToFind 
     * @returns {boolean}
     */
    leaderLocationContains(cardToFind) {
        return cardToFind.id === this.inLeaderLocation.id;
    }

    /** Function to find a card in the player's stage area
     * @param {MatchCard} cardToFind 
     * @returns {boolean}
     */
    stageLocationContains(cardToFind) {
        return cardToFind.id === this.inStageLocation.id;
    }

    //#endregion
}

module.exports = MatchPlayer;