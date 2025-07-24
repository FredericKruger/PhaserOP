class InPlayState extends GameCardState {

    /** Constructor
     * @param {GameCardUI} card - The card that the state is in
     */
    constructor(card) {
        super(card, GAME_CARD_STATES.IN_PLAY);
    }

    enter() {
        this.card.locationPowerText.setVisible(true);
        for(let abilityButton of this.card.abilityButtons) abilityButton.setVisible(this.card.frontArt.visible);
        super.enter();
    }

    exit(newState) {
        this.card.locationPowerText.setVisible(false);
        for(let abilityButton of this.card.abilityButtons) abilityButton.setVisible(false);
        super.exit(newState);
    }

    onPointerOver(pointer, gameObject) {
        gameObject.showGlow(COLOR_ENUMS.OP_WHITE);
        if(this.card.scene.gameState.name !== GAME_STATES.DRAGGING 
            && this.card.scene.gameState.name !== GAME_STATES.TARGETING) {
            if(!gameObject.donFanShowing) gameObject.fanOutDonCards(); //Make sure not to fan twice
            if(!gameObject.counterFanShowing && !gameObject.counterFanShowingManual) gameObject.fanOutCounterCards(); //Make sure not to fan twice
        }
        gameObject.scene.game.gameClient.sendCardPointerOver(gameObject.id, CARD_STATES.IN_PLAY, gameObject.playerScene === gameObject.scene.activePlayerScene);
    }

    onPointerOut(pointer, gameObject) {
        if (!this.isPointerWithinCardBounds(pointer, gameObject)) {
            gameObject.hideGlow();
            if(this.card.scene.gameState.name !== GAME_STATES.DRAGGING 
                && this.card.scene.gameState.name !== GAME_STATES.TARGETING) {
                    if(gameObject.donFanShowing) gameObject.fanInDonCards();
                    if(gameObject.counterFanShowing && !gameObject.counterFanShowingManual) gameObject.fanInCounterCards(); //Make sure not to fan twice

                for(let abilityButton of gameObject.abilityButtons) abilityButton.onPointerOut(true);
            }
            gameObject.scene.game.gameClient.sendCardPointerOut(gameObject.id, CARD_STATES.IN_PLAY, gameObject.playerScene === gameObject.scene.activePlayerScene);
        }
    }

    onPointerDown(pointer, gameObject) {
        //Start the attack selection
        if(this.card.state === GAME_CARD_STATES.IN_PLAY) {
            gameObject.scene.game.gameClient.requestStartTargetingAttack(gameObject.id);
        }
    }

    update() {
        for(let ability of this.card.abilities) ability.update();
        for(let aura of this.card.auras) aura.ability.update();
        for(let abilityButton of this.card.abilityButtons) abilityButton.update();

        this.card.updatePowerText();

        //Create animation if the player is on the last card
        if(this.card.cardData.isleader === 1) {
            if(this.card.playerScene.lifeDeck.cards.length === 0) this.card.showNoLifeAnimation();
            else this.card.hideNoLifeAnimation();
        }
    }

    /** Function to check if there are valid targets */
    isValidTarget() {
        //check is there is a target manager
        let targetManager = this.card.scene.getActiveTargetManager();
        if(!targetManager) return;

        let isValid = targetManager.isValidTarget(this.card);
        if(isValid) this.card.showGlow(COLOR_ENUMS.OP_GREEN);
        else this.card.hideGlow();
    }

    // Helper method to check if pointer is within card bounds including ability buttons
    isPointerWithinCardBounds(pointer, gameObject) {
        const cardBounds = gameObject.frontArt.getBounds();
        
        // Add a small tolerance margin to account for floating-point precision issues
        const tolerance = 1; // 1 pixel tolerance

        // Extend bounds to include ability buttons with tolerance
        let extendedBounds = {
            left: cardBounds.x + tolerance,
            top: cardBounds.y + tolerance,
            right: cardBounds.x + cardBounds.width - tolerance,
            bottom: cardBounds.y + cardBounds.height - tolerance
        };
    
        // Use Math.floor/Math.ceil for more reliable integer comparison
        const pointerX = Math.round(pointer.worldX);
        const pointerY = Math.round(pointer.worldY);
        const leftBound = Math.floor(extendedBounds.left);
        const rightBound = Math.ceil(extendedBounds.right);
        const topBound = Math.floor(extendedBounds.top);
        const bottomBound = Math.ceil(extendedBounds.bottom);
        
        // Check if pointer is within extended bounds
        return pointerX > leftBound && 
            pointerX < rightBound && 
            pointerY > topBound && 
            pointerY < bottomBound;
    }

}