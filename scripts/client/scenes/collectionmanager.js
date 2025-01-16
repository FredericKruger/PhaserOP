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
        /** COLLECTION BOOK */
        this.collectionBook = new CollectionBook({
            x: 20,
            y: 40,
            width: this.cameras.main.width - 300,
            height: this.cameras.main.height - 150,
        }, this);
        this.add.existing(this.collectionBook.tabs);
        this.collectionBook.tabs.emitButtonClick('top',0);

        /**DECKS CONTAINER */
        /*let listOfDecksContainerConfig = {
            scene: this,
            x: this.collectionBook.tabs.x + this.collectionBook.tabs.width/2 + 175,
            y: this.collectionBook.tabs.y,
            width: 300,
            height: 875
        };
        this.deckListContainer = new DeckListContainer(listOfDecksContainerConfig);
        this.deckListContainer.init();*/

        /** DECKS LIST CONTAINER */
        //this.deckCardListContainer = new DeckCardListContainer(listOfDecksContainerConfig, this);

        /** DECK TITLE */
        /*let deckTitle = this.add.text(listOfDecksContainerConfig.x+25, listOfDecksContainerConfig.y - listOfDecksContainerConfig.height/2 + 30, 'New Deck', 
            {
                fontFamily: 'Brandon',
                font: "20px monospace",
                fill: "#d3ba84",
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
        });*/

        /* Back Button */
        this.backButton = new Button({
            scene: this,
            x: this.cameras.main.width - 20 - 50, 
            y: this.cameras.main.height - 20 - 20,
            width: 100,
            height: 40,
            radius: 5,
            backgroundcolor: OP_RED,
            outlinecolor: OP_CREAM,
            text: "Back",
            fontsize: 18
        });
        this.backButton.on('pointerdown', () =>  {
            this.backToTitle();
        });
        this.backButton.on('pointerover', () => {
            this.backButton.setScale(1.1);
        });
        this.backButton.on('pointerout', () => {
            this.backButton.setScale(1);
        });

        /** DRAG HANDLER */
        /*this.input.on('dragstart', function (pointer, gameObject) {
            this.children.bringToTop(gameObject);
            this.isDragging = true;
        }, this);

        this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('dragend', function (pointer, gameObject, dropped) {
            if(gameObject.input !== undefined){//in case the element was destroyed before
                if (!dropped) { 
                    gameObject.x = gameObject.input.dragStartX;
                    gameObject.y = gameObject.input.dragStartY;
                }
            }
            this.isDragging = false;
        })

        this.input.on('drop', function (pointer, gameObject, zone) {
            if(zone.getData('name') === 'deckDropZone'){
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
                this.addCardToDeck(this.collectionBook.selectedCard); //self.selected

                this.isDragging = false;
            }
        }, this);*/

    }

    /** UPDATE FUNCTION */
    update() {
        for(let o of this.obj) {
            o.update();
        }
        this.collectionBook.update();

        /*
        if(this.showingDeckList){
            this.deckListContainer.update();
        } else {
            this.deckCardListContainer.update();
        }
        */
    }

    /** BACK TO TITLE FUNCTION */
    backToTitle() {
        GameClient.askSavePlayerDecks();
        this.scene.switch('title');
    }

}