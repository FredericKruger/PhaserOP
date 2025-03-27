class MatchRegistry {

    constructor() {
        this.matches = new Map();
    }

    /**
     * Register a match
     * @param {Match} match - The match to register
     */
    register(match) {
        this.matches.set(match.id, match);
    }
    
    /**
     * Get a match by ID
     * @param {string|number} id - Match ID
     * @returns {Match|undefined}
     */
    get(id) {
        return this.matches.get(id);
    }
    
    /**
     * Remove a match from registry
     * @param {string|number} id - Match ID
     */
    remove(id) {
        this.matches.delete(id);
    }

}

// Create a global singleton instance
matchRegistry = new MatchRegistry();

module.exports = matchRegistry;