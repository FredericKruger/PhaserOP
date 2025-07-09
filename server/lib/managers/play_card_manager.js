const {MatchCard} = require('../match_objects/match_card.js');

class PlayCardManager {

    /** Constrcutor
     * @param {MatchCard} playedCard - card that was played
     * @param {boolean} eventTriggered - if the event was triggered by the played card
     */
    constructor(playedCard, eventTriggered = false) {
        /** @type {MatchCard}  */
        this.playedCard = playedCard;
        
        this.payedDon = [];
        this.replacedCard = null;
        this.replacementResults = null;
        this.abilityId = null;
        this.onPlayEventActions = [];
        this.onPlayEventActionsOpponentPlayer = [];
        this.eventTriggered = eventTriggered;

        this.currentPhase = null;
    }

}

module.exports = PlayCardManager;