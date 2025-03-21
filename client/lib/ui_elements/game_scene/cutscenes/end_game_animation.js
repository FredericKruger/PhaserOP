
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
    }

    startAnimation() {
        const losingLeaderCard = this.isWinner ? this.scene.activePlayerScene.leaderLocation.cards[0] : this.scene.passivePlayerScene.leaderLocation.cards[0];

        //hide all effects
        losingLeaderCard.stopDizzyAnimation();

        // First animate the card to the center with a subtle glow for dramatic effect
        this.shakeCard(losingLeaderCard).then(() => {
            // After centered, explode the card
            this.explodeCard(losingLeaderCard);
            
            // Display appropriate message after explosion
            setTimeout(() => {
                //this.showEndGameMessage();
            }, this.explosionConfig.duration * 0.8);
        });

        // Create a dark overlay for better contrast
        /*const overlay = this.scene.add.rectangle(
            this.scene.screenCenterX, 
            this.scene.screenCenterY,
            this.scene.screenWidth,
            this.scene.screenHeight,
            0x000000, 0
        ).setDepth(3);
        this.obj.push(overlay);

        this.scene.tweens.add({
            targets: overlay,
            alpha: 0.5,
            duration: 1000,
        });*/
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
                y: card.y + 50,
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

    /** Function to destroy all the elements of the panel */
    destroyAll() {
        for(let obj of this.obj) {
            obj.destroy();
        }
    }
}