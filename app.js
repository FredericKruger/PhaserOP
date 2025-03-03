const server = require('express');
const app = server();
// @ts-ignore
const http = require('http').Server(app);
const io = require('socket.io')(http);

const ServerInstance = require('./server/lib/server_instance.js');
const Player = require('./server/lib/game_objects/player.js');

//On start create a new server instance
const serverInstance = new ServerInstance(__dirname);
//Created promise to read the card database
serverInstance.util.getCardList().then((result) => {
    serverInstance.cardIndex = result;
});
serverInstance.io = io; //to allow communication inside the objects


//Setup static directories
app.use('/plugins', server.static(__dirname + '/client/plugins'));
app.use('/scripts', server.static(__dirname + '/client/lib'));
app.use('/assets', server.static(__dirname + '/client/assets'));
//app.use('/server_assets', server.static(__dirname + '/server_assets'));

//Set root domain as index.html
app.get('/',function(req,res){
    res.sendFile(__dirname+'/client/index.html');
});

/** On connection of a player, start socket listenere */
// @ts-ignore
io.on('connection', function (/** @type {object} */ socket) {
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
    socket.on('player_connect', async (/** @type {string} */ username) => {
        let connectSuccess = !serverInstance.isUsernameUsed(username);
        let playerSetting = null;
        let playerCollection = [];
        let playerDecklist = [];
        let newPlayer = false;
        let shopData = [];
        if(connectSuccess) {
            console.log('A user connected: ' + socket.id);
            socket.player = new Player(socket, serverInstance, username); //Create a new player instance
            serverInstance.players.push(socket.player); //Push player in player list
            console.log("New player connected! " + socket.player.id + ", " + socket.player.name);

            playerSetting = await serverInstance.util.getPlayerSettings(username);
            playerCollection = await serverInstance.util.getPlayerCollection(username);
            playerDecklist = await serverInstance.util.getPlayerDecklist(username);
            shopData = await serverInstance.util.getShopData();

            //create playerseetings
            if(playerSetting === null) {
                console.log("This is a new Player ! Need to create the settings file");
                newPlayer = true;
                playerSetting = serverInstance.util.createDefaultSettings();

                await serverInstance.util.createPlayerFolder(username);
                await serverInstance.util.savePlayerSettings(username, playerSetting);
                await serverInstance.util.savePlayerCollection(username, playerCollection);
                await serverInstance.util.savePlayerDecklist(username, playerDecklist);
            }

            /** Update serverside information */
            socket.player.collection.loadCollection(serverInstance.cardIndex, playerCollection);
            socket.player.setDeckList(playerDecklist);
            socket.player.setSettings(playerSetting);

            // Send message to the client that everything is ready
            socket.emit('player_connected', connectSuccess, playerSetting, serverInstance.cardIndex, playerCollection, newPlayer, shopData);

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
        serverInstance.util.savePlayerCollection(socket.player.username, socket.player.collection.collectionToJSON());
        serverInstance.util.savePlayerSettings(socket.player.username, socket.player.settings);
        serverInstance.util.savePlayerDecklist(socket.player.username, socket.player.decklist);

        serverInstance.players = serverInstance.players.filter(player => player.name !== socket.player.name); //Remove the player from the player list
        
        socket.emit('player_disconnected');
    });

    /** When the players request the AI deck lists 
     * Call the sendAIDecklist - Might need to be adjusted with promises
    */
    socket.on('request_ai_decklist', () => { /*sendAIDeckList();*/ });

    /** When the player request to open a pack */
    socket.on('open_pack', (set) => {socket.player.openPack(set);});

    /** When the players request their decklists
     * Requires the player's username
     * Call the sendPlayerDecklist - Might need to be adjusted with promises
     */
    socket.on('request_player_decklist', () => { socket.emit('update_player_decklist', JSON.stringify(socket.player.decklist)); });

    /** When a player sends its decklist to be saved on the server 
     * Requires the player's username and decklist as JSON
     * Will write into file. Overwrite default
    */
    socket.on('save_player_decklist', function (/** @type {string} */ decklist) {
        socket.player.decklist = JSON.parse(decklist);
        serverInstance.util.savePlayerDecklist(socket.player.username, socket.player.decklist);
    });

    /** When a player unlocks a new deck */
    socket.on('unlock_deck', async (/** @type {string} */ deckName) => {
        //First Read preconstructed decks
        try {
            const preconstructedDeck = await serverInstance.util.getPreconstructedDecks(deckName);
             
            //Add cards to player collection
            socket.player.collection.addToCollection(preconstructedDeck.cards);
    
            //Add deck to decklist if possible
            let addedToDecklist = socket.player.addToDecklist(preconstructedDeck);
    
            //update client side data
            if(addedToDecklist) socket.emit('update_player_decklist', JSON.stringify(socket.player.decklist));
            socket.emit('update_player_collection', JSON.stringify(socket.player.collection.collectionToJSON()));
            socket.emit('first_login_complete');
        } catch (error) {
            console.error('Error unlocking deck:', error);
        }
    });

    /** When a player buys an item in the shop */
    socket.on('player_buy_item', (item, itemType) => {socket.player.buyItem(item, itemType);});

    /** update player settings */
    socket.on('update_player_settings', (/** @type {string} */ playerSettings) => {
        socket.player.settings = playerSettings;
        serverInstance.util.savePlayerSettings(socket.player.username, playerSettings);
    });

    /** MATCHMAKING REQUESTS */
    /** On entering matchmaking */
    socket.on('player_enter_matchmaking', (selectedDeckID, vsAI) => {
        console.log('Entering matchmaking for player');

        socket.player.waitingForMatch = true;
        socket.player.selectedDeck = selectedDeckID;

        //Start the waiting scene
        if(vsAI) {
            serverInstance.removeFromWaitingPlayers(socket.player);
            socket.player.waitingForMatch = false;
            
            //Create AI Match
            socket.emit('match_found_disable_cancel');
            serverInstance.createAIMatch(socket.player);
        } else {
            serverInstance.addToWaitingPlayers(socket.player);
            //See if you can find a match
            let playerMatch = serverInstance.findMatch(socket.player);
            if(playerMatch) {
                serverInstance.createMatch(socket.player, playerMatch);
            } else { //If not create a timeout by witch an AI game will be created
                setTimeout(() => {
                    if(!socket.player.matchFound) {
                        serverInstance.removeFromWaitingPlayers(socket.player);
                        socket.player.waitingForMatch = false;
                        
                        //Create AI Match
                        socket.emit('match_found_disable_cancel');
                        serverInstance.createAIMatch(socket.player);
                    }
                }, 20000); //TODO Change to 20000
            }
        }

    });

    socket.on('player_leave_matchmaking', () => {
        if(!socket.player.matchFound) {
            serverInstance.removeFromWaitingPlayers(socket.player);
            socket.player.waitingForMatch = false;
            socket.player.selectedDeck = null;
            //Send message to client
            socket.emit('matchmaking_stopped');
        }
    });

    /** CARD MOVEMENTS */
    socket.on('player_card_drag_start', (cardID, cardType) => {if(!socket.player.currentOpponentPlayer.bot) socket.player.currentOpponentPlayer.socket.emit('passiveplayer_card_drag_start', cardID, cardType);});
    socket.on('player_card_drag_position', (cardID, cardType, posX, posY) => {if(!socket.player.currentOpponentPlayer.bot) socket.player.currentOpponentPlayer.socket.emit('passiveplayer_card_drag_position', cardID, cardType, posX, posY);});
    socket.on('player_card_drag_end', (cardID, cardType) => {if(!socket.player.currentOpponentPlayer.bot) socket.player.currentOpponentPlayer.socket.emit('passiveplayer_card_drag_end', cardID, cardType);});
    socket.on('player_card_pointer_over', (cardID, state, activePlayer) => {if(!socket.player.currentOpponentPlayer.bot) socket.player.currentOpponentPlayer.socket.emit('passiveplayer_card_pointer_over', cardID, state, activePlayer);});
    socket.on('player_card_pointer_out', (cardID, state, activePlayer) => {if(!socket.player.currentOpponentPlayer.bot) socket.player.currentOpponentPlayer.socket.emit('passiveplayer_card_pointer_out', cardID, state, activePlayer);});

    /** GAME REQUESTS */
    socket.on('player_match_scene_ready', () => {socket.player.match.flagManager.handleFlag(socket.player, 'READY_SETUP');}); 
    socket.on('player_match_start_mulligan_phase', () => {socket.player.match.flagManager.handleFlag(socket.player, 'READY_MULLIGAN');}); 
    socket.on('player_mulligan_cards', (cards) => {socket.player.match.flagManager.handleFlag(socket.player, 'MULLIGAN_SWAPPED_CARDS', {cards: cards});});
    socket.on('player_match_end_mulligan_phase', () => {socket.player.match.flagManager.handleFlag(socket.player, 'MULLIGAN_OVER');});
    socket.on('player_mulligan_animation_passiveplayer_complete', () => {socket.player.match.flagManager.handleFlag(socket.player, 'MULLIGAN_ANIMATION_PASSIVEPLAYER_OVER');});
    socket.on('player_first_turn_setup', () => {socket.player.match.flagManager.handleFlag(socket.player, 'READY_FIRST_TURN_STEP');});
    socket.on('player_first_turn_setup_complete', () => {socket.player.match.flagManager.handleFlag(socket.player, 'FIRST_TURN_PREP_COMPLETE');});
    socket.on('player_first_turn_setup_passiveplayer_animation_complete', () => {socket.player.match.flagManager.handleFlag(socket.player, 'FIRST_TURN_PREP_ANIMATION_PASSIVEPLAYER_COMPLETE');});

    /** PHASE FUNCTION */
    socket.on('player_end_refresh_phase', (activePlayer) => {
        if(activePlayer) socket.player.match.flagManager.handleFlag(socket.player, 'REFRESH_PHASE_COMPLETE');
        else socket.player.match.flagManager.handleFlag(socket.player, 'REFRESH_PHASE_ANIMATION_PASSIVEPLAYER_COMPLETE');
    });
    socket.on('player_end_draw_phase', (activePlayer) => {
        if(activePlayer) socket.player.match.flagManager.handleFlag(socket.player, 'DRAW_PHASE_COMPLETE');
        else socket.player.match.flagManager.handleFlag(socket.player, 'DRAW_PHASE_ANIMATION_PASSIVEPLAYER_COMPLETE');
    });
    socket.on('player_end_don_phase', (activePlayer) => {
        if(activePlayer) socket.player.match.flagManager.handleFlag(socket.player, 'DON_PHASE_COMPLETE');
        else socket.player.match.flagManager.handleFlag(socket.player, 'DON_PHASE_ANIMATION_PASSIVEPLAYER_COMPLETE');
    });

    socket.on('player_play_card', (cardID) => {socket.player.match.startPlayCard(socket.player, cardID);});
    socket.on('player_attach_don_to_character', (donID, characterID) => {socket.player.match.startAttachDonToCharacter(socket.player, donID, characterID);});

    socket.on('player_cancel_targeting', () => {socket.player.match.resolvePendingAction(socket.player, true);});
    socket.on('player_resolve_targeting', (targetIDs) => {socket.player.match.resolvePendingAction(socket.player, false, targetIDs);});

    socket.on('player_start_targeting_attack', (cardID) => {socket.player.match.startTargetingAttack(socket.player, cardID);});
    socket.on('player_start_targeting_passiveplayer', (cardID) => {if(!socket.player.currentOpponentPlayer.bot) socket.player.currentOpponentPlayer.socket.emit('game_start_targeting_attack_passiveplayer', cardID);});
    socket.on('player_udpate_targeting_attack_passiveplayer', (relX, relY) => {if(!socket.player.currentOpponentPlayer.bot) socket.player.currentOpponentPlayer.socket.emit('game_udpate_targeting_attack_passiveplayer', relX, relY);});

    socket.on('player_start_next_turn', () => {
        if(!socket.player.currentOpponentPlayer.bot) socket.player.currentOpponentPlayer.socket.emit('game_complete_current_turn');
        else socket.player.match.completeCurrentTurn();
    }); //Ask the passive player to send a message when all pending action are complete
    socket.on('player_current_turn_completed_passiveplayer', () => {socket.player.match.completeCurrentTurn();});
});

//START LISTENING
http.listen(8081,function(){ //Listens to port 8081
    console.log('Listening on ' + http.address().port);
});
