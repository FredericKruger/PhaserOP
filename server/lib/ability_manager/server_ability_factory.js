const ServerAbility = require('./server_ability');
const ServerBlockerAbility = require('./server_blocker_ability');


class ServerAbilityFactory {

    /** Function to create an ability according to the type
     * @param {Object} abilityData
     * @returns {Ability}
     */
    static createAbility(abilityData) {
        switch (abilityData.type) {
            case 'BLOCKER':
                return new ServerBlockerAbility(abilityData);
            default:
                return new ServerAbility(abilityData);
        }
    }

    /** Function to attach an Ability to a card
     * @param {Object[]} abilitiesData
     * @param {Match} match
     */
    static createAbilitiesForCard(abilitiesData) {
        const abilities = [];
        
        if (abilitiesData && Array.isArray(abilitiesData)) {
            abilitiesData.forEach(abilityData => {
                const ability = this.createAbility(abilityData);
                abilities.push(ability);
            });
        }

        return abilities;
    }

}

module.exports = ServerAbilityFactory;