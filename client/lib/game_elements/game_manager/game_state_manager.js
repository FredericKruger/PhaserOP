class GameStateManager {

    /** Constructor
     * @param {GameScene} scene - The scene that will contain the game state manager
     * @param {GameStateUI} gameStateUI - The UI elements that will be managed by the game state manager
     */
    constructor(scene, gameStateUI) {
        this.scene = scene;
        this.gameStateUI = gameStateUI;

        this.gameOver = false;

        //Game State Variables
        this.currentGamePhase = null;

        //Flags for mulligan
        this.activePlayerReadyForMulligan = false;
        this.passivePlayerReadyForMulligan = false;
    }

    /** Function that initialise the scene */
    setupScene(activePlayerLeader, passivePlayerLeader) {
        this.setPhase(GAME_PHASES.SETUP); //Set the phase to setup

        this.scene.add.tween({
            targets: this.scene.maskPanel,
            alpha: {from: 0.8, to: 0},
            duration: 1000
        });
        //Fill the don deck
        this.scene.activePlayerScene.setVisible(true);
        this.scene.passivePlayerScene.setVisible(true);

        //Distribute Don Cards
        this.scene.activePlayerScene.donDeck.createCardPile(10);
        this.scene.passivePlayerScene.donDeck.createCardPile(10);

        //Distribute Deck Cards
        this.scene.activePlayerScene.deck.createCardPile(50);
        this.scene.passivePlayerScene.deck.createCardPile(50);

        //Create Leader Cards, and move them to the leader location
        let activePlayerLeaderCard = new GameCardUI(this.scene, this.scene.activePlayerScene, {
            x: this.scene.screenCenterX,
            y: this.scene.screenHeight + GAME_UI_CONSTANTS.CARD_ART_HEIGHT * 0.5 * CARD_SCALE.IN_DECK,
            state: CARD_STATES.LEADER_TRAVELLING_TO_LOCATION,
            scale: CARD_SCALE.IN_DECK,
            artVisible: false,
            depth: 1,
            id: activePlayerLeader.id
        });
        activePlayerLeaderCard.updateCardData(activePlayerLeader.cardData, true);

        let passivePlayerLeaderCard = new GameCardUI(this.scene, this.scene.passivePlayerScene, {
            x: this.scene.screenCenterX,
            y: -GAME_UI_CONSTANTS.CARD_ART_HEIGHT * 0.5 * CARD_SCALE.IN_DECK,
            state: CARD_STATES.LEADER_TRAVELLING_TO_LOCATION,
            scale: CARD_SCALE.IN_DECK,
            artVisible: false,
            depth: 1,
            id: passivePlayerLeader.id
        });
        passivePlayerLeaderCard.updateCardData(passivePlayerLeader.cardData, true);
        this.scene.children.moveBelow(passivePlayerLeaderCard, activePlayerLeaderCard);

        //Active Player tween
        this.scene.add.tween({
            targets: activePlayerLeaderCard,
            y: this.scene.activePlayerScene.leaderLocation.posY - 150,
            scale: {from: CARD_SCALE.IN_DECK, to: 0.5},
            duration: 600,
            ease: 'Back.easeOut', // More dynamic easing function
            onComplete: () => {
                this.scene.add.tween({
                    targets: activePlayerLeaderCard,
                    y: this.scene.activePlayerScene.leaderLocation.posY,
                    scale: {from: 0.4, to: CARD_SCALE.IN_LOCATION_LEADER},
                    duration: 400, // Faster landing for more impact
                    delay: 800,
                    ease: 'Bounce.easeOut', // Bounce effect on landing
                    onComplete: () => {
                        // Create and play dust explosion effect
                        const dustExplosion = this.scene.add.sprite(
                            activePlayerLeaderCard.x,
                            activePlayerLeaderCard.y, // Position it below the card
                            ASSET_ENUMS.DUST_EXPLOSION_SPRITESHEET
                        ).setScale(3).setOrigin(0.5);
                        
                        // Set the depth to be just below the card
                        this.scene.children.moveBelow(dustExplosion, activePlayerLeaderCard);
                        
                        // Play the dust explosion animation
                        dustExplosion.play(ANIMATION_ENUMS.DUST_EXPLOSION_ANIMATION);
                        
                        // Add a camera shake effect for more impact
                        this.scene.cameras.main.shake(150, 0.008);
                        
                        // Remove the explosion sprite once the animation completes
                        dustExplosion.once('animationcomplete', () => {
                            dustExplosion.destroy();
                        });

                        // Add a slight scale bounce to the card
                        this.scene.tweens.add({
                            targets: activePlayerLeaderCard,
                            scaleX: activePlayerLeaderCard.scaleX * 1.1,
                            scaleY: activePlayerLeaderCard.scaleY * 1.1,
                            duration: 150,
                            yoyo: true,
                            ease: 'Quad.easeOut',
                            onComplete: () => {
                                this.scene.activePlayerScene.leaderLocation.addCard(activePlayerLeaderCard);
                                activePlayerLeaderCard.setState(CARD_STATES.IN_DECK);
                                this.activePlayerReadyForMulligan = true;
                                this.startMulliganPhase();
                            }
                        });
                    }
                })
            }
        });

        // Passive Player leader card animation with enhanced dynamics and dust explosion
        this.scene.add.tween({
            targets: passivePlayerLeaderCard,
            delay: 300, // Delay the animation to create a staggered effect
            y: this.scene.passivePlayerScene.leaderLocation.posY + 75, // Higher arc for more impact
            scale: {from: CARD_SCALE.IN_DECK, to: 0.35}, // Match the active player scale
            duration: 600, // Match the active player duration
            ease: 'Back.easeOut', // More dynamic easing function
            onComplete: () => {
                this.scene.add.tween({
                    targets: passivePlayerLeaderCard,
                    y: this.scene.passivePlayerScene.leaderLocation.posY,
                    scale: {from: 0.35, to: CARD_SCALE.IN_LOCATION_LEADER},
                    duration: 400, // Faster landing for more impact
                    delay: 800,
                    ease: 'Bounce.easeOut', // Bounce effect on landing
                    onComplete: () => {
                        // Create and play dust explosion effect
                        const dustExplosion = this.scene.add.sprite(
                            passivePlayerLeaderCard.x,
                            passivePlayerLeaderCard.y, // Position it below the card
                            ASSET_ENUMS.DUST_EXPLOSION_SPRITESHEET
                        ).setScale(3).setOrigin(0.5);
                        
                        // Set the depth to be just below the card
                        this.scene.children.moveBelow(dustExplosion, passivePlayerLeaderCard);
                        
                        // Play the dust explosion animation
                        dustExplosion.play(ANIMATION_ENUMS.DUST_EXPLOSION_ANIMATION);
                        
                        // Add a camera shake effect for more impact
                        this.scene.cameras.main.shake(150, 0.008);
                        
                        // Remove the explosion sprite once the animation completes
                        dustExplosion.once('animationcomplete', () => {
                            dustExplosion.destroy();
                        });

                        // Add a slight scale bounce to the card
                        this.scene.tweens.add({
                            targets: passivePlayerLeaderCard,
                            scaleX: passivePlayerLeaderCard.scaleX * 1.1,
                            scaleY: passivePlayerLeaderCard.scaleY * 1.1,
                            duration: 150,
                            yoyo: true,
                            ease: 'Quad.easeOut',
                            onComplete: () => {
                                this.scene.passivePlayerScene.leaderLocation.addCard(passivePlayerLeaderCard);
                                passivePlayerLeaderCard.setState(CARD_STATES.IN_DECK);
                                this.passivePlayerReadyForMulligan = true;
                                this.startMulliganPhase();
                            }
                        });
                    }
                });
            }
        });

    }

    //#region MULLIGAN FUNCTIONS
    
    startMulliganPhase() {
        //Check if animations have completed
        if(this.activePlayerReadyForMulligan && this.passivePlayerReadyForMulligan) {
            this.setPhase(GAME_PHASES.MULLIGAN_PHASE); //Update Phase
            //Tell the client to start
            this.scene.game.gameClient.requestStartMulliganPhase();
        }
    }

    /**
     * 
     * @param {Array<number>} activePlayerCards 
     * @param {Array<number>} passivePlayerCards 
     */
    startMulligan(activePlayerCards, passivePlayerCards) {
        this.scene.add.tween({
            targets: this.scene.maskPanel,
            alpha: {from:0, to:0.85},
            duration: 500,
            onComplete: () => {
                this.gameStateUI.mulliganUI.startMulligan();

                //Callback for the last card draw to show the buttons
                let startAnimationCallback = () => {
                    this.gameStateUI.mulliganUI.keepButton.setVisible(true);
                    this.gameStateUI.mulliganUI.mulliganButton.setVisible(true);
                };

                //Draw the active player's cards
                for(let i=0; i<activePlayerCards.length; i++) {
                    let callBack = (i === (activePlayerCards.length-1) ? startAnimationCallback : null);
                    this.scene.actionLibrary.drawCardAction(this.scene.activePlayerScene, activePlayerCards[i], GAME_PHASES.MULLIGAN_PHASE, {delay: i*300, startAnimationCallback: callBack}, {mulliganPosition: i, waitForAnimationToComplete: false});
                }
                
                //Draw the passive player's cards
                for(let i=0; i<passivePlayerCards.length; i++)
                    this.scene.actionLibraryPassivePlayer.drawCardAction(this.scene.passivePlayerScene, passivePlayerCards[i], GAME_PHASES.MULLIGAN_PHASE, {delay: i*300}, {mulliganPosition: i, waitForAnimationToComplete: false, isServerRequest: false});
            }
        });
    }

    /** Swap the new cards
     * @param {Array<Object>} newCards - The new cards to swap
     */
    mulliganCards(newCards) {
        if(newCards.length > 0) { //If there are new cards Mulligan
            //Put the old cards back
            let index = 0;
            let oldCards = this.gameStateUI.mulliganUI.cards;
            for(let card of oldCards) {
                this.scene.actionLibrary.moveCardsMulliganToDeckAction(this.scene.activePlayerScene, card, {delay: 0}, {waitForAnimationToComplete: true});            
            }

            //Create an action to start the next step once the previous once are competed
            this.scene.time.delayedCall(1000, () => {
                //Create an overall action to start all the draw Cards
                let action = new Action();
                action.start = () => {
                        for(let i=0; i<newCards.length; i++) {
                            let waitForAnimationToComplete = (i === (newCards.length-1) ? true : false); //Last Draw Card to wait for end of animation
                            this.scene.actionLibrary.drawCardAction(this.scene.activePlayerScene, newCards[i], GAME_PHASES.MULLIGAN_PHASE, {delay: i*300}, {mulliganPosition: i, waitForAnimationToComplete: waitForAnimationToComplete});
                        }
                        //At the end of the draw cards, create an action to end the mulligan phase
                        let endMulliganAction = new Action();
                        endMulliganAction.start = () => {this.scene.game.gameClient.requestEndMulliganPhase();}
                        endMulliganAction.isPlayerAction = true;
                        endMulliganAction.waitForAnimationToComplete = false;
                        this.scene.actionManager.addAction(endMulliganAction);
                }
                action.isPlayerAction = true;
                action.waitForAnimationToComplete = false;
                this.scene.actionManager.addAction(action);
            });
        } else { //If there are no new cards, end the mulligan phase
            let endMulliganAction = new Action();
            endMulliganAction.start = () => {this.scene.game.gameClient.requestEndMulliganPhase();}
            endMulliganAction.isPlayerAction = true;
            endMulliganAction.waitForAnimationToComplete = false;
            this.scene.actionManager.addAction(endMulliganAction);
        }
    }

    /** Function to mulligan the passive players cards 
     * @param {Array<Object>} newCards - The new cards to swap
    */
    mulliganCardsPassivePlayer(newCards) {
        if(newCards.length>0) {
            //Put the old cards back
            let index = 0;
            let oldCards = this.gameStateUI.mulliganUI.card_passivePlayer;
            for(let card of oldCards) {
                this.scene.actionLibraryPassivePlayer.moveCardsMulliganToDeckAction(this.scene.passivePlayerScene, card, {delay: index*300}, {waitForAnimationToComplete: false});            
                index++;
            }
            this.gameStateUI.mulliganUI.card_passivePlayer = []; //Delete the array

            //Draw the passive player's cards
            let animationCallback = () => {
                this.scene.game.gameClient.requestMulliganAnimationPassivePlayerComplete();
            };
            for(let i=0; i<newCards.length; i++) {
                let callback = (i === (newCards.length-1) ? animationCallback : null);
                this.scene.actionLibraryPassivePlayer.drawCardAction(this.scene.passivePlayerScene, newCards[i], GAME_PHASES.MULLIGAN_PHASE, {delay: i*300 + 1500, startAnimationCallback: callback}, {mulliganPosition: i, waitForAnimationToComplete: false, isServerRequest: false});
            }
        } else {
            this.scene.game.gameClient.requestMulliganAnimationPassivePlayerComplete();
        }
    }

    /** Function to end the mulligan phase */
    endMulligan() {
        //remove ui
        this.gameStateUI.mulliganUI.setVisible(false);

        //Add Mulligan cards to the hand
        this.scene.activePlayerScene.hand.addCards(this.gameStateUI.mulliganUI.cards, {setCardState: true, setCardDepth: true, setCardInteractive: true, setCardDraggable: false, updateUI: false});
        this.scene.passivePlayerScene.hand.addCards(this.gameStateUI.mulliganUI.card_passivePlayer, {setCardState: true, setCardDepth: false, setCardInteractive: false, setCardDraggable: false, updateUI: false});

        //Set Game State to passive
        this.scene.gameState.exit(GAME_STATES.PASSIVE_INTERACTION);

        //Create tween to remove mulligan UI
        this.scene.add.tween({
            targets: this.scene.maskPanel,
            alpha: {from:0.85, to:0},
            duration: 500,
            onComplete: () => {
                //Redraw the hand
                this.scene.activePlayerScene.hand.update();
                this.scene.passivePlayerScene.hand.update();

                this.scene.game.gameClient.requestFirstTurnSetup();
            }
        });      
    }

    //#endregion

    //#region FIRST TURN FUNCTIONS
    /** Function that prepares the ui for the first turn. Distributes life cards from the deck
     * @param {Array<number>} activePlayerCards - The active player's cards
     * @param {Array<number>} passivePlayerCards - The passive player's cards
     */
    firstTurnSetup(activePlayerCards, passivePlayerCards) {
        //Start the step with a bit of delay to not appear too rushed
        this.scene.time.delayedCall(100, () => {
            //Show ui
            this.gameStateUI.setVisible(true);

            //Set Game phase
            this.setPhase(GAME_PHASES.PREPARING_FIRST_TURN);

            //Change state of leader cards
            this.scene.activePlayerScene.leaderLocation.cards[0].setState(CARD_STATES.IN_PLAY_FIRST_TURN);
            this.scene.passivePlayerScene.leaderLocation.cards[0].setState(CARD_STATES.IN_PLAY_FIRST_TURN);
            
            //Draw the active player's cards
            let animationCallback = () => {
                this.scene.game.gameClient.requestFirstTurnSetupComplete();
            };
            for(let i=0; i<activePlayerCards.length; i++) {
                let callback = (i === (activePlayerCards.length-1) ? animationCallback : null);
                this.scene.actionLibrary.drawCardAction(this.scene.activePlayerScene, {id:activePlayerCards[i]}, GAME_PHASES.PREPARING_FIRST_TURN, {delay: i*300, startAnimationCallback: callback}, {waitForAnimationToComplete: false});
            }
            if(activePlayerCards.length === 0) animationCallback(); //If no cards, call the callback
            
            //Draw the passive player's cards
            animationCallback = () => {
                this.scene.game.gameClient.requestFirstTurnSetupPassivePlayerAnimationComplete();
            };
            for(let i=0; i<passivePlayerCards.length; i++) {
                let callback = (i === (passivePlayerCards.length-1) ? animationCallback : null);
                this.scene.actionLibraryPassivePlayer.drawCardAction(this.scene.passivePlayerScene, {id:passivePlayerCards[i]}, GAME_PHASES.PREPARING_FIRST_TURN, {delay: i*300, startAnimationCallback: callback}, {waitForAnimationToComplete: false, isServerRequest: false});
            }
            if(passivePlayerCards.length === 0) animationCallback(); //If no cards, call the callback

            //Make leader cards dizzy to signal first turn
            this.scene.activePlayerScene.leaderLocation.cards[0].startDizzyAnimation();
            this.scene.passivePlayerScene.leaderLocation.cards[0].startDizzyAnimation();
        });
    }
    //#endregion

    //#region REFRESH PHASE FUNCTIONS

    /** Function that performs  the refresh of the don and the characters
     * All Animation can happen simultaniously
     * Start by showing the "you turn" image
     * @param {Array<number>} refreshDon - The Don cards to be moved or added to the pool
     * @param {Array<number>} refreshCards - The cards to be set to active
     * @param {Array<string>} removedAuras - The cards to be removed from the game
     */
    startRefreshPhase(refreshDon, refreshCards, removedAuras) {
        this.scene.time.delayedCall(1000, () => {
            this.setPhase(GAME_PHASES.REFRESH_PHASE); //Set the phase to Refresh Phase

            //If in this phase, the player is the active player
            this.scene.activePlayerScene.isPlayerTurn = true;
            this.scene.passivePlayerScene.isPlayerTurn = false;

            //remove turn auras
            for(let auraId of removedAuras) this.scene.auraManager.removeAura(auraId);

            //Refresh the nextTurn Button
            this.gameStateUI.nextTurnbutton.fsmState.exit(NEXT_TURN_BUTTON_FSM_STATES.PASSIVE);
            //this.gameStateUI.yourTurnImage.setAlpha(1); 
    
            // Enhanced animation for "Your Turn" transition
            this.scene.add.tween({
                targets: this.gameStateUI.yourTurnImage,
                delay: 600, // Shorter delay for better pacing
                alpha: { from: 0, to: 1 }, // Start invisible and fade in
                scale: { from: 0.55, to: 0.6 }, // Very minimal scale change
                y: { from: this.gameStateUI.yourTurnImage.y - 10, to: this.gameStateUI.yourTurnImage.y }, // Reduced vertical movement
                ease: 'Sine.easeOut', // Changed to smoother easing
                duration: 400, // Slower animation
                onStart: () => {
                    // Add camera shake for dramatic effect
                    if (this.scene.cameras && this.scene.cameras.main) {
                        this.scene.cameras.main.shake(80, 0.002);
                    }
                },
                onComplete: () => {
                    // Add pulsing effect
                    this.scene.tweens.add({
                        targets: this.gameStateUI.yourTurnImage,
                        scale: 0.605, // Very minimal pulse
                        duration: 350, // Slower pulse
                        yoyo: true,
                        repeat: 1,
                        ease: 'Sine.easeInOut',
                        onComplete: () => {
                            // Add dramatic exit animation
                            this.scene.tweens.add({
                                targets: this.gameStateUI.yourTurnImage,
                                alpha: 0,
                                scale: 0.59, // Minimal scale change
                                duration: 500, // Slower fade out
                                ease: 'Sine.easeIn',
                                onComplete: () => {
                                    // Original code after animation completes
                                    //Refresh DON Cards
                                    let numberOfAnimations = 0;
                                    let delay = 0;
                                    for(let i=0; i<refreshDon.length; i++) { //For all the don cards
                                        let donCard = this.scene.activePlayerScene.activeDonDeck.getCard(refreshDon[i]); //Get the card
                                        if(donCard.state === CARD_STATES.DON_ATTACHED) { //If the don card is attached
                                            donCard.setState(CARD_STATES.DON_ACTIVE); //Change state
                                            donCard.setDepth(DEPTH_VALUES.DON_IN_PILE); //Set Depth
                                    
                                            //Create tween to bring it back to the area
                                            this.scene.tweens.chain({
                                                targets: donCard,
                                                tweens: this.scene.animationLibrary.animation_move_don_characterarea2activearea(donCard, numberOfAnimations*300)
                                            });

                                            numberOfAnimations = numberOfAnimations + 1; //Increase animation delay tracker
                                        } else {
                                            donCard.setState(CARD_STATES.DON_ACTIVE);

                                            this.scene.tweens.chain({
                                                targets: donCard,
                                                tweens: this.scene.animationLibrary.repayDonAnimation(donCard.playerScene, donCard, delay)
                                            });
                                            delay += 200; //Increase animation delay tracker
                                        }
                                    }
                                    this.scene.activePlayerScene.playerInfo.updateCardAmountTexts(); //Update the ui

                                    //Refresh Character Cards
                                    for(let i=0; i<refreshCards.length; i++) {
                                        let card = this.scene.activePlayerScene.getCard(refreshCards[i]);
                                        card.setState(CARD_STATES.IN_PLAY); //Make characters in play
                                        card.turnPlayed = false;
                                        card.stopDizzyAnimation();
                                    }

                                    //Refresh the attached don array
                                    for(let card of this.scene.activePlayerScene.characterArea.cards) {
                                        card.attachedDon = [];
                                        card.updateAttachedDonPosition();
                                        card.updatePowerText();
                                        card.resetTurn();
                                    }
                                    for(let card of this.scene.activePlayerScene.leaderLocation.cards) {
                                        card.attachedDon = [];
                                        card.updateAttachedDonPosition();
                                        card.updatePowerText();
                                        card.resetTurn();
                                    }
                                    for(let card of this.scene.activePlayerScene.characterArea.cards) card.resetTurn();

                                    //Refresh cards for passive player
                                    for(let card of this.scene.passivePlayerScene.characterArea.cards) card.resetTurn();
                                    for(let card of this.scene.passivePlayerScene.leaderLocation.cards) card.resetTurn();
                                    for(let card of this.scene.passivePlayerScene.stageLocation.cards) card.resetTurn();

                                    //Refresh all passive player Card Power as attached dons only give power during the active player's turn
                                    for(let card of this.scene.passivePlayerScene.characterArea.cards) card.updatePowerText();
                                    for(let card of this.scene.passivePlayerScene.leaderLocation.cards) card.updatePowerText();

                                    //Tell server refresh complete
                                    this.scene.game.gameClient.requestEndRefreshPhase(true);
                                }
                            });
                        }
                    });
                }
            });
        });
    }

    /** Function that performs the refresh of teh don and characters for the passive player
     * All animations can happen sumultaniously
     * @param {Array<number>} refreshDon - The Don cards to be moved or added to the pool
     * @param {Array<number>} refreshCards - The cards to be set
     * @param {Array<string>} removedAuras - The cards to be removed from the game
     */
    startRefreshPhasePassivePlayer(refreshDon, refreshCards, removedAuras) {
        this.scene.time.delayedCall(100, () => {
            this.setPhase(GAME_PHASES.REFRESH_PHASE);

            //If in this phase, the player is the pasive player
            this.scene.activePlayerScene.isPlayerTurn = false;
            this.scene.passivePlayerScene.isPlayerTurn = true;

            //remove turn auras
            for(let auraId of removedAuras) this.scene.auraManager.removeAura(auraId);

            //Refresh the nextTurn Button
            this.gameStateUI.nextTurnbutton.fsmState.exit(NEXT_TURN_BUTTON_FSM_STATES.OPPONENT_TURN);

            //Refresh Don Cards
            let numberOfAnimations = 0;
            let delay = 0;
            for(let i=0; i<refreshDon.length; i++) { //For all the don cards in the pile
                let donCard = this.scene.passivePlayerScene.activeDonDeck.getCard(refreshDon[i]);
                if(donCard.state === CARD_STATES.DON_ATTACHED) { //If the don is attached
                    donCard.setState(CARD_STATES.DON_ACTIVE); //Set the state to active
                    donCard.setDepth(DEPTH_VALUES.DON_IN_PILE); //Change the depth
                    
                    //Create tween chain to move the cardto the pile
                    this.scene.tweens.chain({
                        targets: donCard,
                        tweens: this.scene.animationLibrary.animation_move_don_characterarea2activearea(donCard, numberOfAnimations*300)
                    });

                    numberOfAnimations = numberOfAnimations + 1; //Increase animation counter
                } else {
                    donCard.setState(CARD_STATES.DON_ACTIVE);

                    this.scene.tweens.chain({
                        targets: donCard,
                        tweens: this.scene.animationLibrary.repayDonAnimation(donCard.playerScene, donCard, delay)
                    });
                    delay += 200; //Increase animation delay tracker
                }
            }
            this.scene.passivePlayerScene.playerInfo.updateCardAmountTexts(); //Update the ui

            //Refresh Character Cards
            for(let i=0; i<refreshCards.length; i++) {
                let card = this.scene.passivePlayerScene.getCard(refreshCards[i]); //Set all character cards to ready
                card.setState(CARD_STATES.IN_PLAY);
                card.stopDizzyAnimation();
            }

            //Refresh the attached don array
            for(let card of this.scene.passivePlayerScene.characterArea.cards) {
                card.attachedDon = [];
                card.updateAttachedDonPosition();
                card.updatePowerText();
                card.resetTurn();
            }
            for(let card of this.scene.passivePlayerScene.leaderLocation.cards) {
                card.attachedDon = [];
                card.updateAttachedDonPosition();
                card.updatePowerText();
                card.resetTurn();
            }
            for(let card of this.scene.passivePlayerScene.characterArea.cards) card.resetTurn();

            //Update Turn values
            for(let card of this.scene.activePlayerScene.characterArea.cards) card.resetTurn();
            for(let card of this.scene.activePlayerScene.leaderLocation.cards) card.resetTurn();
            for(let card of this.scene.activePlayerScene.stageLocation.cards) card.resetTurn();

            //Refresh all activePlayer Card Power as don cards only give power during the active player's turn
            for(let card of this.scene.activePlayerScene.characterArea.cards) card.updatePowerText();
            for(let card of this.scene.activePlayerScene.leaderLocation.cards) card.updatePowerText();

            //Tell server refresh complete
            this.scene.game.gameClient.requestEndRefreshPhase(false);
        });
    }

    //#endregion

    //#region PHASE FUNCTIONS 

    /**  Function that start the draw phase
     * @param {Array<Object>} newCards - The card to be drawn
     */
    startDrawPhase(newCards, isPlayerTurn) {
        this.scene.time.delayedCall(1000, () => {
            this.setPhase(GAME_PHASES.DRAW_PHASE); //Set the phase to Draw Phase

            for(let card of newCards) {
                //Create a Draw action for each card (should be a single card)
                if(isPlayerTurn) this.scene.actionLibrary.drawCardAction(this.scene.activePlayerScene, card, GAME_PHASES.DRAW_PHASE, {delay: 0}, {waitForAnimationToComplete: true});
                else this.scene.actionLibraryPassivePlayer.drawCardAction(this.scene.passivePlayerScene, card, GAME_PHASES.DRAW_PHASE, {delay: 0}, {waitForAnimationToComplete: true, isServerRequest: false});
            }
    
            //Create a last action to call the server
            let endDrawPhaseAction = new Action();
            endDrawPhaseAction.start = () => {this.scene.game.gameClient.requestEndDrawPhase(isPlayerTurn);};
            endDrawPhaseAction.isPlayerAction = true;
            endDrawPhaseAction.waitForAnimationToComplete = false;
            this.scene.actionManager.addAction(endDrawPhaseAction);
        });
    }

    /** Function to start the Don Phase
     * @param {Array<number>} donCards - The cards to be used in the Don Phase
    */
    startDonPhase(donCards, isPlayerTurn) {
        this.scene.time.delayedCall(1000, () => {
            this.setPhase(GAME_PHASES.DON_PHASE); //Set the phase to Don Phase

            //Draw the active player's cards
            let animationCallback = () => {this.scene.game.gameClient.requestEndDonPhase(isPlayerTurn);};

            for(let i=0; i<donCards.length; i++) {
                let callback = (i === (donCards.length-1) ? animationCallback : null);
                if(isPlayerTurn) this.scene.actionLibrary.drawDonCardAction(this.scene.activePlayerScene, donCards[i], GAME_PHASES.DON_PHASE, {delay: i*0, startAnimationCallback: callback}, {waitForAnimationToComplete: true});
                else this.scene.actionLibraryPassivePlayer.drawDonCardAction(this.scene.passivePlayerScene, donCards[i], GAME_PHASES.DON_PHASE, {delay: i*0, startAnimationCallback: callback}, {waitForAnimationToComplete: true, isServerRequest: false});

                //Create DON image and create animation to show and destroy it on DON. Handling different position depending on 1 or 2 Don cards being drawn
                //Create DON image and create animation to show and destroy it on DON. Handling different position depending on 1 or 2 Don cards being drawn
                let donImage = this.scene.add.image(
                    this.scene.screenWidth*0.35 + i * this.scene.screenWidth * 0.3,
                    this.scene.screenCenterY - 100 + i * 200,
                    ASSET_ENUMS.GAME_DON_BIG
                ).setOrigin(0.5).setDepth(2).setScale(0).setVisible(false).setAngle(-10 + i*20);

                // Dramatic entry animation sequence
                this.scene.tweens.add({
                    onStart: () => {donImage.setVisible(true);},
                    targets: donImage,
                    delay: i*500,
                    scale: { from: 0, to: 1.3 }, // Zoom in effect (larger than final)
                    angle: { from: -20 + i*40, to: -10 + i*20 }, // Rotation effect
                    duration: 400,
                    ease: 'Back.easeOut',
                    onComplete: () => {                       
                        // Pulse effect
                        this.scene.tweens.add({
                            targets: donImage,
                            scale: 1,
                            duration: 200,
                            ease: 'Bounce.easeOut',
                            onComplete: () => {                                
                                // Hold for a moment before fading out
                                this.scene.time.delayedCall(400, () => {
                                    this.scene.tweens.add({
                                        targets: donImage,
                                        alpha: { from: 1, to: 0 },
                                        scale: { from: 1, to: 1.2 },
                                        duration: 800,
                                        ease: 'Power1.easeIn',
                                        onComplete: () => {donImage.destroy();}
                                    });
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    /** Function to start the main phase 
     * @param {boolean} isPlayerTurn - If it is the player's turn
    */
    startMainPhase(isPlayerTurn) {
        this.setPhase(GAME_PHASES.MAIN_PHASE); //Set the phase to Main Phase

        if(isPlayerTurn) {
            //Make the cards draggable in the hand and in the don deck
            this.scene.gameState.exit(GAME_STATES.ACTIVE_INTERACTION);
            this.gameStateUI.nextTurnbutton.fsmState.exit(NEXT_TURN_BUTTON_FSM_STATES.ACTIVE);

            //Change state of the next turn button
            //this.scene.gameStateUI.nextTurnbutton.makeInteractive(true);

        } else {
            this.scene.gameState.exit(GAME_STATES.PASSIVE_INTERACTION);
        }
    }

    /** Function to set the phase of the game 
     * @param {string} phase - The phase to set
    */
    setPhase(phase) {
        this.currentGamePhase = phase;
        this.gameStateUI.udpatePhase(phase);
    }

    //#endregion

    //#region PLAY CARD FUNCTIONS
    /** Function to handle playing a card that is too expensive */
    playCardNotEnoughDon(actionInfos, isPLayerTurn) {
        //Get the card
        let player = this.scene.activePlayerScene;
        if(!isPLayerTurn) player = this.scene.passivePlayerScene;
        
        let card = player.hand.getCard(actionInfos.playedCard);
        //Change card state to in hand
        card.setState(CARD_STATES.IN_HAND);
        card.hideGlow();
        player.hand.update();

        if(isPLayerTurn) {
            player.playerInfo.activeDonCardAmountText.setScale(1.2);
            this.scene.tweens.add({
                targets: player.playerInfo.activeDonPlaceholder,
                x: { from: player.playerInfo.activeDonPlaceholder.x - 10, to: player.playerInfo.activeDonPlaceholder.x + 10 }, // Move left and right
                duration: 100, // Duration of each shake
                yoyo: true, // Move back to the original position
                repeat: 2, // Repeat the shake 2 times
                onComplete: () => {
                    player.playerInfo.activeDonPlaceholder.x = player.playerInfo.activePlaceholderPos.x;
                    player.playerInfo.activeDonCardAmountText.setScale(1);
                }
            });
        }
    }

    /** Function to  */
    startPlayCard(actionInfos, isPlayerTurn) {
        let player = this.scene.activePlayerScene;
        if(!isPlayerTurn) player = this.scene.passivePlayerScene;

        let card = player.getCard(actionInfos.playedCard); //Get the card
        let callback = () => {
            this.scene.game.gameClient.requestStartPlayCardComplete();
        };
        if(isPlayerTurn) this.scene.actionLibrary.startPlayCardAction(card.playerScene, card, actionInfos.spentDonIds, callback);
        else this.scene.actionLibraryPassivePlayer.startPlayCardAction(card.playerScene, card);
    }

    /** Function to play a card
     * @param {Object} actionInfos - The action infos
     * @param {boolean} isPlayerTurn - If it is the player's turn
     * @param {boolean} startTargeting - If the targeting should start
     */
    /*playCard(actionInfos, isPlayerTurn, startTargeting) {
        let player = this.scene.activePlayerScene;
        if(!isPlayerTurn) player = this.scene.passivePlayerScene;

        player.playCard(actionInfos, isPlayerTurn, startTargeting);
    }*/
    playCard(actionInfos, isPlayerTurn) {
        let player = this.scene.activePlayerScene;
        if(!isPlayerTurn) player = this.scene.passivePlayerScene;

        let card = player.getCard(actionInfos.cardPlayed); //Get the card
        if(isPlayerTurn) this.scene.actionLibrary.playCardAction(card.playerScene, card, actionInfos);
        else this.scene.actionLibraryPassivePlayer.playCardAction(card.playerScene, card, actionInfos);
    }

    /** Function to start the targeting of a card replacement
     * @param {Object} actionInfos - The action infos
     * @param {boolean} isPlayerTurn - If it is the player's turn
     * @param {string} type
     */
    selectTarget(actionInfos, isPlayerTurn, type) {
        let player = this.scene.activePlayerScene;
        if(!isPlayerTurn) player = this.scene.passivePlayerScene;

        let card = player.getCard(actionInfos.playedCard);
        let targetManager = new TargetManager(this.scene, type, actionInfos.actionId, actionInfos.playedCard);
        this.scene.targetManagers.push(targetManager);
        targetManager.loadFromTargetData(actionInfos.targetData);

        this.scene.actionLibrary.startTargetingAction(this, card, false);
    }

    /** Function to cancel the playing of a card
     * @param {number} cardID - The card ID
     * @param {Array<number>} spentDonIds - The spent don IDs
     * @param {boolean} isPlayerTurn - If it is the player's turn
     */
    cancelPlayCard(cardID, spentDonIds, isPlayerTurn) {
        let player = this.scene.activePlayerScene;
        if(!isPlayerTurn) player = this.scene.passivePlayerScene;

        let card = player.hand.getCard(cardID);
        if(isPlayerTurn) this.scene.actionLibrary.cancelPlayCard(player, card, spentDonIds, false);
        else this.scene.actionLibraryPassivePlayer.cancelPlayCard(player, card, false);
    }

    //#endregion

    //#region ATTACH DON FUNCTIONS
    /** Function to trigger failure of attaching a card
     * @param {Object} actionInfos - The action infos
     * @param {boolean} isPlayerTurn - If it is the player's turn
     */
    attachDonToCharacterFailure(actionInfos, isPlayerTurn) {
        let player = this.scene.activePlayerScene;
        if(!isPlayerTurn) player = this.scene.passivePlayerScene;

        let donCard = player.activeDonDeck.getCard(actionInfos.attachedDonCard);
        donCard.setState(CARD_STATES.DON_ACTIVE);
        donCard.setDepth(DEPTH_VALUES.DON_IN_PILE);

        let animation = this.scene.animationLibrary.animation_move_don_characterarea2activearea(donCard, 0);
        if(!isPlayerTurn) animation = this.scene.animationLibraryPassivePlayer.animation_move_don_characterarea2activearea(donCard, 0);

        this.tweens.chain({
            targets: donCard,
            tweens: animation
        });
    }

    /** Function to trigger the succes of attaching a card
     * @param {Object} actionInfos - The action infos
     * @param {boolean} isPlayerTurn - If it is the player's turn
     * @param {boolean} botAction - If it is a bot action
     */
    attachDonToCharacterSuccess(actionInfos, isPlayerTurn, botAction) {
        let player = this.scene.activePlayerScene;
        if(!isPlayerTurn) player = this.scene.passivePlayerScene;

        let donCard = player.activeDonDeck.getCard(actionInfos.attachedDonCard); //Get the don Card
        let character = player.getCard(actionInfos.receivingCharacter); //Get the character Card

        //If this wasnt a bot action a simple function is enough
        if(!botAction) {
            //Remove Don card from pile
            donCard.setState(CARD_STATES.DON_ATTACHED);
            donCard.setDepth(DEPTH_VALUES.DON_IN_PILE);
            character.attachedDon.push(donCard); //Add to character pile

            const donImage = this.scene.add.image(character.x, character.y + character.displayHeight*0.25, ASSET_ENUMS.GAME_DON_SMALL).setDepth(character.depth+1).setScale(0);
            this.scene.tweens.chain({
                targets: donImage,
                tweens: this.scene.animationLibrary.don_image_appearing_animation(donImage)
            });

            //Animate
            character.updateAttachedDonPosition(true, donCard);

            //Update the UI
            player.playerInfo.updateCardAmountTexts();
        } else { //If this is a bot action, this needs an animation to move the card
            this.scene.actionLibrary.attachDonAction(player, donCard, character);
        }
    }

    //#endregion

    //#region DISCARD FUNCTIONS

    /** Function to start the discard of a card
     * @param {number} cardId - The card ID
     * @param {Object} discardAction - The discard action
     * @param {boolean} isPlayerTurn - If it is the player's turn
     * @param {boolean} startAsAction - If it should start as an action
     */
    discardCard(cardId, discardAction, isPlayerTurn, startAsAction = true) {
        let tweens = [];
        let card = this.scene.getCard(cardId); //Get the card
        //let player = this.scene.activePlayerScene;
        //if(!isPlayerTurn) player = this.scene.passivePlayerScene;
        let  player = card.playerScene; //Get the player scene

        if(discardAction && discardAction.attachedDon.length > 0) {
            let numberAnimations = 0;
            for(let donid of discardAction.attachedDon) {
                //If it has any attached don cards move them to the exerted pile
                let donCard = card.getAttachedDon(donid);
                if(donCard !== undefined) {
                    card.removeAttachedDon(donid);
                    donCard.setState(CARD_STATES.DON_RESTED); //Change state
                    donCard.setDepth(DEPTH_VALUES.DON_IN_PILE); //Set Depth

                    if(startAsAction)
                        this.scene.tweens.chain({
                            targets: donCard,
                            tweens: this.scene.animationLibrary.animation_move_don_characterarea2activearea(card, numberAnimations*100)
                        }).restart();
                    else
                        tweens = tweens.concat(this.scene.animationLibrary.animation_move_don_characterarea2activearea(card, numberAnimations*100));
                    numberAnimations++;
                }
            }
        }

        //go through attached counter cards and discard
        if(discardAction && discardAction.attachedCounter.length > 0) {
            card.fanOutCounterCards(200, true);
            for(let cardid of discardAction.attachedCounter) {
                let counterCard = card.getAttachedCounter(cardid);
                if(counterCard !== undefined) {
                    card.removeAttachedCounter(cardid);
                    if(startAsAction)
                        this.scene.actionLibrary.discardCardAction(player, counterCard);
                    else 
                        tweens = tweens.concat(this.scene.actionLibrary.discardActionTweens(player, counterCard));
                }
            }

            //small action to fan in the cards
            if(startAsAction) {
                let fanInAction = new Action();
                fanInAction.start = () => {card.fanInCounterCards(0, true);};
                fanInAction.waitForAnimationToComplete = false;
                this.scene.actionManager.addAction(fanInAction);
            } else {
                tweens = tweens.concat([{
                    targets: {},
                    alpha: 1,
                    onStart: () => {
                        card.fanInCounterCards(0, true);
                    }
                }]);
            }

        }

        //discard the actual defender card
        if(startAsAction)
            this.scene.actionLibrary.discardCardAction(player, card);
        else
            tweens = tweens.concat(this.scene.actionLibrary.discardActionTweens(player, card));

        return tweens;
    }

    //#endregion

    //#region ATTACK FUNCTIONS
    /** Function to select the attack target
     * @param {Object} actionInfos - The action infos
     * @param {boolean} isPlayerTurn - If it is the player's turn
     */
    selectAttackTarget(actionInfos, isPlayerTurn) {
        let player = this.scene.activePlayerScene;
        if(!isPlayerTurn) player = this.scene.passivePlayerScene;

        player.selectAttackTarget(actionInfos, isPlayerTurn);
    }

    /** Function to start the attack phase
     * @param {number} attackerID - The attacker ID
     * @param {number} defenderID - The defender ID
     * @param {boolean} isPlayerTurn - If it is the player's turn
     * @param {boolean} botAction - If it is a bot action
     */
    declareAttackPhase(attackerID, defenderID, isPlayerTurn, botAction) {
        //Create an aciton to declrare the attack
        let action = new Action();
        action.start = () => {
            this.scene.gameStateUI.udpatePhase(GAME_PHASES.ATTACK_PHASE);
    
            //Set the game state
            if(isPlayerTurn) this.scene.gameState.exit(GAME_STATES.PASSIVE_INTERACTION);
    
            let attackerPlayer = this.scene.activePlayerScene;
            let defenderPlayer = this.scene.passivePlayerScene;
    
            //revesers if this is the passive player's turn
            if(!isPlayerTurn) {
                attackerPlayer = this.scene.passivePlayerScene;
                defenderPlayer = this.scene.activePlayerScene;
            }
    
            //getCards
            let attacker = attackerPlayer.getCard(attackerID);
            let defender = defenderPlayer.getCard(defenderID);
    
            //Create new passive targetingManager
            let targetingManager = new TargetManager(this.scene, 'ATTACK', 'ATTACK_' + attacker.id, attacker.id, false);
            targetingManager.targetArrow.originatorObject = attacker; //Set the originator object to the attacker
            this.scene.targetManagers.push(targetingManager);

            this.scene.attackManager = new AttackManager(this.scene, attacker, defender, targetingManager); //create a new attack manager to keep track of the attacker and defenders
    
            if(isPlayerTurn) this.scene.actionLibrary.declareAttackAction(attackerPlayer, attacker, defender);
            else this.scene.actionLibraryPassivePlayer.declareAttackAction(defenderPlayer, attacker, defender, botAction);
        };
        action.isPlayerAction = false;
        action.waitForAnimationToComplete = false;

        this.scene.actionManager.addAction(action);
    }

    /** Function to cancel an attack
     * @param {boolean} isPlayerTurn - If it is the player's turn
     */
    cancelAttack(isPlayerTurn) {
        let player = this.scene.activePlayerScene;
        if(!isPlayerTurn) player = this.scene.passivePlayerScene;

        //Create an action to send finished to the server
        const finalAction = new Action();
        finalAction.start = () => {
            //Hide targeting arrow
            this.scene.attackManager.targetingManager.targetArrow.stopTargeting();
            
            //remove targeting manager
            this.scene.attackManager.attack.attacker.setState(CARD_STATES.IN_PLAY);

            //Change Phase
            this.setPhase(GAME_PHASES.MAIN_PHASE);
    
            //Remove targeting Manager
            this.scene.targetManagers = this.scene.targetManagers.filter(tm => tm.type !== 'ATTACK');

            //change state
            if(isPlayerTurn) this.scene.gameState.exit(GAME_STATES.ACTIVE_INTERACTION);
        }
        finalAction.waitForAnimationToComplete = false;
        this.scene.actionManager.addAction(finalAction)
    }

    /** Function to start the on attack event phase
     * @param {boolean} isPlayerTurn - If it is the player's turn
     */
    startOnAttackEventPhase(isPlayerTurn) {
        this.setPhase(GAME_PHASES.ATTACK_PHASE);
        if(isPlayerTurn) {
            this.scene.gameState.exit(GAME_STATES.ON_ATTACK_EVENT_INTERACTION);
            this.gameStateUI.nextTurnbutton.fsmState.exit(NEXT_TURN_BUTTON_FSM_STATES.PASS);
        }
    }

    /** Function to start the blocker phase
     * @param {boolean} activePlayer - The blocker ID
     */
    startBlockerPhase(isPlayerTurn) {
        let player = this.scene.activePlayerScene;
        if(!isPlayerTurn) player = this.scene.passivePlayerScene;

        //If this is the active player, blocker means that no interaction will be possible until the end of the phase
        this.setPhase(GAME_PHASES.BLOCK_PHASE);
        if(isPlayerTurn) {
            this.scene.gameState.exit(GAME_STATES.PASSIVE_INTERACTION);
            this.gameStateUI.nextTurnbutton.fsmState.exit(NEXT_TURN_BUTTON_FSM_STATES.OPPONENT_TURN);
        } else {
            this.scene.gameState.exit(GAME_STATES.BLOCKER_INTERACTION);
            this.gameStateUI.nextTurnbutton.fsmState.exit(NEXT_TURN_BUTTON_FSM_STATES.BLOCK);
        }
    }

    /** Function to start the counter phase
     * @param {boolean} activePlayer - The blocker ID
     */
    startCounterPhase(isPlayerTurn) {
        let player = this.scene.activePlayerScene;
        if(!isPlayerTurn) player = this.scene.passivePlayerScene;

        //If this is the active player, blocker means that no interaction will be possible until the end of the phase
        this.setPhase(GAME_PHASES.COUNTER_PHASE);
        if(isPlayerTurn) {
            this.scene.gameState.exit(GAME_STATES.PASSIVE_INTERACTION);
            this.gameStateUI.nextTurnbutton.fsmState.exit(NEXT_TURN_BUTTON_FSM_STATES.OPPONENT_TURN);
        } else {
            this.scene.gameState.exit(GAME_STATES.COUNTER_INTERACTION);
            this.gameStateUI.nextTurnbutton.fsmState.exit(NEXT_TURN_BUTTON_FSM_STATES.COUNTER);
        }
    }

    /** Function to play the animation to start the blocker 
     * @param {boolean} isPlayerTurn - If it is the player's turn
     * @param {number} blockerID - The blocker ID
     */
    startAttackBlocked(isPlayerTurn, blockerID) {
        let card = this.scene.passivePlayerScene.getCard(blockerID);
        if(!isPlayerTurn) card = this.scene.activePlayerScene.getCard(blockerID);

        //Create animation to show the block button on the defender
        if(isPlayerTurn) {
            this.scene.actionLibrary.switchDefenderAction(card);
        } else {
            this.scene.actionLibraryPassivePlayer.switchDefenderAction(card);
        }

    }

    /** Function to player a counter
     * @param {boolean} isPlayerTurn - If it is the player's turn
     * @param {number} counterID - The counter ID
     * @param {number} characterID - The character ID
     */
    startCounterPlayed(activePlayer, counterID, characterID, counterCardData) {
        if(activePlayer) this.scene.actionLibraryPassivePlayer.playCounterAction(this.scene.passivePlayerScene, counterID, characterID, counterCardData);
        else this.scene.actionLibrary.playCounterAction(this.scene.activePlayerScene, counterID, characterID);
    }

    /** Function that returns a counter card to hand if couldnt get played
     * @param {boolean} activePlayer - If it is the active player
     * @param {number} counterID - The counter ID
     */
    startCounterPlayedFailure(activePlayer, counterID) {
        let player = this.scene.activePlayerScene;
        if(!activePlayer) player = this.scene.passivePlayerScene;

        let counterCard = player.hand.getCard(counterID);
        counterCard.setState(CARD_STATES.IN_HAND);
        player.hand.update();
    }

    /** Function to start the attack animation and resolve the attack
     * @param {boolean} activePlayer - If it is the active player
     * @param {Object} attackResults - The attack results
     */
    startAttackAnimation(activePlayer, attackResults) {
        this.scene.actionLibrary.startAttackAnimation(activePlayer, attackResults);
    }

    /** Function to start the attack animation and resolve the attack
     * @param {boolean} activePlayer - If it is the active player
     * @param {Object} lifeCardData - The attack results
     */
    startTriggerPhase(activePlayer, lifeCardData) {
        let player = this.scene.activePlayerScene;
        if(!activePlayer) player = this.scene.passivePlayerScene;

        let serverCard = {
            id: lifeCardData.cardId,
            cardData: lifeCardData.cardData
        };

        //If this is the active player, blocker means that no interaction will be possible until the end of the phase
        this.setPhase(GAME_PHASES.TRIGGER_PHASE);

        if(activePlayer) {
            this.scene.gameState.exit(GAME_STATES.PASSIVE_INTERACTION);
            this.gameStateUI.nextTurnbutton.fsmState.exit(NEXT_TURN_BUTTON_FSM_STATES.OPPONENT_TURN);

            this.scene.actionLibraryPassivePlayer.drawLifeCardAction(this.scene.passivePlayerScene, serverCard);
        } else {
            this.scene.gameState.exit(GAME_STATES.TRIGGER_INTERACTION);

            //Create an action to draw a card from the life pool if attacker was attacked and update lifepoints
            this.scene.actionLibrary.drawLifeCardAction(this.scene.activePlayerScene, serverCard);
        }
    }

    /** Function to draw the Life Card */
    drawTriggerCard(activePlayer, lifeCardData) {
        let player = this.scene.passivePlayerScene;
        if(!activePlayer) player = this.scene.activePlayerScene;

        let serverCard = {
            id: lifeCardData.cardId,
            cardData: lifeCardData.cardData
        };
        this.scene.actionLibrary.addLifeCardToHand(player, serverCard);
    }

    /** Function to play the trigger Card 
     * @param {Object} actionInfos - The action infos
     * @param {boolean} discardCard - If the card should be discarded
     * @param {boolean} isPlayerTurn - If it is the player's turn
    */
    triggerCardPlayed(actionInfos, discardCard, isPlayerTurn) {
        let player = this.scene.passivePlayerScene;
        if(isPlayerTurn) player = this.scene.activePlayerScene;

        let card = this.scene.getCard(actionInfos.playedCard);
        if(isPlayerTurn) {
            this.resolveAbility(actionInfos.playedCard, actionInfos.ability, actionInfos, isPlayerTurn); //Resolve the ability
            player.lifeDeck.removeCard(card); //Remove the card from the life deck
            if(discardCard) this.scene.actionLibrary.discardCardAction(player, card); //Discard the card
            //player.lifeDeck.hideLifeCardFan();
        } else {
            card.updateCardData(actionInfos.playedCardData); //Update the card data
            let flipAnimation = this.scene.animationLibraryPassivePlayer.animation_flip_card(card, 0);
            flipAnimation = flipAnimation.concat([{
                targets: card,
                alpha: 1,
                duration: 500,
                onComplete: () => {
                    console.log(card.state);
                    this.resolveAbility(actionInfos.playedCard, actionInfos.ability, actionInfos, isPlayerTurn); //Resolve the ability
                    console.log(card.state);
                    player.lifeDeck.removeCard(card); //Remove the card from the life deck
                    console.log(card.state);
                    if(discardCard) this.scene.actionLibrary.discardCardAction(player, card); //Discard the card
                    console.log(card.state);
                    //player.lifeDeck.hideLifeCardFan();
                }
            }]);
            this.scene.tweens.chain({
                targets: card,
                tweens: flipAnimation
            });
        }
    }

    /** Function to play the trigger Card
      * @param {boolean} isPlayerTurn - If it is the player's turn
      */
    cleanupTriggerPhase(isPlayerTurn) {
        let player = this.scene.activePlayerScene;
        if(!isPlayerTurn) player = this.scene.passivePlayerScene;

        let action = new Action();
        action.start = () => {
            player.lifeDeck.hideLifeCardFan();
        }
        action.waitForAnimationToComplete = false;
        this.scene.actionManager.addAction(action);
    }

    /** Function to start the attack cleanup action */
    startAttackCleanup(activePlayer, cleanupResults) {
        let player = this.scene.activePlayerScene;
        if(!activePlayer) player = this.scene.passivePlayerScene;

        //reset event counter amounts
        player.resetEventCounterAmounts();

        //remove targeting manager
        this.scene.targetManagers = this.scene.targetManagers.filter(tm => tm.type !== 'ATTACK');

        //list of cards that were cleaned up
        let affectedCards = [];
        if(cleanupResults.length > 0) {
            for(let i=0; i<cleanupResults.length; i++) {
                const cleanup = cleanupResults[i];
                let card = player.getCard(cleanup.card);
                let counter = card.getAttachedCounter(cleanup.counter);

                //Fan out the cards to show. Add test to make sure it is not faned out twice
                if(!card.counterFanShowingManual){ 
                    card.fanOutCounterCards(250, true);
                    affectedCards.push(card);
                }

                card.removeAttachedCounter(cleanup.counter);
                this.scene.actionLibrary.discardCardAction(player, counter, 150); 
            }
        }
        
        //Create an action to send finished to the server
        const finalAction = new Action();
        finalAction.start = () => {
            for(let card of affectedCards) card.fanInCounterCards(0, true);
            this.scene.game.gameClient.requestEndAttack();
        }
        finalAction.waitForAnimationToComplete = false;
        this.scene.actionManager.addAction(finalAction)
    }

    //#endregion

    //#region ABILITY FUNTIONS

    /** Function to resolve the ability request to the server
     * @param {number} cardId - The card
     * @param {number} abilityId - The ability ID
     * @param {boolean} success - If the ability was successful
     */
    handleAbilityStatus(cardId, abilityId, success) {
        let card = this.scene.activePlayerScene.getCard(cardId);
        if(!card) card = this.scene.passivePlayerScene.getCard(cardId);

        const ability = card.getAbility(abilityId); //Get Ability
        if(ability) {
            if(success) ability.action();
            else ability.onFail();
        }
    }

    /** Function to start the targetting for an ability
     * @param {number} cardID - The card ID
     * @param {boolean} isPlayerTurn - If it is the player's turn
     */
    startAbilityTargeting(cardID, isPlayerTurn) {
        let playerScene = this.scene.activePlayerScene;
        if(!isPlayerTurn) playerScene = this.scene.passivePlayerScene;

        let card = playerScene.getCard(cardID);
        this.scene.actionLibrary.startTargetingAction(playerScene, card, true);
    }

    /** Function to resolve ability 
     * @param {number} cardID - The card ID
     * @param {number} abilityID - The ability ID
     * @param {Object} actionInfos - The action infos
     * @param {boolean} isPlayerTurn - If it is the player's turn
     */
    resolveAbility(cardID, abilityID, actionInfos, isPlayerTurn) {
        const card = this.scene.getCard(cardID);
        this.scene.actionLibrary.resolveAbilityAction(card, abilityID, actionInfos.abilityResults, isPlayerTurn);
    }

    //#endregion

    //#region END TURN FUNCTIONS

    /** Function to trigger a next turn. Triggered on next turn button press */
    triggerNextTurn() {
        this.scene.gameState.exit(GAME_STATES.PASSIVE_INTERACTION);
        this.scene.gameStateUI.nextTurnbutton.fsmState.exit(NEXT_TURN_BUTTON_FSM_STATES.PASSIVE);
        // Trigers the end of the turn. Cards should not be draggable anymore. Next turn button should not be draggable anymore
        let endTurnAction = new Action();
        endTurnAction.start = () => {   
            //Send message to server    
            this.scene.game.gameClient.requestStartNextTurn();
        }
        endTurnAction.waitForAnimationToComplete = false;
        this.scene.actionManager.addAction(endTurnAction);
    }

    /** Function that creates an action to send a message to the server when all other actions have been completed */
    completeCurrentTurn() {
        let animation = this.scene.tweens.chain({
            targets: this.scene.gameStateUI.nextTurnbutton,
            tweens: this.scene.animationLibrary.nextTurnButtonAnimation()
        }).pause();

        let action = new Action();
        action.start_animation = animation;
        action.end = () => {this.scene.game.gameClient.requestCurrentTurnCompletedPassivePlayer();}
        action.isPlayerAction = true;
        action.waitForAnimationToComplete = true;
        this.scene.actionManager.addAction(action);
    }

    /** Function to pass a phase */
    passToNextPhase(phase, passed) {
        if(phase === GAME_STATES.BLOCKER_INTERACTION) {
            this.scene.game.gameClient.requestPassBlockerPhase(passed);
        } else if(phase === GAME_STATES.COUNTER_INTERACTION) {
            this.scene.gameState.exit(GAME_STATES.PASSIVE_INTERACTION);
            this.scene.game.gameClient.requestPassCounterPhase(passed);
        } else if(phase === GAME_STATES.ON_PLAY_EVENT_INTERACTION) {
            this.scene.gameState.exit(GAME_STATES.ACTIVE_INTERACTION);
            this.scene.game.gameClient.requestPassOnPlayEventPhase(passed);
        } else if(phase === GAME_STATES.ON_ATTACK_EVENT_INTERACTION) {
            this.scene.gameState.exit(GAME_STATES.ACTIVE_INTERACTION);
            this.scene.game.gameClient.requestPassOnAttackEventPhase(passed);
        } else if(phase === GAME_STATES.TRIGGER_INTERACTION) {
            this.scene.gameState.exit(GAME_STATES.PASSIVE_INTERACTION);
            this.scene.game.gameClient.requestDrawTriggerCard();
        }
    }

    //#endregion

    //#region SURRENDER HANDLING
    /* Function to ask for surrender */
    askForSurrender() {
        //change game state
        this.scene.gameState.exit(GAME_STATES.NO_INTERACTION);
        this.gameOver = true;
        this.scene.game.gameClient.requestSurrender();
    }

    /** Function to handle the end of the game 
     * @param {boolean} isWinner - If the player is the winner
     * @param {number} reward - The reward
    */
    endGame(isWinner, reward) {
        this.gameOver = true;
        this.scene.gameState.exit(GAME_STATES.NO_INTERACTION);

        //Create the end game screen
        const endGameAnimation = new EndGameAnimation(this.scene, isWinner, reward);
        endGameAnimation.startAnimation();
    }
    //#endregion

    //#region PASSIVE PLAYER MOUSE HANDLING FUNCTION

    /** Function to handle the dragging of a card from the opponent player
     * @param {number} cardID
     * @param {string} cardType  
     */
    passivePlayerCardDragStart(cardID, cardType) {
        if(cardType === 'GameCardUI') {
            let card = this.scene.passivePlayerScene.getCard(cardID);
            card.setState(CARD_STATES.TRAVELLING_FROM_HAND);
            card.setAngle(0);
            this.scene.passivePlayerScene.hand.update();
        } else if(cardType === 'DonCardUI') {
            let card = this.scene.passivePlayerScene.activeDonDeck.getCard(cardID);
            //card.setState(CARD_STATES.DON_DRAGGED);
            card.setAngle(0);
            card.setDepth(DEPTH_VALUES.DON_DRAGGED);
            this.scene.children.bringToTop(card);
        }
    }

    /** Function to handle the draggong from the opponent player
     * @param {number} cardID
     * @param {string} cardType
     * @param {number} relX
     * @param {number} relY
     */
    passivePlayerCardDragPosition(cardID, cardType, relX, relY) {
        let posX = relX * this.scene.screenWidth;
        let posY = relY * this.scene.screenHeight;

        let newY = this.scene.screenHeight - posY;
        if(cardType === 'GameCardUI') {
            let card = this.scene.passivePlayerScene.getCard(cardID);
            card.x = posX;
            card.y = newY;
        } else if(cardType === 'DonCardUI') {
            let card = this.scene.passivePlayerScene.activeDonDeck.getCard(cardID);
            card.x = posX;
            card.y = newY;
        }
    }

    /** Function to handle the dragging of a card from the opponent player
     * @param {number} cardID
     * @param {string} cardType  
     */
    passivePlayerCardDragEnd(cardID, cardType) {
        if(cardType === 'GameCardUI') {
            let card = this.scene.passivePlayerScene.getCard(cardID);
            if(card !== null) {
                card.setState(CARD_STATES.IN_HAND);
                card.hideGlow();
                this.scene.passivePlayerScene.hand.update();
            }
        } else if(cardType === 'DonCardUI') {
            let card = this.scene.passivePlayerScene.activeDonDeck.getCard(cardID);
            card.setDepth(DEPTH_VALUES.DON_IN_PILE);
            this.scene.tweens.chain({
                targets: card,
                tweens: this.scene.animationLibraryPassivePlayer.animation_move_don_characterarea2activearea(card, 0)
            })
            //card.setState(CARD_STATES.DON_ACTIVE); //TODO Fix
        }
    }

    /** Function that handles when a players card is hovered over
     * @param {number} CardID
     */
    passivePlayerCardPointerOver(cardID, state, activePlayer) {
        if(state === CARD_STATES.IN_HAND) {
            let card = this.scene.passivePlayerScene.hand.getCard(cardID);
            card.setState(CARD_STATES.IN_HAND_HOVERED_PASSIVEPLAYER);
            card.showGlow(COLOR_ENUMS.OP_WHITE);
            this.scene.passivePlayerScene.hand.update();
        } else if(state === CARD_STATES.IN_PLAY) {
            let card = null;
            if(activePlayer) {
                if(this.scene.passivePlayerScene.leaderLocation.cards[0].id === cardID) card = this.scene.passivePlayerScene.leaderLocation.cards[0];
                else if(this.scene.passivePlayerScene.stageLocation.cards.length>0 && this.scene.passivePlayerScene.stageLocation.cards[0].id === cardID) card = this.scene.passivePlayerScene.stageLocation.cards[0];
                else card = this.scene.passivePlayerScene.characterArea.cards.find((card) => card.id === cardID);

                if(card) card.showGlow(COLOR_ENUMS.OP_WHITE);
            } else {
                if(this.scene.activePlayerScene.leaderLocation.cards[0].id === cardID) card = this.scene.activePlayerScene.leaderLocation.cards[0];
                else if(this.scene.activePlayerScene.stageLocation.cards.length>0 && this.scene.activePlayerScene.stageLocation.cards[0].id === cardID) card = this.scene.activePlayerScene.stageLocation.cards[0];
                else card = this.scene.activePlayerScene.characterArea.cards.find((card) => card.id === cardID);

                if(card) card.showGlow(COLOR_ENUMS.OP_WHITE);
            }
        }
    }

    /** Function that handles when a players card isnt hovered anymore
     * @param {number} CardID
     */
    passivePlayerCardPointerOut(cardID, state, activePlayer) {
        if(state === CARD_STATES.IN_HAND) {
            let card = this.scene.passivePlayerScene.hand.getCard(cardID);
            card.setState(CARD_STATES.IN_HAND);
            card.hideGlow();
            this.scene.passivePlayerScene.hand.update();
        } else if(state === CARD_STATES.IN_PLAY) {
            let card = null;
            if(activePlayer) {
                if(this.scene.passivePlayerScene.leaderLocation.cards[0].id === cardID) card = this.scene.passivePlayerScene.leaderLocation.cards[0];
                else if(this.scene.passivePlayerScene.stageLocation.cards.length>0 && this.scene.passivePlayerScene.stageLocation.cards[0].id === cardID) card = this.scene.passivePlayerScene.stageLocation.cards[0];
                else card = this.scene.passivePlayerScene.characterArea.cards.find((card) => card.id === cardID);

                if(card) card.hideGlow();
            } else {
                if(this.scene.activePlayerScene.leaderLocation.cards[0].id === cardID) card = this.scene.activePlayerScene.leaderLocation.cards[0];
                else if(this.scene.activePlayerScene.stageLocation.cards.length>0 && this.scene.activePlayerScene.stageLocation.cards[0].id === cardID) card = this.scene.activePlayerScene.stageLocation.cards[0];
                else card = this.scene.activePlayerScene.characterArea.cards.find((card) => card.id === cardID);

                if(card) card.hideGlow();
            }
        }

    }
    //#endregion

    //#region UTILS
    changeGameStateActive() {
        let action = new Action();

        action.start = () => {this.scene.gameState.exit(this.scene.gameState.previousState);}
        action.isPlayerAction = true;
        action.waitForAnimationToComplete = false;

        this.scene.actionManager.addAction(action);
    }

    resumeActive(){
        let action = new Action();

        action.start = () => {
            this.setPhase(GAME_PHASES.MAIN_PHASE);

            this.scene.gameState.exit(GAME_STATES.ACTIVE_INTERACTION);
            this.gameStateUI.nextTurnbutton.fsmState.exit(NEXT_TURN_BUTTON_FSM_STATES.ACTIVE);
        }
        action.isPlayerAction = true;
        action.waitForAnimationToComplete = false;

        this.scene.actionManager.addAction(action);
    }

    resumePassive(){
        let action = new Action();

        action.start = () => {
            this.setPhase(GAME_PHASES.MAIN_PHASE);

            this.scene.gameState.exit(GAME_STATES.PASSIVE_INTERACTION);
            this.gameStateUI.nextTurnbutton.fsmState.exit(NEXT_TURN_BUTTON_FSM_STATES.OPPONENT_TURN);
        }
        action.isPlayerAction = true;
        action.waitForAnimationToComplete = false;

        this.scene.actionManager.addAction(action);
    }
    //#endregion

}