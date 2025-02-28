class CardPileUI extends BaseComponentUI{

    constructor(scene, playerScene) {
        super(scene, playerScene);

        //Pile of Cards
        this.cards = [];
    }

    update() {}

    /** Function to get a card from the ID
     * @param {number} cardID
     */
    getCard(cardID) {
        return this.cards.find(card => card.id === cardID);
    }

    /** Function that removes a card from the hand
     * @param {GameCardUI} card
     * @returns {boolean} - True if the card was removed, false otherwise
     */
    removeCard(card) {
        let index = this.cards.indexOf(card);
        if(index > -1) {
            this.cards.splice(index, 1);
        }
        this.update();

        return index>-1;
    }
}