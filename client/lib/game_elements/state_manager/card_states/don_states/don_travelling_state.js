class DonTravellingState extends DonCardState {

    constructor(card) {
        super(card, DON_CARD_STATES.TRAVELLING);

        /** @type {GameCardUI} */
        this.donOverCharacter = null;
        
        // Track animation state
        this.hoverTween = null;
        this.glowEffect = null;
    }

    //#region DRAG
    onDrag(pointer, gameObject, dragX, dragY) {
        gameObject.setPosition(dragX, dragY);

        //Calculate relative position of X to the width
        let relX = dragX / gameObject.scene.screenWidth;
        let relY = dragY / gameObject.scene.screenHeight;

        const hoveredCard = gameObject.scene.activePlayerScene.donDraggedOverCharacter(pointer.position.x, pointer.position.y);
        
        // Handle hover state changes
        if(hoveredCard !== this.donOverCharacter) {
            // Clean up previous hover effects
            this._clearHoverEffects();
            
            // Update hover target
            if(this.donOverCharacter !== null) this.donOverCharacter.hoveredDon = null;
            this.donOverCharacter = hoveredCard;
            
            // Apply new hover effects
            if(this.donOverCharacter !== null) {
                this.donOverCharacter.hoveredDon = gameObject;
                this._createHoverEffects(gameObject);
            }
        }
        
        // Apply appropriate scale based on hover state
        if(hoveredCard) {
            // Apply smooth scale transition when over character
            if (!gameObject.isScalingToDonOverCharacter) {
                gameObject.isScalingToDonOverCharacter = true;
                gameObject.scene.tweens.add({
                    targets: gameObject,
                    scale: CARD_SCALE.DON_OVER_CHARACTER,
                    duration: 150,
                    ease: 'Back.easeOut',
                    onComplete: () => {
                        gameObject.isScalingToDonOverCharacter = false;
                    }
                });
            }
        } else {
            // Apply smooth scale transition when not over character
            if (!gameObject.isScalingToNormal) {
                gameObject.isScalingToNormal = true;
                gameObject.scene.tweens.add({
                    targets: gameObject,
                    scale: CARD_SCALE.DON_IN_ACTIVE_DON,
                    duration: 150,
                    ease: 'Sine.easeOut',
                    onComplete: () => {
                        gameObject.isScalingToNormal = false;
                    }
                });
            }
        }

        gameObject.scene.game.gameClient.sendCardDragPosition(gameObject.id, 'DonCardUI', relX, relY);
    }
    //#endregion

    //#region DRAG END
    onDragEnd(pointer, gameObject, dropped) {
        // Clear all visual effects
        this._clearHoverEffects();
        
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
    //#endregion

    //#region DROP
    onDrop(pointer, gameObject, dropZone) {
        // Clear all visual effects
        this._clearHoverEffects();
        
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
        }
        this.card.scene.gameState.exit(GAME_STATES.ACTIVE_INTERACTION);
    }
    //#endregion

    //#region EFFECT CREATION
    /**
     * Creates visual effects for hovering a DON card over a character
     * @param {DonCardUI} donCard - The don card being hovered
     */
    _createHoverEffects(donCard) {
        const target = this.donOverCharacter;
        if (!target) return;
            
        // Add subtle pulse to the character
        this.characterPulseTween = donCard.scene.tweens.add({
            targets: target,
            scale: target.scale * 1.05,
            duration: 500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }
    
    /**
     * Cleans up all hover effects
     */
    _clearHoverEffects() {
        // Stop character pulse tween
        if (this.characterPulseTween) {
            this.characterPulseTween.stop();
            this.characterPulseTween = null;
            
            // Reset character scale
            if (this.donOverCharacter) {
                if(this.donOverCharacter.cardData.card === CARD_TYPES.CHARACTER) this.donOverCharacter.setScale(CARD_SCALE.IN_LOCATION);
                else if(this.donOverCharacter.cardData.card === CARD_TYPES.LEADER) this.donOverCharacter.setScale(CARD_SCALE.IN_LOCATION_LEADER);
            }
        }
        
        // Clean up hover tween
        if (this.hoverTween) {
            this.hoverTween.stop();
            this.hoverTween = null;
        }
    }
    //#endregion
}