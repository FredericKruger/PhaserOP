const fs = require('fs');
const ServerInstance = require('../server_instance');

class Utils {

    /** Constructor
     * @param {ServerInstance} server - server object
     * @param {string} serverPath - path to the server
     */
    constructor(server, serverPath) {
        this.server = server;
        this.serverPath = serverPath;
    }

    /** Function to create default player settings when a new player connects */
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
        let cardIndex = [];
        let filepath = this.serverPath + '/server/assets/data/opcards.json'; //Get path of the card database
        let cardFolderPath = this.serverPath + '/server/assets/data/card_data/'; //Get path of the card folder

        try {
            const data = await fs.promises.readFile(filepath); //Read the json file
            cardIndex = JSON.parse(data.toString()); //Turn file into JSON object

            const files = await fs.promises.readdir(cardFolderPath); //Read the folder
            for (const file of files) { //For each file in the folder
                const data = await fs.promises.readFile(cardFolderPath + file); //Read the file
                const jsonData = JSON.parse(data.toString()); //Turn file into JSON object
                cardIndex[jsonData.id-1] = jsonData; //Push the json data to the arrays
            }
        } catch (err) {
            console.log(err);
        }
        return cardIndex; //Return nothing in case of error
    }

    /** Asynchronous function that reads the different cards from the card folder */
    /*async getCardListFromFolder () {
        let cardIndex = [];
        let folderPath = this.serverPath + '/server/assets/data/card_data/'; //Get path of the card folder

        try {
            const files = await fs.promises.readdir(folderPath); //Read the folder
            for (const file of files) { //For each file in the folder
                const data = await fs.promises.readFile(folderPath + file); //Read the file
                const jsonData = JSON.parse(data.toString()); //Turn file into JSON object
                cardIndex.push(jsonData); //Push the json data to the array
            }
        } catch (err) {console.log(err);}

        return cardIndex;
    }*/
   /** Asynchronous function that reads the different cards from the card folder and subfolders */
    async getCardListFromFolder () {
        let cardIndex = [];
        let folderPath = this.serverPath + '/server/assets/data/card_data/'; //Get path of the card folder

        // Recursive function to read cards from current path
        const readCardsRecursively = async (currentPath) => {
            try {
                const items = await fs.promises.readdir(currentPath, { withFileTypes: true }); //Read the folder with file type info
                
                for (const item of items) { //For each item in the folder
                    const itemPath = currentPath + item.name;
                    
                    if (item.isDirectory()) {
                        // If it's a directory (subfolder), recursively read it
                        await readCardsRecursively(itemPath + '/');
                    } else if (item.isFile() && item.name.endsWith('.json')) {
                        // If it's a JSON file, read and parse it
                        try {
                            const data = await fs.promises.readFile(itemPath); //Read the file
                            const jsonData = JSON.parse(data.toString()); //Turn file into JSON object
                            
                            // Optionally add the set folder name to the card data for reference
                            const pathParts = itemPath.split('/');
                            const setFolder = pathParts[pathParts.length - 2]; // Get parent folder name
                            if (setFolder !== 'card_data') { // Only add if it's not the root card_data folder
                                jsonData.setFolder = setFolder;
                            }
                            
                            cardIndex.push(jsonData); //Push the json data to the array
                        } catch (parseErr) {
                            console.log(`Error parsing file ${itemPath}:`, parseErr);
                        }
                    }
                }
            } catch (err) {
                console.log(`Error reading directory ${currentPath}:`, err);
            }
        };

        try {
            await readCardsRecursively(folderPath);
        } catch (err) {
            console.log(err);
        }

        return cardIndex;
    }

    /** Asynchronous function that creates a promise to send the player the request bot deck
     */
    async getRandomAIDeck () {
        let aiDeck = {}; //Create emoty object
        let filepath = this.serverPath + '/server/assets/data/preconstructeddecks.json'; //Get file path

        try {
            const data = await fs.promises.readFile(filepath); //Read the file
            aiDeck = JSON.parse(data.toString()); //Turn file into JSON object
            let randomDeck = Math.floor(Math.random() * aiDeck.length); //Get a random deck
            randomDeck = 1; //FIXME Forcing to test
            return aiDeck[randomDeck]; //Return the selected deck from the list
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

    /** Get a Preconstructed Deck 
     * @param {string} ai - name of the deck
    */
    async getAIStrategy (ai) {
        let defaultStrategy = {
            actionPriorities: [
                { action: "playCard", type: "CHARACTER", condition: "hasDon" },
                { action: "playCard", type: "STAGE", condition: "hasDon" },
                { action: "attachDon", condition: "hasCharacters" },
                { action: "attack", condition: "hasActiveCharacters" },
                { action: "endTurn" }
            ]
        };

        let filepath = this.serverPath + '/server/assets/ai_behaviours/' + ai + '.json';

        try {
            const data = await fs.promises.readFile(filepath);
            defaultStrategy = JSON.parse(data.toString());
            console.log("AI strategy loaded successfully");
            return defaultStrategy;
        } catch (err) {
            console.error("Error loading AI strategy:", err);
        }
        console.log("AI strategy file not found, using default strategy");
        return defaultStrategy;
    }
}

module.exports = Utils;