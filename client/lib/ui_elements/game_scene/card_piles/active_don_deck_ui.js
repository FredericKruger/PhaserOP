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

    /** Function to make all the cards draggable 
     * @param {boolean} draggable
    */
    makeCardDraggable(draggable) {
        this.cards.forEach(card => {
            card.makeDraggable(draggable);
        });
    }

}