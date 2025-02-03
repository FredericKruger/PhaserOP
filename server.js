const server = require('express');
const app = server();
// @ts-ignore
const http = require('http').Server(app);
const io = require('socket.io')(http);

//const AI = require('./ai.js');
//const Deck = require('./scripts/server/deck.js');
//const Match = require('./scripts/server/match.js');
//const MatchState = require('./scripts/server/matchstate.js');
const ServerInstance = require('./scripts/server/server_instance.js');
const Player = require('./scripts/server/player.js');
//const Bot = require('./scripts/server/bot.js');

//On start create a new server instance
const serverInstance = new ServerInstance(__dirname);
//Created promise to read the card database
serverInstance.util.getCardList().then((result) => {
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
// @ts-ignore
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
        let playerDecklist = [];
        let newPlayer = false;
        if(connectSuccess) {
            console.log('A user connected: ' + socket.id);
            socket.player = new Player(socket, serverInstance, username); //Create a new player instance
            serverInstance.players.push(socket.player); //Push player in player list
            console.log("New player connected! " + socket.player.id + ", " + socket.player.name);

            playerSetting = await serverInstance.util.getPlayerSettings(username);
            playerCollection = await serverInstance.util.getPlayerCollection(username);
            playerDecklist = await serverInstance.util.getPlayerDecklist(username);

            //create playerseetings
            if(playerSetting === null) {
                console.log("This is a new Player ! Need to create the settings file");
                newPlayer = true;
                playerSetting = {
                    "avatar": "icon1",
                    "firstLogin": true,
                    "berries": 10000
                };
                await serverInstance.util.savePlayerSettings(username, playerSetting);
                await serverInstance.util.savePlayerCollection(username, playerCollection);
                await serverInstance.util.savePlayerDecklist(username, playerDecklist);
            }

            /** Update serverside information */
            socket.player.loadCollection(serverInstance.cardIndex, playerCollection);
            socket.player.setDeckList(playerDecklist);
            socket.player.setSettings(playerSetting);

            // Send message to the client that everything is ready
            socket.emit('player_connected', connectSuccess, playerSetting, serverInstance.cardIndex, playerCollection, newPlayer);

            //Save new settings
            if(newPlayer){
                playerSetting.firstLogin = false;
                await serverInstance.util.savePlayerSettings(username, playerSetting);
            }
        } 
    });

    /** When a player disconnects */
    socket.on('player_disconnect', () => {
        //save all data
        serverInstance.util.savePlayerCollection(socket.player.username, socket.player.collectionToJSON());
        serverInstance.util.savePlayerSettings(socket.player.username, socket.player.settings);
        serverInstance.util.savePlayerDecklist(socket.player.username, socket.player.decklist);

        serverInstance.players = serverInstance.players.filter(player => player.name !== socket.player.name); //Remove the player from the player list
        
        socket.emit('player_disconnected');
    });

    /** When the players request the AI deck lists 
     * Call the sendAIDecklist - Might need to be adjusted with promises
    */
    socket.on('request_ai_decklist', () => { /*sendAIDeckList();*/ });

    /** When the players request their decklists
     * Requires the player's username
     * Call the sendPlayerDecklist - Might need to be adjusted with promises
     */
    socket.on('request_player_decklist', () => { socket.emit('update_player_decklist', JSON.stringify(socket.player.decklist)); });

    /** When a player sends its decklist to be saved on the server 
     * Requires the player's username and decklist as JSON
     * Will write into file. Overwrite default
    */
    socket.on('save_player_decklist', function (decklist) {
        socket.player.decklist = JSON.parse(decklist);
        serverInstance.util.savePlayerDecklist(socket.player.username, socket.player.decklist);
    });

    /** When a player unlocks a new deck */
    socket.on('unlock_deck', async (deckName) => {
        //First Read preconstructed decks
        try {
            const preconstructedDeck = await serverInstance.util.getPreconstructedDecks(deckName);
             
            //Add cards to player collection
            socket.player.addToCollection(preconstructedDeck.cards);
    
            //Add deck to decklist if possible
            let addedToDecklist = socket.player.addToDecklist(preconstructedDeck);
    
            //update client side data
            if(addedToDecklist) socket.emit('update_player_decklist', JSON.stringify(socket.player.decklist));
            socket.emit('update_player_collection', JSON.stringify(socket.player.collectionToJSON()));
            socket.emit('first_login_complete');
        } catch (error) {
            console.error('Error unlocking deck:', error);
        }
    });

    /** update player settings */
    socket.on('update_player_settings', (playerSettings) => {
        socket.player.settings = playerSettings;
        serverInstance.util.savePlayerSettings(socket.player.username, playerSettings);
    });
});

/** Asynchronous function that creates a promise to send the player the ai decklist
 * Emits signals to the player with the ai decklists
 */
/*async function sendAIDeckList () {
    let fs = require('fs');
    let aiDeck = {}; //Creat empty decklist in case of error
    let filepath = __dirname + '/server_assets/ai_decks/decks_ai.json'; //Get file
    
    try {
        const data = await fs.promises.readFile(filepath); //Read the file as a promise
        aiDeck = JSON.parse(data.toString()); //Turn file into JSON object
        io.emit('send_ai_decklist', JSON.stringify(aiDeck)); //Send the player the ai decklist
    } catch (err) { //In case of an error
        //console.log(err);
        io.emit('send_ai_decklist', aiDeck); //Send an empty decklist
    }
}*/

//START LISTENING
http.listen(8081,function(){ //Listens to port 8081
    console.log('Listening on ' + http.address().port);
});
