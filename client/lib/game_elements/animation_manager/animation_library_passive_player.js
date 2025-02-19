class AnimationLibraryPassivePlayer {

    /** Constructor
     * @param {GameScene} scene - The scene that will contain the animation manager
     */
    constructor(scene) {
        this.scene = scene;
    }

    /** Returns a tween chain that moves a card from the deck to the mulligan
     * @param {GameCardUI} card - Card to be moved from deck to mulligan
     * @param {number} mulliganPosition - Position in the mulligan
     * @param {number} delay - delay required to start the animation
     * First gets positions in mulligan, then create list of tweens  
     */
    animation_move_card_deck2mulligan(card, mulliganPosition, delay) {
        let startX = this.scene.screenCenterX - (2 * (GAME_UI_CONSTANTS.CARD_ART_WIDTH * CARD_SCALE.IN_MULLIGAN_PASSIVE_PLAYER + 10)); //Figure out starting postion of mullican
        let posX = startX + mulliganPosition * (GAME_UI_CONSTANTS.CARD_ART_WIDTH * CARD_SCALE.IN_MULLIGAN_PASSIVE_PLAYER + 10); //Get the number of cards in the mulligan and adjust x postion
        
        //Create list of tweens
        let animation = [
            { //Tween1: move slightly next to deckpile and adjust scale
                scale: CARD_SCALE.IN_DECK,
                x: card.x + GAME_UI_CONSTANTS.CARD_ART_WIDTH*CARD_SCALE.IN_MULLIGAN_PASSIVE_PLAYER + 20,
                y: card.playerScene.deck.getTopCardVisual().y,
                ease: 'quart.out',
                duration: 250,
                delay: delay,
            }, { //Tween 2: move to mulligan ui
                scale: CARD_SCALE.IN_MULLIGAN_PASSIVE_PLAYER,
                x: posX,
                y: 150,
                duration: 200
            }
        ]
        return animation;
    }

    /** Animation that brings a card from the mulligan UI to the deck
     * First get the deckpile coordinates
     * Tween 1: move the card close to the deckpoile while reducing the scale
     * Tween 2: move the card closer to the deckpile while reducing the x scale to 0. At the end, remove mulligan selection ui and flip the card. Change card state to IN_DECK for hand reflesh
     * Tween 3: reducing scaling to IN_PILE to simulate putting back on top. Move the card on top of the deckpile
     * Tween 4: reduce card scale to 0 to simulate disappearing
     * @param {GameCardUI} card - card to be moved form the mulligan ui to the deck
     * @param {number} delay - delay with which to start the tweens 
     */
    animation_move_card_mulligan2deck(card, delay) {
        let posX = card.playerScene.deck.posX;
        let posY = card.playerScene.deck.posY;

        let animation = [
            { //Tween 1: move the card close to the deckpoile while reducing the scale
                x: posX - (GAME_UI_CONSTANTS.CARD_ART_WIDTH*CARD_SCALE.IN_DECK - 20),
                y: posY,
                scale: CARD_SCALE.IN_DECK,
                duration: 300,
                delay: delay
            }, { //Tween 2: reducing scaling to IN_PILE to simulate putting back on top. Move the card on top of the deckpile
                scale: CARD_SCALE.IN_DECK,
                x: posX,
                duration: 150,
            }
        ];
    
        return animation;
    }

    /** Animation to move a card from the deck to the life deck 
     * First get the life deck coordinates
     * Tween 1: move slightly to the left of the deck pile and reduce x scale to 0. At the end flip the card. Change state of the card for hand update function 
     * Tween 2: move slightly more to the left of the deck pile and increase the y scale
     * Tween 3: move the card to the mulligan card position
     * Tween 4: reduce the card scale to 0 to simulate disappearing
     * @param {GameCardUI} card - card to be moved from the deck to the life deck
     * @param {number} delay - delay with which to start the tweens
     * 
    */
    animation_move_card_deck2lifedeck(card, delay) {
        let posX = card.playerScene.playerInfo.lifeAmountText.x;
        let posY = card.playerScene.playerInfo.lifeAmountText.y;

        let tweens = [
            { //tween1: move slightly to the left of the deck pile and reduce x scale to 0. At the end flip the card. Change state of the card for hand update function
                scaleX: 0,
                scaleY: CARD_SCALE.IN_DECK,
                x: card.x + GAME_UI_CONSTANTS.CARD_ART_WIDTH*0.2/2,
                duration: 150,
                delay: delay,
                onComplete: () => {
                    card.state = CARD_STATES.IN_LIFEDECK;
                }
            }, { //tween2: move slightly more to the left of the deck pile and increase the y scale
                scaleX: CARD_SCALE.IN_DECK,
                scaleY: CARD_SCALE.IN_DECK,
                x: card.x + GAME_UI_CONSTANTS.CARD_ART_WIDTH*0.28 - 20,
                y: card.y - 100,
                ease: 'quart.out',
                duration: 150,
            }, { //tween3: move the card to the mulligan card position
                scale: CARD_SCALE.IN_DECK,
                x: posX,
                y: posY,
                duration: 750,
                onComplete: () => {
                    card.setDepth(0);
                    this.scene.children.moveBelow(card, card.playerScene.playerInfo.lifeAmountText);
                }
            }, {
                delay: 100,
                duration: 10,
                onComplete: () => {
                    card.setVisible(false);
                }
            } 
        ];
        return tweens;
    }

}