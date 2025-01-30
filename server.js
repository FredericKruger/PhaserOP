const server = require('express');
const app = server();
const http = require('http').Server(app);
const io = require('socket.io')(http);

//const AI = require('./ai.js');
//const Deck = require('./scripts/server/deck.js');
//const Match = require('./scripts/server/match.js');
//const MatchState = require('./scripts/server/matchstate.js');
const Player = require('./scripts/server/player.js');
//const Bot = require('./scripts/server/bot.js');

/** Object to store Server information */
class ServerInstance {
    constructor(){
        this.players = []; //List of currently connected players
        this.matches = []; //List of currently started matches
        this.bots = []; //List of currently active bots
        
        this.lastPlayerID = 0; //keep track of the last assigned id to a new player
        this.lastMatchID = 0; //Keep track of the last assigned matchid
        this.lastBotID = 0; //Keep track of the last assigned bot id
        this.ai = null;
        this.usedMatchIDS = []; //Keep track of the matchIDS currents in use

        this.cardIndex = {}; //Store the card database
    }

    /** Function that returns a random integer between min and max
     * @param {number} max - max boundary for random integer
     * @param {number} min - min boudary for random integer  
     * @returns {number} random number generated
     */
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    }

    /** Returns true if the given matchID is already in use, false otherwise
     * @param {number} id - Match ID
     * @returns {boolean} 
     */
    isMatchIDUsed(id) {
        for(let i of this.usedMatchIDS) {
            if(id === i) return true;
        }
        return false;
    }

    /** Returns true ifthe username is already in use, fales otherwise
     * @param {string} username - Username
     * @returns {boolean}
     */
    isUsernameUsed(username) {
        for(let p of this.players) {
            if(p.name === username) return true;
        }
        return false;
    }

    /** Release the match id for when the match is over
     * @param {number} id - match id
     * @returns {boolean} True if the match ID was removed, false otherwise 
     */
    releaseMatchID(id) {
        for(let i = (this.usedMatchIDS.length-1); i>=0; i--) {
            if(this.usedMatchIDS[i] === id){
                this.usedMatchIDS.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    /** Function that determines the owner of a card */
    getOwnerOfCard(socket, playerOwned) {
        //First determine the player
        let player = 'a';
        if(socket.player === socket.match.b) player = 'b';

        let p = socket.match.state.a;
        if(player === 'b') p = socket.match.state.b;

        if(!playerOwned) {
            if(player === 'a') p = socket.match.state.b;
            else p = socket.match.state.a;
        }

        return p;
    }

    getPlayerOpponentSocket(socket) {
        if(socket.match.a.socket === socket) return socket.match.b.socket;
        else return socket.match.a.socket;
    }

    /** Function to get a list of all players currentlzy waiting to be connected to a match */
    getAllWaitingPlayers() {
        let players = [];
        Object.keys(io.sockets.connected).forEach(function(socketID) {
            let player = io.sockets.connected[socketID].player;
            if(player) {
                if(player.waitingForMatch) players.push(player);
            }
        })
        return players;
    }
}

//On start create a new server instance
var serverInstance = new ServerInstance();
//Created promise to read the card database
getCardList().then((result) => {
    serverInstance.cardIndex = result;
});
serverInstance.io = io; //to allow communication inside the objects


//Setup static directories
app.use('/plugins', server.static(__dirname + '/plugins'));
app.use('/css', server.static(__dirname + '/css'));
app.use('/scripts', server.static(__dirname + '/scripts'));
app.use('/assets', server.static(__dirname + '/assets'));
app.use('/server_assets', server.static(__dirname + '/server_assets'));

//Set root domain as index.html
app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});

