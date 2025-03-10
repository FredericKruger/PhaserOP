const ServerInstance = require("../server_instance");
const CardCollection = require("./card_collection");
const CardPack = require("./card_packs");

class Player {
    /** CONSTRUCTOR
     * @param {object} socket
     * @param {ServerInstance} server 
     * @param {string} username 
     *  */    
    constructor(socket, server, username) {
        this.id = server.lastPlayerID++;
        this.playerReference = "P" + this.id.toString();
        this.socket = socket;

        this.server = server;

        this.username = username;
        this.inMatch = false;
        this.waitingForMatch = false;
        this.matchFound = false;
        this.selectedDeck = 0;
        this.spectating = false;
        this.match = null;
        this.bot = false;

        this.currentMatchPlayer = null;
        this.currentOpponentPlayer = null;

        this.settings = {};
        this.collection = new CardCollection(this);
        this.decklist = [];
    }

    /** GETTER */

    /** SETTER */
    setDeckList(decklist) {this.decklist = decklist;};
    setSettings(settings) {this.settings = settings;};

    /** Function that adds a deck to the decklist if possible 
     * @param {Array<number>} deck
    */
    addToDecklist (deck) {
        if(this.decklist.length < 9 && !this.decklist.find(d => d.name === deck.name)) {
            this.decklist.push(deck);
            this.server.util.savePlayerDecklist(this.username, this.decklist);
            return true;
        }
        return false;
    }

    /** Function that lets the player leave a match */
    leaveMatch() { this.match = null; }

    /** Function that opens a pack */
    openPack(set) { 
        //Check if a pack can be opened
        let pack = this.settings.packs.find(pack => pack.set === set);
        if(pack.amount>0) {
            pack.amount--;

            //get cards
            let cardList = new CardPack().getCardsFromPack(this.server, set);
            
            //update collection with new cards
            this.socket.player.collection.addToCollection(cardList);

            //update values in client
            this.socket.emit('update_player_settings', this.settings);
            this.socket.emit('pack_opened', cardList);
            this.socket.emit('update_player_collection', JSON.stringify(this.collection.collectionToJSON()));

            //save player settings
            this.server.util.savePlayerSettings(this.username, this.settings);
            this.server.util.savePlayerCollection(this.username, this.collection.collectionToJSON());
        } else {
            this.socket.emit('pack_open_failed', 'No packs available');
        }    
    }

    /** Function that buys an item */
    async buyItem(item, itemType) {
        //Get Player money
        let availableBerries = this.settings.berries;
        //get item price
        let itemPrice = item.price;

        //Resolve purchase
        if(availableBerries >= itemPrice) {
            //Update player settings
            this.settings.berries -= itemPrice;

            if(itemType === 'PACKS') { //If it's a pack
                //Increase Pack Amount
                let pack = this.settings.packs.find(pack => pack.set === item.name);
                pack.amount++;

                //Save settings
                this.server.util.savePlayerSettings(this.username, this.settings);

                this.socket.emit('update_player_settings', this.settings); //Update settings
                this.socket.emit('shop_purchase_successful', item, itemType, []); //Send message to client
            } else if(itemType === 'DECKS') {
                //Get the card list of the selected set
                const preconstructedDeck = await this.server.util.getPreconstructedDecks(item.name);
                let cardList = preconstructedDeck.cards;
             
                //Add cards to player collection
                this.collection.addToCollection(cardList);

                //Save player information
                this.server.util.savePlayerSettings(this.username, this.settings);
                            
                //Add deck to decklist if possible
                let addedToDecklist = this.addToDecklist(preconstructedDeck);
                
                //Send new data to clients
                this.socket.emit('update_player_collection', JSON.stringify(this.collection.collectionToJSON()));
                this.socket.emit('update_player_settings', this.settings); //Update settings
                if(addedToDecklist) this.socket.emit('update_player_decklist', JSON.stringify(this.decklist));
                this.socket.emit('shop_purchase_successful', item, itemType, cardList); //Send message to client
            }
        } else {
            //Send message to the client
            this.socket.emit('shop_purchase_failed', 'Not enough berries');
        }
    }
}

module.exports = Player;