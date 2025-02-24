class GameCardUI extends BaseCardUI{

    /**
     * 
     * @param {GameScene} scene 
     * @param {PlayerScene} playerScene 
     * @param {Object} config 
     */
    constructor(scene, playerScene, config){ 
        super(scene, playerScene, config);

        this.cardData = config.cardData;
        this.id = config.id;

        //Attahed Cards
        this.attachedDon = [];
        this.attachedCounter = null;

        //STATE VARIABLES
        this.isInPlayAnimation = false;
    }

    /**Function to create the card */
    create() {
        //Call Parent create
        super.create();
        
        //Prepare power box
        this.powerBox = this.scene.add.graphics();
        this.drawPowerBox(COLOR_ENUMS.OP_BLACK);
        this.powerBox.setVisible(this.state === CARD_STATES.IN_HAND);
        this.obj.push(this.powerBox);

        //In Location Power Text
        this.locationPowerText = this.scene.add.text(
            0, this.backArt.displayHeight*0.5, '',
            {font: "1000 150px OnePieceTCGFont", color: COLOR_ENUMS_CSS.OP_WHITE, align: "center",
                stroke: COLOR_ENUMS_CSS.OP_BLACK, strokeThickness: 10
            }
        ).setOrigin(0.5);
        this.obj.push(this.locationPowerText);

        //Prepare cost icon
        this.costIcon = this.scene.add.image(-this.backArt.displayWidth*0.46, -this.backArt.displayHeight*0.46, '');
        this.costIcon.setScale(1.8);
        this.costIcon.preFX.addGlow(COLOR_ENUMS.OP_WHITE, 4);
        this.costIcon.setVisible(this.state === CARD_STATES.IN_HAND);
        this.obj.push(this.costIcon);

        //Prepare powerTest
        this.powerText = this.scene.add.text(
            -this.backArt.displayWidth*0.5 + this.backArt.displayWidth*0.06, 
            -this.backArt.displayHeight*0.5 + this.backArt.displayHeight*0.175, 
            "10000", 
            {font: "60px OnePieceTCGFont", color: COLOR_ENUMS_CSS.OP_WHITE, align: "right"}
        );
        this.powerText.setAngle(-90);
        this.powerText.setOrigin(1, 0.5);
        this.powerText.setVisible(this.state === CARD_STATES.IN_HAND);
        this.obj.push(this.powerText);

        //Prepare counter icon
        this.counterIcon = this.scene.add.image(-this.backArt.displayWidth*0.5 + this.backArt.displayWidth*0.175, -this.backArt.displayHeight*0.5 + this.backArt.displayHeight*0.015, ASSET_ENUMS.ICON_COUNTER);
        this.counterIcon.setScale(0.25);
        this.counterIcon.setVisible(this.state === CARD_STATES.IN_HAND);
        this.obj.push(this.counterIcon);

        //Text for the attached don amount
        this.attachedDonText = this.scene.add.text(
            - this.backArt.displayWidth*0.5 - GAME_UI_CONSTANTS.CARD_ART_WIDTH/2*CARD_SCALE.DON_IN_ACTIVE_DON, 
            - GAME_UI_CONSTANTS.CARD_ART_HEIGHT*CARD_SCALE.DON_IN_ACTIVE_DON, 'x', 
            {font: "1000 200px OnePieceFont", color: COLOR_ENUMS_CSS.OP_BLUE, align: "center"}
        ).setOrigin(0.5);
        this.attachedDonText.setAngle(-20);
        this.attachedDonText.setVisible(false);
        this.obj.push(this.attachedDonText);

        this.setScale(this.currentScale);
    }

    //Draw the powerBox 
    drawPowerBox(color) {
        this.powerBox.clear();
        this.powerBox.fillStyle(color, 1); // Black color with 50% opacity
        this.powerBox.fillRoundedRect(
            -this.backArt.displayWidth*0.5, 
            -this.backArt.displayHeight*0.5, 
            this.backArt.displayWidth*0.12,
            this.backArt.displayHeight, 
            {tl: 10, tr: 0, br: 0, bl:10}); // 10 is padding, 15 is corner
    }

    /** Update Card Data 
     * @param {Object} cardData
     * @param {boolean} flipCard
    */
    updateCardData(cardData, flipCard) {
        this.cardData = cardData;
        
        let textures = [];
        let cardArtKey = this.cardData.art;

        let callback = () => {
            this.frontArt.setTexture(this.cardData.art);
            if(this.playerScene.player.isActivePlayer) {
                this.costIcon.setTexture(this.scene.game.utilFunctions.getCardCost(this.cardData.colors, this.cardData.cost));
                this.drawPowerBox(this.scene.game.utilFunctions.getCardColor(this.cardData.colors[0]));
                this.powerText.setText(this.cardData.power);
                this.counterIcon.setVisible(this.cardData.counter && this.state === CARD_STATES.IN_HAND);
            }

            this.locationPowerText.setText(this.cardData.power);
            this.locationPowerText.setVisible(this.state === CARD_STATES.IN_PLAY || this.state === CARD_STATES.IN_PLAY_RESTED);
            if(flipCard) this.flipCard();

            this.setDepth(this.cardDepth);
        };

        textures.push({
            key: cardArtKey,
            path: `assets/cardart/${cardArtKey}.png`
        });
        this.scene.game.loaderManager.addJob(new LoaderJob(this.scene, textures, callback));       
    }

    /** Function to reposition all the attached don cards */
    updateAttachedDonPosition() {
        for(let don of this.attachedDon) {
            this.scene.children.moveBelow(don, this);
            don.scaleTo(CARD_SCALE.DON_IN_ACTIVE_DON, true, false, false);
            don.moveTo(this.x - this.displayWidth/2, this.y, true, false, false);
            don.angleTo(-20, true, false, false);
        }
        
        this.attachedDonText.setText("x" + this.attachedDon.length);
        this.attachedDonText.setVisible(this.attachedDon.length > 1);
        //this.scene.children.bringToTop(this.attachedDonText);
    }

    /** Function to set the exert art
     * @param {string} state
     */
    exertCard(state) {
        if(state === CARD_STATES.IN_PLAY_RESTED) this.frontArt.setPipeline(PIPELINE_ENUMS.GREYSCALE_PIPELINE);
        else this.frontArt.resetPipeline();
    }

    /** Set card state */
    setState(state) {
        this.state = state;

        //Only show the art if ths card is from the active player
        if(this.playerScene.player.isActivePlayer) {
            this.powerBox.setVisible(this.state === CARD_STATES.IN_HAND);
            this.costIcon.setVisible(this.state === CARD_STATES.IN_HAND);
            this.powerText.setVisible(this.state === CARD_STATES.IN_HAND);
            this.counterIcon.setVisible(this.state === CARD_STATES.IN_HAND && this.cardData.counter);
        }
        this.locationPowerText.setVisible(this.state === CARD_STATES.IN_PLAY || this.state === CARD_STATES.IN_PLAY_RESTED);

        this.exertCard(this.state);
    }

    /** Function to update the power of the card 
     * DON cards are only counted during tje players active turn
    */
    updatePowerText() {
        if(this.playerScene.isPlayerTurn) this.locationPowerText.setText(this.cardData.power + this.attachedDon.length*1000);
        else this.locationPowerText.setText(this.cardData.power);
    }

}