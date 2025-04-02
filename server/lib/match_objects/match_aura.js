const ServerAbilityFactory = require("../ability_manager/server_ability_factory");

class MatchAura {

    /** Function to create an aura */
    constructor(id, cardId, matchId, auraData) {
        this.id = id;
        this.cardId = cardId;
        this.matchId = matchId;

        this.duration = auraData.aurainfo.duration;
        this.affectedPlayers = auraData.aurainfo.affectedPlayers;
        
        const match = matchRegistry.get(matchId);
        this.ablity = match.abilityFactory.createAbilityForAura(auraData, this.id, this.matchId);
    }

}

module.exports = MatchAura;