const ERRORCODES = {
    INCREASED_CARD_AMOUNT : 0,
    ADDED_NEW_CARD: 1,
    DECK_LIMIT_REACHED: 2,
    CARD_LIMIT_REACHED: 3,
    CARD_LEADER_LIMIT_REACHED: 4,
    DECREASED_CARD_AMOUNT: 5,
    REMOVED_CARD: 6,
    FIRST_CARD_TO_BE_LEADER: 7
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

    /** FUNCTION TO SORT THE CARDS */
    sortEntries() {
        this.cards = this.cards.sort(function (a, b) {
            return b.isleader - a.isleader || a.cost - b.cost || a.name - b.name;
        });
    }
}