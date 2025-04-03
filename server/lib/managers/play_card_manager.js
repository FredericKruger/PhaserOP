const {MatchCard} = require('../match_objects/match_card.js');

class PlayCardManager {

    /** Constrcutor
     * @param {MatchCard} playedCard - card that was played
     */
    constructor(playedCard) {
        /** @type {MatchCard}  */
        this.playedCard = playedCard;
        
        this.payedDon = [];
        this.replacedCard = null;
        this.replacementResults = null;
        this.abilityId = null;
        this.onPlayEventActions = [];

        this.currentPhase = null;
    }

}

module.exports = PlayCardManager;