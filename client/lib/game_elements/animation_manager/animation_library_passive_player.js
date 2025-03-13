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
                scale: 0,
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
    animation_move_card_deck2hand(card, delay) {
        let animation = [
            { // Phase 1: Quick pull from deck
                scaleX: 0,
                scaleY: 0.18,
                x: card.x + GAME_UI_CONSTANTS.CARD_ART_WIDTH * 0.2,
                y: card.y - 10, // Slight upward movement
                duration: 180, // Faster initial movement
                delay: delay,
                ease: 'Power2.easeOut'
            },
            { // Phase 2: Pause for a moment with slight pulse effect
                scaleX: 0.02, // Show just a hint of the card width
                scaleY: 0.19, // Slight increase in height for pulse effect
                duration: 220, // Duration of the pause
                ease: 'Sine.easeInOut',
            },
            { // Phase 3: Quick move toward hand position
                scaleX: 0.28,
                scaleY: 0.28,
                x: card.x + GAME_UI_CONSTANTS.CARD_ART_WIDTH * 0.5,
                y: card.y - 100,
                rotation: 0, // Return to normal rotation
                ease: 'Quad.easeInOut',
                duration: 300,
                onComplete: () => {
                    // Signal that the card is ready for hand positioning
                    card.setState(CARD_STATES.TRAVELLING_TO_HAND);
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
                duration: 60, // 120 * 0.5 = 60
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
                duration: 75, // 150 * 0.5 = 75
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
                duration: 90, // 180 * 0.5 = 90
                ease: 'Sine.easeInOut'
            },
            { // Phase 4: Begin approach to DON area
                scale: CARD_SCALE.DON_IN_ACTIVE_DON * 0.95,
                x: posX - 15, // Approach from the side
                y: posY - 10, // Approach from above
                rotation: Phaser.Math.DegToRad(angle * 0.8), // Begin rotation toward final angle
                duration: 85, // 170 * 0.5 = 85
                ease: 'Power2.easeIn'
            },
            { // Phase 5: Final approach with slight overshoot
                scale: CARD_SCALE.DON_IN_ACTIVE_DON * 1.05, // Slightly larger for emphasis
                x: posX,
                y: posY,
                rotation: Phaser.Math.DegToRad(angle),
                duration: 70, // 140 * 0.5 = 70
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
                            duration: 60, // 120 * 0.5 = 60
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
                            duration: 40, // 80 * 0.5 = 40
                            yoyo: true,
                            ease: 'Sine.easeInOut'
                        });
                    }
                }
            },
            { // Phase 6: Settle to exact size
                scale: CARD_SCALE.DON_IN_ACTIVE_DON,
                duration: 50, // 100 * 0.5 = 50
                ease: 'Sine.easeOut'
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

    //#region TARGET ANIMATION
    /** Animation that moves a card from the hand to the target area
     * @param {GameCardUI} originator - card to be moved from the hand to the target area
     * @param {GameCardUI} target - card to be moved from the hand to the target area
     */
    animation_target_card(originator, target) {
        let tweens = [
            {
                onStart: () => {this.scene.targetingArrow.startManualTargeting(originator, target);},
                target: originator,
                scale: originator.scale,
                duration: 1000,
                onComplete: () => {this.scene.targetingArrow.stopTargeting();}
            }
        ]
        return tweens;
    }
    //#endregion

}