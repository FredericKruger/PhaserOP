const GameClient = new Client();

window.onload = function() {
    let osize = { x:1500, y:960 };
    let oscale = { x:1500 / window.innerWidth, y:960 / window.innerHeight }

    let config = {
        type: Phaser.AUTO,
        parent: 'game',
        disableContextMenu: true,
        /*fps: {
            target: 60,
            forceSetTimeOut: true
        },*/
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: window.innerWidth,
            height: window.innerHeight,
        },
        dom: {
            createContainer: true
        }
    };

    let Game = new Phaser.Game(config);
    Game.scene.add(SCENE_ENUMS.BACKGROUND_LOADER, BackgroundLoaderScene, false);
    Game.scene.add(SCENE_ENUMS.LOADER, LoaderScene, false);
    Game.scene.add(SCENE_ENUMS.LOGIN, LoginScene, false);
    Game.scene.add(SCENE_ENUMS.TITLE, TitleScene, false);
    Game.scene.start(SCENE_ENUMS.BACKGROUND_LOADER);

    GameClient.game = Game;
}

window.onclose = function () {
    GameClient.askDisconnect();
}