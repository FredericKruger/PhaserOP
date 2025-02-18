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
        let phaseBox = this.scene.add.image(10, this.screenCenterY, ASSET_ENUMS.GAME_PHASE_BOX).setScale(0.8).setOrigin(0, 0.5).setDepth(0).setAlpha(0.74);
        this.phaseText = this.scene.add.text(30, this.screenCenterY, "", 
            {font: "30px OnePieceTCGFont", color: COLOR_ENUMS_CSS.OP_WHITE, align: "left"}
        ).setOrigin(0, 0.5).setDepth(0);
        this.obj.push(phaseBox);
        this.obj.push(this.phaseText);

        this.mulliganUI.create();
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