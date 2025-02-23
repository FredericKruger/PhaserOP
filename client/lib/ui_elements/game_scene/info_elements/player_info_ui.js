class PlayerInfoUI extends BaseComponentUI{

    /**
     * 
     * @param {GameScene} scene 
     * @param {PlayerScene} playerScene 
     */
    constructor(scene, playerScene) {
        super(scene, playerScene);
        this.backgroundObj = [];

        //Save the player localy
        this.player = playerScene.player;

        //Prepare positionof the deck
        this.posX = this.posY = this.posWidth = this.posHeight = 0;
        if(playerScene.playerPosition === PLAYER_POSITIONS.BOTTOM) {
            this.posX = GAME_UI_CONSTANTS.COMPONENT_SEPARATOR_WIDTH + 450/2;
            this.posY = this.scene.screenHeight - GAME_UI_CONSTANTS.COMPONENT_SEPARATOR_HEIGHT - 150/2;
        } else {
            this.posX = this.scene.screenWidth - GAME_UI_CONSTANTS.COMPONENT_SEPARATOR_WIDTH - 500/2;
            this.posY = GAME_UI_CONSTANTS.COMPONENT_SEPARATOR_HEIGHT + 150/2;
        }
    }

    create() {
        let infoImage = ASSET_ENUMS.GAME_ACTIVE_PLAYER_INFO;
        let glowColor = COLOR_ENUMS.OP_BLUE;
        if(this.playerScene.playerPosition === PLAYER_POSITIONS.TOP) {
            infoImage = ASSET_ENUMS.GAME_PASSIVE_PLAYER_INFO;
            glowColor = COLOR_ENUMS.OP_RED;
        }

        this.playerInfoBackground = this.scene.add.image(this.posX, this.posY, infoImage).setScale(0.15);
        this.playerInfoBackground.preFX.addGlow(glowColor, 1);
        this.backgroundObj.push(this.playerInfoBackground);

        this.posWidth = this.playerInfoBackground.displayWidth;
        this.posHeight = this.playerInfoBackground.displayHeight;

        if(this.playerScene.playerPosition === PLAYER_POSITIONS.BOTTOM) {
            this.activeDonPlaceholder = this.scene.add.image(this.posX + this.posWidth*0.24, this.posY - this.posHeight*0.04, ASSET_ENUMS.DON_CARD).setOrigin(0.5).setScale(CARD_SCALE.DON_IN_ACTIVE_DON).setAngle(15);
            this.restingDonplaceholder = this.scene.add.image(this.posX + this.posWidth*0.46, this.posY + this.posHeight*0.02, ASSET_ENUMS.DON_CARD).setOrigin(0.5).setScale(0.075).setAngle(80);
        } else if(this.playerScene.playerPosition === PLAYER_POSITIONS.TOP) {
            this.activeDonPlaceholder = this.scene.add.image(this.posX - this.posWidth*0.01, this.posY - this.posHeight*0.05, ASSET_ENUMS.DON_CARD).setOrigin(0.5).setScale(CARD_SCALE.DON_IN_ACTIVE_DON).setAngle(15);
            this.restingDonplaceholder = this.scene.add.image(this.posX + this.posWidth*0.175, this.posY + this.posHeight*0.01, ASSET_ENUMS.DON_CARD).setOrigin(0.5).setScale(0.075).setAngle(80);
        }
        this.activeDonPlaceholder.preFX.addGlow(COLOR_ENUMS.OP_WHITE, 5);
        this.restingDonplaceholder.preFX.addGlow(COLOR_ENUMS.OP_WHITE, 5);
        this.backgroundObj.push(this.activeDonPlaceholder);
        this.backgroundObj.push(this.restingDonplaceholder);

        //Save the positions
        this.activePlaceholderPos = {x: this.activeDonPlaceholder.x, y: this.activeDonPlaceholder.y};
        this.restingDonplaceholderPos = {x: this.restingDonplaceholder.x, y: this.restingDonplaceholder.y};
        
        let color = (this.playerScene.playerPosition === PLAYER_POSITIONS.BOTTOM) ? COLOR_ENUMS_CSS.OP_BLUE : COLOR_ENUMS_CSS.OP_RED;
        //Active Don Card Amount
        this.activeDonCardAmountText = this.scene.add.text(this.activePlaceholderPos.x, this.activePlaceholderPos.y, "0", 
            {font: "1000 40px OnePieceTCGFont", color: color, stroke: COLOR_ENUMS_CSS.OP_WHITE, strokeThickness: 4}
        ).setOrigin(0.5).setDepth(1);
        this.obj.push(this.activeDonCardAmountText);
        this.restingDonCardAmountText = this.scene.add.text(this.restingDonplaceholderPos.x, this.restingDonplaceholderPos.y, "0", 
            {font: "1000 25px OnePieceTCGFont", color: color, stroke: COLOR_ENUMS_CSS.OP_WHITE, strokeThickness: 4}
        ).setOrigin(0.5).setDepth(1);
        this.obj.push(this.restingDonCardAmountText);

        //Life text
        if(this.playerScene.playerPosition === PLAYER_POSITIONS.BOTTOM) {
            this.lifeAmountText = this.scene.add.text(this.posX - this.posWidth*0.335, this.posY - this.posHeight*0.04, "",
                {font: "1000 80px OnePieceTCGFont", color: COLOR_ENUMS_CSS.OP_WHITE, stroke: color, strokeThickness: 6}
            ).setOrigin(0.5).setDepth(1);
        } else if(this.playerScene.playerPosition === PLAYER_POSITIONS.TOP) {
            this.lifeAmountText = this.scene.add.text(this.posX + this.posWidth*0.357, this.posY - this.posHeight*0.006, "",
                {font: "1000 80px OnePieceTCGFont", color: COLOR_ENUMS_CSS.OP_WHITE, stroke: color, strokeThickness: 6}
            ).setOrigin(0.5).setDepth(1);
        }
        this.obj.push(this.lifeAmountText);

        this.setVisible(false);
    }

    /** Function toe set the backgruond elements visible
     * @param {boolean} visible
     */
    setBackgroundVisible(visible) {
        for(let obj of this.backgroundObj) {
            obj.setVisible(visible);
        }
    }

    /** Function that set the life amount in the text area
     * @param {number} life
     */
    setLifePoints(life) {this.lifeAmountText.setText(life);}

    /** Function to update the text for the amount of active don cards */
    updateActiveCardAmountText() {this.activeDonCardAmountText.setText(this.playerScene.activeDonDeck.getNumberOfActiveCards());}

    /** Function that updates the text for the amounts to resting don cards */
    updateRestingCardAmountText() {this.restingDonCardAmountText.setText(this.playerScene.activeDonDeck.getNumberOfRestingCards());}

    /** Function that updates both text amounts */
    updateCardAmountTexts() {
        this.updateActiveCardAmountText();
        this.updateRestingCardAmountText();
    }
}