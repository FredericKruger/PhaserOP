const ServerInstance = require("../server_instance");
const Player = require("../game_objects/player");
const {MatchState, MATCH_PHASES} = require("./match_state");

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

        //Assign pointers
        this.player1.currentMatchPlayer = this.state.player1;
        this.player2.currentMatchPlayer = this.state.player2;

        this.gameFlags = {
            READY_SETUP: [false, false],

            READY_MULLIGAN: [false, false],
            MULLIGAN_OVER: [false, false]
        }

        this.firstPlayer = null; //Pointer to the first player
    }

    /** Set the readiness of the plauer
     * @param {Player} player
     */
    setPlayerReadyForPhase(player, phase) {
        if(player === this.player1) {
            phase[0] = true;
        } else if(player === this.player2) {
            phase[1] = true;
        }
    }

    /** Function to start the game setup
     * @param {Player} requestingPlayer
     */
    startSetup (requestingPlayer) {
        this.setPlayerReadyForPhase(requestingPlayer, this.gameFlags.READY_SETUP);

        if(this.botMatch) {
            this.setPlayerReadyForPhase(this.player2, this.gameFlags.READY_SETUP); //Set the bot to ready

            this.state.current_phase = MATCH_PHASES.SETUP;
            let player1Leader = this.state.player1.deck.leader;
            let player2Leader = this.state.player2.deck.leader;

            //Start the intro animation
            this.player1.socket.emit('start_game_intro', player1Leader, player2Leader);
        } else {

        }
    }

    /** Function to state the mulligan phase
     * @param {Player} requestingPlayer
     */
    startMulliganPhase (requestingPlayer) {
        this.setPlayerReadyForPhase(requestingPlayer, this.gameFlags.READY_MULLIGAN);

        if(this.botMatch) {
            this.setPlayerReadyForPhase(this.player2, this.gameFlags.READY_MULLIGAN); //Set the bot to ready

            //Start hte mulligan phase in the match engine and get cards drawn for mulligan
            this.state.current_phase = MATCH_PHASES.MULLIGAN_PHASE;

            //Draw the cards
            let player1Cards = this.state.drawCards(this.player1.currentMatchPlayer, 5);
            let player2Cards = this.state.drawCards(this.player2.currentMatchPlayer, 5);

            //Send cards to client
            this.player1.socket.emit('game_start_mulligan', player1Cards, player2Cards);
        }
    }

    /** Function that does the card mulligan
     * @param {Player} requestingPlayer
     * @param {Array<number>} cards
     */
    mulliganCards(requestingPlayer, cards) {
        let newCards = this.state.mulliganCards(requestingPlayer.currentMatchPlayer, cards);

        //Update the other players ui that cards where mulligan

        //Send new cards to clients
        requestingPlayer.socket.emit('game_mulligan_cards', newCards);
    }
}

module.exports = Match;