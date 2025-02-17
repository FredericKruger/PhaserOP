class DonDeckUI extends CardPileUI {

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
            this.posX = 250 + (GAME_UI_CONSTANTS.CARD_ART_WIDTH * CARD_SCALE.IN_DON_DECK)/2;
            this.posY = this.scene.screenHeight * 0.65;
        } else {
            this.posX = this.scene.screenWidth -  250 - (GAME_UI_CONSTANTS.CARD_ART_WIDTH * CARD_SCALE.IN_DON_DECK)/2;
            this.posY = this.scene.screenHeight * 0.35;
        }
        this.posWidth = GAME_UI_CONSTANTS.CARD_ART_WIDTH * CARD_SCALE.IN_DON_DECK;
        this.posHeight = GAME_UI_CONSTANTS.CARD_ART_HEIGHT * CARD_SCALE.IN_DON_DECK; 
    }

    //Function to draw the deck ui elments
    create() {
        //Determine the color
        let color = COLOR_ENUMS.OP_BLUE;
        if(this.playerScene.playerPosition === PLAYER_POSITIONS.TOP) color = COLOR_ENUMS.OP_RED;

        //Create Outline
        this.deckOutline = this.scene.add.graphics();
        this.deckOutline.fillStyle(color, 0.5); // Black color with 50% opacity
        this.deckOutline.fillRoundedRect(this.posX - this.posWidth/2 + 5, this.posY-this.posHeight/2 + 5, this.posWidth-10, this.posHeight-10, 5); // 10 is padding, 15 is corner radius
        this.deckOutline.lineStyle(1, color);
        this.deckOutline.strokeRoundedRect(this.posX - this.posWidth/2 + 5, this.posY-this.posHeight/2 + 5, this.posWidth-10, this.posHeight-10, 5); // 10 is padding, 15 is corner radius
        this.deckOutline.setDepth(0);
        this.obj.push(this.deckOutline);

        //Card Amount Text
        this.cardAmountText = this.scene.add.text(this.posX, this.posY + this.posHeight/2, "", 
            {font: "25px OnePieceTCGFont", color: COLOR_ENUMS_CSS.OP_WHITE, stroke: COLOR_ENUMS_CSS.OP_BLACK, strokeThickness: 4}
        ).setOrigin(0.5).setDepth(1);
        this.obj.push(this.cardAmountText);

        //Create Title
        this.donImage = this.scene.add.image(this.posX - this.posWidth/4, this.posY - this.posHeight/2 - 15, ASSET_ENUMS.GAME_DON_SMALL);
        this.donImage.setScale(0.5).setDepth(0).preFX.addGlow(COLOR_ENUMS.OP_BLACK, 1);
        this.obj.push(this.donImage);

        this.setVisible(false);
    }

    /** Function to prepare the deck 
     * @param {number} numberOfCards - The number of cards in the deck
    */
    createCardPile(numberOfCards) {
        let step = 1;
        if(this.playerScene.playerPosition === PLAYER_POSITIONS.TOP) step *=-1;
        for(let i = 0; i<numberOfCards; i++ ) {
            this.cardVisuals.push(this.scene.add.image(this.posX-i*step, this.posY+i*step/2, ASSET_ENUMS.CARD_BACK2).setScale(CARD_SCALE.IN_DON_DECK));
        }

        this.updateCardAmountText();
    }

    /** Function that update the cardAmount Text */
    updateCardAmountText() {
        this.cardAmountText.setText(this.cards.cardVisuals);
        this.cardAmountText.setPosition(this.cardVisuals[this.cardVisuals.length-1].x, this.cardVisuals[this.cardVisuals.length-1].y + this.posHeight/2);
    }

}