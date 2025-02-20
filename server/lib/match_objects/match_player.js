const { MatchFlags } = require('../game_objects/state_manager.js');
const { MatchDonCard } = require('./match_card.js');
const MatchDeck = require('./match_deck.js');

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

}

module.exports = MatchPlayer;