class NextTurnButtonActiveState extends NextTurnButtonState {

    constructor(button, previousState) {
        super(button, NEXT_TURN_BUTTON_FSM_STATES.ACTIVE, previousState);
    }

    enter() {
        super.enter();
        this.button.makeInteractive(true);
        this.button.buttonText.setText("END TURN");
    }

    onPointerDown(pointer, gameObject) {    
        // Create a more dynamic rotation animation
        this.button.scene.add.tween({
            onStart: () => {
                this.exit(NEXT_TURN_BUTTON_FSM_STATES.PASSIVE);
                
                // Slightly scale up at the start
                this.button.scene.tweens.add({
                    targets: this.button,
                    scaleX: 1.15,
                    scaleY: 1.15,
                    duration: 150,
                    ease: 'Back.easeOut',
                    yoyo: true
                });
            },
            targets: this.button,
            rotation: Math.PI * 4, // Two full rotations instead of one
            duration: 700, // Slightly longer duration
            ease: 'Cubic.easeInOut', // More dynamic easing function
            onUpdate: (tween) => {
                // Add subtle scale pulsing during rotation
                const progress = tween.progress;
                const scaleFactor = 1 + 0.05 * Math.sin(progress * Math.PI * 4);
                this.button.setScale(scaleFactor);
            },
            onComplete: () => {
                // Reset scale and rotation
                this.button.setScale(1);
                this.button.setRotation(0);
                
                // Add final impact effect
                this.button.scene.tweens.add({
                    targets: this.button,
                    scaleX: 1.2,
                    scaleY: 1.2,
                    duration: 100,
                    yoyo: true,
                    ease: 'Bounce.easeOut',
                    onComplete: () => {
                        // Transition to next phase
                        this.button.scene.gameStateManager.triggerNextTurn();
                    }
                });
            }
        });
    }
}
