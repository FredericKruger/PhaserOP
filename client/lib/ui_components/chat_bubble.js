class ChatBubble extends Phaser.GameObjects.Container {

    constructor(scene, position, text) {
        super(scene, position.x, position.y);
        this.scene = scene;
        this.text = text;
        this.flipX = position.flipX;

        // Calculate offsets based on desired origin point
        // For example, to make top-left the origin (0,0):
        const bubbleWidth = GAME_UI_CONSTANTS.SPEECH_BUBBLE_WIDTH || 240;
        const bubbleHeight = GAME_UI_CONSTANTS.SPEECH_BUBBLE_HEIGHT || 120;
        
        // If you want the speech bubble's top-left to be at the container's position
        // instead of its center, position children accordingly:
        let offsetX = bubbleWidth * 0.5 * 0.7;
        let offsetY = bubbleHeight * 0.5 * 0.7;
        let textOffset = 20; // Adjust this value to position the text correctly

        if (this.flipX) {
            offsetX = -offsetX;
            offsetY = -offsetY; // Adjust offset for flipped bubble
            textOffset = -textOffset; // Adjust text offset for flipped bubble
        }

        this.bubble = this.scene.add.image(-offsetX, -offsetY, ASSET_ENUMS.IMAGE_SPEECH_BUBBLE).setOrigin(0.5, 0.5);
        this.bubble.setScale(0.1);
        this.bubble.setAlpha(0);
        this.bubble.setFlipX(this.flipX); // Flip the bubble if needed
        this.bubble.setFlipY(this.flipX);

        // Calculate font size based on text length
        const fontSize = this.calculateFontSize(text);
    
        this.textObject = this.scene.add.text(-offsetX, -offsetY-textOffset, text, {
            fontFamily: 'OnePieceMangaFont',
            fontSize: `${fontSize}px`,
            color: '#000000',
            align: 'center',
            wordWrap: { width: 140, useAdvancedWrap: true },
            padding: { x: 5, y: 5 }
        }).setOrigin(0.5, 0.5).setAlpha(0).setScale(0.1);

        this.add(this.bubble);
        this.add(this.textObject);

        this.setSize(this.bubble.displayWidth, this.bubble.displayHeight);
        this.scene.add.existing(this);

        this.setDepth(4);
    }

    show(duration = 2000, callBack = null, delay = 0) {
        // Step 1: Bubble pop in
        this.scene.tweens.add({
            targets: this.bubble,
            scale: 0.7,
            alpha: 1,
            duration: 200,
            delay: delay,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Add a little bounce effect when the bubble appears
                this.scene.tweens.add({
                    targets: this.bubble,
                    scale: 0.75,
                    duration: 100,
                    yoyo: true,
                    ease: 'Sine.easeInOut'
                });
                
                // Step 2: Text fade in (after bubble appears)
                this.scene.tweens.add({
                    targets: this.textObject,
                    scale: 1,
                    alpha: 1,
                    duration: 200,
                    ease: 'Back.easeOut',
                    onComplete: () => {
                        // Step 3: Wait for duration then fade out
                        this.scene.time.delayedCall(duration, () => {
                            // Step 4: Fade out everything
                            this.scene.tweens.add({
                                targets: [this.bubble, this.textObject],
                                alpha: 0,
                                scale: 0.55,
                                duration: 200,
                                ease: 'Back.easeIn',
                                onComplete: () => {
                                    this.destroy();
                                    if(callBack) callBack();
                                }
                            });
                        });
                    }
                });
            }
        });
    }

    /**
     * Calculate the appropriate font size based on text length
     * @param {string} text - The text content
     * @returns {number} - The calculated font size
     */
    calculateFontSize(text) {
        // Base font size
        const baseFontSize = 18;
        
        // Character count
        const charCount = text.length;
        
        // Determine font size based on character count ranges
        if (charCount <= 20) {
            // Short messages can use standard size
            return baseFontSize;
        } else if (charCount <= 40) {
            // Medium messages, slightly smaller
            return baseFontSize - 2;
        } else if (charCount <= 60) {
            // Longer messages, smaller yet
            return baseFontSize - 4;
        } else if (charCount <= 80) {
            // Very long messages, quite small
            return baseFontSize - 5;
        } else {
            // Extremely long messages, minimum size
            return baseFontSize - 6;
        }
    }
}