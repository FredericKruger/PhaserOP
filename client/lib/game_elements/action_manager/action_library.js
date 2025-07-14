class ActionLibrary {

    /**
     * 
     * @param {GameScene} scene 
     */
    constructor(scene) {
        this.scene = scene;

        this.actionManager = this.scene.actionManager;
    }

    //#region DRAW CARD ACTION
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
            depth: DEPTH_VALUES.CARD_IN_MULLIGAN
        });
        if(serverCard.cardData) {
            card.updateCardData(serverCard.cardData, false); //in some case we only pass the id
        };

        //Prepare Tweens
        let tweens = [];
        if(phase === GAME_PHASES.MULLIGAN_PHASE) tweens = this.scene.animationLibrary.animation_move_card_deck2mulligan(card, config.mulliganPosition, animationConfig.delay);
        else if(phase === GAME_PHASES.PREPARING_FIRST_TURN) tweens = this.scene.animationLibrary.animation_move_card_deck2lifedeck(card, animationConfig.delay);
        else tweens = this.scene.animationLibrary.animation_move_card_deck2hand(card, animationConfig.delay);

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
            card.setDepth(DEPTH_VALUES.CARD_IN_HAND);
            this.scene.children.bringToTop(card);

            if(phase === GAME_PHASES.MULLIGAN_PHASE) {
                card.setDepth(DEPTH_VALUES.CARD_IN_MULLIGAN);
                card.setState(CARD_STATES.IN_MULLIGAN);
                this.scene.gameStateUI.mulliganUI.addCard(card);
            } else if(phase === GAME_PHASES.PREPARING_FIRST_TURN) {
                card.setState(CARD_STATES.IN_LIFEDECK);
                playerScene.lifeDeck.addCard(card);
                playerScene.playerInfo.setLifePoints(playerScene.lifeDeck.cards.length); //udpate the ui
            } else {
                card.setState(CARD_STATES.TRAVELLING_TO_HAND);
            }
        };
        drawAction.start_animation = start_animation;
        drawAction.end = () => {
            if(phase === GAME_PHASES.MULLIGAN_PHASE) {card.setDepth(DEPTH_VALUES.CARD_IN_MULLIGAN);} 
            else if(phase === GAME_PHASES.PREPARING_FIRST_TURN) {} 
            else {
                playerScene.hand.addCards([card], {setCardState: true, setCardDepth: true, updateUI: true});
            }
            playerScene.deck.popTopCardVisual(); //Remove the top Card Visual
        }
        drawAction.finally = () => {
            deckVisual.destroy();
        };
        drawAction.isPlayerAction = true;
        drawAction.waitForAnimationToComplete = config.waitForAnimationToComplete;
        drawAction.name = "DRAW CARD ACTION";

        //Add Action to the action stack
        this.actionManager.addAction(drawAction);
    }
    //#endregion

    //#region DRAW LIFE CARD ACTION
    /**
     * Createss an action to draw a card
     * @param {PlayerScene} playerScene 
     * @param {Object} serverCard
     */
    drawLifeCardAction(playerScene, serverCard) {
        //Create a new Duel Card
        let card = playerScene.lifeDeck.getCard(serverCard.id);
        if(serverCard.cardData) {
            card.updateCardData(serverCard.cardData, false); //in some case we only pass the id
        };

        //Prepare Tweens
        let tweens = this.scene.animationLibrary.animation_move_card_lifedeck2display(card, 600);
        tweens = tweens.concat({
            duration: 10,
            onComplete: () => { this.scene.actionManager.completeAction(); }
        });
        let start_animation = this.scene.tweens.chain({ //Create tween chain
            targets: card,
            tweens: tweens
        }).pause();

        //Create Action
        let drawAction = new Action();
        drawAction.start = () => {
            playerScene.lifeDeck.showLifeCardFan();

            card.setDepth(DEPTH_VALUES.CARD_IN_HAND);

            playerScene.playerInfo.setLifePoints(playerScene.lifeDeck.cards.length-1); //udpate the ui
            const lifeText = card.playerScene.playerInfo.lifeAmountText;
            this.scene.tweens.add({
                targets: lifeText,
                scale: 1.2,
                duration: 150,
                yoyo: true,
                ease: 'Sine.easeInOut'
            });
        };
        drawAction.end = () => {
            card.setState(CARD_STATES.BEING_PLAYED);
        };
        drawAction.start_animation = start_animation;
        drawAction.isPlayerAction = true;
        drawAction.waitForAnimationToComplete = true;
        drawAction.name = "DRAW CARD ACTION";

        //Add Action to the action stack
        this.actionManager.addAction(drawAction);
    }

    /** Function to add the lifeCard to the hand
     * @param {PlayerScene} playerScene
     * @param {Object} serverCard
     */
    addLifeCardToHand(playerScene, serverCard, executeAsAction = false) {
        let codeToExecute = () => {
            let card = playerScene.lifeDeck.getCard(serverCard.id);
            playerScene.lifeDeck.removeCard(card);
            card.setState(CARD_STATES.TRAVELLING_TO_HAND);
            
            playerScene.hand.addCards([card], {setCardState: true, setCardDepth: true, updateUI: true});
            playerScene.hand.update();

            playerScene.lifeDeck.hideLifeCardFan(true);
        };

        if(executeAsAction) {
            let action = new Action();
            action.start = codeToExecute;
            action.waitForAnimationToComplete = false;

            this.scene.actionManager.addAction(action);
        } else {
            codeToExecute();
        }
    }
    //#endregion

    //#region DRAW DON CARD ACTION
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
            depth: DEPTH_VALUES.DON_IN_PILE
        });

        //Prepare Tweens
        let tweens = this.scene.animationLibrary.animation_move_don_deck2activearea(card, animationConfig.delay);

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
            card.setDepth(DEPTH_VALUES.DON_IN_PILE);
            card.setState(CARD_STATES.DON_TRAVELLING);
        };
        drawAction.start_animation = start_animation;
        drawAction.end = () => {
            card.playerScene.activeDonDeck.addCard(card);
            card.playerScene.playerInfo.updateActiveCardAmountText(); //udpate the ui
            
            playerScene.donDeck.popTopCardVisual(); //Remove the top Card Visual
        }
        drawAction.finally = () => {deckVisual.destroy();};
        drawAction.isPlayerAction = true;
        drawAction.waitForAnimationToComplete = config.waitForAnimationToComplete;
        drawAction.name = "DRAW DON ACTION";

        //Add Action to the action stack
        this.actionManager.addAction(drawAction);
    }
    //#endregion

    //#region MOVE CARD FROM MULLIGAN TO DECK ACTION
    /** Creates an Action to move a card from the mulligan UI to the deck
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
            card.setDepth(DEPTH_VALUES.CARD_IN_DECK);
            card.setState(CARD_STATES.TRAVELLING_TO_DECK);
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

    /** Function that moves an attached don card to the exerted pile 
     * @param {PlayerScene} playerScene
     * @param {DonCardUI} card
    */
    moveDonCardToExertedAction(playerScene, card) {
        //play animation to show card
        let start_animation = this.scene.tweens.chain({
            targets: card,
            tweens: this.scene.animationLibrary.animation_move_don_characterarea2activearea(card, 0)
        }).pause();

        let action = new Action();
        action.start = () => {
            card.setState(CARD_STATES.DON_RESTED); //Change state
            card.setDepth(DEPTH_VALUES.DON_IN_PILE); //Set Depth
        };
        action.start_animation = start_animation;
        action.waitForAnimationToComplete = true;
        action.isPlayerAction = true;
        action.name = "MOVE DON CARD TO EXERTED";

        //Add action to the action stack
        this.actionManager.addAction(action);
    }

    //#end region

    //#region ATTACH DON ACTION
    /** Action to attach a don card to a character
     * @param {PlayerScene} player
     * @param {DonCardUI} donCard
     * @param {GameCardUI} character
     */
    attachDonAction(player, donCard, character) {
        let action = new Action();
        action.start = () => {
            donCard.setDepth(DEPTH_VALUES.DON_DRAGGED);
        };
        
        // Create the animation
        let startAnimation = this.scene.animationLibrary.animation_move_don_activearea2characterarea(donCard, character, 0, () => {this.scene.actionManager.completeAction();});
        startAnimation = startAnimation.concat([{
            targets: {},
            alpha: 1,
            onComplete: () => {this.scene.actionManager.completeAction();}
        }]);
        action.start_animation = this.scene.tweens.chain(
            {
                targets: donCard,
                tweens: startAnimation
            }
        ).pause();

        action.end = () => {
            donCard.setState(CARD_STATES.DON_ATTACHED);
            donCard.setDepth(DEPTH_VALUES.DON_IN_PILE);
            character.attachedDon.push(donCard); //Add to character pile
            character.updateAttachedDonPosition(true, donCard);

            const donImage = this.scene.add.image(character.x, character.y + character.displayHeight*0.25, ASSET_ENUMS.GAME_DON_SMALL).setDepth(character.depth+1).setScale(0);
            this.scene.tweens.chain({
                targets: donImage,
                tweens: this.scene.animationLibrary.don_image_appearing_animation(donImage)
            });

            // Update the power text with animation
            character.updatePowerText();
            if (character.powerText) {
                this.scene.tweens.add({
                    targets: character.powerText,
                    scale: 1.5,
                    duration: 150,
                    yoyo: true,
                    ease: 'Back.easeOut'
                });
            }
            
            // Update the UI with pulse effect
            player.playerInfo.updateCardAmountTexts();
            this.scene.tweens.add({
                targets: player.playerInfo.activeDonCardAmountText,
                scale: 1.2,
                duration: 100,
                yoyo: true,
                ease: 'Sine.easeOut'
            });
        }
        action.isPlayerAction = false;
        action.waitForAnimationToComplete = true;
        this.scene.actionManager.addAction(action);
    }

    //#endregion

    //#region PLAY CARD ACTION
    /** Creates the Play Card Action.
         * @param {GameCardUI} card - Card that is being played.
         * @param {PlayerScene} playerScene - Player Scene that is playing the card.
         * @param {Array<number>} spentDonIds
         * @param {Boolean} activePlayer
         * @param {function} callback 
         * This action takes a card, and adds it to the playarea. The card will initially be drying unless it has rush.
         * This will remove the draggable state of the card and only show the card art
         * Action:
         *  start: Pay Cost, Remove from hand, add to playarea
         *  end: play exert animation to show card is drying. Send Server a message about card being played
        */
    startPlayCardAction(playerScene, card, spentDonIds, callback = null) {
        let displayX = 100 + GAME_UI_CONSTANTS.CARD_ART_WIDTH * CARD_SCALE.IN_PLAY_ANIMATION / 2;
        let displayY = this.scene.screenCenterY;

        // Enhanced animation for playing a card - more dynamic initial display only
        let start_animation = this.scene.tweens.chain({
            targets: card,
            tweens: [
                {
                    // Phase 2: Move to center display position with dramatic scaling
                    scale: {from: CARD_SCALE.IN_PLAY_ANIMATION * 0.9, to: CARD_SCALE.IN_PLAY_ANIMATION * 1.05, duration: 130},
                    x: {from: card.x + (displayX - card.x) * 0.3, to: displayX, duration: 130},
                    y: {from: card.y - 40, to: displayY, duration: 130},
                    rotation: {from: 0.05, to: 0, duration: 130},
                    ease: 'Power2.easeInOut'
                },
                {
                    // Phase 3: Quick scale adjustment for emphasis with slight bounce
                    scale: {from: CARD_SCALE.IN_PLAY_ANIMATION * 1.05, to: CARD_SCALE.IN_PLAY_ANIMATION, duration: 100},
                    ease: 'Back.easeOut',
                },
                {
                    // Phase 4: Hold the card in display position
                    // This phase is shorter since specific card arrival animations will be handled elsewhere
                    scale: CARD_SCALE.IN_PLAY_ANIMATION,
                    duration: 50,
                    onComplete: () => {                        
                        // Complete the action
                        this.actionManager.completeAction();
                    }
                }
            ]
        }).pause();

        //Create the action
        let action = new Action();
        action.start = () => { //Start function
            if(callback) callback();
            //PAY COST
            playerScene.activeDonDeck.payCost(spentDonIds);

            card.setDepth(DEPTH_VALUES.CARD_IN_PLAY);

            card.isInPlayAnimation = true;
        };
        action.start_animation = start_animation; //Play animation#
        action.end = () => {
            //Refresh GameStateUI
            playerScene.playerInfo.updateCardAmountTexts();
            card.setState(CARD_STATES.BEING_PLAYED);
        };

        action.isPlayerAction = true; //This is a player triggered action
        action.waitForAnimationToComplete = true; //Should wait for the endof the animation
        action.name = "PLAY";

        //Add action to the action stack
        this.actionManager.addAction(action);
    }

    /** Creates the Play Card Action.
         * @param {GameCardUI} card - Card that is being played.
         * @param {PlayerScene} playerScene - Player Scene that is playing the card.
         * @param {Array<number>} spentDonIds
         * @param {boolean} replacedCard 
         * This action takes a card, and adds it to the playarea. The card will initially be drying unless it has rush.
         * This will remove the draggable state of the card and only show the card art
         * Action:
         *  start: Pay Cost, Remove from hand, add to playarea
         *  end: play exert animation to show card is drying. Send Server a message about card being played
        */
    playCardAction(playerScene, card, actionInfos) {
        /** First create action to resolve replacement */
        if(actionInfos.replacedCard) {
            let replacedCard = playerScene.getCard(actionInfos.replacedCard);
            this.discardCardAction(playerScene, replacedCard, 0); //Create a discard Action
        }

        /** Create action to play on play event results */
        if(actionInfos.abilityId && actionInfos.eventAction) {
            //Get the ability and resolve the action
            this.resolveAbilityAction(card, actionInfos.abilityId, actionInfos.eventAction, true);
        }

        //Create the action
        let action = new Action();
        action.start = () => { //Start function
            //Create event name onomatopea if event
            if(card.cardData.card === CARD_TYPES.EVENT) {
                card.showCardName();
            }

            if(actionInfos.eventTriggered) {
                playerScene.lifeDeck.removeCard(card); //Remove the card form the hand
            } else {
                playerScene.hand.removeCard(card); //Remove the card form the hand
            }

            card.setDepth(DEPTH_VALUES.CARD_IN_PLAY);

            card.isInPlayAnimation = true;
            if(card.cardData.card === CARD_TYPES.CHARACTER)
                playerScene.characterArea.addCard(card); //Add the card to the play area
            else if(card.cardData.card === CARD_TYPES.STAGE)
                playerScene.stageLocation.addCard(card); //Add the card to the play area
        };
        action.end = () => {
            //TODO add check for rush
            if(card.cardData.card === CARD_TYPES.CHARACTER) {
                card.setState(CARD_STATES.IN_PLAY_FIRST_TURN); //Set the card state to in play
            } else if(card.cardData.card === CARD_TYPES.EVENT) {
                this.scene.actionLibrary.discardCardAction(playerScene, card); //Create a discard Action
            }
            else card.setState(CARD_STATES.IN_PLAY); //Set the card state to in play
        };
        action.finally = () => {
            //if(this.scene.game.gameClient.requestCleanupAction(); //Cleanup the aciton server side
        }  

        action.isPlayerAction = true; //This is a player triggered action
        action.waitForAnimationToComplete = false; //Should wait for the endof the animation
        action.name = "PLAY";

        //Add action to the action stack
        this.actionManager.addAction(action);

        //Update playArea action
        let updateAction = new Action();
        updateAction.start = () => {
            //Set the turn the card was played on
            card.turnPlayed = this.scene.gameStateManager.currentTurn;

            if(card.cardData.card === CARD_TYPES.CHARACTER) {
                let cardPosition = playerScene.characterArea.update(card);
                card.enterCharacterArea(cardPosition.x, cardPosition.y);
            } else if(card.cardData.card === CARD_TYPES.STAGE) {
                let cardPositionX = playerScene.stageLocation.posX;
                let cardPositionY = playerScene.stageLocation.posY;

                card.enterCharacterArea(cardPositionX, cardPositionY);
            }
        }; 
        updateAction.isPlayerAction = true; //This is a player triggered action
        updateAction.waitForAnimationToComplete = false; //Should wait for the endof the animation
        //Add action to the action stack
        this.actionManager.addAction(updateAction);
    }

    /** Function to cancel the play card action
     * @param {PlayerScene} playerScene
     * @param {GameCardUI} card
     * @param {Array<number>} spentDonIds
     * */
    cancelPlayCard(playerScene, card, spentDonIds, startAsAction) {
        if(startAsAction) {
            let action = new Action();
            action.start = () => { //Start function
                card.setDepth(DEPTH_VALUES.CARD_IN_HAND);
                card.setState(CARD_STATES.IN_HAND);
                
                playerScene.hand.update();

                playerScene.activeDonDeck.repayCost(spentDonIds);
                playerScene.playerInfo.updateCardAmountTexts();
            };
    
            action.isPlayerAction = false; //This is a player triggered action
            action.waitForAnimationToComplete = false; //Should wait for the endof the animation
            action.name = "PLAY TARGETTING";
    
            //Add action to the action stack
            this.actionManager.addAction(action);
        } else {
            card.setDepth(DEPTH_VALUES.CARD_IN_HAND);
            card.setState(CARD_STATES.IN_HAND);

            playerScene.hand.update();
            
            playerScene.activeDonDeck.repayCost(spentDonIds);
            playerScene.playerInfo.updateCardAmountTexts();
        }

    }
    //#endregion

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
        action.end = () => {};
        action.finally = () => {
            card.isInPlayAnimation = false;
        };

        action.isPlayerAction = true; //This is a player triggered action
        action.waitForAnimationToComplete = true; //Should wait for the endof the animation
        action.name = "PLAY TARGETTING";

        //Add action to the action stack
        this.actionManager.addAction(action);
    }
    //#endregion

    //#region DISCARD ACTION

    /** Function to create discard tweens
     * @param {PlayerScene} playerScene
     * @param {GameCardUI} card
     * @param {number} animationSpeed - Animation speed for the discard action
     */
    discardActionTweens(playerScene, card, animationSpeed =  500) {
        let tweens = [];
        tweens.push({
            targets: {},
            alpha: 1,
            onStart: () => {
                //Reset the eventCounter value
                card.eventCounterPower = 0;
                card.previousState = card.state; //Store the previous state
            }
        });
        tweens = tweens.concat(this.scene.animationLibrary.desintegrationAnimation(card, 0));
        tweens = tweens.concat([{
            targets: {},
            alpha: 1,
            onStart: () => {
                const removed = playerScene.removeCard(card); //Remove this card from whaterever pile it is in
                card.setPosition(playerScene.discard.posX, playerScene.discard.posY); //Move card to discard pile
                card.angle = 0;
                playerScene.discard.addCard(card, {setCardState: true, setCardDepth: true, updateUI: true}); //Add card to dispacrd pile

                playerScene.characterArea.update();
            }
        }]);
        tweens = tweens.concat(this.scene.animationLibrary.integrationAnimation(card, 500, animationSpeed));

        return tweens;
    }

    /** Function to discard a card
     * @param {PlayerScene} playerScene
     * @param {GameCardUI} card
     */
    discardCardAction(playerScene, card, animationSpeed = 500) {        
        //Retrieve discard tweens and play as action
        let startAnimation = this.discardActionTweens(playerScene, card, animationSpeed);
        startAnimation = startAnimation.concat([{
            targets: {},
            alpha: 1,
            onStart: () => {this.scene.actionManager.completeAction()}
        }]);
        startAnimation = this.scene.tweens.chain({
            targets: card,
            tweens: startAnimation
        }).pause();

        let action = new Action();
        action.start = () => {};
        action.start_animation = startAnimation;

        action.isPlayerAction = true;
        action.waitForAnimationToComplete = true;
        action.name = "DISCARD";

        //Add action to the action stack
        this.actionManager.addAction(action);
    }
    //#endregion

    //#region ATTACK ACTIONS

    /**Function to start an action to declare an attack 
     * @param {PlayerScene} playerScene
     * @param {GameCardUI} attacker
     * @param {GameCardUI} defender
    */
    declareAttackAction(playerScene, attacker, defender) {
        let tweens = this.scene.attackManager.targetingManager.targetArrow.animateToPosition(defender.x, defender.y, 200);
        tweens = tweens.concat({
            duration: 10,
            onComplete: () => {this.actionManager.completeAction();}
        });
        let start_animation = this.scene.tweens.chain({
            targets: this.scene.attackManager.targetingManager.targetArrow,
            tweens: tweens
        }).pause();

        let action = new Action();
        action.start = () => {};
        action.start_animation = start_animation;
        action.end = () => {
            attacker.setState(CARD_STATES.IN_PLAY_ATTACKING);
            defender.setState(CARD_STATES.IN_PLAY_DEFENDING);

            this.scene.game.gameClient.requestStartOnAttackEventPhase();
        };
        action.isPlayerAction = true;
        action.waitForAnimationToComplete = true;
        action.name = "DECLARE ATTACK";

        //Add action to the action stack
        this.actionManager.addAction(action);
    }

    /** Action to switch defender cards during block
     * @param {GameCardUI} blockerCard
     */
    switchDefenderAction(blockerCard) {
        let action = new Action();
        action.start = () => {
            blockerCard.blockerButton_manualOverride = true;
        };
        action.start_animation = this.scene.tweens.chain({
            targets: blockerCard,
            tweens: [
                {
                    scale: blockerCard.scale,
                    duration: 1000,
                    onComplete: () => {
                        this.scene.actionManager.completeAction();
                    }
                }
            ]
        }).pause();
        action.end = () => {
            blockerCard.blockerButton_manualOverride = false;

            this.scene.attackManager.attack.switchDefender(blockerCard); //Switch the defender
        };
        //Create anumation to move the targeting arrow toe the defender card
        let animation = this.scene.attackManager.targetingManager.targetArrow.animateToPosition(blockerCard.x, blockerCard.y, 200);
        animation = animation.concat({
            duration: 10,
            onComplete: () => {this.scene.actionManager.finalizeAction();} //Use a callback to send a message he animation is finished and counter can start
        });
        animation = this.scene.tweens.chain({
            targets: this.scene.attackManager.targetingManager.targetArrow,
            tweens: animation
        }).pause();
        action.end_animation = animation;
        action.finally = () => {
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
    playCounterAction(playerScene, counterID, characterID) {
        let action = new Action();
        action.start = () => {
            let counterCard = playerScene.getCard(counterID);
            let characterCard = playerScene.getCard(characterID);

            //remove Card from owner hand
            counterCard.playerScene.hand.removeCard(counterCard);
            counterCard.setDepth(DEPTH_VALUES.CARD_IN_DECK);
            counterCard.setState(CARD_STATES.IN_PLAY_ATTACHED);
            characterCard.attachedCounter.push(counterCard);
            characterCard.updateAttachedCounterPosition(true, counterCard);
        };
        action.isPlayerAction = true;
        action.waitForAnimationToComplete = false;

        //Add action to the action stack
        this.actionManager.addAction(action);
    }

    /** Function to start the attack animation and resolve the attack
     * @param {boolean} activePlayer - If it is the active player
     * @param {Object} attackResults - The attack results
     */
    startAttackAnimation(activePlayer, attackResults) {
        // Create an action for the attack animation
        let action = new Action();
            
        // Determine attacker and defender based on active player
        let attackerPlayer = activePlayer ? this.scene.activePlayerScene : this.scene.passivePlayerScene;
        let defenderPlayer = activePlayer ? this.scene.passivePlayerScene : this.scene.activePlayerScene;
            
        action.start = () => {
            // Set game state to prevent interaction during animation
            this.scene.gameState.exit(GAME_STATES.PASSIVE_INTERACTION);
            
            //Change Phase
            this.scene.gameStateManager.setPhase(GAME_PHASES.ATTACK_PHASE);
    
            //Hide targeting arrow
            this.scene.attackManager.targetingManager.targetArrow.stopTargeting();

            // Get the attacker and defender cards from the attack manager
            const attacker = this.scene.attackManager.attack.attacker;
            const defender = this.scene.attackManager.attack.defender;

            //Hide all attached cards on the attacker
            attacker.hideAttachedCards(true);

            // Create and play the battle animation
            const battleAnimationManager = new BattleAnimation(this.scene);
            const battleAnimation = battleAnimationManager.createBattleAnimation(attacker, defender);
        
            // Add damage text animation
            battleAnimation.on('complete', () => {
                // Display damage indicators
                const defenderPower = defender.getPower();
                if (defenderPower > 0) {
                    battleAnimationManager.showDamageNumber(defender.x, defender.y, defenderPower, 0xff3333);
                }
                
                const attackerPower = attacker.getPower();
                if (attackerPower > 0) {
                    battleAnimationManager.showDamageNumber(attacker.x, attacker.y, attackerPower, 0xff3333);
                }
                                
                // Complete the action after showing damage
                setTimeout(() => {
                    this.scene.actionManager.completeAction();
                }, 1000);
            });

            battleAnimation.play();
        };
        action.start_animation = null;
        action.end = () => {
            //If the defender was destroyed
            if(attackResults.defenderDestroyed) {
                //Create action to discard the card
                let defenderCard = this.scene.attackManager.attack.defender
                if(defenderCard.cardData.animationinfo) {
                    //Show chat bubble
                    new ChatBubble(
                        this.scene, 
                        defenderCard.getSpeechBubblePosition(),
                        defenderCard.cardData.animationinfo.speeches.defeated
                    ).show(1500, () => {
                        this.scene.gameStateManager.discardCard(defenderCard.id, attackResults.defenderAttachedCards, activePlayer, true);
                    });
                }
                
            } else {
                this.scene.attackManager.attack.defender.setState(attackResults.newDefenderState); //Set the card state to in play
            }

            //Set the attacker state to exerte
            this.scene.attackManager.attack.attacker.setState(attackResults.newAttackerState); //Set the card state to in play

            //Hide all attached cards on the attacker
            this.scene.attackManager.attack.attacker.hideAttachedCards(false);

            //Create an action to switch states when finished
            let finishAction = new Action();
            finishAction.start = () => {
                this.scene.game.gameClient.requestStartTriggerPhase();
            };
            finishAction.waitForAnimationToComplete = false;
            finishAction.isPlayerAction = false;
            this.scene.actionManager.addAction(finishAction);
        }

        action.isPlayerAction = false;
        action.waitForAnimationToComplete = true;
        this.scene.actionManager.addAction(action);
    }

    //#endregion

    //#region ABILITY ACTION

    /** Function to resolve the ability
     * @param {GameCardUI} card
     * @param {string} abilityId
     * @param {Object} abilityInfo
     * @param {boolean} activePlayer - If it is the active player
     */
    resolveAbilityAction(card, abilityId, abilityInfo, activePlayer = true) {
        let ability = card.getAbility(abilityId);
        let abilityTweens = ability.animate(card, abilityInfo, activePlayer); //Add the ability tween

        if(abilityTweens.length === 0) return;

        //If there are abilities to animate
        abilityTweens = abilityTweens.concat([{ //concat additional tween to call the completeAction function
            duration: 10,
            onComplete: () => {this.scene.actionManager.completeAction();}
        }]);
        //Create tween chain
        let startAnimation = this.scene.tweens.chain({
            targets: card,
            tweens: abilityTweens
        }).pause();

        let action = new Action();
        action.start = () => {
            //Clean up targeting manager
            let targetingManager = this.scene.getActiveTargetManager();
            if(targetingManager) this.scene.targetManagers = this.scene.targetManagers.filter(tm => tm !== targetingManager); //Remove the target manager from the list
        };
        action.start_animation = startAnimation;
        action.end = () => {};
        action.waitForAnimationToComplete = true;

        //Add action to the action stack
        this.actionManager.addAction(action);
    }

    //#endregion

    //#region TARGETING ACTION
    /** Function to start the targetting arrow
     * @param {PlayerScene} playerScene
     * @param {GameCardUI} card
     */
    startTargetingAction(playerScene, card, startAsAction = true) {
        if(startAsAction) {
            let action = new Action();
            action.start = () => {
                this.scene.gameState.exit(GAME_STATES.TARGETING);
                
                let activeTargetManager = this.scene.getActiveTargetManager();
                activeTargetManager.targetArrow.originatorCard = card;
                activeTargetManager.targetArrow.startTargeting(card);
            };
            action.isPlayerAction = true;
            action.waitForAnimationToComplete = false;
            action.name = "START TARGETING";

            //Add action to the action stack
            this.actionManager.addAction(action);
        } else {
            this.scene.gameState.exit(GAME_STATES.TARGETING);
            
            let activeTargetManager = this.scene.getActiveTargetManager();
            activeTargetManager.targetArrow.originatorCard = card;
            activeTargetManager.targetArrow.startTargeting(card);
        }
    }

    /** Function to stop the targeting */
    cancelTargetingAction(serverRequest = false) {
        let activeTargetManager = this.scene.getActiveTargetManager();
        if (!activeTargetManager.waitingForServer) {
            activeTargetManager.waitingForServer = true;

            let action = new Action();
            action.start = () => {               
                let card = activeTargetManager.targetArrow.originatorObject;
                activeTargetManager.targetArrow.stopTargeting();          

                if(!serverRequest) this.scene.game.gameClient.requestCancelTargeting(activeTargetManager.targetData);
                this.scene.targetManagers = this.scene.targetManagers.filter(tm => tm.id !== activeTargetManager.id); //Remove the target manager from the list

                //Ned to foce a pointer out to stop the card ffrom hovering on cancel
                this.scene.gameState.onPointerOut(null, card);
                for(let abilityButton of card.abilityButtons) abilityButton.onPointerOut();

                //change state
                if(this.scene.gameState.previousState !== null) this.scene.gameState.exit(this.scene.gameState.previousState);
            }
            action.isPlayerAction = true;
            action.waitForAnimationToComplete = false;
            action.name = "CANCEL TARGETING";

            //Add action to the action stack
            this.actionManager.addAction(action);
        } 
    }

    /** Function to stop the targeting */
    stopTargetingAction() {
        let activeTargetManager = this.scene.getActiveTargetManager();
        //if(!activeTargetManager.waitingForServer) {
        activeTargetManager.waitingForServer = true;
        let action = new Action();
        action.start = () => {            
            let card = activeTargetManager.targetArrow.originatorObject;
            activeTargetManager.targetArrow.stopTargeting();          

            this.scene.targetManagers = this.scene.targetManagers.filter(tm => tm.id !== activeTargetManager.id); //Remove the target manager from the list

            //Ned to foce a pointer out to stop the card ffrom hovering on cancel
            this.scene.gameState.onPointerOut(null, card);
            for(let abilityButton of card.abilityButtons) abilityButton.onPointerOut();

            //change state
            if(this.scene.gameState.previousState !== null) this.scene.gameState.exit(this.scene.gameState.previousState);
        }
        action.isPlayerAction = true;
        action.waitForAnimationToComplete = false;
        action.name = "CANCEL TARGETING";

        //Add action to the action stack
        this.actionManager.addAction(action);
        //}
    }
    //#endregion
}