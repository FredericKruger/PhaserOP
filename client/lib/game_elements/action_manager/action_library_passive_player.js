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
        //else tweens = this.animationMoveCardFromDeckToHand(card, 0); //Use DeckToHand
        
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
            if(phase === GAME_PHASES.MULLIGAN_PHASE){card.setDepth(1);}
            else this.scene.children.bringToTop(card);

            if(phase === GAME_PHASES.MULLIGAN_PHASE) {
                card.setState(CARD_STATES.IN_MULLIGAN);
                this.scene.gameStateUI.mulliganUI.addCard(card, false);
            } else {
                card.setState(CARD_STATES.TRAVELLING_DECK_HAND);
                playerScene.hand.addCards([card]);
            }
        }
        drawAction.start_animation = start_animation; //play animation
        drawAction.end = () => { //Action end
            if(phase !== GAME_PHASES.MULLIGAN_PHASE) {
                card.setState(CARD_STATES.IN_HAND);
                card.setScale(CARD_SCALE.IN_HAND_PASSIVE_PLAYER);
            } else {
                card.setDepth(2);
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
            card.setState(CARD_STATES.TRAVELLING_MULLIGAN_DECK);
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

}