class AbilityFactory {

    /** Function to create an ability according to the type
     * @param {Object} abilityData
     * @returns {Ability}
     */
    static createAbility(abilityData) {
        switch (abilityData.type) {
            case 'BLOCKER':
                return new BlockerAbility(abilityData);
            case 'PASSIVE':
                return new PassiveAbility(abilityData);
            case 'ACTIVE':
                return new ActiveAbility(abilityData);
            case 'WHEN_ATTACKING':
                return new WhenAttackingAbility(abilityData);
            case 'AURA':
                return new AuraAbility(abilityData);
            default:
                return new Ability(abilityData);
        }
    }

    /** Function to attach an Ability to a card
     * @param {GameCardUI} card
     * @param {Object[]} abilitiesData
     * @returns {GameCardUI}
     */
    static attachAbilitiesToCard(card, abilitiesData) {
        card.abilities = [];
        
        if (abilitiesData && Array.isArray(abilitiesData)) {
            abilitiesData.forEach(abilityData => {
                const ability = this.createAbility(abilityData);
                ability.attachToCard(card);
                card.abilities.push(ability);
            });
        }
        
        return card;
    }

    /** Function to attach an Ability to a card
     * @param {Aura} aura
     * @param {GameCardUI} card
     * @param {Object} ability
     * @returns {Aura}
     */
    static attachAbilityToAura(aura, card, abilityData) {
        aura.ability = [];

        if (abilityData) {
            const ability = this.createAbility(abilityData);
            ability.attachToCard(card);
            ability.attachToAura(aura);
            aura.ability = ability;
        }

        return aura;
    }
}