class DonCardUI extends BaseCardUI {

    //#region CONSTRUCTOR
    /** Constructor
     * @param {GameScene} scene - The scene that the card belongs to
     * @param {PlayerScene} playerScene - The player scene that the card belongs to
     * @param {Object} config - Configuration
     */
    constructor(scene, playerScene, config) {
        super(scene, playerScene, config);

        this.id = config.id;

        //STATE VARIABLES
        this.isInPlayAnimation = false;

        this.backArt.setTexture(ASSET_ENUMS.CARD_BACK2);
        this.frontArt.setTexture(ASSET_ENUMS.DON_CARD);

        this.fsmState = new DonInDeckState(this);
    }
    //#endregion

    //#region STATE FUNCTIONS
    /** Function to set the state of the don card 
     * @param {string} state
    */
    setState(state) {
        this.state = state;
        this.setFSMState(state);
    }

    /** Set the Final State Machine state from the state
     * @param {string} state
    */
    setFSMState(state) {
        switch(state) {
            case CARD_STATES.IN_DON_DECK:
                this.fsmState.exit(DON_CARD_STATES.IN_DECK);
                break;
            case CARD_STATES.DON_ACTIVE:
                this.fsmState.exit(DON_CARD_STATES.ACTIVE);
                break;
            case CARD_STATES.DON_RESTED:
                this.fsmState.exit(DON_CARD_STATES.EXERTED);
                break;
            case CARD_STATES.DON_ATTACHED: 
                this.fsmState.exit(DON_CARD_STATES.ATTACHED);
                break;
            case CARD_STATES.DON_TRAVELLING:
                this.fsmState.exit(DON_CARD_STATES.TRAVELLING);
                break;
        }
    }

    //#endregion

}