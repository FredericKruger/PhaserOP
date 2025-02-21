const Player = require("./player");

class CardCollection {

    /** Constructor
     * @param {Player} player - The player object
     */
    constructor(player) {
        this.collection = [];

        /** @type {Player} */
        this.player = player;
    }

    /** Function that updates the player collection */
    loadCollection (cardList, playerCollection) {
        this.collection = cardList;

        //set the amounts
        for(let card of this.collection) {card.amount = 0;}
        //Set collection amounts
        for(let card of playerCollection) {
            let index = card[0]-1;
            let amount = card[1];
            this.collection[index].amount = amount;
        }
    }

    /** Function that adds cards to the player collection 
     * @param {Array<number>} cardList
    */
    addToCollection (cardList) {
        for(let card of cardList) {
            this.collection[card-1].amount++;
        }
        this.player.server.util.savePlayerCollection(this.player.username, this.collectionToJSON());
    }

    /** Function that transforms the collection to JSON */
    collectionToJSON(){
        let playerCollection = [];
        for(let card of this.collection) {
            if(card.amount > 0) {
                let c = [];
                c[0] = card.id;
                c[1] = card.amount;
                playerCollection.push(c);
            }
        }
        return playerCollection;
    }

}

module.exports = CardCollection;