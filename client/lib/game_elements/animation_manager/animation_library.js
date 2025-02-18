class AnimationLibrary {

    /** Constructor
     * @param {GameScene} scene - The scene that will contain the animation manager
     */
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * 
     * @param {GameCardUI} card 
     * @param {number} delay 
     */
    animation_move_card_deck2mulligan(card, mulliganPosition, delay){
        let cardPosition = this.scene.gameStateUI.mulliganUI.getFutureCardPosition(mulliganPosition);

        let tweens = [
            { //tween1: move slightly to the left of the deck pile and reduce x scale to 0. At the end flip the card. Change state of the card for hand update function
                scaleX: 0,
                scaleY: 0.16,
                x: card.x - GAME_UI_CONSTANTS.CARD_ART_WIDTH*0.2/2,
                duration: 100,
                delay: delay,
                onComplete: () => {
                    card.flipCard();
                    card.state = CARD_STATES.IN_MULLIGAN;
                }
            }, { //tween2: move slightly more to the left of the deck pile and increase the y scale
                scaleX: 0.28,
                scaleY: 0.28,
                x: card.x - GAME_UI_CONSTANTS.CARD_ART_WIDTH*0.28 - 20,
                y: card.y - 100,
                ease: 'quart.out',
                duration: 100,
            }, { //tween3: move the card to the mulligan card position
                scale: CARD_SCALE.IN_MULLIGAN,
                x: cardPosition.x,
                y: cardPosition.y,
                duration: 200
            }
        ];
        return tweens;
    }
}