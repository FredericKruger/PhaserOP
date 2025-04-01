const ServerAbilityFactory = require("../ability_manager/server_ability_factory");

class MatchAura {

    /** Function to create an aura */
    constructor(id, matchId, auraData) {
        this.id = id;
        this.matchId = matchId;

        this.duration = auraData.duration;
        this.affectedPlayers = auraData.affectedPlayers;
        
        const match = matchRegistry.get(matchId);
        this.abilities = match.abilityFactory.createAbilitiesForCard(auraData.abilities, this.id, this.matchId);
    }

}

module.exports = MatchAura;