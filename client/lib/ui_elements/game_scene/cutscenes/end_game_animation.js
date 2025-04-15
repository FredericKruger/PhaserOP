
class EndGameAnimation extends BaseComponentUI {

    /** Constructor
     * @param {GameScene} scene - The scene this animation will be played in
     * @param {boolean} isWinner - If the player is the winner
     * @param {number} reward - The reward the player will get
     */
    constructor(scene, isWinner, reward) {
        super(scene, null);

        this.isWinner = isWinner;
        this.reward = reward;

        // Configuration for the explosion animation
        this.explosionConfig = {
            pieces: 20,              // Number of card fragments 20
            duration: 1000,          // Total duration of explosion animation
            maxRotation: 1080,       // Maximum rotation in degrees (3 full rotations)
            maxDistance: 800,        // Maximum distance pieces can fly
            scaleVariation: 0.3,     // Random variation in piece scale
            delayBetweenPieces: 30,  // Small delay between each piece launching
            fadeStart: 0.7,          // When to start fading (0-1 of total duration)
        };

        // Create the end game message
        this.messageBackground = this.scene.add.image(this.scene.screenCenterX, this.scene.screenCenterY*0.7, ASSET_ENUMS.GAME_PHASE_BOX)
                .setScale(1.5)
                .setOrigin(0.5)
                .setAlpha(0.5)
                .setDepth(1001)
                .setVisible(false);
        this.obj.push(this.messageBackground);
        this.fruitImage = this.scene.add.image(this.scene.screenCenterX - this.messageBackground.displayWidth/2, this.scene.screenCenterY*0.7, this.isWinner ? ASSET_ENUMS.IMAGE_GOMMU_GOMMU_NO_MI : ASSET_ENUMS.IMAGE_IBI_IBI_NO_MI)
                .setOrigin(0.5)
                .setScale(0.5)
                .setDepth(1002)
                .setVisible(false);
        this.obj.push(this.fruitImage);
        this.winningMessage = this.scene.add.text(this.scene.screenCenterX, this.scene.screenCenterY*0.7, this.isWinner ? 'You Won!' : 'You Lost...', {
                fontFamily: 'OnePieceFont',
                fontSize: '64px',
                color: '#D6AA44',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 6
                }).setOrigin(0.5).setDepth(1002);
        this.winningMessage.setVisible(false);
        this.obj.push(this.winningMessage);

        const losingLeaderCard = this.isWinner ? this.scene.passivePlayerScene.leaderLocation.cards[0] : this.scene.activePlayerScene.leaderLocation.cards[0];
        this.leaderPortrait = this.scene.add.image(0, -25, this.scene.game.utilFunctions.getLeaderArt(losingLeaderCard.cardData.art))
                        .setScale(1.5)
                        .setOrigin(0.5)
                        .setVisible(true);
        this.wantedPoster = this.scene.add.image(0, 0, ASSET_ENUMS.IMAGE_WANTED_POSTER)
                .setScale(0.5)
                .setOrigin(0.5)
                .setVisible(true);
        this.leaderName = this.scene.add.text(0, 70, losingLeaderCard.cardData.name, {
                fontFamily: 'OnePieceFont',
                fontSize: '22px',
                color: '#3e2520',
                align: 'center'
        }).setOrigin(0.5).setVisible(true);
        this.rewardText = this.scene.add.text(0, 100, "1000", {
                fontFamily: 'OnePieceFont',
                fontSize: '25px',
                color: '#3e2520',
                align: 'center'
        }).setOrigin(0.5).setVisible(true);

        this.wantedContainer = this.scene.add.container(this.scene.screenCenterX, this.scene.screenCenterY + 125, [this.leaderPortrait, this.wantedPoster, this.leaderName, this.rewardText]);
        this.wantedContainer.setVisible(false);
        this.wantedContainer.setDepth(1003);
        this.obj.push(this.wantedContainer);

        // Create a stamp image or text           
        this.stamp = this.scene.add.image(
            this.wantedContainer.x, 
            this.wantedContainer.y, 
            ASSET_ENUMS.IMAGE_MARINE_ARRESTED
        ).setScale(0.1).setAlpha(0).setDepth(1004).setAngle(-20);
        this.obj.push(this.stamp);
    }

