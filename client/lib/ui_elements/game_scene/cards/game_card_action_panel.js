class GameCardActionPanel extends Phaser.GameObjects.Container {

    constructor(scene, card, x, y) {
        super(scene, x, y);

        this.scene = scene;
        this.card = card;
    }

}