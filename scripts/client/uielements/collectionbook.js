const maxCardsPerPage =  8;
const maxCardsPerCol = 2;

class CollectionBook {

    constructor (config, scene) {

        this.scene = scene;

        this.colorCardInfo = this.scene.colorCardInfo;
        this.colorCardIndex = this.scene.colorCardIndex;

        /*const screenCenterX = this.scene.cameras.main.worldView.x + this.scene.cameras.main.width / 2;
        const screenCenterY = this.scene.cameras.main.worldView.y + this.scene.cameras.main.height / 2;
        const screenWidth = this.scene.cameras.main.width;*/

        this.selectedCard = 0;

        this.pageMax = 1;
        this.pageMin = 1;
        this.currentPage = 1;
        this.currentColorPage = 1;
        this.selectedColor = 1;

        this.objToUpdate = [];
        this.cardVisuals = [];

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
        for(let i=0; i<this.colorCardInfo.length; i++) {
            if(this.colorCardInfo[i].totalPages === 0) {
                this.tabs.hideButton('top', i);
                this.colorCardInfo[i].hidden = true;
            }
        }

        this.updateMinMaxPage();
        this.tabs.layout();
        this.tabs.setOrigin(0.5, 0.5);

        this.tabs.on('button.click', function (button, groupName, index) {
            let collectionBook = this.scene.collectionBook;
            //set color, and page and text
            collectionBook.selectedColor = index+1;

            //this means we got here by pressing the backPage button
            if(collectionBook.currentColorPage<1) {
                collectionBook.currentColorPage = collectionBook.colorCardInfo[index].totalPages;
            } else {
                collectionBook.currentPage = collectionBook.colorCardInfo[index].startPage;
                collectionBook.currentColorPage = 1;
            }

            collectionBook.updateCardVisuals();

            if(collectionBook.pageTitle !== null && collectionBook.colorCardIndex[index].length>0) {
                collectionBook.pageTitle.setText(CARD_COLORS[index]);
            }

            //handle coloring of the tabs
            /*if (this._prevTypeButton) {
                this._prevTypeButton.getElement('icon').setTint(OP_WHITE, OP_WHITE, OP_WHITE);
            }
            button.getElement('icon').setTint();*/
            
            this._prevTypeButton = button;
            if (this._prevSortButton === undefined) {
                return;
            }
        }, this.tabs);

        /** ADD CARD PLACEHOLDERS */
        let bookCardAreaWidth = 260;
        let bookCardAreaHeight = 300;

        let o = {
            x: this.tabs.x - bookCardAreaWidth - bookCardAreaWidth/2,
            y: this.tabs.y - bookCardAreaHeight/2
        };
        for(let i = 0; i<maxCardsPerPage; i++){
            let c = {
                index: i,
                firstClickTime: 0,
                cardVisual: null,
                cardPlaceholder: null,
                collectionBook: this,
                update: function() {
                    if(((this.collectionBook.currentColorPage-1) * maxCardsPerPage + this.index) >= this.collectionBook.colorCardInfo[this.collectionBook.selectedColor-1].numberCards) {
                        this.cardVisual.setVisible(false);
                        this.cardPlaceholder.setVisible(false);
                    } else {
                        this.cardVisual.setVisible(true);
                        this.cardPlaceholder.setVisible(true);
                    }
                    let cardi = (this.collectionBook.currentColorPage-1) * maxCardsPerPage + this.index;
                    cardi = Math.max(cardi, 0);
                    
                    if(cardi < this.collectionBook.colorCardIndex[this.collectionBook.selectedColor-1].length) {
                        let cardInfo = this.collectionBook.colorCardIndex[this.collectionBook.selectedColor-1][cardi];
                    
                        this.cardVisual.setUpdate(cardInfo);
                        this.cardPlaceholder.setUpdate(cardInfo);  
                    }
                }
            };

            let config = {
                x: o.x + (bookCardAreaWidth * (i % (maxCardsPerPage/maxCardsPerCol))),
                y: o.y + (bookCardAreaHeight * Math.floor(i / (maxCardsPerPage/maxCardsPerCol))),
                scale: 0.35
            }
            c.cardVisual = new CardVisual(this.scene, config);
            c.cardPlaceholder = new CardVisual(this.scene, config);

            c.cardVisual.setVisible(false);
            c.cardPlaceholder.setVisible(false);

            c.cardVisual.setInteractive();
            c.cardVisual.on('pointerdown', function(pointer) {
                if(pointer.rightButtonDown()) {
                    console.log('Right click detected');
                } else {
                    if(!this.collectionBook.scene.showingDeckList){
                        //if the firstClicktime is 0 then this we record the time and leave the function
                        this.collectionBook.selectedCard = this.index;
                        if (this.firstClickTime == 0) {
                            this.firstClickTime = new Date().getTime();
                            return;
                        }
                        let elapsed = new Date().getTime() - this.firstClickTime;
    
                        if (elapsed < 350) {
                            this.collectionBook.scene.addCardToDeck(this.collectionBook.selectedCard);
                        } 
                        this.firstClickTime = 0;  
                    }  
                }
            }, c);
            c.collectionBook.scene.input.setDraggable(c.cardVisual);

            this.cardVisuals.push(c);
        }

        /** PAGE TITLE */
        this.pageTitle = this.scene.add.text(this.tabs.x, 80, 'GREEN', {
            fontFamily: 'Brandon',
            font: "55px monospace",
            fill: "#000000"
        });
        this.pageTitle.setOrigin(0.5, 0);

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
            if(cardi<this.colorCardIndex[this.selectedColor-1].length) {
                let cardInfo = this.colorCardIndex[this.selectedColor-1][cardi];
                let cardArtKey = cardInfo.art
                if(!this.scene.cache.game.textures.list[cardArtKey]){
                    numberOfArtLoads++;
                    loader.image(cardArtKey, 'assets/cardart/' + cardArtKey + '.png'); //load image
                    loader.image('deckentry_' + cardArtKey, 'assets/deckentryart/deckentry_' + cardArtKey + '.png'); //load deck entry preemtiveley to avvoid errors later
                }
                
            }
        }

