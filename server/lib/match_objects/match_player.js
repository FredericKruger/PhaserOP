const { MatchFlags } = require('../managers/state_manager.js');
const { MatchDonCard } = require('./match_card.js');
const MatchDeck = require('./match_deck.js');
const { CARD_STATES } = require('./match_card.js');

class MatchPlayer {

    constructor() {
        this.life = 0;
        this.deck = null;

        this.inHand = [];
        this.inStageLocation = null;
        this.inLeaderLocation = null;
        this.inCharacterArea = [];
        this.inDiscard = [];
        this.inDon = [];
        this.inActiveDon = [];
        this.inExertenDon = [];
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

    //#region PLAY EVENT
    /** Function that plays an event 
     * @param {number} cardID - ID of the card to be played
    */
    playEvent(cardID) {
        let card = this.inHand.find(c => c.id === cardID); //Get the card

        this.removeCardFromHand(card); //remove the card from the hand
        this.discardCard(card); //discard the card

        //Remove the resources from the active don
        let donIDs = [];
        for(let i=0; i<card.cardData.cost; i++) {
            let donCard = this.inActiveDon.pop();
            donCard.setState(CARD_STATES.DON_RESTED);
            this.inExertenDon.push(donCard);
            donIDs.push(donCard.id);
        }

        return {playedCard: cardID, playedCardData: card.cardData, replacedCard: -1, spentDonIds: donIDs};
    }
    //#endregion

    //#region PLAY STAGE
    /** Function that plays a stage card and replaces the previous one if needed
     * @param {number} cardID - ID of the card to be played
     * @param {boolean} replacePreviousCard - flag to replace the
     */
    playStage(cardID, replacePreviousCard, replacedCardID = -1) {
        let card = this.inHand.find(c => c.id === cardID); //Get the card

        let previousCardID = -1;
        if(replacePreviousCard) {
            let previousCard = this.inStageLocation;    //Get the previous card
            if(previousCard !== null) previousCardID = previousCard.id; //Get the ID of the previous card

            this.inDiscard.push(previousCard); //push the previous card to the discard if it needs to be replaced
            previousCard.setState(CARD_STATES.IN_DISCARD); //set the state  
        }

        this.inStageLocation = card; //Add stage to the location
        this.removeCardFromHand(card); //Remove the card from the hand
        card.setState(CARD_STATES.IN_PLAY); //Set the state

        //Remove the resources from the active don
        let donIDs = [];
        for(let i=0; i<card.cardData.cost; i++) {
            let donCard = this.inActiveDon.pop();
            donCard.setState(CARD_STATES.DON_RESTED);
            this.inExertenDon.push(donCard);
            donIDs.push(donCard.id);
        }

        return {playedCard: cardID, playedCardData: card.cardData, replacedCard: previousCardID, spentDonIds: donIDs};
    }
    //#endregion

    //#region PLAY CHARACTER
    /** Function to play a character
     * @param {number} cardID - ID of the card to be played
     * @param {boolean} replacePreviousCard - flag to replace the previous card
     * @param {number} replacedCardID - ID of the card to be replaced
     */
    playCharacter(cardID, replacePreviousCard = false, replacedCardID = -1) {
        let card = this.inHand.find(c => c.id === cardID); //First get the card from the hand

        //If a card is replaced remove it from the character area and add it to the discard
        if(replacePreviousCard) {
            let previousCard = this.inCharacterArea.find(c => c.id === replacedCardID); //Get the card
            this.discardCard(previousCard); //discard the card
            this.inCharacterArea = this.inCharacterArea.filter(c => c.id !== replacedCardID); //remove it from the character area
        }

        //Add the card to the character area
        this.inCharacterArea.push(card); //add to the character area
        this.removeCardFromHand(card); //remove from the hand
        card.setState(CARD_STATES.IN_PLAY_FIRST_TURN); //set the state

        //Remove the resources from the active don
        let donIDs = [];
        for(let i=0; i<card.cardData.cost; i++) {
            let donCard = this.inActiveDon.pop();
            donCard.setState(CARD_STATES.DON_RESTED);
            this.inExertenDon.push(donCard);
            donIDs.push(donCard.id);
        }

        //Return the info for the client
        //if(replacePreviousCard) return {playedCard: cardID, playedCardData: card.cardData, replacedCard: replacedCardID, spentDonIds: donIDs};
        //else return {playedCard: cardID, playedCardData: card.cardData, replacedCard: replacedCardID, spentDonIds: donIDs};
        return {playedCard: cardID, playedCardData: card.cardData, replacedCard: replacedCardID, spentDonIds: donIDs};
    }
    //#endregion

    //#region HAS AVAILABLE BLOCKERS
    /** Function that checks if the players has available blockers for the given game phase
     * @param {string} gamePhase - phase of the game
     * @return {boolean} - true if the player has available blockers, false otherwise
     */
    hasAvailableBlockers(gamePhase) {
        for(let card of this.inCharacterArea) {
            if(card.getAbilityByType('BLOCKER') !== undefined && card.getAbilityByType('BLOCKER').canActivate(card, gamePhase)) return true;
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
}

module.exports = MatchPlayer;