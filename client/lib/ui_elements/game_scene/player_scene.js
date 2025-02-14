class PlayerScene {

    /**
     * 
     * @param {GameScene} scene 
     * @param {string} playerPosition 
     * @param {Player} player
     */
    constructor(scene, playerPosition, player) {
        this.scene = scene;
        this.player = player;

        this.playerPosition = playerPosition;

        //Initialize player UI Components
        this.donDeck = new DonDeckUI(scene, this);
        this.discard = new CardDiscardUI(scene, this);
        this.deck = new CardDeckUI(scene, this);

        this.leaderLocation = new CardLocationUI(scene, this, "Leader");
        this.stageLocation = new CardLocationUI(scene, this, "Stage");

        this.hand = new CardHandUI(scene, this);
        this.characterArea = new CharacterAreaUI(scene, this);
        this.playerInfo = new PlayerInfoUI(scene, this);
    }

    /** Draw all the elements */
    create() {
        this.donDeck.create();
        this.discard.create();
        this.deck.create();
        this.leaderLocation.create();
        this.stageLocation.create();
        this.characterArea.create();

        this.playerInfo.create();
    }

    /** Function that handles when a card is played
     * @param {GameCardUI} card
     */
    playCard(card) {
        if(card.cardData.type === CARD_TYPES.LOCATION) {
            //this.characterArea.addCard(card);
        } else if(card.cardData.card === CARD_TYPES.CHARACTER) {
            this.scene.actionLibrary.playCardAction(card, this);
        }
    }
}