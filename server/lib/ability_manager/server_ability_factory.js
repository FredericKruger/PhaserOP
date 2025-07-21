const ServerAbility = require('./server_ability');
const ServerPassiveAbility = require('./server_passive_ability');
const ServerBlockerAbility = require('./server_blocker_ability');
const ServerAuraAbility = require('./server_aura_ability');


class ServerAbilityFactory {

    constructor() {}

    /** Function to create an ability according to the type
     * @param {Object} abilityData
     * @param {number} cardId
     * @param {number} matchId
     * @returns {Ability}
     */
    createAbility(abilityData, cardId, matchId) {
        switch (abilityData.type) {
            //ase 'BLOCKER':
            //    return new ServerBlockerAbility(abilityData, cardId, matchId);
            case 'PASSIVE':
                return new ServerPassiveAbility(abilityData, cardId, matchId);
            case 'AURA':
                return new ServerAuraAbility(abilityData, cardId, matchId);
            default:
                return new ServerAbility(abilityData, cardId, matchId);
        }
    }

    /** Function to attach an Ability to a card
     * @param {Object[]} abilitiesData
     * @param {number} cardId
     * @param {number} matchId
     * @returns {Ability[]}
     */
    createAbilitiesForCard(abilitiesData, cardId, matchId) {
        const abilities = [];
        
        if (abilitiesData && Array.isArray(abilitiesData)) {
            abilitiesData.forEach(abilityData => {
                const ability = this.createAbility(abilityData, cardId, matchId);
                abilities.push(ability);
            });
        }

        return abilities;
    }

    
    /** Function to attach an Ability to a card
     * @param {Object} abilityData
     * @param {number} cardId
     * @param {number} matchId
     * @returns {Ability}
     */
    createAbilityForAura(abilityData, cardId, matchId) {
        const ability = this.createAbility(abilityData, cardId, matchId);
        return ability;
    }

}

module.exports = ServerAbilityFactory;