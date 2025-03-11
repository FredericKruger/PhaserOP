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

    //#region PLAY CARD ACTION
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
    playCardAction(playerScene, card, spentDonIds, replacedCard = null, abilityInfo = null) {
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
        action.start = () => { //Start function
            //PAY COST
            playerScene.activeDonDeck.payCost(spentDonIds);

            playerScene.hand.removeCard(card); //Remove the card form the hand
            card.setDepth(DEPTH_VALUES.CARD_IN_PLAY);

            card.isInPlayAnimation = true;
            if(card.cardData.card === CARD_TYPES.CHARACTER)
                playerScene.characterArea.addCard(card); //Add the card to the play area
            else if(card.cardData.card === CARD_TYPES.STAGE)
                playerScene.stageLocation.addCard(card); //Add the card to the play area
        };
        if(replacedCard === null) action.start_animation = start_animation; //Play animation#
        action.end = () => {
            //Refresh GameStateUI
            playerScene.playerInfo.updateCardAmountTexts();

            //If the card of an event
            if(card.cardData.card === CARD_TYPES.EVENT) {
                //execute ability and init ability tweens
                let abilityTweens = [];
                for(let ability of card.abilities) {
                    if(ability.canActivate(card.scene.gameStateUI.phaseText.text)) { //For each ability that can be activated
                        abilityTweens = abilityTweens.concat(ability.animate(card, abilityInfo)); //Add the ability tween
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
        };
        action.end_animation = end_animation;
        action.finally = () => {
            card.isInPlayAnimation = false;
        
            //TODO add check for rush
            if(card.cardData.card === CARD_TYPES.CHARACTER) {
                card.setState(CARD_STATES.IN_PLAY_FIRST_TURN); //Set the card state to in play
            } else if(card.cardData.card === CARD_TYPES.EVENT) {
                this.scene.actionLibrary.discardCardAction(playerScene, card); //Create a discard Action
            }
            else card.setState(CARD_STATES.IN_PLAY); //Set the card state to in play
        };

        action.isPlayerAction = true; //This is a player triggered action
        action.waitForAnimationToComplete = true; //Should wait for the endof the animation
        action.name = "PLAY";

        //Add action to the action stack
        this.actionManager.addAction(action);

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
        updateAction.isPlayerAction = true; //This is a player triggered action
        updateAction.waitForAnimationToComplete = false; //Should wait for the endof the animation
        //Add action to the action stack
        this.actionManager.addAction(updateAction);
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
    /** Function to discard a card
     * @param {PlayerScene} playerScene
     * @param {GameCardUI} card
     */
    discardCardAction(playerScene, card) {
        //Before creating action, discard attached counters
        //If if has any counters attached, discard those
        while(card.attachedCounter.length > 0) {
            let counterCard = card.attachedCounter.pop();
            this.discardCardAction(playerScene, counterCard);
        }
        
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
        action.start = () => {
            //Reset the eventCounter value
            card.eventCounterPower = 0;

            //If it has any attached don cards move them to the exerted pile
            let numberAnimations = 0;
            while(card.attachedDon.length > 0) {
                let donCard = card.attachedDon.pop();
                donCard.setState(CARD_STATES.DON_RESTED); //Change state
                donCard.setDepth(DEPTH_VALUES.DON_IN_PILE); //Set Depth
                this.scene.tweens.chain({
                    targets: donCard,
                    tweens: this.scene.animationLibrary.animation_move_don_characterarea2activearea(card, numberAnimations*100)
                }).restart();
                card.updateAttachedDonPosition();
                numberAnimations++;
            }
        };
        action.start_animation = start_animation;
        action.end = () => {
            playerScene.removeCard(card); //Remove this card from whaterever pile it is in
            card.setPosition(playerScene.discard.posX, playerScene.discard.posY); //Move card to discard pile
            card.angle = 0;
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

    //#region ATTACK ACTIONS

    /**Function to start an action to declare an attack 
     * @param {PlayerScene} playerScene
     * @param {GameCardUI} attacker
     * @param {GameCardUI} defender
    */
    declareAttackAction(playerScene, attacker, defender) {
        let action = new Action();
        action.start = () => {
            this.scene.targetingArrow.update(defender.x, defender.y);
            attacker.setState(CARD_STATES.IN_PLAY_ATTACKING);
            defender.setState(CARD_STATES.IN_PLAY_DEFENDING);
            this.scene.game.gameClient.requestStartBlockerPhase();
        };
        action.isPlayerAction = true;
        action.waitForAnimationToComplete = false;
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
        let animation = this.scene.targetingArrow.animateToPosition(blockerCard.x, blockerCard.y, 200);
        animation = animation.concat({
            duration: 10,
            onComplete: () => {this.scene.actionManager.finalizeAction();} //Use a callback to send a message he animation is finished and counter can start
        });
        animation = this.scene.tweens.chain({
            targets: this.scene.targetingArrow,
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
            characterCard.updateAttachedCounterPosition();
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

            //Hide targeting arrow
            this.scene.targetingArrow.stopTargeting();

            // Get the attacker and defender cards from the attack manager
            const attacker = this.scene.attackManager.attack.attacker;
            const defender = this.scene.attackManager.attack.defender;
        
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
                this.discardCardAction(defenderPlayer, this.scene.attackManager.attack.defender);
            }

            //Create an action to draw a card from the life pool if attacker was attacked and update lifepoints

            //Create an action to switch states when finished
            let finishAction = new Action();
            finishAction.start = () => {
                this.scene.gameState.exit(GAME_STATES.ACTIVE_INTERACTION);
                //Replace with a call to the server to synchronise
                //FIXME create call to server
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
                if(card.cardData.card === CARD_TYPES.EVENT) {
                    this.scene.targetManager.originatorCard = card;
                    this.scene.eventArrow.startTargeting(card);
                }
                else this.scene.targetingArrow.startTargeting(card);
            };
            action.isPlayerAction = true;
            action.waitForAnimationToComplete = false;
            action.name = "START TARGETING";

            //Add action to the action stack
            this.actionManager.addAction(action);
        } else {
            this.scene.gameState.exit(GAME_STATES.TARGETING);
            
            if(card.cardData.card === CARD_TYPES.EVENT) {
                this.scene.targetManager.originatorCard = card;
                this.scene.eventArrow.startTargeting(card);
            }
            else this.scene.targetingArrow.startTargeting(card);
        }
    }

    /** Function to stop the targeting */
    cancelTargetingAction() {
        let action = new Action();
        action.start = () => {
            let card = null;
            if(this.scene.targetManager.originatorCard === null) {
                card = this.scene.targetingArrow.originatorObject;
                this.scene.targetingArrow.stopTargeting();
            } else {
                card = this.scene.eventArrow.originatorObject;
                this.scene.eventArrow.stopTargeting();
            }            

            switch(this.scene.targetManager.targetAction) {
                case 'EVENT_CARD_ACTION':
                case 'PLAY_CARD_ACTION':
                    card.setDepth(DEPTH_VALUES.CARD_IN_HAND);
                    card.setState(CARD_STATES.IN_HAND);
                    card.playerScene.hand.update();
                    break;
                default:
                    break;
            }

            this.scene.game.gameClient.requestCancelTargeting(this.scene.targetManager.targetData);
            this.scene.targetManager.reset();

            if(this.scene.gameState.previousState !== null) this.scene.gameState.exit(this.scene.gameState.previousState);
        }
        action.isPlayerAction = true;
        action.waitForAnimationToComplete = false;
        action.name = "CANCEL TARGETING";

        //Add action to the action stack
        this.actionManager.addAction(action);
    }
    //#endregion
}