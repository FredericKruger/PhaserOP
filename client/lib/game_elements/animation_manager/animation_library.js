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
            { // Phase 1: Quick initial movement with spin effect
                scaleX: 0,
                scaleY: 0.20, // Slightly taller for more visual impact
                x: card.x - GAME_UI_CONSTANTS.CARD_ART_WIDTH * 0.2,
                y: card.y - 5, // Slight initial upward movement
                rotation: -0.1, // Add slight rotation for dynamic effect
                duration: 120, // Faster initial movement
                delay: delay,
                ease: 'Power3.easeOut', // More dramatic easing
                onComplete: () => {
                    card.flipCard();
                    card.state = CARD_STATES.IN_MULLIGAN;
                }
            }, 
            { // Phase 2: Dramatic arc with expansion
                scaleX: 0.32, // Larger for emphasis
                scaleY: 0.32,
                x: card.x - GAME_UI_CONSTANTS.CARD_ART_WIDTH * 0.35 - 20,
                y: card.y - 140, // Higher arc for more dramatic reveal
                rotation: 0, // Return to normal orientation
                ease: 'Back.easeOut', // Adds slight overshoot for bouncy feel
                duration: 200, // Slightly longer for mid-phase
            }, 
            { // Phase 3: Final positioning with smooth landing
                scale: CARD_SCALE.IN_MULLIGAN,
                x: cardPosition.x,
                y: cardPosition.y,
                ease: 'Quad.easeOut', // Smooth deceleration
                duration: 250, // Slightly longer for better visual
                onComplete: () => {
                    // Optional: Add subtle bounce effect at end
                    card.scene.tweens.add({
                        targets: card,
                        scaleX: CARD_SCALE.IN_MULLIGAN * 1.05,
                        scaleY: CARD_SCALE.IN_MULLIGAN * 1.05,
                        duration: 100,
                        yoyo: true,
                        ease: 'Sine.easeInOut'
                    });
                }
            }
        ];
        
        return tweens;
    }

    /** 
     * Ultra-fast animation that brings a card from the mulligan UI to the deck
     * @param {GameCardUI} card - card to be moved from the mulligan UI to the deck
     * @param {number} delay - delay with which to start the tweens 
     * @returns {Array} - Array of tween configurations
     */
    animation_move_card_mulligan2deck(card, delay) {
        let posX = card.playerScene.deck.posX;
        let posY = card.playerScene.deck.posY;

        // Calculate a more direct arc path
        const arcHeight = 60 + Math.random() * 40; // Lower arc height for faster movement
        const midX = (card.x + posX) / 2;
        const controlY = posY - arcHeight;

        let animation = [
            { // Phase 1: Quick lift and shrink - ultra fast
                x: card.x, 
                y: card.y - 30, // Slightly less lift for faster movement
                rotation: (Math.random() * 0.15) - 0.075, // Smaller rotation for quicker movement
                scale: 0.25,
                duration: 70, // Ultra fast initial movement
                delay: delay,
                ease: 'Power2.easeOut', // Changed to Power2 for faster acceleration
            }, 
            { // Phase 2: Arc movement - ultra fast
                x: midX,
                y: controlY, 
                scaleX: 0.22, 
                scaleY: 0.22,
                rotation: (Math.random() * 0.3) - 0.15, // Less rotation
                duration: 100, // Ultra fast arc
                ease: 'Quad.easeInOut', // Changed to Quad for faster curve
            },
            { // Phase 3: Quick approach to deck - ultra fast
                x: posX - 20, // Closer approach point
                y: posY - 15, // Less vertical distance
                scale: 0.2,
                rotation: 0,
                duration: 70, // Ultra fast approach
                ease: 'Power3.easeIn', // More aggressive acceleration
            },
            { // Phase 4: Flip and insert into deck - critical moment kept tight
                scaleX: 0,
                scaleY: 0.18,
                x: posX - (GAME_UI_CONSTANTS.CARD_ART_WIDTH*CARD_SCALE.IN_DECK - 20),
                y: posY,
                duration: 60, // Even faster flip
                ease: 'Power2.easeIn',
                onComplete: () => {
                    card.flipCard();
                    card.setState(CARD_STATES.IN_DECK);
                    
                    // Quick deck ripple
                    const deckPile = card.playerScene.deck;
                    if (deckPile) {
                        card.scene.tweens.add({
                            targets: deckPile,
                            scaleX: 1.03, // Smaller ripple
                            scaleY: 1.03, // Smaller ripple
                            duration: 70, // Faster ripple
                            yoyo: true,
                            ease: 'Quad.easeInOut'
                        });
                    }
                }
            },
            { // Phase 5: Quick settle - ultra fast
                scaleX: CARD_SCALE.IN_DECK,
                scaleY: CARD_SCALE.IN_DECK,
                x: posX,
                y: posY,
                duration: 40, // Ultra fast settle
                ease: 'Sine.easeOut', // Changed to Sine for faster movement
            },
            { // Phase 6: Disappear - ultra fast
                scaleX: 0,
                scaleY: 0,
                duration: 25, // Ultra fast disappear
                ease: 'Power1.easeIn'
            }
        ];

        return animation;
    }

    /** Animation that brings a card from the deck to the life deck
     * @param {GameCardUI} card - card to be moved from deck to life pile
     * @param {number} delay - delay before starting the animation
     * @returns {Array} Array of tween configurations
     */
    animation_move_card_deck2lifedeck(card, delay) {
        let posX = card.playerScene.playerInfo.lifeAmountText.x;
        let posY = card.playerScene.playerInfo.lifeAmountText.y;
        
        // Calculate a dynamic arc path for more natural movement
        const arcHeight = 120 + Math.random() * 30; // Random arc height
        const controlX = card.x - GAME_UI_CONSTANTS.CARD_ART_WIDTH * 0.4 - 20; // Control point X
        const randomRotation = (Math.random() * 0.15) - 0.075; // Subtle random rotation
        
        let tweens = [
            { // Phase 1: Initial movement with slight scale change
                scaleX: 0, // Keep the flip effect but don't reveal card
                scaleY: CARD_SCALE.IN_DECK * 1.05, // Slightly taller
                x: card.x - GAME_UI_CONSTANTS.CARD_ART_WIDTH * 0.2/2,
                rotation: randomRotation * 0.5, // Very slight initial rotation
                duration: 150,
                delay: delay,
                ease: 'Power2.easeOut', // More dynamic start
                onComplete: () => {
                    card.state = CARD_STATES.IN_LIFEDECK;
                }
            }, 
            { // Phase 2: Dramatic arc with more dynamic movement
                scaleX: CARD_SCALE.IN_DECK,
                scaleY: CARD_SCALE.IN_DECK,
                x: controlX, // Move horizontally first
                y: card.y - arcHeight, // High arc for dramatic effect
                rotation: randomRotation, // Add subtle rotation for dynamic feel
                ease: 'Sine.easeOut', // Smooth acceleration out
                duration: 250, // Faster more dynamic movement
            }, 
            { // Phase 3: Curved approach to life pile
                scale: CARD_SCALE.IN_DECK,
                x: posX - 20, // Slightly offset from final position
                y: posY - 40, // Approach from above
                rotation: 0, // Straighten card
                duration: 200, // Faster approach
                ease: 'Power2.easeIn', // Accelerated movement
            },
            { // Phase 4: Final placement into life pile with bounce
                scale: CARD_SCALE.IN_DECK,
                x: posX,
                y: posY,
                duration: 300, // Quicker final movement
                ease: 'Back.easeOut', // Slight overshoot for bounce effect
                onComplete: () => {
                    // Set proper depth
                    card.setDepth(0);
                    this.scene.children.moveBelow(card, card.playerScene.playerInfo.lifeAmountText);
                    
                    // Add a pulse effect to the life counter
                    const lifeText = card.playerScene.playerInfo.lifeAmountText;
                    this.scene.tweens.add({
                        targets: lifeText,
                        scale: 1.2,
                        duration: 150,
                        yoyo: true,
                        ease: 'Sine.easeInOut'
                    });
                }
            }, 
            { // Phase 5: Fade out smoothly
                alpha: 0,
                scale: CARD_SCALE.IN_DECK * 0.9, // Slightly shrink while fading
                duration: 150, // Quick fade
                ease: 'Power1.easeIn',
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
            { // Phase 1: Quick pull from deck with slight arc
                scaleX: 0,
                scaleY: 0.18,
                x: card.x - GAME_UI_CONSTANTS.CARD_ART_WIDTH * 0.2,
                y: card.y - 10, // Slight upward movement
                duration: 180, // Faster initial movement
                delay: delay,
                ease: 'Power2.easeOut',
                onComplete: () => {
                    card.flipCard();
                    card.state = CARD_STATES.TRAVELLING_DECK_HAND; // Changed state name to match others
                }
            }, 
            { // Phase 2: Arc upward and reveal with bounce
                scaleX: 0.32, // Slightly larger for emphasis
                scaleY: 0.32,
                x: card.x - GAME_UI_CONSTANTS.CARD_ART_WIDTH * 0.35,
                y: card.y - 140, // Higher arc for more dramatic reveal
                rotation: -0.05, // Slight rotation for style
                ease: 'Back.easeOut', // More dynamic easing
                duration: 400,
            }, 
            { // Phase 3: Quick move toward hand position
                scaleX: 0.28,
                scaleY: 0.28,
                x: card.x - GAME_UI_CONSTANTS.CARD_ART_WIDTH * 0.5,
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

    /** Animation that brings a card from the deck to 
     * @param {GameCardUI} card - card to be moved form the mulligan ui to the deck
     * @param {number} delay - delay with which to start the tweens 
     */
    animation_move_card_lifedeck2display(card, delay) {
        let displayX = 100 + GAME_UI_CONSTANTS.CARD_ART_WIDTH * CARD_SCALE.IN_PLAY_ANIMATION / 2;
        let displayY = this.scene.screenCenterY;

        let pos1Y = displayY + (card.y - displayY)*2/3;
        let pos2Y = displayY + (card.y - displayY)*1/3;

        let animation = [
            { // Phase 1: Lift the card slightly and move to intermediate position
                targets: card,
                x: displayX,
                y: pos1Y,
                duration: 300, // Adjusted duration for smoother movement
                delay: delay,
                ease: 'Power2.easeInOut', // Smoother easing
                onComplete: () => {
                    //card.state = CARD_STATES.TRAVELLING_DECK_HAND;
                }
            },
            { // Phase 2: Flip the card on the x-axis (first half)
                targets: card,
                scaleX: 0,
                scaleY: (CARD_SCALE.IN_PLAY_ANIMATION - card.scale) / 2,
                y: pos2Y,
                duration: 300,
                ease: 'Power2.easeIn',
                onComplete: () => {
                    card.flipCard();
                }
            },
            { // Phase 3: Flip the card on the x-axis (second half) and move to final position
                targets: card,
                scaleX: CARD_SCALE.IN_PLAY_ANIMATION,
                scaleY: CARD_SCALE.IN_PLAY_ANIMATION,
                y: displayY,
                angle: 0,
                duration: 300,
                ease: 'Power2.easeOut'
            },
            { // Phase 4: Pause at display location
                targets: card,
                scale: CARD_SCALE.IN_PLAY_ANIMATION,
                duration: 800, // Longer hold duration
                ease: 'Power2.easeInOut'
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
        let finalAngle = card.playerScene.playerInfo.activeDonPlaceholder.angle;
        
        // Calculate a dynamic arc path
        const arcHeight = 100 + Math.random() * 20; // Random arc height
        const controlX = (card.x + posX) / 2; // Midpoint for horizontal movement
        
        // Ensure the card starts below the deck
        // Store original position to restore it in the scene
        const origX = card.x;
        const origY = card.y;
        const origDepth = card.depth;
        
        // Move the card below the Don deck initially
        card.setDepth(card.playerScene.donDeck.depth - 1);
        
        // Set initial properties for the animation
        const initialAngle = 0; // Start facing down, as if it's being drawn from under the deck
        card.setRotation(Phaser.Math.DegToRad(initialAngle));
        
        let tweens = [
            { // Phase 1: Initial reveal coming from under the deck
                scaleX: 0,
                scaleY: CARD_SCALE.IN_DON_DECK * 1.1, // Slightly taller
                y: card.y + 10, // Move slightly down first, as if being pulled from under deck
                duration: 120,
                delay: delay,
                ease: 'Power2.easeOut',
                onComplete: () => {
                    card.flipCard(); // Reveal the card
                }
            },
            { // Phase 2: Launch into dramatic arc with gradual rotation
                scaleX: CARD_SCALE.IN_DON_DECK,
                scaleY: CARD_SCALE.IN_DON_DECK,
                x: controlX, // Move to midpoint
                y: card.y + arcHeight, // High arc
                rotation: Phaser.Math.DegToRad(-45), // Halfway to horizontal
                ease: 'Sine.easeOut',
                duration: 200,
            },
            { // Phase 3: Rapid approach to active don area with full rotation
                scale: CARD_SCALE.DON_IN_ACTIVE_DON * 1.2, // Slightly larger for emphasis
                x: posX,
                y: posY,
                rotation: Phaser.Math.DegToRad(finalAngle), // Match the placeholder angle exactly
                duration: 300,
                ease: 'Back.easeOut',
                onComplete: () => {
                    // Set proper depth
                    card.scene.children.moveBelow(card, card.playerScene.playerInfo.activeDonCardAmountText);
                    
                    // Create a pulse effect on the DON counter
                    const donText = card.playerScene.playerInfo.activeDonCardAmountText;
                    if (donText) {
                        card.scene.tweens.add({
                            targets: donText,
                            scale: 1.3,
                            duration: 150,
                            yoyo: true,
                            ease: 'Sine.easeInOut'
                        });
                    }
                    
                    // Final scale bounce for emphasis
                    card.scene.tweens.add({
                        targets: card,
                        scale: CARD_SCALE.DON_IN_ACTIVE_DON,
                        duration: 150,
                        ease: 'Back.easeOut'
                    });
                }
            }
        ];
        
        return tweens;
    }

    /** Animation that moves a don card from the character area to the active don area
     * @param {DonCardUI} card - card to be moved from a character back to the active don area
     * @param {number} delay - delay with which to start the tweens
     */
    animation_move_don_characterarea2activearea(card, delay) {
        // Get final positions and angles
        let posX = card.playerScene.playerInfo.activeDonPlaceholder.x;
        let posY = card.playerScene.playerInfo.activeDonPlaceholder.y;
        let angle = card.playerScene.playerInfo.activeDonPlaceholder.angle;

        // Calculate a more direct path with reduced arc height
        const startX = card.x;
        const startY = card.y;
        const arcHeight = 30 + Math.random() * 20; // Much lower arc height (30-50 vs 80-120)
        const controlX = (startX + posX) / 2;
        const controlY = Math.min(startY, posY) - arcHeight; // Use the minimum of start/end Y positions
        
        // Reduced rotation during flight for more direct movement
        const randomRotation = (Math.random() * 0.1) - 0.05; // Half the previous rotation

        let tweens = [
            { // Phase 1: Quick detachment with minimal pop effect
                scale: card.scale * 1.1, // Smaller scale increase
                y: card.y - 10, // Smaller initial lift
                rotation: randomRotation * 0.5,
                duration: 120, // Faster initial movement
                delay: delay,
                ease: 'Power2.easeOut', // Changed to Power2 for more direct movement
                onStart: () => {
                    // Set proper depth for animation
                    card.setDepth(DEPTH_VALUES.DON_IN_PILE);
                }
            },
            { // Phase 2: Direct movement toward DON area with minimal arc
                scale: CARD_SCALE.DON_IN_ACTIVE_DON * 0.95, // Less scale change
                x: controlX,
                y: controlY,
                rotation: randomRotation,
                duration: 220, // Faster movement
                ease: 'Quad.easeOut' // Changed to Quad for more direct path
            },
            { // Phase 3: Direct approach to DON pile
                scale: CARD_SCALE.DON_IN_ACTIVE_DON * 1.05, // Less scale emphasis
                x: posX,
                y: posY - 5, // Much closer to final position
                rotation: Phaser.Math.DegToRad(angle * 0.9), // Closer to final angle
                duration: 180, // Faster approach
                ease: 'Power1.easeIn' // Less aggressive acceleration
            },
            { // Phase 4: Quick settle into DON pile
                scale: CARD_SCALE.DON_IN_ACTIVE_DON,
                x: posX,
                y: posY,
                rotation: Phaser.Math.DegToRad(angle),
                duration: 150, // Faster settling
                ease: 'Sine.easeOut', // Changed to Sine for smoother landing
                onComplete: () => {
                    // Set proper depth in DON area
                    this.scene.children.moveBelow(card, card.playerScene.playerInfo.activeDonCardAmountText);
                    
                    // Create a pulse effect on the DON counter
                    const donText = card.playerScene.playerInfo.activeDonCardAmountText;
                    if (donText) {
                        card.scene.tweens.add({
                            targets: donText,
                            scale: 1.1, // Smaller pulse
                            duration: 120, // Faster pulse
                            yoyo: true,
                            ease: 'Sine.easeInOut'
                        });
                    }
                    
                    // Add ripple effect to DON pile
                    const donPile = card.playerScene.activeDonDeck;
                    if (donPile) {
                        card.scene.tweens.add({
                            targets: donPile,
                            scaleX: 1.03, // Smaller ripple
                            scaleY: 1.03, // Smaller ripple
                            duration: 80, // Faster ripple
                            yoyo: true,
                            ease: 'Sine.easeInOut'
                        });
                    }
                }
            }
        ];
        
        return tweens;
    }
    //#endregion

    //#region MOVING DON CARD FUNCTIONS


    /** Animation that moves a don card from the active don area to the character area
     * @param {DonCardUI} donCard - card to be moved from the active don area to a character
     * @param {CharacterCardUI} characterCard - character card to which the don card will be moved
     * @returns {Array} - Array of tween configurations
    */
    animation_move_don_activearea2characterarea(donCard, characterCard, delay = 0, callback = null) {
        let tweens = [
            {
                targets: donCard,
                x: { from: donCard.x, to: characterCard.x },
                y: { from: donCard.y, to: characterCard.y },
                scale: { from: donCard.scale, to: donCard.scale * 1.1 },
                angle: 0, 
                duration: 500,
                ease: 'Back.easeOut',
                delay: delay,
                onComplete: () => {
                    // Create impact effect at destination
                    try {                        
                        // Power-up effect on character
                        this.scene.tweens.add({
                            targets: characterCard,
                            scaleX: characterCard.scaleX * 1.1,
                            scaleY: characterCard.scaleY * 1.1,
                            duration: 200,
                            yoyo: true,
                            ease: 'Sine.easeOut'
                        });
                        
                        // Character glow effect
                        const glow = this.scene.add.graphics();
                        glow.fillStyle(0xffcc00, 0.3);
                        glow.fillRoundedRect(
                            characterCard.x - (characterCard.width * characterCard.scaleX * 0.55),
                            characterCard.y - (characterCard.height * characterCard.scaleY * 0.55),
                            characterCard.width * characterCard.scaleX * 1.1,
                            characterCard.height * characterCard.scaleY * 1.1,
                            10
                        );
                        
                        this.scene.tweens.add({
                            targets: glow,
                            alpha: 0,
                            duration: 500,
                            ease: 'Power2.easeOut',
                            onComplete: () => glow.destroy()
                        });
                    } catch (e) {
                        // Silent fail if effect unavailable
                    }

                    if(callback) callback();
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
    integrationAnimation(card, delay, duration = 500) {
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
            duration: duration,
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

    //#region NEXT TURN BUTTON ANIMATION

    // Animation for the next turn button
    nextTurnButtonAnimation() {  
        // Create a more dynamic rotation animation
        let tweens = [{
            onStart: () => {
                this.scene.gameStateUI.nextTurnbutton.fsmState.exit(NEXT_TURN_BUTTON_FSM_STATES.PASSIVE);
                
                // Slightly scale up at the start
                this.scene.tweens.add({
                    targets: this.scene.gameStateUI.nextTurnbutton,
                    scaleX: 1.15,
                    scaleY: 1.15,
                    duration: 150,
                    ease: 'Back.easeOut',
                    yoyo: true
                });
            },
            targets: this.scene.gameStateUI.nextTurnbutton,
            rotation: Math.PI * 4, // Two full rotations instead of one
            duration: 700, // Slightly longer duration
            ease: 'Cubic.easeInOut', // More dynamic easing function
            onUpdate: (tween) => {
                // Add subtle scale pulsing during rotation
                const progress = tween.progress;
                const scaleFactor = 1 + 0.05 * Math.sin(progress * Math.PI * 4);
                this.scene.gameStateUI.nextTurnbutton.setScale(scaleFactor);
            },
            onComplete: () => {
                // Reset scale and rotation
                this.scene.gameStateUI.nextTurnbutton.setScale(1);
                this.scene.gameStateUI.nextTurnbutton.setRotation(0);
                
                // Add final impact effect
                this.scene.tweens.add({
                    targets: this.scene.gameStateUI.nextTurnbuttonn,
                    scaleX: 1.2,
                    scaleY: 1.2,
                    duration: 100,
                    yoyo: true,
                    ease: 'Bounce.easeOut',
                    onComplete: () => {
                        // Transition to next phase
                        this.scene.actionManager.completeAction();
                    }
                });
            }
        }];
        return tweens;
    }
    //#endregion

    //#region EFFECT ANIMATION

    don_image_appearing_animation(donImage, delay = 0) {
        // Dramatic entry animation sequence
        return [{
            onStart: () => {donImage.setVisible(true);},
            targets: donImage,
            scale: { from: 0, to: 1.8 }, // Zoom in effect (larger than final)
            duration: 400,
            delay: delay,
            ease: 'Back.easeOut',
            onComplete: () => {                       
                // Pulse effect
                this.scene.tweens.add({
                    targets: donImage,
                    scale: 1.5,
                    duration: 200,
                    ease: 'Bounce.easeOut',
                    onComplete: () => {                                
                        // Hold for a moment before fading out
                        this.scene.time.delayedCall(400, () => {
                            this.scene.tweens.add({
                                targets: donImage,
                                alpha: { from: 1, to: 0 },
                                scale: { from: 1.5, to: 1.7 },
                                duration: 600,
                                ease: 'Power1.easeIn',
                                onComplete: () => {donImage.destroy();}
                            });
                        });
                    }
                });
            }
        }];
    }

    //#endregion
}