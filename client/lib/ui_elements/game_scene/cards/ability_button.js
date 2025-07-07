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

        // Create smooth scaling tween
        this.scene.tweens.add({
            targets: this,
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