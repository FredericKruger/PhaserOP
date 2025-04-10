const ServerAbilityFactory = require("../ability_manager/server_ability_factory");
const TargetingManager = require("../managers/targeting_manager");

class MatchAura {

    /** Function to create an aura */
    constructor(id, cardId, matchId, auraData) {
        this.id = id;
        this.cardId = cardId;
        this.matchId = matchId;

        this.auraId = auraData.id;
        this.duration = auraData.aurainfo.duration;
        this.affectedPlayers = auraData.aurainfo.affectedPlayers;
        
        const match = matchRegistry.get(matchId);
        this.ability = match.abilityFactory.createAbilityForAura(auraData, this.cardId, this.matchId);
    }

    
    /** function that returns if the aura can activate
     * @returns {boolean} - true if the aura can activate, false otherwise
     */
    canActivate() {
        return this.ability.canActivate();
    }

    /** Function that returns if the target is valid for the ability
     * @param {MatchCard} card
     * @returns {boolean} - true if the target is valid, false otherwise
     */
    isValidTarget(card) {
        const match = matchRegistry.get(this.matchId);
        let targetingManager = new TargetingManager(match);
        const player = match.getPlayer(card.owner);
        const validTarget = targetingManager.areValidTargets(player, [card.id], this.ability.target);
        return validTarget;
    }

}

module.exports = MatchAura;