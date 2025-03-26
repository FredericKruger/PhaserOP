const ServerAbility = require('./server_ability');
const Match = require('../match_objects/match');


class ServerPassiveAbility extends ServerAbility {

    constructor(config) {
        super(config);
    }

    addPassivePower(card, state){
        let additionalPower = 0;
        if(this.canActivate(card, state)) {
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