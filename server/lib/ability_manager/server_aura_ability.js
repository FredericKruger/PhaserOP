const ServerAbility = require('./server_ability');
const Match = require('../match_objects/match');


class ServerAuraAbility extends ServerAbility {

    constructor(config, cardId, matchId) {
        super(config, cardId, matchId);
    }

    /** Function to add Power to a card 
     * * @param {MatchCard} target - target card
    */
    addPassivePower(target){
        const match = matchRegistry.get(this.matchId);
        const card = target;

        let additionalPower = 0;
        if(this.canActivate(card, match.state.current_phase)) {
            for(let action of this.actions){
                if(action.name === 'addPowerToCard_Aura'){
                    additionalPower += action.params.amount;
                }
            }
        }

        return additionalPower
    }

    /** Function to return if the card has rush */
    canBlock(target){
        const match = matchRegistry.get(this.matchId);
        const card = target;

        let canBlock = true;
        if(this.canActivate(card, match.state.current_phase)) {
            for(let action of this.actions){
                if(action.name === 'canBlock_Aura'){
                    canBlock = action.params.value;
                }
            }
        }

        return canBlock;
    }

}

module.exports = ServerAuraAbility;