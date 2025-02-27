const Match = require('../match_objects/match');
const Player = require('../game_objects/player');

class Target {
    constructor(serverTarget) {
        // Check if serverTarget exists
        if (!serverTarget) {
            // Set default empty values if serverTarget is null/undefined
            this.players = [];
            this.cardtypes = [];
            this.cost = {};
            this.states = [];
            this.types = [];
            this.power = {};
            return;
        }

        // Use optional chaining and nullish coalescing to safely access properties
        this.players = serverTarget.players?.slice() || [];
        this.cardtypes = serverTarget.cardtypes?.slice() || [];
        this.cost = serverTarget.cost || {};
        this.states = serverTarget.states?.slice() || [];
        this.types = serverTarget.types?.slice() || [];
        this.power = serverTarget.power || {};
    }
}

class TargetingManager {

    /** Constructor
     * @param {Match} match - The match object
     */
    constructor(match) {
        /**@type {Match} */
        this.match = match;

        this.target = null;
    }

    /** Function to check if the target is valid
     * @param {Player} player
     * @param {number} cardID - card id
     * @param {Object} targetObject - target object
     */
    isValidTarget(player, cardID, targetObject) {
        this.target = new Target(targetObject);

        //get the card from the card id
        let card = player.currentMatchPlayer.getCard(cardID);
        let playerCard = true;
        if(card === undefined) {
            card = player.currentOpponentPlayer.currentMatchPlayer.getCard(cardID);
            playerCard = false;
        };

        let isValid = true;

        // Check if the card belongs to a specific player
        if (this.target.players.length > 0) isValid = isValid && this.isPlayerValid(playerCard);
  
        // Check card type
        if (this.target.cardtypes.length > 0 && isValid) isValid = isValid && this.isCardTypeValid(card.cardData.card);

        // Check card state
        if (this.target.states.length > 0 && isValid) isValid = isValid && this.isStateValid(card.state);

        // Check card types (attributes, colors, etc.)
        if (this.target.types.length > 0 && isValid) isValid = isValid && this.isTypeValid(card.cardData.attributes);

        // Check card cost
        if (Object.keys(this.target.cost).length > 0 && isValid) isValid = isValid && this.compareValue(card.cardData.cost, this.target.cost);

        // Check card power
        if (Object.keys(this.target.power).length > 0 && isValid) isValid = isValid && this.compareValue(card.cardData.power, this.target.power);

        return isValid;
    }

    /**
     * Check if the card belongs to a valid player
     * @param {boolean} playerCard - The player scene to check
     * @returns {boolean} - Whether the player is valid
     */
    isPlayerValid(playerCard) {
        // If players array includes "any", any player is valid
        if (this.target.players.includes("any")) {
            return true;
        }

        // Check if the player is active or passive based on the criteria
        return (playerCard && this.target.players.includes("active")) || 
                (!playerCard && this.target.players.includes("passive"));
    }

    /**
     * Check if the card type is valid
     * @param {string} cardType - The card type to check
     * @returns {boolean} - Whether the card type is valid
     */
    isCardTypeValid(cardType) {
        return this.target.cardtypes.includes(cardType) || this.target.cardtypes.includes("any");
    }

    /**
     * Check if the card state is valid
     * @param {string} cardState - The card state to check
     * @returns {boolean} - Whether the card state is valid
     */
    isStateValid(cardState) {
        return this.target.states.some(state => cardState.startsWith(state));
    }

    /**
     * Check if the card type (attributes, colors, etc.) is valid
     * @param {Array} attributes - The card attributes to check
     * @returns {boolean} - Whether the card type is valid
     */
    isTypeValid(attributes) {
        if (!attributes) return false;
        return this.target.types.some(type => attributes.includes(type));
    }

    /**
     * Generic comparison function for numeric values
     * @param {number} cardValue - The card's value to check
     * @param {Object} constraint - The constraint object with operator and value
     * @returns {boolean} - Whether the value meets the constraint
     */
    compareValue(cardValue, constraint) {
        // If there's no constraint, return true
        if (!constraint || !constraint.operator || constraint.value === undefined) {
            return true;
        }

        // Get the operator and value
        const { operator, value } = constraint;

        // Evaluate based on the operator
        switch (operator) {
            case "<":
                return cardValue < value;
            case "<=":
                return cardValue <= value;
            case ">":
                return cardValue > value;
            case ">=":
                return cardValue >= value;
            case "=":
            case "==":
                return cardValue === value;
            case "!=":
                return cardValue !== value;
            default:
                console.warn(`Unknown operator ${operator} in value comparison`);
                return true; // Default to true for unknown operators
        }
    }

}

module.exports = TargetingManager;