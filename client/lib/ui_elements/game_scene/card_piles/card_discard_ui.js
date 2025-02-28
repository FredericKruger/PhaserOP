class CardDiscardUI extends CardPileUI {

    /**
     * 
     * @param {GameScene} scene 
     * @param {PlayerScene} playerScene 
     * @param {Array<GameCardUI>} cards 
     */
    constructor(scene, playerScene) {
        super(scene, playerScene);

        //Array of images to represent the cards
        this.obj = [];
        //this.cardVisuals = [];

        //Prepare positionof the deck
        this.posX = this.posY = this.posWidth = this.posHeight = 0;
        if(playerScene.playerPosition === PLAYER_POSITIONS.BOTTOM) {
            this.posX = this.scene.screenWidth -  200 - (GAME_UI_CONSTANTS.CARD_ART_WIDTH * CARD_SCALE.IN_DON_DECK)/2;
            this.posY = this.scene.screenHeight * 0.65;
        } else {
            this.posX = 200 + (GAME_UI_CONSTANTS.CARD_ART_WIDTH * CARD_SCALE.IN_DON_DECK)/2;
            this.posY = this.scene.screenHeight * 0.35;
        }
        this.posWidth = GAME_UI_CONSTANTS.CARD_ART_WIDTH * CARD_SCALE.IN_DON_DECK;
        this.posHeight = GAME_UI_CONSTANTS.CARD_ART_HEIGHT * CARD_SCALE.IN_DON_DECK; 
    }

    //Function to draw the deck ui elments
    create() {
        //Create Outline
        this.deckOutline = this.scene.add.graphics();
        this.deckOutline.fillStyle(COLOR_ENUMS.OP_BLACK, 0.5); // Black color with 50% opacity
        this.deckOutline.fillRoundedRect(this.posX - this.posWidth/2, this.posY-this.posHeight/2, this.posWidth, this.posHeight, 0.7); // 10 is padding, 15 is corner radius
        this.deckOutline.lineStyle(1, COLOR_ENUMS.OP_BLACK);
        this.deckOutline.strokeRoundedRect(this.posX - this.posWidth/2, this.posY-this.posHeight/2, this.posWidth, this.posHeight, 1); // 10 is padding, 15 is corner radius
        this.deckOutline.setDepth(0);
        this.obj.push(this.deckOutline);

        //Create Title
        this.discardText = this.scene.add.text(this.posX, this.posY - this.posHeight/2 - 10 , "Discard", 
            {font: "18px OnePieceFont", color: COLOR_ENUMS_CSS.OP_BLACK}
        ).setOrigin(0.5).setDepth(0);
        this.obj.push(this.discardText);

        this.setVisible(false);
    }

    /** Function to update the order of the card */
    update() {
        let step = -0.25;
        for(let i = 0; i<this.cards.length; i++) {
            this.cards[i].setPosition(this.posX-i*step, this.posY-i*step/2);
            if(i>0) this.scene.children.moveAbove(this.cards[i], this.cards[i-1]);
        }
    }

    /** Function to add a card 
     * @param {GameCardUI} card - The card to add
     * @param {Object} config - Configuration object
    */
    addCard(card, config = {setCardState: false, setCardDepth: false, updateUI: false}) {
        if(config.setCardDepth) card.setDepth(DEPTH_VALUES.CARD_IN_DECK);
        if(config.setCardState) card.setState(CARD_STATES.IN_DISCARD);  
        card.setScale(CARD_SCALE.IN_DISCARD);     

        this.cards.push(card);

        if(config.updateUI) this.update();
    }

}