const { MatchCard } = require("./match_card");

class MatchDeck {

    /** Constructor */
    constructor() {
        this.leader = null;
        this.cards = [];
    }

    /** Construct Deck from JSO */
    fromJSON(json, cardIndex, startID, match, player) {
        for(let i of json.cards){
            let c = new MatchCard(i, startID, cardIndex[i-1], match.id, player);
            if(cardIndex[i-1].card === 'LEADER') {
                this.leader = c;
            } else {
                this.add(c);
            }
            match.matchCardRegistry.register(c);
            startID++;
        }
        return startID;
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

    /** Return the size the deck
     * @return {number} - size of the deck
     */
    getSize() {
        return this.cards.length;
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