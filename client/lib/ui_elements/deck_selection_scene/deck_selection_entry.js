class DeckSelectionEntry extends Phaser.GameObjects.Container {

    constructor(scene, deckSelectionPanel, config) {
        super(scene, config.x, config.y);

        this.scene = scene;
        this.deckSelectionPanel = deckSelectionPanel;
        
        this.deckconfig = config.deckconfig;

        this.obj = [];

        this.isSelected = false;

        /** Background Banner */
        let backgroundBanner = this.scene.add.image(0, 0, this.scene.game.utilFunctions.getBannerFromColor(this.deckconfig.colors[0])).setOrigin(0.5).setScale(0.75);
        backgroundBanner.preFX.addGlow(COLOR_ENUMS.OP_WHITE, 3);
        this.obj.push(backgroundBanner);
        if(this.deckconfig.colors.length>1) {
            let backgroundBanner2 = this.scene.add.image(0, 0, this.scene.game.utilFunctions.getBannerFromColor(this.deckconfig.colors[1])).setOrigin(0.5).setScale(0.75);
            // Calculate the crop area to keep only the right side
            let cropWidth = backgroundBanner2.width / 2; // Adjust this value as needed
            let cropHeight = backgroundBanner2.height;
            backgroundBanner2.setCrop(cropWidth, 0, cropWidth, cropHeight);

            this.obj.push(backgroundBanner2);        
        }

        /** Background */
        this.background = this.scene.add.rexRoundRectangleCanvas(0, -30, config.width, config.height, 5, COLOR_ENUMS.OP_GREY, COLOR_ENUMS.OP_BLACK, 3);
        this.background.setOrigin(0.5);
        this.obj.push(this.background);

        /** Deck Name */
        let deckname = scene.add.text(this.background.x - this.background.width/2 + 10, this.background.y + this.background.height/2 - 10, this.deckconfig.name, {
            font: "20px OnePieceTCGFont",
            fill: COLOR_ENUMS_CSS.OP_WHITE,
            //backgroundColor: "rgba(0, 0, 0, 0.6)"//,
        }).setOrigin(0, 1);
        this.obj.push(deckname);

        /** Color Symbol */
        let colorSymbol = this.scene.add.image(this.background.x, this.background.y + this.background.height/2 + 20, this.scene.game.utilFunctions.getCardSymbol(this.deckconfig.colors, true)).setScale(0.6).setOrigin(0.5);
        this.obj.push(colorSymbol);

        /** Add Leader Portrait */
        let leaderProtrait = this.scene.add.image(this.background.x + this.background.width/4, this.background.y, this.scene.game.utilFunctions.getLeaderArt(this.deckconfig.leader)).setScale(0.55);
        leaderProtrait.preFX.addGlow(COLOR_ENUMS.OP_WHITE, 2);
        this.obj.push(leaderProtrait);

        /** ADD ALL ELEMENTS TO CONTAINER */
        this.add(this.obj);

        this.setSize(this.background.displayWidth, backgroundBanner.displayHeight);
        console.log(this.background.displayWidth, backgroundBanner.displayHeight);

        this.scene.add.existing(this);

        this.setInteractive();
        this.on('pointerover', () => {
            if(!this.isSelected)
                this.background.preFX.addGlow(COLOR_ENUMS.OP_WHITE, 5);
        });
        this.on('pointerout', () => {
            if(!this.isSelected)
                this.background.preFX.clear();
        });
        this.on('pointerdown', () => {
            if(!this.isSelected) {
                this.isSelected = true;
                this.background.preFX.clear();
                this.background.preFX.addGlow(COLOR_ENUMS.OP_ORANGE, 15);
                this.deckSelectionPanel.setSelectedDeck(this);
            }
        });
        
    }

    /** Unselect the deck entry */
    unSelect() {
        this.isSelected = false;
        this.background.preFX.clear();
    }

}