/** On connection of a player, start socket listenere */
io.on('connection', function (socket) {
    socket.player = null;
    
    /* When a player disconnects from the game */
    socket.on('disconnect', function () {
        if(socket.player !== null) {
            console.log("Player " + socket.player.id + " disconnected");
            if(socket.match !== undefined) socket.match.disconnect(socket); //If the player was in a game, disconnect from the game
            serverInstance.players = serverInstance.players.filter(player => player.id !== socket.player.id); //Remove the player from the player list
        }
    });


    /** When a player connects */
    socket.on('player_connect', async (username) => {
        let connectSuccess = !serverInstance.isUsernameUsed(username);
        let playerSetting = null;
        let playerCollection = [];
        let newPlayer = true;
        if(connectSuccess) {
            console.log('A user connected: ' + socket.id);
            socket.player = new Player(socket, serverInstance, username); //Create a new player instance
            serverInstance.players.push(socket.player); //Push player in player list
            console.log("New player connected! " + socket.player.id + ", " + socket.player.name);

            playerSetting = await getPlayerSettings(username);
            playerCollection = await getPlayerCollection(username);
            //create playerseetings
            if(playerSetting === null) {
                console.log("This is a new Player ! Need to create the settings file");
                newPlayer = true;
                let defaultSettings = {
                    "avatar": "default_avatar",
                    "firstLogin": true
                };
                defaultSettings = JSON.stringify(defaultSettings);
                await savePlayerSettings(username, defaultSettings);
                await savePlayerCollection(username, JSON.stringify(playerCollection));
                playerSetting = await getPlayerSettings(username);
                playerCollection = await getPlayerCollection(username);
            }

            socket.emit('player_connected', connectSuccess, playerSetting, serverInstance.cardIndex, playerCollection, newPlayer);

            //Save new settings
            if(newPlayer){
                //playerSetting.firstLogin = false;
                //await savePlayerSettings(username, playerSetting);
            }
        } 
    });

    /** When a player disconnects */
    socket.on('player_disconnect', () => {
        serverInstance.players = serverInstance.players.filter(player => player.name !== socket.player.name); //Remove the player from the player list
        socket.emit('player_disconnected');
    });

    /** When the players request the AI deck lists 
     * Call the sendAIDecklist - Might need to be adjusted with promises
    */
    socket.on('request_ai_decklist', () => { sendAIDeckList(); });

    /** When the players request their decklists
     * Requires the player's username
     * Call the sendPlayerDecklist - Might need to be adjusted with promises
     */
    socket.on('request_player_decklist', (username) => { sendPlayerDeckList(username); });

    /** When a player sends its decklist to be saved on the server 
     * Requires the player's username and decklist as JSON
     * Will write into file. Overwrite default
    */
    socket.on('save_player_decklist', function (username, decklist) {
        let fs = require('fs');
        let playerDeckName = 'decks_' + username + '.json'; //Create the filename
        let filename = __dirname + '/server_assets/player_decks/'+playerDeckName; //Get folder to be save
        fs.writeFileSync(filename, decklist); //Write to new file
    });

    /** update player settings */
    socket.on('update_player_settings', (playerSettings) => {
        let username = socket.player.name;
        let settings = JSON.stringify(playerSettings);
        savePlayerSettings(username, settings);
    });
});

/** Asynchronous function that creates a promise to send the player decklist
 * @param {string} username - user name of the player needed for file name
 * Emits signals to the player with the decklist
 */
async function sendPlayerDeckList(username) {
    let fs = require('fs');
    let playerDeck = []; //Create empty decklist in case of error
    let playerDeckName = 'decks_' + username + '.json'; //Create file name
    let filepath = __dirname + '/server_assets/player_decks/' + playerDeckName; //Get path to file

    try {
        const data = await fs.promises.readFile(filepath); //Read the file as a promise
        playerDeck = JSON.parse(data); //Turn file into JSON object
        io.emit('send_player_decklist', JSON.stringify(playerDeck)); //Send the player his decklist
    } catch (err) { //In case of error
        //console.log(err);
        io.emit('send_player_decklist', JSON.stringify(playerDeck)); //Send an empty decklist
    }
}

/** Asynchronous function that creates a promise to send the player the ai decklist
 * Emits signals to the player with the ai decklists
 */
async function sendAIDeckList () {
    let fs = require('fs');
    let aiDeck = {}; //Creat empty decklist in case of error
    let filepath = __dirname + '/server_assets/ai_decks/decks_ai.json'; //Get file
    
    try {
        const data = await fs.promises.readFile(filepath); //Read the file as a promise
        aiDeck = JSON.parse(data); //Turn file into JSON object
        io.emit('send_ai_decklist', JSON.stringify(aiDeck)); //Send the player the ai decklist
    } catch (err) { //In case of an error
        //console.log(err);
        io.emit('send_ai_decklist', aiDeck); //Send an empty decklist
    }
}