    /** Function to start the animation */
    startAnimation() {
        const losingLeaderCard = this.isWinner ? this.scene.passivePlayerScene.leaderLocation.cards[0] : this.scene.activePlayerScene.leaderLocation.cards[0];
        const winningLeaderCard = this.isWinner ? this.scene.activePlayerScene.leaderLocation.cards[0] : this.scene.passivePlayerScene.leaderLocation.cards[0];

        //Show leader chat bubble
        new ChatBubble(
            this.scene, 
            losingLeaderCard.getSpeechBubblePosition(),
            losingLeaderCard.cardData.animationinfo.speeches.defeated
        ).show(2000);

        //hide all effects
        losingLeaderCard.setState(CARD_STATES.IN_DISCARD);

        // First animate the card to the center with a subtle glow for dramatic effect
        this.shakeCard(losingLeaderCard).then(() => {
            // After centered, explode the card
            //this.explodeCard(losingLeaderCard);

            // After centered, burn the card
            this.burnCard(losingLeaderCard);
            
            // Display appropriate message after explosion
            setTimeout(() => {
                setTimeout(() => {
                    //Show leader chat bubble
                    new ChatBubble(
                        this.scene, 
                        winningLeaderCard.getSpeechBubblePosition(),
                        winningLeaderCard.cardData.animationinfo.speeches.won
                    ).show(2000);

                    this.showEndGamePanel();
                }, 1200);
            }, this.explosionConfig.duration * 0.8);
        });
    }

    /**
     * Animate the leader card to the center of the screen
     * @param {GameCardUI} card - The leader card to animate
     * @returns {Promise} Resolves when animation completes
     */
    shakeCard(card) {
        return new Promise((resolve) => {
            // Store original properties
            const originalX = card.x;
            const originalY = card.y;
            const originalScale = card.scale;
            const originalDepth = card.depth;
            
            // Bring to front
            card.setDepth(3);

            // Animate the card to the center of the screen
            let targetY = this.isWinner ? 50 : -50;
                        
            // First, subtly pulse the card
                    // Shake animation
            this.scene.tweens.add({
                targets: card,
                x: {
                    value: '+=10', // Shake by 10 pixels
                    duration: 60,
                    ease: 'Sine.easeInOut',
                    yoyo: true,
                    repeat: 10 // Repeat the shake effect
                },
                y: {
                    value: '+=5', // Shake by 5 pixels
                    duration: 60,
                    ease: 'Sine.easeInOut',
                    yoyo: true,
                    repeat: 10 // Repeat the shake effect
                },
                scale: 0.25,
                y: card.y + targetY,
                duration: 800,
                delay: 0, // Start immediately
                onComplete: resolve
            });
        });
    }

    /**
     * Create the card explosion effect with realistic texture slicing using polygon fragments
     * @param {GameCardUI} card - The card to explode
     */
    explodeCard(card) {
        // Create a flash effect
        const flash = this.scene.add.rectangle(
            card.x, card.y,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0xffffff, 0
        ).setDepth(1001);
        this.obj.push(flash);
        
        this.scene.tweens.add({
            targets: flash,
            alpha: 0.9,
            duration: 100,
            yoyo: true,
            onComplete: () => flash.destroy()
        });
        
        // Play explosion sound if available
        /*if (this.scene.sound && this.scene.sound.add) {
            const explosion = this.scene.sound.add('explosion');
            if (explosion) explosion.play({ volume: 0.7 });
        }*/
        
        // First, create a render texture of the card
        const rt = this.scene.add.renderTexture(0, 0, card.width, card.height)
            .setVisible(false);
        
        // Draw the card into the render texture
        rt.draw(card.frontArt, card.width/2, card.height/2);
        rt.scale = card.scale;
        
        // Get a snapshot of the render texture as a texture
        const snapTexture = rt.saveTexture('card_explosion_' + Date.now());
        rt.destroy(); // Clean up the render texture
        
        // Create puzzle-like pieces that fit together
        this.createPuzzlePieces(card, snapTexture);
        
        // Hide the original card after creating the pieces
        card.setVisible(false);
        
        // Create additional particles for more dramatic effect
        //this.createExplosionParticles(card.x, card.y);
    }


