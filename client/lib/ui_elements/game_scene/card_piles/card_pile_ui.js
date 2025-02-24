class CardPileUI extends BaseComponentUI{

    constructor(scene, playerScene) {
        super(scene, playerScene);

        //Pile of Cards
        this.cards = [];
    }

    /** Function to get a card from the ID
     * @param {number} cardID
     */
    getCard(cardID) {
        return this.cards.find(card => card.id === cardID);
    }
}