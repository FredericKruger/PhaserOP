class TargetingState extends GameState {

    constructor(scene, previousState) {
        super(scene, GAME_STATES.TARGETING, previousState);

        this.inPointerOver = false; // Flag to track if the pointer is over a target
        this.inPointerOut = false; // Flag to track if the pointer is out of a target
        this.lastCardOver = null;
    } 

    enter() {
        super.enter();
        this.scene.gameStateUI.nextTurnbutton.fsmState.exit(NEXT_TURN_BUTTON_FSM_STATES.CANCEL);
        this.targetManager = this.scene.getActiveTargetManager();
    }

    onPointerOver(pointer, gameObject) {
        // Call the original behavior
        //if(gameObject.fsmState) gameObject.fsmState.onPointerOver(pointer, gameObject);
        
        let card = null;
        if(gameObject instanceof GameCardUI) card = gameObject;
        else if(gameObject instanceof AbilityButton) card = gameObject.card;

        // Add bump animation for valid targets during targeting
        if (card instanceof GameCardUI 
            && !card.isInPlayAnimation
            && this.targetManager.targetArrow.isTargeting) {

            // Check if the card belongs to the opponent (passive player)
            const isOpponentCard = card.playerScene === this.scene.passivePlayerScene;
        
            // Check if the card is in the opponent's hand
            const isInOpponentHand = isOpponentCard && 
                card.playerScene.hand && 
                card.playerScene.hand.cards && 
                card.playerScene.hand.cards.includes(card);

            // Don't animate cards in the opponent's hand as missing cardData
            if(isInOpponentHand) return;
        
            // Check if this is a valid target for the current targeting action
            const isValidTarget = this.targetManager.isValidTarget(card);
            
            if (isValidTarget.isValid && !card.isTargetted && !this.inPointerOver) {
                //Save the current targetting object
                this.inPointerOver = true;
                card.isTargetted = true;
                this.lastCardOver = card; // Save the last card over
                 
                // First, kill only targeting-related tweens
                card.targetingTweens.forEach(tween => {
                    tween.stop();
                    tween.remove();
                });
                card.targetingTweens = [];
                
                // Store original scale to restore later
                card.originalScale = {
                    x: card.scaleX,
                    y: card.scaleY,
                    posX: card.x,
                    posY: card.y
                };
                
                // Small bump animation
                let bumpTween = this.scene.tweens.add({
                    targets: card,
                    scaleX: card.originalScale.x * 1.05,
                    scaleY: card.originalScale.y * 1.05,
                    y: card.y - 5, // Slight lift
                    duration: 200,
                    ease: 'Back.easeOut',
                    onComplete: () => {
                        // Subtle pulsing while hovered
                        let pulseTween = this.scene.tweens.add({
                            targets: card,
                            scaleX: card.originalScale.x * 1.03,
                            scaleY: card.originalScale.y * 1.03,
                            y: card.y - 3,
                            duration: 500,
                            yoyo: true,
                            repeat: -1,
                            ease: 'Sine.easeInOut'
                        });
                        
                        // Track this tween
                        card.targetingTweens.push(pulseTween);
                    }
                });
                
                // Track this tween
                card.targetingTweens.push(bumpTween);
                this.inPointerOver = false; // Reset pointer over flag
            }
        }
    }

    onPointerOut(pointer, gameObject) {
        // Call the original behavior
        //if(gameObject.fsmState) gameObject.fsmState.onPointerOut(pointer, gameObject);
        
        let card = null;
        if(gameObject instanceof GameCardUI) card = gameObject;
        else if(gameObject instanceof AbilityButton) card = gameObject.card;

        // Reset card animation if we were targeting it
        if (card instanceof GameCardUI 
            && card.isTargetted
            && !this.inPointerOut
        ) {
            this.inPointerOut = true;

            // Stop only the targeting-related tweens
            card.targetingTweens.forEach(tween => {
                tween.stop();
                tween.remove();
            });
            card.targetingTweens = [];

            // Return to original state with a small animation
            let resetTween = this.scene.tweens.add({
                targets: card,
                scaleX: card.originalScale.x,
                scaleY: card.originalScale.y,
                y: card.originalScale.posY, // Return from lifted position
                duration: 200,
                ease: 'Back.easeOut',
                onComplete: () => {
                    // Remove glow effect if it exists
                    if(card) card.hideGlow();
                    
                    card.isTargetted = false; //reset pointer*/
                    card.originalScale = null; //reset pointer
                    this.inPointerOut = false;
                }
            });

            card.targetingTweens.push(resetTween);
        }
        
        //if (gameObject instanceof GameCardUI) gameObject.originalScale = null;
    }
    
    onPointerDown(pointer, gameObject) {
        if(pointer.rightButtonDown()) {
            this.scene.actionLibrary.cancelTargetingAction();
        } else {
            if(gameObject === this.scene.gameStateUI.nextTurnbutton) this.scene.gameStateUI.nextTurnbutton.fsmState.onPointerDown(pointer, gameObject);
            else if(gameObject instanceof GameCardUI) this.targetManager.addTarget(gameObject);
            else this.scene.actionLibrary.cancelTargetingAction();
        }
    }

    update() {
        if(this.targetManager.targetArrow.isTargeting) {
            let posX = this.scene.input.mousePointer.x;
            let posY = this.scene.input.mousePointer.y;

            this.targetManager.targetArrow.update(posX, posY);
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
        // Find any cards that are currently being targeted
        if(this.lastCardOver && this.lastCardOver.isTargetted) {
            this.onPointerOut(null, this.lastCardOver); // Reset the last card over
        } 
        this.scene.gameStateUI.nextTurnbutton.fsmState.exit(this.scene.gameStateUI.nextTurnbutton.fsmState.previousState);
        super.exit(newState); 
    }
}