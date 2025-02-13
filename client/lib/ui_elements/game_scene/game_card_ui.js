class GameCardUI extends Phaser.GameObjects.Container {

    constructor(scene, playerScene, config){ 
        super(scene, config.x, config.y);

        this.scene = scene;
        this.playerScene = playerScene;
        
        this.cardData = config.cardData;

        this.state = config.state;    
    }

    create() {

    }

}