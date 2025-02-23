class CharacterAreaUI extends CardPileUI {

    /**
     * 
     * @param {GameScene} scene 
     * @param {PlayerScene} playerScene 
     */
    constructor(scene, playerScene) {
        super(scene, playerScene);

        this.scene = scene;
        this.playerScene = playerScene;

        this.posX = this.posY = 0;
        this.posX = this.scene.screenCenterX;
        
        if(this.playerScene.playerPosition === PLAYER_POSITIONS.BOTTOM) {
            this.posY = this.scene.screenCenterY + GAME_UI_CONSTANTS.CARD_ART_HEIGHT * 0.5 * CARD_SCALE.IN_LOCATION;
        } else {
            this.posY = this.scene.screenCenterY - 30 - GAME_UI_CONSTANTS.CARD_ART_HEIGHT * 0.5 * CARD_SCALE.IN_LOCATION;
        }
    }

    /** Function to create the panel */
    create() {
        if(this.playerScene.player.isActivePlayer) {
            this.dropZone = this.scene.add.zone(
                this.scene.screenWidth*0.15, this.scene.screenHeight*0.15, 
                this.scene.screenWidth*0.7, this.scene.screenHeight*0.7
            ).setRectangleDropZone(this.scene.screenWidth*0.7, this.scene.screenHeight*0.7).setOrigin(0);
            this.dropZone.setData({name: "CharacterArea", chatacterArea: this});
        } 
    }

    /** Funciton to update the character area */
    update() {
        let numberCards = Math.max(this.cards.length-1, 0);
        let currentIndex = numberCards/2 - numberCards;

        //Iterate through cards
        for(let i=0; i<this.cards.length; i++) {
            let card = this.cards[i];

            let cardX = this.posX - currentIndex * (GAME_UI_CONSTANTS.CARD_ART_WIDTH * CARD_SCALE.IN_LOCATION + 20);
            let cardY = this.posY;
            card.moveTo(cardX, cardY, true, false, false);
            card.scaleTo(CARD_SCALE.IN_LOCATION, true, false, false);

            currentIndex++;
        }
    }

    /** Function to add a card
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
        let tweens = [
            { //Tween 1: At start show card art, then rotate 90 deg, move to new positon and scale to IN_PLAY scaling
                onStart: () => {
                    
                },
                scale: CARD_SCALE.IN_LOCATION, 
                duration: 100
            }
        ]
        return tweens;
    }
}