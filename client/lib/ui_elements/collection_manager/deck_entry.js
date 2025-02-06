class DeckEntry extends Phaser.GameObjects.Container {

    constructor(config, scene) {
        super(scene, config.x, config.y);

        this.scene = scene;
        this.deckid = config.deckid;

        this.width = config.width;
        this.height = config.height;

        this.color1 = this.scene.game.utilFunctions.getCardColor(config.colors[0]);
        this.color2 = config.colors.length > 1? this.scene.game.utilFunctions.getCardColor(config.colors[1]) : null;

        this.numberCards = 0;

        /** Background */
        this.background = this.scene.add.rexRoundRectangleCanvas(0, 0, this.width, this.height, 5, this.color1, COLOR_ENUMS.OP_WHITE, 3);
        if(this.color2 !== null) this.background.setFillStyle(this.color1, this.color2, true);
        this.background.setOrigin(0.5, 0.5);

        /** Deck Name Text */
        this.deckname = this.scene.add.text(this.background.x, this.background.y, config.name, {
            fontFamily: 'Brandon',
            font: "20px monospace",
            color: COLOR_ENUMS_CSS.OP_CREAM

        }).setOrigin(0.5)

        /** Type icons */
        this.typeImage = this.scene.add.image(this.background.x+this.background.width/2 - 30, this.background.y, this.scene.game.utilFunctions.getCardSymbol(config.colors, true)).setScale(0.6).setOrigin(0.5);
        
        this.leaderImage = this.scene.add.image(this.background.x-this.background.width/2 + 40, this.background.y, this.scene.game.utilFunctions.getLeaderArt(config.leaderArt)).setScale(0.5).setOrigin(0.5);

        /** Text if there are missing cards */
        this.missingCardsText = this.scene.add.text(
            this.background.x + this.background.width/2 - 60,
            this.background.y + this.background.height/2 - 12,
            "Missing cards", {
                fontFamily: 'Brandon',
                font: "14px monospace",
                color: COLOR_ENUMS_CSS.OP_WHITE
            });
        this.missingCardsText.setVisible(false);
        this.missingCardsText.setOrigin(0.5);

        /** Box counting the number of cards, only visible if missing cards */
       this.missingCardsBox = this.scene.add.rexRoundRectangleCanvas(
                                        this.background.x-this.background.width/2 + 5 + 20, 
                                        this.background.y-this.background.height/2 - 5 + 12.5, 
                                        40, 
                                        25, 
                                        5, 
                                        COLOR_ENUMS.OP_RED, 
                                        COLOR_ENUMS.OP_WHITE, 3);
        this.missingCardsBox.setVisible(true);
        this.missingCardsBox.setOrigin(0.5);
        
        this.missingCardsBoxText = this.scene.add.text(
            this.background.x-this.background.width/2 + 5 + 20, 
            this.background.y-this.background.height/2 - 5 + 12.5, 
            "0/40", {
                fontFamily: 'Brandon',
                font: "12px monospace",
                fill: "#ffffff"
        });
        this.missingCardsBoxText.setVisible(false);
        this.missingCardsBoxText.setOrigin(0.5);

        this.deleteCircleButton = this.scene.add.image(
            this.background.x - this.background.width/2 + 10,
            this.background.y - this.background.height/2 + 10, 
            ASSET_ENUMS.DELETE_ICON);
        this.deleteCircleButton.setOrigin(0.5);
        this.deleteCircleButton.setDisplaySize(25, 25);
        this.deleteCircleButton.setVisible(false);
        this.deleteCircleButton.setInteractive();
        this.deleteCircleButton.on('pointerdown', () => this.scene.deleteDeck(this.deckid));
        this.deleteCircleButton.on('pointerover', () => this.onPointerOver());
        this.deleteCircleButton.on('pointerout', () => this.onPointerOut());

        /** ADD ALL ELEMENTS TO CONTAINER */
        this.add([this.background, this.deckname, this.typeImage, this.leaderImage,
                    this.missingCardsText, this.missingCardsBox, this.missingCardsBoxText, this.deleteCircleButton]);

        this.setSize(this.width, this.height);

        this.scene.add.existing(this);

        this.setInteractive();
        this.on('pointerover', () => this.onPointerOver());
        this.on('pointerout', () => this.onPointerOut());
        this.on('pointerdown', () => this.scene.loadDeck(this.deckid));
    }

    /** FUNCTION TO UPDATE THE VISUALS FOR THE DECK ENTRY */
    updateValidDeck(numberCards) {
        this.numberCards = numberCards;
        let isvalid = this.numberCards!==GAME_ENUMS.DECK_LIMIT;

        this.missingCardsBoxText.text = numberCards + "/" + GAME_ENUMS.DECK_LIMIT;

        this.missingCardsText.setVisible(isvalid);
        this.missingCardsBox.setVisible(isvalid);
        this.missingCardsBoxText.setVisible(isvalid);
    }

    /** FUNCTION TO UPDATE THE DECK ENTRY INFORMATION */
    updateInfo(newInfo) {
        this.color1 = this.scene.game.utilFunctions.getCardColor(newInfo.colors[0]);
        this.color2 = newInfo.colors.length > 1? this.scene.game.utilFunctions.getCardColor(newInfo.colors[1]) : null;

        if(this.color2 !== null) this.background.setFillStyle(this.color1, this.color2, true);
        else this.background.setFillStyle(this.color1);

        this.typeImage.setTexture(this.scene.game.utilFunctions.getCardSymbol(newInfo.colors, true));
        this.leaderImage.setTexture(this.scene.game.utilFunctions.getLeaderArt(newInfo.leader));

        this.deckname.text = newInfo.name;

        this.updateValidDeck(newInfo.numbercards);
    }

    /** FUNCTION THAT HANDLES WHAT HAPPENES WHEN POINTER IS OVER */
    onPointerOver() {
        this.setScale(1.02);
        this.showDeleteCircleButton();
    }

    /** FUNCTION THAT HANDLES WHAT HAPPENS WHEN POINTER IS OUT */
    onPointerOut() {
        this.setScale(1);
        this.hideDeleteCircleButton();
    }

    /** FUNCTION TO SHOW THE DELETE DECK BUTTON */
    showDeleteCircleButton() {
        this.deleteCircleButton.setVisible(true);

        this.missingCardsBox.setVisible(false);
        this.missingCardsBoxText.setVisible(false);
    }

    /** FUNCTION TO HIDE THE DELETE DECK BUTTON */
    hideDeleteCircleButton() {
        this.deleteCircleButton.setVisible(false);

        let isvalid = this.numberCards!==GAME_ENUMS.DECK_LIMIT;
        this.missingCardsBox.setVisible(isvalid);
        this.missingCardsBoxText.setVisible(isvalid);
    }

}