/** Asynchonous function that creates a promise to send the payer the request deck
 * @param {number} selectedDeck - id of the selected deck
 * @param {string} username - player username
 * @returns {object} Return the deck object with the card list and name
 */
async function getSelectedPlayerDeck (username, selectedDeck) {
    let fs = require('fs');
    let deck = [];
    let playerDeckName = 'decks_' + username + '.json'; //Get file name
    let filepath = __dirname + '/server_assets/player_decks/' + playerDeckName; //Get file path

    try {
        const data = await fs.promises.readFile(filepath); //Read the file as a promise
        deck = JSON.parse(data); //Turn file into JSON object 
        return deck[selectedDeck]; //Return the selected deck from the list
    } catch(err) {
        console.log(err);
    }
    return null; //If there is an error, return nothing
}

/** Asynchronous function that created a promise to send the user settings
 * @param {string} username - player username
 * @returns {object} Return the user setting object
 */
async function getPlayerSettings (username) {
    let fs = require('fs');
    let settings = null;
    let playerSettingsName = 'settings_' + username + '.json'; //Get file name
    let filepath = __dirname + '/server_assets/player_settings/' + playerSettingsName; //Get file path

    try {
        const data = await fs.promises.readFile(filepath);
        settings = JSON.parse(data);
        return settings;
    } catch(err) {
        //console.log(err);
    }
    return null; //If there is an error return nothing
}

/** Asynchronous function that creates a promise to send the user collection
 * 
 */
async function getPlayerCollection (username) {
    let fs = require('fs');
    let collection = [];
    let playerCollectionName = 'collection_' + username + '.json'; //Get file name
    let filepath = __dirname + '/server_assets/player_collections/' + playerCollectionName; //get file path

    try {
        const data = await fs.promises.readFile(filepath);
        collection = JSON.parse(data);
        return collection;
    } catch(err) {

    }
    return [];
}

/** Asynchronous function that creates a promise to save the user settings
 * @param {string} username - player username
 * @param {object} settings - player settings
 */
async function savePlayerSettings (username, settings) {
    let fs = require('fs');
    let playerSettingsName = 'settings_' + username + '.json'; //Get file name
    let filepath = __dirname + '/server_assets/player_settings/' + playerSettingsName; //Get file path
    try {
        await fs.writeFileSync(filepath, settings); //Write to new file
    } catch (err) {
        console.log(err);
    }
}

/** Asynchronous function that creates a promise to save the user collection
 * 
 */
async function savePlayerCollection (username, collection) {
    let fs = require('fs');
    let playerCollectionName = 'collection_' + username + '.json'; //Get file name
    let filepath = __dirname + '/server_assets/player_collections/' + playerCollectionName; //Get file path
    try {
        await fs.writeFileSync(filepath, collection); //Write to new file
    } catch (err) {
        console.log(err);
    }
}

/** Asynchronous function that creates a promise to send the player the request bot deck
 * @param {number} selectedDeck - id of the selected bot deck
 * @returns {object} Return the deck object with card list and name
 */
async function getSelectedBotDeck (selectedDeck) {
    let fs = require('fs');
    let aiDeck = {}; //Create emoty object
    let filepath = __dirname + '/server_assets/ai_decks/decks_ai.json'; //Get file npath

    try {
        const data = await fs.promises.readFile(filepath); //Read the file
        aiDeck = JSON.parse(data); //Turn file into JSON object
        return aiDeck[selectedDeck]; //Return the selected deck from the list
    } catch(err) {
        console.log(err);
    }  
    return null; //If there is an error, return nothing
}

/** Asynchronous function that creates a promise to send the card database
 * @return {object} Returns the card database
 */
async function getCardList () {
    let fs = require('fs');
    let cardIndex = {};
    let filepath = __dirname + '/assets/data/opcards.json'; //Get path of the card database

    try {
        const data = await fs.promises.readFile(filepath); //Read the json file
        cardIndex = JSON.parse(data); //Turn file into JSON object
        return cardIndex; //Return the database
    } catch (err) {
        console.log(err);
    }
    return null; //Return nothing in case of error
}

//START LISTENING
http.listen(8081,function(){ //Listens to port 8081
    console.log('Listening on ' + http.address().port);
});
