class DeckListContainer {

    constructor (config) {
        this.scene = config.scene;

        this.decktitle = null;
        this.obj = [];
        this.objToUpdate = [];

        this.deckEntries = [];
  
        this.x = config.x;
        this.y = config.y;
        this.height = config.height;
        this.width = config.width;
        
        this.scrollDelta = 0;
        this.scrollMax = 0;
        this.scrollingEnabled = false;

        /** PREPARE UI ELEMENTS */
        this.background = this.scene.add.rexRoundRectangle(this.x + this.width/2, this.y + this.height/2, this.width, this.height, 20, OP_CREAM, 1);
        this.obj.push(this.background);

        this.title = new Button({
            scene: this.scene,
            x: this.x + this.width/2,
            y: this.y - 15,
            width: this.width,
            height: 70,
            radius: 5,
            backgroundcolor: OP_RED,
            outlinecolor: OP_CREAM,
            text: "My Decks",
            fontsize: 36
        });
        this.obj.push(this.title);

        /* Back Button */
        this.backButton = new Button({
            scene: this.scene,
            x: this.x + this.width/2 + 85, 
            y: this.y + this.height - 23,
            width: 100,
            height: 40,
            radius: 5,
            backgroundcolor: OP_RED,
            outlinecolor: OP_CREAM,
            text: "Back",
            fontsize: 18
        });
        this.backButton.on('pointerdown', () =>  {
            this.scene.backToTitle();
        });
        this.backButton.on('pointerover', () => {
            this.backButton.setScale(1.1);
        });
        this.backButton.on('pointerout', () => {
            this.backButton.setScale(1);
        });

        /** DECK ZONE */
        this.deckZoneOutline = this.scene.add.rectangle(this.x+5, this.y+20,  this.width-10, this.height-35-30, OP_BLACK, 0).setStrokeStyle(3, OP_BLACK).setOrigin(0);
        this.obj.push(this.deckZoneOutline);

        this.deckAmountTextRectangle = this.scene.add.rexRoundRectangleCanvas(this.x + this.width/2 - 58, this.y + this.height - 23,  170, 35, 5, OP_RED, OP_WHITE, 2);
        this.deckAmountText = {
            obj: this.scene.add.text(this.deckAmountTextRectangle.x, this.deckAmountTextRectangle.y-5, '0/9', {
                fontFamily: 'Brandon',
                font: "20px monospace",
                fill: "#E9E6CE"
            }).setOrigin(0.5, 0.5),
            deckContainer: this,
            update: function () { 
                this.obj.setText(this.deckContainer.deckEntries.length + "/9");
            }
        }
        this.objToUpdate.push(this.deckAmountText);
        this.deckAmountText2 = this.scene.add.text(this.deckAmountTextRectangle.x, this.deckAmountTextRectangle.y+7, 'decks', {
            fontFamily: 'Brandon',
            font: "14px monospace",
            fill: "#E9E6CE"
        }).setOrigin(0.5, 0.5);
        this.obj.push(this.deckAmountTextRectangle);
        this.obj.push(this.deckAmountText.obj);
        this.obj.push(this.deckAmountText2);

        this.startY = this.deckZoneOutline.y + DECK_ENTRY_HEIGHT/2 + DECK_ENTRY_INTERSPACE;
        //add placeholders (purely decorative)
        this.addPlaceHolder();

        //add deck button
        this.newDeckButton = {
            obj: new Button({
                    scene: this.scene,
                    x: this.x + this.width/2, 
                    y: this.startY,
                    width: DECK_ENTRY_WIDTH,
                    height: DECK_ENTRY_HEIGHT,
                    radius: 3,
                    backgroundcolor: OP_ORANGE,
                    outlinecolor: OP_WHITE,
                    text: "New Deck",
                    fontsize: 30
                })
                    .on('pointerdown', function() {
                        this.scene.newDeck();
                    })
                    .on('pointerover', () => {
                        this.newDeckButton.obj.setScale(1.02);
                    })
                    .on('pointerout', () => {
                        this.newDeckButton.obj.setScale(1);
                    }),
            deckListContainer: this,
            update: function () {
                this.obj.setVisible(GameClient.decklist.length<9);
                
                let numberdeck = this.deckListContainer.deckEntries.length;
                let newY = this.deckListContainer.startY + numberdeck * DECK_ENTRY_HEIGHT + Math.max(numberdeck, 0) * DECK_ENTRY_INTERSPACE;
                this.obj.setPosition(this.obj.x, newY);
            }
        };
        this.obj.push(this.newDeckButton.obj);
        this.objToUpdate.push(this.newDeckButton);

        this.setVisible(true);
    }

