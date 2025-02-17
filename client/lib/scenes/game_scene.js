class GameScene extends Phaser.Scene {

    constructor() {
        super(SCENE_ENUMS.GAME_SCENE);

        this.obj = [];
    }

    init(data) {
        this.game.gameClient.gameScene = this;

        this.gameBackgroundImageKey = this.game.utilFunctions.getBattleBackground(data.board);

        this.screenCenterX = this.cameras.main.worldView.x + this.cameras.main.displayWidth / 2;
        this.screenCenterY = this.cameras.main.worldView.y + this.cameras.main.displayHeight / 2;
        this.screenHeight = this.cameras.main.displayHeight;
        this.screenWidth = this.cameras.main.displayWidth;

        //Prepare Game Data
        this.activePlayer = new Player(true, this.game.gameClient.activePlayerNumberCards);
        this.passivePlayer = new Player(false, this.game.gameClient.passivePlayerNumberCards);

        this.activePlayerScene = new PlayerScene(this, PLAYER_POSITIONS.BOTTOM, this.activePlayer);
        this.passivePlayerScene = new PlayerScene(this, PLAYER_POSITIONS.TOP, this.passivePlayer);

        //Set Engines
        this.actionManager = new ActionManager(this);
        this.actionLibrary = new ActionLibrary(this);
        this.animationManager = new AnimationManager(this);

        //Game Manager
        this.gameStateManager = new GameStateManager(this);

        //Game state variables
        this.dragginCard = false;
    }

    create() {
        //Prepare the background
        let backgroundImage = this.add.image(
            this.screenCenterX, this.screenCenterY, this.gameBackgroundImageKey
        )
        .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
        .setDepth(0);
        this.obj.push(backgroundImage);

        // Calculate the scale factor
        let scaleX = this.cameras.main.width / backgroundImage.width;
        let scaleY = this.cameras.main.height / backgroundImage.height;
        let scale = Math.max(scaleX, scaleY);

        // Apply the scale factor
        backgroundImage.setScale(scale);

        // Center the image
        backgroundImage.setPosition(this.screenCenterX, this.screenCenterY);

        //Create the phase box
        /*let phaseBox = this.add.image(10, this.screenCenterY, ASSET_ENUMS.GAME_PHASE_BOX).setScale(0.8).setOrigin(0, 0.5).setDepth(0).setAlpha(0.74);
        this.phaseText = this.add.text(30, this.screenCenterY, "Phase: 1", 
            {font: "30px OnePieceTCGFont", color: COLOR_ENUMS_CSS.OP_WHITE, align: "left"}
        ).setOrigin(0, 0.5).setDepth(0);
        this.obj.push(phaseBox);
        this.obj.push(this.phaseText);*/

        this.activePlayerScene.create();
        this.passivePlayerScene.create();

        //Create mask Panel
        this.maskPanel = this.add.rectangle(
            this.screenCenterX, this.screenCenterY, 
            this.screenWidth, this.screenWidth, 
            COLOR_ENUMS.OP_BLACK, 0.8).setOrigin(0.5);
        this.maskPanel.setVisible(false);
        this.obj.push(this.maskPanel);

        //Create new card to test
        /*let cards = [];
        for(let id of [411,412,421,414,413, 415, 145]){
            let testCard = new GameCardUI(this, this.activePlayerScene, {
                x: this.screenCenterX,
                y: this.screenCenterY,
                cardData: null,
                state: CARD_STATES.IN_HAND,
                artVisible: false
            });
            testCard.updateCardData(this.game.gameClient.playerCollection.cardCollection[id-1]);
            testCard.makeInteractive(true);
            testCard.makeDraggable(true);
            cards.push(testCard);
        }
        this.activePlayerScene.hand.addCards(cards);*/
        //create leader Card
        /*let leaderCard = new GameCardUI(this, this.activePlayerScene, {
            x: this.screenCenterX,
            y: this.screenCenterY,
            cardData: null,
            state: CARD_STATES.IN_LOCATION,
            artVisible: false
        });
        leaderCard.updateCardData(this.game.gameClient.playerCollection.cardCollection[400]);*/
        //this.activePlayerScene.leaderLocation.addCard(leaderCard);

        /** LISTENERS */
        /** Hander for when the poinster enters a card */
        this.input.on('pointerover', (pointer, gameObject) => {
            if(gameObject[0] instanceof GameCardUI
                && !this.dragginCard
            ) {
                let card = gameObject[0];
                if(card.state === CARD_STATES.IN_HAND) {
                    card.setState(CARD_STATES.IN_HAND_HOVERED);
                    card.playerScene.hand.update();
                }
            }
        });

        /** Handler for when the pointer leaves a card */
        this.input.on('pointerout', (pointer, gameObject) => {
            if(gameObject[0] instanceof GameCardUI
                && !this.dragginCard
            ) {
                let card = gameObject[0];
                if(card.state === CARD_STATES.IN_HAND_HOVERED) {
                    card.setState(CARD_STATES.IN_HAND);
                    card.playerScene.hand.update();
                }
            }
        });

        /** HANLDER FOR CLICKING */
        this.input.on('pointerdown', (pointer, gameObject) => {
        });    


        /** HANDLER FOR DRAG START */
        this.input.on('dragstart', (pointer, gameObject) => {
            this.children.bringToTop(gameObject);
            this.dragginCard = true;

            gameObject.setState(CARD_STATES.TRAVELLING_FROM_HAND);
            gameObject.scaleTo(CARD_SCALE.TRAVELLING_FROM_HAND, true, false, false);
            gameObject.angleTo(0, true, false, false);

            gameObject.playerScene.hand.update();
        });

        /** HANDLDER FOR DRAG */
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.setPosition(dragX, dragY);
        });

        /** HANDLER FOR DRAGEN */
        this.input.on('dragend', (pointer, gameObject, dropped) => {
            if(!dropped) {
                //Reset the cards position
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;

                //Reset card state
                gameObject.setState(CARD_STATES.IN_HAND);
                gameObject.playerScene.hand.update();

                this.dragginCard = false;
            }
        });

        /** HANDLER FOR DROP */
        this.input.on('drop', (pointer, gameObject, dropZone) => {
            if(dropZone.getData('name') === 'CharacterArea') {
                gameObject.playerScene.playCard(gameObject);
            }

            this.dragginCard = false;
        });

        this.setVisible(false);

        //tell the server the scene is ready
        this.game.gameClient.requestMatchSceneReady();
    }

    /** Starts the intro animation
     * @param {Object} activePlayerLeader
     * @param {Object} passivePlayerLeader
     */
    startIntroAnimation(activePlayerLeader, passivePlayerLeader) {
        for(let obj of this.obj) {
            obj.setVisible(true);
        }
        this.activePlayerScene.playerInfo.setBackgroundVisible(true);
        this.passivePlayerScene.playerInfo.setBackgroundVisible(true);

        //Set health totals
        this.activePlayer.setLife(activePlayerLeader.cardData.life);
        this.passivePlayer.setLife(passivePlayerLeader.cardData.life);

        //Set life points in the ui
        this.activePlayerScene.playerInfo.setLifePoints(this.activePlayer.totalLife);
        this.passivePlayerScene.playerInfo.setLifePoints(this.passivePlayer.totalLife);

        //Make the scene appear
        this.cameras.main.fadeIn(1000, 0, 0, 0); // Fade in over 1 second

        this.cameras.main.once('camerafadeincomplete', () => {
            this.time.delayedCall(1000, () => {
                let introAnimation = new IntroAnimation(this, activePlayerLeader, passivePlayerLeader);
                introAnimation.startAnimation();
            });
        });

    }

    /** Function that set the panel invisible
     * @param {boolean} visible
     */
    setVisible(visible) {
        for(let obj of this.obj) {
            obj.setVisible(visible);
        }
        this.activePlayerScene.setVisible(visible);
        this.passivePlayerScene.setVisible(visible);

        this.activePlayerScene.playerInfo.setBackgroundVisible(visible);
        this.passivePlayerScene.playerInfo.setBackgroundVisible(visible);
    }

}