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
        this.targetManagers= []; ///new TargetManager(this);

        //Set Auras
        this.auraManager = new AuraManager(this);

        this.gameState = new NoInteractionState(this, null);
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
        canvas.width = this.screenWidth + 200;
        canvas.height = this.screenHeight + 200;
        let ctx = canvas.getContext('2d');

        let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(189, 33, 22, 0.6)'); // Red at the top
        gradient.addColorStop(1, 'rgba(0, 32, 96, 0.6)'); // Blue at the bottom

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Create a texture from the canvas
        this.textures.addCanvas('gradientTexture', canvas);

        // Create a sprite with the gradient texture
        let gradientSprite = this.add.sprite(this.screenCenterX, this.screenCenterY, 'gradientTexture').setOrigin(0.5).setDepth(0);
        this.obj.push(gradientSprite);

        //Create cloud images
        let activePlayerCloud = this.add.image(this.screenCenterX, this.screenHeight, ASSET_ENUMS.IMAGE_CLOUD_BACKGROUND).setOrigin(0.5, 1).setDepth(0);
        activePlayerCloud.setScale(this.cameras.main.width / activePlayerCloud.width);
        activePlayerCloud.setPosition(this.screenCenterX, this.screenHeight + activePlayerCloud.displayHeight*0.15);
        activePlayerCloud.setTint(COLOR_ENUMS.OP_BLUE);
        this.obj.push(activePlayerCloud);

        //Create cloud images
        let passivePlayerCloud = this.add.image(this.screenCenterX, 0, ASSET_ENUMS.IMAGE_CLOUD_BACKGROUND).setOrigin(0.5, 0).setDepth(0).setAngle(180);
        passivePlayerCloud.setScale(this.cameras.main.width / passivePlayerCloud.width);
        passivePlayerCloud.setPosition(this.screenCenterX, this.screenHeight - passivePlayerCloud.displayHeight*0.15);
        passivePlayerCloud.setTint(COLOR_ENUMS.OP_RED);
        this.obj.push(passivePlayerCloud);

        //Create some game elements
        this.activePlayerScene.create();
        this.passivePlayerScene.create();
        this.gameStateUI.create();

        //Create mask Panel
        this.maskPanel = this.add.rectangle(
            this.screenCenterX, this.screenCenterY, 
            this.screenWidth+200, this.screenWidth+200, 
            COLOR_ENUMS.OP_BLACK, 0.8).setOrigin(0.5).setDepth(4);
        this.maskPanel.setVisible(true);

        //Create Test Button to test new features
        this.testButton = this.add.image(100, 100, ASSET_ENUMS.IMAGE_INTRO_LUFFY).setOrigin(0.5).setDepth(10).setScale(0.6);
        this.testButton.setInteractive();
        this.testButton.on('pointerdown', () => {
            //DRAW LIFE CARD
            //this.game.gameClient.sendDebug(/*this.activePlayerScene.characterArea.cards[0].id*/);

            //START END GAME PANEL
            //this.gameStateManager.endGame(true, 1000);

            //GIVE CARD RUSH
            this.activePlayerScene.leaderLocation.cards[0].hasRush = true;
            this.game.gameClient.sendDebug(this.activePlayerScene.leaderLocation.cards[0].id);
            //this.activePlayerScene.characterArea.cards[0].hasRush = true;
            //this.game.gameClient.sendDebug(this.activePlayerScene.characterArea.cards[0].id);
            
            
            //this.actionLibraryPassivePlayer.drawLifeCardAction(this.passivePlayerScene, {id: this.passivePlayerScene.lifeDeck.cards[0].id});

            //ATTACK DON TO CHARACTER
            //this.gameStateManager.attachDonToCharacterSuccess({attachedDonCard: donCardID, receivingCharacter: cardID}, true, true);

        });

        /** LISTENERS */
        /** Hander for when the poinster enters a card */
        this.input.on('pointerover', (pointer, gameObject) => {
            //if(gameObject[0] instanceof BaseCardUI) {
            this.gameState.onPointerOver(pointer, gameObject[0]);
            //}
        });

        /** Handler for when the pointer leaves a card */
        this.input.on('pointerout', (pointer, gameObject) => {
            //if(gameObject[0] instanceof BaseCardUI) {
            this.gameState.onPointerOut(pointer, gameObject[0]);
            //}
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
        this.activePlayerScene.playerInfo.setLifePoints(0);//this.activePlayer.totalLife);
        this.passivePlayerScene.playerInfo.setLifePoints(0);//this.passivePlayer.totalLife);

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

    /** Function to return a card anywhere according to the id
     * @param {number} cardId
     * @return {GameCardUI}
     */
    getCard(cardId) {
        let card = this.activePlayerScene.getCard(cardId);
        if(!card) card = this.passivePlayerScene.getCard(cardId);
        return card;
    }

    /** Function to return a don card anywer according to the id
     * @param {number} cardId
     * @return {DonCardUI}
     */
    getDonCard(cardId) {
        let donCard = this.activePlayerScene.getDonCardById(cardId);
        if(!donCard) donCard = this.passivePlayerScene.getDonCardById(cardId);
        return donCard;
    }

    /** Function that returns the active target manager
     * @return {TargetManager}
     */
    getActiveTargetManager() {
        return this.targetManagers.find(targetManager => targetManager.active);
    }
    //#endregion

}