class PackVisual extends Phaser.GameObjects.Container {

    /**
     * 
     * @param {*} scene 
     * @param {number} x 
     * @param {number} y 
     * @param {string} set 
     * @param {boolean} isPlaceholder 
     * @param {number} amount 
     * @param {number} scale
     */
    constructor (scene, x, y, set, isPlaceholder, amount, scale) {
        super(scene, x, y);

        this.scene = scene;
        this.amount = amount;
        this.set = set;
        this.isPlaceholder = isPlaceholder;

        this.art = this.scene.add.image(0, 0, this.scene.game.utilFunctions.getPackArt(set)).setOrigin(0.5);

        this.banner = this.scene.add.image(this.art.displayWidth/2 - 50, -this.art.displayHeight/2 - 2, ASSET_ENUMS.PACK_NUMBER_BANNER).setScale(1.2).setOrigin(0.5, 0); 
        this.banner.setPipeline(PIPELINE_ENUMS.PURPLE_TO_ORANGE_PIPELINE);
        this.banner.setVisible(amount > 1);

        this.numberText = this.scene.add.text(
            this.banner.x, this.banner.y + this.banner.displayHeight/2, 
            this.amount, 
            { fontFamily: 'Arial', fontSize: 40, color: COLOR_ENUMS_CSS.OP_BLACK }
        ).setOrigin(0.5, 0.5);
        this.numberText.setVisible(amount > 1);

        this.add([this.art, this.banner, this.numberText]);

        this.setSize(this.art.displayWidth, this.art.displayHeight);
        this.setScale(scale);
 
        this.scene.add.existing(this);

        if(this.isPlaceholder) this.updateAmount(this.amount-1);
    }

    showBanner (show) {
        this.banner.setVisible(show);
        this.numberText.setVisible(show);
    }

    updateAmount (amount) {
        this.amount = amount;
        this.numberText.setText(this.amount);
        this.showBanner(this.amount > 1);
    }

    saveLocalPosition() {
        this.localX = this.x;
        this.localY = this.y;
    }

    /** FUNCTION TO UPDATE THE NEW POSITION */
    updatePosition (newX, newY) {
        this.setPosition(newX, newY);
        this.localX = this.x;
        this.localY = this.y;
    }

    /** SET TO LOCAL POSITION */
    setToLocalPosition() {
        this.setPosition(this.localX, this.localY);
    }
}