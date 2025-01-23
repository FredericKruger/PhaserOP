const ERRORCODES = {
    INCREASED_CARD_AMOUNT : 0,
    ADDED_NEW_CARD: 1,
    DECK_LIMIT_REACHED: 2,
    CARD_LIMIT_REACHED: 3,
    CARD_LEADER_LIMIT_REACHED: 4,
    DECREASED_CARD_AMOUNT: 5,
    REMOVED_CARD: 6,
    FIRST_CARD_TO_BE_LEADER: 7,
    CANNOT_REMOVE_LEADER: 8
};

class Deck {
    constructor(isNewDeck) {
        this.cards = [];
        this.colors = [];
        this.isNewDeck = isNewDeck;

        this.deckSize = 0;
        this.hasLeader = false;
    }

    /** FUNCTION TO ADD A CARD TO THE DECK */
    addCard(card) {
        //First card to be added has to be the leader
        if(this.deckSize === 0) {
            if(card.isleader === 1) {
                this.deckSize++;
                this.cards.push(new Card(
                    card, 1
                ));

                for(let cardColor of card.colors) {
                    if(!this.colors.includes(cardColor)) this.colors.push(cardColor);    
                }

                this.hasLeader = true;
                
                this.sortEntries();
                return ERRORCODES.ADDED_NEW_CARD;
            } else {
                return ERRORCODES.FIRST_CARD_TO_BE_LEADER;
            }
        } else {
            if(this.deckSize < DECK_LIMIT) {
                let i = this.cards.findIndex(e => e.cardInfo.id === card.id);
                //card alread in deck
                if ( i > -1 ) {
                    if(card.isleader === 1 && this.hasLeader) { //only accept 1 leader per deck
                        return ERRORCODES.CARD_LEADER_LIMIT_REACHED;
                    } else {
                        if(this.cards[i].amount<CARD_LIMIT) { //only accept 4 of each card
                            this.cards[i].set_amount(this.cards[i].amount+1)
                            this.deckSize++;
                            return ERRORCODES.INCREASED_CARD_AMOUNT;
                        } else {
                            return ERRORCODES.CARD_LIMIT_REACHED;
                        }
                    }   
                } else {
                    if(card.isleader === 1) { //only accept one leader per deck
                        return ERRORCODES.CARD_LEADER_LIMIT_REACHED; 
                    } else {
                        this.deckSize++;
                        this.cards.push(new Card(
                            card, 1
                        ));

                        this.sortEntries();
                        return ERRORCODES.ADDED_NEW_CARD;
                    }
                }
            } else {
                return ERRORCODES.DECK_LIMIT_REACHED; //return er
            }
        }
    }

    //Removes a card from the deck
    removeCardAt(index) {
        if(this.cards[index].cardInfo.isleader === 1 && this.deckSize>1) { //If trying to remove the leader before the other cards
            return ERRORCODES.CANNOT_REMOVE_LEADER;
        } else {
            this.cards[index].amount--;
            this.deckSize--;
    
            //if 0 left remove entry
            if(this.cards[index].amount <= 0){
                let isleader = this.cards[index].cardInfo.isleader;
                
                //remove entry and object
                this.cards[index].destroy_entries();
                this.cards.splice(index, 1);
    
               //If removing the leader we can remove the colors
               if(isleader === 1) this.colors = [];
                
                return ERRORCODES.REMOVED_CARD;
            } else {
                this.cards[index].set_amount(this.cards[index].amount);
                return ERRORCODES.DECREASED_CARD_AMOUNT;
            }
        }
    }

    /** FUNCTION TO SORT THE CARDS */
    sortEntries() {
        this.cards = this.cards.sort(function (a, b) {
            return b.cardInfo.isleader - a.cardInfo.isleader || a.cardInfo.cost - b.cardInfo.cost || a.cardInfo.name.localeCompare(b.cardInfo.name);
        });
    }

    /** FUNCTION TO GET THE CARD LIST AS A JSON STRING */
    getCardListAsJSON() {
        let cards = [];
        for(let i = 0; i<this.cards.length; i++){
            for(let j = 0; j<this.cards[i].amount; j++){
                cards.push(this.cards[i].cardInfo.id);
            }
        }
        return cards;
    }
}