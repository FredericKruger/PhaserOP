const Match = require("../match_objects/match");
const MathCard = require("../match_objects/match_card");

class SelectionManager {

    /** @param {Match} match  */
    constructor(match) {
        /** @type {Match} */
        this.match = match;

        /**@type {Array<MatchCard>} */
        this.cardPool = [];
        /**@type {Array<MatchCard>} */
        this.selectedCards = [];
    }

    /** @param {Array<MatchCard>} cardPool  */
    setCardPool(cardPool) {
        this.cardPool = cardPool;
    }

}

module.exports = SelectionManager