class CardLifePileUI extends CardPileUI {

    /** Constructor
     * @param {GameScene} scene
     * @param {PlayerScene} playerscene
     */
    constructor(scene, playerscene) {
        super(scene, playerscene);

        this.fanDisplayed = false;
    }

    /** Function to add a card to the pile
     * @param {GameCardUI} card
     */
    addCard(card) {
        this.cards.push(card);
    }

    showLifeCardFan() {
        this.fanDisplayed = true;

        for(let i = 0; i < this.cards.length; i++) {
            let card = this.cards[i];
            card.setDepth(0);
            card.setVisible(true);
            this.scene.tweens.add({
                targets: card,
                x: this.playerScene.playerInfo.lifeCardPlaceholder.x,
                y: this.playerScene.playerInfo.lifeCardPlaceholder.y - this.playerScene.playerInfo.lifeCardPlaceholder.height/2 - GAME_UI_CONSTANTS.CARD_ART_HEIGHT/2*CARD_SCALE.IN_DON_DECK,
                alpha: {from: 0, to: 1},
                duration: 500,
                ease: 'Power2',
                delay: i * 10
            });
        }
    }

    hideLifeCardFan() {
        this.fanDisplayed = false;

        for(let i = 0; i < this.cards.length; i++) {
            let card = this.cards[i];
            card.setDepth(0);
            
            this.scene.tweens.add({
                targets: card,
                x: this.playerScene.playerInfo.lifeCardPlaceholder.x,
                y: this.playerScene.playerInfo.lifeCardPlaceholder.y,
                alpha: {from: 1, to: 0},
                duration: 500,
                ease: 'Power2',
                delay: i * 10,
                onComplete: () => {card.setVisible(false);}
            });
        }
    }


}