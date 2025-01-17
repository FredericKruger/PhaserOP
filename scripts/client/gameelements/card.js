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

    /** FUNCTION TO SET THE CARD AMOUNT IN THE DECK */
    set_amount(amount){
        this.amount = amount;
        if(this.deckBuilderEntry !== null) this.deckBuilderEntry.updateAmount(this.amount);
        if(this.placeholderEntry !== null) this.placeholderEntry.updateAmount(this.amount);
    }
}