class DonActiveState extends DonCardState {

    constructor(card) {
        super(card, DON_CARD_STATES.ACTIVE);
    }

    update() {
        card.setVisible(true);
    }

    onDragStart(pointer, gameObject) {
        this.card.scene.gameState.exit(GAME_STATES.DRAGGING);
        
        gameObject.setState(CARD_STATES.DON_TRAVELLING);

        gameObject.setDepth(DEPTH_VALUES.DON_DRAGGED);
        gameObject.scene.children.bringToTop(gameObject);
        gameObject.angleTo(0, true, false, false);

        gameObject.scene.game.gameClient.sendCardDragStart(gameObject.id, 'DonCardUI');
    }

}