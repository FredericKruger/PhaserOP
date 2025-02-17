class CardLocationUI extends CardPileUI {

    /**
     * 
     * @param {GameScene} scene 
     * @param {PlayerScene} playerScene 
     * @param {string} id 
     */
    constructor(scene, playerScene, id) {
        super(scene, playerScene);
        this.id = id;

        //Prepare positionof the deck
        this.posX = this.posY = this.posWidth = this.posHeight = 0;
        this.posScale = 1;
        if(id === CARD_TYPES.LEADER) {
            this.posScale = CARD_SCALE.IN_LOCATION;
            if(playerScene.playerPosition === PLAYER_POSITIONS.BOTTOM) {
                this.posX = this.scene.screenCenterX;
                this.posY = this.scene.screenHeight * 0.81;
            } else {
                this.posX = this.scene.screenCenterX;
                this.posY = this.scene.screenHeight * 0.19;
            }
        } else if(id === CARD_TYPES.STAGE) {
            this.posScale = CARD_SCALE.IN_LOCATION;
            if(playerScene.playerPosition === PLAYER_POSITIONS.BOTTOM) {
                this.posX = this.playerScene.donDeck.posX + this.playerScene.donDeck.posWidth/2 + GAME_UI_CONSTANTS.COMPONENT_SEPARATOR_WIDTH + this.posScale * GAME_UI_CONSTANTS.CARD_ART_WIDTH/2;
                this.posY = this.playerScene.donDeck.posY - ((CARD_SCALE.IN_LOCATION - CARD_SCALE.IN_DON_DECK) * GAME_UI_CONSTANTS.CARD_ART_HEIGHT)/2;;
            } else {
                this.posX = this.playerScene.donDeck.posX - this.playerScene.donDeck.posWidth/2 - GAME_UI_CONSTANTS.COMPONENT_SEPARATOR_WIDTH - this.posScale * GAME_UI_CONSTANTS.CARD_ART_WIDTH/2;
                this.posY = this.playerScene.donDeck.posY - ((CARD_SCALE.IN_LOCATION - CARD_SCALE.IN_DON_DECK) * GAME_UI_CONSTANTS.CARD_ART_HEIGHT)/2;
            }
        }
        this.posWidth = GAME_UI_CONSTANTS.CARD_ART_WIDTH * this.posScale;
        this.posHeight = GAME_UI_CONSTANTS.CARD_ART_HEIGHT * this.posScale;

    }

    /** Function to create the location */
    create() {
        //Create Outline
        this.deckOutline = this.scene.add.graphics();
        this.deckOutline.fillStyle(COLOR_ENUMS.OP_BLACK, 0.6); // Black color with 50% opacity
        this.deckOutline.fillRoundedRect(this.posX - this.posWidth/2 - 5, this.posY-this.posHeight/2 - 5, this.posWidth + 10, this.posHeight + 10, 1); // 10 is padding, 15 is corner radius
        this.deckOutline.lineStyle(1, COLOR_ENUMS.OP_BLACK);
        this.deckOutline.strokeRoundedRect(this.posX - this.posWidth/2 - 5, this.posY-this.posHeight/2 - 5, this.posWidth + 10, this.posHeight + 10, 1); // 10 is padding, 15 is corner radius
        this.deckOutline.setDepth(0);
        this.obj.push(this.deckOutline);

        this.setVisible(false);
    }

    /** Function that adds a card to the location
     * @param {GameCardUI} card
     */
    addCard(card) {
        this.cards.push(card);
    }
    
    /** ANIMATION */
    
    /** Add a card to the area
     * @param {GameCardUI} card
     */
    addCardAnimation(card) {
        let tweens = null;
        if(card.cardData.card === CARD_TYPES.STAGE) {
            tweens = [
                { //Tween 1: At start show card art, then rotate 90 deg, move to new positon and scale to IN_PLAY scaling
                    onStart: () => {
                        
                    },
                    scale: CARD_SCALE.IN_LOCATION,
                    x: this.posX,
                    y: this.posY, 
                    duration: 100
                }
            ]
        }

        return tweens;
    }
}