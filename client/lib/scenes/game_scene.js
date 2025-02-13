class GameScene extends Phaser.Scene {

    constructor() {
        super(SCENE_ENUMS.GAME_SCENE);
    }

    init() {
        this.screenCenterX = this.cameras.main.worldView.x + this.cameras.main.displayWidth / 2;
        this.screenCenterY = this.cameras.main.worldView.y + this.cameras.main.displayHeight / 2;
        this.screenHeight = this.cameras.main.displayHeight;
        this.screenWidth = this.cameras.main.displayWidth;

        this.activePlayer = new Player(true, this.game.gameClient.decklist[0]);
        this.passivePlayer = new Player(false, []);

        this.activePlayerScene = new PlayerScene(this, PLAYER_POSITIONS.BOTTOM, this.activePlayer);
        this.passivePlayerScene = new PlayerScene(this, PLAYER_POSITIONS.TOP, this.passivePlayer);
    }

    create() {
        //Prepare the background
        this.add.image(
            this.screenCenterX, this.screenCenterY, ASSET_ENUMS.BATTE_BACKGROUND_1
        )
        .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
        .setDepth(0);

        this.add.image(10, this.screenCenterY, ASSET_ENUMS.GAME_PHASE_BOX).setScale(0.8).setOrigin(0, 0.5).setDepth(0).setAlpha(0.74);
        this.phaseText = this.add.text(30, this.screenCenterY, "Phase: 1", 
            {font: "30px OnePieceTCGFont", color: COLOR_ENUMS_CSS.OP_WHITE, align: "left"}
        ).setOrigin(0, 0.5).setDepth(0);

        this.activePlayerScene.create();
        this.passivePlayerScene.create();

        //Will be removed
        //this.activePlayerScene.deck.addCards([400,410,410,410,410]);
    }

}