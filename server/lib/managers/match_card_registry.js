class MatchCardRegistry {

    constructor() {
        this.cards = new Map();
    }

    /**
     * Register a match
     * @param {MatchCard} match - The match to register
     */
    register(card) {
        this.cards.set(card.id, card);
    }
    
    /**
     * Get a match by ID
     * @param {string|number} id - Match ID
     * @returns {MatchCard|undefined}
     */
    get(id) {
        return this.cards.get(id);
    }
    
    /**
     * Remove a match from registry
     * @param {string|number} id - Match ID
     */
    remove(id) {
        this.cards.delete(id);
    }

}

module.exports = MatchCardRegistry;