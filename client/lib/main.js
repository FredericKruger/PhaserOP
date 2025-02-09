window.onload = function() {
    let GameClient = new Client();

    let Game = new Phaser.Game(
    {
        type: Phaser.WEBGL,
        parent: 'game',
        disableContextMenu: true,
        pixelArt: false,
        backgroundColor: "#000000",
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: window.innerWidth,
            height: window.innerHeight,
        },
        dom: {
            createContainer: true
        }
    });

    Game.gameClient = GameClient;
    Game.utilFunctions = new Utils();
    Game.loaderManager = new DynamicTextureLoaderManager();

    Game.scene.add(SCENE_ENUMS.BACKGROUND_LOADER, BackgroundLoaderScene, false);
    Game.scene.add(SCENE_ENUMS.LOADER, LoaderScene, false);
    Game.scene.add(SCENE_ENUMS.LOGIN, LoginScene, false);
    Game.scene.add(SCENE_ENUMS.TITLE, TitleScene, false);
    Game.scene.add(SCENE_ENUMS.COLLECTION_MANAGER, CollectionManagerScene, false);
    Game.scene.add(SCENE_ENUMS.PACK_OPENING, PackOpeningScene, false);
    Game.scene.add(SCENE_ENUMS.STORE, StoreScene, false);
    Game.scene.start(SCENE_ENUMS.BACKGROUND_LOADER);

    window.onclose = function () {
        Game.gameClient.askDisconnect();
    }
}