const ServerInstance = require("../server_instance");
const Player = require("../game_objects/player");
const {MatchState, MATCH_PHASES} = require("./match_state");
const { request } = require("express");
const AI_Instance = require("../ai_engine/ai_instance");
const { FlagManager } = require("../game_objects/state_manager");
const MatchPlayer = require("./match_player");
const { PLAY_CARD_STATES, ATTACH_DON_TO_CHAR_STATES } = require("./match_enums");

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
        /** @type {boolean} */
        this.botMatch = botMatch; //Flag to keep track if the match is against a bot
        /** @type {AI_Instance} */
        this.ai = null; //Pointer to the AI instance

        /** @type {MatchState} */
        this.state = new MatchState(this); //Create a new match state

        /** @type {Player} */
        this.player1 = player1; //Assign the players
        /** @type {Player} */
        this.player2 = player2;

        //Assign pointers
        /** @type {MatchPlayer} */
        this.player1.currentMatchPlayer = this.state.player1;
        /** @type {MatchPlayer} */
        this.player2.currentMatchPlayer = this.state.player2;

        //Assign opponents
        /** @type {Player} */
        this.player1.currentOpponentPlayer = this.player2;
        /** @type {Player} */
        this.player2.currentOpponentPlayer = this.player1;

        /** @type {FlagManager} */
        this.flagManager = new FlagManager(this); //Create a new state manager
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
            if(!this.player2.bot) this.player2.socket.emit('game_start_mulligan', player2Cards, player1Cards);
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
        if(!requestingPlayer.bot) requestingPlayer.socket.emit('game_mulligan_cards', newCards);
        if(!requestingPlayer.currentOpponentPlayer.bot) requestingPlayer.currentOpponentPlayer.socket.emit('game_mulligan_cards_passiveplayer', newCards);
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
            this.startNewTurn();
        }
    }

    /** Function to ask wait for the passive player to complete all the pending action 
    */
    completeCurrentTurn() {
        //Remove first turn flag
        this.state.current_active_player.currentMatchPlayer.isFirstTurn = false;

        //Switch the active and passive player
        let temp = this.state.current_active_player;
        this.state.current_active_player = this.state.current_passive_player;
        this.state.current_passive_player = temp;

        //Start the new turn
        this.startNewTurn();
    }

    /** Function that starts a new turn */
    startNewTurn() {
        //Start the refresh phase
        this.state.current_phase = MATCH_PHASES.REFRESH_PHASE;

        //Refresh all the game flags all players (this has to be done for the passsive player animation flags)
        this.state.current_active_player.currentMatchPlayer.matchFlags.resetTurnFlags();
        this.state.current_passive_player.currentMatchPlayer.matchFlags.resetTurnFlags();

        //Get the cards that need to be refreshed
        let refreshedDon = this.state.refreshDon(this.state.current_active_player.currentMatchPlayer); //Bring dons back to don area
        let refreshedCard = this.state.refreshCards(this.state.current_active_player.currentMatchPlayer); //Change status of cards

        //Send signal to client
        if(!this.state.current_active_player.bot) this.state.current_active_player.socket.emit('game_start_refresh_phase', refreshedDon, refreshedCard);
        if(!this.state.current_passive_player.bot) this.state.current_passive_player.socket.emit('game_start_refresh_phase_passive_player', refreshedDon, refreshedCard);
    }

    /** Function that start the draw Phase */
    startDrawPhase() {
        if(this.flagManager.checkFlag('REFRESH_PHASE_COMPLETE', this.state.current_active_player)
            && this.flagManager.checkFlag('REFRESH_PHASE_ANIMATION_PASSIVEPLAYER_COMPLETE', this.state.current_passive_player)){
            
            //Start the draw phase
            this.state.current_phase = MATCH_PHASES.DRAW_PHASE;

            //Draw the cards
            let playerCards = this.state.startDrawPhase(this.state.current_active_player.currentMatchPlayer);

            //Send signals to the client
            if(!this.state.current_active_player.bot) this.state.current_active_player.socket.emit('game_start_draw_phase', playerCards);
            if(!this.state.current_passive_player.bot) this.state.current_passive_player.socket.emit('game_start_draw_phase_passive_player', playerCards);
        }
    }

    /** Function that starts the don phase */
    startDonPhase() {
        if(this.flagManager.checkFlag('DRAW_PHASE_COMPLETE', this.state.current_active_player)
            && this.flagManager.checkFlag('DRAW_PHASE_ANIMATION_PASSIVEPLAYER_COMPLETE', this.state.current_passive_player)){
              
            //Start the DON Phase
            this.state.current_phase = MATCH_PHASES.DON_PHASE

            //Get the don cards
            let donCards = this.state.startDonPhase(this.state.current_active_player.currentMatchPlayer);
            
            //Send signal to client
            if(!this.state.current_active_player.bot) this.state.current_active_player.socket.emit('game_start_don_phase', donCards);
            if(!this.state.current_passive_player.bot) this.state.current_passive_player.socket.emit('game_start_don_phase_passive_player', donCards);
        }
    }

    /** Function that stats the main phase */
    startMainPhase() {
        if(this.flagManager.checkFlag('DON_PHASE_COMPLETE', this.state.current_active_player)
            && this.flagManager.checkFlag('DON_PHASE_ANIMATION_PASSIVEPLAYER_COMPLETE', this.state.current_passive_player)){
            
            //Start the main phase
            this.state.current_phase = MATCH_PHASES.MAIN_PHASE;

            //Start the main phase
            if(!this.state.current_active_player.bot) this.state.current_active_player.socket.emit('game_start_main_phase');
            if(!this.state.current_passive_player.bot) this.state.current_passive_player.socket.emit('game_start_main_phase_passive_player');

            //If the active player is a bot, let the AI play
            if(this.state.current_active_player.bot) {
                //Let the AI play
                this.ai.play();
            }
        }
    }

    /** Function that handles playing a card
     * @param {Player} player
     * @param {number} cardID
     */
    startPlayCard(player, cardID) {
        let result = this.state.playCard(player.currentMatchPlayer, cardID);

        if(result.actionResult === PLAY_CARD_STATES.NOT_ENOUGH_DON) {
            if(!player.bot) player.socket.emit('game_play_card_not_enough_don', result.actionInfos);
            if(!player.currentOpponentPlayer.bot) player.currentOpponentPlayer.socket.emit('game_play_card_not_enough_don_passive_player', result.actionInfos);
        } else if(result.actionResult === PLAY_CARD_STATES.CHARACTER_PLAYED) {
            if(!player.bot) player.socket.emit('game_play_card_character_played', result.actionInfos);
            if(!player.currentOpponentPlayer.bot) player.currentOpponentPlayer.socket.emit('game_play_card_character_played_passive_player', result.actionInfos);
        } else if(result.actionResult === PLAY_CARD_STATES.SELECT_REPLACEMENT_TARGET) {
            if(!player.bot) player.socket.emit('game_play_card_select_replacement_target', result.actionInfos, result.targetAction);
            //if(!player.currentOpponentPlayer.bot) player.currentOpponentPlayer.socket.emit('game_select_replacement_target_passive_player', result.actionInfos);
        }
    }

    /** Function that handles attaching a don card to a character
     * @param {Player} player
     * @param {number} donID
     * @param {number} characterID
     */
    startAttachDonToCharacter(player, donID, characterID) {
        let result = this.state.startAttachDonToCharacter(player.currentMatchPlayer, donID, characterID);

        if(result.actionResult === ATTACH_DON_TO_CHAR_STATES.DON_NOT_READY) {
            if(!player.bot) player.socket.emit('game_attach_don_to_character_failure', result.actionInfos);
            if(!player.currentOpponentPlayer.bot) player.currentOpponentPlayer.socket.emit('game_attach_don_to_character_failure_passive_player', result.actionInfos);
        } else if(result.actionResult === ATTACH_DON_TO_CHAR_STATES.DON_ATTACHED) {
            if(!player.bot) player.socket.emit('game_attach_don_to_character_success', result.actionInfos);
            if(!player.currentOpponentPlayer.bot) player.currentOpponentPlayer.socket.emit('game_attach_don_to_character_success_passive_player', result.actionInfos);
        }
    }
}


module.exports = Match;