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
        this.border.lineStyle(15, COLOR_ENUMS.OP_GOLD, 1); // Orange color with 5px thickness
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
        let textures = [];
        let callback = () => {
            this.art.setTexture(cardArtKey);
        };

        textures.push({
            key: cardArtKey,
            path: `assets/cardart/${cardArtKey}.png`
        });
        this.scene.game.loaderManager.addJob(new LoaderJob(this.scene, textures, callback));
    }

    getWidth () {
        return this.width * this.scale;
    }

    getHeight () {
        return this.height * this.scale;
    }

    /**
     * FUNCTION TO SHOW THE BORDER
     * @param {boolean} show
     */
    showBorder(show) {this.border.setVisible(show);}
}