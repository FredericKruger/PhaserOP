class AbilityButton extends Phaser.GameObjects.Container {

    constructor(scene, card, ability) {
        super(scene, ability.art.posx - card.frontArt.width/2, ability.art.posy - card.frontArt.height/2);

        this.scene = scene;
        /** @type {GameCardUI} */
        this.card = card;
        this.ability = ability;

        this.type = ability.type;
        this.canActivate = false;
        this.name = ability.art.art;
        this.id = ability.id;

        this.defaultScale = 1.1; // Default scale for the button

        this.isPulsating = false;
        this.canPulsate = true;
        this.pulseTween = null;

        //Prepare blocker button
        this.abilityButton = this.scene.add.image(
            0, 0, 
            this.ability.art.art
        );

        this.abilityButton.preFX.addGlow(COLOR_ENUMS.OP_WHITE, 4);

        this.setSize(this.abilityButton.width, this.abilityButton.height);

        this.setVisible(false);
        this.setScale(this.defaultScale);
        this.setInteractive();

        this.add(this.abilityButton);
        this.scene.add.existing(this);
    }

    update() {
        this.setVisible(this.card.artFullyVisible);
    }

    onPointerOver() {
        // Kill any existing tweens on the button to prevent conflicts
        this.canPulsate = false; // Prevent multiple pulsating animations
        this.stopPulsatingAnimation(); // Stop any existing pulsating animation
        this.scene.tweens.killTweensOf(this);

        // Bring to top within its depth level instead of absolute top
        const currentDepth = this.card.depth;
        this.card.setDepth(currentDepth + 0.1);
        this.setDepth(this.depth + 0.1);

        // Calculate the scaled size and position constraints
        const targetScale = 3;
        const scaledWidth = this.abilityButton.width * targetScale * this.card.scale;
        const scaledHeight = this.abilityButton.height * targetScale * this.card.scale;

        // Get the button's world position
        const worldPos = this.getWorldTransformMatrix();
        const currentWorldX = worldPos.tx;
        const currentWorldY = worldPos.ty;
    
        // Calculate screen boundaries with padding
        const padding = 0;
        const minX = padding + (scaledWidth / 2);
        const maxX = this.scene.screenWidth - padding - (scaledWidth / 2);
        const minY = padding + (scaledHeight / 2);

        // Get the player hand position to ensure button stays above it
        const handTopY = this.scene.screenCenterY + this.scene.screenHeight / 2 - 50 - GAME_UI_CONSTANTS.CARD_ART_HEIGHT * CARD_SCALE.IN_HAND * 0.5 - 20;
        const maxY = Math.min(handTopY - (scaledHeight / 2), this.scene.screenHeight - padding - (scaledHeight / 2));
        
        // Calculate constrained position
        let constrainedX = Math.max(minX, Math.min(maxX, currentWorldX));
        let constrainedY = Math.max(minY, Math.min(maxY, currentWorldY));
    
        // Convert world coordinates back to local coordinates relative to the card
        const cardWorldPos = this.card.getWorldTransformMatrix();
        const localX = constrainedX - cardWorldPos.tx;
        const localY = constrainedY - cardWorldPos.ty;

        // Store original position for restoration
        //if (!this.originalX) {
            this.originalX = this.x;
            this.originalY = this.y;
        //}

        // Create smooth scaling tween
        this.scene.tweens.add({
            targets: this,
            x: localX,
            y: localY,
            scale: 3, // Target scale
            duration: 200, // Duration in ms
            ease: 'Cubic.easeOut', // Smooth easing function
            onUpdate: () => {
                // Optional: Adjust glow intensity based on scale
                const glowIntensity = 3 + (this.scale - 1.1) * 0.5;
                this.abilityButton.preFX.clear();
                if(this.canActivate) this.abilityButton.preFX.addGlow(COLOR_ENUMS.OP_ORANGE, glowIntensity);
                else this.abilityButton.preFX.addGlow(COLOR_ENUMS.OP_WHITE, glowIntensity);
            }
        });
    }

    onPointerOut() {
        // Kill any existing tweens on the button to prevent conflicts
        this.scene.tweens.killTweensOf(this);

        // Restore original depth
        this.card.setDepth(Math.floor(this.card.depth));
        this.depth = Math.floor(this.depth);

        // Create smooth scaling down tween
        this.scene.tweens.add({
            targets: this,
            x: this.originalX || this.x,
            y: this.originalY || this.y,
            scale: this.defaultScale, // Original scale
            duration: 150, // Slightly faster for better UX
            ease: 'Cubic.easeOut', // Smooth easing function
            onUpdate: () => {
                // Optional: Adjust glow intensity based on scale
                const glowIntensity = 3 + (this.scale - 1.1) * 0.5;
                this.abilityButton.preFX.clear();
                if(this.canActivate) this.abilityButton.preFX.addGlow(COLOR_ENUMS.OP_ORANGE, glowIntensity);
                else this.abilityButton.preFX.addGlow(COLOR_ENUMS.OP_WHITE, glowIntensity);
            },
            onComplete: () => {
                this.canPulsate = true; // Allow pulsating again after scaling down
            }
        });
    }

    onPointerDown() {
        // Add a quick "press" animation for better feedback
        if(this.type !== "PASSIVE"
            && this.type !== "AURA"
        ) {
            this.scene.tweens.add({
                targets: this,
                scale: this.scale * 0.9, // Slightly smaller on press
                duration: 50,
                yoyo: true,
                onComplete: () => {
                    // Trigger the ability after the press animation
                    this.ability.trigger();
                }
            });
        }
    }

    startPusaltingAnimation() {
        // Start pulsing animation
        /*if (!this.isPulsating) {
            this.isPulsating = true;
            this.pulseTween = this.scene.tweens.add({
                targets: this,
                scale: this.defaultScale + 0.2, // Scale up by 20%
                yoyo: true, // Reverse the tween
                repeat: -1, // Repeat indefinitely
                duration: 1000, // 1 second for a full pulse
                ease: 'Sine.easeInOut'
            });
        }*/
    }

    stopPulsatingAnimation() {
        // Stop pulsing animation and reset scale
        /*if (this.isPulsating) {
            this.pulseTween.stop();
            this.pulseTween = null;
            this.isPulsating = false;
            this.setScale(this.defaultScale); // Reset to original scale
        }*/
    }

}