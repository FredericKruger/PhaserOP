const ServerAbility = require('./server_ability');
const Match = require('../match_objects/match');


class ServerBlockerAbility extends ServerAbility {

    constructor(config, cardId, matchId) {
        super(config, cardId, matchId);
    }

    /** Function to perform the action
     * @param {MatchCard} card
     * @param {Player} player
     * @param {Match} match
     */
    action(player, targets) {
        const match = matchRegistry.get(this.matchId);
        const card = match.matchCardRegistry.get(this.cardId);
        // Blocker ability action
        match.attackManager.attack.switchDefender(card);
        match.startBlockAttack(card.id);
    }

}

module.exports = ServerBlockerAbility;