class InPlayState extends GameCardState {

    /** Constructor
     * @param {GameCardUI} card - The card that the state is in
     */
    constructor(card) {
        super(card, GAME_CARD_STATES.IN_PLAY);
    }

    enter() {
        this.card.locationPowerText.setVisible(true);
        for(let abilityButton of this.card.abilityButtons) abilityButton.setVisible(true);
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
        gameObject.hideGlow();
        if(this.card.scene.gameState.name !== GAME_STATES.DRAGGING 
            && this.card.scene.gameState.name !== GAME_STATES.TARGETING) {
                if(gameObject.donFanShowing) gameObject.fanInDonCards();
                if(gameObject.counterFanShowing && !gameObject.counterFanShowingManual) gameObject.fanInCounterCards(); //Make sure not to fan twice
        }
        gameObject.scene.game.gameClient.sendCardPointerOut(gameObject.id, CARD_STATES.IN_PLAY, gameObject.playerScene === gameObject.scene.activePlayerScene);
    }

    onPointerDown(pointer, gameObject) {
        //Start the attack selection
        if(this.card.state === GAME_CARD_STATES.IN_PLAY) {
            gameObject.scene.game.gameClient.requestStartTargetingAttack(gameObject.id);
        }
    }

    update() {
        this.card.updatePowerText();
        
        for(let ability of this.card.abilities) {
            ability.update();
        }
    }

    isValidTarget() {
        let isValid = this.card.scene.targetManager.isValidTarget(this.card);
        if(isValid) this.card.showGlow(COLOR_ENUMS.OP_GREEN);
        else this.card.hideGlow();
    }

}