const CARD_STATES = Object.freeze({
    READY: 'READY',
    EXERTED: 'EXERTED',
});

class MatchCard {

    /**
     * 
     * @param {number} cardIndex 
     * @param {number} id 
     * @param {Object} cardData 
     */
    constructor(cardIndex, id, cardData) {
        this.cardIndex = cardIndex;
        this.id = id;
        this.cardData = cardData;

        this.state = CARD_STATES.READY;

        this.currentPower = cardData.power;
    }

}

module.exports = {
    MatchCard: MatchCard,
    CARD_STATES: CARD_STATES
};