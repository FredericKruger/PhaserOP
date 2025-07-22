const Match = require('../match_objects/match');
const Player = require('../game_objects/player');
const MatchCard = require('../match_objects/match_card');

class Target {
    constructor(serverTarget) {
        // Check if serverTarget exists
        if (!serverTarget) {
            // Set default empty values if serverTarget is null/undefined
            this.player = [];
            this.cardtypes = [];
            this.cost = {};
            this.states = [];
            this.types = [];
            this.attributes = [];
            this.power = {};
            this.exclude = [];
            this.hasability = [];
            return;
        }

        // Use optional chaining and nullish coalescing to safely access properties
        this.player = serverTarget.player?.slice() || [];
        this.cardtypes = serverTarget.cardtypes?.slice() || [];
        this.cost = serverTarget.cost || {};
        this.states = serverTarget.states?.slice() || [];
        this.types = serverTarget.types?.slice() || [];
        this.attributes = serverTarget.attributes?.slice() || [];
        this.power = serverTarget.power || {};
        this.exclude = serverTarget.exclude?.slice() || [];
        this.hasability = serverTarget.hasability?.slice() || [];

        //Prepare states if a group state efind
        if (this.states.includes("ALL_IN_PLAY_STATES")) {
            this.states = ["IN_PLAY", "IN_PLAY_FIRST_TURN", "IN_PLAY_RESTED", "IN_PLAY_ATTACKING", "IN_PLAY_DEFENDING", "IN_PLAY_BLOCKING"];
        }
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
     * @param {Player} player - player object
     * @param {Array<number>} cardID - card id
     * @param {Object} target - target object
     */
    areValidTargets(player, cardIDs, targetObject) {
       // if(cardIDs.length !== targetObject.requiredTargets) return false;
        if(cardIDs.length < targetObject.requiredTargets) return false;

        let targetsValid = true;
        for(let cardID of cardIDs) {
            //get the card from the card id
            let card = player.currentMatchPlayer.getCard(cardID);
            let playerCard = true;
            if(card === undefined) {
                card = player.currentOpponentPlayer.currentMatchPlayer.getCard(cardID);
                playerCard = false;
            };

            let isValid = false;
            if(targetObject.targets instanceof Array) {
                for (let target of targetObject.targets) {
                    isValid = isValid || this.isValidTarget(card, target, playerCard);
                    if(isValid) break;
                }
            } else {
                isValid = isValid || this.isValidTarget(card, targetObject, playerCard);
                if(isValid) break;
            }


            targetsValid = targetsValid && isValid;
            if(!targetsValid) return false;
        }

        return targetsValid;
    }

    /** Function to check if the target is valid
     * @param {MatchCard} card - card id
     * @param {Object} target - target object
     * @param {boolean} playerCard - player card
     */
    isValidTarget(card, target, playerCard) {
        this.target = new Target(target);

        let isValid = true;

        // Check if the card belongs to a specific player
        if (this.target.player.length > 0) isValid = isValid && this.isPlayerValid(card, playerCard);
        //console.log("isPlayerValid", isValid);
  
        // Check card type
        if (this.target.cardtypes.length > 0 && isValid) isValid = isValid && this.isCardTypeValid(card.cardData.card);
        //console.log("isCardTypeValid", isValid);

        // Check card state
        if (this.target.states.length > 0 && isValid) isValid = isValid && this.isStateValid(card.state);
        //console.log("isStateValid", isValid);

        // Check card types (attributes, colors, etc.)
        if (this.target.types.length > 0 && isValid) isValid = isValid && this.isTypeValid(card.cardData.type);
        //console.log("isTypeValid", isValid);

        // Check card types (attributes, colors, etc.)
        if (this.target.attributes.length > 0 && isValid) isValid = isValid && this.isAttributeValid(card.cardData.attribute);
        //console.log("isAttributeValid", isValid);

        if (this.target.exclude.length > 0 && isValid) isValid = isValid && this.isExcludeValid(card.id)
        //console.log("isExcludeValid", isValid);

        if (this.target.hasability.length > 0 && isValid) isValid = isValid && this.hasAbilityValid(card.abilities);
        //console.log("hasAbilityValid", isValid);

        //console.log(card);
        // Check card cost
        let cost = card.currentCost || card.getCost(this.match.isPlayerActivePlayer(card.owner));
        if (Object.keys(this.target.cost).length > 0 && isValid) isValid = isValid && this.compareValue(cost, this.target.cost);
        //console.log("compareCost", isValid);

        // Check card power
        let power = card.currentPower || card.getPower(this.match.isPlayerActivePlayer(card.owner));
        if (Object.keys(this.target.power).length > 0 && isValid) isValid = isValid && this.compareValue(power, this.target.power);
        //console.log("comparePower", isValid);

        return isValid;
    }

    /**
     * Check if the card belongs to a valid player
     * @param {MatchCard} card
     * @param {boolean} playerCard - The player scene to check
     * @returns {boolean} - Whether the player is valid
     */
    isPlayerValid(card, playerCard) {
        // If players array includes "any", any player is valid
        if (this.target.player.includes("any")) {
            return true;
        }

        const originatorCard = this.match.matchCardRegistry.get(this.match.state.pending_action.actionInfos.playedCard);
        // Check for "owner" in the players array which requires special handling
        if (this.target.player.includes("owner")) {
            // If this is checking the player's own cards, it's valid
            return card.owner === originatorCard.owner;
        }
        
        if (this.target.player.includes("opponent")) {
            // If this is checking the opponent's cards, it's valid
            return card.owner !== originatorCard.owner;
        }

        // Check if the player is active or passive based on the criteria
        return (playerCard && this.target.player.includes("active")) || 
                (!playerCard && this.target.player.includes("passive"));
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
     * Check if the card type (attributes, colors, etc.) is valid
     * @param {Array} attributes - The card attributes to check
     * @returns {boolean} - Whether the card type is valid
     */
    isAttributeValid(attributes) {
        if (!attributes) return false;
        return this.target.attributes.some(type => attributes.includes(type));
    }

    isExcludeValid(id) {
        const originatorCard = this.match.matchCardRegistry.get(this.match.state.pending_action.actionInfos.playedCard);
        if(this.target.exclude.includes("SELF") && id === originatorCard.id) return false;
        return true;
    }

    hasAbilityValid(abilities) {
        for(let ability of abilities) if(this.target.hasability.includes(ability.type)) return true;
        return false;
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