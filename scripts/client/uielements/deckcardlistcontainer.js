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
            backgroundcolor: OP_ORANGE,
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
            obj: this.scene.add.text(this.cardAmountTextRectangle.x, this.cardAmountTextRectangle.y-5, '0/' + DECK_LIMIT, {
                fontFamily: 'Brandon',
                font: "20px monospace",
                fill: "#E9E6CE"
            }).setOrigin(0.5, 0.5),
            deckCardListContainer: this,
            update: function () { 
                this.obj.setText(this.deckCardListContainer.currentDeck.deckSize + "/" + DECK_LIMIT);
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
        this.scrollContainer = this.scene.add.container(this.x,this.y+20 + 5);
        this.scrollContainerPosition = {x: this.scrollContainer.x, y:this.scrollContainer.y};
        this.scrollContainerHeight = this.height-35-30;
        this.scrollContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.width * 2 - 10, this.height - 35 - 30 - 10), Phaser.Geom.Rectangle.Contains);
        this.obj.push(this.scrollContainer);
        //Create the maskshape
        this.maskShape = this.scene.add.graphics();
        this.maskShape.fillRect(this.scrollContainer.x, this.scrollContainer.y, this.width*2-10, this.height-35-30-10);
        this.obj.push(this.maskShape);

        this.mask = new Phaser.Display.Masks.GeometryMask(this, this.maskShape)
