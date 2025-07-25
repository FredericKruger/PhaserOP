const Match = require("../match_objects/match");
const MathCard = require("../match_objects/match_card");
const TargetingManager = require("./targeting_manager");

class SelectionManager {

    /** @param {Match} match  */
    constructor(match) {
        /** @type {Match} */
        this.match = match;

        this.currentSelectionParams = null;
        this.currentNumberOfValidTargets = 0;

        /** @type {string} */
        this.cardPoolOrigin = null;

        /**@type {Array<MatchCard>} */
        this.cardPool = [];
        /**@type {Array<Array<integer>>} */
        this.selectedCards = [];
        /** @type {Array<string>} */
        this.selectedCardsDestinations = [];
        /**@type {Array<integer>} */
        this.remainingCards = [];
    }

    /** 
     * @param {Array<MatchCard>} cardPool  
     * @param {string} cardPoolOrigin
    */
    setCardPool(cardPool, cardPoolOrigin) {
        this.cardPool = cardPool;
        this.cardPoolOrigin = cardPoolOrigin;

        // Initialize remaining cards with the ids of the card pool
        this.remainingCards = cardPool.map(card => card.id);
    }

    /** 
     * Adds the selected card ids to the selection manager.
     * @param {Array<integer>} selectedCardIds - The ids of the selected cards.
    */
    addSelectedCards(selectedCardIds, destination = "") {
        //remove selected cards from remaining cards
        for (let i = 0; i < selectedCardIds.length; i++) {
            const cardIndex = this.remainingCards.indexOf(selectedCardIds[i]);
            if (cardIndex > -1) {
                this.remainingCards.splice(cardIndex, 1);
            }
        }

        // Add Cards 
        this.selectedCards.push(selectedCardIds);
        this.selectedCardsDestinations.push(destination);
    }

    /** 
     * Checks if the selected cards match the current selection parameters.
     * @param {Array<integer>} selectedCardIds - The ids of the selected cards.
    */
    checkSelectedCards(selectedCardIds) {
        // Check if the amount matches
        if (selectedCardIds.length < this.currentSelectionParams.amount
            && this.currentNumberOfValidTargets < this.currentSelectionParams.amount
        ) {
            return false;
        }

        // Check if all selected cards are in the card pool
        let targetingManager = new TargetingManager(this.match);
        for (let cardId of selectedCardIds) {
            let card = this.cardPool.find(c => c.id === cardId);

            if(!targetingManager.isValidTarget(card, this.currentSelectionParams.target, true)) {
                targetingManager = null;
                return false; // Card is not valid for the selection
            }
        }

        targetingManager = null;
        return true; // All checks passed
    }

    setSelectionParams(selectionParams) {
        this.currentSelectionParams = selectionParams;

        let target = selectionParams.target || null;

        // Get number of valid targets
        this.currentNumberOfValidTargets = 0;
        let targetingManager = new TargetingManager(this.match);
        for(let card of this.cardPool) {
            if(targetingManager.isValidTarget(card, selectionParams.target, true)) {
                this.currentNumberOfValidTargets++;
            }
        }
    }

}

module.exports = SelectionManager