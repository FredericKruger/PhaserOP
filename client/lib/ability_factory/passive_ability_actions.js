const passiveAbilityActions = {
    /** Function to add Counter to Defender
     * @param {GameCardUI} card
     * @param {Object} params
     * @param {boolean} active
     */
    addPowerToCard: (card, params, active) => {
        //Get Defender Card
        let value = params.amount;
        if(!active) value = -value;
        card.passiveEventPower += value;
        card.updatePowerText();
    }
};