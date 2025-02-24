class ActionLibraryPassivePlayer {

    /** Constructor
     * @param {GameScene} scene - The scene that will contain the action manager
     */
    constructor(scene) {
        this.scene = scene;
        
        this.actionManager = this.scene.actionManager;
    }

    /** Function that draws a card for the opponent
     * @param {PlayerScene} playerScene 
     * @param {Object} serverCard
     * @param {string} phase
     * @param {Object} animationConfig
     * @param {Object} config
     */
    drawCardAction (playerScene, serverCard, phase, animationConfig, config) {
        //Create the card visual
        let deckVisual = playerScene.deck.getTopCardVisual();        
        
        //Create card
        let card = new GameCardUI(this.scene, playerScene, {
            x: deckVisual.x,
            y: deckVisual.y,
            state: CARD_STATES.IN_DECK,
            scale: CARD_SCALE.IN_DECK,
            artVisible: false,
            id: serverCard.id,
            depth: 2
        });

        //Prepare the animation
        let tweens = [];
        if(phase === GAME_PHASES.MULLIGAN_PHASE) tweens = this.scene.animationLibraryPassivePlayer.animation_move_card_deck2mulligan(card, config.mulliganPosition, animationConfig.delay); //Use DeckToMulligan is mulligan
        else if(phase === GAME_PHASES.PREPARING_FIRST_TURN) tweens = this.scene.animationLibraryPassivePlayer.animation_move_card_deck2lifedeck(card, animationConfig.delay); //Use DeckToLifeDeck if first turn
        else tweens = this.scene.animationLibraryPassivePlayer.animation_move_card_deck2hand(card, 0); //Use DeckToHand
        
        //to be able to execute a custom call at the end of the animation
        if(animationConfig.startAnimationCallback) {
            tweens = tweens.concat({
                duration: 10,
                onComplete: () => {animationConfig.startAnimationCallback();}
            });
        }
        if(config.waitForAnimationToComplete) //If waitForAnimation flag, add tween to call completeAction
            tweens = tweens.concat({
                duration: 10,
                onComplete: () => {this.scene.actionManager.completeAction();}
            });
        //Create the tween chain
        let start_animation = this.scene.tweens.chain({
            targets: card,
            tweens: tweens
        }).pause();

        //Create a new action
        // start: draw the card, bringToTop if not mulligan and add to hand. Finally redraw the hand
        // end: pop the deckpile card placeholder and comlete server request if needed
        let drawAction = new Action();
        drawAction.start = () => { //Action start
            card.setDepth(1); 

            if(phase === GAME_PHASES.MULLIGAN_PHASE) {
                card.setState(CARD_STATES.IN_MULLIGAN);
                this.scene.gameStateUI.mulliganUI.addCard(card, false);
            } else if (phase === GAME_PHASES.PREPARING_FIRST_TURN) {
                card.setState(CARD_STATES.IN_LIFEDECK);
                playerScene.lifeDeck.addCard(card);
            } else {
                card.setState(CARD_STATES.TRAVELLING_TO_HAND);
            }
        }
        drawAction.start_animation = start_animation; //play animation
        drawAction.end = () => { //Action end
            if(phase === GAME_PHASES.MULLIGAN_PHASE) {
                card.setDepth(2);
            } else if(phase === GAME_PHASES.PREPARING_FIRST_TURN) {
            } else {
                playerScene.hand.addCards([card], {setCardState: true, setCardDepth: true, setCardInteractive: false, setCardDraggable: false, updateUI: true});
            }
            playerScene.deck.popTopCardVisual(); //Remove the top Card Visualif(isServerRequest) this.scene.actions.completeServerRequest(); //Call completeServerRequest

            if(config.isServerRequest) this.scene.actionManager.completeServerRequest(); //Call completeServerRequest
        };
        drawAction.finally = () => {
            deckVisual.destroy();
        };
        drawAction.isPlayerAction = false; //Not a player action
        drawAction.waitForAnimationToComplete = config.waitForAnimationToComplete;

        //Add Action to action stack
        this.scene.actionManager.addAction(drawAction);
    }

    /**
     * Action to move a card from the mulligan back to the deck
     * @param {PlayerScene} playerScene 
     * @param {GameCardUI} card 
     */
    moveCardsMulliganToDeckAction(playerScene, card, animationConfig, config) {
        //Prepare Tweens
        let tweens = this.scene.animationLibraryPassivePlayer.animation_move_card_mulligan2deck(card, animationConfig.delay);
        tweens = tweens.concat({
            duration: 10,
            onComplete: () => { card.destroy(); }
        });
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
            card.setState(CARD_STATES.TRAVELLING_TO_DECK);
        };
        action.start_animation = start_animation;
        action.finally = () => {
            //Delete the card
            card.setState(CARD_STATES.IN_DECK);

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

    /** Creates an Action to draw a card from the Don Deck 
     * @param {PlayerScene} playerScene
     * @param {number} cardid
     * @param {string} phase
     * @param {Object} animationConfig
     * @param {Object} config
    */
    drawDonCardAction(playerScene, cardid, phase, animationConfig, config) {
        let deckVisual = playerScene.donDeck.getTopCardVisual();

        //Create a new Duel Card
        let card = new DonCardUI(this.scene, playerScene, {
            x: deckVisual.x,
            y: deckVisual.y,
            state: CARD_STATES.IN_DON_DECK,
            scale: CARD_SCALE.DON_IN_DON_DECK,
            artVisible: false,
            id: cardid,
            depth: 1
        });

        //Prepare Tweens
        let tweens = this.scene.animationLibraryPassivePlayer.animation_move_don_deck2activearea(card, animationConfig.delay);

        if(animationConfig.startAnimationCallback) {
            tweens = tweens.concat({
                duration: 10,
                onComplete: () => { animationConfig.startAnimationCallback(); }
            });
        }
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
            card.setDepth(1);
            card.setState(CARD_STATES.DON_ACTIVE);
            card.playerScene.activeDonDeck.addCard(card);

            card.playerScene.playerInfo.updateActiveCardAmountText(); //udpate the ui
        };
        drawAction.start_animation = start_animation;
        drawAction.end = () => {
            card.makeInteractive(true);
            card.makeDraggable(true);
            playerScene.donDeck.popTopCardVisual(); //Remove the top Card Visual
        }
        drawAction.finally = () => {deckVisual.destroy();};
        drawAction.isPlayerAction = true;
        drawAction.waitForAnimationToComplete = config.waitForAnimationToComplete;
        drawAction.name = "DRAW DON ACTION";

        //Add Action to the action stack
        this.actionManager.addAction(drawAction);
    }

    /** Function that plays a card for the opponent
     * @param {GameCardUI} card - Card that is being played.
    * @param {PlayerScene} playerScene - Player Scene that is playing the card.
    * @param {Array<number>} spentDonIds
     * This function is call from a server request
     * It creates an action to execute the inking and do the animation
     * Calls the completeServerRequest at the end
     */
    playCardAction(playerScene, card, spentDonIds) {
        let displayX = 100 + GAME_UI_CONSTANTS.CARD_ART_WIDTH*CARD_SCALE.IN_PLAY_ANIMATION/2;
        let displayY = this.scene.screenCenterY;

        //Create tweens
        let tweens = [];
        tweens.push({ //Tween 1: Bring card to top, then move it to center and scale up. On complete redraw the hand
            onStart: () => {this.scene.children.bringToTop(card);},
            x: displayX,
            y: displayY,
            scale: CARD_SCALE.IN_PLAY_ANIMATION,
            angle: 0,
            duration: 400,
            onComplete: () => { playerScene.hand.update(); }
        });
        tweens.push({
            scaleX: 0,
            duration: 300
        });
        tweens.push({ //Tween 3: empty tween to show the player the card for 2 seconds
            onStart: () => {card.flipCard();},
            scale: CARD_SCALE.IN_PLAY_ANIMATION,
            duration: 300
        });
        //if(card.cardData.card === CARD_TYPES.CHARACTER) tweens = tweens.concat(playerScene.characterArea.addCardAnimation(card));
        //else tweens = tweens.concat(playerScene.stageLocation.addCardAnimation(card));
        tweens.push({ //Tween 5: empty tween to call completeActin
            duration: 100,
            onComplete: () => {this.scene.actionManager.completeAction();}
        });
        //Create tween chain
        let animation = this.scene.tweens.chain({
            targets: card,
            tweens: tweens
        }).pause();


        //Create the action
        let action = new Action();
        action.start = () => { //Action start: pay card cost in inkwell. Remove card from hand and add it to the playarea
            //PAY COST
            playerScene.activeDonDeck.payCost(spentDonIds);
            
            playerScene.hand.removeCard(card); //Remove the card form the hand
            card.setDepth(1);

            card.isInPlayAnimation = true;
            if(card.cardData.card === CARD_TYPES.CHARACTER)
                playerScene.characterArea.addCard(card); //Add the card to the play area
            else if(card.cardData.card === CARD_TYPES.STAGE)
                playerScene.stageLocation.addCard(card); //Add the card to the play area
        };
        action.start_animation = animation; //play animation
        action.end = () => { //Action end: play exert animation, set interactive to let player hover over it, and completeServerRequest
        };
        action.finally = () => {
            card.isInPlayAnimation = false;

            //Refresh GameStateUI
            playerScene.playerInfo.updateCardAmountTexts();
        
            //TODO add check for rush
            if(card.cardData.card === CARD_TYPES.CHARACTER) card.setState(CARD_STATES.IN_PLAY_RESTED); //Set the card state to in play
            else card.setState(CARD_STATES.IN_PLAY); //Set the card state to in play
        }
        action.isPlayerAction = false; //This is not a player action
        action.waitForAnimation = true; //Should wait for animation to complete
        action.name = "PLAY CARD OPPONENT";

        //Add action to action stack
        this.scene.actionManager.addAction(action);

        //Update playArea action
        let updateAction = new Action();
        updateAction.start = () => {playerScene.characterArea.update();};
        updateAction.isPlayerAction = true; //This is a player triggered action
        updateAction.waitForAnimationToComplete = false; //Should wait for the endof the animation
        //Add action to the action stack
        this.actionManager.addAction(updateAction);
    }

}