    /**
     * Create interlocking puzzle pieces from the card
     * @param {GameCardUI} card - The original card
     * @param {string} textureKey - The texture key for the card image
     */
    createPuzzlePieces(card, textureKey) {
        // Store pieces
        const pieces = [];
        
        const svgData = this.scene.cache.text.get('explosion_svg');
        const pathPoints = this.scene.game.utilFunctions.parseSVGPaths(svgData);
        const centroidPoints = this.scene.game.utilFunctions.parseSVGPoints(svgData);

        const startX = card.x - card.displayWidth/2;
        const startY = card.y - card.displayHeight/2;

        // For each seed point, create a piece
        for (let i = 0; i < pathPoints.length; i++) { //pathPoints.length
            // Create points for this piece by finding the adjacent cells
            // and generating midpoints between this seed and adjacent seeds
            const polygonPoints = [];
            const shadowPolygonPoints = [];
            for(let j = 0; j < pathPoints[i].length; j++) {
                polygonPoints.push(new Phaser.Geom.Point(
                    startX + pathPoints[i][j].x * card.scale,
                    startY + pathPoints[i][j].y * card.scale
                ));
                //shadowPolygonPoints.push(new Phaser.Geom.Point(
                //    startX + pathPoints[i][j].x * card.scale + 10, // Reduced shadow offset from 50 to 10
                //    startY + pathPoints[i][j].y * card.scale - 10 // Changed to positive for a more natural shadow
                //));
            }
            
            // Create a graphics object for the polygon mask
            const maskGraphics = this.scene.add.graphics();
            maskGraphics.fillStyle(0xffffff);
            const poly = new Phaser.Geom.Polygon(polygonPoints);
            maskGraphics.beginPath();
            maskGraphics.fillPoints(poly.points, true, true);
            
            // Step 3: Create a masked texture that's already pre-cut to the shape
            const mask = maskGraphics.createGeometryMask();
        
            // Create a graphics object for the shadow polygon mask
            //const shadowGraphics = this.scene.add.graphics();
            //shadowGraphics.fillStyle(0xffffff);
            //const spoly = new Phaser.Geom.Polygon(shadowPolygonPoints);
            //shadowGraphics.beginPath();
            //shadowGraphics.fillPoints(spoly.points, true, true);

            // Create a mask from the polygon
            //const smask = shadowGraphics.createGeometryMask();
            
            // Create the piece sprite
            const piece = this.scene.add.sprite(card.x, card.y, textureKey)
                .setOrigin(0.5)
                .setScale(card.scale)
                .setDepth(6);
            // Apply the mask
            piece.setMask(mask);

            // Add subtle shadow for depth
            //const shadow = this.scene.add.sprite(
            //    card.x + 10, 
            //    card.y - 10, 
            //    textureKey
            //)
            //.setOrigin(0.5)
            //.setScale(card.scale)
            //.setTint(0x000000)
            //.setAlpha(0.3)
            //.setDepth(5);
            //shadow.setMask(smask);

            piece.mask = mask;
            piece.maskGraphics = maskGraphics;
            //piece.shadow = shadow;
            //piece.shadowMask = smask;
            //piece.shadowGraphics = shadowGraphics;

            // Calculate trajectory based on position in the card
            // Pieces near edges should fly outward
            const pieceRelativeX = centroidPoints[i].cx / card.width - 0.5;
            const pieceRelativeY = centroidPoints[i].cy / card.height - 0.5;
            
            // Direction angle based on position (pieces fly outward)
            const baseAngle = Math.atan2(pieceRelativeY, pieceRelativeX);
            
            // Add randomness to the angle
            const angleVariation = Phaser.Math.FloatBetween(-0.3, 0.3); // radians
            const angle = baseAngle + angleVariation;
            
            // Distance based on position (edge pieces fly further)
            const distanceFromCenter = Math.sqrt(pieceRelativeX * pieceRelativeX + pieceRelativeY * pieceRelativeY);

            // Scale the distance to be reasonable on screen
            // Max distance 300-400 pixels is typically visible on most screens
            const maxDistance = 350; // Reduced from 800
            const minDistance = 150; // Minimum distance pieces will travel

            const distance = Phaser.Math.Linear(
                minDistance,
                maxDistance,
                distanceFromCenter * 2  // Scale the 0-0.5 range to 0-1
            );
            
            // Calculate target position
            const targetX = card.x + Math.cos(angle) * distance;
            const targetY = card.y + Math.sin(angle) * distance;
            
            // Add delay based on distance from center
            const delay = (1 - distanceFromCenter) * 200; // Center pieces start flying later*/
                        
            // Animate the container (which has everything inside it)
            this.scene.tweens.add({
                targets: piece,
                x: targetX,
                y: targetY,
                alpha: { value: 0, delay: this.explosionConfig.duration * this.explosionConfig.fadeStart },
                delay: delay,
                duration: this.explosionConfig.duration,
                ease: 'Power2',
                onUpdate: (tween, target) => {
                    let dx = target.x - card.x;
                    let dy = target.y - card.y;

                    target.maskGraphics.x = dx;
                    target.maskGraphics.y = dy;
                    target.maskGraphics.alpha = target.alpha;
                },
                onComplete: () => {
                    // Clean up
                    if (piece.mask) piece.mask.destroy();
                    if (piece.maskGraphics) piece.maskGraphics.destroy();
                    piece.destroy();
                }
            });
        }
    }

