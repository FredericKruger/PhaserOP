class FirstTurnState extends GameCardState {

    /** Constructor
     * @param {GameCardUI} card - The card that the state is in
     */
    constructor(card) {
        super(card, GAME_CARD_STATES.FIRST_TURN);
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
        if(this.card.state === CARD_STATES.IN_PLAY_FIRST_TURN && this.card.hasRush) {
            gameObject.scene.game.gameClient.requestStartTargetingAttack(gameObject.id);
        }
    }

    update() {
        for(let ability of this.card.abilities) {
            ability.update();
        }
        for(let aura of this.card.auras) {
            aura.ability.update();
        }
        this.card.updatePowerText();

        //Create animation if the player is on the last card
        if(this.card.cardData.isleader === 1) {
            if(this.card.playerScene.lifeDeck.cards.length === 0) this.card.showNoLifeAnimation();
            else this.card.hideNoLifeAnimation();
        }
    }

}