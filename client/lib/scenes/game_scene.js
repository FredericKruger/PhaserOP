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
        this.actionLibraryPassivePlayer = new ActionLibraryPassivePlayer(this);
        this.animationManager = new AnimationManager(this);
        this.animationLibrary = new AnimationLibrary(this);
        this.animationLibraryPassivePlayer = new AnimationLibraryPassivePlayer(this);

        //Game Manager
        this.gameStateUI = new GameStateUI(this);
        this.gameStateManager = new GameStateManager(this, this.gameStateUI);

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

        this.activePlayerScene.create();
        this.passivePlayerScene.create();
        this.gameStateUI.create();

        //Create mask Panel
        this.maskPanel = this.add.rectangle(
            this.screenCenterX, this.screenCenterY, 
            this.screenWidth, this.screenWidth, 
            COLOR_ENUMS.OP_BLACK, 0.8).setOrigin(0.5).setDepth(3);
        this.maskPanel.setVisible(true);

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
        this.activePlayerScene.setVisible(visible);
        this.passivePlayerScene.setVisible(visible);
        this.gameStateUI.setVisible(visible);

        this.activePlayerScene.playerInfo.setBackgroundVisible(visible);
        this.passivePlayerScene.playerInfo.setBackgroundVisible(visible);
    }

}