class TargetingState extends GameState {

    constructor(scene, previousState) {
        super(scene, GAME_STATES.TARGETING, previousState);
    } 

    enter() {
        super.enter();
        this.scene.gameStateUI.nextTurnbutton.fsmState.exit(NEXT_TURN_BUTTON_FSM_STATES.CANCEL);
    }

    onPointerOver(pointer, gameObject) {
        // Call the original behavior
        gameObject.fsmState.onPointerOver(pointer, gameObject);
        
        // Add bump animation for valid targets during targeting
        if (gameObject instanceof GameCardUI && this.scene.targetingArrow.isTargeting) {

            // Check if the card belongs to the opponent (passive player)
            const isOpponentCard = gameObject.playerScene === this.scene.passivePlayerScene;
        
            // Check if the card is in the opponent's hand
            const isInOpponentHand = isOpponentCard && 
                gameObject.playerScene.hand && 
                gameObject.playerScene.hand.cards && 
                gameObject.playerScene.hand.cards.includes(gameObject);

            // Don't animate cards in the opponent's hand as missing cardData
            if(isInOpponentHand) return;
        
            // Check if this is a valid target for the current targeting action
            const isValidTarget = this.scene.targetManager.isValidTarget(gameObject);
            
            if (isValidTarget.isValid) {
                // Stop any existing tweens on this card to prevent conflicts
                this.scene.tweens.killTweensOf(gameObject);
                
                // Store original scale to restore later
                if (!gameObject.originalScale) {
                    gameObject.originalScale = {
                        x: gameObject.scaleX,
                        y: gameObject.scaleY
                    };
                }
                
                // Small bump animation
                this.scene.tweens.add({
                    targets: gameObject,
                    scaleX: gameObject.originalScale.x * 1.05,
                    scaleY: gameObject.originalScale.y * 1.05,
                    y: gameObject.y - 5, // Slight lift
                    duration: 200,
                    ease: 'Back.easeOut',
                    onComplete: () => {
                        // Subtle pulsing while hovered
                        this.scene.tweens.add({
                            targets: gameObject,
                            scaleX: gameObject.originalScale.x * 1.03,
                            scaleY: gameObject.originalScale.y * 1.03,
                            y: gameObject.y - 3,
                            duration: 500,
                            yoyo: true,
                            repeat: -1,
                            ease: 'Sine.easeInOut'
                        });
                        
                        // Optional: Add a subtle glow effect
                        try {
                            if (!gameObject.targetGlow) {
                                gameObject.targetGlow = this.scene.add.graphics();
                                gameObject.targetGlow.setDepth(gameObject.depth - 1);
                            }
                            
                            // Clear any existing glow
                            gameObject.targetGlow.clear();
                            
                            // Draw glow around card
                            gameObject.targetGlow.fillStyle(COLOR_ENUMS.OP_YELLOW, 0.3);
                            gameObject.targetGlow.fillRoundedRect(
                                gameObject.x - (gameObject.width * gameObject.scaleX * 0.55),
                                gameObject.y - (gameObject.height * gameObject.scaleY * 0.55),
                                gameObject.width * gameObject.scaleX * 1.1,
                                gameObject.height * gameObject.scaleY * 1.1,
                                8
                            );
                            
                            // Animate glow opacity
                            this.scene.tweens.add({
                                targets: gameObject.targetGlow,
                                alpha: 0.5,
                                duration: 500,
                                yoyo: true,
                                repeat: -1,
                                ease: 'Sine.easeInOut'
                            });
                        } catch (e) {
                            // Silently fail if glow effect can't be created
                        }
                    }
                });
            }
        }
    }

    onPointerOut(pointer, gameObject) {
        // Call the original behavior
        gameObject.fsmState.onPointerOut(pointer, gameObject);
        
        // Reset card animation if we were targeting it
        if (gameObject instanceof GameCardUI && gameObject.originalScale) {
            // Stop any existing tweens
            this.scene.tweens.killTweensOf(gameObject);
            
            // Return to original state with a small animation
            this.scene.tweens.add({
                targets: gameObject,
                scaleX: gameObject.originalScale.x,
                scaleY: gameObject.originalScale.y,
                y: gameObject.y + 5, // Return from lifted position
                duration: 200,
                ease: 'Back.easeOut',
                onComplete: () => {
                    // Remove glow effect if it exists
                    if (gameObject.targetGlow) {
                        gameObject.targetGlow.clear();
                        this.scene.tweens.killTweensOf(gameObject.targetGlow);
                        gameObject.targetGlow.setAlpha(0);
                    }
                }
            });
        }
    }
    
    onPointerDown(pointer, gameObject) {
        if(pointer.rightButtonDown()) {
            this.scene.actionLibrary.cancelTargetingAction();
        } else {
            if(gameObject === this.scene.gameStateUI.nextTurnbutton) this.scene.gameStateUI.nextTurnbutton.fsmState.onPointerDown(pointer, gameObject);
            if(gameObject instanceof GameCardUI) this.scene.targetManager.addTarget(gameObject);
            else this.scene.actionLibrary.cancelTargetingAction();
        }
    }

    update() {
        if(this.scene.targetingArrow.isTargeting) {
            let posX = this.scene.input.mousePointer.x;
            let posY = this.scene.input.mousePointer.y;

            this.scene.targetingArrow.update(posX, posY);

            if(this.scene.targetManager.targetAction === 'ATTACK_CARD_ACTION') {
                let relX = posX / this.scene.screenWidth;
                let relY = posY / this.scene.screenHeight;
                this.scene.game.gameClient.requestUpdateTragetingPassivePlayer(relX, relY);
            }
        }

        if(this.scene.eventArrow.isTargeting) {
            let posX = this.scene.input.mousePointer.x;
            let posY = this.scene.input.mousePointer.y;

            this.scene.eventArrow.update(posX, posY);
        }

        //Update all cards in the hand to reflect if they can take an action
        for(let card of this.scene.activePlayerScene.characterArea.cards) card.fsmState.isValidTarget();
        for(let card of this.scene.activePlayerScene.leaderLocation.cards) card.fsmState.isValidTarget();
        for(let card of this.scene.activePlayerScene.stageLocation.cards) card.fsmState.isValidTarget();

        //Update all cards in the hand to reflect if they can take an action
        for(let card of this.scene.activePlayerScene.hand.cards) card.fsmState.update(); 
        for(let card of this.scene.activePlayerScene.characterArea.cards) card.fsmState.update();
        for(let card of this.scene.activePlayerScene.leaderLocation.cards) card.fsmState.update();
        for(let card of this.scene.activePlayerScene.stageLocation.cards) card.fsmState.update();

        //Update all cards in the hand to reflect if they can take an action
        for(let card of this.scene.passivePlayerScene.characterArea.cards) card.fsmState.update();
        for(let card of this.scene.passivePlayerScene.leaderLocation.cards) card.fsmState.update();
        for(let card of this.scene.passivePlayerScene.stageLocation.cards) card.fsmState.update();
    }

    exit(newState) {
        this.scene.gameStateUI.nextTurnbutton.fsmState.exit(this.scene.gameStateUI.nextTurnbutton.fsmState.previousState);
        super.exit(newState); 
    }
}