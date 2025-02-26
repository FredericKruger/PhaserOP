class Target {

    /** Constructor from server Target Object
     * @param {Object} serverTarget - The server target object
     */
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

    /**
     * Function to test if a card is the right target
     * @param {GameCardUI} card 
     */
    isValidTarget(card) {
        let isValid = true;

        // Check if the card belongs to a specific player
        if (this.players.length > 0) isValid = isValid && this.isPlayerValid(card.playerScene);
  
        // Check card type
        if (this.cardtypes.length > 0 && isValid) isValid = isValid && this.isCardTypeValid(card.cardData.card);

        // Check card state
        if (this.states.length > 0 && isValid) isValid = isValid && this.isStateValid(card.state);

        // Check card types (attributes, colors, etc.)
        if (this.types.length > 0 && isValid) isValid = isValid && this.isTypeValid(card.cardData.attributes);

        // Check card cost
        if (Object.keys(this.cost).length > 0 && isValid) isValid = isValid && this.compareValue(card.cardData.cost, this.cost);

        // Check card power
        if (Object.keys(this.power).length > 0 && isValid) isValid = isValid && this.compareValue(card.cardData.power, this.power);

        return isValid;
    }

    /**
     * Check if the card belongs to a valid player
     * @param {PlayerScene} playerScene - The player scene to check
     * @returns {boolean} - Whether the player is valid
     */
    isPlayerValid(playerScene) {
        // If players array includes "any", any player is valid
        if (this.players.includes("any")) {
            return true;
        }

        // Check if the player is active or passive based on the criteria
        const isActive = playerScene.isActivePlayer;
        return (isActive && this.players.includes("active")) || 
                (!isActive && this.players.includes("passive"));
    }

    /**
     * Check if the card type is valid
     * @param {string} cardType - The card type to check
     * @returns {boolean} - Whether the card type is valid
     */
    isCardTypeValid(cardType) {
        return this.cardtypes.includes(cardType) || this.cardtypes.includes("any");
    }

    /**
     * Check if the card state is valid
     * @param {string} cardState - The card state to check
     * @returns {boolean} - Whether the card state is valid
     */
    isStateValid(cardState) {
        return this.states.some(state => cardState.startsWith(state));
    }

    /**
     * Check if the card type (attributes, colors, etc.) is valid
     * @param {Array} attributes - The card attributes to check
     * @returns {boolean} - Whether the card type is valid
     */
    isTypeValid(attributes) {
        if (!attributes) return false;
        return this.types.some(type => attributes.includes(type));
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