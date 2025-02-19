class CardLifePileUI extends CardPileUI {

    /** Constructor
     * @param {GameScene} scene
     * @param {PlayerScene} playerscene
     */
    constructor(scene, playerscene) {
        super(scene, playerscene);
    }

    /** Function to add a card to the pile
     * @param {GameCardUI} card
     */
    addCard(card) {
        this.cards.push(card);
    }
}