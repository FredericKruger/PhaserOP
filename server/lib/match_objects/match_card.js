const CARD_STATES = Object.freeze({
    READY: 'READY',
    EXERTED: 'EXERTED',
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

        this.currentPower = cardData.power;
    }

}

/**Don Card Class */
class MatchDonCard extends Card{

    constructor(id) {
        super(id);
    }
}

module.exports = {
    MatchCard: MatchCard,
    MatchDonCard: MatchDonCard,
    CARD_STATES: CARD_STATES
};