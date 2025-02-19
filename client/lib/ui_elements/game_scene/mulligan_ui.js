class MulliganUI {

    /**
     * 
     * @param {GameScene} scene 
     */
    constructor(scene) {
        this.scene = scene;

        this.obj = [];

        this.cards = [];

        this.mulliganPositions = []; //Array to store the positions of the cards in the mulligan
    }

    /**Function to create the ui */
    create() {
        this.title = this.scene.add.image(this.scene.screenCenterX, 150, ASSET_ENUMS.IMAGE_MULLIGAN_TITLE)
                .setDepth(4)
                .setOrigin(0.5)
                .setScale(0.3);
        this.obj.push(this.title);
        
        this.keepButton = new Button({
            scene: this.scene,
            x: this.scene.screenWidth*0.66, 
            y: this.scene.screenHeight*0.8,
            width: 150,
            height: 40,
            radius: 5,
            backgroundcolor: COLOR_ENUMS.OP_CREAM,
            outlinecolor: COLOR_ENUMS.OP_CREAM_DARKER,
            text: "Keep",
            fontsize: 30,
            fontfamily: "OnePieceFont",
            textColor: COLOR_ENUMS_CSS.OP_BLACK,
        }).setDepth(4);
        this.keepButton.setInteractive();
        this.keepButton.on('pointerover', () => {this.keepButton.postFX.addGlow(COLOR_ENUMS.OP_WHITE, 2);});
        this.keepButton.on('pointerout', () => {this.keepButton.postFX.clear();});
        this.keepButton.on('pointerdown', () => {this.mulliganCards(false);});
        this.keepButton.setVisible(false);
        //this.obj.push(this.keepButton);

        this.mulliganButton = new Button({
            scene: this.scene,
            x: this.scene.screenWidth*0.33, 
            y: this.scene.screenHeight*0.8,
            width: 150,
            height: 40,
            radius: 5,
            backgroundcolor: COLOR_ENUMS.OP_CREAM,
            outlinecolor: COLOR_ENUMS.OP_CREAM_DARKER,
            text: "Mulligan",
            fontsize: 30,
            fontfamily: "OnePieceFont",
            textColor: COLOR_ENUMS_CSS.OP_BLACK,
        }).setDepth(4);
        this.mulliganButton.setInteractive();
        this.mulliganButton.on('pointerover', () => {this.mulliganButton.postFX.addGlow(COLOR_ENUMS.OP_WHITE, 2);});
        this.mulliganButton.on('pointerout', () => {this.mulliganButton.postFX.clear();});
        this.mulliganButton.on('pointerdown', () => {this.mulliganCards(true);})
        this.mulliganButton.setVisible(false);
        //this.obj.push(this.mulliganButton);

        this.setVisible(false);
    }

    /**
     * Function to start the mulligan
     */
    startMulligan() {
        this.setVisible(true);
    }

    /** Function to set the visible of the panel
     * @param {boolean} visible
     */
    setVisible(visible) {
        for(let obj of this.obj) {
            obj.setVisible(visible);
        }
    }

    /** Function that returns the next position of the item in the mulligan ui
     * @param {number} cardPosition
     * Has 2 possibilities:
     * 1. if it's the initialisation, it usest the cardCounter to keep track of the position
     * 2. if it;s the cards swapping, then it uses the mulliganCounter and the stored positions
     */
    getFutureCardPosition(cardPosition) {
        let startX = this.scene.screenCenterX - (2 * (GAME_UI_CONSTANTS.CARD_ART_WIDTH * CARD_SCALE.IN_MULLIGAN + 20));

        let posX = 0;
        let posY = this.scene.screenCenterY;

        if(this.mulliganPositions.length>0) {
            posX =  this.mulliganPositions[this.mulliganCounter].x;
        } else {
            posX =  startX + (GAME_UI_CONSTANTS.CARD_ART_WIDTH * CARD_SCALE.IN_MULLIGAN + 20) * cardPosition;
        }

        return {x:posX, y:posY};
    }

    /** Add a card to the mulligan array
     * @param {GameCardUI} cardid - card id sent by the server
     */
    addCard(card) {
        this.cards.push(card);
    }

    /** Remove a card form the mulligan array
     * @param {GameCardUI} card - card to be removed
     */
    removeCard(card) {
        let index = -1;
        for(let i=0; i<this.cards.length; i++) {
            if(this.cards[i].id === card.id) {
                index = i;
                break;
            }
        }
        if(index > -1) {
            this.cards.splice(index, 1);
        }
    }

    /** Function to mulligan cards */
    mulliganCards(mulligan) {
        this.keepButton.setVisible(false);
        this.mulliganButton.setVisible(false);

        //Retrieve the card ids
        let cardIds = [];
        if(mulligan) for(let card of this.cards) cardIds.push(card.id);

        this.scene.game.gameClient.requestMulliganCards(cardIds);
    }
}