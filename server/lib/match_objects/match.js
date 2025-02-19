const ServerInstance = require("../server_instance");
const Player = require("../game_objects/player");
const {MatchState, MATCH_PHASES} = require("./match_state");
const { request } = require("express");

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
            MULLIGAN_SWAPPED_CARDS: [false, false],
            MULLIGAN_ANIMATION_PASSIVEPLAYER_OVER: [false, false],
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
        this.setPlayerReadyForPhase(requestingPlayer, this.gameFlags.MULLIGAN_SWAPPED_CARDS);
        let newCards = [];
        if(cards.length > 0) newCards = this.state.mulliganCards(requestingPlayer.currentMatchPlayer, cards);

        //Update the other players ui that cards where mulligan
        if(this.botMatch) {
            //let AI do the mulligan

            let newCardsAI = this.state.drawCards(this.player2.currentMatchPlayer, 5); //To be changes
            requestingPlayer.socket.emit('game_mulligan_cards_passiveplayer', newCardsAI);
        }

        //Send new cards to clients
        requestingPlayer.socket.emit('game_mulligan_cards', newCards);
    }

    /** Function to complete the Mulligan Phase
     * @param {Player} requestingPlayer
     */
    mulliganComplete(requestingPlayer) {
        this.setPlayerReadyForPhase(requestingPlayer, this.gameFlags.MULLIGAN_OVER);

        if(this.botMatch) {
            this.setPlayerReadyForPhase(this.player2, this.gameFlags.MULLIGAN_OVER); //Set the bot to ready

            this.endMulliganPhase();
        }
    }

    /** Function to complete the mulligan animation for the passive player
     * @param {Player} requestingPlayer
     */
    mulliganAnimationPassivePlayerComplete(requestingPlayer) {
        this.setPlayerReadyForPhase(requestingPlayer, this.gameFlags.MULLIGAN_ANIMATION_PASSIVEPLAYER_OVER);

        if(this.botMatch) {
            this.setPlayerReadyForPhase(this.player2, this.gameFlags.MULLIGAN_ANIMATION_PASSIVEPLAYER_OVER); //Set the bot to ready

            this.endMulliganPhase();
        }
    }

    /** Function to end the mulligan phase */
    endMulliganPhase() {
        //Only end mulligan if both player have completed the mulligan and the animation phase
        if(this.gameFlags.MULLIGAN_OVER[0] && this.gameFlags.MULLIGAN_OVER[1]
            && this.gameFlags.MULLIGAN_ANIMATION_PASSIVEPLAYER_OVER[0] && this.gameFlags.MULLIGAN_ANIMATION_PASSIVEPLAYER_OVER[1]
        ) {
            //Start hte mulligan phase in the match engine and get cards drawn for mulligan
            this.state.current_phase = MATCH_PHASES.MULLIGAN_PHASE_OVER;

            // Delay the call to game_end_mulligan by 1 second
            setTimeout(() => {
                //Send cards to client
                this.player1.socket.emit('game_end_mulligan');
            }, 1000);
        }
    }
}

module.exports = Match;