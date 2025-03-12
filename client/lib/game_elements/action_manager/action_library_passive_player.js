class ActionLibraryPassivePlayer {

    //#region CONSTRUCTOR
    /** Constructor
     * @param {GameScene} scene - The scene that will contain the action manager
     */
    constructor(scene) {
        this.scene = scene;
        
        this.actionManager = this.scene.actionManager;
    }
    //#endregion

    //#region DRAW CARD ACTIONS
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
            depth: DEPTH_VALUES.CARD_IN_HAND
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
            card.setDepth(DEPTH_VALUES.CARD_IN_HAND); 
            this.scene.children.bringToTop(card);

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
                card.setDepth(DEPTH_VALUES.CARD_IN_MULLIGAN_PASSIVE_PLAYER);
            } else if(phase === GAME_PHASES.PREPARING_FIRST_TURN) {
            } else {
                playerScene.hand.addCards([card], {setCardState: true, setCardDepth: true, updateUI: true});
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
            depth: DEPTH_VALUES.CARD_IN_DECK
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
            card.setDepth(DEPTH_VALUES.CARD_IN_DECK);
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
        drawAction.isPlayerAction = false;
        drawAction.waitForAnimationToComplete = config.waitForAnimationToComplete;
        drawAction.name = "DRAW DON ACTION";

        //Add Action to the action stack
        this.actionManager.addAction(drawAction);
    }
    //#endregion

    //#region MULLIGAN ACTIONS
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
            card.setDepth(DEPTH_VALUES.CARD_IN_DECK);
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
        action.isPlayerAction = false;
        action.waitForAnimationToComplete = config.waitForAnimationToComplete;
        action.name = "MOVE CARD MULLIGAN TO DECK ACTION";

        //Add Action to the action stack
        this.actionManager.addAction(action);
    }
    //#endregion

    //#region PLAY CARD ACTIONS
    /** Function that plays a card for the opponent
     * @param {GameCardUI} card - Card that is being played.
    * @param {PlayerScene} playerScene - Player Scene that is playing the card.
    * @param {Array<number>} spentDonIds
    * @param {GameCardUI} replacedCard
     * This function is call from a server request
     * It creates an action to execute the inking and do the animation
     * Calls the completeServerRequest at the end
     */
    playCardAction(playerScene, card, spentDonIds, replacedCard = null, abilityInfo = null) {
        let displayX = 100 + GAME_UI_CONSTANTS.CARD_ART_WIDTH*CARD_SCALE.IN_PLAY_ANIMATION/2;
        let displayY = this.scene.screenCenterY;

        //Create tweens
        let tweens = [];
        if(replacedCard === null) tweens.push({ //Tween 1: Bring card to top, then move it to center and scale up. On complete redraw the hand
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

        if(replacedCard !== null) tweens = tweens.concat(this.scene.animationLibraryPassivePlayer.animation_target_card(card, replacedCard)); //Tween 4: move replaced card to the deck

        tweens.push({ //Tween 5: empty tween to call completeActin
            duration: 100,
            onComplete: () => {this.scene.actionManager.completeAction();}
        });
        //Create tween chain
        let start_animation = this.scene.tweens.chain({
            targets: card,
            tweens: tweens
        }).pause();

        //Prepare the tweens from the playArea animation
        let tweens2 = null;
        if(card.cardData.card === CARD_TYPES.CHARACTER) tweens2 = playerScene.characterArea.addCardAnimation(card);
        else if(card.cardData.card === CARD_TYPES.STAGE) tweens2 = playerScene.stageLocation.addCardAnimation(card);
        if(tweens2 !== null) tweens2 = tweens2.concat({ //concat additional tween to call the completeAction function
            duration: 10,
            onComplete: () => {this.actionManager.finalizeAction();}
        });
        //Create the tween chain
        let end_animation = null;
        if(tweens2 !== null) end_animation = this.scene.tweens.chain({
            targets: card,
            tweens: tweens2
        }).pause();

        //Create the action
        let action = new Action();
        action.start = () => { //Action start: pay card cost in inkwell. Remove card from hand and add it to the playarea
            //PAY COST
            playerScene.activeDonDeck.payCost(spentDonIds);
            
            playerScene.hand.removeCard(card); //Remove the card form the hand
            card.setDepth(DEPTH_VALUES.CARD_IN_DECK);

            card.isInPlayAnimation = true;
            if(card.cardData.card === CARD_TYPES.CHARACTER)
                playerScene.characterArea.addCard(card); //Add the card to the play area
            else if(card.cardData.card === CARD_TYPES.STAGE)
                playerScene.stageLocation.addCard(card); //Add the card to the play area
        }
        action.start_animation = start_animation; //play animation
        action.end = () => {
            //Refresh GameStateUI
            playerScene.playerInfo.updateCardAmountTexts();

            //If the card of an event
            if(card.cardData.card === CARD_TYPES.EVENT) {
                //execute ability and init ability tweens
                let abilityTweens = [];
                for(let ability of card.abilities) {
                    if(ability.canActivate(card.scene.gameStateUI.phaseText.text)) { //For each ability that can be activated
                        abilityTweens = abilityTweens.concat(ability.animate(card, abilityInfo, false)); //Add the ability tween
                    }
                }

                //If there are abilities to animate
                if(abilityTweens.length>0) {
                    //Add action finalizer call
                    abilityTweens = abilityTweens.concat({ //concat additional tween to call the completeAction function
                        duration: 10,
                        onComplete: () => {this.actionManager.finalizeAction();}
                    });
                    //Create tween chain
                    this.scene.actionManager.currentAction.end_animation = this.scene.tweens.chain({
                        targets: card,
                        tweens: abilityTweens
                    }).pause();
                }
            }
        }
        action.end_animation = end_animation;
        action.finally = () => {
            card.isInPlayAnimation = false;
        
            //TODO add check for rush
            if(card.cardData.card === CARD_TYPES.CHARACTER) card.setState(CARD_STATES.IN_PLAY_FIRST_TURN); //Set the card state to in play
            else if(card.cardData.card === CARD_TYPES.EVENT) {
                //FIXME: Add event card logic
                this.scene.actionLibraryPassivePlayer.discardCardAction(playerScene, card); //Create a discard Action 
            }
            else card.setState(CARD_STATES.IN_PLAY); //Set the card state to in play
        }
        action.isPlayerAction = false; //This is not a player action
        action.waitForAnimation = true; //Should wait for animation to complete
        action.name = "PLAY CARD OPPONENT";

        //Add action to action stack
        this.scene.actionManager.addAction(action);

        //Update playArea action
        let updateAction = new Action();
        updateAction.start = () => {
            playerScene.characterArea.update();
        
            //Create small animation
            if(card.cardData.card === CARD_TYPES.CHARACTER) {
                this.scene.time.delayedCall(300, () => {
                    let restingAnimation = this.scene.add.sprite(
                        card.x + card.displayWidth/2,
                        card.y - card.displayHeight/2, 
                        ASSET_ENUMS.SLEEPING_SPRITESHEET).setScale(0.2).setOrigin(0, 1);
                    restingAnimation.play(ANIMATION_ENUMS.SLEEPING_ANIMATION);
                    this.scene.time.delayedCall(5000, () => {restingAnimation.destroy();});
                });
            }
        };
        updateAction.isPlayerAction = false; //This is a player triggered action
        updateAction.waitForAnimationToComplete = false; //Should wait for the endof the animation
        //Add action to the action stack
        this.actionManager.addAction(updateAction);
    }

    //#region PLAY CARD TARGETING ACTION
    /** function to move the targeting area
     * @param {PlayerScene} playerScene
     * @param {GameCardUI} card
      */
    startPlayCardTargetingAction(playerScene, card) {
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

        //Create the action
        let action = new Action();
        action.start = () => { //Start function
            card.setDepth(DEPTH_VALUES.CARD_IN_PLAY);
            card.setState(CARD_STATES.IN_PLAY_TARGETTING);
        };
        action.start_animation = start_animation; //Play animation

        action.isPlayerAction = false; //This is a player triggered action
        action.waitForAnimationToComplete = true; //Should wait for the endof the animation
        action.name = "PLAY TARGETTING";

        //Add action to the action stack
        this.actionManager.addAction(action);
    }

    cancelReplacementTarget(playerScene, card) {
        let action = new Action();
        action.start = () => { //Start function
            card.setDepth(DEPTH_VALUES.CARD_IN_HAND);
            card.setState(CARD_STATES.IN_HAND);
            //playerScene.hand.update();
        };

        action.isPlayerAction = false; //This is a player triggered action
        action.waitForAnimationToComplete = false; //Should wait for the endof the animation
        action.name = "PLAY TARGETTING";

        //Add action to the action stack
        this.actionManager.addAction(action);
    }
    //#endregion

    //#region ATTACK ACTIONS

    /**Function to start an action to declare an attack 
     * @param {PlayerScene} playerScene
     * @param {GameCardUI} attacker
     * @param {GameCardUI} defender
     * @param {Object} botAction
    */
    declareAttackAction(playerScene, attacker, defender, botAction) {
        let action = new Action();

        if(!botAction) {
            action.start = () => {
                this.scene.targetingArrow.update(defender.x, defender.y);
                attacker.setState(CARD_STATES.IN_PLAY_RESTED);
                this.scene.game.gameClient.requestStartBlockerPhasePassivePlayer();
            };
            action.isPlayerAction = true;
            action.waitForAnimationToComplete = false;
            action.name = "DECLARE ATTACK";
        } else {
            //Set the originator object
            this.scene.targetingArrow.originatorObject = attacker;
            //create the animation
            let start_animation = this.scene.targetingArrow.animateToPosition(defender.x, defender.y, 700, 'Power2', 200);
            start_animation = start_animation.concat({
                duration: 10,
                onComplete: () => {this.actionManager.completeAction();}
            });
            start_animation = this.scene.tweens.chain({
                targets: this.scene.targetingArrow,
                tweens: start_animation
            }).pause();

            action.start = () => {
                this.scene.targetingArrow.startManualTargetingXY(attacker, attacker.x, attacker.y);
            };
            action.start_animation = start_animation;
            action.end = () => {
                attacker.setState(CARD_STATES.IN_PLAY_RESTED);
                this.scene.game.gameClient.requestStartBlockerPhasePassivePlayer();
            };
            action.isPlayerAction = true;
            action.waitForAnimationToComplete = true;
            action.name = "DECLARE ATTACK";
        }
        //Add action to the action stack
        this.actionManager.addAction(action);
    }

    /** Action to switch defender cards during block
         * @param {GameCardUI} blockerCard
         */
    switchDefenderAction(blockerCard) {
        let action = new Action();
        action.start = () => {
            this.scene.attackManager.attack.switchDefender(blockerCard); //Switch the defender
        };

        //Create anumation to move the targeting arrow toe the defender card
        let animation = this.scene.targetingArrow.animateToPosition(blockerCard.x, blockerCard.y, 0);
        animation = animation.concat({
            duration: 10,
            onComplete: () => {this.scene.actionManager.completeAction();} //Use a callback to send a message he animation is finished and counter can start
        });
        animation = this.scene.tweens.chain({
            targets: this.scene.targetingArrow,
            tweens: animation
        }).restart();

        action.start_animation = animation;
        action.end = () => {
            this.scene.gameStateManager.passToNextPhase(GAME_STATES.BLOCKER_INTERACTION, false);
        };
                
        action.isPlayerAction = false;
        action.waitForAnimationToComplete = true;
        action.name = "SWITCH DEFENDER";

        //Add action to the action stack
        this.actionManager.addAction(action);
    }

    /** Function to start the play counter action
     * @param {PlayerScene} playerScene
     * @param {number} counterID
     * @param {number} characterID
     */
    playCounterAction(playerScene, counterID, characterID, counterCardData) {
        let counterCard = playerScene.getCard(counterID);
        counterCard.updateCardData(counterCardData);
        let characterCard = playerScene.getCard(characterID);
        console.log(characterCard);

        let displayX = 100 + GAME_UI_CONSTANTS.CARD_ART_WIDTH*CARD_SCALE.IN_PLAY_ANIMATION/2;
        let displayY = this.scene.screenCenterY;

        //Create tweens
        let tweens = [];
        tweens.push({ //Tween 1: Bring card to top, then move it to center and scale up. On complete redraw the hand
            onStart: () => {this.scene.children.bringToTop(counterCard);},
            x: displayX,
            y: displayY,
            scale: CARD_SCALE.IN_PLAY_ANIMATION,
            angle: 0,
            duration: 300,
            onComplete: () => { playerScene.hand.update(); }
        });
        tweens.push({
            scaleX: 0,
            duration: 300
        });
        tweens.push({ //Tween 3: empty tween to show the player the card for 2 seconds
            onStart: () => {counterCard.flipCard();},
            scale: CARD_SCALE.IN_PLAY_ANIMATION,
            duration: 200
        });
        tweens.push({ //Tween 5: empty tween to call completeActin
            delay: 750,
            duration: 200,
            scale: CARD_SCALE.IN_PLAY_ANIMATION,
            onComplete: () => {this.scene.actionManager.completeAction();}
        });
        //Create tween chain
        let animation = this.scene.tweens.chain({
            targets: counterCard,
            tweens: tweens
        }).pause();

        let action = new Action();
        action.start = () => {
            //remove Card from owner hand
            counterCard.playerScene.hand.removeCard(counterCard);
            counterCard.setDepth(DEPTH_VALUES.CARD_IN_PLAY);
        };
        action.start_animation = animation; //play animation
        action.end = () => {
            counterCard.setDepth(DEPTH_VALUES.CARD_IN_DECK);
            counterCard.setState(CARD_STATES.IN_PLAY_ATTACHED);
            characterCard.attachedCounter.push(counterCard);
            characterCard.updateAttachedCounterPosition();
        }
        action.isPlayerAction = true;
        action.waitForAnimationToComplete = true;

        //Add action to the action stack
        this.actionManager.addAction(action);
    }

    //#endregion

//#region DISCARD ACTION
    /** Function to discard a card
     * @param {PlayerScene} playerScene
     * @param {GameCardUI} card
     */
    discardCardAction(playerScene, card) {
        //Get Start Animation
        let startAnimation_tweens = this.scene.animationLibrary.desintegrationAnimation(card, 0);
        startAnimation_tweens = startAnimation_tweens.concat({
            targets: card,
            duration: 10,
            onComplete: () => {this.actionManager.completeAction();}
        });
        let start_animation = this.scene.tweens.chain({
            tweens: startAnimation_tweens
        }).pause();

        //Get end animation
        let endAnimation_tweens = this.scene.animationLibrary.integrationAnimation(card, 500);
        endAnimation_tweens = endAnimation_tweens.concat({
            targets: card,
            duration: 10,
            onComplete: () => {this.actionManager.finalizeAction();}
        });
        let end_animation = this.scene.tweens.chain({
            tweens: endAnimation_tweens
        }).pause();


        let action = new Action();
        action.start = () => {};
        action.start_animation = start_animation;
        action.end = () => {
            playerScene.removeCard(card); //Remove this card from whaterever pile it is in
            card.setPosition(playerScene.discard.posX, playerScene.discard.posY); //Move card to discard pile
            playerScene.discard.addCard(card, {setCardState: true, setCardDepth: true, updateUI: true}); //Add card to dispacrd pile
        };
        action.end_animation = end_animation;

        action.isPlayerAction = true;
        action.waitForAnimationToComplete = true;
        action.name = "DISCARD";

        //Add action to the action stack
        this.actionManager.addAction(action);
    }
    //#endregion

}