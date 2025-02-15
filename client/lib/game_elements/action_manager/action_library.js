class ActionLibrary {

    /**
     * 
     * @param {GameScene} scene 
     */
    constructor(scene) {
        this.scene = scene;

        this.actionManager = this.scene.actionManager;
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
    playCardAction(card, playerScene) {
        let displayX = 100 + GAME_UI_CONSTANTS.CARD_ART_WIDTH * CARD_SCALE.IN_PLAY_ANIMATION / 2;
        let displayY = this.scene.screenCenterY;

        //play animation to show card
        let animation = this.scene.tweens.chain({
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
        let animation2 = this.scene.tweens.chain({
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
        action.animation = animation; //Play animation
        action.end = () => {
        };

        action.animation2 = animation2;
        action.finally = () => {
            card.isInPlayAnimation = false;
        
            card.setState(CARD_STATES.IN_LOCATION); //Set the card state to in play
            card.makeInteractive(true);//required to reshape the bounds of the interaction
            card.makeDraggable(false); //Remove the draggable state of the card
        };

        action.isPlayerAction = true; //This is a player triggered action
        action.waitForAnimation = true; //Should wait for the endof the animation
        action.name = "PLAY";

        //Add action to the action stack
        this.actionManager.addAction(action);

        //Update playArea action
        let updateAction = new Action();
        updateAction.start = () => {playerScene.characterArea.update();};
        updateAction.isPlayerAction = true; //This is a player triggered action
        updateAction.waitForAnimation = false; //Should wait for the endof the animation
        //Add action to the action stack
        this.actionManager.addAction(updateAction);
    }


}