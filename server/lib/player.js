const ServerInstance = require("./server_instance");

class Player {
    /** CONSTRUCTOR
     * @param {object} socket
     * @param {ServerInstance} server 
     * @param {string} username 
     *  */    
    constructor(socket, server, username) {
        this.id = server.lastPlayerID++;
        this.socket = socket;

        this.server = server;

        this.username = username;
        this.inMatch = false;
        this.waitingForMatch = false;
        this.selectedDeck = 0;
        this.spectating = false;
        this.match = null;
        this.bot = false;

        this.settings = {};
        this.collection = [];
        this.decklist = [];
    }

    /** GETTER */

    /** SETTER */
    setDeckList(decklist) {this.decklist = decklist;};
    setSettings(settings) {this.settings = settings;};

    /** Function that updates the player collection */
    loadCollection (cardList, playerCollection) {
        this.collection =  cardList;

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
        this.server.util.savePlayerCollection(this.username, this.collectionToJSON());
    }

    /** Function that adds a deck to the decklist if possible 
     * @param {Array<number>} deck
    */
    addToDecklist (deck) {
        if(this.decklist.length < 9) {
            this.decklist.push(deck);
            this.server.util.savePlayerDecklist(this.username, this.decklist);
            return true;
        }
        return false;
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

    /** Function that lets the player leave a match */
    leaveMatch() { this.match = null; }
}

module.exports = Player;