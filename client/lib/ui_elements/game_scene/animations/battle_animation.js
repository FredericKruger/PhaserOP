class BattleAnimation {

    /** Constructor
     * @param {GameScene} scene - The scene to add the animation
     */
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Creates a battle animation between attacker and defender cards with impact effects
     * @param {GameCardUI} attacker - The attacking card
     * @param {GameCardUI} defender - The defending card
     * @returns {Phaser.Tweens.Timeline} The animation timeline
     */
    createBattleAnimation(attacker, defender) {
        // Configuration for the battle animation
        const config = {
            impactFrames: [ASSET_ENUMS.BATTLE_ONO1, ASSET_ENUMS.BATTLE_ONO2, ASSET_ENUMS.BATTLE_ONO3, ASSET_ENUMS.BATTLE_ONO4, ASSET_ENUMS.BATTLE_ONO5],
            numEffects: Phaser.Math.Between(5, 9),   // Increased number of effects
            effectScale: { min: 1.5, max: 2.8 },     // Larger max scale
            explosionScale: { min: 1.2, max: 1.8 },  // Larger explosion scale
            shakeMagnitude: 7,                       // More intense shake
            shakeCount: 5,                           // More shakes
            duration: {
                approach: 500,                       // Slower approach
                impact: 300,                         // Longer impact pause
                effectsDelay: 70,                    // More time between effects
                retreat: 400,                        // Slower retreat
                shake: 60,                           // Slightly longer shakes
                angleChange: 250,                    // Smoother angle changes
                explosionAppear: 150,                // Slower explosion appear
                explosionHold: 400,                  // Longer explosion visibility
                explosionFade: 600                   // Longer fade out
            }
        };

        // Store original positions
        const attackerOrigX = attacker.x;
        const attackerOrigY = attacker.y;
        const attackerOrigAngle = attacker.angle;

        const defenderOrigX = defender.x;
        const defenderOrigY = defender.y;
        const defenderOrigAngle = defender.angle;

        // Calculate midpoint and approach positions
        const midX = (attackerOrigX + defenderOrigX) / 2;
        const midY = (attackerOrigY + defenderOrigY) / 2;
        
        // Determine direction vector from attacker to defender
        const dx = defenderOrigX - attackerOrigX;
        const dy = defenderOrigY - attackerOrigY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const normalizedDx = dx / distance;
        const normalizedDy = dy / distance;
        
        // Impact point - slightly before the defender
        const impactX = defenderOrigX - normalizedDx * 40; // Stop short of defender
        const impactY = defenderOrigY - normalizedDy * 40;

        // Set appropriate depths to ensure cards are visible
        attacker.setDepth(DEPTH_VALUES.CARD_ATTACKING_ANIMATION);
        defender.setDepth(DEPTH_VALUES.CARD_DEFENDING_ANIMATION);
        
        // Prepare for battle - visual cues
        attacker.showGlow(COLOR_ENUMS.OP_RED);
        defender.showGlow(COLOR_ENUMS.OP_BLUE);

        // Calculate direction angles for both cards to face each other
        // Base angle calculation (from attacker to defender)
        const attackToDefendAngle = Math.atan2(dy, dx) * 180 / Math.PI;
        const defendToAttackAngle = Math.atan2(-dy, -dx) * 180 / Math.PI;

        // Add personality to the facing angles with slight combat poses
        let attackerTargetAngle, defenderTargetAngle;

        console.log(attackerOrigAngle + ' ' + attackToDefendAngle);
        console.log(defenderOrigAngle + ' ' + defendToAttackAngle);
        
        // Normal angle calculation for upright cards
        attackerTargetAngle = attackToDefendAngle + 90 + Phaser.Math.Between(-5, 5);
        this.scene.tweens.add({
            targets: attacker,
            angle: attackerTargetAngle,
            duration: config.duration.angleChange,
            ease: 'Sine.easeInOut'
        });

        // Normal angle calculation for upright cards
        defenderTargetAngle = defendToAttackAngle + 90 + Phaser.Math.Between(-5, 5);
        this.scene.tweens.add({
            targets: defender,
            angle: defenderTargetAngle,
            duration: config.duration.angleChange,
            ease: 'Sine.easeInOut'
        });

       // APPROACH TWEEN: Card moves toward opponent
        return this.scene.tweens.chain({
            targets: attacker,
            tweens: [
                {
                    targets: attacker,
                    x: impactX,
                    y: impactY,
                    duration: config.duration.approach,
                    ease: 'Sine.easeIn',
                    delay: config.duration.angleChange // Wait for angle change to complete
                }, {
                    targets: attacker,
                    x: impactX,
                    y: impactY,
                    duration: config.duration.impact,
                    onStart: () => {
                        // Create the main explosion at the exact impact point
                        this.createExplosionEffect(impactX, impactY, config);
                        
                        // Shake the defender
                        this.shakeCard(defender, config.shakeMagnitude, config.shakeCount, config.duration.shake);
                        
                        // Generate smaller impact effects around the main explosion
                        this.createImpactEffects(
                            impactX, 
                            impactY,
                            config.numEffects,
                            config.effectScale,
                            config.impactFrames,
                            config.duration
                        );
                    }
                }, {
                    targets: attacker,
                    x: attackerOrigX,
                    y: attackerOrigY,
                    angle: attackerOrigAngle, // Return to original angle
                    duration: config.duration.retreat,
                    ease: 'Sine.easeOut'
                }, {
                    targets: defender,
                    angle: defenderOrigAngle,
                    duration: config.duration.angleChange,
                    ease: 'Sine.easeInOut',
                    onComplete: () => {
                        // Reset card states
                        attacker.setDepth(DEPTH_VALUES.CARD_IN_PLAY);
                        defender.setDepth(DEPTH_VALUES.CARD_IN_PLAY);
                        attacker.hideGlow();
                        defender.hideGlow();
                    }
                }
            ]
        });       
    }

    /**
     * Creates a dramatic explosion effect at the impact point
     * @param {number} x - The x-coordinate of the explosion
     * @param {number} y - The y-coordinate of the explosion
     * @param {Object} config - Animation configuration
     */
    createExplosionEffect(x, y, config) {
        // Generate a random vibrant color for the explosion
        const explosionColor = Phaser.Display.Color.GetColor(
            Phaser.Math.Between(200, 255),  // More vibrant red
            Phaser.Math.Between(120, 255),  // More vibrant green
            Phaser.Math.Between(50, 150)    // Keep blue lower for warm colors
        );

        // Create the main explosion sprite
        let explosion = this.scene.add.image(x, y, ASSET_ENUMS.BATTLE_EXPLOSION)
            .setOrigin(0.5)
            .setScale(0.5)
            .setAlpha(0)
            .setTint(explosionColor)  // Apply the random color tint
            .setDepth(DEPTH_VALUES.CARD_ATTACKING_ANIMATION + 10) // Very high depth to be on top
            .setAngle(Phaser.Math.Between(0, 360));
        
        // Randomize the scale within the explosion scale range
        const targetScale = Phaser.Math.FloatBetween(config.explosionScale.min, config.explosionScale.max);
        
        // 1. Explosion appears quickly
        this.scene.tweens.add({
            targets: explosion,
            scale: targetScale * 1.5,
            alpha: 1,
            duration: config.duration.explosionAppear,
            ease: 'Back.easeOut',
            onComplete: () => {
                // 2. Hold the explosion briefly
                this.scene.tweens.add({
                    targets: explosion,
                    scale: targetScale * 1.6, // Small growth during hold
                    duration: config.duration.explosionHold,
                    ease: 'Sine.easeInOut',
                    onComplete: () => {
                        // 3. Fade out and grow slightly
                        this.scene.tweens.add({
                            targets: explosion,
                            alpha: 0,
                            scale: targetScale * 2,
                            duration: config.duration.explosionFade,
                            ease: 'Power2',
                            onComplete: () => explosion.destroy()
                        });
                    }
                });
            }
        });
    }

    /**
     * Creates multiple impact effect animations around a point
     * @param {number} centerX - The x-coordinate of the impact center
     * @param {number} centerY - The y-coordinate of the impact center
     * @param {number} count - The number of impact effects to create
     * @param {Object} scaleRange - Min and max scale values
     * @param {Array<string>} frameKeys - Array of image keys to use for impact frames
     * @param {Object} duration - Object containing duration settings
     */
    createImpactEffects(centerX, centerY, count, scaleRange, frameKeys, duration) {
        const effectSprites = [];
        
        // Define a color palette for impact effects
        const colorPalette = [
            COLOR_ENUMS.OP_BLUE,
            COLOR_ENUMS.OP_GREEN,
            COLOR_ENUMS.OP_YELLOW,
            COLOR_ENUMS.OP_PURPLE,
            COLOR_ENUMS.OP_ORANGE,
            COLOR_ENUMS.OP_BLACK
        ];

        // Create the specified number of impact effects
        for (let i = 0; i < count; i++) {
            // Randomize position around the impact point
            const radius = Phaser.Math.Between(75, 200);
            const angle = Phaser.Math.Between(0, 360) * Math.PI / 180;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            // Randomly select an impact frame
            const frameKey = Phaser.Utils.Array.GetRandom(frameKeys);

            // Choose a random color from the palette
            const color = Phaser.Utils.Array.GetRandom(colorPalette);
        
            
            // Create the sprite
            const sprite = this.scene.add.image(x, y, frameKey)
                .setOrigin(0.5)
                .setScale(0)
                .setTint(color)  // Apply the color tint
                //.setBlendMode(Phaser.BlendModes.ADD)  // ADD blend mode for a glowing effect
                .setDepth(DEPTH_VALUES.CARD_ATTACKING + 1)
                .setAngle(Phaser.Math.Between(0, 360));
            
            effectSprites.push(sprite);
            
            // Randomize the scale within the specified range
            const targetScale = Phaser.Math.FloatBetween(scaleRange.min, scaleRange.max);
            
            // Add a slight delay based on the effect index
            const delay = i * duration.effectsDelay * 1.5;
            
            // Animate the impact effect appearance with longer duration
            this.scene.tweens.add({
                targets: sprite,
                scale: targetScale,
                delay: delay,
                duration: 300, // Increased from 150
                ease: 'Back.easeOut',
                onComplete: () => {
                    // Add rotation during the hold phase for more dynamic feeling
                    this.scene.tweens.add({
                        targets: sprite,
                        angle: sprite.angle + Phaser.Math.Between(-20, 20),
                        duration: 500, // Hold with slight rotation
                        onComplete: () => {
                            // Fade out and destroy after showing with even longer duration
                            this.scene.tweens.add({
                                targets: sprite,
                                alpha: 0,
                                scale: targetScale * 1.8, // Grow more as it fades
                                duration: 1500, // Increased from 1000
                                ease: 'Power2',
                                onComplete: () => sprite.destroy()
                            });
                        }
                    });
                }
            });
        }
    }

    /**
     * Creates a shaking animation for a card
     * @param {GameCardUI} card - The card to shake
     * @param {number} magnitude - The shake magnitude in pixels
     * @param {number} count - The number of shakes
     * @param {number} duration - Duration per shake in milliseconds
     */
    shakeCard(card, magnitude, count, duration) {
        const origX = card.x;
        const origY = card.y;
        
        // Use recursive function for shaking instead of timeline
        const doShake = (remaining) => {
            if (remaining <= 0) {
                // Return to original position
                this.scene.tweens.add({
                    targets: card,
                    x: origX,
                    y: origY,
                    duration: duration * 1.5,
                    ease: 'Sine.easeOut'
                });
                return;
            }
            
            // Create shake tween
            this.scene.tweens.add({
                targets: card,
                x: origX + Phaser.Math.Between(-magnitude, magnitude),
                y: origY + Phaser.Math.Between(-magnitude, magnitude),
                duration: duration,
                ease: 'Sine.easeInOut',
                onComplete: () => doShake(remaining - 1)
            });
        };
            
        // Start shaking
        doShake(count);
    }

    /**
     * Shows an animated damage number
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} amount - Damage amount
     * @param {number} color - Color in hex format
     */
    showDamageNumber(x, y, amount, color) {
        const damageText = this.scene.add.text(x, y, `-${amount}`, { 
            fontFamily: 'OnePieceFont',
            fontSize: '32px',
            color: `#${color.toString(16)}`,
            stroke: '#000000',
            strokeThickness: 4,
            shadow: { blur: 5, color: '#000000', fill: true }
        })
        .setOrigin(0.5)
        .setDepth(DEPTH_VALUES.CARD_ATTACKING + 5);
        
        // Animate the damage text
        this.scene.tweens.add({
            targets: damageText,
            y: y - 80,
            alpha: 0,
            scale: 1.5,
            duration: 5000,
            ease: 'Power2',
            onComplete: () => damageText.destroy()
        });
    }   
}