    /** Function to burn the card
     * @param {GameCardUI} card - The card to burn
     */
    burnCard(card) {
        const tempObj = { burnAmount: 0 };

        // Animate the container (which has everything inside it)
        this.scene.tweens.add({
            onStart: () => {card.frontArt.setPipeline(PIPELINE_ENUMS.BURNING_PIPELINE);},
            targets: tempObj,  // Use the temporary object as the target    
            burnAmount: 1,
            duration: this.explosionConfig.duration,
            ease: 'Power2',
            onUpdate: (tween) => {
                card.frontArt.pipeline.set1f('burnAmount', tempObj.burnAmount);
            },
            onComplete: () => {
                card.frontArt.setAlpha(0);
                card.frontArt.resetPipeline();
            }
        });
    }

    /** Function to show the end game message */
    showEndGamePanel() {
        this.scene.tweens.add({
            targets: this.scene.maskPanel,
            alpha: {from:0, to:0.85},
            duration: 1000,
            onComplete: () => {
                // After background is darkened, animate the message elements
                this.animateEndGameElements();
            }
        });
    }

    /**
     * Create a dynamic animation sequence for the end game message elements
     */
    animateEndGameElements() {
        // Make elements visible but start with different scales for a staggered pop-in effect
        this.messageBackground.setVisible(true).setScale(0);
        this.winningMessage.setVisible(true).setScale(0);
        this.fruitImage.setVisible(true).setScale(0);
        
        // Position fruit at its final position
        this.fruitImage.setPosition(
            this.scene.screenCenterX - 200, 
            this.scene.screenCenterY * 0.7
        ).setAlpha(0);
        
        // Animate all elements simultaneously with slightly staggered timings
        // This creates a feeling of them appearing together but with visual interest
        
        // Background appears first but only by a tiny fraction of time
        this.scene.tweens.add({
            targets: this.messageBackground,
            scale: { from: 0, to: 1.5 },
            duration: 500,
            ease: 'Back.easeOut',
        });
        
        // Text appears a tiny bit after
        this.scene.tweens.add({
            targets: this.winningMessage,
            scale: { from: 0, to: 1 },
            duration: 500,
            delay: 50, // Just enough delay to be visually interesting
            ease: 'Back.easeOut',
        });
        
        // Animate fruit with almost the same timing
        this.scene.tweens.add({
            targets: this.fruitImage,
            scale: { from: 0, to: 0.5 },
            alpha: { from: 0, to: 1 },
            duration: 500,
            delay: 100, // Slight delay for visual interest
            ease: 'Back.easeOut',
            onComplete: () => {
                // Add appropriate animations based on win/loss state
                if(this.isWinner) {
                    // Add a subtle floating animation to the fruit
                    this.scene.tweens.add({
                        targets: this.fruitImage,
                        scale: { from: 0.5, to: 0.55 },
                        duration: 2000,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                } else {
                    // Create a dangling animation for losing scenario
                    // First, adjust the pivot/origin point to simulate hanging from one nail
                    this.fruitImage.setOrigin(0.8, 0.2); // Set origin to upper right corner
                    
                    // Add a slight position adjustment to account for origin change
                    this.fruitImage.x += 15;
                    this.fruitImage.y -= 15;
                    
                    // Create the initial "falling" tilt animation
                    this.scene.tweens.add({
                        targets: this.fruitImage,
                        angle: 12, // Tilt clockwise
                        y: '+=20', // Drop down slightly
                        duration: 300,
                        ease: 'Bounce.easeOut', // Gives a nice bounce effect
                        onComplete: () => {
                            // Now create the dangling/swinging motion
                            let swingConfig = {
                                targets: this.fruitImage,
                                angle: { from: 12, to: -4 }, // Swing from right to left
                                duration: 2400,
                                ease: 'Sine.easeInOut',
                                yoyo: true,
                                repeat: -1, // Infinite repetition
                                repeatDelay: 100 // Small pause between swings
                            };
                            
                            // Add the primary swinging animation
                            this.scene.tweens.add(swingConfig);
                            
                            // Add a secondary, more subtle vertical bounce
                            this.scene.tweens.add({
                                targets: this.fruitImage,
                                y: '+=4', // Small vertical movement
                                duration: 1600,
                                ease: 'Sine.easeInOut',
                                yoyo: true,
                                repeat: -1,
                                delay: 400 // Offset from the swing to create more natural motion
                            });
                        }
                    });
                }
                
                // Show the wanted poster with bouncing animation after a delay
                this.scene.time.delayedCall(500, () => {
                    // Show wanted poster
                    this.showWantedPoster();
                });
            }
        });
        
        // Add a subtle animation to the message text that starts after everything appears
        this.scene.time.delayedCall(550, () => {
            this.scene.tweens.add({
                targets: this.winningMessage,
                scale: { from: 1, to: 1.05 },
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });
    }

    /**
     * Animate the wanted poster appearance
     */
    showWantedPoster() {
        // Make elements visible but start with zero scale
        this.wantedContainer.setVisible(true).setScale(0);
        
        // Animate the wanted poster with a dramatic entrance
        this.scene.tweens.add({
            targets: this.wantedContainer,
            scale: { from: 0, to: 1 },
            rotation: { from: -0.5, to: 0 },
            duration: 600,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Add "stamp" effect to the poster
                if(this.isWinner) this.createStampEffect();
                else this.createFleeingEffect();
            }
        });
    }

    /**
     * Create a "stamp" effect on the wanted poster
     */
    createStampEffect() {
        // Stamp animation with impact effect
        this.scene.tweens.add({
            targets: this.stamp,
            alpha: 1,
            scale: { from: 0.2, to: 0.1 },
            duration: 200,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Create impact ripple
                this.scene.cameras.main.shake(200, 0.01);
                
                // Make a ripple effect from the stamp
                const ripple = this.scene.add.circle(
                    this.stamp.x, 
                    this.stamp.y, 
                    10, 
                    0xffffff, 
                    0.5
                ).setDepth(1004);
                
                this.scene.tweens.add({
                    targets: ripple,
                    radius: 100,
                    alpha: 0,
                    duration: 400,
                    ease: 'Quad.easeOut',
                    onComplete: () => ripple.destroy()
                });
                
                // Add the final "Continue" button or prompt
                //this.showContinuePrompt();
                this.showRewardAnimation();
            }
        });
    }

    showRewardAnimation() {
        // Create a treasure chest at the bottom right of the screen
        const chestX = this.scene.screenWidth - 100;
        const chestY = this.scene.screenHeight - 100;
        
        this.chest = this.scene.add.image(
            chestX, 
            chestY, 
            ASSET_ENUMS.IMAGE_TREASURE_CHEST
        ).setScale(0)
            .setOrigin(0.5)
            .setDepth(1005);
        
        this.obj.push(this.chest);
        
        // Animate the chest appearing with a bounce
        this.scene.tweens.add({
            targets: this.chest,
            scale: 1.5,
            duration: 500,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Chest appears, now create the coins!
                this.createRewardCoins(chestX, chestY);
            }
        });
    }

    /**
     * Create reward coins that fly to the treasure chest
     * @param {number} chestX - X position of the chest
     * @param {number} chestY - Y position of the chest
     */
    createRewardCoins(chestX, chestY) {
        // Base number of coins to show (min 5, max 50)
        const rewardAmount = this.reward || 1000;
        const coinCount = Math.min(50, Math.max(5, Math.floor(rewardAmount / 20)));
        
        // Counter for completed coins
        let completedCoins = 0;
        
        // Create a counter text that shows the increasing reward
        const counterText = this.scene.add.text(
            chestX, 
            chestY - 40, 
            "0",
            {
                fontFamily: 'OnePieceFont',
                fontSize: '28px',
                color: '#ffdd00',
                stroke: '#000000',
                strokeThickness: 4,
                align: 'center'
            }
        ).setOrigin(0.5)
        .setDepth(1006)
        .setShadow(2, 2, '#000000', 2, true, true);
        
        this.obj.push(counterText);
        
        // Create a running counter for the text
        let currentCount = 0;
        const countIncrement = Math.ceil(rewardAmount / coinCount);
        
        // Used to stagger coin creation
        let createdCoins = 0;
        
        // Create coins in intervals to avoid overwhelming the system
        const createNextCoinBatch = () => {
            // Create a batch of coins
            const batchSize = Math.min(5, coinCount - createdCoins);
            
            for (let i = 0; i < batchSize; i++) {
                if (createdCoins >= coinCount) break;
                
                // Create a single coin
                this.createSingleCoin(chestX, chestY, () => {
                    // Update counter when a coin completes
                    completedCoins++;
                    currentCount += countIncrement;
                    if (currentCount > rewardAmount) currentCount = rewardAmount;
                    
                    counterText.setText(currentCount.toString());
                
                    // When all coins are collected, show the final screen
                    if (completedCoins >= coinCount) {
                        // Ensure the counter shows the exact reward amount
                        counterText.setText(rewardAmount.toString());
                    
                        // Create a celebratory effect
                        this.createCoinCompletionEffect(chestX, chestY);
                        
                        // Add bouncing animation to the counter
                        this.scene.tweens.add({
                            targets: counterText,
                            scale: 1.3,
                            duration: 300,
                            yoyo: true,
                            ease: 'Back.easeOut',
                            onComplete: () => {
                                // After a delay, show continue prompt
                                this.scene.time.delayedCall(1000, () => {
                                    // Create the animation for reward elements to disappear
                                    this.scene.tweens.add({
                                        targets: [counterText, this.chest],
                                        y: '+=50', // Move down slightly
                                        alpha: 0,
                                        scale: 0.8,
                                        duration: 800,
                                        ease: 'Back.easeIn',
                                        onComplete: () => {
                                            // Clean up reward elements
                                            this.showContinuePrompt();
                                        }
                                    });
                                });
                            }
                        });
                    }
                });
                
                createdCoins++;
            }
            
            // If we haven't created all coins yet, schedule the next batch
            if (createdCoins < coinCount) {
                this.scene.time.delayedCall(100, createNextCoinBatch);
            }
        };
        
        // Start creating coins
        createNextCoinBatch();
    }

    /**
     * Create a single coin that flies to the treasure chest
     * @param {number} chestX - X position of the chest
     * @param {number} chestY - Y position of the chest
     * @param {function} onComplete - Callback when coin animation completes
     */
    createSingleCoin(chestX, chestY, onComplete) {
        // Determine a random starting position around the wanted poster
        const posterX = this.wantedContainer.x;
        const posterY = this.wantedContainer.y;
        const radius = Math.random() * 100 + 50; // Random distance from poster
        const angle = Math.random() * Math.PI * 2; // Random angle
        
        const startX = posterX + Math.cos(angle) * radius;
        const startY = posterY + Math.sin(angle) * radius;
        
        // Create the coin
        const coin = this.scene.add.image(
            startX, 
            startY, 
            ASSET_ENUMS.IMAGE_BERRY_COIN
        ).setScale(0)
        .setOrigin(0.5)
        .setDepth(1004);
        
        this.obj.push(coin);
        
        // Random rotation for variety
        coin.rotation = Math.random() * Math.PI * 2;
        
        // Pop in with scale effect
        this.scene.tweens.add({
            targets: coin,
            scale: 0.15 + Math.random() * 0.05, // Random slight size variation
            rotation: coin.rotation + Math.PI * (Math.random() < 0.5 ? 0.5 : -0.5),
            duration: 200,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Add a slight hover effect before flying to chest
                this.scene.tweens.add({
                    targets: coin,
                    y: coin.y - 10,
                    duration: 200 + Math.random() * 300, // Random hover duration
                    ease: 'Sine.easeInOut',
                    onComplete: () => {
                        // Fly to the chest with arc motion
                        this.flyToChest(coin, chestX, chestY, onComplete);
                    }
                });
            }
        });
    }

