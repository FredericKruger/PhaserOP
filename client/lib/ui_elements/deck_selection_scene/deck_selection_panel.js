class DeckSelectionPanel extends Phaser.GameObjects.Container{

    /** CONSTRUCTOR
     * @param {DeckSelectionScene} scene - The scene this panel is in
     */
    constructor(scene, config) {
        super(scene, config.x, config.y);
        
        this.scene = scene;

        this.obj = [];
        this.deckEntries = [];
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
    }

    create() {
        //Page title
        this.obj.push(this.scene.add.rectangle(0, -this.decksPanelSize.height/2 + 55, 300, 40, COLOR_ENUMS.OP_BLACK, 0.8).setOrigin(0.5));
        this.obj.push(this.scene.add.text(0, -this.decksPanelSize.height/2 + 55, this.config.panelTitle, {
            font: "30px OnePieceFont",
            fill: "#ffffff"
        }).setOrigin(0.5));

        //will be part of a lopp
        let deck = this.config.decklist[0];
        //Only show valid decks
        if(deck.cards.length === GAME_ENUMS.DECK_LIMIT) {

        }

    }

    getDeckData(deck) {
        
    }

}