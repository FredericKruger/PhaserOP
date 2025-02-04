

class CollectionManagerScene extends Phaser.Scene {
    constructor () {
        super({key: SCENE_ENUMS.COLLECTION_MANAGER});

        this.pageMax = 1;
 
        this.obj = [];

        this.selectedDeck = -1;

        this.cardTooltipContainer = null;
        this.deckListContainer = null;

        this.isDragging = false;
        this.showingDeckList = true;
        this.firstLoad = true;

        this.collectionBook = null;

        this.inDeckBuildingMode = false;
    }

    init () {
        this.pageMax = GameClient.playerCollection.filterCollection();
    }

    preload () {
        this.add.image(0, 0, ASSET_ENUMS.BACKGROUND3).setScale(2); //add background image

        if(this.firstLoad){
            this.load.scenePlugin('rexuiplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js', 'rexUI', 'rexUI'); //plugins
            this.firstLoad = false;
        }
    }

    create () {
        let containerSeparatorWidth = 20;
        let deckCardListContainerWidth = 300;
        let deckCardListContainerHeight = this.cameras.main.height - 40 - containerSeparatorWidth*2;
        let collectionBookContainerHeight = deckCardListContainerHeight;
        let collectionBookContainerWidth = this.cameras.main.width - deckCardListContainerWidth - containerSeparatorWidth*3;

        /** COLLECTION BOOK */
        this.collectionBook = new CollectionBook({
            x: containerSeparatorWidth,
            y: containerSeparatorWidth*2,
            width: collectionBookContainerWidth,
            height: collectionBookContainerHeight,
        }, this);
        this.add.existing(this.collectionBook.tabs);

        /** CARD CRAFTING PANEL */
        this.cardCraftingPanel = new CardCraftingPanel(this, this.cameras.main.width/2, this.cameras.main.height/2);

        /**DECKS LIST CONTAINER */
        let listOfDecksContainerConfig = {
            scene: this,
            x: this.cameras.main.width - containerSeparatorWidth - deckCardListContainerWidth,
            y: containerSeparatorWidth*2 + 25, //25 is half the height of a tab
            width: deckCardListContainerWidth,
            height: deckCardListContainerHeight
        };
        this.deckListContainer = new DeckListContainer(listOfDecksContainerConfig);
        this.deckListContainer.init();

        /** DECK CARD LIST CONTAINER */
        this.deckCardListContainer = new DeckCardListContainer(listOfDecksContainerConfig, this);

        /** DECK TITLE */
        let deckTitle = this.add.text(listOfDecksContainerConfig.x + listOfDecksContainerConfig.width/2 + 25, listOfDecksContainerConfig.y - 15, 'New Deck', 
            { 
                fontFamily: 'Brandon',
                font: "20px monospace",
                color: COLOR_ENUMS_CSS.OP_CREAM,
                fixedWidth: 220,
                align: 'center',
                maxLines: 1
            }
        ).setOrigin(0.5).setVisible(false);
        this.deckCardListContainer.setDeckTitle(deckTitle);
        // @ts-ignore
        this.plugins.get('rextexteditplugin').add(deckTitle, {
            type: 'text',
            enterClose: true,
            
            onOpen: function (/** @type {any} */ textObject) {},
            onTextChanged: function (/** @type {{ text: any; }} */ textObject, /** @type {any} */ text) {
                textObject.text = text;
            },
            onClose: function (/** @type {{ text: string; }} */ textObject) {
                if(textObject.text === "") textObject.text = "New Deck";
            },
            selectAll: true,
        });

        // @ts-ignore
        this.plugins.get('rextexteditplugin').add(this.collectionBook.searchInput.getElement('text'), {
            type: 'text',
            enterClose: true,
            
            onOpen: function (/** @type {any} */ textObject) {},
            onTextChanged: function (/** @type {{ text: any; }} */ textObject, /** @type {any} */ text) {
                textObject.text = text;
            },
            onClose: function (/** @type {{ text: string; }} */ textObject) {
                GameClient.playerCollection.removeFilter({type:'text',value:textObject.text});
                if(textObject.text === "") {
                    textObject.text = "Search";
                } else {
                    GameClient.playerCollection.addFilter({type:'text',value:textObject.text});
                } 
                this.scene.collectionBook.updateMinMaxPage();
                this.scene.collectionBook.updateCardVisuals(); 
            },
            selectAll: true,
        });

        /** DRAG HANDLER */
        this.input.on('dragstart', (/** @type {any} */ pointer, /** @type {Phaser.GameObjects.GameObject} */ gameObject) => {
            this.children.bringToTop(gameObject);
            this.isDragging = true;

            if(gameObject instanceof DeckCardEntry) {
                gameObject.deckCardListContainer.scrollContainer.removeElement(gameObject);
                let worldCoord = gameObject.deckCardListContainer.scrollContainer.convertToWorldPosition(gameObject.x, gameObject.y);
                gameObject.x = worldCoord.x;
                gameObject.y = worldCoord.y;
                this.updateTooltip({visible: false});
            } else if(gameObject instanceof CardVisual) {
                gameObject.showBorder(false);
            }
        });

        this.input.on('drag', (/** @type {any} */ pointer, /** @type {{ deckCardListContainer: { scrollContainer: { convertToWorldPosition: (arg0: any, arg1: any) => any; }; }; x: any; y: any; }} */ gameObject, /** @type {any} */ dragX, /** @type {any} */ dragY) => {
            if(gameObject instanceof DeckCardEntry) {
                let worldCoord = gameObject.deckCardListContainer.scrollContainer.convertToWorldPosition(dragX, dragY);
                gameObject.x = worldCoord.x;
                gameObject.y = worldCoord.y;
            } else {
                gameObject.x = dragX;
                gameObject.y = dragY;
            }

        });

        this.input.on('dragend', (/** @type {{ upX: any; upY: any; }} */ pointer, /** @type {{ input: { dragStartX: any; dragStartY: any; }; deckCardListContainer: { deckDropZone: { getBounds: () => { (): any; new (): any; contains: { (arg0: any, arg1: any): any; new (): any; }; }; }; removeCardFromDeck: (arg0: any) => any; scrollContainer: { addElement: (arg0: DeckCardEntry) => void; }; }; entryIndex: any; setToLocalPosition: () => void; x: any; y: any; }} */ gameObject, /** @type {any} */ dropped) => {
            if(gameObject.input !== undefined){//in case the element was destroyed before
                if(gameObject instanceof DeckCardEntry) {
                    if (!gameObject.deckCardListContainer.deckDropZone.getBounds().contains(pointer.upX, pointer.upY)) {
                        let result = gameObject.deckCardListContainer.removeCardFromDeck(gameObject.entryIndex);
                        
                        if(result !== ERROR_CODES.REMOVED_CARD) {
                            gameObject.deckCardListContainer.scrollContainer.addElement(gameObject);
                            gameObject.setToLocalPosition();
                        } 
                    } else {
                        gameObject.deckCardListContainer.scrollContainer.addElement(gameObject);
                        gameObject.setToLocalPosition();
                    }
                } else {
                    if (!dropped) { 
                        gameObject.x = gameObject.input.dragStartX;
                        gameObject.y = gameObject.input.dragStartY;
                    }
                }
            }
            this.isDragging = false;
        });

        this.input.on('drop', (/** @type {any} */ pointer, /** @type {{ x: number; input: { dragStartX: number; dragStartY: number; }; y: number; }} */ gameObject, /** @type {{ getData: (arg0: string) => string; }} */ zone) => {
            if(gameObject instanceof CardVisual) {
                if(zone.getData('name') === 'deckDropZone'){
                    gameObject.x = gameObject.input.dragStartX;
                    gameObject.y = gameObject.input.dragStartY;
                    this.addCardToDeck(this.collectionBook.selectedCard); //self.selected
    
                    this.isDragging = false;
                }
            } else {
                this.input.emit('dragend', pointer, gameObject, false);
            }
        });

    }

