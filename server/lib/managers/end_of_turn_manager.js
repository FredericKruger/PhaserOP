const {MatchCard} = require('../match_objects/match_card.js');

class EndOfTurnManager {

    /** Constrcutor
     * @param {Array<MatchCard>} listOfCardsWithEndOfTurnAbilities - cards with end of turn abilities
     */
    constructor(listOfCardsWithEndOfTurnAbilities) {
        /** @type {Array<MatchCard>} */
        this.cardsWithEndOfTurnAbilities = listOfCardsWithEndOfTurnAbilities;

        /** @type MatchCard */
        this.currentCard = null;
    }

    /** Function that tests if there are more card abilities to be worked on 
     * * @returns {boolean} - true if there are more cards with end of turn abilities
    */
    hasMore() {
        return this.cardsWithEndOfTurnAbilities.length > 0;
    }

    /** Function that returns the next card to be treated
     * * @returns {MatchCard} - the next card to be treated
     */
    handleNext() {
        if(this.cardsWithEndOfTurnAbilities.length > 0) {
            this.currentCard = this.cardsWithEndOfTurnAbilities.shift();
            return this.currentCard;
        } else {
            this.currentCard = null;
            return null;
        }
    }
}

module.exports = EndOfTurnManager;