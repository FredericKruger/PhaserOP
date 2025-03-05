class AbilityFactory {

    /** Function to create an ability according to the type
     * @param {Object} abilityData
     * @returns {Ability}
     */
    static createAbility(abilityData) {
        switch (abilityData.type) {
            case 'BLOCKER':
                return new BlockerAbility(abilityData);
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
                ability.attachTo(card);
                card.abilities.push(ability);
            });
        }
        
        return card;
    }

}