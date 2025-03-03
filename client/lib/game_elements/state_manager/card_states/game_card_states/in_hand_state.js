class InHandState extends GameCardState {
    /** Constructor
     * @param {GameCardUI} card - The card that the state is in
     */
    constructor(card) {
        super(card, GAME_CARD_STATES.IN_HAND);
    }

    exit(newState) {
        this.card.powerBox.setVisible(false);
        this.card.costIcon.setVisible(false);
        this.card.powerText.setVisible(false);
        this.card.counterIcon.setVisible(false);

        super.exit(newState);
    }

    onPointerOver(pointer, gameObject) {
        if(gameObject.playerScene.player.isActivePlayer && gameObject.state === CARD_STATES.IN_HAND) {
            gameObject.setState(CARD_STATES.IN_HAND_HOVERED);
            gameObject.playerScene.hand.update();

            gameObject.scene.game.gameClient.sendCardPointerOver(gameObject.id, CARD_STATES.IN_HAND, gameObject.playerScene === gameObject.scene.activePlayerScene);
        }
    }

    onPointerOut(pointer, gameObject) {
        if(gameObject.playerScene.player.isActivePlayer && gameObject.state === CARD_STATES.IN_HAND_HOVERED) {
            gameObject.setState(CARD_STATES.IN_HAND);
            gameObject.playerScene.hand.update();

            gameObject.scene.game.gameClient.sendCardPointerOut(gameObject.id, CARD_STATES.IN_HAND, gameObject.playerScene === gameObject.scene.activePlayerScene);
        }
    }

    onDragStart(pointer, gameObject) {
        this.card.scene.gameState.exit(GAME_STATES.DRAGGING);

        gameObject.setState(CARD_STATES.TRAVELLING_FROM_HAND);
        gameObject.scene.children.bringToTop(gameObject);

        gameObject.scaleTo(CARD_SCALE.TRAVELLING_FROM_HAND, true, false, false);
        gameObject.angleTo(0, true, false, false);

        gameObject.playerScene.hand.update();

        gameObject.scene.game.gameClient.sendCardDragStart(gameObject.id, 'GameCardUI');
    }

    //#region UPDATE FUNCTION
    update() {
        if(this.card.cardData.cost <= this.card.playerScene.activeDonDeck.getNumberOfActiveCards()) this.card.showGlow(COLOR_ENUMS.OP_ORANGE);
        else this.card.hideGlow();

        if(this.card.playerScene.player.isActivePlayer) {
            this.card.powerBox.setVisible(this.card.state === CARD_STATES.IN_HAND);
            this.card.costIcon.setVisible(this.card.state === CARD_STATES.IN_HAND);
            this.card.powerText.setVisible(this.card.state === CARD_STATES.IN_HAND);
            this.card.counterIcon.setVisible(this.card.state === CARD_STATES.IN_HAND && this.card.cardData.counter);
        }
    }
    //#endregion
}