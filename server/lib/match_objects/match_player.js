const { MatchFlags } = require('../game_objects/state_manager.js');
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
    removeCardFromHand(Card) {
        this.inHand = this.inHand.filter(c => c.id !== Card.id);
    }

    /** Function that fills the Don Deck at setup 
     * @param {number} amount - amount of cards to be added to deck
    */
    fillDonDeck(amount) {
        for(let i=0; i<amount; i++) this.inDon.push(new MatchDonCard(i));
    }

    /** Function that plays a stage card and replaces the previous one if needed
     * @param {number} cardID - ID of the card to be played
     * @param {boolean} replacePreviousCard - flag to replace the
     */
    playStage(cardID, replacePreviousCard) {
        let card = this.inHand.filter(c => c.id === cardID)[0]; //Get the card
        let previousCard = this.inStageLocation;    //Get the previous card

        if(replacePreviousCard) {
            this.inDiscard.push(previousCard); //push the previous card to the discard if it needs to be replaced
        }

        this.inStageLocation = card; //Add stage to the location
        this.removeCardFromHand(card); //Remove the card from the hand
        card.setState(CARD_STATES.READY); //Set the state

        //Remove the resources from the active don
        let donIDs = [];
        for(let i=0; i<card.cardData.cost; i++) {
            let donCard = this.inActiveDon.pop();
            this.inExertenDon.push(donCard);
            donIDs.push(donCard);
        }

        return {playedCard: cardID, replacedCard: previousCard, spentDonIDs: donIDs};
    }

    playCharacter(cardID, replacePreviousCard = false, replacedCardID = -1) {
        let card = this.inHand.filter(c => c.id === cardID)[0];

        if(replacePreviousCard) {
            let previousCard = this.inCharacterArea.filter(c => c.id === replacedCardID)[0]; //Get the card
            this.inDiscard.push(previousCard); //push it to the discard
            this.inCharacterArea = this.inCharacterArea.filter(c => c.id !== replacedCardID); //remove it from the character area
        }

        this.inCharacterArea.push(card); //add to the character area
        this.removeCardFromHand(card); //remove from the hand
        card.setState(CARD_STATES.EXERTED); //set the state

        //Remove the resources from the active don
        let donIDs = [];
        for(let i=0; i<card.cardData.cost; i++) {
            let donCard = this.inActiveDon.pop();
            this.inExertenDon.push(donCard);
            donIDs.push(donCard);
        }

        if(replacePreviousCard) return {playedCard: cardID, replacedCard: replacedCardID, spentDonIDs: donIDs};
        else return {playedCard: cardID, replacedCard: replacedCardID, spentDonIDs: donIDs};
    }

}

module.exports = MatchPlayer;