/** Object to store all function to communicate with the server */
class Client {

    constructor(){
        //Creates a client object
        this.ls = {}

        this.username = ""; //Store the mainplayer username
        this.playerSettings = null; //Store the mainplayer settings

        this.decklist = {}; //Store the player decks
        this.aidecklist = {}; //Store the ai decks

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
        this.socket.on('player_connected', (success, playerSetting) => {
            if(success) {
                this.playerSettings = playerSetting;
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

    }
    /** Function that tells the server the main player disconnected */
    askDisconnect () {
        this.socket.emit('disconnect');
    }; 
    
    /** Function that asks the server for the player decklists */
    askPlayerDeckList () {
        this.socket.emit('request_player_decklist', this.username);
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