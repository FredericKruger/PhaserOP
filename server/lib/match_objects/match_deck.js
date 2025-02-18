const { MatchCard } = require("./match_card");

class MatchDeck {

    /** Constructor */
    constructor() {
        this.leader = null;
        this.cards = [];
    }

    /** Construct Deck from JSO */
    fromJSON(json, cardIndex) {
        let counter = 0;
        for(let i of json.cards){
            let c = new MatchCard(i, counter, cardIndex[i-1]);
            if(cardIndex[i-1].card === 'LEADER') {
                this.leader = c;
            } else {
                this.add(c);
            }
            counter++;
        }
    }

    /** Add Card to the list
     * @param {MatchCard} card - Card object
     */
    add(card) {
        this.cards.push(card);
    }

    //Removes the card at the top of the deck and returns it
    draw() {
        return this.cards.pop();
    }

    /** Function to shuffle the deck */
    shuffle() {
        let len = this.cards.length;
        for(let i = len - 1; i > 1; i--) {
            let j = this.getRandomInt(0, i+1);
            let c = this.cards[j]; //Move reference into c
            this.cards[j] = this.cards[i]; //J references I
            this.cards[i] = c; //I references c
        }
    }

    /** Function that returns 
     * @param {number} min - minimum value
     * @param {number} max - maximum value
    */
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    }

}

module.exports = MatchDeck;