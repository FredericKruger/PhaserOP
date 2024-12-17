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

    /*init (data) {
        this.cardIndex = data.CardIndex;
        this.cardIndex = this.cardIndex.sort(function (a, b) {
            return a.colorid - b.colorid || a.cost - b.cost || a.collectionnb - b.collectionnb;
        });
        
        this.cardToCardi = new Array(this.cardIndex.length);
        for(let i = 0; i<this.cardIndex.length; i++)
            this.cardToCardi[this.cardIndex[i].collectionnb-1] = i;

        this.pageMax = 0;
        let startIndex = 0;
        for(let i = 0; i<6; i++){
            this.colorCardIndex[i] = this.cardIndex.filter(item => item.colorid === (i+1));

            this.colorCardInfo[i] = {
                startPage: this.pageMax+1,
                startIndex: startIndex,
                totalPages: 0,
                numberCards: this.colorCardIndex[i].length,
                hidden: false
            };

            if(this.colorCardIndex[i].length > 0) {
                this.colorCardInfo[i].totalPages = Math.floor(this.colorCardIndex[i].length/maxCardsPerPage)+1;
                this.pageMax +=this.colorCardInfo[i].totalPages;
            }

            startIndex += this.colorCardIndex[i].length;
        }
    }*/

    preload () {
        this.add.image(0, 0, 'background3').setScale(2); //add background image

        if(this.firstLoad){
            this.load.scenePlugin('rexuiplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js', 'rexUI', 'rexUI'); //plugins
            this.load.plugin('rexcirclemaskimageplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexcirclemaskimageplugin.min.js', true);
            this.load.plugin('rextexteditplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rextexteditplugin.min.js', true);
            this.load.plugin('rexbbcodetextplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexbbcodetextplugin.min.js', true);
            
            this.load.image('deletedeckicon', 'assets/elements/deletedeckicon.png');

            this.firstLoad = false;
        }
    }

    create () {
        /** COLLECTION BOOK */
        this.collectionBook = new CollectionBook({
            x: 660,
            y: 470,
            width: 1300,
            height: 875
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

}