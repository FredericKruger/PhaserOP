class CardOpeningPanelCardVisual extends Phaser.GameObjects.Container {

    constructor (scene, config) {
        super(scene, config.x, config.y);

        let width = 600;
        let height = 838;

        this.scene = scene;
        this.scale = config.scale;

        this.cardIndex = config.index;
        this.showingBack = true;

        this.artKey = config.art;
        this.art = this.scene.add.image(0, 0, '');
        this.art.setVisible(!this.showingBack);
        this.backart = this.scene.add.image(0, 0, ASSET_ENUMS.CARD_BACK1);
        this.backart.setVisible(this.showingBack);

        this.add([this.art, this.backart]);

        this.setSize(width, height);
        this.setScale(config.scale);

        this.scene.add.existing(this);

        this.setUpdate();
    }

    /** Update the content of the card */
    setUpdate () {
        let loader = new Phaser.Loader.LoaderPlugin(this.scene); //create a loader 
        if(!this.scene.textures.exists(this.artKey)) {
            loader.image(this.artKey, `assets/cardart/${this.artKey}.png`); //load image
            loader.once(Phaser.Loader.Events.COMPLETE, () => {
                this.art.setTexture(this.artKey);
            });
            loader.start();
        } else {
            this.art.setTexture(this.artKey);
        }
    }

    getWidth () {
        return this.width * this.scale;
    }

    getHeight () {
        return this.height * this.scale;
    }

    /** Flip the card to reveal the art */
    flipCard() {
        this.scene.tweens.add({
            targets: this.backart,
            scaleY: 0,
            duration: 300,
            ease: 'Linear',
            onComplete: () => {
                this.showingBack = false;
                this.backart.setVisible(false);
                this.art.setVisible(true);
                this.scene.tweens.add({
                    targets: this.art,
                    scaleY: 1,
                    duration: 300,
                    ease: 'Linear'
                });
            }
        });
    }
}