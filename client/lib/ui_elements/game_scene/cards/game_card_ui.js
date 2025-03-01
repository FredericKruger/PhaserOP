class GameCardUI extends BaseCardUI{

    //#region CONSTRUCTOR
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
        this.fsmState = new InDeckState(this);
        this.isInPlayAnimation = false;
    }
    //#endregion

    //#region CREATE FUNCTION
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
        let textStyle =  {font: "1000 200px OnePieceFont", color: COLOR_ENUMS_CSS.OP_BLUE, align: "center"};
        if(this.playerScene.playerPosition === PLAYER_POSITIONS.TOP) textStyle = {font: "1000 200px OnePieceFont", color: COLOR_ENUMS_CSS.OP_RED, align: "center"};
        this.attachedDonText = this.scene.add.text(
            - this.backArt.displayWidth*0.5 - GAME_UI_CONSTANTS.CARD_ART_WIDTH/2*CARD_SCALE.DON_IN_ACTIVE_DON, 
            - GAME_UI_CONSTANTS.CARD_ART_HEIGHT*CARD_SCALE.DON_IN_ACTIVE_DON, 'x', 
            textStyle
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
    //#endregion

    //#region UPDATE CARD DATA
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
    //#endregion

    //#region STATE FUNCTIONS
    /** Set card state
     * @param {string} state
     */
    setState(state) {
        this.state = state;
        this.setFSMState(state);

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


    /** Set the Final State Machine state from the state
     * @param {string} state
     */
    setFSMState(state) {
        switch(state) {
            case CARD_STATES.IN_DECK:
            case CARD_STATES.IN_DISCARD:
                this.fsmState.exit(GAME_CARD_STATES.IN_DECK);
                break;
            case CARD_STATES.IN_HAND:
            case CARD_STATES.IN_HAND_HOVERED:
                this.fsmState.exit(GAME_CARD_STATES.IN_HAND);
                break;
            case CARD_STATES.IN_HAND_PASSIVE_PLAYER:
            case CARD_STATES.IN_HAND_HOVERED_PASSIVE_PLAYER:
                this.fsmState.exit(GAME_CARD_STATES.IN_DECK);
                break;
            case CARD_STATES.TRAVELLING_FROM_HAND:
            case CARD_STATES.TRAVELLING_TO_DECK:
            case CARD_STATES.LEADER_TRAVELLING_TO_LOCATION:
            case CARD_STATES.TRAVELLING_TO_HAND:
            case CARD_STATES.IN_MULLIGAN: 
                this.fsmState.exit(GAME_CARD_STATES.TRAVELLING);
                break;
            case CARD_STATES.IN_PLAY:
            case CARD_STATES.IN_PLAY_RESTED:
                this.fsmState.exit(GAME_CARD_STATES.IN_PLAY);
                break;
            case CARD_STATES.IN_PLAY_FIRST_TURN:
                this.fsmState.exit(GAME_CARD_STATES.FIRST_TURN);
                break;
        }
    }
    //#endregion

    //#region UPDATE UI FUNCTIONS
    /** Function to update the power of the card 
     * DON cards are only counted during tje players active turn
    */
    updatePowerText() {
        if(this.playerScene.isPlayerTurn) this.locationPowerText.setText(this.cardData.power + this.attachedDon.length*1000);
        else this.locationPowerText.setText(this.cardData.power);
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
    //#endregion

    //#region UTIL FUNCTIONS
    /** Function to set the exert art
     * @param {string} state
     */
    exertCard(state) {
        //if(state === CARD_STATES.IN_PLAY_FIRST_TURN) this.frontArt.setPipeline(PIPELINE_ENUMS.GREYSCALE_PIPELINE);
        //else this.frontArt.resetPipeline();

        if(state === CARD_STATES.IN_PLAY_RESTED) this.frontArt.angle = -90;
        else if(state === CARD_STATES.IN_PLAY) this.frontArt.angle = 0;
    }
    //#endregion

}