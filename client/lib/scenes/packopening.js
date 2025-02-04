class PackOpening extends Phaser.Scene {

    constructor() {
        super({key: 'packopening'});
    }

    init() {}

    preload() {}

    create() {
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
        
        this.add.image(screenCenterX, screenCenterY, 'background').setScale(1);
    }

}