class GameStateUI {

    /**
     * 
     * @param {GameScene} scene 
     * @param {GameStateManager} gameStateManager
     */
    constructor(scene, gameStateManager) {
        this.scene = scene;
        this.gameStateManager = gameStateManager;

        //Mulligan UI
        this.mulliganUI = new MulliganUI(scene);

        this.obj = [];
    }

    /** Function to create the ui elements */
    create() {
        //Create the phase box
        this.phaseBox = this.scene.add.image(10, this.scene.screenCenterY, ASSET_ENUMS.GAME_PHASE_BOX).setScale(0.8).setOrigin(0, 0.5).setDepth(0).setAlpha(0.74);
        this.phaseText = this.scene.add.text(30, this.scene.screenCenterY, "", 
            {font: "30px OnePieceTCGFont", color: COLOR_ENUMS_CSS.OP_WHITE, align: "left"}
        ).setOrigin(0, 0.5).setDepth(0);
        this.obj.push(this.phaseBox);
        this.obj.push(this.phaseText);

        //Next turn button
        this.nextTurnbutton = new NextTurnButton(this.scene, this.scene.screenWidth-150, this.scene.screenCenterY);
        this.nextTurnbutton.setDepth(1);
        this.obj.push(this.nextTurnbutton);

        // Create the dashed line with a sketched look
        this.createSketchedDashedLine();

        this.mulliganUI.create();
    }

    /** Function to create a sketched dashed line */
    createSketchedDashedLine() {
        let graphics = this.scene.add.graphics();
        graphics.lineStyle(4, COLOR_ENUMS.OP_BLACK, 1); // White color, 2px width

        let startX = this.scene.screenWidth*0.2;
        let endX = this.scene.screenWidth*0.8;
        let y = this.scene.screenCenterY-10;

        let dashLength = 20;
        let gapLength = 10;
        let randomness = 4; // Adjust this value for more or less sketchiness

        for (let x = startX; x < endX; x += dashLength + gapLength) {
            let randomOffset = Phaser.Math.Between(-randomness, randomness);
            graphics.beginPath();
            graphics.moveTo(x, y + randomOffset);
            graphics.lineTo(x + dashLength, y + randomOffset);
            graphics.strokePath();
        }
        graphics.setDepth(0);

        this.obj.push(graphics);
    }
    

    /** Function to set the visibily of the ui elements
     * @param {boolean} visible
     */
    setVisible(visible) {
        for(let obj of this.obj) {
            obj.setVisible(visible);
        }
    }

    /** Funciton that updates the phase ui text
     * @param {string} phase
     */
    udpatePhase(phase) {
        this.phaseText.setText(phase);
    }

}