    /** UPDATE FUNCTION */
    update() {
        for(let o of this.obj) {
            o.update();
        }
        this.collectionBook.update();

        if(this.showingDeckList){
            this.deckListContainer.update();
        } else {
            this.deckCardListContainer.update();
        }
    }

    /** BACK TO TITLE FUNCTION */
    backToTitle() {
        GameClient.askSavePlayerDecks();
        this.scene.switch(SCENE_ENUMS.TITLE);
    }

    /** FUNCTION TO UPDATE DECK TYPES */
    updateDeckColors() {
        this.collectionBook.updateDeckColors(this.deckCardListContainer.currentDeck.colors);
        this.deckCardListContainer.updateDeckColors();
    }

    /** CREATE NEW DECK FROM DECKLIST */
    newDeck() {
        this.deckCardListContainer.currentDeck = new Deck(true);
        this.deckCardListContainer.reset();

        this.deckListContainer.setVisible(false);
        this.deckCardListContainer.setVisible(true);
        this.showingDeckList = false;
        this.inDeckBuildingMode = true;

        this.collectionBook.updateCardVisuals();
    }

    /** FUNCTION TO SAVE DECK */
    saveDeck() {
        //2 cases
        let currentDeck = this.deckCardListContainer.currentDeck;
        if(currentDeck.deckSize > 0){
            if(currentDeck.isNewDeck){ //1. Deck is a new deck
                let deckId = GameClient.decklist.length;
                let deckname = this.deckCardListContainer.getDeckName();
                let cards = currentDeck.getCardListAsJSON();

                GameClient.decklist.push({
                    name: deckname,
                    cards: cards
                });
                
                let deckconfig = this.deckListContainer.processDeck(GameClient.decklist[deckId], deckId);
                this.deckListContainer.addDeck(deckconfig);

            } else { //2. Deck already exists
                let deckname = this.deckCardListContainer.getDeckName();
                let cards = currentDeck.getCardListAsJSON();
                
                GameClient.decklist[this.selectedDeck].name = deckname;
                GameClient.decklist[this.selectedDeck].cards = cards;

                //update deckentry
                let deckconfig = this.deckListContainer.processDeck(GameClient.decklist[this.selectedDeck], this.selectedDeck);
                this.deckListContainer.updateDeck(deckconfig);
            }
        } else {
            //error message 
        }

        //Done 
        this.deckListContainer.setVisible(true);
        this.deckCardListContainer.setVisible(false);
        this.showingDeckList = true;
        this.inDeckBuildingMode = false;

        this.deckCardListContainer.currentDeck = new Deck(true);
        this.updateDeckColors();

        //Send to Server
        GameClient.askSavePlayerDecks();
    }

