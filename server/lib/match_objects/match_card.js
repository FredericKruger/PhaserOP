const Player = require("../game_objects/player");

const CARD_STATES = Object.freeze({
    IN_DECK: 'IN_DECK',
    IN_HAND: 'IN_HAND',
    IN_DISCARD: 'IN_DISCARD',
    IN_LIFEDECK: 'IN_LIFEDECK',

    IN_PLAY: 'IN_PLAY',
    IN_PLAY_RESTED: 'IN_PLAY_RESTED',
    IN_PLAY_ATTACHED: 'IN_PLAY_ATTACHED',

    IN_DON_DECK: 'IN_DON_DECK',
    DON_ACTIVE: 'DON_ACTIVE',
    DON_RESTED: 'DON_RESTED',
    DON_ATTACHED: 'DON_ATTACHED',
});

/** Base Card Class */
class Card {

    /** Constructor
     * @param {number} id - card id
     */
    constructor(id) {
        this.id = id;
        
        this.state = CARD_STATES.READY;
    }

    /** Function to set the state of the card
     * @param {string} state - state of the card
     */
    setState(state) {this.state = state;}
}

/** Plaing card class */
class MatchCard extends Card{

    /**
     * 
     * @param {number} cardIndex 
     * @param {number} id 
     * @param {Object} cardData 
     */
    constructor(cardIndex, id, cardData) {
        super(id);

        this.cardIndex = cardIndex;
        this.cardData = cardData;

        this.attachedDon = [];
        this.attachedCounter = null;

        this.state = CARD_STATES.IN_DECK;

        this.currentPower = cardData.power;
    }

}

/**Don Card Class */
class MatchDonCard extends Card{

    constructor(id) {
        super(id);

        this.state = CARD_STATES.IN_DON_DECK
    }
}

module.exports = {
    MatchCard: MatchCard,
    MatchDonCard: MatchDonCard,
    CARD_STATES: CARD_STATES
};