class InHandState extends GameCardState {
    /** Constructor
     * @param {GameCardUI} card - The card that the state is in
     */
    constructor(card) {
        super(card, GAME_CARD_STATES.IN_HAND);
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
    }
    //#endregion
}