;       //this.mask.setInvertAlpha(true); // Ensure the mask does not block input events
        //Set mask to the container
        this.scrollContainer.setMask(this.mask);

        //What happens on scrolling
        this.scene.input.on('wheel', (pointer, gameObject, deltaX, deltaY) => {
            this.scrollContainer.y += deltaY/3;
            this.updateScrollcontainer();
            //console.log(this.scrollContainer.y + ' ' + (scrollContainerPosition.y-this.scrollContainer.height) + ' ' + scrollContainerPosition.y + ' ' + this.scrollContainer.height);
             //this.scrollContainer.height
                //let scrollPercent = (this.avatarSelectionPanelY-this.scrollContainer.y) / this.maxContainerHeight;
                //this.scrollbar.y = scrollPercent*(300 - 100 - 5 - 5);
        });

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

    /** UPDATE SCROLLCONTAINER POSITION */
    updateScrollcontainer() {
        this.scrollContainer.y = Phaser.Math.Clamp(this.scrollContainer.y, this.scrollContainerPosition.y-Math.max((this.scrollContainerMaxHeight - this.scrollContainerHeight), 0), this.scrollContainerPosition.y);
    
        //Update interactivity of objects in maskbound
        let maskBounds = {
            top: this.scrollContainerPosition.y,
            bottom: this.scrollContainerPosition.y + this.height - 35 - 30 + 2
        }

        // Check if the card is within the mask bounds
        for(let i=0; i<this.currentDeck.cards.length; i++) {
            let card = this.currentDeck.cards[i];
            //Need to get the worldposition
            let cardEntryBounds = card.deckBuilderEntry.convertToWorldPosition(card.deckBuilderEntry.x, card.deckBuilderEntry.y);
            cardEntryBounds = {
                top: cardEntryBounds.y,
                bottom: cardEntryBounds.y + card.deckBuilderEntry.height
            };
            
            //Check if in bounds
            if (maskBounds.top > cardEntryBounds.top || maskBounds.bottom < cardEntryBounds.bottom) {
                card.deckBuilderEntry.disableInteractive();
            } else {
                card.deckBuilderEntry.setInteractive();
            }
        }
    }

    /** RESET FUNCTION */
    reset() {
        this.scrollDelta = 0;
        this.scrollMax = 0;
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
            let cardArtKey = 'deckentry_' + this.currentDeck.cards[i].cardInfo.art;
            let nbLoads = 0;
            if(!this.scene.textures.exists(cardArtKey)) {
                loader.image(cardArtKey, 'assets/deckentryart/' + cardArtKey + '.png'); // load image
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
            this.decknameBackground.setBackgroundColor(OP_ORANGE);
        } else {
            this.setTypeImage(getCardSymbol(this.currentDeck.colors, 1));

            if(this.currentDeck.colors.length === 1) {
                this.decknameBackground.setBackgroundColor(getCardColor(this.currentDeck.colors[0]));
            } else {
                this.getNameBackground().setDoubleBackgroundColor(getCardColor(this.currentDeck.colors[0]), getCardColor(this.currentDeck.colors[1]));
            }
        }
    }

    /** FUNCTION TO DETERMINE MAX HIGHT OF SCROLLCONTAINER */
    calculateScrollContainerHeight() {
        let maxHeight = 0;
    
        this.scrollContainer.each(function (child) {
            let childBottom = child.y + (child.height || 0) * child.scaleY;
            if (childBottom > maxHeight) {
                maxHeight = childBottom;
            }
        });
    
        return maxHeight;
    }

    /** HIDE TYPE IMAGE */
    hideTypeImages() {
        if(this.typeImage !== null) this.typeImage.setVisible(false);
    }

    /** SET TYPE IMAGE */
    setTypeImage(type) {
        if(this.typeImage === null){
            this.typeImage = this.scene.add.image(this.deckDropZone.x-this.deckDropZone.width/2 + 30, this.deckTitle.y, type).setScale(0.8).setOrigin(0.5,0.5);
        } else {
            this.typeImage.setTexture(type).setScale(0.8).setOrigin(0.5,0.5);
        }
        this.typeImage.setVisible(true);
    }

    /** SET THE DECK TITLE ENTRIES */
    setDeckTitle (deckTitle) {
        this.deckTitle = deckTitle;
        this.obj.push(this.deckTitle);
    }

    /** CREATE A DECK CARD ENTRY */
    createDeckCardEntry(card, position, /*cardi, */isPlaceholder, amount) {
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
            backgroundcolor: OP_CREAM,
            bordercolor: getCardColor(card.colors[0]),
            name: cardname,
            amount: amount,
            art: card.art,
            type: getCardSymbol(card.colors, card.isleader),
            cost: getCardCost(card.colors[0], card.cost),
            attribute: getCardAttributeSymbol(card.attribute),
            isleader: card.isleader
        }, this);
        this.scrollContainer.add(deckEntry);

        if(!isPlaceholder) {
            let maskBounds = new Phaser.Geom.Rectangle(
                this.scrollContainer.x,
                this.scrollContainer.y,
                this.width * 2 - 10,
                this.height - 35 - 30 - 10
            );

            deckEntry.setInteractive();
            deckEntry.on('pointerdown', function(pointer) {
                if(pointer.rightButtonDown()) {
                    this.deckCardListContainer.removeCardFromDeck(this.entryIndex);
                }
            }, deckEntry);

            this.scene.input.setDraggable(deckEntry);

            deckEntry.on('pointerout', function(pointer) {
                this.scene.updateTooltip({visible: false});
            }, deckEntry);
            deckEntry.on('pointerover', function (pointer) { 
                let cardToolTipConfig = {};
                if(!this.scene.isDragging){
                    let positionx = this.worldX - this.width - (this.width*0.5/2);

                    cardToolTipConfig.cardInfo = this.cardInfo;
                    cardToolTipConfig.positionx = positionx;
                    cardToolTipConfig.positiony = this.worldY;
                    cardToolTipConfig.rightside = -1;
                    cardToolTipConfig.visible = true;
                } else {
                    cardToolTipConfig.visible = false;
                }
                this.scene.updateTooltip(cardToolTipConfig);
            }, deckEntry);

            // Check if the card is within the mask bounds
            let cardEntryBounds = deckEntry.getBounds();
            if (maskBounds.contains(cardEntryBounds.left, cardEntryBounds.top) &&
                    maskBounds.contains(cardEntryBounds.right, cardEntryBounds.bottom)) {
                        deckEntry.setInteractive();
            } else {
                deckEntry.disableInteractive();
            }
        }

        return deckEntry;
    }

    /** REMOVE CARD FROM DECK FUNCTION */
    removeCardFromDeck(entryIndex) {
        let resultCode = this.currentDeck.removeCardAt(entryIndex);

        switch(resultCode) {
            case ERRORCODES.REMOVED_CARD:
                this.updateDeckCardEntries(); //-1 because no cardi required when removing
                this.scene.updateDeckColors();
                break;
            case ERRORCODES.CANNOT_REMOVE_LEADER:
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

            // Check if the card is within the mask bounds
            let cardEntryBounds = card.deckBuilderEntry.getBounds();
            if (maskBounds.contains(cardEntryBounds.left, cardEntryBounds.top) &&
                    maskBounds.contains(cardEntryBounds.right, cardEntryBounds.bottom)) {
                card.deckBuilderEntry.setInteractive();
            } else {
                card.deckBuilderEntry.disableInteractive();
            }
        }
        this.scrollContainerMaxHeight = this.calculateScrollContainerHeight();
        this.updateScrollcontainer();
    }
}