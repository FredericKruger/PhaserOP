
class CollectionBook {

    constructor (config, scene) {

        this.scene = scene;

        this.selectedCard = 0;

        this.pageMax = 1;
        this.pageMin = 1;
        this.currentPage = 1;
        this.currentColorPage = 1;
        this.selectedColor = 1;

        this.objToUpdate = [];
        this.collectionBookCardEntries = [];

        this.costFilterImages = [];
        this.attributeFilterImages = [];
        this.setFilterImages = [];

        // @ts-ignore
        this.tabs = new RexPlugins.UI.Tabs( this.scene, {
            x: config.x + config.width/2, //900
            y: config.y + config.height/2,

            panel: this.scene.add.rexRoundRectangle(0, 0, config.width, config.height, 20, COLOR_ENUMS.OP_CREAM),

            topButtons: [
                this.createCollectionBookTab(this.scene, 0, COLOR_ENUMS.OP_RED, ASSET_ENUMS.ICON_SYMBOL_RED),
                this.createCollectionBookTab(this.scene, 0, COLOR_ENUMS.OP_GREEN, ASSET_ENUMS.ICON_SYMBOL_GREEN),
                this.createCollectionBookTab(this.scene, 0, COLOR_ENUMS.OP_BLUE, ASSET_ENUMS.ICON_SYMBOL_BLUE),
                this.createCollectionBookTab(this.scene, 0, COLOR_ENUMS.OP_PURPLE, ASSET_ENUMS.ICON_SYMBOL_PURPLE),
                this.createCollectionBookTab(this.scene, 0, COLOR_ENUMS.OP_BLACK, ASSET_ENUMS.ICON_SYMBOL_BLACK),
                this.createCollectionBookTab(this.scene, 0, COLOR_ENUMS.OP_YELLOW, ASSET_ENUMS.ICON_SYMBOL_YELLOW)
            ],

            space: {
                top: 5,
                topButtonsOffset: 5,
                topButton: 5
            }
        });

        this.updateMinMaxPage(); //Update min max values
        this.tabs.layout(); //Layout the tabs
        this.tabs.setOrigin(0.5, 0.5); //Set the origin of the tabs

        //Handle the button click event
        this.tabs.on('button.click', (button, groupName, index) => {
            //set color, and page and text
            this.selectedColor = index+1;

            //this means we got here by pressing the backPage button
            if(this.currentColorPage<1) {
                this.currentColorPage = this.scene.game.gameClient.playerCollection.colorCardData[index].totalPages;
            } else {
                this.currentPage = this.scene.game.gameClient.playerCollection.colorCardData[index].startPage;
                this.currentColorPage = 1;
            }

            this.updateCardVisuals(); //update the visuals
            this.updatePageTitle();

            //handle coloring of the tabs
            if (this.tabs._prevTypeButton) {
                this.tabs._prevTypeButton.getElement('icon').setTint(COLOR_ENUMS.OP_WHITE, COLOR_ENUMS.OP_WHITE, COLOR_ENUMS.OP_WHITE);
            }
            button.getElement('icon').setTint();
            
            this.tabs._prevTypeButton = button;
            if (this.tabs._prevSortButton === undefined) {
                return;
            }
        });

        /** ADD CARD PLACEHOLDERS */
        let startX = this.tabs.x - GAME_ENUMS.BOOK_CARD_WIDTH - GAME_ENUMS.BOOK_CARD_WIDTH/2;
        let startY = this.tabs.y - GAME_ENUMS.BOOK_CARD_HEIGHT/2 - 25;

        for(let i = 0; i<GAME_ENUMS.MAX_CARDS_PER_PAGE; i++){
            let config = {
                x: startX + (GAME_ENUMS.BOOK_CARD_WIDTH * (i % (GAME_ENUMS.MAX_CARDS_PER_PAGE/GAME_ENUMS.MAX_CARDS_PER_COL))),
                y: startY + ((GAME_ENUMS.BOOK_CARD_HEIGHT + 75) * Math.floor(i / (GAME_ENUMS.MAX_CARDS_PER_PAGE/GAME_ENUMS.MAX_CARDS_PER_COL))),
                scale: 0.35,
                bookCardAreaWidth: GAME_ENUMS.BOOK_CARD_WIDTH,
                bookCardAreaHeight: GAME_ENUMS.BOOK_CARD_HEIGHT
            };
            let c = new CollectionBookCardEntry(this, i, config);
            this.collectionBookCardEntries.push(c);
        }

        /** PAGE TITLE */
        let roundedRect = this.scene.add.graphics();
        roundedRect.fillStyle(COLOR_ENUMS.OP_CREAM_DARKER, 1); // Black color with 50% opacity
        roundedRect.fillRoundedRect(this.tabs.x-100, 75, 200, 50, 10); // 10 is padding, 15 is corner radius
        this.pageTitle = this.scene.add.image(this.tabs.x, 80, '').setOrigin(0.5, 0).setScale(0.5);
        this.pageTitle.setOrigin(0.5, 0);

        /** PAGE NUMBER */
        this.pageNumber = {
            obj: this.scene.add.text(this.tabs.x, this.tabs.y + this.tabs.height / 2 - 80, '', {
                fontSize: '25px',
                color: COLOR_ENUMS_CSS.OP_BLACK,
                fontWeight: 'bold' // Make the text bold
            }).setOrigin(0.5),
            collectionBook: this,
            update: function() {
                this.obj.setText('Page ' + this.collectionBook.currentPage);
            }
        };
        this.objToUpdate.push(this.pageNumber);

        /** SEPARATION LINES */
        this.fileSeparatorLine = this.scene.add.graphics();
        this.fileSeparatorLine.lineStyle(4, COLOR_ENUMS.OP_CREAM_DARKER, 8);
        this.fileSeparatorLine.beginPath();
        this.fileSeparatorLine.moveTo(0, 0);
        this.fileSeparatorLine.lineTo(this.tabs.width, 0);
        this.fileSeparatorLine.closePath();
        this.fileSeparatorLine.strokePath();

        // Position the line at the bottom of the panel
        this.fileSeparatorLine.setPosition(this.tabs.x - this.tabs.width / 2, this.tabs.y + this.tabs.height / 2 - 60); // Adjust the y position as needed
        this.objToUpdate.push(this.fileSeparatorLine);

        this.titleSeparatorLine = this.scene.add.graphics();
        this.titleSeparatorLine.lineStyle(4, COLOR_ENUMS.OP_CREAM_DARKER, 8);
        this.titleSeparatorLine.beginPath();
        this.titleSeparatorLine.moveTo(0, 0);
        this.titleSeparatorLine.lineTo(this.tabs.width, 0);
        this.titleSeparatorLine.closePath();
        this.titleSeparatorLine.strokePath();

        // Position the line at the bottom of the panel
        this.titleSeparatorLine.setPosition(this.tabs.x - this.tabs.width / 2, this.pageTitle.y + this.pageTitle.height + 15); // Adjust the y position as needed
        this.objToUpdate.push(this.titleSeparatorLine);

        /** NEXT PAGE BUTTON */
        this.nextPageButton = {
            obj:this.scene.add.image(
                this.tabs.x + this.tabs.width/2 - 194*0.2*0.4, this.tabs.y,
                ASSET_ENUMS.ARROW_RIGHT,
            ).setScale(0.4).setOrigin(0.5,0.5),
            collectionBook: this,
            update: function() {
                if(this.collectionBook.currentPage < this.collectionBook.pageMax) {
                    this.obj.setInteractive();
                    this.obj.setVisible(true);
                } else {
                    this.obj.disableInteractive();
                    this.obj.setVisible(false);
                }
            }
        }
        this.nextPageButton.obj.setInteractive();
        this.nextPageButton.obj.on('pointerdown', this.flipNextPage, this);
        this.nextPageButton.obj.on('pointerover', () => {this.nextPageButton.obj.setScale(0.45);});
        this.nextPageButton.obj.on('pointerout', () => {this.nextPageButton.obj.setScale(0.4);});
        this.objToUpdate.push(this.nextPageButton);

        /** PREVIOUS PAGE BUTTON */
        this.prevPageButton = {
            obj:this.scene.add.image(
                this.tabs.x - this.tabs.width/2 + 194*0.2*0.4, this.tabs.y,
                ASSET_ENUMS.ARROW_LEFT
            ).setScale(0.4).setOrigin(0.5,0.5),
            collectionBook: this,
            update: function() {
                if(this.collectionBook.currentPage > this.collectionBook.pageMin) {
                    this.obj.setInteractive();
                    this.obj.setVisible(true);            
                } else {
                    this.obj.disableInteractive();
                    this.obj.setVisible(false);
                }
            }
        }
        //this.prevPageButton.obj.setVisible(false);
        this.prevPageButton.obj.setInteractive();
        this.prevPageButton.obj.on('pointerdown', this.flipPreviousPage, this);
        this.prevPageButton.obj.on('pointerover', () => {this.prevPageButton.obj.setScale(0.45);});
        this.prevPageButton.obj.on('pointerout', () => {this.prevPageButton.obj.setScale(0.4);});
        this.objToUpdate.push(this.prevPageButton);

        //Create filter panel
        this.searchInput = null;
        this.createFilterPanel();

        this.initSelectedColor();
        this.updatePageTitle();
        this.updateCardVisuals();
    }

