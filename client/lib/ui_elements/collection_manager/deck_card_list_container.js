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
        this.background = this.scene.add.rexRoundRectangle(this.x + this.width/2, this.y + this.height/2, this.width, this.height, 20, COLOR_ENUMS.OP_CREAM, 1);
        this.obj.push(this.background);

        /** DECK NAME */
        this.decknameBackground = new Button({
            scene: this.scene,
            x: this.x + this.width/2,
            y: this.y - 15,
            width: this.width,
            height: 70,
            radius: 5,
            backgroundcolor: COLOR_ENUMS.OP_ORANGE,
            outlinecolor: COLOR_ENUMS.OP_CREAM,
            text: "",
            fontsize: 32
        });
        this.obj.push(this.decknameBackground);

        this.deckTitleOutline = this.scene.add.rectangle(this.decknameBackground.x+25, this.decknameBackground.y,  220, 45, COLOR_ENUMS.OP_BLACK, 0).setStrokeStyle(3, COLOR_ENUMS.OP_BLACK);
        this.obj.push(this.deckTitleOutline);

        /** SAVE DECK */
        this.saveDeckButton = new Button({
            scene: this.scene,
            x: this.x + this.width/2 + 85, 
            y: this.y + this.height - 23,
            width: 100,
            height: 40, //self.deckDropZone.height/2,
            radius: 5,
            backgroundcolor: COLOR_ENUMS.OP_RED,
            outlinecolor: COLOR_ENUMS.OP_CREAM,
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
        this.cardAmountTextRectangle = this.scene.add.rexRoundRectangleCanvas(this.x  + this.width/2 - 58, this.y + this.height - 23,  170, 35, 5, COLOR_ENUMS.OP_BLUE, COLOR_ENUMS.OP_CREAM, 2);
        this.cardAmountText = { 
            obj: this.scene.add.text(this.cardAmountTextRectangle.x, this.cardAmountTextRectangle.y-5, '0/' + GAME_ENUMS.DECK_LIMIT, {
                fontFamily: 'Brandon',
                font: "20px monospace",
                color: COLOR_ENUMS_CSS.OP_CREAM
            }).setOrigin(0.5, 0.5),
            deckCardListContainer: this,
            update: function () { 
                this.obj.setText(this.deckCardListContainer.currentDeck.deckSize + "/" + GAME_ENUMS.DECK_LIMIT);
            }
        }
        this.objToUpdate.push(this.cardAmountText);
        this.cardAmountText2 = this.scene.add.text(this.cardAmountTextRectangle.x, this.cardAmountTextRectangle.y+7, 'cards', {
            fontFamily: 'Brandon',
            font: "14px monospace",
            color: COLOR_ENUMS_CSS.OP_CREAM
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
        this.dropzoneOutline = this.scene.add.rectangle(this.x+5, this.y+20,  dropZoneWidth, dropZoneHeight, COLOR_ENUMS.OP_BLACK, 0).setStrokeStyle(3, COLOR_ENUMS.OP_BLACK).setOrigin(0);
        this.obj.push(this.deckDropZone);
        this.obj.push(this.dropzoneOutline);

        /** CREATE A SCROLL PANEL */
        this.scrollContainer = new ScrollPanel(this.scene, this.x, this.y+20+5, this.width*2-10, this.height-35-30-10,false);
        this.obj.push(this.scrollContainer);
    
        //Hide at init
        this.setVisible(false);
    }

    /** UPDATER */
    update() {
        for(let o of this.objToUpdate){
            o.update();
        }
    }

    /** GETTERS  */
    getNameBackground() {return this.decknameBackground;}
    getDeckName() {return this.deckTitle.text;}

    /** SETTERS */
    setDeckName(deckname) {this.deckTitle.text = deckname;}

    /**SET VISIBLE FUNCTION */
    setVisible(visible){
        for(let o of this.obj){
            if(o !== null)
                o.setVisible(visible);
        }

        //destroy all deck entries
        if(!visible){
            for(let i = 0; i<this.currentDeck.cards.length; i++){
                this.currentDeck.cards[i].deckBuilderEntry.destroy();
                this.currentDeck.cards[i].placeholderEntry.destroy();
            }
        }    
    }

    /** RESET FUNCTION */
    reset() {
        //this.scrollDelta = 0;
        //this.scrollMax = 0;
        this.scrollingEnabled = false;
        this.deckTitle.text = 'New Deck';
    }

    /** FUNCTION TO LOAD A DECK */
    loadDeck(deck) {
        for(let i = 0; i<deck.cards.length; i++){
            this.currentDeck.addCard(GameClient.playerCollection.cardCollection[deck.cards[i]-1]);
        }
        this.setDeckName(deck.name);
        this.updateDeckColors();

        /** Preload Card Art if not loaded yet */
        let loader = new Phaser.Loader.LoaderPlugin(this.scene); // create a loader
        for(let i=0; i<this.currentDeck.cards.length; i++) {
            let cardArtKey = `deckentry_${this.currentDeck.cards[i].cardInfo.art}`;
            let nbLoads = 0;
            if(!this.scene.textures.exists(cardArtKey)) {
                loader.image(cardArtKey, `assets/deckentryart/${cardArtKey}.png`); // load image
                nbLoads++;
            } 
        }
        loader.once(Phaser.Loader.Events.COMPLETE, () => {
            for(let i=0; i<this.currentDeck.cards.length; i++){
                let ci = this.currentDeck.cards[i].cardInfo;
                this.currentDeck.cards[i].setPlaceholderEntry(this.createDeckCardEntry(ci, i, true, this.currentDeck.cards[i].amount));
                this.currentDeck.cards[i].setDeckbuilderEntry(this.createDeckCardEntry(ci, i, false, this.currentDeck.cards[i].amount));
            }
            this.updateDeckCardEntries();
        });
        loader.start();
    }

    /** FUNCTION TO UPDATE THE DECK TYPE */
    updateDeckColors() {
        //Update icons
        this.hideTypeImages();
        if(this.currentDeck.colors.length === 0){
            this.decknameBackground.setBackgroundColor(COLOR_ENUMS.OP_ORANGE);
        } else {
            this.setTypeImage(GameClient.utils.getCardSymbol(this.currentDeck.colors, 1));

            if(this.currentDeck.colors.length === 1) {
                this.decknameBackground.setBackgroundColor(GameClient.utils.getCardColor(this.currentDeck.colors[0]));
            } else {
                this.getNameBackground().setDoubleBackgroundColor(GameClient.utils.getCardColor(this.currentDeck.colors[0]), GameClient.utils.getCardColor(this.currentDeck.colors[1]));
            }
        }
    }

    /** HIDE TYPE IMAGE */
    hideTypeImages() {
        if(this.typeImage !== null) this.typeImage.setVisible(false);
    }

    /** SET TYPE IMAGE 
     * @param {String} type
    */
    setTypeImage(type) {
        if(this.typeImage === null){
            this.typeImage = this.scene.add.image(this.deckDropZone.x-this.deckDropZone.width/2 + 30, this.deckTitle.y, type).setScale(0.8).setOrigin(0.5,0.5);
        } else {
            this.typeImage.setTexture(type).setScale(0.8).setOrigin(0.5,0.5);
        }
        this.typeImage.setVisible(true);
    }

    /** SET THE DECK TITLE ENTRIES 
    */
    setDeckTitle (deckTitle) {
        this.deckTitle = deckTitle;
        this.obj.push(this.deckTitle);
    }

    /** CREATE A DECK CARD ENTRY */
    createDeckCardEntry(card, position, isPlaceholder, amount) {
        let cardname = card.name;

        //let startY = this.deckDropZone.y - this.deckDropZone.height/2 + DECKCARD_ENTRY_HEIGHT/2 + 5;
        let startY = DECKCARD_ENTRY_HEIGHT/2;
        let currentY = startY + (position * DECKCARD_ENTRY_HEIGHT) + (Math.max(position-1, 0) * DECKCARD_ENTRY_INTERSPACE);

        let deckEntry = new DeckCardEntry({
            entryindex: position,
            cardInfo: card,
            x: this.width/2,
            y: currentY,
            width: DECKCARD_ENTRY_WIDTH,
            height: DECKCARD_ENTRY_HEIGHT,
            backgroundcolor: COLOR_ENUMS.OP_CREAM,
            bordercolor: GameClient.utils.getCardColor(card.colors[0]),
            name: cardname,
            amount: amount,
            art: card.art,
            cardtype: card.card,
            type: GameClient.utils.getCardSymbol(card.colors, false),
            cost: GameClient.utils.getCardCost(card.colors[0], card.cost),
            attribute: GameClient.utils.getCardAttributeSymbol(card.attribute),
            isleader: card.isleader
        }, this);
        //this.scrollContainer.add(deckEntry);
        this.scrollContainer.addElement(deckEntry);

        if(!isPlaceholder) {
            let maskBounds = new Phaser.Geom.Rectangle(
                this.scrollContainer.x,
                this.scrollContainer.y,
                this.width * 2 - 10,
                this.height - 35 - 30 - 10
            );

            deckEntry.setInteractive();
            deckEntry.on('pointerdown', (pointer) => {
                if(pointer.rightButtonDown()) {
                    deckEntry.deckCardListContainer.removeCardFromDeck(deckEntry.entryIndex);
                }
            });

            this.scene.input.setDraggable(deckEntry);

            deckEntry.on('pointerout', (pointer) =>  {
                this.scene.updateTooltip({visible: false});
            });
            deckEntry.on('pointerover', (pointer) => { 
                let cardToolTipConfig = {};
                if(!this.scene.isDragging){
                    let worldPosition = this.scrollContainer.convertToWorldPosition(deckEntry.x, deckEntry.y);
                    let positionx = worldPosition.x - deckEntry.width - (deckEntry.width*0.5/2);

                    cardToolTipConfig.cardData = deckEntry.cardData;
                    cardToolTipConfig.positionx = positionx;
                    cardToolTipConfig.positiony = worldPosition.y;
                    cardToolTipConfig.rightside = -1;
                    cardToolTipConfig.visible = true;
                } else {
                    cardToolTipConfig.visible = false;
                }
                this.scene.updateTooltip(cardToolTipConfig);
            });
        }

        return deckEntry;
    }

    /** REMOVE CARD FROM DECK FUNCTION */
    removeCardFromDeck(entryIndex) {
        let resultCode = this.currentDeck.removeCardAt(entryIndex);

        switch(resultCode) {
            case ERROR_CODES.DECREASED_CARD_AMOUNT:
                this.scene.updateDeckColors();
                break;
            case ERROR_CODES.REMOVED_CARD:
                this.updateDeckCardEntries(); //-1 because no cardi required when removing
                this.scene.updateDeckColors();
                break;
            case ERROR_CODES.CANNOT_REMOVE_LEADER:
                this.scene.createDialog(this.scene, 'Oops', 'Can only remove Leader last!')
                .setPosition(this.scene.cameras.main.worldView.x + this.scene.cameras.main.width / 2, this.scene.cameras.main.worldView.y + this.scene.cameras.main.height / 2)
                .layout()
                .modalPromise({
                    manualClose: true,
                    duration: {
                        in: 500,
                        out: 500
                    }
                })
                .then(function (data) {});  
                break;
        }
        return resultCode;
    }

    /** UPDATE THE DECK CARD ENTRIES IN THE DECK LIST */
    updateDeckCardEntries() {
        let startY = DECKCARD_ENTRY_HEIGHT/2;
        let maskBounds = new Phaser.Geom.Rectangle(
            this.scrollContainer.x,
            this.scrollContainer.y,
            this.width * 2 - 10,
            this.height - 35 - 30 - 10
        );

        let addedEntry = null;

        //First remove the tooltip
        this.scene.updateTooltip({visible: false});

        //reorder visual card entries
        for(let i=0; i<this.currentDeck.cards.length; i++) {
            let card = this.currentDeck.cards[i];
            if(card.deckBuilderEntry === null) { //if no visual entry exists for the card
                card.setPlaceholderEntry(this.createDeckCardEntry(card.cardInfo, i, true, card.amount));
                card.setDeckbuilderEntry(this.createDeckCardEntry(card.cardInfo, i, false, card.amount));

                addedEntry = card;
            }

            let currentY = startY + (i * DECKCARD_ENTRY_HEIGHT) + (Math.max(i-1, 0) * DECKCARD_ENTRY_INTERSPACE);

            card.update_entryPosition(currentY, i);
        }
        this.scrollContainer.updateScrollcontainer();
    }
}