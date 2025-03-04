class TravellingState extends GameCardState {
    /** Constructor
     * @param {GameCardUI} card - The card that the state is in
     * @param {string} name - The name of the state
     */
    constructor(card) {
        super(card, GAME_CARD_STATES.TRAVELLING);
    }

    onDrag(pointer, gameObject, dragX, dragY) {
        gameObject.setPosition(dragX, dragY);

        //Calculate relative position of X to the width
        let relX = dragX / gameObject.scene.screenWidth;
        let relY = dragY / gameObject.scene.screenHeight;

        gameObject.scene.game.gameClient.sendCardDragPosition(gameObject.id, 'GameCardUI', relX, relY);
    }

    onDragEnd(pointer, gameObject, dropped) {
        if(!dropped) {
            //Reset the cards position
            gameObject.x = gameObject.input.dragStartX;
            gameObject.y = gameObject.input.dragStartY;

            //Reset card state
            gameObject.setState(CARD_STATES.IN_HAND);
            gameObject.playerScene.hand.update();

            gameObject.scene.game.gameClient.sendCardDragEnd(gameObject.id, 'GameCardUI');
        }
        this.card.scene.gameState.exit(GAME_STATES.ACTIVE_INTERACTION);
    }

    onDrop(pointer, gameObject, dropZone) {
        if(dropZone.getData('name') === 'CharacterArea') {
            gameObject.scene.game.gameClient.requestPlayerPlayCard(gameObject.id);
        }
        this.card.scene.gameState.exit(GAME_STATES.ACTIVE_INTERACTION);
    }
}