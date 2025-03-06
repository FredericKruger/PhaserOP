class DonTravellingState extends DonCardState {

    constructor(card) {
        super(card, DON_CARD_STATES.TRAVELLING);

        /** @type {GameCardUI} */
        this.donOverCharacter = null;
    }

    onDrag(pointer, gameObject, dragX, dragY) {
        gameObject.setPosition(dragX, dragY);

        //Calculate relative position of X to the width
        let relX = dragX / gameObject.scene.screenWidth;
        let relY = dragY / gameObject.scene.screenHeight;

        const hoveredCard = gameObject.scene.activePlayerScene.donDraggedOverCharacter(pointer.position.x, pointer.position.y);
        if(hoveredCard) {
            gameObject.scaleTo(CARD_SCALE.DON_OVER_CHARACTER, true, false, false);
        } else {
            gameObject.scaleTo(CARD_SCALE.DON_IN_ACTIVE_DON, true, false, false);
        }
        if(hoveredCard !== this.donOverCharacter) {
            if(this.donOverCharacter !== null) this.donOverCharacter.hoveredDon = null;
            this.donOverCharacter = hoveredCard;
            if(this.donOverCharacter !== null) this.donOverCharacter.hoveredDon = gameObject;
        }

        gameObject.scene.game.gameClient.sendCardDragPosition(gameObject.id, 'DonCardUI', relX, relY);
    }
 
    onDragEnd(pointer, gameObject, dropped) {
        if(this.donOverCharacter !== null) this.donOverCharacter.hoveredDon = null;
        this.donOverCharacter = null;

        if(!dropped) {
            //Reset the cards position
            gameObject.x = gameObject.input.dragStartX;
            gameObject.y = gameObject.input.dragStartY;

            //check if this is a don card dropped over a character
            let character = gameObject.scene.activePlayerScene.donDraggedOverCharacter(pointer.position.x, pointer.position.y);
            if(character !== null) {
                gameObject.scene.game.gameClient.requestPlayerAttachDonToCharacter(gameObject.id, character.id);
            } else {
                //Reset card state
                gameObject.setState(CARD_STATES.DON_ACTIVE);
                gameObject.setDepth(DEPTH_VALUES.DON_IN_PILE);
                gameObject.scene.tweens.chain({
                    targets: gameObject,
                    tweens: gameObject.scene.animationLibrary.animation_move_don_characterarea2activearea(gameObject)
                });

                gameObject.scene.game.gameClient.sendCardDragEnd(gameObject.id, 'DonCardUI');
            }
        }
        this.card.scene.gameState.exit(GAME_STATES.ACTIVE_INTERACTION);
    }

    onDrop(pointer, gameObject, dropZone) {
        if(this.donOverCharacter !== null) this.donOverCharacter.hoveredDon = null;
        this.donOverCharacter = null;

        if(dropZone.getData('name') === 'CharacterArea') {
            let character = gameObject.scene.activePlayerScene.donDraggedOverCharacter(pointer.position.x, pointer.position.y);
            if(character !== null) {
                gameObject.scene.game.gameClient.requestPlayerAttachDonToCharacter(gameObject.id, character.id);
            } else {
                //Reset card state
                gameObject.setState(CARD_STATES.DON_ACTIVE);
                gameObject.setDepth(DEPTH_VALUES.DON_IN_PILE);
                gameObject.scene.tweens.chain({
                    targets: gameObject,
                    tweens: gameObject.scene.animationLibrary.animation_move_don_characterarea2activearea(gameObject)
                });

                gameObject.scene.game.gameClient.sendCardDragEnd(gameObject.id, 'DonCardUI');
            }

            //gameObject.scene.game.gameClient.sendCardDragEnd(gameObject.id, 'DonCardUI');
        }
        this.card.scene.gameState.exit(GAME_STATES.ACTIVE_INTERACTION);
    }

}
