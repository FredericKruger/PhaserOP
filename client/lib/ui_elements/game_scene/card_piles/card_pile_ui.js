class CardPileUI extends BaseComponentUI{

    constructor(scene, playerScene) {
        super(scene, playerScene);

        //Pile of Cards
        this.cards = [];
    }

    update() {}

    /** Function to get a card from the ID
     * @param {number} cardID
     * @returns {GameCardUI} - The card with the ID
     */
    getCard(cardID) {
        return this.cards.find(card => card.id === cardID);
    }

    /** Function to test if a card is is the card pile
     * @param {GameCardUI} card
     * @returns {boolean} - True if the card is in the pile, false otherwise
     */
    includes(card) {
        for(let i = 0; i < this.cards.length; i++) {
            if(this.cards[i].id === card.id) {
                return true;
            }
        }
        return false;
    }

    /** Function that removes a card from the hand
     * @param {GameCardUI} card
     * @returns {boolean} - True if the card was removed, false otherwise
     */
    removeCard(card) {
        const index = this.cards.indexOf(card);
        if(index > -1) {
            this.cards.splice(index, 1);

            this.update();
        }

        return (index>-1);
    }
}