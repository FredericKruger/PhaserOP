const ServerInstance = require("../server_instance");
const Player = require("../game_objects/player");
const {MatchState, MATCH_PHASES} = require("./match_state");
const { request } = require("express");
const AI_Instance = require("../ai_engine/ai_instance");
const { FlagManager } = require("../game_objects/state_manager");

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
        /** @type {AI_Instance} */
        this.ai = null; //Pointer to the AI instance

        this.state = new MatchState(this); //Create a new match state

        this.player1 = player1; //Assign the players
        this.player2 = player2;

        //Assign pointers
        this.player1.currentMatchPlayer = this.state.player1;
        this.player2.currentMatchPlayer = this.state.player2;

        //Assign opponents
        this.player1.currentOpponentPlayer = this.player2;
        this.player2.currentOpponentPlayer = this.player1;

        this.flagManager = new FlagManager(this); //Create a new state manager

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
        if(this.flagManager.checkFlags(['READY_SETUP'])){
            this.state.current_phase = MATCH_PHASES.SETUP;
            let player1Leader = this.state.player1.deck.leader;
            let player2Leader = this.state.player2.deck.leader;

            //Put in the location
            this.state.player1.inLeaderLocation = player1Leader;
            this.state.player2.inLeaderLocation = player2Leader;

            if(!this.player1.bot) this.player1.socket.emit('start_game_intro', player1Leader, player2Leader);
            if(!this.player2.bot) this.player2.socket.emit('start_game_intro', player2Leader, player1Leader);
        }
    }

    /** Function to state the mulligan phase
     * @param {Player} requestingPlayer
     */
    startMulliganPhase (requestingPlayer) {
        if(this.flagManager.checkFlags(['READY_MULLIGAN'])){
            this.state.current_phase = MATCH_PHASES.MULLIGAN_PHASE;

            //Draw the cards
            let player1Cards = this.state.drawCards(this.player1.currentMatchPlayer, 5);
            let player2Cards = this.state.drawCards(this.player2.currentMatchPlayer, 5);

            //Send cards to client
            if(!this.player1.bot) this.player1.socket.emit('game_start_mulligan', player1Cards, player2Cards);
            if(!this.player2.bot) this.player1.socket.emit('game_start_mulligan', player2Cards, player1Cards);
        }
    }

    /** Function that does the card mulligan
     * @param {Player} requestingPlayer
     * @param {Array<number>} cards
     */
    mulliganCards(requestingPlayer, cards) {
        let newCards = [];
        if(cards.length > 0) newCards = this.state.mulliganCards(requestingPlayer.currentMatchPlayer, cards);

        //Update the other players ui that cards where mulligan
        if(requestingPlayer.currentOpponentPlayer.bot) {
            //let AI do the mulligan
            
            let newCardsAI = this.ai.mulligan();
            requestingPlayer.socket.emit('game_mulligan_cards_passiveplayer', newCardsAI);
        }

        //Send new cards to clients
        requestingPlayer.socket.emit('game_mulligan_cards', newCards);
    }

    /** Function to end the mulligan phase */
    endMulliganPhase() {
        //Only end mulligan if both player have completed the mulligan and the animation phase
        if(this.flagManager.checkFlags(['MULLIGAN_OVER', 'MULLIGAN_ANIMATION_PASSIVEPLAYER_OVER'])){
            //Start hte mulligan phase in the match engine and get cards drawn for mulligan
            this.state.current_phase = MATCH_PHASES.MULLIGAN_PHASE_OVER;

            // Delay the call to game_end_mulligan by 1 second
            setTimeout(() => {
                //Send cards to client
                if(!this.player1.bot) this.player1.socket.emit('game_end_mulligan');
                if(!this.player2.bot) this.player2.socket.emit('game_end_mulligan');
            }, 1000);
        }
    }

    /** Function to set up the first turn */
    firstTurnSetup(requestingPlayer) {
        if(this.flagManager.checkFlags(['READY_FIRST_TURN_STEP'])){
            this.state.current_phase = MATCH_PHASES.PREPARING_FIRST_TURN;
            
            //Get Cards for life decks
            let player1Cards = this.state.addCardToLifeDeck(this.player1.currentMatchPlayer);
            let player2Cards = this.state.addCardToLifeDeck(this.player2.currentMatchPlayer);

            if(!this.player1.bot) this.player1.socket.emit('game_first_turn_setup', player1Cards, player2Cards); //Send to client
            if(!this.player2.bot) this.player2.socket.emit('game_first_turn_setup', player2Cards, player1Cards); //Send to client
        }
    }

    /** Function to complete the setup once player and animation are ready on both sides */
    endFirstTurnSetup() {
        if(this.flagManager.checkFlags(['FIRST_TURN_PREP_COMPLETE', 'FIRST_TURN_PREP_ANIMATION_PASSIVEPLAYER_COMPLETE'])){
            //Determine the first player
            let firstPlayer = 0; //should be randomized TODO
            if(firstPlayer === 0) {
                this.player1.currentMatchPlayer.isFirstPlayer = true;
                this.state.current_active_player = this.player1;
                this.state.current_passive_player = this.player2;
            } else {
                this.player2.currentMatchPlayer.isFirstPlayer = true;
                this.state.current_active_player = this.player2;
                this.state.current_passive_player = this.player1;
            }

            //Start the new turn
            let donCards = this.state.startDonPhase(this.state.current_active_player.currentMatchPlayer);
            
            //Send signal to client
            if(!this.player1.bot) this.state.current_active_player.socket.emit('game_start_don_phase', donCards);
            /*if(!this.state.current_passive_player.bot) {
                this.state.current_passive_player.socket.emit('game_start_don_phase_passive_player', donCards);
            }*/
        }
    }
}


module.exports = Match;