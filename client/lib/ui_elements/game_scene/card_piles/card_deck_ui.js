class CardDeckUI extends CardPileUI {

    /**
     * 
     * @param {GameScene} scene 
     * @param {PlayerScene} playerScene 
     * @param {Array<GameCardUI>} cards 
     */
    constructor(scene, playerScene, cards) {
        super(scene, playerScene);

        //Create the array of cards Visuals
        this.cards = cards;

        //Array of images to represent the cards
        this.cardVisuals = [];

        //Prepare positionof the deck
        this.posX = this.posY = this.posWidth = this.posHeight = 0;
        if(playerScene.playerPosition === PLAYER_POSITIONS.BOTTOM) {
            this.posX = this.playerScene.discard.posX  - this.playerScene.discard.posWidth/2 - GAME_UI_CONSTANTS.COMPONENT_SEPARATOR_WIDTH - (GAME_UI_CONSTANTS.CARD_ART_WIDTH * CARD_SCALE.IN_DECK)/2;
            this.posY = this.playerScene.discard.posY - (CARD_SCALE.IN_DECK-CARD_SCALE.IN_DISCARD) * GAME_UI_CONSTANTS.CARD_ART_HEIGHT/2;
        } else {
            this.posX = this.playerScene.discard.posX + this.playerScene.discard.posWidth/2 + GAME_UI_CONSTANTS.COMPONENT_SEPARATOR_WIDTH + (GAME_UI_CONSTANTS.CARD_ART_WIDTH * CARD_SCALE.IN_DECK)/2;
            this.posY = this.playerScene.discard.posY - (CARD_SCALE.IN_DECK-CARD_SCALE.IN_DISCARD) * GAME_UI_CONSTANTS.CARD_ART_HEIGHT/2;
        }
        this.posWidth = GAME_UI_CONSTANTS.CARD_ART_WIDTH * CARD_SCALE.IN_DECK;
        this.posHeight = GAME_UI_CONSTANTS.CARD_ART_HEIGHT * CARD_SCALE.IN_DECK;
    }

    //Function to draw the deck ui elments
    create() {
        //Create Outline
        this.deckOutline = this.scene.add.graphics();
        this.deckOutline.fillStyle(COLOR_ENUMS.OP_WHITE, 0.5); // Black color with 50% opacity
        this.deckOutline.fillRoundedRect(this.posX - this.posWidth/2, this.posY-this.posHeight/2, this.posWidth, this.posHeight, 10); // 10 is padding, 15 is corner radius
        this.deckOutline.lineStyle(1, COLOR_ENUMS.OP_CREAM);
        this.deckOutline.strokeRoundedRect(this.posX - this.posWidth/2, this.posY-this.posHeight/2, this.posWidth, this.posHeight, 10); // 10 is padding, 15 is corner radius
        this.deckOutline.setDepth(0);
        this.obj.push(this.deckOutline);

        //Card Amount Text
        this.cardAmountText = this.scene.add.text(this.posX, this.posY + this.posHeight/2, "", 
            {font: "25px OnePieceTCGFont", color: COLOR_ENUMS_CSS.OP_WHITE, stroke: COLOR_ENUMS_CSS.OP_BLACK, strokeThickness: 4}
        ).setOrigin(0.5).setDepth(1);
        this.obj.push(this.cardAmountText);

        this.setVisible(false);
    }

    /** Function to prepare the deck 
     * @param {number} numberOfCards - The number of cards in the deck
    */
    createCardPile(numberOfCards) {
        let step = -0.25;
        let delay = 25;
        if(this.playerScene.playerPosition === PLAYER_POSITIONS.TOP) step *=-1;
        for(let i = 0; i<numberOfCards; i++ ) {
            this.scene.time.delayedCall(i*delay, () => {
                this.cardVisuals.push(this.scene.add.image(this.posX-i*step, this.posY+i*step/2, ASSET_ENUMS.CARD_BACK1).setScale(CARD_SCALE.IN_DECK).setDepth(0));
            });
        }

        this.scene.time.delayedCall(numberOfCards*delay, () => {
            this.updateCardAmountText();
        });
    }

    /**
     * Function to add a card visual to the deck
     */
    addDeckVisual() {
        let step = -0.25;
        let lastY = this.cardVisuals[this.cardVisuals.length-1].y;
        let lastX = this.cardVisuals[this.cardVisuals.length-1].x;
        this.cardVisuals.push(this.scene.add.image(lastX-step, lastY-step/2, ASSET_ENUMS.CARD_BACK1).setScale(CARD_SCALE.IN_DECK).setDepth(0));
    }

    /** Function that update the cardAmount Text */
    updateCardAmountText() {
        this.cardAmountText.setText(this.cardVisuals.length);
        this.cardAmountText.setPosition(this.cardVisuals[this.cardVisuals.length-1].x, this.cardVisuals[this.cardVisuals.length-1].y + this.posHeight/2);
    }

    /** Get the top card visual from the deck (back of the card) 
    * @returns {Phaser.GameObjects.Image} image of the top cardback
    */
    getTopCardVisual() {return this.cardVisuals[this.cardVisuals.length-1];}

    /** Pop the top card visual from the deck */
    popTopCardVisual() {
        this.cardVisuals[this.cardVisuals.length-1].destroy();
        this.cardVisuals.splice(this.cardVisuals.length-1, 1);

        this.updateCardAmountText();
    }

}