    /** UPDATE FUNCTION */
    update() {
        for(let o of this.objToUpdate) {
            o.update();
        }
    }

    /** FUNCTION THAT REFRESHES THE CARD PLACEHOLDERS */
    updateCardVisuals() {
        /** preload new art */
        let numberOfArtLoads = 0;
        let loader = new Phaser.Loader.LoaderPlugin(this.scene); //create a loader 
        for(let i = 0; i<GAME_ENUMS.MAX_CARDS_PER_PAGE; i++) {
            let cardi = (this.currentColorPage-1) * GAME_ENUMS.MAX_CARDS_PER_PAGE + i;
            cardi = Math.max(cardi, 0);
            if(cardi<this.scene.game.gameClient.playerCollection.colorCardIndex[this.selectedColor-1].length) {
                let cardData = this.scene.game.gameClient.playerCollection.getCardFromPage(this.selectedColor-1, cardi);
                this.collectionBookCardEntries[i].updateCardData(cardData);
                
                let cardArtKey = cardData.art
                if(!this.scene.cache.game.textures.list[cardArtKey]){
                    numberOfArtLoads++;
                    loader.image(cardArtKey, `assets/cardart/${cardArtKey}.png`); //load image
                    loader.image(`deckentry_${cardArtKey}`, `assets/deckentryart/deckentry_${cardArtKey}.png`); //load deck entry preemtiveley to avvoid errors later
                }  
            } else {
                this.collectionBookCardEntries[i].updateCardData(null);
            }
            loader.once(Phaser.Loader.Events.COMPLETE, () => {
                for(let bookEntry of this.collectionBookCardEntries) bookEntry.update();
            });
            loader.start();
        }
    }