    /**
     * Create an arc flight path for coins to fly to the chest
     * @param {Phaser.GameObjects.Image} coin - The coin image
     * @param {number} chestX - X position of the chest
     * @param {number} chestY - Y position of the chest
     * @param {function} onComplete - Callback when animation completes
     */
    flyToChest(coin, chestX, chestY, onComplete) {
        // Create a path for the coin to follow
        const startX = coin.x;
        const startY = coin.y;
        
        // Control points for bezier curve
        const cp1X = (startX + chestX) / 2 - (Math.random() * 100 - 50);
        const cp1Y = Math.min(startY, chestY) - (Math.random() * 100 + 50); // Arc upward
        
        // Create a path object to track progress
        const path = { t: 0 };
        
        // Fly duration based on distance
        const distance = Phaser.Math.Distance.Between(startX, startY, chestX, chestY);
        const duration = 600 + distance * 0.5; // Base duration + distance factor
        
        // Create a slight randomization in the duration
        const actualDuration = duration * (0.8 + Math.random() * 0.4);
        
        // Animate along the path
        this.scene.tweens.add({
            targets: path,
            t: 1,
            duration: actualDuration,
            ease: 'Quad.easeIn',
            onUpdate: () => {
                // Calculate position along the quadratic bezier curve
                const t = path.t;
                const invT = 1 - t;
                
                // Quadratic bezier formula
                coin.x = invT * invT * startX + 2 * invT * t * cp1X + t * t * chestX;
                coin.y = invT * invT * startY + 2 * invT * t * cp1Y + t * t * chestY;
                
                // Add spin during flight
                coin.rotation += 0.05;
                
                // Scale down as it gets closer to the chest
                if (t > 0.7) {
                    coin.scale = Phaser.Math.Linear(coin.scale, 0, (t - 0.7) / 0.3);
                }
            },
            onComplete: () => {
                // Flash effect at the chest
                this.createCoinImpactEffect(chestX, chestY);
                
                // Remove the coin
                coin.destroy();
                
                // Call the completion callback
                if (onComplete) onComplete();
            }
        });
    }

