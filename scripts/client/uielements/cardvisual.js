class CardVisual extends Phaser.GameObjects.Container {

    constructor (scene, config) {
        super(scene, config.x, config.y);

        let width = 600;
        let height = 838;

        this.scene = scene;
        this.scale = config.scale;

        this.cardIndex = 0;
        this.showingBack = false;

        this.border = this.scene.add.graphics();
        this.border.lineStyle(15, OP_GOLD, 1); // Orange color with 5px thickness
        this.border.strokeRoundedRect(-300, -419, 600, 838, 20); // Adjust the rectangle to match the image size and add rounded corners
        this.border.setVisible(false);  

        this.art = this.scene.add.image(0, 0, '');

        this.add([this.art, this.border]);

        this.setSize(width, height);
        this.setScale(config.scale);

        this.scene.add.existing(this);
    }

    /** Update the content of the card */
    setUpdate (card) {
        let cardArtKey = card.art;
        let loader = new Phaser.Loader.LoaderPlugin(this.scene); //create a loader 
        if(!this.scene.textures.exists(cardArtKey)) {
            loader.image(cardArtKey, 'assets/cardart/' + cardArtKey + '.png'); //load image
            loader.once(Phaser.Loader.Events.COMPLETE, () => {
                this.art.setTexture(cardArtKey);
            });
            loader.start();
        } else {
            this.art.setTexture(cardArtKey);
        }
    }

    getWidth () {
        return this.width * this.scale;
    }

    getHeight () {
        return this.height * this.scale;
    }

    /** FUNCTION TO SHOW THE BORDER */
    showBorder(show) {this.border.setVisible(show);}
}