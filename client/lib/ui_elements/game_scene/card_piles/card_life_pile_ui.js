class CardLifePileUI extends CardPileUI {

    /** Constructor
     * @param {GameScene} scene
     * @param {PlayerScene} playerscene
     */
    constructor(scene, playerscene) {
        super(scene, playerscene);

        this.fanPositioner = playerscene.playerPosition === PLAYER_POSITIONS.BOTTOM ? 1 : -1;

        this.manualFaning = false;
        this.fanDisplayed = false;
    }

    /** Function to add a card to the pile
     * @param {GameCardUI} card
     */
    addCard(card) {
        this.cards.push(card);
    }

    resetCardPositions() {
        for(let i = 0; i < this.cards.length; i++) {
            let card = this.cards[i];
            card.x = this.playerScene.playerInfo.lifeCardPlaceholder.x;
            card.y = this.playerScene.playerInfo.lifeCardPlaceholder.y;
            card.angle = 0;
            card.setDepth(0);
            this.scene.children.moveBelow(card, this.playerScene.playerInfo.playerInfoBackground);
        }
    }


    /** Function to show the life cards */
    showLifeCardFan() {
        this.fanDisplayed = true;

        this.resetCardPositions();

        let numberCards = Math.max(this.cards.length - 1, 0);   
        for(let i = 0; i < this.cards.length; i++) {
            let card = this.cards[i];
            card.setVisible(true);
            this.scene.tweens.add({
                targets: card,
                x: this.playerScene.playerInfo.lifeCardPlaceholder.x,
                y: this.playerScene.playerInfo.lifeCardPlaceholder.y - (this.playerScene.playerInfo.lifeCardPlaceholder.height / 2 + GAME_UI_CONSTANTS.CARD_ART_HEIGHT / 2 * CARD_SCALE.IN_DON_DECK) * this.fanPositioner,
                alpha: { from: 0, to: 1 },
                duration: 400,
                ease: 'Power2',
                delay: i * 10,
                onComplete: () => {
                    if (i === this.cards.length - 1) {
                        let currentIndex = numberCards / 2 - numberCards;
                        for (let j = 0; j < this.cards.length; j++) {
                            let card2 = this.cards[j];
                            let cardAngle = currentIndex * 5; // Adjust the angle between cards
                            let cardY = Math.abs(currentIndex) * 5 * this.fanPositioner; // Adjust the height difference between cards
                            let cardX = currentIndex * 10; // Adjust the horizontal distance between cards
            
                            this.scene.tweens.add({
                                targets: card2,
                                angle: cardAngle,
                                x: card2.x + cardX,
                                y: card2.y + cardY,
                                duration: 400,
                                ease: 'Elastic.easeOut', // Use a more dynamic easing effect
                                delay: j * 20 // Add a slight delay between each card's animation
                            });
                            currentIndex++;
                        }
                    }
                }
            });
        }
    }

    /** Function to hide the life cards */
    hideLifeCardFan() {
        for(let i = 0; i < this.cards.length; i++) {
            let card = this.cards[i];
            
            this.scene.tweens.add({
                targets: card,
                x: this.playerScene.playerInfo.lifeCardPlaceholder.x,
                y: this.playerScene.playerInfo.lifeCardPlaceholder.y - (this.playerScene.playerInfo.lifeCardPlaceholder.height/2 + GAME_UI_CONSTANTS.CARD_ART_HEIGHT/2*CARD_SCALE.IN_DON_DECK) * this.fanPositioner,
                angle: 0,
                duration: 400,
                ease: 'Elastic.easeOut',
                delay: i * 10,
                onComplete: () => {
                    if(i === this.cards.length - 1) {
                        for(let j = 0; j < this.cards.length; j++) {
                            let card = this.cards[j];
                            this.scene.tweens.add({
                                targets: card,
                                x: this.playerScene.playerInfo.lifeCardPlaceholder.x,
                                y: this.playerScene.playerInfo.lifeCardPlaceholder.y,
                                alpha: {from: 1, to: 0},
                                duration: 400,
                                ease: 'Power2',
                                delay: i * 10,
                                onComplete: () => {
                                    card.setVisible(false);
                                    if(j === this.cards.length - 1) {
                                        this.fanDisplayed = false;
                                    }
                                }
                            });
                        }
                    }
                }
            });  
        }
    }


}