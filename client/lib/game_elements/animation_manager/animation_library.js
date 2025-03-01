class AnimationLibrary {

    //#region CONSTRUCTOR
    /** Constructor
     * @param {GameScene} scene - The scene that will contain the animation manager
     */
    constructor(scene) {
        this.scene = scene;
    }
    //#endregion

    //#region MOVING CARD FUNCTIONS
    /** Animation that brings a card from the deck to the mulligan
     * Get future card position in the mulligan ui
     * tween1: move slightly to the left of the deck pile and reduce x scale to 0. At the end flip the card. Change state of the card for hand update function
     * tween2: move slightly more to the left of the deck pile and increase the y scale
     * tween3: move the card to the mulligan card position
     * @param {GameCardUI} card 
     * @param {number} mulliganPosition
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
                x: posX - (GAME_UI_CONSTANTS.CARD_ART_WIDTH*0.2/2) - (GAME_UI_CONSTANTS.CARD_ART_WIDTH*CARD_SCALE.IN_DECK - 20),
                y: posY,
                scale: 0.2,
                duration: 150,
                delay: delay,
            }, { //Tween 2: move the card closer to the deckpile while reducing the x scale to 0. At the end, remove mulligan selection ui and flip the card. Change card state to IN_DECK for hand reflesh
                scaleX: 0,
                scaleY: 0.18,
                x: posX - (GAME_UI_CONSTANTS.CARD_ART_WIDTH*CARD_SCALE.IN_DECK - 20),
                duration: 75,
                onComplete: () => {
                    card.flipCard();
                    card.setState(CARD_STATES.IN_DECK);
                }
            }, { //Tween 3: reducing scaling to IN_PILE to simulate putting back on top. Move the card on top of the deckpile
                scaleX: CARD_SCALE.IN_DECK,
                scaleY: CARD_SCALE.IN_DECK,
                x: posX,
                duration: 75,
            }, { //Tween 4: reduce card scale to 0 to simulate disappearing
                scaleX: 0,
                scaleY: 0,
                duration: 25
            }
        ];
    
        return animation;
    }

    /** Animation that brings a card from the deck to the life deck
     * First get the deckpile coordinates
     * Tween 1: move the card close to the deckpoile while reducing the scale
     * Tween 2: move the card closer to the deckpile while reducing the x scale to 0. At the end, remove mulligan selection ui and flip the card. Change card state to IN_DECK for hand reflesh
     * Tween 3: reducing scaling to IN_PILE to simulate putting back on top. Move the card on top of the deckpile
     * Tween 4: reduce card scale to 0 to simulate disappearing
     * @param {GameCardUI} card - card to be moved form the mulligan ui to the deck
     * @param {number} delay - delay with which to start the tweens 
     */
    animation_move_card_deck2lifedeck(card, delay) {
        let posX = card.playerScene.playerInfo.lifeAmountText.x;
        let posY = card.playerScene.playerInfo.lifeAmountText.y;

        let tweens = [
            { //tween1: move slightly to the left of the deck pile and reduce x scale to 0. At the end flip the card. Change state of the card for hand update function
                scaleX: 0,
                scaleY: CARD_SCALE.IN_DECK,
                x: card.x - GAME_UI_CONSTANTS.CARD_ART_WIDTH*0.2/2,
                duration: 150,
                delay: delay,
                onComplete: () => {
                    card.state = CARD_STATES.IN_LIFEDECK;
                }
            }, { //tween2: move slightly more to the left of the deck pile and increase the y scale
                scaleX: CARD_SCALE.IN_DECK,
                scaleY: CARD_SCALE.IN_DECK,
                x: card.x - GAME_UI_CONSTANTS.CARD_ART_WIDTH*0.28 - 20,
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

    /** Animation that brings a card from the deck to 
     * @param {GameCardUI} card - card to be moved form the mulligan ui to the deck
     * @param {number} delay - delay with which to start the tweens 
     */
    animation_move_card_deck2hand(card, delay) {
        let animation = [
            { //tween 1: move slightly to the right of the deckpile while reducing x scale to 0. At the end flip the card
                scaleX: 0,
                scaleY: 0.16,
                x: card.x - GAME_UI_CONSTANTS.CARD_ART_WIDTH*0.2/2,
                duration: 250,
                delay: delay,
                onComplete: () => {
                    card.flipCard();
                    card.state = CARD_STATES.TRAVELLING_TO_HAND;
                }
            }, { //tween 2: move slightly to the right of the deckpile while increasing the x scale to match the y scale
                scaleX: 0.28,
                scaleY: 0.28,
                x: card.x - GAME_UI_CONSTANTS.CARD_ART_WIDTH*0.28 - 20,
                y: card.y - 100,
                ease: 'quart.out',
                duration: 500,
            }, {
                delay: 600,
                duration: 10,
                onComplete: () => {
                    //card.setVisible(true);
                }
            }
        ];

        return animation;
    }

    /** Animation that moves a don card from the don deck to the active don area
     * @param {DonCardUI} card - card to be moved from the don deck to the active don area
     * @param {number} delay - delay with which to start the tweens
     */
    animation_move_don_deck2activearea(card, delay) {
        //Get final positions and angles
        let posX = card.playerScene.playerInfo.activeDonPlaceholder.x;
        let posY = card.playerScene.playerInfo.activeDonPlaceholder.y;
        let angle = card.playerScene.playerInfo.activeDonPlaceholder.angle;

        let tweens = [
            { //tween1: move slightly to the left of the deck pile and reduce x scale to 0. At the end flip the card. Change state of the card for hand update function
                scaleX: CARD_SCALE.IN_DON_DECK,
                scaleY: 0,
                y: card.y + GAME_UI_CONSTANTS.CARD_ART_HEIGHT*CARD_SCALE.IN_DON_DECK/2,
                duration: 150,
                delay: delay,
                onComplete: () => {card.flipCard();}
            }, { //tween2: move slightly more to the left of the deck pile and increase the y scale
                scaleX: CARD_SCALE.IN_DON_DECK,
                scaleY: CARD_SCALE.IN_DON_DECK,
                y: card.y + GAME_UI_CONSTANTS.CARD_ART_HEIGHT*CARD_SCALE.IN_DON_DECK + 20,
                ease: 'quart.out',
                duration: 150,
            }, { //tween3: move the card to the mulligan card position
                scale: CARD_SCALE.DON_IN_ACTIVE_DON,
                x: posX,
                y: posY,
                angle: angle,
                duration: 750,
                onComplete: () => {
                    this.scene.children.moveBelow(card, card.playerScene.playerInfo.activeDonCardAmountText);
                }
            }
        ];
        return tweens;
    }

    /** Animation that moves a don card from the character area to the active don area
     * @param {DonCardUI} card - card to be moved from the don deck to the active don area
     * @param {number} delay - delay with which to start the tweens
     */
    animation_move_don_characterarea2activearea(card, delay) {
        //Get final positions and angles
        let posX = card.playerScene.playerInfo.activeDonPlaceholder.x;
        let posY = card.playerScene.playerInfo.activeDonPlaceholder.y;
        let angle = card.playerScene.playerInfo.activeDonPlaceholder.angle;

        let tweens = [
            { //tween3: move the card to the mulligan card position
                scale: CARD_SCALE.DON_IN_ACTIVE_DON,
                x: posX,
                y: posY,
                angle: angle,
                duration: 750,
                delay: delay,
                onComplete: () => {
                    this.scene.children.moveBelow(card, card.playerScene.playerInfo.activeDonCardAmountText);
                }
            }
        ];
        return tweens;
    }
    //#endregion

    //#region APPREARING ANIMATIONS
    /** FUNCTION TO MAKE THE CARD DISAPPEAR THROUGH BURNING 
     * @param {GameCardUI} card - card to be destroyed
     * @param {number} delay - delay with which to start the tweens
     */
    desintegrationAnimation(card, delay) {
        const tempObj = { burnAmount: 0 };
    
        // Animate the burnAmount uniform to gradually increase the burn effect
        let tweens = [{
            onStart: () => {card.frontArt.setPipeline(PIPELINE_ENUMS.BURNING_PIPELINE);},
            delay: delay || 0,
            targets: tempObj,  // Use the temporary object as the target    
            burnAmount: 1,
            duration: 500,
            ease: 'Power2',
            onUpdate: (tween) => {
                card.frontArt.pipeline.set1f('burnAmount', tempObj.burnAmount);
            },
            onComplete: () => {
                card.frontArt.setAlpha(0);
                card.frontArt.resetPipeline();
            }
        }];
        return tweens;
    }

    /** FUNCTION TO MAKE THE CARD DISAPPEAR THROUGH BURNING 
     * @param {GameCardUI} card - card to be destroyed
     * @param {number} delay - delay with which to start the tweens
     */
    integrationAnimation(card, delay) {
        // Create a temporary object to hold the animation value
        const tempObj = { burnAmount: 1 };
    
        // Animate the burnAmount uniform to gradually increase the burn effect
        let tweens = [{
            onStart: () => {
                card.frontArt.setPipeline(PIPELINE_ENUMS.BURNING_PIPELINE);
                card.frontArt.pipeline.set1f('burnAmount', 1); // Start fully burned
                card.frontArt.setAlpha(1);
            },
            delay: delay || 0,
            targets: tempObj,  // Use the temporary object as the target
            burnAmount: 0,  
            duration: 500,
            ease: 'Power2',
            onUpdate: (tween) => {
                card.frontArt.pipeline.set1f('burnAmount', tempObj.burnAmount);
            },
            onComplete: () => {card.frontArt.resetPipeline();}
        }];
        return tweens;
    }
    //#region 

    shakingAnimation(card) {
        //Save old positions
        let posX = card.x;
    
        this.scene.tweens.add({
            targets: card,
            x: { from: posX - 5, to: posX + 5 }, // Move left and right
            duration: 50, // Duration of each shake
            yoyo: true, // Move back to the original position
            repeat: 2, // Repeat the shake 2 times
            onComplete: () => { card.x = posX; } // Reset the x position
        });
    }
}