        if(numberOfArtLoads>0) {
            loader.once(Phaser.Loader.Events.COMPLETE, () => {
                for(let visual of this.cardVisuals) visual.update();
            });
            loader.start();
        } else {
            for(let visual of this.cardVisuals) visual.update();
        }

    }

    /** UPDATE THE TRACKER FOR WHAT THE BOTTOM AND TOP PAGE OF THE TAB WILL BE */
    updateMinMaxPage () {
        for(let i = 0; i<this.colorCardInfo.length; i++){
            if(!this.colorCardInfo[i].hidden) {
                this.pageMin = this.colorCardInfo[i].startPage;
                break;
            }
        }

        for(let i = this.colorCardInfo.length-1; i>=0; i--){
            if(!this.colorCardInfo[i].hidden) {
                this.pageMax = this.colorCardInfo[i].startPage + this.colorCardInfo[i].totalPages-1;
                break;
            }
        }
    }

    /** CREATE TAB FUNCTION */
    createCollectionBookTab = function (scene, direction, color, symbol) {
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
            icon: scene.add.image(0, 0, symbol).setScale(0.3).setOrigin(0),
            space: {
                bottom: 0,//-110,
                left: 12
            }
        });
    }

    /** UPDATE DECK TYPE ARRAY */
    updateDeckColors(colors) {
        let pageChanged = false;
        if(colors.length > 0) {
            for(let i=0; i<CARD_COLORS.length; i++) {
                if(!colors.includes(CARD_COLORS[i])) {
                    this.tabs.hideButton('top', i);
                    this.colorCardInfo[i].hidden = true;
                }
                else {
                    if(!pageChanged) {
                        pageChanged = true;
                        this.currentColorPage = 1;
                        this.currentPage = this.colorCardInfo[i].startPage;
                        this.selectedColor = i+1;
                    }
                }
            }
        } else {
            for(let i=0; i<this.colorCardInfo.length; i++) {
                if(this.colorCardInfo[i].numberCards === 0) {
                    this.tabs.hideButton('top', i);
                    this.colorCardInfo[i].hidden = true;
                } else {
                    this.tabs.showButton('top', i);
                    this.colorCardInfo[i].hidden = false;
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
            if(this.currentColorPage > this.colorCardInfo[this.selectedColor-1].totalPages){
                //find the next non empty color
                let nextcolor = this.selectedColor-1;
                for(let i = this.selectedColor; i<(this.colorCardInfo.length); i++) {
                    if(this.colorCardInfo[i].totalPages>0 && !this.colorCardInfo[i].hidden){
                        nextcolor = i;
                        break;
                    }
                }

                //if found new color
                if(nextcolor !== this.selectedColor-1){
                    this.currentColorPage = 1;
                    this.currentPage = this.colorCardInfo[nextcolor].startPage;
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
                    if(this.colorCardInfo[i].totalPages>0 && !this.colorCardInfo[i].hidden){
                        prevcolor = i;
                        break;
                    }
                }

                //if found new color
                if(prevcolor !== this.selectedColor-1){
                    this.currentPage = this.colorCardInfo[prevcolor].startPage + this.colorCardInfo[prevcolor].totalPages - 1
                    this.tabs.emitButtonClick('top', prevcolor);
                }
            }

            this.updateCardVisuals();
        }
    }

}
