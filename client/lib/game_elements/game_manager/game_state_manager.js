class GameStateManager {

    /** Constructor
     * @param {GameScene} scene - The scene that will contain the game state manager
     * @param {GameStateUI} gameStateUI - The UI elements that will be managed by the game state manager
     */
    constructor(scene, gameStateUI) {
        this.scene = scene;
        this.gameStateUI = gameStateUI;

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
            id: 0
        });
        activePlayerLeaderCard.updateCardData(activePlayerLeader, true);

        let passivePlayerLeaderCard = new GameCardUI(this.scene, this.scene.passivePlayerScene, {
            x: this.scene.screenCenterX,
            y: -GAME_UI_CONSTANTS.CARD_ART_HEIGHT * 0.5 * CARD_SCALE.IN_DECK,
            state: CARD_STATES.LEADER_TRAVELLING_TO_LOCATION,
            scale: CARD_SCALE.IN_DECK,
            artVisible: false,
            depth: 1,
            id: 0
        });
        passivePlayerLeaderCard.updateCardData(passivePlayerLeader, true);

        //Active Player tween
        this.scene.add.tween({
            targets: activePlayerLeaderCard,
            y: this.scene.activePlayerScene.leaderLocation.posY - 50,
            scale: {from: CARD_SCALE.IN_DECK, to: 0.4},
            duration: 500,
            ease: 'easeOut',
            onComplete: () => {
                this.scene.add.tween({
                    targets: activePlayerLeaderCard,
                    y: this.scene.activePlayerScene.leaderLocation.posY,
                    scale: {from: 0.4, to: CARD_SCALE.IN_LOCATION_LEADER},
                    duration: 250,
                    delay: 1000,
                    ease: 'easeIn',
                    onComplete: () => {
                        this.scene.activePlayerScene.leaderLocation.addCard(activePlayerLeaderCard);
                        activePlayerLeaderCard.setState(CARD_STATES.IN_LOCATION);
                        this.activePlayerReadyForMulligan = true;
                        this.startMulliganPhase();
                    }
                })
            }
        });

        //Passive Player tween
        this.scene.add.tween({
            targets: passivePlayerLeaderCard,
            y: this.scene.passivePlayerScene.leaderLocation.posY + 50,
            scale: {from: CARD_SCALE.IN_DECK, to: 0.4},
            duration: 450,
            ease: 'easeOut',
            onComplete: () => {
                this.scene.add.tween({
                    targets: passivePlayerLeaderCard,
                    y: this.scene.passivePlayerScene.leaderLocation.posY,
                    scale: {from: 0.4, to: CARD_SCALE.IN_LOCATION_LEADER},
                    duration: 250,
                    delay: 1000,
                    ease: 'easeIn',
                    onComplete: () => {
                        this.scene.passivePlayerScene.leaderLocation.addCard(passivePlayerLeaderCard);
                        passivePlayerLeaderCard.setState(CARD_STATES.IN_LOCATION);
                        this.passivePlayerReadyForMulligan = true;
                        this.startMulliganPhase();
                    }
                })
            }
        });

    }

    /** START MULLIGAN */
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
            
            //Draw the active player's cards
            let animationCallback = () => {
                this.scene.game.gameClient.requestFirstTurnSetupComplete();
            };
            for(let i=0; i<activePlayerCards.length; i++) {
                let callback = (i === (activePlayerCards.length-1) ? animationCallback : null);
                this.scene.actionLibrary.drawCardAction(this.scene.activePlayerScene, {id:activePlayerCards[i]}, GAME_PHASES.PREPARING_FIRST_TURN, {delay: i*300, startAnimationCallback: callback}, {waitForAnimationToComplete: false});
            }
            
            //Draw the passive player's cards
            animationCallback = () => {
                this.scene.game.gameClient.requestFirstTurnSetupPassivePlayerAnimationComplete();
            };
            for(let i=0; i<passivePlayerCards.length; i++) {
                let callback = (i === (passivePlayerCards.length-1) ? animationCallback : null);
                this.scene.actionLibraryPassivePlayer.drawCardAction(this.scene.passivePlayerScene, passivePlayerCards[i], GAME_PHASES.PREPARING_FIRST_TURN, {delay: i*300, startAnimationCallback: callback}, {waitForAnimationToComplete: false, isServerRequest: false});
            }
        });
    }

    /** Function that performs  the refresh of the don and the characters
     * All Animation can happen simultaniously
     * Start by showing the "you turn" image
     * @param {Array<number>} refreshDon - The Don cards to be moved or added to the pool
     * @param {Array<number>} refreshCards - The cards to be set to active
     */
    startRefreshPhase(refreshDon, refreshCards) {
        this.scene.time.delayedCall(100, () => {
            this.setPhase(GAME_PHASES.REFRESH_PHASE); //Set the phase to Refresh Phase

            //Refresh the nextTurn Button
            this.gameStateUI.nextTurnbutton.setState(NEXT_TURN_BUTTON_STATES.YOUR_TURN_PASSIVE);  
            this.gameStateUI.yourTurnImage.setAlpha(1); 
    
            //Start with showing the "Your Turn" image
            this.scene.add.tween({
                targets: this.gameStateUI.yourTurnImage,
                delay: 2000,
                alpha: {from: 1, to: 0},
                duration: 1500,
                onComplete: () => {
                    //TODO Create Action calls for Don Refresh
                    //TODO Create Action calls for Character Refresh
                    //TODO Create way to communicate end of all animations and send message back to the server
                    this.scene.game.gameClient.requestEndRefreshPhase();
                }
            });
        });
    }

    /** Function that performs the refresh of teh don and characters for the passive player
     * All animations can happen sumultaniously
     * @param {Array<number>} refreshDon - The Don cards to be moved or added to the pool
     * @param {Array<number>} refreshCards - The cards to be set
     */
    startRefreshPhasePassivePlayer(refreshDon, refreshCards) {
        this.scene.time.delayedCall(100, () => {
            this.setPhase(GAME_PHASES.REFRESH_PHASE);

            //TODO Create Action calls for Don Refresh
            //TODO Create Action calls for Character Refresh
            //TODO Create way to communicate end of all animations and send message back to the server
    
            this.scene.game.gameClient.requestEndPassivePlayerAnimationRefreshPhase();
        });
    }

    /**  Function that start the draw phase
     * @param {Array<Object>} newCards - The card to be drawn
     */
    startDrawPhase(newCards, isPlayerTurn) {
        this.scene.time.delayedCall(100, () => {
            this.setPhase(GAME_PHASES.DRAW_PHASE); //Set the phase to Draw Phase

            for(let card of newCards) {
                //Create a Draw action for each card (should be a single card)
                if(isPlayerTurn) this.scene.actionLibrary.drawCardAction(this.scene.activePlayerScene, card, GAME_PHASES.DRAW_PHASE, {delay: 0}, {waitForAnimationToComplete: true});
                else this.scene.actionLibraryPassivePlayer.drawCardAction(this.scene.passivePlayerScene, card, GAME_PHASES.DRAW_PHASE, {delay: 0}, {waitForAnimationToComplete: true, isServerRequest: false});
            }
    
            //Create a last action to call the server
            let endDrawPhaseAction = new Action();
            endDrawPhaseAction.start = () => {
                if(isPlayerTurn ) this.scene.game.gameClient.requestEndDrawPhase();
                else this.scene.game.gameClient.requestEndPassivePlayerAnimationDrawPhase();
            };
            endDrawPhaseAction.isPlayerAction = true;
            endDrawPhaseAction.waitForAnimationToComplete = false;
            this.scene.actionManager.addAction(endDrawPhaseAction);
        });
    }

    /** Function to start the Don Phase
     * @param {Array<number>} donCards - The cards to be used in the Don Phase
    */
    startDonPhase(donCards, isPlayerTurn) {
        this.scene.time.delayedCall(100, () => {
            this.setPhase(GAME_PHASES.DON_PHASE); //Set the phase to Don Phase

            //Draw the active player's cards
            let animationCallback = () => {
                if(isPlayerTurn) this.scene.game.gameClient.requestEndDonPhase();
                else this.scene.game.gameClient.requestEndPassivePlayerAnimationDonPhase();
            };

            for(let i=0; i<donCards.length; i++) {
                let callback = (i === (donCards.length-1) ? animationCallback : null);
                if(isPlayerTurn) this.scene.actionLibrary.drawDonCardAction(this.scene.activePlayerScene, donCards[i], GAME_PHASES.DON_PHASE, {delay: i*300, startAnimationCallback: callback}, {waitForAnimationToComplete: false});
                else this.scene.actionLibraryPassivePlayer.drawDonCardAction(this.scene.passivePlayerScene, donCards[i], GAME_PHASES.DON_PHASE, {delay: i*300, startAnimationCallback: callback}, {waitForAnimationToComplete: false, isServerRequest: false});

                //Create DON image and create animation to show and destroy it on DON. Handling different position depending on 1 or 2 Don cards being drawn
                let donImage = this.scene.add.image(
                    this.scene.screenWidth*0.4 + i * this.scene.screenWidth,
                    this.scene.screenCenterY - 100 + i * 200,
                    ASSET_ENUMS.GAME_DON_BIG
                ).setOrigin(0.5).setDepth(2).setScale(1.5).setVisible(false).setAngle(-10 + i*20);
                this.scene.tweens.add({
                    targets: donImage,
                    delay: i*300,
                    onComplete: () => {
                        donImage.setVisible(true);
                        this.scene.tweens.add({
                            targets: donImage,
                            delay: 1500,
                            alpha: {from: 1, to: 0},
                            duration: 1500,
                            onComplete: () => {donImage.destroy();}
                        });
                    }
                });
            }
        });
    }

    /** Function to start the main phase */
    startMainPhase() {
        this.setPhase(GAME_PHASES.MAIN_PHASE); //Set the phase to Main Phase

        //Make the cards draggable in the hand and in the don deck
        this.scene.activePlayerScene.hand.makeCardDraggable(true);
        this.scene.activePlayerScene.activeDonDeck.makeCardDraggable(true);

        //Change state of the next turn button
        this.scene.gameStateUI.nextTurnbutton.setState(NEXT_TURN_BUTTON_STATES.YOUR_TURN_ACTIVE);
    }

    /** Function to set the phase of the game 
     * @param {string} phase - The phase to set
    */
    setPhase(phase) {
        this.currentGamePhase = phase;
        this.gameStateUI.udpatePhase(phase);
    }

}