class DonCardUI extends BaseCardUI {

    constructor(scene, playerScene, config) {
        super(scene, playerScene, config);

        this.id = config.id;

        //STATE VARIABLES
        this.isInPlayAnimation = false;

        this.backArt.setTexture(ASSET_ENUMS.CARD_BACK2);
        this.frontArt.setTexture(ASSET_ENUMS.DON_CARD);
    }

    /** Function to set the state of the don card 
     * @param {string} state
    */
    setState(state) {
        this.state = state;
        if(this.playerScene.player.isActivePlayer) {
            if(this.state === CARD_STATES.DON_ACTIVE) {
                this.makeInteractive(true);
                this.makeDraggable(true);
                this.setVisible(true);
            } else if(this.state === CARD_STATES.DON_RESTED) {
                this.makeInteractive(false);
                //this.makeDraggable(false);
                this.setVisible(false);
            } 
        }
    }

}