class CardHandUI extends CardPileUI {

    /**
     * 
     * @param {GameScene} scene 
     * @param {PlayerScene} playerScene 
     */
    constructor(scene, playerScene) {
        super(scene, playerScene);

        //Set Y position
        this.handY = 0;
        if(playerScene.playerPosition === PLAYER_POSITIONS.BOTTOM) {
            this.handY = this.scene.screenCenterY + this.scene.screenHeight / 2 - 30;
        } else {
            this.handY = 30;
        }
    }

    /**
     * Function that adds new cards to the hand
     * @param {Array<number>} card 
     */
    addCards(card) {
        this.cards.push(card);
        //this.updateHand();
    }

}