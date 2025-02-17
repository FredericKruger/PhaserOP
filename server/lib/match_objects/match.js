const ServerInstance = require("../server_instance");
const Player = require("../game_objects/player");
const {MatchState} = require("./match_state");

class Match {

    /**
     * 
     * @param {Player} player1 
     * @param {Player} player2 
     * @param {ServerInstance} serverInstance 
     * @param {boolean} botMatch 
     */
    constructor(player1, player2, serverInstance, botMatch) {
        this.serverInstance = serverInstance; //Pointer to the server

        this.id = -1; //Match ID
        this.botMatch = botMatch; //Flag to keep track if the match is against a bot

        this.state = new MatchState(this); //Create a new match state

        this.player1 = player1; //Assign the players
        this.player2 = player2;

        this.player1_Ready = false; //Flags to keep track of which player is ready
        this.player2_Ready = false;

        this.player1_mulligan_over = false; //Flags to keep tack of the mulligan phase
        this.player2_mulligan_over = false;

        this.firstPlayer = null; //Pointer to the first player
    }

    /** Set the readiness of the plauer
     * @param {Player} player
     */
    setPlayerReady(player) {
        if(player === this.player1) {
            this.player1_Ready = true;
        } else if(player === this.player2) {
            this.player2_Ready = true;
        }
    }

}

module.exports = Match;