    /** FUNCTION TO UPDATE THE PAGE TITLE */
    updatePageTitle() {
        if(this.pageTitle !== null) {
            this.pageTitle.setTexture(`ICON_FONT_${GAME_ENUMS.CARD_COLORS[this.selectedColor-1]}`);
        }
    }

    /** UPDATE THE TRACKER FOR WHAT THE BOTTOM AND TOP PAGE OF THE TAB WILL BE */
    updateMinMaxPage () {
        for(let i = 0; i<this.scene.game.gameClient.playerCollection.colorCardData.length; i++){
            if(!this.scene.game.gameClient.playerCollection.colorCardData[i].hidden) {
                this.pageMin = this.scene.game.gameClient.playerCollection.colorCardData[i].startPage;
                break;
            }
        }

        for(let i = this.scene.game.gameClient.playerCollection.colorCardData.length-1; i>=0; i--){
            if(!this.scene.game.gameClient.playerCollection.colorCardData[i].hidden) {
                this.pageMax = this.scene.game.gameClient.playerCollection.colorCardData[i].startPage + this.scene.game.gameClient.playerCollection.colorCardData[i].totalPages-1;
                break;
            }
        }
    }

    /** INITI SELECTED COLOR */
    initSelectedColor () {
        for(let i = 0; i<this.scene.game.gameClient.playerCollection.colorCardData.length; i++){
            if(!this.scene.game.gameClient.playerCollection.colorCardData[i].hidden) {
                this.selectedColor = i+1;
                break;
            }
        }
    }

