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

class MatchDonCard {

    constructor(id) {
        this.id = id;
        
        this.state = CARD_STATES.READY;
    }
}

module.exports = {
    MatchCard: MatchCard,
    MatchDonCard: MatchDonCard,
    CARD_STATES: CARD_STATES
};