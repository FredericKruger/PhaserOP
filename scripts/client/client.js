/** Object to store all function to communicate with the server */
class Client {

    constructor(){
        //Creates a client object
        this.ls = {}

        this.username = ""; //Store the mainplayer username
        this.playerSettings = null; //Store the mainplayer settings

        this.playerCollection = []; //Store the player collection
        this.decklist = []; //Store the player decks
        this.aidecklist = {}; //Store the ai decks

        this.firstLogin = false;

        //Connects to the server.
        this.socket = io.connect();
        this.game = null; //No game initially

        this.matchScene = null; //Store pointer for matchscene
        this.loginScene = null; //Store pointer to loginScene
        this.titleScene = null; //Store pointer to titleScene

        //To help scene initialisation
        this.player1NumberCards = null;
        this.player2NumberCards = null;

        /** Listen to the signal from the server that the player has successfully connected */
        this.socket.on('player_connected', (success, playerSetting, playerCollection, newPlayer) => {
            if(success) {
                this.playerSettings = playerSetting;
                this.playerCollection = playerCollection;
                this.firstLogin = newPlayer;
                this.loginScene.loadTitleScene();
            } else {
                this.username = null;
                this.loginScene.shakeLoginMenu();
            }    
        });

        /** Listen to the signal from the server that the player has successfully disconnected */
        this.socket.on('player_disconnected', () => {
            this.titleScene.loadLoginScreen();
        });

        /** Listen to signal from the server containing the player decklist 
         * decklist: JSON object containing the player decklist
        */
        this.socket.on('send_player_decklist', (deckList) => {
            this.decklist = JSON.parse(deckList);
        });

    }
    /** Function that tells the server the main player disconnected */
    askDisconnect () {
        this.socket.emit('disconnect');
    }; 
    
    /** Function that asks the server for the player decklists */
    askPlayerDeckList () {
        this.socket.emit('request_player_decklist', this.username);
    };

    /** Function that sends the server the player decks to save */
    askSavePlayerDecks = function() {
        this.socket.emit('save_player_decklist', this.username, JSON.stringify(GameClient.decklist));
    };

    /** Function that connects a new player to the server */
    playerConnect () {
        this.socket.emit('player_connect', this.username);
    }

    /** Function that disconnects a player from the server */
    playerDisconnect () {
        this.socket.emit('player_disconnect', this.username);
        this.username = null;
    }

    /** Function that tells the server to update the player settings */
    updatePlayerSettings() {
        this.socket.emit('update_player_settings', this.playerSettings);
    }
    
}