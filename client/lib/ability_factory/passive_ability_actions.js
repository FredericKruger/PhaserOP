const PassiveAbilityActions = {
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
        //Get Defender Card
        card.hasRush = active;
        if(card.turnPlayed && active) card.stopDizzyAnimation();
        else if(card.turnPlayed && !active) card.startDizzyAnimation();
    },
    /** Function to add Counter to Defender
     * @param {GameScene} scene
     * @param {GameCardUI} card
     * @param {Object} params
     * @param {boolean} active
     */
    createAura: (scene, card, params, active) => {
        //Create a new aura
        console.log("Creating new aura");
        let aura = new Aura(scene, params.auraId, params.auraData);
        scene.auraManager.addAura(aura);
    }
};