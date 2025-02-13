class CardLocationUI {

    /**
     * 
     * @param {GameScene} scene 
     * @param {PlayerScene} playerScene 
     * @param {string} id 
     */
    constructor(scene, playerScene, id) {
        this.scene = scene;
        this.playerScene = playerScene;
        this.id = id;

        //Cardvisual
        this.card = null;

        //Prepare positionof the deck
        this.posX = this.posY = this.posWidth = this.posHeight = 0;
        this.posScale = 1;
        if(id === "Leader") {
            this.posScale = CARD_SCALE.IN_LOCATION;
            if(playerScene.playerPosition === PLAYER_POSITIONS.BOTTOM) {
                this.posX = this.scene.screenCenterX;
                this.posY = this.scene.screenHeight * 0.85;
            } else {
                this.posX = this.scene.screenCenterX;
                this.posY = this.scene.screenHeight * 0.15;
            }
        } else if(id === "Stage") {
            this.posScale = CARD_SCALE.IN_LOCATION;
            if(playerScene.playerPosition === PLAYER_POSITIONS.BOTTOM) {
                this.posX = this.playerScene.donDeck.posX + this.playerScene.donDeck.posWidth/2 + GAME_UI_CONSTANTS.COMPONENT_SEPARATOR_WIDTH + this.posScale * GAME_UI_CONSTANTS.CARD_ART_WIDTH/2;
                this.posY = this.playerScene.donDeck.posY + ((CARD_SCALE.IN_DON_DECK - CARD_SCALE.IN_LOCATION) * GAME_UI_CONSTANTS.CARD_ART_HEIGHT)/2;;
            } else {
                this.posX = this.playerScene.donDeck.posX - this.playerScene.donDeck.posWidth/2 - GAME_UI_CONSTANTS.COMPONENT_SEPARATOR_WIDTH - this.posScale * GAME_UI_CONSTANTS.CARD_ART_WIDTH/2;
                this.posY = this.playerScene.donDeck.posY - ((CARD_SCALE.IN_DON_DECK - CARD_SCALE.IN_LOCATION) * GAME_UI_CONSTANTS.CARD_ART_HEIGHT)/2;
            }
        }
        this.posWidth = GAME_UI_CONSTANTS.CARD_ART_WIDTH * this.posScale;
        this.posHeight = GAME_UI_CONSTANTS.CARD_ART_HEIGHT * this.posScale;

    }

    create() {
        //Create Outline
        this.deckOutline = this.scene.add.graphics();
        this.deckOutline.fillStyle(COLOR_ENUMS.OP_BLACK, 0.6); // Black color with 50% opacity
        this.deckOutline.fillRoundedRect(this.posX - this.posWidth/2 - 5, this.posY-this.posHeight/2 - 5, this.posWidth + 10, this.posHeight + 10, 1); // 10 is padding, 15 is corner radius
        this.deckOutline.lineStyle(1, COLOR_ENUMS.OP_BLACK);
        this.deckOutline.strokeRoundedRect(this.posX - this.posWidth/2 - 5, this.posY-this.posHeight/2 - 5, this.posWidth + 10, this.posHeight + 10, 1); // 10 is padding, 15 is corner radius
        this.deckOutline.setDepth(0);
    }

}