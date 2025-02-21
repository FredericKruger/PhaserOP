const NEXT_TURN_BUTTON_STATES = Object.freeze({
    YOUR_TURN_ACTIVE: 'END TURN',
    YOUR_TURN_PASSIVE: 'END TURN',
    PASS: 'PASS',
    OPPONENT_ACTION: 'OPPONENT ACTION',
    OPPONENT_TURN: 'OPPONENT TURN'
})

class NextTurnButton extends Phaser.GameObjects.Container {

    /**Constructor
     * @param {GameScene} scene
     * @param {number} x
     * @param {number} y
     */
    constructor(scene, x, y) {
        super(scene, x, y);

        this.scene = scene;

        this.backGround = this.scene.add.image(0, 0, ASSET_ENUMS.GAME_NEXT_TURN_IMAGE).setOrigin(0.5).setScale(0.35);
        this.buttonText = this.scene.add.text(0, -10, '', 
            {font: "600 30px OnePieceFont", color: COLOR_ENUMS_CSS.OP_WHITE}
        ).setOrigin(0.5);

        this.add([this.backGround, this.buttonText]);
        this.setSize(this.backGround.displayWidth, this.backGround.displayHeight);
        this.scene.add.existing(this);

        this.on('pointerdown', () => {
            this.scene.add.tween({
                targets: this.backGround,
                rotation: Math.PI*2,
                duration: 500
            });
        });
    }

    /** Sets the glow color
     * @param {number} glowColor
     */
    setGlow(glowColor) {
        this.postFX.addGlow(glowColor, 3);
    }

    /** Clears the glow */
    clearGlow() { this.postFX.clear(); }

    /** Function that sets the backgorund image to greyscale */
    setGreyscale() { this.backGround.setPipeline(PIPELINE_ENUMS.GREYSCALE_PIPELINE);}
    /** Function that clears the pipline */
    clearGreyscale() { this.backGround.resetPipeline(); }

    /** Function to set the button state */
    setButtonText(buttonState) {
        switch(buttonState) {
            case NEXT_TURN_BUTTON_STATES.YOUR_TURN_ACTIVE:
                this.buttonText.setText("END TURN");
                this.setInteractive(true);
                this.addGlow(COLOR_ENUMS.OP_ORANGE, 3);
                this.clearGreyscale();
                break;
            case NEXT_TURN_BUTTON_STATES.YOUR_TURN_PASSIVE:
                this.buttonText.setText("END TURN");
                this.setInteractive(false);
                this.clearGlow();
                this.setGreyscale();
                break;
            case NEXT_TURN_BUTTON_STATES.PASS:
                this.buttonText.setText("PASS");
                this.setInteractive(true);
                this.addGlow(COLOR_ENUMS.OP_ORANGE, 3);
                this.clearGreyscale();
                break;
            case NEXT_TURN_BUTTON_STATES.OPPONENT_TURN:
                this.buttonText.setText("OPPONENT TURN");
                this.setInteractive(false);
                this.clearGlow();
                this.setGreyscale();
                break;
            case NEXT_TURN_BUTTON_STATES.OPPONENT_ACTION:
                this.buttonText.setText("OPPONENT ACTION");
                this.setInteractive(false);
                this.clearGlow();
                this.setGreyscale();
                break;
        }
    }
}