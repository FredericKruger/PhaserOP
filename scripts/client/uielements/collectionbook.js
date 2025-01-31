const maxCardsPerPage =  8;
const maxCardsPerCol = 2;

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

        this.tabs = new RexPlugins.UI.Tabs( this.scene, {
            x: config.x + config.width/2, //900
            y: config.y + config.height/2,

            panel: this.scene.add.rexRoundRectangle(0, 0, config.width, config.height, 20, OP_CREAM),

            topButtons: [
                this.createCollectionBookTab(this.scene, 0, OP_RED, 'op_RED_symbol'),
                this.createCollectionBookTab(this.scene, 0, OP_GREEN, 'op_GREEN_symbol'),
                this.createCollectionBookTab(this.scene, 0, OP_BLUE, 'op_BLUE_symbol'),
                this.createCollectionBookTab(this.scene, 0, OP_PURPLE, 'op_PURPLE_symbol'),
                this.createCollectionBookTab(this.scene, 0, OP_BLACK, 'op_BLACK_symbol'),
                this.createCollectionBookTab(this.scene, 0, OP_YELLOW, 'op_YELLOW_symbol')
            ],

            space: {
                top: 5,
                topButtonsOffset: 5,
                topButton: 5
            }
        });

        /** INITIALIZE TABS */
        /*for(let i=0; i<GameClient.playerCollection.colorCardInfo.length; i++) {
            if(GameClient.playerCollection.colorCardInfo[i].totalPages === 0) {
                this.tabs.hideButton('top', i);
                GameClient.playerCollection.colorCardInfo[i].hidden = true;
            }
        }*/

        this.updateMinMaxPage();
        this.tabs.layout();
        this.tabs.setOrigin(0.5, 0.5);

        this.tabs.on('button.click', function (button, groupName, index) {
            let collectionBook = this.scene.collectionBook;
            //set color, and page and text
            collectionBook.selectedColor = index+1;

            //this means we got here by pressing the backPage button
            if(collectionBook.currentColorPage<1) {
                collectionBook.currentColorPage = GameClient.playerCollection.colorCardInfo[index].totalPages;
            } else {
                collectionBook.currentPage = GameClient.playerCollection.colorCardInfo[index].startPage;
                collectionBook.currentColorPage = 1;
            }

            collectionBook.updateCardVisuals();
            collectionBook.updatePageTitle();

            //handle coloring of the tabs
            if (this._prevTypeButton) {
                this._prevTypeButton.getElement('icon').setTint(OP_WHITE, OP_WHITE, OP_WHITE);
            }
            button.getElement('icon').setTint();
            
            this._prevTypeButton = button;
            if (this._prevSortButton === undefined) {
                return;
            }
        }, this.tabs);

        /** ADD CARD PLACEHOLDERS */
        let bookCardAreaWidth = 260;
        let bookCardAreaHeight = 300;

        let startX = this.tabs.x - bookCardAreaWidth - bookCardAreaWidth/2;
        let startY = this.tabs.y - bookCardAreaHeight/2 - 25;

        for(let i = 0; i<maxCardsPerPage; i++){
            let config = {
                x: startX + (bookCardAreaWidth * (i % (maxCardsPerPage/maxCardsPerCol))),
                y: startY + ((bookCardAreaHeight + 75) * Math.floor(i / (maxCardsPerPage/maxCardsPerCol))),
                scale: 0.35,
                bookCardAreaWidth: bookCardAreaWidth,
                bookCardAreaHeight: bookCardAreaHeight
            };
            let c = new CollectionBookCardEntry(this, i, config);
            this.collectionBookCardEntries.push(c);
        }

        /** PAGE TITLE */
        this.pageTitle = this.scene.add.image(this.tabs.x, 80, '').setOrigin(0.5, 0).setScale(0.5);
        this.pageTitle.setOrigin(0.5, 0);

        /** SEPARATION LINES */
        this.fileSeparatorLine = this.scene.add.graphics();
        this.fileSeparatorLine.lineStyle(4, OP_CREAM_DARKER, 8);
        this.fileSeparatorLine.beginPath();
        this.fileSeparatorLine.moveTo(0, 0);
        this.fileSeparatorLine.lineTo(this.tabs.width, 0);
        this.fileSeparatorLine.closePath();
        this.fileSeparatorLine.strokePath();

        // Position the line at the bottom of the panel
        this.fileSeparatorLine.setPosition(this.tabs.x - this.tabs.width / 2, this.tabs.y + this.tabs.height / 2 - 60); // Adjust the y position as needed
        this.objToUpdate.push(this.fileSeparatorLine);

        this.titleSeparatorLine = this.scene.add.graphics();
        this.titleSeparatorLine.lineStyle(4, OP_CREAM_DARKER, 8);
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
                'rightarrow',
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
                'leftarrow'
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
        for(let i = 0; i<maxCardsPerPage; i++) {
            let cardi = (this.currentColorPage-1) * maxCardsPerPage + i;
            cardi = Math.max(cardi, 0);
            if(cardi<GameClient.playerCollection.colorCardIndex[this.selectedColor-1].length) {
                let cardInfo = GameClient.playerCollection.getCardFromPage(this.selectedColor-1, cardi);
                this.collectionBookCardEntries[i].updateCardInfo(cardInfo);
                
                let cardArtKey = cardInfo.art
                if(!this.scene.cache.game.textures.list[cardArtKey]){
                    numberOfArtLoads++;
                    loader.image(cardArtKey, 'assets/cardart/' + cardArtKey + '.png'); //load image
                    loader.image('deckentry_' + cardArtKey, 'assets/deckentryart/deckentry_' + cardArtKey + '.png'); //load deck entry preemtiveley to avvoid errors later
                }  
            } else {
                this.collectionBookCardEntries[i].updateCardInfo(null);
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
            this.pageTitle.setTexture('op_font_' + CARD_COLORS[this.selectedColor-1]);
        }
    }

    /** UPDATE THE TRACKER FOR WHAT THE BOTTOM AND TOP PAGE OF THE TAB WILL BE */
    updateMinMaxPage () {
        for(let i = 0; i<GameClient.playerCollection.colorCardInfo.length; i++){
            if(!GameClient.playerCollection.colorCardInfo[i].hidden) {
                this.pageMin = GameClient.playerCollection.colorCardInfo[i].startPage;
                break;
            }
        }

        for(let i = GameClient.playerCollection.colorCardInfo.length-1; i>=0; i--){
            if(!GameClient.playerCollection.colorCardInfo[i].hidden) {
                this.pageMax = GameClient.playerCollection.colorCardInfo[i].startPage + GameClient.playerCollection.colorCardInfo[i].totalPages-1;
                break;
            }
        }
    }

    /** INITI SELECTED COLOR */
    initSelectedColor () {
        for(let i = 0; i<GameClient.playerCollection.colorCardInfo.length; i++){
            if(!GameClient.playerCollection.colorCardInfo[i].hidden) {
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
            icon: scene.add.image(0, 0, symbol).setScale(0.3).setOrigin(0).setTint(OP_WHITE, OP_WHITE, OP_WHITE),
            space: {
                bottom: 0,//-110,
                left: 12
            }
        });
    }

    /** CREATE FILTER PANEL */
    createFilterPanel() {
        //Add cost images
        let startX = this.tabs.x - this.tabs.width/2 + 300;
        let startY = this.tabs.y + this.tabs.height / 2 - 30;
        let separatorWidth = 10;
        for(let i=0; i<10; i++) {
            let costImage = this.scene.add.image(startX, startY, 'op_cost_PURPLE_' + i).setOrigin(0.5).setScale(0.5);
            this.objToUpdate.push(costImage);

            this.costFilterImages.push({
                id: i,
                image: costImage,
                isPressed: false   
            });

            costImage.setInteractive();
            costImage.on('pointerover', () => {costImage.setScale(0.55)});
            costImage.on('pointerout', () => {costImage.setScale(0.5)});
            costImage.on('pointerdown', () => {
                if(this.costFilterImages[i].isPressed) {
                    this.costFilterImages[i].isPressed = false;
                    this.costFilterImages[i].image.resetPipeline();
                    GameClient.playerCollection.removeFilter({type:'cost',value:i});
                } else {
                    this.costFilterImages[i].isPressed = true;
                    this.costFilterImages[i].image.setPipeline('PurpleToOrangePipeline');
                    GameClient.playerCollection.addFilter({type:'cost',value:i});
                }
                this.updateMinMaxPage();
                this.updateCardVisuals();
            });

            startX = startX + costImage.width*0.5 + separatorWidth;
        }
    }

    /** UPDATE DECK TYPE ARRAY */
    updateDeckColors(colors) {
        let pageChanged = false;
        if(colors.length > 0) {
            for(let i=0; i<CARD_COLORS.length; i++) {
                if(!colors.includes(CARD_COLORS[i])) {
                    this.tabs.hideButton('top', i);
                    GameClient.playerCollection.colorCardInfo[i].hidden = true;
                }
                else {
                    if(!pageChanged) {
                        pageChanged = true;
                        this.currentColorPage = 1;
                        this.currentPage = GameClient.playerCollection.colorCardInfo[i].startPage;
                        this.selectedColor = i+1;
                    }
                }
            }
        } else {
            for(let i=0; i<GameClient.playerCollection.colorCardInfo.length; i++) {
                if(GameClient.playerCollection.colorCardInfo[i].numberCards === 0) {
                    this.tabs.hideButton('top', i);
                    GameClient.playerCollection.colorCardInfo[i].hidden = true;
                } else {
                    this.tabs.showButton('top', i);
                    GameClient.playerCollection.colorCardInfo[i].hidden = false;
                }
            }
        }
        this.tabs.layout();
        this.updateMinMaxPage();
        this.updateCardVisuals();
    } 

    /** NEXT PAGE FUNCTION */
    flipNextPage() {
        if(this.currentPage < this.pageMax) {
            this.currentColorPage++;
            this.currentPage++;

            //if reached the total pages, we need to change page
            if(this.currentColorPage > GameClient.playerCollection.colorCardInfo[this.selectedColor-1].totalPages){
                //find the next non empty color
                let nextcolor = this.selectedColor-1;
                for(let i = this.selectedColor; i<(GameClient.playerCollection.colorCardInfo.length); i++) {
                    if(GameClient.playerCollection.colorCardInfo[i].totalPages>0 && !GameClient.playerCollection.colorCardInfo[i].hidden){
                        nextcolor = i;
                        break;
                    }
                }

                //if found new color
                if(nextcolor !== this.selectedColor-1){
                    this.currentColorPage = 1;
                    this.currentPage = GameClient.playerCollection.colorCardInfo[nextcolor].startPage;
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
                    if(GameClient.playerCollection.colorCardInfo[i].totalPages>0 && !GameClient.playerCollection.colorCardInfo[i].hidden){
                        prevcolor = i;
                        break;
                    }
                }

                //if found new color
                if(prevcolor !== this.selectedColor-1){
                    this.currentPage = GameClient.playerCollection.colorCardInfo[prevcolor].startPage + GameClient.playerCollection.colorCardInfo[prevcolor].totalPages - 1
                    this.tabs.emitButtonClick('top', prevcolor);
                }
            }

            this.updateCardVisuals();
        }
    }

}