    /** CREATE TAB FUNCTION */
    createCollectionBookTab (scene, direction, color, symbol) {
        let radius;
        switch (direction) {
            case 0:
                radius = {
                    tl: 10,
                    tr: 10
                }
                break;
        }
        let backgroundColor = color;

        return scene.rexUI.add.label({
            width: 60,
            height: 50,
            background: scene.rexUI.add.roundRectangle(0, 0, 50, 50, radius, backgroundColor),
            icon: scene.add.image(0, 0, symbol).setScale(0.3).setOrigin(0).setTint(COLOR_ENUMS.OP_WHITE, COLOR_ENUMS.OP_WHITE, COLOR_ENUMS.OP_WHITE),
            space: {
                bottom: 0,//-110,
                left: 12
            }
        });
    }

    /** CREATE FILTER PANEL */
    createFilterPanel() {
        //Add set Icon
        let setIcon = this.scene.add.image(this.tabs.x - this.tabs.width/2 + 50, this.tabs.y + this.tabs.height / 2 - 30, ASSET_ENUMS.ICON_COLLECTION_SET).setOrigin(0.5).setScale(0.6);
        //Create the set scrollpanel
        let backgroundConfig = {backgroundColor: COLOR_ENUMS.OP_CREAM_DARKER, alpha: 0.8, round:0};
        let setFilterScrollPanel = new ScrollPanel(this.scene, this.tabs.x - this.tabs.width/2 + 50 - setIcon.width/2*0.6, this.tabs.y + this.tabs.height / 2 - 65 - 200, 150, 200, true, backgroundConfig);
        
        setIcon.setInteractive();
        setIcon.on('pointerover', () => {setIcon.setScale(0.65)});
        setIcon.on('pointerout', () => {setIcon.setScale(0.6)});
        setIcon.on('pointerdown', () => {setFilterScrollPanel.setVisible(!setFilterScrollPanel.isVisible)});

        //Add set images
        let startY = 22;
        for(let i=0; i<GAME_ENUMS.CARD_SETS.length; i++) {
            let setImage = this.scene.add.image(75, startY, `SET_FILTER_${GAME_ENUMS.CARD_SETS[i]}`).setScale(0.45);
            setFilterScrollPanel.addElement(setImage);

            this.setFilterImages.push({
                id: GAME_ENUMS.CARD_SETS[i],
                image: setImage,
                isPressed: false   
            });
            setImage.setInteractive();
            setImage.on('pointerover', () => {setImage.setScale(0.47)});
            setImage.on('pointerout', () => {setImage.setScale(0.45)});
            setImage.on('pointerdown', () => {
                if(this.setFilterImages[i].isPressed) {
                    this.setFilterImages[i].isPressed = false;
                    this.setFilterImages[i].image.resetPipeline();
                    this.scene.game.gameClient.playerCollection.removeFilter({type:'set',value:GAME_ENUMS.CARD_SETS[i]});
                } else {
                    this.setFilterImages[i].isPressed = true;
                    this.setFilterImages[i].image.setPipeline(PIPELINE_ENUMS.GREYSCALE_PIPELINE);
                    this.scene.game.gameClient.playerCollection.addFilter({type:'set',value:GAME_ENUMS.CARD_SETS[i]});
                }
                this.updateMinMaxPage();
                this.updateCardVisuals();
            });

            startY += 44
        }

        //Add cost images
        let startX = this.tabs.x - this.tabs.width/2 + 120;
        startY = this.tabs.y + this.tabs.height / 2 - 30;
        let separatorWidth = 5;
        for(let i=0; i<10; i++) {
            let costImage = this.scene.add.image(startX, startY, `COST_PURPLE_${i}`).setOrigin(0.5).setScale(0.45);
            costImage.setDepth(1);
            this.objToUpdate.push(costImage);

            this.costFilterImages.push({
                id: i,
                image: costImage,
                isPressed: false   
            });

            costImage.setInteractive();
            costImage.on('pointerover', () => {costImage.setScale(0.5)});
            costImage.on('pointerout', () => {costImage.setScale(0.45)});
            costImage.on('pointerdown', () => {
                if(this.costFilterImages[i].isPressed) {
                    this.costFilterImages[i].isPressed = false;
                    this.costFilterImages[i].image.resetPipeline();
                    this.scene.game.gameClient.playerCollection.removeFilter({type:'cost',value:i});
                } else {
                    this.costFilterImages[i].isPressed = true;
                    this.costFilterImages[i].image.setPipeline(PIPELINE_ENUMS.PURPLE_TO_ORANGE_PIPELINE);
                    this.scene.game.gameClient.playerCollection.addFilter({type:'cost',value:i});
                }
                this.updateMinMaxPage();
                this.updateCardVisuals();
            });

            startX = startX + costImage.width*0.45 + separatorWidth;
        }

        //Create the wrapper for the cost images
        // Create the rounded rectangle
        let roundedRect = this.scene.add.graphics();
        let rectX = this.costFilterImages[0].image.x - this.costFilterImages[0].image.width/2*0.45 - 5;
        let rectY = this.costFilterImages[0].image.y - this.costFilterImages[0].image.height/2*0.45 - 5;
        let rectWidth = this.costFilterImages[9].image.x + this.costFilterImages[9].image.width/2*0.45 + 5 - rectX;
        let rectHeight = this.costFilterImages[0].image.height*0.45 + 10;
        roundedRect.fillStyle(COLOR_ENUMS.OP_CREAM_DARKER, 1); // Black color with 50% opacity
        roundedRect.fillRoundedRect(rectX, rectY, rectWidth, rectHeight, 15); // 10 is padding, 15 is corner radius
        roundedRect.setDepth(0);

        //Add attribute images
        startX = startX + 10;
        for(let i = 0; i<GAME_ENUMS.CARD_ATTRIBUTES.length; i++) {
            let attribute = GAME_ENUMS.CARD_ATTRIBUTES[i];
            let attributeImage = this.scene.add.image(startX, startY, `ICON_ATTRIBUTE_SYMBOL_${attribute}`).setOrigin(0.5).setScale(0.8);
            attributeImage.setDepth(1);
            this.objToUpdate.push(attributeImage);

            this.attributeFilterImages.push({
                id: attribute,
                image: attributeImage,
                isPressed: false   
            });

            attributeImage.setInteractive();
            attributeImage.on('pointerover', () => {attributeImage.setScale(0.85)});
            attributeImage.on('pointerout', () => {attributeImage.setScale(0.8)});
            attributeImage.on('pointerdown', () => {
                if(this.attributeFilterImages[i].isPressed) {
                    this.attributeFilterImages[i].isPressed = false;
                    this.attributeFilterImages[i].image.resetPipeline();
                    this.scene.game.gameClient.playerCollection.removeFilter({type:'attribute',value:attribute});
                } else {
                    this.attributeFilterImages[i].isPressed = true;
                    this.attributeFilterImages[i].image.setPipeline(PIPELINE_ENUMS.GREYSCALE_PIPELINE);
                    this.scene.game.gameClient.playerCollection.addFilter({type:'attribute',value:attribute});
                }
                this.updateMinMaxPage();
                this.updateCardVisuals();
            });

            startX = startX + attributeImage.width*0.8 + separatorWidth;
        }

        //Create the wrapper for the cost images
        // Create the rounded rectangle
        roundedRect = this.scene.add.graphics();
        rectX = this.attributeFilterImages[0].image.x - this.attributeFilterImages[0].image.width/2*0.8 - 5;
        rectWidth = this.attributeFilterImages[this.attributeFilterImages.length-1].image.x + this.attributeFilterImages[0].image.width/2*0.8 + 5 - rectX;
        roundedRect.fillStyle(COLOR_ENUMS.OP_CREAM_DARKER, 1); // Black color with 50% opacity
        roundedRect.fillRoundedRect(rectX, rectY, rectWidth, rectHeight, 15); // 10 is padding, 15 is corner radius
        roundedRect.setDepth(0);

        rectX = rectX + rectWidth + 10;
        rectY = rectY + rectHeight/2;
        rectWidth = this.tabs.x + this.tabs.width/2 - rectX - 10;
        rectX = rectX + rectWidth/2;
        //Create the search bar 
        this.searchInput = this.scene.rexUI.add.textBox({
            x: rectX,
            y: rectY,
            width: rectWidth,
            height: rectHeight, 
            background: this.scene.rexUI.add.roundRectangle(0, 0, 0, 0, 15, COLOR_ENUMS.OP_CREAM_DARKER),
            icon: this.scene.add.image(0, 0, ASSET_ENUMS.ICON_SEARCH).setScale(0.5),
            text: this.scene.rexUI.add.BBCodeText(50, 0, 'Search', {
                fontSize: '20px',
                fixedWidth: rectWidth-60,
                fixedHeight: rectHeight-20,
                valign: 'center',
                color: COLOR_ENUMS_CSS.OP_BLACK
            }),
            space: {
                icon: 10, // Space between icon and text
                left: 10,
                right: 0,
                top: 0,
                bottom: 0
            },
            type: 'textArea',
            editable: true
        }).layout();
    }