    /**
     * Create a small flash effect when a coin reaches the chest
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    createCoinImpactEffect(x, y) {
        try {
            // Create a small flash
            const flash = this.scene.add.circle(
                x + (Math.random() * 20 - 10),
                y + (Math.random() * 20 - 10),
                5,
                0xffdd00,
                0.8
            ).setDepth(1005);
            
            this.obj.push(flash);
            
            // Animate the flash
            this.scene.tweens.add({
                targets: flash,
                radius: 10,
                alpha: 0,
                duration: 200,
                ease: 'Quad.easeOut',
                onComplete: () => flash.destroy()
            });
        } catch (e) {
            // Silent fail
        }
    }

    /**
     * Create celebratory effect when all coins are collected
     * @param {number} x - X position of the chest
     * @param {number} y - Y position of the chest
     */
    createCoinCompletionEffect(x, y) {
        try {
            // Create a larger flash
            const flash = this.scene.add.circle(
                x,
                y,
                30,
                0xffdd00,
                0.6
            ).setDepth(1004);
            
            this.obj.push(flash);
            
            // Animate the large flash
            this.scene.tweens.add({
                targets: flash,
                radius: 80,
                alpha: 0,
                duration: 500,
                ease: 'Quad.easeOut',
                onComplete: () => flash.destroy()
            });
            
            // Create sparks radiating outward
            for (let i = 0; i < 12; i++) {
                const angle = (i / 12) * Math.PI * 2;
                const sparkX = x + Math.cos(angle) * 20;
                const sparkY = y + Math.sin(angle) * 20;
                
                const spark = this.scene.add.rectangle(
                    sparkX,
                    sparkY,
                    4,
                    8,
                    0xffdd00
                ).setDepth(1004)
                .setAngle(angle * 180 / Math.PI);
                
                this.obj.push(spark);
                
                // Animate the spark outward
                this.scene.tweens.add({
                    targets: spark,
                    x: sparkX + Math.cos(angle) * 60,
                    y: sparkY + Math.sin(angle) * 60,
                    alpha: 0,
                    duration: 400,
                    ease: 'Quad.easeOut',
                    onComplete: () => spark.destroy()
                });
            }
            
            // Chest bounce animation
            const chest = this.scene.children.getByName('treasure_chest');
            if (chest) {
                this.scene.tweens.add({
                    targets: chest,
                    scale: chest.scale * 1.2,
                    duration: 200,
                    yoyo: true,
                    ease: 'Sine.easeOut'
                });
            }
            
        } catch (e) {
            // Silent fail
        }
    }