    /**
     * DELETE DECK FUNCTION
     * @param {number} deckid
     */
    deleteDeck(deckid) {
        this.deckListContainer.deleteDeck(deckid);
        GameClient.decklist.splice(deckid, 1); //remove the deck from the client as well
        this.deckListContainer.updateEntryLayout();

        //Send to Server
        GameClient.askSavePlayerDecks();
    }

    /**
     * ADD CARD TO DECK FUNCTION
     * @param {number} card
     */
    addCardToDeck (card) {
        //adding card to deck
        let cardi = (this.collectionBook.currentColorPage-1) * GAME_ENUMS.MAX_CARDS_PER_PAGE + card;

        let resultCode = this.deckCardListContainer.currentDeck.addCard(
            GameClient.playerCollection.getCardFromPage(this.collectionBook.selectedColor-1, cardi)
        );

        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        let showDialog = false;
        let dialogMessage = "";

        switch(resultCode) {
            case ERROR_CODES.INCREASED_CARD_AMOUNT:
                this.updateDeckColors();
                break;
            case ERROR_CODES.ADDED_NEW_CARD:
                this.deckCardListContainer.updateDeckCardEntries();
                this.updateDeckColors();
                break;
            case ERROR_CODES.CARD_LEADER_LIMIT_REACHED:
                showDialog = true;
                dialogMessage = 'Cant add more than 1 leader in your deck!';
                break;
            case ERROR_CODES.FIRST_CARD_TO_BE_LEADER:
                showDialog=true;
                dialogMessage = 'First card to add has to be a leader!';
                break;
        }

        if(showDialog) {
            this.createDialog(this, 'Oops', dialogMessage)
            .setPosition(screenCenterX, screenCenterY)
            .layout()
            .modalPromise({
                manualClose: true,
                duration: {
                    in: 500,
                    out: 500
                }
            })
            .then(function (/** @type {any} */ data) {});  
        }
    }

