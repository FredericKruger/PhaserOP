class FirstTurnState extends GameCardState {

    /** Constructor
     * @param {GameCardUI} card - The card that the state is in
     */
    constructor(card) {
        super(card, GAME_CARD_STATES.FIRST_TURN);
    }

    enter() {
        this.card.frontArt.setPipeline(PIPELINE_ENUMS.GREYSCALE_PIPELINE);
        super.enter();
    }

    exit(newState) {
        this.card.frontArt.resetPipeline();
        super.exit(newState);
    }

    onPointerOver(pointer, gameObject) {
        gameObject.showGlow(COLOR_ENUMS.OP_WHITE);
        gameObject.scene.game.gameClient.sendCardPointerOver(gameObject.id, CARD_STATES.IN_PLAY, gameObject.playerScene === gameObject.scene.activePlayerScene);
    }

    onPointerOut(pointer, gameObject) {
        gameObject.hideGlow();
        gameObject.scene.game.gameClient.sendCardPointerOut(gameObject.id, CARD_STATES.IN_PLAY, gameObject.playerScene === gameObject.scene.activePlayerScene);
    }

    update() {
        //this.card.hideGlow();
    }

}