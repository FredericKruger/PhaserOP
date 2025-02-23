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
        this.lifeDeck = new CardLifePileUI(scene, this);
        this.activeDonDeck = new ActiveDonDeckUI(scene, this, []);

        this.leaderLocation = new CardLocationUI(scene, this, CARD_TYPES.LEADER);
        this.stageLocation = new CardLocationUI(scene, this, CARD_TYPES.STAGE);

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
     * @param {Object} actionInfos
     * @param {boolean} startTargeting
     */
    playCard(actionInfos, startTargeting) {
        //get the card from the hand
        let card = this.hand.getCard(actionInfos.playedCard);

        let replaceCard = null;
        if(actionInfos.replacedCard !== -1) {
            if(card.cardData.card === CARD_TYPES.STAGE) replaceCard = this.stageLocation.getCard(actionInfos.replacedCard);
            else replaceCard = this.characterArea.getCard(actionInfos.replacedCard);

            //Create a discard Action
            //TODO: Implement discard action
        }

        //Play the card
        if(!startTargeting) {
            this.scene.actionLibrary.playCardAction(this, card, actionInfos.spentDonIds);
        } else {

        }
    }

    setVisible(visible) {
        this.donDeck.setVisible(visible);
        this.discard.setVisible(visible);
        this.deck.setVisible(visible);
        this.leaderLocation.setVisible(visible);
        this.stageLocation.setVisible(visible);

        this.characterArea.setVisible(visible);
        this.playerInfo.setVisible(visible);    
    }
}