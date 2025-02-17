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
        this.inLifeDeck = [];

        this.deck = new MatchDeck();
    }

}

module.exports = MatchPlayer;