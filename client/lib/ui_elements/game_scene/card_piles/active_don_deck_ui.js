class ActiveDonDeckUI extends CardPileUI {

    /**
     * Constructor
     * @param {GameScene} scene 
     * @param {PlayerScene} playerScene 
     * @param {Array<DonCardUI>} cards 
     */
    constructor(scene, playerScene, cards) {
        super(scene, playerScene);

        this.cards = cards;
    }

    /** Function to add a card
     * @param {DonCardUI} card
     */
    addCard(card) {
        this.cards.push(card);
        card.setState(CARD_STATES.DON_ACTIVE);
    };

    /** Function to get a card from the ID
     * @param {number} cardID
     * @returns {DonCardUI} - The card with the ID
     */
    getCard(cardID) {
        return this.cards.find(card => card.id === cardID);
    }

    /** Function that gives the number of active don cards in the pile */
    getNumberOfActiveCards() {return this.cards.filter(card => card.state === CARD_STATES.DON_ACTIVE).length;}

    /** Function that gives the number of don cards in the pile that are not active */
    getNumberOfRestingCards() {return this.cards.filter(card => card.state !== CARD_STATES.DON_ACTIVE).length;}

    /** Function to pay cost of an action
     * @param {Array<number>} spendDonIds
     */
    payCost(spentDonIds) {
        for(let don of spentDonIds) {
            let card = this.getCard(don);
            card.setState(CARD_STATES.DON_RESTED);
            this.scene.children.sendToBack(card);
        }
    }

    /** Function to repay cost of an action
     * @param {Array<number>} spendDonIds
     */
    repayCost(spentDonIds) {
        for(let don of spentDonIds) {
            let card = this.getCard(don);
            card.setState(CARD_STATES.DON_ACTIVE);
            this.scene.children.bringToTop(card);
        }
    }

    /** Function to attac a don to a card
     * @param {number} cardID
     */
    attachDon(cardID) {
        let card = this.getCard(cardID);
        card.setState(CARD_STATES.DON_ATTACHED);
    }
}