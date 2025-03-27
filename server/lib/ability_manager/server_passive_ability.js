const ServerAbility = require('./server_ability');
const Match = require('../match_objects/match');


class ServerPassiveAbility extends ServerAbility {

    constructor(config, cardId, matchId) {
        super(config, cardId, matchId);
    }

    /** Function to add Power to a card */
    addPassivePower(){
        const match = matchRegistry.get(this.matchId);
        const card = match.matchCardRegistry.get(this.cardId);

        let additionalPower = 0;
        if(this.canActivate(card, match.state.current_phase)) {
            for(let action of this.actions){
                if(action.name === 'addPowerToCard'){
                    additionalPower += action.params.amount;
                }
            }
        }

        return additionalPower
    }

}

module.exports = ServerPassiveAbility;