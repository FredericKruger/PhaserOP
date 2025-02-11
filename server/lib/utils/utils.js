const fs = require('fs');

class Utils {

    constructor(server, serverPath) {
        this.server = server;
        this.serverPath = serverPath;
    }

    createDefaultSettings() {
        let defaultSettings = {
            "avatar": "icon1",
            "firstLogin": true,
            "berries": 20000,
            "packs": [
                {
                    "set":"OP01",
                    "amount":0
                },
                {
                    "set":"OP02",
                    "amount":0
                },
                {
                    "set":"OP03",
                    "amount":0
                }
            ]
        };
        return defaultSettings;
    }

    /**
     * READ AND WRITE FUNCTIONS
     */

    /** Asynchronous function that creates a promise to send the card database
     */
    async getCardList () {
        let cardIndex = {};
        let filepath = this.serverPath + '/server/assets/data/opcards.json'; //Get path of the card database

        try {
            const data = await fs.promises.readFile(filepath); //Read the json file
            cardIndex = JSON.parse(data.toString()); //Turn file into JSON object
            return cardIndex; //Return the database
        } catch (err) {
            console.log(err);
        }
        return null; //Return nothing in case of error
    }

    /** Asynchronous function that creates a promise to send the player the request bot deck
     * @param {number} selectedDeck - id of the selected bot deck
     */
    async getBotDeck (selectedDeck) {
        let aiDeck = {}; //Create emoty object
        let filepath = this.serverPath + '/server/assets/data/decks_ai.json'; //Get file npath

        try {
            const data = await fs.promises.readFile(filepath); //Read the file
            aiDeck = JSON.parse(data.toString()); //Turn file into JSON object
            return aiDeck[selectedDeck]; //Return the selected deck from the list
        } catch(err) {
            console.log(err);
        }  
        return null; //If there is an error, return nothing
    }

    /** Asynchonous function that creates a promise to send the payer the request deck
     * @param {string} username - player username
     */
    async getPlayerDecklist (username) {
        let deck = [];
        let playerDeckName = 'decks_' + username + '.json'; //Get file name
        let filepath = this.serverPath + '/server/assets/player_folders/' + username + '/' + playerDeckName; //Get file path

        try {
            const data = await fs.promises.readFile(filepath); //Read the file as a promise
            deck = JSON.parse(data.toString()); //Turn file into JSON object 
            return deck; //Return the selected deck from the list
        } catch(err) {
            //console.log(err);
        }
        return deck; //If there is an error, return nothing
    }

    /** Asynchronous function that creates a promise to send the user collection
     * @param {string} username 
     */
    async getPlayerCollection (username) {
        let collection = [];
        let playerCollectionName = 'collection_' + username + '.json'; //Get file name
        let filepath = this.serverPath + '/server/assets/player_folders/' + username + '/' + playerCollectionName; //get file path

        try {
            const data = await fs.promises.readFile(filepath);
            collection = JSON.parse(data.toString());
            return collection;
        } catch(err) {

        }
        return [];
    }

    /** Asynchronous function that created a promise to send the user settings
     * @param {string} username - player username
     */
    async getPlayerSettings (username) {
        let settings = null;
        let playerSettingsName = 'settings_' + username + '.json'; //Get file name
        let filepath = this.serverPath + '/server/assets/player_folders/' + username + '/' + playerSettingsName; //Get file path

        try {
            const data = await fs.promises.readFile(filepath);
            settings = JSON.parse(data.toString());
            return settings;
        } catch(err) {
        }
        return null; //If there is an error return nothing
    }

    /** Get a Preconstructed Deck 
     * @param {string} deckname - name of the deck
    */
    async getPreconstructedDecks (deckname) {
        let deck = [];
        let filepath = this.serverPath + '/server/assets/data/preconstructeddecks.json';

        try {
            const data = await fs.promises.readFile(filepath);
            deck = JSON.parse(data.toString());
            deck = deck.filter(item => item.name === deckname);
            return deck[0];
        } catch (err) {
            console.error(err);
        }
        return deck;
    }

    /** Get Shop Data */
    async getShopData () {
        let shopData = [];
        let filepath = this.serverPath + '/server/assets/data/shop_data.json'; //Get path of the shop data

        try {
            const data = await fs.promises.readFile(filepath); //Read the json file
            shopData = JSON.parse(data.toString()); //Turn file into JSON object
            return shopData; //Return the database
        } catch (err) {
            console.log(err);
        }
        return null; //Return nothing in case of error 
    }

    /** Asynchronous function that creates a promise to save the user collection
     * 
     */
    async savePlayerCollection (username, collection) {
        let playerCollectionName = 'collection_' + username + '.json'; //Get file name
        let filepath = this.serverPath + '/server/assets/player_folders/' + username + '/' + playerCollectionName; //Get file path
        try {
            await fs.writeFileSync(filepath, JSON.stringify(collection)); //Write to new file
        } catch (err) {
            console.log(err);
        }
    }

    /** Function to save decklists */
    async savePlayerDecklist (username, decklist) {
        let playerDeckName = 'decks_' + username + '.json'; //Create the filename
        let filename = this.serverPath + '/server/assets/player_folders/' + username + '/' + playerDeckName; //Get folder to be save
        try {
            await fs.writeFileSync(filename, JSON.stringify(decklist)); //Write to new file
        } catch (err) {
            console.log(err);
        }
    }
    
    /** Asynchronous function that creates a promise to save the user settings
     * @param {string} username - player username
     * @param {object} settings - player settings
     */
    async savePlayerSettings (username, settings) {
        let playerSettingsName = 'settings_' + username + '.json'; //Get file name
        let filepath = this.serverPath + '/server/assets/player_folders/' + username + '/' + playerSettingsName; //Get file path
        try {
            await fs.writeFileSync(filepath, JSON.stringify(settings)); //Write to new file
        } catch (err) {
            console.log(err);
        }
    }

    /** Asynchrnous function that creates the player folder to store player information
     * @param {string} username - player username
     */
    async createPlayerFolder(username) {
        if(!fs.existsSync(this.serverPath + '/server/assets/player_folders/' + username)) {
            fs.mkdirSync(this.serverPath + '/server/assets/player_folders/' + username);
        }
    }
}

module.exports = Utils;