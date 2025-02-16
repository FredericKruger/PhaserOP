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

        this.selectedEntry = null;

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

        let currentIndex = 0;

        //Initial positions
        let startX = - GAME_ENUMS.DECK_SELECTION_ENTRY_DISPLAY_WIDTH - GAME_ENUMS.DECK_SELECTION_ENTRY_INTERSPACE_X;
        let startY = - GAME_ENUMS.DECK_SELECTION_ENTRY_DISPLAY_HEIGHT - GAME_ENUMS.DECK_SELECTION_ENTRY_INTERSPACE_Y + 40;
        
        for(let i=0; i<this.config.decklist.length; i++) {
            //will be part of a lopp
            let deck = this.config.decklist[i];
            //Only show valid decks
            if(deck.cards.length === GAME_ENUMS.DECK_LIMIT) {
                //get Deck Information
                let deckConfig = this.processDeck(deck, i);

                let currentX = startX + (GAME_ENUMS.DECK_SELECTION_ENTRY_DISPLAY_WIDTH + GAME_ENUMS.DECK_SELECTION_ENTRY_INTERSPACE_X) * (currentIndex % 3);
                let currentY = startY + (GAME_ENUMS.DECK_SELECTION_ENTRY_DISPLAY_HEIGHT + GAME_ENUMS.DECK_SELECTION_ENTRY_INTERSPACE_Y) * (Math.floor(currentIndex / 3));

                //Create DeckEntry object
                let deckEntry = new DeckSelectionEntry(this.scene, this, {
                    x: currentX,
                    y: currentY,
                    width: GAME_ENUMS.DECK_SELECTION_ENTRY_WIDTH,
                    height: GAME_ENUMS.DECK_SELECTION_ENTRY_HEIGHT,
                    deckconfig: deckConfig,
                    panelindex: currentIndex,
                    deckid: i
                });
                this.obj.push(deckEntry);
                this.deckEntries.push(deckEntry);

                currentIndex++;
            }
        }
    }

    /** PROCESS DECK FROM DECKLIST */
    processDeck = function(deck, id) {
        let name = deck.name;
        let colors = this.scene.game.gameClient.playerCollection.cardCollection[deck.cards[0]-1].colors;
        let leader = this.scene.game.gameClient.playerCollection.cardCollection[deck.cards[0]-1].art;
        let leaderlife = this.scene.game.gameClient.playerCollection.cardCollection[deck.cards[0]-1].life;
        let deckid = id;

        return {
            name: name,
            leader: leader,
            leaderlife: leaderlife,
            colors: colors,
            deckid: deckid
        };
    }

    /** SET SELECTED DECK 
     * @param {DeckSelectionEntry} deckEntry - The deck entry that was selected
    */
    setSelectedDeck(deckEntry) {
        if(this.selectedEntry) {
            this.selectedEntry.unSelect();
        }
        this.selectedEntry = deckEntry;

        //tell scene to update the match summary panel
        this.scene.updateSelectedDeck(deckEntry.deckconfig);
    }

    /** GET SELECTED DECK ID */
    getSelectedDeckID() {
        return this.selectedEntry.deckconfig.deckid;
    }

}