class ActionLibrary {

    /**
     * 
     * @param {GameScene} scene 
     */
    constructor(scene) {
        this.scene = scene;

        this.actionManager = this.scene.actionManager;
    }

    /**
     * Createss an action to draw a card
     * @param {PlayerScene} playerScene 
     * @param {Object} serverCard
     * @param {string} phase
     * @param {Object} animationConfig
     * @param {Object} config
     */
    drawCardAction(playerScene, serverCard, phase, animationConfig, config) {
        let deckVisual = playerScene.deck.getTopCardVisual();

        //Create a new Duel Card
        let card = new GameCardUI(this.scene, playerScene, {
            x: deckVisual.x,
            y: deckVisual.y,
            state: CARD_STATES.IN_DECK,
            scale: CARD_SCALE.IN_DECK,
            artVisible: false,
            id: serverCard.id,
            depth: 4
        });
        card.updateCardData(serverCard.cardData, false);

        //Prepare Tweens
        let tweens = [];
        if(phase === GAME_PHASES.MULLIGAN_PHASE) tweens = this.scene.animationLibrary.animation_move_card_deck2mulligan(card, config.mulliganPosition, animationConfig.delay);
        //else this.scene.animations.animationMoveCardFromDeckToHand(card, delay); TODO

        if(config.waitForAnimationToComplete) {
            tweens = tweens.concat({
                duration: 10,
                onComplete: () => { this.scene.actionManager.completeAction(); }
            });
        }
        let start_animation = this.scene.tweens.chain({ //Create tween chain
            targets: card,
            tweens: tweens
        }).pause();

        //Create Action
        let drawAction = new Action();
        drawAction.start = () => {
            if(phase === GAME_PHASES.MULLIGAN_PHASE){card.setDepth(1);}
            else this.scene.children.bringToTop(card);

            if(phase === GAME_PHASES.MULLIGAN_PHASE) {
                card.setState(CARD_STATES.IN_MULLIGAN);
                this.scene.gameStateUI.mulliganUI.addCard(card);
            } else {
                card.setState(CARD_STATES.TRAVELLING_DECK_HAND);
                playerScene.hand.addCards([card]);
            }
        };
        drawAction.start_animation = start_animation;
        drawAction.end = () => {
            if(phase !== GAME_PHASES.MULLIGAN_PHASE) {
                card.makeInteractive(true);
                card.makeDraggable(true);

                card.setState(CARD_STATES.IN_HAND);
                card.setScale(CARD_SCALE.IN_HAND);
            } else {
                card.setDepth(4);
            }
            playerScene.deck.popTopCardVisual(); //Remove the top Card Visual
        }
        drawAction.finally = () => {
            card.showGlow(COLOR_ENUMS.OP_WHITE);
            deckVisual.destroy();
        };
        drawAction.isPlayerAction = true;
        drawAction.waitForAnimationToComplete = config.waitForAnimationToComplete;
        drawAction.name = "DRAW CARD ACTION";

        //Add Action to the action stack
        this.actionManager.addAction(drawAction);
    }

    /**
     * 
     * @param {PlayerScene} playerScene 
     * @param {GameCardUI} card 
     */
    moveCardsMulliganToDeckAction(playerScene, card, animationConfig, config) {
        //Prepare Tweens
        let tweens = this.scene.animationLibrary.animation_move_card_mulligan2deck(card, animationConfig.delay);
        if(config.waitForAnimationToComplete) {
            tweens = tweens.concat({
                duration: 10,
                onComplete: () => { this.scene.actionManager.completeAction(); }
            });
        }
        let start_animation = this.scene.tweens.chain({ //Create tween chain
            targets: card,
            tweens: tweens
        }).pause();

        let action = new Action();
        action.start = () => {
            card.setDepth(1);
            card.setState(CARD_STATES.TRAVELLING_MULLIGAN_DECK);
            card.hideGlow();
        };
        action.start_animation = start_animation;
        action.finally = () => {
            //Delete the card
            this.scene.gameStateUI.mulliganUI.removeCard(card);
            card.setState(CARD_STATES.IN_DECK);
            card.destroy();

            //Add new Card Visual to deck
            playerScene.deck.addDeckVisual();
            playerScene.deck.updateCardAmountText();
        };
        action.isPlayerAction = true;
        action.waitForAnimationToComplete = config.waitForAnimationToComplete;
        action.name = "MOVE CARD MULLIGAN TO DECK ACTION";

        //Add Action to the action stack
        this.actionManager.addAction(action);
    }

