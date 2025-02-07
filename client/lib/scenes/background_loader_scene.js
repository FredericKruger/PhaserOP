class BackgroundLoaderScene extends Phaser.Scene {
    constructor() {
        super({key: SCENE_ENUMS.BACKGROUND_LOADER});
    }

    preload(){
        let assetPath = 'assets/backgrounds';
        this.game.utilFunctions.loadFont("OnePieceFont", "assets/fonts/OnePieceFont.otf");
        this.game.utilFunctions.loadFont("OnePieceTCGFont", "assets/fonts/Roboto-Regular.otf");
        this.load.image(ASSET_ENUMS.BACKGROUND1, `${assetPath}/background.png`);
        this.load.image(ASSET_ENUMS.BACKGROUND2, `${assetPath}/background2.jpg`);
        this.load.image(ASSET_ENUMS.BACKGROUND3, `${assetPath}/background3.jpg`);
        this.load.image(ASSET_ENUMS.LOGO, 'assets/logo.jpg');
    }

    create(){
        this.scene.start(SCENE_ENUMS.LOADER);
    }
}