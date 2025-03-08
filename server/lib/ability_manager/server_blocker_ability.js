const ServerAbility = require('./server_ability');
const Match = require('../match_objects/match');


class ServerBlockerAbility extends ServerAbility {

    constructor(config) {
        super(config);
    }

    /** Function to perform the action
     * @param {MatchCard} card
     * @param {Player} player
     * @param {Match} match
     */
    action(card, player, match) {
        super.action(card, match);
        // Blocker ability action
        match.attackManager.attack.switchDefender(card);
        match.startBlockAttack(card.id);
    }

}

module.exports = ServerBlockerAbility;