    /** Creates the Play Card Action.
         * @param {GameCardUI} card - Card that is being played.
         * @param {PlayerScene} playerScene - Player Scene that is playing the card.
         * This action takes a card, and adds it to the playarea. The card will initially be drying unless it has rush.
         * This will remove the draggable state of the card and only show the card art
         * Action:
         *  start: Pay Cost, Remove from hand, add to playarea
         *  end: play exert animation to show card is drying. Send Server a message about card being played
        */
    playCardAction(playerScene, card) {
        let displayX = 100 + GAME_UI_CONSTANTS.CARD_ART_WIDTH * CARD_SCALE.IN_PLAY_ANIMATION / 2;
        let displayY = this.scene.screenCenterY;

        //play animation to show card
        let start_animation = this.scene.tweens.chain({
            targets: card,
            tweens: [
                {
                    scale: {value: CARD_SCALE.IN_PLAY_ANIMATION, duration: 150},
                    x: {value: displayX, duration: 150},
                    y: {value: displayY, duration: 150}
                }, {
                    scale: CARD_SCALE.IN_PLAY_ANIMATION,
                    duration: 750,
                    onComplete: () => {this.actionManager.completeAction();}
                }
            ]
        }).pause();

        //Prepare the tweens from the playArea animation
        let tweens2 = null;
        if(card.cardData.card === CARD_TYPES.CHARACTER) tweens2 = playerScene.characterArea.addCardAnimation(card);
        else if(card.cardData.card === CARD_TYPES.STAGE) tweens2 = playerScene.stageLocation.addCardAnimation(card);
        tweens2 = tweens2.concat({ //concat additional tween to call the completeAction function
            duration: 100,
            onComplete: () => {this.actionManager.finalizeAction();}
        });
        //Create the tween chain
        let end_animation = this.scene.tweens.chain({
            targets: card,
            tweens: tweens2
        }).pause();

        //Create the action
        let action = new Action();
        action.start = () => { //Start function
            //let cardCost = card.cardInfo.cost; 
            
            //PAY COST
            /*if(card.hasAction("SHIFT") && shifter !== null){
                this.scene.inkwell.payCost(card.cardInfo.actions.SHIFT); //Pay shifting cost
            } else {
                this.scene.inkwell.payCost(cardCost); //Pay card cost on the inkwell
            }*/

            playerScene.hand.removeCard(card); //Remove the card form the hand

            card.isInPlayAnimation = true;
            if(card.cardData.card === CARD_TYPES.CHARACTER)
                playerScene.characterArea.addCard(card); //Add the card to the play area
            else if(card.cardData.card === CARD_TYPES.STAGE)
                playerScene.stageLocation.addCard(card); //Add the card to the play area
        };
        action.start_animation = start_animation; //Play animation
        action.end = () => {
        };

        action.end_animation = end_animation;
        action.finally = () => {
            card.isInPlayAnimation = false;
        
            card.setState(CARD_STATES.IN_LOCATION); //Set the card state to in play
            card.makeInteractive(true);//required to reshape the bounds of the interaction
            card.makeDraggable(false); //Remove the draggable state of the card
        };

        action.isPlayerAction = true; //This is a player triggered action
        action.waitForAnimationToComplete = true; //Should wait for the endof the animation
        action.name = "PLAY";

        //Add action to the action stack
        this.actionManager.addAction(action);

        //Update playArea action
        let updateAction = new Action();
        updateAction.start = () => {playerScene.characterArea.update();};
        updateAction.isPlayerAction = true; //This is a player triggered action
        updateAction.waitForAnimationToComplete = false; //Should wait for the endof the animation
        //Add action to the action stack
        this.actionManager.addAction(updateAction);
    }


}