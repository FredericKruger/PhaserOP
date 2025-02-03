class Card {

    /** CONSTRUCTOR */
    constructor(cardInfo, amount) {
        this.cardInfo = cardInfo;
        this.amount = amount;

        this.deckBuilderEntry = null;
        this.placeholderEntry = null;
    }

    /** CARD DECK ENTRY FUNCTIONS */
    setPlaceholderEntry(placeholderEntry) {this.placeholderEntry = placeholderEntry;}
    setDeckbuilderEntry(deckbuilderEntry) {this.deckBuilderEntry = deckbuilderEntry;}

    /** FUNCTION TO UPDATE THE ENTRY POSITION IN THE CARD LIST CONTAINER */
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

    /** FUNCTION TO SET THE CARD AMOUNT IN THE DECK */
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