    /**
     * LOAD DECK FROM DECKLIST
     * @param {number} decki
     */
    loadDeck(decki) {
        let deck = GameClient.decklist[decki];
        this.deckCardListContainer.currentDeck = new Deck(false);
        this.selectedDeck = decki;

        this.deckCardListContainer.reset();
        this.deckCardListContainer.loadDeck(deck);

        this.inDeckBuildingMode = true;
        this.updateDeckColors();
        
        this.deckListContainer.setVisible(false);
        this.deckCardListContainer.setVisible(true);
        this.showingDeckList = false;
    }

    /**
     * GET AMOUNT OF CARDS IN DECK BEING BUILT
     * @param {number} cardid
     */
    getAmountOfCardInDeck(cardid) {
        let amount = this.deckCardListContainer.currentDeck.amountInDeck(cardid);
        return amount;
    }

    /**
     * UPDATE TOOLTIP
     * @param {{ visible: boolean; index?: number; positionx?: number; positiony?: number; cardData?: any; }} cardToolTipConfig
     */
    updateTooltip(cardToolTipConfig) {
        if(cardToolTipConfig.visible && !this.isDragging){
            if(this.cardTooltipContainer === null){
                let cardi = cardToolTipConfig.index;
                let config = {
                    scene: this,
                    x: cardToolTipConfig.positionx,
                    y: cardToolTipConfig.positiony,
                    cardindex: cardi,
                    scale: 0.5
                };
                this.cardTooltipContainer = new CardVisual(this, config);
                this.cardTooltipContainer.setUpdate(cardToolTipConfig.cardData);  
            }
            
            //check if tooltip out of screen
            if(cardToolTipConfig.positiony - this.cardTooltipContainer.height/2*this.cardTooltipContainer.scale < 20){
                cardToolTipConfig.positiony = 20 + this.cardTooltipContainer.height/2*this.cardTooltipContainer.scale;
            }
            if(cardToolTipConfig.positiony + this.cardTooltipContainer.height/2*this.cardTooltipContainer.scale > (this.cameras.main.height-20)) {
                cardToolTipConfig.positiony = (this.cameras.main.height-20) - this.cardTooltipContainer.height/2*this.cardTooltipContainer.scale;
            }

            this.cardTooltipContainer.setPosition(cardToolTipConfig.positionx, cardToolTipConfig.positiony);
            
        } else {
            if(this.cardTooltipContainer !== null){
                this.cardTooltipContainer.destroy();
                this.cardTooltipContainer = null;
            }
        }
    }

    /**
     * FUNCTION THAT CREATES A DIALOG
     * @param {any} scene
     * @param {string} title
     * @param {string} message
     */
    createDialog (scene, title, message) {
        let dialog = scene.rexUI.add.dialog({
            background: scene.rexUI.add.roundRectangle(0, 0, 100, 100, 10, COLOR_ENUMS.OP_CREAM),

            title: scene.rexUI.add.label({
                background: scene.add.rexRoundRectangleCanvas(0, 0, 100, 40, 5, COLOR_ENUMS.OP_RED, COLOR_ENUMS.OP_CREAM, 3),
                text: scene.add.text(0, 0, title, {
                    fontFamily: 'Brandon',
                    font: "24px monospace",
                    color: COLOR_ENUMS_CSS.OP_WHITE
                }),
                space: {
                    left: 15,
                    right: 15,
                    top: 10,
                    bottom: 10
                }
            }),

            content: scene.add.text(0, 0, message, {
                fontFamily: 'Brandon',
                font: "18px monospace",
                color: COLOR_ENUMS_CSS.OP_BLACK
            }),

            actions: [
                scene.rexUI.add.label({
                    background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_ENUMS.OP_RED),

                    text: scene.add.text(0, 0, "OK", {
                        fontFamily: 'Brandon',
                        font: "18px monospace",
                        color: COLOR_ENUMS_CSS.OP_BLACK
                    }), 

                    space: {
                        left:10, right:10, top:10, bottom:10
                    }
                })
            ],

            space: {
                title: 25,
                content: 25,
                action: 15,

                left: 20,
                right: 20,
                top: 20,
                bottom: 20,

            },

            align: {
                actions: 'center', // 'center'|'left'|'right'
            },

            expand: {
                content: false,  // Content is a pure text object
            }
        });

        return dialog;
    } 

}