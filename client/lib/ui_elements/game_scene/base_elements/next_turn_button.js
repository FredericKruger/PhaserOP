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
        this.buttonText = this.scene.add.text(0, -10, 'Next Turn', 
            {font: "600 30px OnePieceFont", color: COLOR_ENUMS_CSS.OP_WHITE}
        ).setOrigin(0.5);

        this.add([this.backGround, this.buttonText]);
        this.setSize(this.backGround.displayWidth, this.backGround.displayHeight);
        this.scene.add.existing(this);

        this.setInteractive();
        this.on('pointerdown', () => {
            console.log("coucou");
            this.scene.add.tween({
                targets: this.backGround,
                rotation: Math.PI*2,
                duration: 500
            });
        });
    }

}