    /** FUNCTION INITIALISING THE DECK LIST */
    init() {
        for(let i = 0; i<GameClient.decklist.length; i++){
            let deckConfig = this.processDeck(GameClient.decklist[i], i);
            this.addDeck(deckConfig);
        }
    }

    /** FUNCTION TO UPDATE */
    update() {
        for(let o of this.objToUpdate) o.update();
    }

    /** FUNCTION TO SET THE WHOLE PANEL VISIBLE */
    setVisible = function(visible){
        for(let o of this.obj){
            if(o !== null)
                o.setVisible(visible);
        }
        for(let i = 0; i<this.deckEntries.length; i++){
            this.deckEntries[i].setVisible(visible);
        }
    }

    /** ADD A PLACEHOLDER */
    addPlaceHolder = function () {
        let currentTopY = this.startY;
        let currentButtomY = this.startY + DECK_ENTRY_HEIGHT;
        while(currentButtomY < (this.deckZoneOutline.y + this.deckZoneOutline.height)){
            this.scene.rexUI.add.roundRectangle(this.x + this.width/2, currentTopY,  DECK_ENTRY_WIDTH-25, DECK_ENTRY_HEIGHT-20, 5, OP_BLACK, 0).setStrokeStyle(3, OP_BLACK)

            currentTopY = currentTopY + DECK_ENTRY_HEIGHT + DECK_ENTRY_INTERSPACE;
            currentButtomY = currentButtomY + DECK_ENTRY_HEIGHT + DECK_ENTRY_INTERSPACE;
        }
    }

    /** PROCESS DECK FROM DECKLIST */
    processDeck = function(deck, id) {
        let name = deck.name;
        let colors = this.scene.cardIndex[deck.cards[0]-1].colors;
        let leader = this.scene.cardIndex[deck.cards[0]-1].art;
        let deckid = id;

        return {
            name: name,
            leader: leader,
            colors: colors,
            deckid: deckid,
            numbercards: deck.cards.length
        };
    }

    /** ADD A DECK ENTRY */
    addDeck = function (deckconfig) {
        let name  = deckconfig.name;
        let leaderArt = deckconfig.leader;
        let colors = deckconfig.colors;
        let deckid = deckconfig.deckid;
        let numbercards = deckconfig.numbercards;

        let currentY = this.startY + this.deckEntries.length * DECK_ENTRY_HEIGHT + this.deckEntries.length * DECK_ENTRY_INTERSPACE;

        let deckEntry = new DeckEntry({
            x: this.x + this.width/2,
            y: currentY,
            width: DECK_ENTRY_WIDTH,
            height: DECK_ENTRY_HEIGHT,
            deckid: deckid,
            colors: colors,
            leaderArt: leaderArt,
            name: name
        }, this.scene);
        deckEntry.updateValidDeck(numbercards);
        this.deckEntries.push(deckEntry);
    }

    /** UPDATE DECK INFORMATION usually after a save */
    updateDeck(deckconfig) {
        let deckEntry = this.deckEntries.find((deckentry) => deckentry.deckid === deckconfig.deckid);
        deckEntry.updateInfo(deckconfig);
    }

    /** UPDATE DECKENTRY LAYOUTS */
    updateEntryLayout() {
        for(let i=0; i<this.deckEntries.length; i++){
            let currentY = this.startY + i * DECK_ENTRY_HEIGHT + i * DECK_ENTRY_INTERSPACE;
            this.deckEntries[i].setPosition(this.deckEntries[i].x, currentY);
            this.deckEntries.deckid = i;
        }
    }

    /** DELETE DECKENTRY */
    deleteDeck(deckid) {
        let deckEntry = this.deckEntries[deckid];
        this.deckEntries.splice(deckid, 1);
        deckEntry.destroy();
        deckEntry = null;
    }
    
}