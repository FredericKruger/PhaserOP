class CollectionManager extends Phaser.Scene {
    constructor () {
        super({key: 'collectionmanager'});

        this.cardIndex = null;
        this.colorCardIndex = [];
        this.colorCardInfo = [];
        this.cardToCardi = [];

        this.pageMax = 1;
 
        this.obj = [];

        this.selectedDeck = -1;

        this.cardTooltipContainer = null;
        this.deckListContainer = null;

        this.isDragging = false;
        this.showingDeckList = true;
        this.firstLoad = true;

        this.collectionBook = null;
    }

    init (data) {
        this.cardIndex = data.CardIndex;
        
        this.pageMax = 0;
        let startIndex = 0;
        for(let i = 0; i<CARD_COLORS.length; i++) {
            //First filter the cards
            this.colorCardIndex[i] = this.cardIndex.filter(item => item.colors.includes(CARD_COLORS[i]));

            //Then sort the cards
            this.colorCardIndex[i] = this.colorCardIndex[i].sort(function (a, b) {
                return b.isleader - a.isleader || a.cost - b.cost || a.id - b.id;
            });

            //Create page info
            this.colorCardInfo[i] = {
                startPage: this.pageMax+1,
                startIndex: startIndex,
                totalPages: 0,
                numberCards: this.colorCardIndex[i].length,
                hidden: false
            };

            //Increase variables
            if(this.colorCardIndex[i].length > 0) {
                this.colorCardInfo[i].totalPages = Math.floor(this.colorCardIndex[i].length/maxCardsPerPage)+1;
                this.pageMax +=this.colorCardInfo[i].totalPages;
            }

            startIndex += this.colorCardIndex[i].length;
        }
    }

    preload () {
        this.add.image(0, 0, 'background3').setScale(2); //add background image

        if(this.firstLoad){
            this.load.scenePlugin('rexuiplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js', 'rexUI', 'rexUI'); //plugins
            this.load.plugin('rexcirclemaskimageplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexcirclemaskimageplugin.min.js', true);
            this.load.plugin('rextexteditplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rextexteditplugin.min.js', true);
            this.load.plugin('rexbbcodetextplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexbbcodetextplugin.min.js', true);
            this.load.plugin('rexroundrectangleplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexroundrectangleplugin.min.js', true);
            
            this.load.image('deletedeckicon', 'assets/elements/deletedeckicon.png');

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
        this.collectionBook.tabs.emitButtonClick('top',0);

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
                fill: "#E9E6CE",
                fixedWidth: 220,
                align: 'center',
                maxLines: 1
            }
        ).setOrigin(0.5).setVisible(false);
        this.deckCardListContainer.setDeckTitle(deckTitle);
        this.plugins.get('rextexteditplugin').add(deckTitle, {
            type: 'text',
            enterClose: true,
            
            onOpen: function (textObject) {},
            onTextChanged: function (textObject, text) {
                textObject.text = text;
            },
            onClose: function (textObject) {
                if(textObject.text === "") textObject.text = "New Deck";
            },
            selectAll: true,
        });

        /** DRAG HANDLER */
        this.input.on('dragstart', function (pointer, gameObject) {
            this.children.bringToTop(gameObject);
            this.isDragging = true;
        }, this);

        this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            gameObject.x = dragX;
            gameObject.y = dragY;
        }, this);

        this.input.on('dragend', function (pointer, gameObject, dropped) {
            if(gameObject.input !== undefined){//in case the element was destroyed before
                if (!dropped) { 
                    gameObject.x = gameObject.input.dragStartX;
                    gameObject.y = gameObject.input.dragStartY;
                }
            }
            this.isDragging = false;
        }, this);

        this.input.on('drop', function (pointer, gameObject, zone) {
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
        }, this);

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
        this.scene.switch('title');
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

        this.deckCardListContainer.currentDeck = new Deck(true);
        this.updateDeckColors();

        //Send to Server
        GameClient.askSavePlayerDecks();
    }

    /** DELETE DECK FUNCTION */
    deleteDeck(deckid) {
        this.deckListContainer.deleteDeck(deckid);
        GameClient.decklist.splice(deckid, 1); //remove the deck from the client as well
        this.deckListContainer.updateEntryLayout();

        //Send to Server
        GameClient.askSavePlayerDecks();
    }

    /** ADD CARD TO DECK FUNCTION */
    addCardToDeck (card) {
        //adding card to deck
        let cardi = (this.collectionBook.currentColorPage-1) * maxCardsPerPage + card;

        let resultCode = this.deckCardListContainer.currentDeck.addCard(this.colorCardIndex[this.collectionBook.selectedColor-1][cardi]);

        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        let showDialog = false;
        let dialogMessage = "";

        switch(resultCode) {
            case ERRORCODES.ADDED_NEW_CARD:
                this.deckCardListContainer.updateDeckCardEntries(/*cardi*/);
                this.updateDeckColors();
                break;
            case ERRORCODES.CARD_LEADER_LIMIT_REACHED:
                showDialog = true;
                dialogMessage = 'Cant add more than 1 leader in your deck!';
                break;
            case ERRORCODES.FIRST_CARD_TO_BE_LEADER:
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
            .then(function (data) {});  
        }
    }

    /** LOAD DECK FROM DECKLIST */
    loadDeck(decki) {
        let deck = GameClient.decklist[decki];
        this.deckCardListContainer.currentDeck = new Deck(false);
        this.selectedDeck = decki;

        this.deckCardListContainer.reset();
        this.deckCardListContainer.loadDeck(deck);
        //this.deckCardListContainer.updateDeckCardEntries(-1);

        //this.updateDeckColors();
        
        this.deckListContainer.setVisible(false);
        this.deckCardListContainer.setVisible(true);
        this.showingDeckList = false;
    }

    /** UPDATE TOOLTIP */
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
                this.cardTooltipContainer.setUpdate(cardToolTipConfig.cardInfo);  
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

    /** FUNCTION THAT CREATES A DIALOG */
    createDialog (scene, title, message) {
        let dialog = scene.rexUI.add.dialog({
            background: scene.rexUI.add.roundRectangle(0, 0, 100, 100, 10, OP_CREAM),

            title: scene.rexUI.add.label({
                background: scene.add.rexRoundRectangleCanvas(0, 0, 100, 40, 5, OP_RED, OP_CREAM, 3),
                text: scene.add.text(0, 0, title, {
                    fontFamily: 'Brandon',
                    font: "24px monospace",
                    fill: "#ffffff"
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
                fill: "#000000"
            }),

            actions: [
                scene.rexUI.add.label({
                    background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, OP_RED),

                    text: scene.add.text(0, 0, "OK", {
                        fontFamily: 'Brandon',
                        font: "18px monospace",
                        fill: "#ffffff"
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