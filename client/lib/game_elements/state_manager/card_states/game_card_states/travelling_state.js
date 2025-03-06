class TravellingState extends GameCardState {
    /** Constructor
     * @param {GameCardUI} card - The card that the state is in
     * @param {string} name - The name of the state
     */
    constructor(card) {
        super(card, GAME_CARD_STATES.TRAVELLING);

        /** @type {GameCardUI} */
        this.counterOverCharacter = null; //To save what character the counter is currently over
    }

    onDrag(pointer, gameObject, dragX, dragY) {
        gameObject.setPosition(dragX, dragY);

        //Calculate relative position of X to the width
        let relX = dragX / gameObject.scene.screenWidth;
        let relY = dragY / gameObject.scene.screenHeight;

        if(this.card.scene.gameState === GAME_STATES.COUNTER_INTERACTION && gameObject.cardData.counter) {
            //Checked if a counter is hovered over a defending character
            const hoveredCard = gameObject.scene.activePlayerScene.counterDraggedOverDefendingCharacter(pointer.position.x, pointer.position.y);
            if(hoveredCard !== null) {
                gameObject.scaleTo(CARD_SCALE.DON_OVER_CHARACTER, true, false, false);
            } else {
                gameObject.scaleTo(CARD_SCALE.TRAVELLING_FROM_HAND, true, false, false);
            }

            //Temporarily attach the ocunter to the character to reflect updates in the UI
            if(hoveredCard !== this.counterOverCharacter) {
                if(this.counterOverCharacter !== null) this.counterOverCharacter.attachedCounter = null;
                this.counterOverCharacter = hoveredCard;
                if(this.counterOverCharacter !== null) this.counterOverCharacter.attachedCounter = gameObject;
            }
        }

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
        //Dont change states for countering as different rules apply
        //if(GAME_STATES !== GAME_STATES.COUNTER_INTERACTION) this.card.scene.gameState.exit(GAME_STATES.ACTIVE_INTERACTION);
    }

    onDrop(pointer, gameObject, dropZone) {
        if(dropZone.getData('name') === 'CharacterArea') {
            gameObject.scene.game.gameClient.requestPlayerPlayCard(gameObject.id);
        }
        //Dont change states for countering as different rules apply
        //if(GAME_STATES !== GAME_STATES.COUNTER_INTERACTION) this.card.scene.gameState.exit(GAME_STATES.ACTIVE_INTERACTION);
    }
}