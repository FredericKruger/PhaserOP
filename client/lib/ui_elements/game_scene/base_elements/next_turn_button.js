const NEXT_TURN_BUTTON_STATES = Object.freeze({
    YOUR_TURN_ACTIVE: 'END TURN',
    YOUR_TURN_PASSIVE: 'OPPONENT TURN',
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

        this.fsmState = new NextTurnButtonInitState(this);

        this.backGround = this.scene.add.image(0, 0, ASSET_ENUMS.GAME_NEXT_TURN_IMAGE).setOrigin(0.5).setScale(0.35);
        this.buttonText = this.scene.add.text(0, 15, '', 
            {font: "600 30px OnePieceFont", color: COLOR_ENUMS_CSS.OP_WHITE}
        ).setOrigin(0.5);

        this.glowAnimation = null;
        this.glowVisible = false;

        this.add([this.backGround, this.buttonText]);
        this.scene.add.existing(this);

        this.setSize(this.backGround.displayWidth, this.backGround.displayHeight);
        this.setInteractive();
    }

    /** Sets the glow color
     * @param {number} glowColor
     */
    setGlow(glowColor) {
        this.fx = this.postFX.addGlow(glowColor, 3);
        this.glowAnimation = this.scene.tweens.add({
            targets: this.fx,
            outerStrength: 20,
            duration:2000,
            alpha:0.8,
            ease: 'Sine.inout',
            yoyo: true,
            repeat: -1
        });
    }

    /** Clears the glow */
    clearGlow() { 
        this.postFX.clear(); 
        if(this.glowAnimation !== null) this.glowAnimation.stop();
    }

    /** Function that sets the backgorund image to greyscale */
    setGreyscale() { this.backGround.setPipeline(PIPELINE_ENUMS.GREYSCALE_PIPELINE);}
    /** Function that clears the pipline */
    clearGreyscale() { this.backGround.resetPipeline(); }

    /** Make Interactive
     * @param {boolean} interactive
     */
    makeInteractive(interactive) {
        if(interactive) {
            if(!this.glowVisible) {
                this.setGlow(COLOR_ENUMS.OP_ORANGE);
                this.glowVisible = true;
            }
        }
        else {
            this.clearGlow();
            this.glowVisible = false;
        }
    }
}