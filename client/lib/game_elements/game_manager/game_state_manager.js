class GameStateManager {

    /** Constructor
     * @param {GameScene} scene - The scene that will contain the game state manager
     */
    constructor(scene) {
        this.scene = scene;
    }

    /** Function that initialise the scene */
    setupScene(activePlayerLeader, passivePlayerLeader) {
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
            cardData: null,
            state: CARD_STATES.LEADER_TRAVELLING_TO_LOCATION,
            artVisible: false
        });
        activePlayerLeaderCard.updateCardData(activePlayerLeader);

        let passivePlayerLeaderCard = new GameCardUI(this.scene, this.scene.passivePlayerScene, {
            x: this.scene.screenCenterX,
            y: -GAME_UI_CONSTANTS.CARD_ART_HEIGHT * 0.5 * CARD_SCALE.IN_DECK,
            cardData: null,
            state: CARD_STATES.LEADER_TRAVELLING_TO_LOCATION,
            artVisible: false
        });
        passivePlayerLeaderCard.updateCardData(passivePlayerLeader);

        //Active Player tween
        this.scene.add.tween({
            targets: activePlayerLeaderCard,
            y: this.scene.activePlayerScene.leaderLocation.posY - 50,
            scale: {from: CARD_SCALE.IN_DECK, to: 0.4},
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                this.scene.add.tween({
                    targets: activePlayerLeaderCard,
                    y: this.scene.activePlayerScene.leaderLocation.posY,
                    scale: {from: 0.4, to: CARD_SCALE.IN_LOCATION_LEADER},
                    duration: 250,
                    delay: 1000,
                    ease: 'Power2',
                    onComplete: () => {
                        this.scene.activePlayerScene.leaderLocation.addCard(activePlayerLeaderCard);
                        activePlayerLeaderCard.setState(CARD_STATES.IN_LOCATION);
                    }
                })
            }
        });

        //Passive Player tween
        this.scene.add.tween({
            targets: passivePlayerLeaderCard,
            y: this.scene.passivePlayerScene.leaderLocation.posY + 50,
            scale: {from: CARD_SCALE.IN_DECK, to: 0.4},
            duration: 1800,
            ease: 'Power2',
            onComplete: () => {
                this.scene.add.tween({
                    targets: passivePlayerLeaderCard,
                    y: this.scene.passivePlayerScene.leaderLocation.posY,
                    scale: {from: 0.4, to: CARD_SCALE.IN_LOCATION_LEADER},
                    duration: 250,
                    delay: 1000,
                    ease: 'Power2',
                    onComplete: () => {
                        this.scene.passivePlayerScene.leaderLocation.addCard(passivePlayerLeaderCard);
                        passivePlayerLeaderCard.setState(CARD_STATES.IN_LOCATION);
                    }
                })
            }
        });

    }

}