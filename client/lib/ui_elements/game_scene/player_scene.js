class PlayerScene {

    //#region CONSTRUCTOR
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

        this.opponentPlayerScene = null;
        this.isPlayerTurn = false;

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
    //#endregion

    //#region CREATE FUNCTION
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
    //#endregion

    //#region PLAY CARD FUNCTION
    /** Function that handles when a card is played
     * @param {Object} actionInfos
     * @param {boolean} isPlayerTurn
     * @param {boolean} startTargeting
     */
    playCard(actionInfos, isPlayerTurn, startTargeting) {
        //get the card from the hand
        let card = this.hand.getCard(actionInfos.playedCard);
        if(!isPlayerTurn && !startTargeting) card.updateCardData(actionInfos.playedCardData); //Need to pass the cardData to the passive player as for now only has ID

        let replacedCard = null;
        if(actionInfos.replacedCard !== -1) {
            if(card.cardData.card === CARD_TYPES.STAGE) replacedCard = this.stageLocation.getCard(actionInfos.replacedCard);
            else replacedCard = this.characterArea.getCard(actionInfos.replacedCard);

            //Create a discard Action
            if(isPlayerTurn) this.scene.actionLibrary.discardCardAction(this, replacedCard);
            else this.scene.actionLibraryPassivePlayer.discardCardAction(this, replacedCard);
        }

        //Play the card
        if(!startTargeting) {
            if(isPlayerTurn) this.scene.actionLibrary.playCardAction(this, card, actionInfos.spentDonIds, replacedCard, actionInfos.abilityResults);
            else this.scene.actionLibraryPassivePlayer.playCardAction(this, card, actionInfos.spentDonIds, replacedCard, actionInfos.abilityResults);
        } else {
            if(isPlayerTurn) {
                //Create a targeting Manager
                let type = 'PLAY';
                if(card.cardData.type === CARD_TYPES.EVENT) type = 'EVENT';
                let targetManager = new TargetManager(this.scene, type, actionInfos.actionId);
                this.scene.targetManagers.push(targetManager);

                //Start Actions
                this.scene.actionLibrary.startPlayCardTargetingAction(this, card);
                this.scene.actionLibrary.startTargetingAction(this, card, false);
            } else {
                this.scene.actionLibraryPassivePlayer.startPlayCardTargetingAction(this, card);
            }
        }
    }
    //#endregion

    //#region ATTACK FUNCTIONS
    selectAttackTarget(actionInfos, isPlayerTurn) {
        let card = this.getCard(actionInfos.playedCard);
        this.scene.actionLibrary.startTargetingAction(this, card, false);
    }

    /** Function reset counter amounts */
    resetEventCounterAmounts() {
        //For each card in the character area
        for(let card of this.characterArea.cards) {
            card.eventCounterPower = 0;
        }

        //for the leader
        for(let card of this.leaderLocation.cards) {
            card.eventCounterPower = 0;
        }
    }
    //#endregion

    //#region CHECKER FUNCTIONS
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

    /** Function the counter is over a defending character card 
     * @param {number} pointerX
     * @param {number} pointerY
     * @returns {GameCardUI}
    */
    counterDraggedOverCharacter(pointerX, pointerY) {
        //Start with the leader
        for(let card of this.leaderLocation.cards) {
            if(card.getBounds().contains(pointerX, pointerY)) {
                return card;
            }
        }

        //Check the other characters
        for(let card of this.characterArea.cards) {
            if(card.getBounds().contains(pointerX, pointerY)) {
                return card;
            }
        }

        return null;
    }
    //#endregion

    //#region UTIL FUNCTIONS
    /** Function to get a card from the player
     * @param {number} cardId
     * @return {GameCardUI}
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

        card = this.lifeDeck.getCard(cardId);
        if(card !== undefined && card !== null) return card;

        card = this.discard.getCard(cardId);
        if(card !== undefined && card !== null) return card;

        card = this.deck.getCard(cardId);
        return card;
    }

    /** Function that finds a DonCard in the deckpile
     * @param {number} cardId
     * @return {DonCardUI}
     */
    getDonCardById(cardId) {
        let card = this.activeDonDeck.getCard(cardId);
        if(card !== undefined && card !== null) return card;

        card = this.donDeck.getCard(cardId);
        return card;
    }

    /** Function to remove card whereever it is
     * @param {GameCardUI} card
     */
    removeCard(card) {
        //Check the character area first
        if (this.hand.cards.includes(card)) {
            this.hand.removeCard(card);
            return true;
        }

        //Check the character area
        if (this.characterArea.cards.includes(card)) {
            this.characterArea.removeCard(card);
            return true;
        }

        //Check the leader location
        if (this.leaderLocation.cards.includes(card)) {
            this.leaderLocation.removeCard(card);
            return true;
        }

        //Check the stage location
        if (this.stageLocation.cards.includes(card)) {
            this.stageLocation.removeCard(card);
            return true;
        }

        //Check the discard pile
        if (this.discard.cards.includes(card)) {
            this.discard.removeCard(card);
            return true;
        }
        
        return false;
    }

    /** Function to set visibility 
     * @param {boolean} visible
     */
    setVisible(visible) {
        this.donDeck.setVisible(visible);
        this.discard.setVisible(visible);
        this.deck.setVisible(visible);
        this.leaderLocation.setVisible(visible);
        this.stageLocation.setVisible(visible);

        this.characterArea.setVisible(visible);
        this.playerInfo.setVisible(visible);    
    }
    //#endregion
}