    createFleeingEffect() {
        this.scene.tweens.add({
            targets: this.wantedContainer,
            alpha: 0,
            duration: 2500,
            ease: 'Back.easeIn',
            onComplete: () => {
                this.showContinuePrompt();
            }
        });
    }

    /**
     * Show a continue prompt to allow the player to dismiss the end game message
     */
    showContinuePrompt() {
        // Create continue text
        const continueText = this.scene.add.text(
            this.scene.screenCenterX,
            this.scene.screenHeight - 100,
            "Click anywhere to continue",
            {
                fontFamily: 'OnePieceFont',
                fontSize: '24px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5)
        .setDepth(1004)
        .setAlpha(0);
        
        this.obj.push(continueText);
        
        // Fade in the continue text
        this.scene.tweens.add({
            targets: continueText,
            alpha: 1,
            duration: 500,
            ease: 'Sine.easeIn',
            onComplete: () => {
                // Add pulsing effect to draw attention
                this.scene.tweens.add({
                    targets: continueText,
                    scale: 1.1,
                    duration: 800,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
                
                // Add click event to close
                this.scene.input.once('pointerdown', () => {
                    // Transition to the next scene or close animation
                    this.scene.tweens.add({
                        targets: [
                            this.messageBackground, this.fruitImage, 
                            this.winningMessage, this.wantedContainer, 
                            this.stamp, continueText
                        ],
                        alpha: 0,
                        duration: 500,
                        onComplete: () => {
                            // Clean up all objects
                            this.destroyAll();
                            
                            // Trigger any post-animation events
                            this.scene.time.delayedCall(500, () => {
                                this.scene.cameras.main.fadeOut(1000, 0, 0, 0); // Fade out over 1 second
                          
                                this.scene.cameras.main.once('camerafadeoutcomplete', () => {
                                    this.scene.scene.switch(SCENE_ENUMS.DECK_SELECTION);
                                });
                            });
                        }
                    });
                });
            }
        });
    }

    /** Function to destroy all the elements of the panel */
    destroyAll() {
        for(let obj of this.obj) {
            obj.destroy();
        }
    }
}