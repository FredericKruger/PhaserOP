class AnimationLibraryPassivePlayer {

    //#region CONSTRUCTOR
    /** Constructor
     * @param {GameScene} scene - The scene that will contain the animation manager
     */
    constructor(scene) {
        this.scene = scene;
    }
    //#endregion

    //#region MOVE CARD FUNCTIONS
    /** Returns a tween chain that moves a card from the deck to the mulligan
     * @param {GameCardUI} card - Card to be moved from deck to mulligan
     * @param {number} mulliganPosition - Position in the mulligan
     * @param {number} delay - delay required to start the animation
     * First gets positions in mulligan, then create list of tweens  
     */
    animation_move_card_deck2mulligan(card, mulliganPosition, delay) {
        // Calculate final position in mulligan area
        let startX = this.scene.screenCenterX - (2 * (GAME_UI_CONSTANTS.CARD_ART_WIDTH * CARD_SCALE.IN_MULLIGAN_PASSIVE_PLAYER + 10));
        let posX = startX + mulliganPosition * (GAME_UI_CONSTANTS.CARD_ART_WIDTH * CARD_SCALE.IN_MULLIGAN_PASSIVE_PLAYER + 10);
        
        // Calculate arc path for more dynamic movement
        const arcHeight = 50 + Math.random() * 30; // Random arc height
        const midY = card.y - arcHeight; // Peak of the arc
        const midX = card.x + (posX - card.x) * 0.4; // Control point along the path
        
        // Add subtle random rotation for more natural card movement
        const randomRotation = (Math.random() * 0.2) - 0.1; // Between -0.1 and 0.1 radians
        
        // Create list of tweens with more dynamic movement
        let animation = [
            { // Phase 1: Initial "pop" from deck with slight rotation
                scale: CARD_SCALE.IN_DECK * 0.9,
                x: card.x + 20, // Small shift from deck
                y: card.y - 15, // Small lift
                rotation: randomRotation * 0.5,
                ease: 'Back.easeOut', // Add slight bounce for "pop" effect
                duration: 120,
                delay: delay
            }, 
            { // Phase 2: Arc movement toward mulligan position
                scale: CARD_SCALE.IN_DECK * 1.1, // Slightly larger during arc
                x: midX,
                y: midY,
                rotation: randomRotation,
                ease: 'Sine.easeOut',
                duration: 180
            },
            { // Phase 3: Final approach to mulligan position
                scale: CARD_SCALE.IN_MULLIGAN_PASSIVE_PLAYER * 1.05, // Slightly larger
                x: posX,
                y: 150 - 10, // Slightly above final position
                rotation: 0, // Straighten out the card
                ease: 'Power2.easeOut',
                duration: 150
            },
            { // Phase 4: Settle into position with subtle bounce
                scale: CARD_SCALE.IN_MULLIGAN_PASSIVE_PLAYER,
                y: 150,
                ease: 'Back.easeOut',
                duration: 120,
                onComplete: () => {
                    // Ensure correct final state
                    card.setState(CARD_STATES.IN_MULLIGAN);
                    
                    // Optional: Add subtle card pulse to emphasize arrival
                    this.scene.tweens.add({
                        targets: card,
                        scaleX: CARD_SCALE.IN_MULLIGAN_PASSIVE_PLAYER * 1.03,
                        scaleY: CARD_SCALE.IN_MULLIGAN_PASSIVE_PLAYER * 1.03,
                        duration: 100,
                        yoyo: true,
                        ease: 'Sine.easeInOut'
                    });
                }
            }
        ];
        
        return animation;
    }

    /** Animation that brings a card from the mulligan UI to the deck
     * @param {GameCardUI} card - card to be moved from the mulligan UI to the deck
     * @param {number} delay - delay with which to start the tweens 
     * @returns {Array} - Array of tween configurations
     */
    animation_move_card_mulligan2deck(card, delay) {
        let posX = card.playerScene.deck.posX;
        let posY = card.playerScene.deck.posY;

        // Calculate a more dynamic arc path
        const arcHeight = 60 + Math.random() * 40; // Random arc height for dynamic movement
        const midX = (card.x + posX) / 2;
        const controlY = posY - arcHeight;

        // Add subtle random rotation for more natural movement
        const randomRotation = (Math.random() * 0.15) - 0.075;

        let animation = [
            { // Phase 1: Quick lift and prepare for journey
                x: card.x, 
                y: card.y - 30, // Initial lift
                rotation: randomRotation * 0.5,
                scale: 0.2, // Shrink as it starts moving
                duration: 70,
                delay: delay,
                ease: 'Power2.easeOut'
            }, 
            { // Phase 2: Arc movement - flying through air
                x: midX,
                y: controlY, 
                scaleX: 0.17, 
                scaleY: 0.17,
                rotation: randomRotation,
                duration: 100,
                ease: 'Quad.easeInOut',
            },
            { // Phase 3: Approach to deck
                x: posX - 20, // Position just before final
                y: posY - 15,
                scale: 0.15, // Continuing to shrink
                rotation: 0, // Straighten out
                duration: 70,
                ease: 'Power3.easeIn',
                onComplete: () => {
                    card.setState(CARD_STATES.IN_DECK);
                    
                    // Add deck ripple effect
                    const deckPile = card.playerScene.deck;
                    if (deckPile) {
                        card.scene.tweens.add({
                            targets: deckPile,
                            scaleX: 1.03, // Small ripple
                            scaleY: 1.03,
                            duration: 70,
                            yoyo: true,
                            ease: 'Quad.easeInOut'
                        });
                    }
                }
            },
            { // Phase 5: Quick settle into deck
                scaleX: CARD_SCALE.IN_DECK,
                scaleY: CARD_SCALE.IN_DECK,
                x: posX,
                y: posY,
                duration: 40,
                ease: 'Sine.easeOut',
            },
            { // Phase 6: Disappear into deck
                scaleX: 0,
                scaleY: 0,
                duration: 25,
                ease: 'Power1.easeIn'
            }
        ];

        return animation;
    }

    /** Animation to move a card from the deck to the life deck 
     * @param {GameCardUI} card - card to be moved from the deck to the life deck
     * @param {number} delay - delay with which to start the tweens
     * @returns {Array} - Array of tween configurations
     */
    animation_move_card_deck2lifedeck(card, delay) {
        let posX = card.playerScene.playerInfo.lifeAmountText.x;
        let posY = card.playerScene.playerInfo.lifeAmountText.y;

        // Calculate a very subtle downward arc path
        const arcHeight = 15 + Math.random() * 10; // Minimal arc height (15-25px)
        const midX = card.x + (posX - card.x) * 0.4;
        const midY = Math.max(card.y, posY) + arcHeight; // Small peak below the straight path
        
        // Add very subtle random rotation
        const randomRotation = (Math.random() * 0.1) - 0.05; // Even smaller rotation range

        let tweens = [
            { // Phase 1: Initial movement from deck
                scale: CARD_SCALE.IN_DECK * 1.05, // Less scale change
                y: card.y + 5, // Minimal initial movement
                rotation: randomRotation * 0.3,
                duration: 120,
                delay: delay,
                ease: 'Power2.easeOut', // Changed from Back to Power for less bounce
            },
            { // Phase 2: Begin arc movement (no card flipping)
                scale: CARD_SCALE.IN_DECK * 0.95, // Start shrinking
                x: card.x + (midX - card.x) * 0.3,
                y: card.y + 10, // Continue downward
                rotation: randomRotation * 0.5,
                duration: 130,
                ease: 'Power1.easeOut',
                onComplete: () => {
                    // Change state during arc movement
                    card.state = CARD_STATES.IN_LIFEDECK;
                }
            },
            { // Phase 3: Continue arc downward
                scale: CARD_SCALE.IN_DECK * 0.85,
                x: midX,
                y: midY, // Below straight-line path
                rotation: randomRotation,
                duration: 150, // Shorter duration
                ease: 'Sine.easeInOut',
            },
            { // Phase 4: Begin approach to life area
                scale: CARD_SCALE.IN_DECK * 0.75,
                x: posX - 20, // Closer approach
                y: posY + 10, // Approach from below
                rotation: randomRotation * 0.5,
                duration: 150, // Shorter duration
                ease: 'Power1.easeIn'
            },
            { // Phase 5: Final approach to life counter
                scale: CARD_SCALE.IN_DECK * 0.7,
                x: posX,
                y: posY,
                rotation: 0,
                duration: 130, // Shorter duration
                ease: 'Quad.easeOut',
                onComplete: () => {
                    card.setDepth(0);
                    this.scene.children.moveBelow(card, card.playerScene.playerInfo.lifeAmountText);
                    
                    // Create a pulse effect on the life counter text
                    const lifeText = card.playerScene.playerInfo.lifeAmountText;
                    if (lifeText) {
                        card.scene.tweens.add({
                            targets: lifeText,
                            scale: 1.2,
                            duration: 150,
                            yoyo: true,
                            ease: 'Sine.easeInOut'
                        });
                    }
                }
            },
            { // Phase 6: Merge into life counter
                scale: CARD_SCALE.IN_DECK * 0.9,
                alpha: 0,
                duration: 100, // Faster disappearance
                ease: 'Power1.easeIn', // Changed from Back to Power for less bounce
                onComplete: () => {
                    card.setVisible(false);
                }
            }
        ];
        
        return tweens;
    }

    /** Animation to move a card from the deck to the hand for the passive player
     * @param {GameCardUI} card - card to be moved from the deck to the hand
     * @param {number} delay - delay with which to start the tweens
     * @returns {Array} - Array of tween configurations
     */
    animation_move_card_deck2hand(movingCard, delay, reveal = false) {
        // Calculate initial and intermediate positions
        const startX = movingCard.x;
        const startY = movingCard.y;
        const intermediateX = startX + GAME_UI_CONSTANTS.CARD_ART_WIDTH * 0.15;
        const intermediateY = startY - 15;
        
        // Setup dimensions for the animation
        const finalScale = 0.28; // Final scale before going to hand
        
        let animation = [
            { // Phase 1: Draw card from deck with slight upward movement
                targets: movingCard,
                scale: CARD_SCALE.IN_DECK * 0.95,
                x: intermediateX,
                y: intermediateY,
                duration: 180,
                delay: delay,
                ease: 'Power2.easeOut',
                onStart: () => {
                    // Set proper depth for animation
                    movingCard.setDepth(DEPTH_VALUES.CARD_IN_MULLIGAN);
                }
            }
        ];

        animation = animation.concat(
            { // Phase 3: Move toward hand position
                targets: movingCard,
                scaleX: finalScale,
                scaleY: finalScale,
                x: startX + GAME_UI_CONSTANTS.CARD_ART_WIDTH * 0.5,
                y: startY - 100,
                rotation: 0,
                ease: 'Quad.easeInOut',
                duration: 210,
                onComplete: () => {
                    movingCard.previousScale = finalScale; // Ensure final scale is set
                }
            }
        );

        if(reveal) {
           animation = animation.concat(this.animation_flip_card(movingCard, 210, finalScale));
           animation = animation.concat(this.animation_flip_card(movingCard, 1500, finalScale));
        }

        animation = animation.concat({
            targets: {},
            scale: 1,
            duration: 1,
            onComplete: () => {
                // Signal that the card is ready for hand positioning
                movingCard.setState(CARD_STATES.TRAVELLING_TO_HAND);
            }
        });

        return animation;
    }

    /** Animation that moves a don card from the don deck to the active don area
     * @param {DonCardUI} card - card to be moved from the don deck to the active don area
     * @param {number} delay - delay with which to start the tweens
     */
    animation_move_don_deck2activearea(card, delay) {
        // Get final positions and angles
        let posX = card.playerScene.playerInfo.activeDonPlaceholder.x;
        let posY = card.playerScene.playerInfo.activeDonPlaceholder.y;
        let angle = card.playerScene.playerInfo.activeDonPlaceholder.angle;

        // Calculate arc path - make sure it's above the deck (upward movement)
        const startX = card.x;
        const startY = card.y;
        const arcHeight = 60 + Math.random() * 30; // Random arc height between 60-90
        const midX = startX + (posX - startX) * 0.4;
        const midY = startY - arcHeight; // Ensure arc peak is ABOVE the starting point
        
        // Random rotation during flight
        const randomRotation = (Math.random() * 0.2) - 0.1; // Between -0.1 and 0.1 radians

        let tweens = [
            { // Phase 1: Initial "pop" from deck
                scale: CARD_SCALE.IN_DON_DECK * 1.1,
                y: card.y - 20, // Initial upward lift
                rotation: randomRotation * 0.3,
                duration: 90, // 120 * 0.5 = 60
                delay: delay * 0.5, // Reduce delay by 50% as well
                ease: 'Back.easeOut', // Slight bounce for pop effect
                onStart: () => {
                    // Set proper depth for animation
                    card.setDepth(DEPTH_VALUES.CARD_IN_ANIMATION);
                }
            },
            { // Phase 2: Begin arc movement & card flip simultaneously 
                scaleY: 0, // Card edge-on during flip (Y-axis)
                scaleX: CARD_SCALE.IN_DON_DECK * 1.05,
                x: card.x + (midX - card.x) * 0.4, // More movement along X axis during flip
                y: card.y - 40, // Continue moving upward during flip
                rotation: randomRotation * 0.5,
                duration: 115, // 150 * 0.5 = 75
                ease: 'Quad.easeOut',
                onComplete: () => {
                    // Flip card to show face
                    card.flipCard();
                }
            },
            { // Phase 3: Continue upward arc with card face showing
                scaleY: CARD_SCALE.IN_DON_DECK * 0.9, // Card unfolds while continuing to move
                scaleX: CARD_SCALE.IN_DON_DECK * 0.9,
                x: midX,
                y: midY, // Peak of the upward arc
                rotation: randomRotation,
                duration: 135, // 180 * 0.5 = 90
                ease: 'Sine.easeInOut'
            },
            { // Phase 4: Begin approach to DON area
                scale: CARD_SCALE.DON_IN_ACTIVE_DON * 0.95,
                x: posX - 15, // Approach from the side
                y: posY - 10, // Approach from above
                rotation: Phaser.Math.DegToRad(angle * 0.8), // Begin rotation toward final angle
                duration: 130, // 170 * 0.5 = 85
                ease: 'Power2.easeIn'
            },
            { // Phase 5: Final approach with slight overshoot
                scale: CARD_SCALE.DON_IN_ACTIVE_DON * 1.05, // Slightly larger for emphasis
                x: posX,
                y: posY,
                rotation: Phaser.Math.DegToRad(angle),
                duration: 105, // 140 * 0.5 = 70
                ease: 'Back.easeOut', // Bounce effect when arriving
                onComplete: () => {
                    card.setDepth(DEPTH_VALUES.DON_IN_PILE);
                    // Set proper depth in DON area
                    this.scene.children.moveBelow(card, card.playerScene.playerInfo.activeDonCardAmountText);
                    
                    // Create a pulse effect on the DON counter
                    const donText = card.playerScene.playerInfo.activeDonCardAmountText;
                    if (donText) {
                        card.scene.tweens.add({
                            targets: donText,
                            scale: 1.15,
                            duration: 80, // 120 * 0.5 = 60
                            yoyo: true,
                            ease: 'Sine.easeInOut'
                        });
                    }
                    
                    // Add ripple effect to DON pile
                    const donPile = card.playerScene.activeDonDeck;
                    if (donPile) {
                        card.scene.tweens.add({
                            targets: donPile,
                            scaleX: 1.03,
                            scaleY: 1.03,
                            duration: 60, // 80 * 0.5 = 40
                            yoyo: true,
                            ease: 'Sine.easeInOut'
                        });
                    }
                }
            },
            { // Phase 6: Settle to exact size
                scale: CARD_SCALE.DON_IN_ACTIVE_DON,
                duration: 75, // 100 * 0.5 = 50
                ease: 'Sine.easeOut'
            }
        ];
        
        return tweens;
    }

    /** Animation that moves a don card from the active don area back to the don deck
     * @param {DonCardUI} card - card to be moved from the active don area to the don deck
     * @param {number} delay - delay with which to start the tweens
     * @param {boolean} updateUI.updateCounter - whether to update the ui
     * @param {string} updateUI.location - which counter to update
     * @returns {Array} - Array of tween configurations
     */
    animation_move_don_activearea2deck(card, delay, updateUI = null) {
        // Get final positions (don deck)
        let posX = card.playerScene.donDeck.posX;
        let posY = card.playerScene.donDeck.posY;

        // Calculate arc path - make sure it's below the active area (downward movement)
        const startX = card.x;
        const startY = card.y;
        const arcHeight = 40 + Math.random() * 20; // Random arc depth between 40-60
        const midX = startX + (posX - startX) * 0.5;
        const midY = startY + arcHeight; // Ensure arc peak is BELOW the starting point
        
        // Random rotation during flight (opposite direction from original)
        const randomRotation = (Math.random() * 0.15) - 0.075; // Between -0.075 and 0.075 radians

        let tweens = [
            { // Phase 1: Initial "drop" from active don area
                targets: card,
                scale: CARD_SCALE.DON_IN_ACTIVE_DON * 1.1,
                y: card.y + 10, // Initial downward movement
                rotation: randomRotation * 0.3,
                duration: 100, 
                delay: delay * 0.5,
                ease: 'Power2.easeOut', // Smooth downward start
                onStart: () => {
                    // Set proper depth for animation
                    card.setDepth(card.playerScene.donDeck.depth + 1);
                    
                    let donText = null;
                    if(updateUI && updateUI.updateCounter) {
                        switch(updateUI.location) {
                            case "EXERTED":
                                donText = card.playerScene.playerInfo.restingDonCardAmountText;
                                card.playerScene.playerInfo.updateRestingCardAmountText();
                                break;
                            case "ACTIVE":
                                donText = card.playerScene.playerInfo.activeDonCardAmountText;
                                card.playerScene.playerInfo.updateActiveCardAmountText();
                                break;
                        }

                        // Create a pulse effect on the DON counter (decreasing)
                        card.scene.tweens.add({
                            targets: donText,
                            scale: 0.8,
                            duration: 150,
                            yoyo: true,
                            ease: 'Sine.easeInOut'
                        });
                    }
                }
            },
            { // Phase 2: Begin downward arc movement with card flip preparation
                targets: card,
                scaleX: CARD_SCALE.DON_IN_ACTIVE_DON * 0.9,
                scaleY: CARD_SCALE.DON_IN_ACTIVE_DON * 1.1,
                x: card.x + (midX - card.x) * 0.4, // Begin movement along X axis
                y: card.y + 25, // Continue moving downward
                rotation: randomRotation * 0.5,
                duration: 120,
                ease: 'Sine.easeOut'
            },
            { // Phase 3: Peak of downward arc with card flip to hide face
                targets: card,
                scaleX: 0, // Card edge-on during flip (X-axis)
                scaleY: CARD_SCALE.DON_IN_ACTIVE_DON * 0.9,
                x: midX,
                y: midY, // Peak of the downward arc
                rotation: randomRotation,
                duration: 130,
                ease: 'Sine.easeInOut',
                onComplete: () => {
                    // Flip card to hide face (back to deck state)
                    card.flipCard();
                }
            },
            { // Phase 4: Card unfolds while continuing toward deck
                targets: card,
                scaleX: CARD_SCALE.IN_DON_DECK * 0.9, // Card unfolds
                scaleY: CARD_SCALE.IN_DON_DECK * 0.9,
                x: posX + 15, // Approach deck from the side
                y: posY - 10, // Approach from slightly above final position
                rotation: randomRotation * 0.3, // Reduce rotation
                duration: 140,
                ease: 'Power2.easeIn'
            },
            { // Phase 5: Final approach to deck with gentle landing
                targets: card,
                scale: CARD_SCALE.IN_DON_DECK * 1.05, // Slightly larger for emphasis
                x: posX,
                y: posY, // Final deck position
                rotation: 0, // Straighten out
                duration: 110,
                ease: 'Back.easeOut', // Gentle bounce effect when arriving
                onComplete: () => {                           
                    // Create a ripple effect on the don deck
                    const donDeck = card.playerScene.donDeck;
                    if (donDeck) {
                        card.scene.tweens.add({
                            targets: donDeck,
                            scaleX: 1.04,
                            scaleY: 1.04,
                            duration: 70,
                            yoyo: true,
                            ease: 'Sine.easeInOut'
                        });
                    }
                }
            },
            { // Phase 6: Settle to exact deck position and size
                targets: card,
                scale: CARD_SCALE.IN_DON_DECK,
                duration: 80,
                ease: 'Sine.easeOut',
                onComplete: () => {
                    // Set proper depth in don deck
                    card.setDepth(DEPTH_VALUES.DON_IN_PILE);
                }
            },
            { // Phase 7: Final shrink into deck (optional disappear effect)
                targets: card,
                scale: CARD_SCALE.IN_DON_DECK * 0.95,
                alpha: 0.9, // Slight fade to show it's merging with deck
                duration: 60,
                ease: 'Sine.easeOut',
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
    animation_move_card_lifedeck2display(card, delay) {
        let displayX = 100 + GAME_UI_CONSTANTS.CARD_ART_WIDTH * CARD_SCALE.IN_PLAY_ANIMATION / 2;
        let displayY = this.scene.screenCenterY;

        let animation = [
            { // Phase 1: Flip the card on the x-axis (second half) and move to final position
                targets: card,
                scaleX: CARD_SCALE.IN_PLAY_ANIMATION,
                scaleY: CARD_SCALE.IN_PLAY_ANIMATION,
                y: displayY,
                x: displayX,
                angle: 0,
                duration: 300,
                ease: 'Power2.easeOut',
                delay: delay,
            },
            { // Phase 2: Pause at display location
                targets: card,
                scale: CARD_SCALE.IN_PLAY_ANIMATION,
                duration: 300, // Longer hold duration
                ease: 'Power2.easeInOut'
            }
        ];
    
        return animation;
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

    /** Animation to flip the card
     * @param {GameCardUI} card - card to be moved from the don deck to the active don area
     * @param {number} delay - delay with which to start the tweens
     * @param {number} targetScale - scale to which the card should be flipped
     */
    animation_flip_card(card, delay, targetScale = null) {
        const previousScale = targetScale ? targetScale : card.scale;
        let tweens = [{ // Phase 2: Begin arc movement & card flip simultaneously 
            targets: card,
            scaleX: 0, // Card edge-on during flip (Y-axis)
            duration: 115, // 150 * 0.5 = 75
            delay: delay,
            ease: 'Quad.easeOut',
            onComplete: () => {
                // Flip card to show face
                card.flipCard();
            }
        },
        { // Phase 3: Continue upward arc with card face showing
            targets: card,
            scaleX: previousScale, // Card unfolds while continuing to move
            duration: 135, // 180 * 0.5 = 90
            ease: 'Sine.easeInOut'
        }];
        return tweens;
    }

    //#region TARGET ANIMATION
    /** Animation that moves a card from the hand to the target area
     * @param {GameCardUI} originator - card to be moved from the hand to the target area
     * @param {GameCardUI} target - card to be moved from the hand to the target area
     * @param {TargetManager} targetManager - targeting manager that will handle the animation
     */
    /*animation_target_card(originator, target, targetManager) {
        let tweens = [
            {
                onStart: () => {targetManager.targetArrow.startManualTargeting(originator, target);},
                target: originator,
                scale: originator.scale,
                duration: 1000,
                onComplete: () => {targetManager.targetArrow.stopTargeting();}
            }
        ]
        return tweens;
    }*/
    //#endregion

}