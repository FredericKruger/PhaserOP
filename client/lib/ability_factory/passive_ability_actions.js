const passiveAbilityActions = {
    /** Function to add Counter to Defender
     * @param {GameScene} scene
     * @param {GameCardUI} card
     * @param {Object} params
     * @param {boolean} active
     */
    addPowerToCard: (scene, card, params, active) => {
        //Get Defender Card
        let value = params.amount;
        if(!active) value = -value;
        card.passiveEventPower += value;
        card.updatePowerText();
    },
    /** Function to add Counter to Defender
     * @param {GameScene} scene
     * @param {GameCardUI} card
     * @param {Object} params
     * @param {boolean} active
     */
    hasRush: (scene, card, params, active) => {
        console.log('hasRush', active);
        //Get Defender Card
        card.hasRush = active;
        console.log(card.turnPlayed, active);
        if(card.turnPlayed && active) card.stopDizzyAnimation();
        else if(card.turnPlayed && !active) card.startDizzyAnimation();
    }
};