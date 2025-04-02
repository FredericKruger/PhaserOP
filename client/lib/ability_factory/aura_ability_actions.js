const AuraAbilityActions = {
    /** Function to add Counter to Defender
     * @param {GameScene} scene
     * @param {GameCardUI} card
     * @param {Object} params
     * @param {boolean} active,
     * @param {GameCardUI} target
     */
    addPowerToCard_Aura: (scene, card, params, active, target) => {
        let value = params.amount;
        if(!active) value = -value;
        target.passiveEventPower += value;
        target.updatePowerText();
    },
    canBlock_Aura: (scene, card, params, active, target) => {
        let value = params.value;
        if(!active) value = !value;
        target.canBlock = value;
    }

};