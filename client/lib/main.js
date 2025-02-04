const GameClient = new Client();

window.onload = function() {

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

    Game.scene.add(SCENE_ENUMS.BACKGROUND_LOADER, BackgroundLoaderScene, false);
    Game.scene.add(SCENE_ENUMS.LOADER, LoaderScene, false);
    Game.scene.add(SCENE_ENUMS.LOGIN, LoginScene, false);
    Game.scene.add(SCENE_ENUMS.TITLE, TitleScene, false);
    Game.scene.add(SCENE_ENUMS.COLLECTION_MANAGER, CollectionManagerScene, false);
    Game.scene.add(SCENE_ENUMS.PACK_OPENING, PackOpeningScene, false);
    Game.scene.start(SCENE_ENUMS.BACKGROUND_LOADER);

    GameClient.game = Game;
}

window.onclose = function () {
    GameClient.askDisconnect();
}