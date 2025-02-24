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
     * @param {boolean} isPlayerTurn
     * @param {boolean} startTargeting
     */
    playCard(actionInfos, isPlayerTurn, startTargeting) {
        //get the card from the hand
        let card = this.hand.getCard(actionInfos.playedCard);
        if(!isPlayerTurn) card.updateCardData(actionInfos.playedCardData); //Need to pass the cardData to the passive player as for now only has ID

        let replacedCard = null;
        if(actionInfos.replacedCard !== -1) {
            if(card.cardData.card === CARD_TYPES.STAGE) replaceCard = this.stageLocation.getCard(actionInfos.replacedCard);
            else replaceCard = this.characterArea.getCard(actionInfos.replacedCard);

            //Create a discard Action
            //TODO: Implement discard action
        }

        //Play the card
        if(!startTargeting) {
            if(isPlayerTurn) this.scene.actionLibrary.playCardAction(this, card, actionInfos.spentDonIds);
            else this.scene.actionLibraryPassivePlayer.playCardAction(this, card, actionInfos.spentDonIds);
        } else {

        }
    }

    /** Function to get a card from the player
     * @param {number} cardId
     */
    getCard(cardId) {
        let card = this.hand.getCard(cardId);
        if(card !== undefined && card !== null) return card;

        card = this.characterArea.getCard(cardId);
        if(card !== undefined && card !== null) return card;

        card = this.leaderLocation.getCard(cardId);
        if(card !== undefined && card !== null) return card;

        card = this.stageLocation.getCard(cardId);
        if(card !== undefined && card !== null) return card;

        card = this.discard.getCard(cardId);
        return card;
    }

    /** Function the pointer is over a character card
     * @param {number} pointerX
     * @param {number} pointerY
     */
    donDraggedOverCharacter(pointerX, pointerY) {
        //Start with leader
        for(let card of this.leaderLocation.cards) {
            if(card.getBounds().contains(pointerX, pointerY)) {
                return card;
            }
        }

        //Then check the characters
        for(let card of this.characterArea.cards) {
            if(card.getBounds().contains(pointerX, pointerY)) {
                return card;
            }
        }

        return null;
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