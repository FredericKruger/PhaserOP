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

                for(let i=0; i<activePlayerCards.length; i++) 
                    this.scene.actionLibrary.drawCardAction(this.scene.activePlayerScene, activePlayerCards[i], GAME_PHASES.MULLIGAN_PHASE, {delay: i*300}, {mulliganPosition: i, waitForAnimationToComplete: false});

                //Create action to start at the end to show the bbuttons
                let action = new Action();
                action.start = () => {
                    this.gameStateUI.mulliganUI.keepButton.setVisible(true);
                    this.gameStateUI.mulliganUI.mulliganButton.setVisible(true);
                }
                action.isPlayerAction = true;
                action.waitForAnimationToComplete = false;
                this.scene.actionManager.addAction(action);
            }
        });
    }

    /** Swap the new cards
     * @param {Array<Object>} newCards - The new cards to swap
     */
    mulliganCards(newCards) {
        //Put the old cards back
        let index = 0;
        let oldCards = this.gameStateUI.mulliganUI.cards;
        for(let card of oldCards) {
            this.scene.actionLibrary.moveCardsMulliganToDeckAction(this.scene.activePlayerScene, card, {delay: 0}, {waitForAnimationToComplete: true});            
        }

        //Create an action to start the next step once the previous once are competed
        let action = new Action();
        action.start = () => {
            this.scene.time.delayedCall(1000, () => {
                for(let i=0; i<newCards.length; i++) 
                    this.scene.actionLibrary.drawCardAction(this.scene.activePlayerScene, newCards[i], GAME_PHASES.MULLIGAN_PHASE, {delay: i*300}, {mulliganPosition: i, waitForAnimationToComplete: false});
            })
        }
        action.isPlayerAction = true;
        action.waitForAnimationToComplete = false;
        this.scene.actionManager.addAction(action);

    }

    /** Function to set the phase of the game 
     * @param {string} phase - The phase to set
    */
    setPhase(phase) {
        this.currentGamePhase = phase;
        this.gameStateUI.udpatePhase(phase);
    }

}