class TravellingStateDuringCounter extends GameCardState {
    /** Constructor
     * @param {GameCardUI} card - The card that the state is in
     * @param {string} name - The name of the state
     */
    constructor(card) {
        super(card, GAME_CARD_STATES.TRAVELLING_DURING_COUNTER);

        /** @type {GameCardUI} */
        this.counterOverCharacter = null; //To save what character the counter is currently over

        // Track animation state
        this.hoverTween = null;
        this.glowEffect = null;
    }

    onDrag(pointer, gameObject, dragX, dragY) {
        gameObject.setPosition(dragX, dragY);

        //Calculate relative position of X to the width
        let relX = dragX / gameObject.scene.screenWidth;
        let relY = dragY / gameObject.scene.screenHeight;

        if(gameObject.cardData.counter) {
            //Checked if a counter is hovered over a defending character
            const hoveredCard = gameObject.scene.activePlayerScene.counterDraggedOverCharacter(pointer.position.x, pointer.position.y);

            // Handle hover state changes
            if(hoveredCard !== this.counterOverCharacter) {
                // Clean up previous hover effects
                this._clearHoverEffects();
                
                // Update hover target
                if(this.counterOverCharacter !== null) this.counterOverCharacter.tempAttachedCounter = null;
                this.counterOverCharacter = hoveredCard;
                
                // Apply new hover effects
                if(this.counterOverCharacter !== null) {
                    this.counterOverCharacter.tempAttachedCounter = gameObject;
                    this._createHoverEffects(gameObject);
                }
            }

            // Apply appropriate scale based on hover state
            if(hoveredCard) {
                // Apply smooth scale transition when over character
                if (!gameObject.isScalingToCounterOverCharacter) {
                    gameObject.isScalingToCounterOverCharacter = true;
                    gameObject.scene.tweens.add({
                        targets: gameObject,
                        scale: CARD_SCALE.COUNTER_OVER_CARD,
                        duration: 150,
                        ease: 'Back.easeOut',
                        onComplete: () => {
                            gameObject.isScalingToCounterOverCharacter = false;
                        }
                    });
                }
            } else {
                // Apply smooth scale transition when not over character
                if (!gameObject.isScalingToNormal) {
                    gameObject.isScalingToNormal = true;
                    gameObject.scene.tweens.add({
                        targets: gameObject,
                        scale: CARD_SCALE.TRAVELLING_FROM_HAND,
                        duration: 150,
                        ease: 'Sine.easeOut',
                        onComplete: () => {
                            gameObject.isScalingToNormal = false;
                        }
                    });
                }
            }
        }

        gameObject.scene.game.gameClient.sendCardDragPosition(gameObject.id, 'GameCardUI', relX, relY);
    }

    onDragEnd(pointer, gameObject, dropped) {
        // Clear all visual effects
        this._clearHoverEffects();

        if(this.counterOverCharacter !== null) this.counterOverCharacter.tempAttachedCounter = null;
        this.counterOverCharacter = null;

        if(!dropped) {
            //Reset the cards position
            gameObject.x = gameObject.input.dragStartX;
            gameObject.y = gameObject.input.dragStartY;

            let sendCardToHand = true;
            if(gameObject.cardData.counter) {
                const character = gameObject.scene.activePlayerScene.counterDraggedOverCharacter(pointer.position.x, pointer.position.y);
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
        // Clear all visual effects
        this._clearHoverEffects();

        if(this.counterOverCharacter !== null) this.counterOverCharacter.tempAttachedCounter = null;
        this.counterOverCharacter = null;

        if(dropZone.getData('name') === 'CharacterArea' ) {
            
            //If the character is dropped during the counter interaction state, attach the counter to the character
            let sendCardToHand = true;
            if(gameObject.cardData.counter) {
                const character = gameObject.scene.activePlayerScene.counterDraggedOverCharacter(pointer.position.x, pointer.position.y);
                if(character !== null) {
                    gameObject.scene.game.gameClient.requestPlayerAttachCounterToCharacter(gameObject.id, character.id);
                    sendCardToHand = false;
                } 
            } else if(gameObject.cardData.card === CARD_TYPES.EVENT && gameObject.hasAbility("ON_PLAY") && gameObject.canActivateAbility("ON_PLAY")) {
                sendCardToHand = false;
                gameObject.scene.game.gameClient.requestPlayerPlayCard(gameObject.id); 
            }
            if(sendCardToHand) {
                gameObject.setState(CARD_STATES.IN_HAND);
                gameObject.playerScene.hand.update();
            }
        }
    }

    //#region EFFECT CREATION
    /**
     * Creates visual effects for hovering a DON card over a character
     * @param {GameCardUI} card - The don card being hovered
     */
    _createHoverEffects(card) {
        const target = this.counterOverCharacter;
        if (!target) return;
            
        // Add subtle pulse to the character
        this.characterPulseTween = card.scene.tweens.add({
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
            if (this.counterOverCharacter) {
                if(this.counterOverCharacter.cardData.card === CARD_TYPES.CHARACTER) this.counterOverCharacter.setScale(CARD_SCALE.IN_LOCATION);
                else if(this.counterOverCharacter.cardData.card === CARD_TYPES.LEADER) this.counterOverCharacter.setScale(CARD_SCALE.IN_LOCATION_LEADER);
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