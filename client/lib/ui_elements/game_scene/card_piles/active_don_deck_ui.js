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
    addCard(card) {this.cards.push(card)};

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
        }
    }

    /** Function to attac a don to a card
     * @param {number} cardID
     */
    attachDon(cardID) {
        let card = this.getCard(cardID);
        card.setState(CARD_STATES.DON_ATTACHED);
    }

    /** Function to make all the cards draggable 
     * @param {boolean} draggable
    */
    makeCardDraggable(draggable) {
        this.cards.forEach(card => {
            card.makeDraggable(draggable);
        });
    }

        /** Function to make all the cards Interactive 
     * @param {boolean} interactive
    */
    makeInteractive(interactive) {
        this.cards.forEach(card => {
            card.makeInteractive(interactive);
        });
    }

}