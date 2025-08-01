/**
 * Static utility class for evaluating ability conditions
 */
class ConditionEvaluator {
    
    /**
     * Evaluates a single condition
     * @param {Object} condition - The condition object to evaluate
     * @param {Object} context - Context object containing match, player, card, etc.
     * @returns {boolean} - True if condition is met, false otherwise
     */
    static evaluateCondition(condition, context) {
        const { match, player, card, gameState, targets } = context;
        
        switch (condition.type) {
            case "SELECTION_COUNT": 
                return this.evaluateSelectionCount(condition, match);
            case "NUMBER_CARDS_IN_HAND": 
                return this.evaluateNumberCardsInHand(condition, player, match);
            case "SELECTION_CARD_POOL_LENGTH": 
                return this.evaluateSelectionCardPoolLength(condition, match);
            case "NUMBER_CARDS_IN_DECK": 
                return this.evaluateNumberCardsInDeck(condition, player, match);
            case "HAS_TARGETS": 
                return this.evaluateHasTargets(condition, targets);
            case "HAS_EXERTED_DON":
                return this.evaluateHasExerterdDon(condition, match, player);
            default:
                console.warn(`Unknown condition type: ${condition.type}`);
                return true;
        }
    }
    
    /**
     * Evaluates multiple conditions with AND logic
     * @param {Array} conditions - Array of condition objects
     * @param {Object} context - Context object containing match, player, card, etc.
     * @returns {boolean} - True if ALL conditions are met, false otherwise
     */
    static evaluateConditions(conditions, context) {
        if (!conditions || conditions.length === 0) {
            return true;
        }
        
        return conditions.every(condition => this.evaluateCondition(condition, context));
    }
    
    // Individual condition evaluation methods
    
    static evaluateAttachedDon(condition, card) {
        return card.attachedDon.length >= condition.value;
    }
    
    static evaluateAvailableDon(condition, player) {
        return player.currentMatchPlayer.inActiveDon.length >= condition.value;
    }
    
    static evaluateCardRested(condition, card) {
        if (card.state === "IN_PLAY_RESTED" && condition.value) return true;
        if (card.state !== "IN_PLAY_RESTED" && !condition.value) return true;
        return false;
    }
    
    static evaluateCharacterCount(condition, player) {
        return player.currentMatchPlayer.inCharacterArea.length >= condition.value;
    }
    
    static evaluateCheckTargets(condition, context) {
        const { match, ability } = context;
        
        if (condition.value) {
            // Get all target actions from the ability
            const targetActions = ability.actions.filter(action => action.name === "target");
            
            if (targetActions.length === 0) return true; // If no target actions, condition passes
            
            // Check each target action to ensure at least one valid target exists
            for (const targetAction of targetActions) {
                const targetParams = targetAction.params.target;
                
                let hasValidTargets = match.findValidTargets(targetParams.targets);
                
                // If any target action has no valid targets, condition fails
                if (!hasValidTargets) return false;
            }
            
            // All target actions have at least one valid target
            return true;
        } else {
            return true;
        }
    }
    
    static evaluateHasTargets(condition, targets) {
        const numberOfTargets = targets ? targets.length : 0;
        if (condition.value && (numberOfTargets > 0)) return true;
        if (!condition.value && (numberOfTargets === 0)) return true;
        return false;
    }

    static evaluateHasExerterdDon(condition, match, player) {
        let affectedPlayer = player;
        if(condition.player && condition.player === "OPPONENT") {
            affectedPlayer = match.getPlayer(player.referenceId).currentOpponentPlayer.currentMatchPlayer;
        }
        return affectedPlayer.inExertenDon.length > 0;
    }

    static evaluateNumberCardsInHand(condition, player, match) {
        const count = player.inHand.length;
        return match.resolveOperation(count, condition.operator, condition.value);
    }
    
    static evaluateNumberCardsInDeck(condition, player, match) {
        const count = player.deck.cards.length;
        return match.resolveOperation(count, condition.operator, condition.value);
    }
    
    static evaluateSelectionCount(condition, match) {
        const count = match.currentSelectionManager.selectedCards[condition.selectionIndex].length;
        return this.resolveOperation(count, condition.operator, condition.value);
    }
    
    static evaluateTotalAvailableDon(condition, player) {
        const totalDon = player.currentMatchPlayer.inActiveDon.length + player.currentMatchPlayer.inExertenDon.length;
        return totalDon >= condition.value;
    }
    
    /**
     * Helper method to create context object for condition evaluation
     * @param {Object} params - Parameters containing match, player, card, etc.
     * @returns {Object} - Context object for condition evaluation
     */
    static createContext(params) {
        return {
            match: params.match,
            player: params.player,
            card: params.card,
            gameState: params.gameState,
            targets: params.targets || [],
            ability: params.ability
        };
    }
    
    /**
     * Convenience method for evaluating ability conditions
     * @param {Object} ability - The ability object containing conditions
     * @param {Object} params - Parameters containing match, player, card, etc.
     * @returns {boolean} - True if all conditions are met, false otherwise
     */
    static canActivateAbility(ability, params) {
        const context = this.createContext({ ...params, ability });
        return this.evaluateConditions(ability.conditions, context);
    }

    /** Function to resolve an operation
     * @param {string} operator
     * @param {number} value1
     * @param {number} value2
     * @returns {boolean}  
     */
    static resolveOperation(value1, operator, value2) {
        switch (operator) {
            case ">": 
                return value1 > value2;
            case ">=": 
                return value1 >= value2;
            case "=": 
            case "==": 
                return value1 === value2;
            case "<=": 
                return value1 <= value2;
            case "<": 
                return value1 < value2;
            case "!=": 
                return value1 !== value2;
        }
        return false;
    }
}

module.exports = ConditionEvaluator;