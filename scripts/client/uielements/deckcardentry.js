const DECKCARD_ENTRY_HEIGHT = 30;
const DECKCARD_ENTRY_WIDTH = 275;
const DECKCARD_ENTRY_INTERSPACE = 1;

class DeckCardEntry extends Phaser.GameObjects.Container {

    constructor(config, deckCardListContainer) {
        super(deckCardListContainer.scene, config.x, config.y);

        this.deckCardListContainer = deckCardListContainer;
        this.scene = this.deckCardListContainer.scene;
        this.entryIndex = config.entryindex;
        this.cardi = config.cardi;
        this.firstClickTime = 0;

        this.background = this.scene.add.rexRoundRectangleCanvas(0, 0, config.width, config.height, 0, 'rgba(0,0,0,0)', config.bordercolor, 3);
        this.background.setOrigin(0.5, 0.5);

        this.amount = this.scene.add.text(-config.width/2 + 7, 0, config.amount + 'x', {
            fontFamily: 'Brandon',
            font: "14px monospace",
            fill: "#000000",
            backgroundColor: "rgba(255, 255, 255, 0.8)"//,
        });
        this.amount.setOrigin(0., 0.5);

        this.type = this.scene.add.image(config.width/2 - 23, 0, config.type).setDisplaySize(23, 23);
        this.type.setOrigin(0.5, 0.5);

        this.cost = this.scene.add.text(-config.width/2 + 50, 0, config.cost, {
            fontFamily: 'Brandon',
            font: "14px monospace",
            fill: "#000000",
            backgroundColor: "rgba(255, 255, 255, 0.8)"//,
        });
        this.cost.setOrigin(0.5, 0.5);

        this.name = this.scene.add.text(-70, 0, config.name, {
            fontFamily: 'Brandon',
            font: "16px monospace",
            fill: "#000000",
            backgroundColor: "rgba(255, 255, 255, 0.8)"//,
            //fixedWidth: 70 + config.width/2 - 5
        });
        this.name.setOrigin(0., 0.5);

        //Change the text if the bounds are too big
        let textwidth = this.name.width;
        let maxTextWidth = 70 + config.width/2 - 5;

        while(textwidth > maxTextWidth){
            let newtext = this.name.text;
            newtext = newtext.slice(0, -1);
            this.name.text = newtext;
            textwidth = this.name.width;
        }
        if(this.name.text !== config.name)
            this.name.text = this.name.text.slice(0, -3) + '...';

        this.backgroundimage = this.scene.add.image(0, 0, '');

        let cardArtKey = 'deckentry_' + config.art;
        let assetToLoad = false;

        if (!this.scene.textures.exists(cardArtKey)) {
            let loader = new Phaser.Loader.LoaderPlugin(this.scene); // create a loader
            loader.image(cardArtKey, 'assets/deckentryart/' + cardArtKey + '.png'); // load image
            assetToLoad = true;

            loader.once(Phaser.Loader.Events.COMPLETE, () => {
                this.backgroundimage.setTexture(cardArtKey);

                this.add([this.backgroundimage, this.background, this.amount, this.name, this.cost, this.type]);

                this.setSize(config.width, config.height);

                this.scene.add.existing(this);
            });

            try {
                loader.start();
            } catch (error) {
                console.error("Error loading texture:", error);
            }
        } else {
            this.backgroundimage.setTexture(cardArtKey);

            this.add([this.backgroundimage, this.background, this.amount, this.name, this.cost, this.type]);

            this.setSize(config.width, config.height);

            this.scene.add.existing(this);
        }

    }

    /** FUNCTION TO UPDATE THE CARD AMOUNT */
    updateAmount (amount) {
        this.amount.setText(amount + 'x');
    }

}