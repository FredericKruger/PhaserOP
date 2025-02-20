class DonCardUI extends BaseCardUI {

    constructor(scene, playerScene, config) {
        super(scene, playerScene, config);

        this.id = config.id;

        //STATE VARIABLES
        this.isInPlayAnimation = false;

        this.backArt.setTexture(ASSET_ENUMS.CARD_BACK2);
        this.frontArt.setTexture(ASSET_ENUMS.DON_CARD);
    }

}