    /** UPDATE DECK TYPE ARRAY */
    updateDeckColors(colors) {
        let firstColorIndex = -1;

        if(colors.length > 0) {
            for(let i=0; i<GAME_ENUMS.CARD_COLORS.length; i++) {
                if(!colors.includes(GAME_ENUMS.CARD_COLORS[i])) {
                    this.tabs.hideButton('top', i);
                    this.scene.game.gameClient.playerCollection.colorCardData[i].hidden = true;
                } else if (firstColorIndex === -1) firstColorIndex = i;
            }
            if(!colors.includes(GAME_ENUMS.CARD_COLORS[this.selectedColor-1])) {
                this.currentColorPage = 1;
                this.currentPage = this.scene.game.gameClient.playerCollection.colorCardData[firstColorIndex].startPage;
                this.selectedColor = firstColorIndex+1;

            }
        } else {
            for(let i=0; i<this.scene.game.gameClient.playerCollection.colorCardData.length; i++) {
                this.tabs.showButton('top', i);
                this.scene.game.gameClient.playerCollection.colorCardData[i].hidden = false;
            }
        }
        this.tabs.layout();
        this.updateMinMaxPage();
        this.updateCardVisuals();
        this.updatePageTitle();
    } 

    /** NEXT PAGE FUNCTION */
    flipNextPage() {
        if(this.currentPage < this.pageMax) {
            this.currentColorPage++;
            this.currentPage++;

            //if reached the total pages, we need to change page
            if(this.currentColorPage > this.scene.game.gameClient.playerCollection.colorCardData[this.selectedColor-1].totalPages){
                //find the next non empty color
                let nextcolor = this.selectedColor-1;
                for(let i = this.selectedColor; i<(this.scene.game.gameClient.playerCollection.colorCardData.length); i++) {
                    if(this.scene.game.gameClient.playerCollection.colorCardData[i].totalPages>0 && !this.scene.game.gameClient.playerCollection.colorCardData[i].hidden){
                        nextcolor = i;
                        break;
                    }
                }

                //if found new color
                if(nextcolor !== this.selectedColor-1){
                    this.currentColorPage = 1;
                    this.currentPage = this.scene.game.gameClient.playerCollection.colorCardData[nextcolor].startPage;
                    this.tabs.emitButtonClick('top', nextcolor);
                }
            }
            this.updateCardVisuals();
        }
    }

    /** PREVIOUS PAGE FUNCTION */
    flipPreviousPage() {
        if(this.currentPage !== 1) {
            this.currentPage--;
            this.currentColorPage--;

            /* need to change page */
            if(this.currentColorPage<1){
                //find the next non empty color
                let prevcolor = this.selectedColor-1; //-1 because index are skewed by 1

                for(let i = prevcolor-1; i>=0; i--) {
                    if(this.scene.game.gameClient.playerCollection.colorCardData[i].totalPages>0 && !this.scene.game.gameClient.playerCollection.colorCardData[i].hidden){
                        prevcolor = i;
                        break;
                    }
                }

                //if found new color
                if(prevcolor !== this.selectedColor-1){
                    this.currentPage = this.scene.game.gameClient.playerCollection.colorCardData[prevcolor].startPage + this.scene.game.gameClient.playerCollection.colorCardData[prevcolor].totalPages - 1
                    this.tabs.emitButtonClick('top', prevcolor);
                }
            }

            this.updateCardVisuals();
        }
    }

}
