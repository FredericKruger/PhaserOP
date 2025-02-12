class MatchSummaryPanel extends Phaser.GameObjects.Container {

    constructor(scene, config) {
        super(scene, config.x, config.y);

        this.scene = scene;

        this.obj = [];
        this.config  = config;

        //Set the elements size
        this.decksPanelSize = {
            width: config.width,
            height: config.height,
            x: config.x,
            y: config.y
        }

        this.create();

        this.add(this.obj);

        this.setSize(this.decksPanelSize.width, this.decksPanelSize.height);

        this.scene.add.existing(this);
        this.setVisible(false);

    }

    create() {
        //Leader Portrait
        this.leaderProtrait = this.scene.add.image(0, -150, '');
        this.leaderProtrait.preFX.addGlow(COLOR_ENUMS.OP_CREAM_DARKER, 3);
        this.obj.push(this.leaderProtrait);

        //Deck Color
        this.deckColor = this.scene.add.image(
            this.leaderProtrait.x + 75, 
            this.leaderProtrait.y, 
            '').setScale(0.6);
        this.deckColor.preFX.addGlow(COLOR_ENUMS.OP_CREAM_DARKER, 2);
        this.obj.push(this.deckColor);

        //Deck Name
        this.obj.push(this.scene.add.rectangle(0, 0, 200, 40, COLOR_ENUMS.OP_BLACK, 0.8).setOrigin(0.5));
        this.deckName = this.scene.add.text(0, 0, '', {
            font: "30px OnePieceFont",
            fill: "#ffffff"
        }).setOrigin(0.5);
        this.obj.push(this.deckName);

        //lifebar
        this.lifeBar = this.scene.add.graphics();
        this.lifeBar.fillStyle(COLOR_ENUMS.OP_PURPLE, 1);
        this.lifeBar.fillRoundedRect(
            this.leaderProtrait.x - 75 + 10, 
            this.leaderProtrait.y + 75 + 3,
            130, 15, 5);
        this.lifeBar.lineStyle(2, COLOR_ENUMS.OP_BLACK); // Set the line style (width and color)
        this.lifeBar.strokeRoundedRect(
            this.leaderProtrait.x - 75 + 10, 
            this.leaderProtrait.y + 75 + 3,
            130, 15, 5);
        this.obj.push(this.lifeBar);

        //Life Icon
        this.obj.push(this.scene.add.image(
            this.leaderProtrait.x - 75 + 10, 
            this.leaderProtrait.y + 75 + 5, 
            ASSET_ENUMS.ICON_LIFE).setScale(0.8));
        this.leaderLife = this.scene.add.text(this.leaderProtrait.x - 75 + 10, this.leaderProtrait.y + 75 + 4, '', {
            font: "30px OnePieceFont",
            fill: "#ffffff"
        }).setOrigin(0.5);
        this.obj.push(this.leaderLife);

        //Baground Rectangle
        this.background = this.scene.add.graphics();
        this.background.fillStyle(COLOR_ENUMS.OP_CREAM, 1);
        this.background.fillRoundedRect(
            this.leaderProtrait.x - 75 - 25, 
            this.leaderProtrait.y - 75 - 20,
            200, 210, 5);
        this.background.lineStyle(4, COLOR_ENUMS.OP_CREAM_DARKER); // Set the line style (width and color)
        this.background.strokeRoundedRect(
            this.leaderProtrait.x - 75 - 25, 
            this.leaderProtrait.y - 75 - 20,
            200, 210, 5);
        //this.obj = [this.background].concat(this.obj);
        this.obj.unshift(this.background);
    }

    /** Function to set the panel's visibility
     * @param {boolean} visible - The visibility of the panel
     */
    setVisible(visible) {
        this.obj.forEach(element => {
            element.setVisible(visible);
        });
    }

    /** Update the content of the panel
     * @param {Object} deck - The deck to display
     */
    updateSelectedDeck(deck) {
        this.leaderProtrait.setTexture(this.scene.game.utilFunctions.getLeaderArt(deck.leader));
        this.leaderProtrait.setScale(1.5);

        this.deckColor.setTexture(this.scene.game.utilFunctions.getCardSymbol(deck.colors, true));

        this.deckName.setText(deck.name);

        this.leaderLife.setText(deck.leaderlife);

        this.setVisible(true);
    }

}