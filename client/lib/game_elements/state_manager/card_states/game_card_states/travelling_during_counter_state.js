class TravellingStateDuringCounter extends GameCardState {
    /** Constructor
     * @param {GameCardUI} card - The card that the state is in
     * @param {string} name - The name of the state
     */
    constructor(card) {
        super(card, GAME_CARD_STATES.TRAVELLING_DURING_COUNTER);

        /** @type {GameCardUI} */
        this.counterOverCharacter = null; //To save what character the counter is currently over
    }

    onDrag(pointer, gameObject, dragX, dragY) {
        gameObject.setPosition(dragX, dragY);

        //Calculate relative position of X to the width
        let relX = dragX / gameObject.scene.screenWidth;
        let relY = dragY / gameObject.scene.screenHeight;

        if(gameObject.cardData.counter) {
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
        if(this.counterOverCharacter !== null) this.counterOverCharacter.attachedCounter = null;
        this.counterOverCharacter = null;

        if(!dropped) {
            //Reset the cards position
            gameObject.x = gameObject.input.dragStartX;
            gameObject.y = gameObject.input.dragStartY;

            let sendCardToHand = true;
            if(gameObject.cardData.counter && !this.card.scene.attackManager.attack.counterPlayed) {
                const character = gameObject.scene.activePlayerScene.counterDraggedOverDefendingCharacter(pointer.position.x, pointer.position.y);
                if(character !== null) {
                    gameObject.scene.game.gameClient.requestPlayerAttachCounterToCharacter(gameObject.id, character.id);
                    sendCardToHand = false;
                }
            }

            if(sendCardToHand) {
                //Reset card state
                gameObject.setState(CARD_STATES.IN_HAND);
                gameObject.playerScene.hand.update();
            }

            gameObject.scene.game.gameClient.sendCardDragEnd(gameObject.id, 'GameCardUI');
        }
    }

    onDrop(pointer, gameObject, dropZone) {
        if(this.counterOverCharacter !== null) this.counterOverCharacter.attachedCounter = null;
        this.counterOverCharacter = null;

        if(dropZone.getData('name') === 'CharacterArea' ) {
            
            //If the character is dropped during the counter interaction state, attach the counter to the character
            let sendCardToHand = true;
            if(gameObject.cardData.counter && !this.card.scene.attackManager.attack.counterPlayed) {
                const character = gameObject.scene.activePlayerScene.counterDraggedOverDefendingCharacter(pointer.position.x, pointer.position.y);
                if(character !== null) {
                    gameObject.scene.game.gameClient.requestPlayerAttachCounterToCharacter(gameObject.id, character.id);
                    sendCardToHand = false;
                } 
            } else if(gameObject.cardData.card === CARD_TYPES.EVENT && gameObject.hasAbility("COUNTER")) {
                sendCardToHand = false;
                gameObject.scene.game.gameClient.requestPlayerPlayCard(gameObject.id); 
            }
            if(sendCardToHand) {
                gameObject.setState(CARD_STATES.IN_HAND);
                gameObject.playerScene.hand.update();
            }
        }
    }
}