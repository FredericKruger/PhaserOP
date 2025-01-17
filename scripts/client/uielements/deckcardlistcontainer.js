class DeckCardListContainer {

    constructor (config, scene) {
        this.scene = scene;

        this.currentDeck = new Deck(true);

        this.deckTitle = null;
        this.obj = [];
        this.objToUpdate = [];

        this.x = config.x;
        this.y = config.y;
        this.height = config.height;
        this.width = config.width;
        
        this.scrollDelta = 0;
        this.scrollMax = 0;
        this.scrollingEnabled = false;

        /** PREPARE UI */
        this.background = this.scene.add.rexRoundRectangle(this.x + this.width/2, this.y + this.height/2, this.width, this.height, 20, OP_CREAM, 1);
        this.obj.push(this.background);

        /** DECK NAME */
        this.decknameBackground = new Button({
            scene: this.scene,
            x: this.x + this.width/2,
            y: this.y - 15,
            width: this.width,
            height: 70,
            radius: 5,
            backgroundcolor: OP_RED,
            outlinecolor: OP_CREAM,
            text: "",
            fontsize: 32
        });
        this.obj.push(this.decknameBackground);

        this.deckTitleOutline = this.scene.add.rectangle(this.decknameBackground.x+25, this.decknameBackground.y,  220, 45, OP_BLACK, 0).setStrokeStyle(3, OP_BLACK);
        this.obj.push(this.deckTitleOutline);

        /** SAVE DECK */
        this.saveDeckButton = new Button({
            scene: this.scene,
            x: this.x + this.width/2 + 85, 
            y: this.y + this.height - 23,
            width: 100,
            height: 40, //self.deckDropZone.height/2,
            radius: 5,
            backgroundcolor: OP_RED,
            outlinecolor: OP_CREAM,
            text: "Done",
            fontsize: 18
        });
        this.saveDeckButton.on('pointerdown', function () {
            this.scene.saveDeck();
        });
        this.saveDeckButton.on('pointerover', () => {
            this.saveDeckButton.setScale(1.1);
        });
        this.saveDeckButton.on('pointerout', () => {
            this.saveDeckButton.setScale(1);
        });
        this.obj.push(this.saveDeckButton);

        /** CARD AMOUNT TEXT */
        this.cardAmountTextRectangle = this.scene.add.rexRoundRectangleCanvas(this.x  + this.width/2 - 58, this.y + this.height - 23,  170, 35, 5, OP_BLUE, OP_CREAM, 2);
        this.cardAmountText = { 
            obj: this.scene.add.text(this.cardAmountTextRectangle.x, this.cardAmountTextRectangle.y-5, '0/40', {
                fontFamily: 'Brandon',
                font: "20px monospace",
                fill: "#E9E6CE"
            }).setOrigin(0.5, 0.5),
            deckCardListContainer: this,
            update: function () { 
                this.obj.setText(this.deckCardListContainer.currentDeck.deckSize + "/40");
            }
        }
        this.objToUpdate.push(this.cardAmountText);
        this.cardAmountText2 = this.scene.add.text(this.cardAmountTextRectangle.x, this.cardAmountTextRectangle.y+7, 'cards', {
            fontFamily: 'Brandon',
            font: "14px monospace",
            fill: "#E9E6CE"
        }).setOrigin(0.5, 0.5);
        this.obj.push(this.cardAmountTextRectangle);
        this.obj.push(this.cardAmountText.obj);
        this.obj.push(this.cardAmountText2);

        /** Types */
        this.typeImage = null;
        this.obj.push(this.typeImage);

        /** DROP ZONE */
        let dropZoneWidth = this.width-10;
        let dropZoneHeight = this.height-35-30;
        this.deckDropZone = this.scene.add.zone(this.x+5+dropZoneWidth/2, this.y+20+dropZoneHeight/2,  dropZoneWidth, dropZoneHeight).setRectangleDropZone(dropZoneWidth, dropZoneHeight);
        this.deckDropZone.setData({ name: 'deckDropZone'});
        this.dropzoneOutline = this.scene.add.rectangle(this.x+5, this.y+20,  dropZoneWidth, dropZoneHeight, OP_BLACK, 0).setStrokeStyle(3, OP_BLACK).setOrigin(0);
        this.obj.push(this.deckDropZone);
        this.obj.push(this.dropzoneOutline);

        /** CREATE A SCROLL PANEL */
        this.scrollContainer = this.scene.add.container(this.deckDropZone.x,this.deckDropZone.y);
        //Create the maskshape
        this.maskShape = this.scene.add.graphics();
        this.maskShape.fillRect(this.scrollContainer.x, this.scrollContainer.y, this.width-10, this.height-35-30);

        //Hide at init
        this.setVisible(false);
    }

    /** UPDATER */
    update() {
        for(let o of this.objToUpdate){
            o.update();
        }
    }

    /**SET VISIBLE FUNCTION */
    setVisible(visible){
        for(let o of this.obj){
            if(o !== null)
                o.setVisible(visible);
        }

        //destroy all deck entries
        /*if(!visible){
            for(let i = 0; i<this.currentDeck.cards.length; i++){
                this.currentDeck.cards[i].deckBuilderEntry.destroy();
                this.currentDeck.cards[i].placeholderEntry.destroy();
            }
        }*/      
    }

    /** RESET FUNCTION */
    reset() {
        this.scrollDelta = 0;
        this.scrollMax = 0;
        this.scrollingEnabled = false;
        this.deckTitle.text = 'New Deck';
    }

    /** SET THE DECK TITLE ENTRIES */
    setDeckTitle (deckTitle) {
        this.deckTitle = deckTitle;
        this.obj.push(this.deckTitle);
    }

    /** CREATE A DECK CARD ENTRY */
    createDeckCardEntry(card, position, cardi, isPlaceholder, amount) {
        let cardname = card.name;

        let startY = this.deckDropZone.y - this.deckDropZone.height/2 + DECKCARD_ENTRY_HEIGHT/2 + 5;
        let currentY = startY + (position * DECKCARD_ENTRY_HEIGHT) + (Math.max(position-1, 0) * DECKCARD_ENTRY_INTERSPACE);

        let color = getCardColor(card.colors[0])

        let deckEntry = new DeckCardEntry({
            entryindex: position,
            cardi: cardi,
            x: this.deckDropZone.x,
            y: currentY,
            width: DECKCARD_ENTRY_WIDTH,
            height: DECKCARD_ENTRY_HEIGHT,
            backgroundcolor: OP_CREAM,
            bordercolor: color,
            name: cardname,
            amount: amount,
            art: card.art,
            type: getCardSymbol(card.colors[0]),
            cost: card.cost
        }, this);

        return deckEntry;
    }

    /** UPDATE THE DECK CARD ENTRIES IN THE DECK LIST */
    updateDeckCardEntries(cardi) {
        let addedEntry = null;

        //reorder visual card entries
        for(let i=0; i<this.currentDeck.cards.length; i++) {
            let card = this.currentDeck.cards[i];
            if(card.deckBuilderEntry === null) { //if no visual entry exists for the card
                card.setPlaceholderEntry(this.createDeckCardEntry(card.cardInfo, i, cardi, true, card.amount));
                card.setDeckbuilderEntry(this.createDeckCardEntry(card.cardInfo, i, cardi, false, card.amount));

                addedEntry = card;
            }
        }
    }
}