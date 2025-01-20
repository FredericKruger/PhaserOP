class CardVisual extends Phaser.GameObjects.Container {

    constructor (scene, config) {
        super(scene, config.x, config.y);

        this.scene = scene;
        this.scale = config.scale;

        //this.state = CardState.IN_DECK;

        this.cardIndex = 0;
        this.showingBack = false;

        this.art = this.scene.add.image(0, 0, '');

        this.add([this.art]);

        this.setSize(600, 838);
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
}