class Card {

    /** CONSTRUCTOR 
     * @param {CardData} cardData - Card data object
     * @param {number} amount - Card amount in the deck
    */
    constructor(cardData, amount) {
        this.cardData = cardData;
        this.amount = amount;

        this.deckBuilderEntry = null;
        this.placeholderEntry = null;
    }

    /**
     * CARD DECK ENTRY FUNCTIONS
     * @param {DeckCardEntry} placeholderEntry
     */
    setPlaceholderEntry(placeholderEntry) {this.placeholderEntry = placeholderEntry;}
    /**
     * @param {DeckCardEntry} deckbuilderEntry
     */
    setDeckbuilderEntry(deckbuilderEntry) {this.deckBuilderEntry = deckbuilderEntry;}

    /** FUNCTION TO UPDATE THE ENTRY POSITION IN THE CARD LIST CONTAINER 
     * @param {number} newY - New Y position
     * @param {number} index - New index in the list
    */
    update_entryPosition(newY, index){
        if(this.deckBuilderEntry !== null) {
            this.deckBuilderEntry.updatePosition(newY);
            this.deckBuilderEntry.updateEntryIndex(index);
        }
        if(this.placeholderEntry !== null) {
            this.placeholderEntry.updatePosition(newY);
            this.placeholderEntry.updateEntryIndex(index);
        }
    }

    /** FUNCTION TO SET THE CARD AMOUNT IN THE DECK 
     * @param {number} amount - New amount
    */
    set_amount(amount){
        this.amount = amount;
        if(this.deckBuilderEntry !== null) this.deckBuilderEntry.updateAmount(this.amount);
        if(this.placeholderEntry !== null) this.placeholderEntry.updateAmount(this.amount);
    }

    /** FUNCTION TO DESTROY THE ENTRY */
    destroy_entries() {
        if(this.deckBuilderEntry !== null) this.deckBuilderEntry.destroy();
        if(this.placeholderEntry !== null) this.placeholderEntry.destroy();
    }
}