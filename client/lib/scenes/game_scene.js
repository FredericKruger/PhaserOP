class GameScene extends Phaser.Scene {

    //#region CONSTRUCTOR
    constructor() {
        super(SCENE_ENUMS.GAME_SCENE);

        this.obj = [];
    }
    //#endregion

    //#region INIT FUNCTION
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

        this.activePlayerScene.opponentPlayerScene = this.passivePlayerScene;
        this.passivePlayerScene.opponentPlayerScene = this.activePlayerScene;

        //Set Engines
        this.actionManager = new ActionManager(this);
        this.actionLibrary = new ActionLibrary(this);
        this.actionLibraryPassivePlayer = new ActionLibraryPassivePlayer(this);
        this.animationManager = new AnimationManager(this);
        this.animationLibrary = new AnimationLibrary(this);
        this.animationLibraryPassivePlayer = new AnimationLibraryPassivePlayer(this);
        this.attackManager = null;

        //Game Manager
        this.gameStateUI = new GameStateUI(this);
        this.gameStateManager = new GameStateManager(this, this.gameStateUI);
        this.targetManager = new TargetManager(this);

        //Ready the targetting arrow
        this.targetingArrow = new TargetingArrow(this);
        this.eventArrow = new TargetingArrow(this, COLOR_ENUMS.OP_GREEN);

        this.gameState = new NoInteractionState(this);
    }
    //#endregion

    //#region CREATE FUNCTION
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

        // Create a canvas with a gradient
        let canvas = document.createElement('canvas');
        canvas.width = this.screenWidth;
        canvas.height = this.screenHeight;
        let ctx = canvas.getContext('2d');

        let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(128, 53, 14, 0.6)'); // Red at the top
        gradient.addColorStop(1, 'rgba(0, 32, 96, 0.6)'); // Blue at the bottom

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Create a texture from the canvas
        this.textures.addCanvas('gradientTexture', canvas);

        // Create a sprite with the gradient texture
        let gradientSprite = this.add.sprite(this.screenCenterX, this.screenCenterY, 'gradientTexture').setOrigin(0.5).setDepth(0);
        this.obj.push(gradientSprite);

        //Create some game elements
        this.activePlayerScene.create();
        this.passivePlayerScene.create();
        this.gameStateUI.create();
        this.targetingArrow.create();
        this.eventArrow.create();

        //Create mask Panel
        this.maskPanel = this.add.rectangle(
            this.screenCenterX, this.screenCenterY, 
            this.screenWidth, this.screenWidth, 
            COLOR_ENUMS.OP_BLACK, 0.8).setOrigin(0.5).setDepth(3);
        this.maskPanel.setVisible(true);

        /** LISTENERS */
        /** Hander for when the poinster enters a card */
        this.input.on('pointerover', (pointer, gameObject) => {
            if(gameObject[0] instanceof BaseCardUI) {
                this.gameState.onPointerOver(pointer, gameObject[0]);
            }
        });

        /** Handler for when the pointer leaves a card */
        this.input.on('pointerout', (pointer, gameObject) => {
            if(gameObject[0] instanceof BaseCardUI) {
                this.gameState.onPointerOut(pointer, gameObject[0]);
            }
        });

        /** HANLDER FOR CLICKING */
        this.input.on('pointerdown', (pointer, gameObject) => {
            this.gameState.onPointerDown(pointer, gameObject[0]);
        });    

        /** HANDLER FOR DRAG START */
        this.input.on('dragstart', (pointer, gameObject) => {
            this.gameState.onDragStart(pointer, gameObject);
        });

        /** HANDLDER FOR DRAG */
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            this.gameState.onDrag(pointer, gameObject, dragX, dragY);
        });

        /** HANDLER FOR DRAGEN */
        this.input.on('dragend', (pointer, gameObject, dropped) => {
            this.gameState.onDragEnd(pointer, gameObject, dropped);
        });

        /** HANDLER FOR DROP */
        this.input.on('drop', (pointer, gameObject, dropZone) => {
            this.gameState.onDrop(pointer, gameObject, dropZone);
        });

        this.setVisible(false);

        //tell the server the scene is ready
        this.game.gameClient.requestMatchSceneReady();   
    }
    //#endregion

    //#region UPDATE FUNCTION
    /** Funciton that handles the constant update of the GameScene */
    update() {
        //TODO create a function to figure if cards in the character area can do actions and adds a glow

        //TODO create a function to handle determining if a card in the hand can be player and adds the glow

        this.gameState.update();
    }
    //#endregion

    //#region INTRO ANIMATION
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
            this.time.delayedCall(250, () => {
                let introAnimation = new IntroAnimation(this, activePlayerLeader, passivePlayerLeader);
                introAnimation.startAnimation();
            });
        });
    }
    //#endregion

    //#region UTILS
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
    //#endregion

}