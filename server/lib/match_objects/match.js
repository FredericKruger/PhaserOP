const ServerInstance = require("../server_instance");
const Player = require("../game_objects/player");
const {MatchState, MATCH_PHASES} = require("./match_state");
const { request } = require("express");
const AI_Instance = require("../ai_engine/ai_instance");
const { FlagManager } = require("../managers/state_manager");
const MatchPlayer = require("./match_player");
const { PLAY_CARD_STATES, ATTACH_DON_TO_CHAR_STATES, ATTACK_CARD_STATES, TARGET_ACTION, CARD_TYPES } = require("./match_enums");
const TargetingManager = require("../managers/targeting_manager");
const { CARD_STATES } = require("./match_card");
const { AttackManager} = require("../managers/attack_manager");
const ServerAbilityFactory = require("../ability_manager/server_ability_factory");
const matchRegistry = require("../managers/match_registry");
const MatchCardRegistry = require("../managers/match_card_registry");
const AuraManager = require("../managers/aura_manager");
const PlayCardManager = require("../managers/play_card_manager");


class Match {

    //#region CONSTRUCTOR
    /**
     * 
     * @param {Player} player1 
     * @param {Player} player2 
     * @param {ServerInstance} serverInstance 
     * @param {boolean} botMatch 
     */
    constructor(id, player1, player2, serverInstance, botMatch) {
        this.serverInstance = serverInstance; //Pointer to the server

        this.id = id; //Match ID
        /** @type {boolean} */
        this.botMatch = botMatch; //Flag to keep track if the match is against a bot
        /** @type {AI_Instance} */
        this.ai = null; //Pointer to the AI instance

        /** @type {number} */
        this.lastCardID = 0; //Keep track of the last card id

        /** @type {number} */
        this.lastAuraID = 0; //Keep track of the last aura id

        /** @type {MatchState} */
        this.state = new MatchState(this, player1.id, player2.id); //Create a new match state
        /** @type {TargetingManager} */
        this.targetingManager = new TargetingManager(this); //Create a new targeting manager

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

        /** @type {AttackManager} */
        this.attackManager = null; //Create a new attack manager

        /** @type {PlayCardManager} */
        this.playCardManager = null;

        /** Action Start Manager */
        this.currentAction = null;
        this.currentActionStack = [];

        /** @type {Boolean} */
        this.gameOver = false;

        /** @type {MatchCardRegistry} */
        this.matchCardRegistry = new MatchCardRegistry(); //Create a new card registry

        /** @type {ServerAbilityFactory} */
        this.abilityFactory = new ServerAbilityFactory(); //Create a new ability factory

        /** @type {AuraManager} */
        this.auraManager = new AuraManager();

        // Register this match in the global registry
        matchRegistry.register(this);
    }
    //#endregion

    //#region START SETUP
    /** Function to start the game setup
     * @param {Player} requestingPlayer
     */
    startSetup (requestingPlayer) {
        if(this.flagManager.checkFlags(['READY_SETUP'])){
            this.state.current_phase = MATCH_PHASES.SETUP;
            let player1Leader = this.state.player1.deck.leader;
            let player2Leader = this.state.player2.deck.leader;

            //set the states for the first turn
            player1Leader.state = CARD_STATES.IN_PLAY_FIRST_TURN;
            player2Leader.state = CARD_STATES.IN_PLAY_FIRST_TURN;

            //Put in the location
            this.state.player1.inLeaderLocation = player1Leader;
            this.state.player2.inLeaderLocation = player2Leader;

            if(!this.player1.bot) this.player1.socket.emit('start_game_intro', player1Leader, player2Leader);
            if(!this.player2.bot) this.player2.socket.emit('start_game_intro', player2Leader, player1Leader);
        }
    }

    //#nedregion

    //#region MULLIGAN FUNCTIONS
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
            
            let newCardsAI = this.ai.mulligan(false); //FIXME need to implement coin flip
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
            // Delay the call to game_end_mulligan by 1 second
            setTimeout(() => {
                //Send cards to client
                if(!this.player1.bot) this.player1.socket.emit('game_end_mulligan');
                if(!this.player2.bot) this.player2.socket.emit('game_end_mulligan');
            }, 1000);
        }
    }
    //#endregion

    //#region FIRST TURN SETUP
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
    //#endregion


    //#region TURN FUNCTIONS
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
        this.state.current_turn++;

        //Refresh all the game flags all players (this has to be done for the passsive player animation flags)
        this.state.current_active_player.currentMatchPlayer.matchFlags.resetTurnFlags();
        this.state.current_passive_player.currentMatchPlayer.matchFlags.resetTurnFlags();

        //Get the cards that need to be refreshed
        let refreshedDon = this.state.refreshDon(this.state.current_active_player.currentMatchPlayer); //Bring dons back to don area
        let refreshedCard = this.state.refreshCards(this.state.current_active_player.currentMatchPlayer); //Change status of cards
        this.state.resetCards(this.state.current_active_player.currentMatchPlayer); //Refresh abilities and card values
        this.state.resetCards(this.state.current_passive_player.currentMatchPlayer); //Refresh abilities and card values

        //Go through Auras that where only turn based
        let removedAuras = this.auraManager.removeTurnAuras();

        //Send signal to client
        if(!this.state.current_active_player.bot) this.state.current_active_player.socket.emit('game_start_refresh_phase', true, refreshedDon, refreshedCard, removedAuras);
        if(!this.state.current_passive_player.bot) this.state.current_passive_player.socket.emit('game_start_refresh_phase', false, refreshedDon, refreshedCard, removedAuras);
    }
    //#endregion

    //#region PHASE FUNCTIONS
    /** Function that start the draw Phase */
    startDrawPhase() {
        if(this.flagManager.checkFlag('REFRESH_PHASE_COMPLETE', this.state.current_active_player)
            && this.flagManager.checkFlag('REFRESH_PHASE_ANIMATION_PASSIVEPLAYER_COMPLETE', this.state.current_passive_player)){
            
            //Start the draw phase
            this.state.current_phase = MATCH_PHASES.DRAW_PHASE;

            //Draw the cards
            let playerCards = this.state.startDrawPhase(this.state.current_active_player.currentMatchPlayer);

            //Send signals to the client
            if(!this.state.current_active_player.bot) this.state.current_active_player.socket.emit('game_start_draw_phase', true, playerCards);
            if(!this.state.current_passive_player.bot) this.state.current_passive_player.socket.emit('game_start_draw_phase', false, playerCards);
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
            if(!this.state.current_active_player.bot) this.state.current_active_player.socket.emit('game_start_don_phase', true, donCards);
            if(!this.state.current_passive_player.bot) this.state.current_passive_player.socket.emit('game_start_don_phase', false, donCards);
        }
    }

    /** Function that stats the main phase */
    startMainPhase() {
        if(this.flagManager.checkFlag('DON_PHASE_COMPLETE', this.state.current_active_player)
            && this.flagManager.checkFlag('DON_PHASE_ANIMATION_PASSIVEPLAYER_COMPLETE', this.state.current_passive_player)){
            
            //Start the main phase
            this.state.current_phase = MATCH_PHASES.MAIN_PHASE;

            //Start the main phase
            if(!this.state.current_active_player.bot) this.state.current_active_player.socket.emit('game_start_main_phase', true);
            if(!this.state.current_passive_player.bot) this.state.current_passive_player.socket.emit('game_start_main_phase', false);

            //If the active player is a bot, let the AI play
            if(this.state.current_active_player.bot) {
                //Let the AI play
                this.ai.play();
            }
        }
    }
    //#endregion

    //#region PLAY CARD FUNCTIONS
    /** Function that handles playing a card
     * @param {Player} player
     * @param {number} cardID
     */
    startPlayCard(player, cardID = null, event = false) {
        //Cancel playing the card if a card is currently being played
        if(!this.gameOver && this.playCardManager && cardID !== this.playCardManager.playedCard.id) {
            this.cancelPlayCard(false, player, cardID, null, []);
            return;
        }

        if(!this.gameOver && this.playCardManager === null) {
            //Create new action
            let playAction = {
                actionId: 'PLAY_CARD_' + cardID,
                type: "PLAY_CARD",
                phase: null,
                actionCallback: null
            };
            this.addActionToStack(playAction);

            //Start the process
            let result = this.state.startPlayCard(player.currentMatchPlayer, cardID, event);
            
            if(result.actionResult === PLAY_CARD_STATES.NOT_ENOUGH_DON) {
                if(!player.bot) player.socket.emit('game_play_card_not_enough_don', result.actionInfos, true);
                if(!player.currentOpponentPlayer.bot) player.currentOpponentPlayer.socket.emit('game_play_card_not_enough_don', result.actionInfos, false);
                
                //this.goDownActionStack();
                this.cleanupAction(player);

            } else if(result.actionResult === PLAY_CARD_STATES.CARD_BEING_PLAYED) {
                this.playCardManager.payedDon =  result.actionInfos.spentDonIds; //assign spent don IDs to play manager

                if(!player.bot) player.socket.emit('game_play_card_being_played', result.actionInfos, true);
                if(!player.currentOpponentPlayer.bot) player.currentOpponentPlayer.socket.emit('game_play_card_being_played', result.actionInfos, false);
            
                //handle bot action
                if(player.bot) this.flagManager.handleFlag(player, 'PLAY_PHASE_READY');
            }
        } else if(!this.gameOver 
            && this.playCardManager.currentPhase === 'PLAY_PHASE_READY') {
            //console.log("CHECKING IF CARD NEEDS TO BE REPLACED");
            let result = this.state.startPlayReplaceCard(player.currentMatchPlayer, this.playCardManager.playedCard);

            if(result.actionResult === PLAY_CARD_STATES.NO_REPLACEMENT) {
                this.flagManager.handleFlag(player, 'PLAY_REPLACEMENT_PHASE_READY');
            }
            else if(result.actionResult === PLAY_CARD_STATES.SELECT_REPLACEMENT_TARGET) {
                this.state.pending_action = result;
                this.state.resolving_pending_action = true;

                if(!player.bot) player.socket.emit('game_play_select_replacement', result.actionInfos, true);
            }
        } else if(!this.gameOver
            && this.playCardManager.currentPhase === 'PLAY_REPLACEMENT_PHASE_READY') {
            let skipOnPlayEventPhase = true;

            //check if there are anu events to be resolved
            let onPlayEvent = this.playCardManager.playedCard.getAbilityByType("ON_PLAY");
            if(onPlayEvent && onPlayEvent.canActivate(this.playCardManager.playedCard, this.state.current_phase)) {
                this.currentAction.phase = "PLAY_ON_PLAY_EVENT_PHASE";
                let executeAbility = false;

                let actionInfos  = {actionId: 'EVENT_' + this.playCardManager.playedCard.id, playedCard: this.playCardManager.playedCard.id, ability: onPlayEvent.id, targetData: {}, optional:onPlayEvent.optional};
                this.state.pending_action = {actionInfos: actionInfos}; //Add to make sure 

                const targets = onPlayEvent.getTargets();
                if(targets.length > 0) { //If targeting is required
                    if(this.findValidTargets(targets)) executeAbility = true;
                } else executeAbility = true;

                if(executeAbility) {
                    skipOnPlayEventPhase = false;
                    this.activateAbility(this.state.current_active_player, actionInfos.playedCard, actionInfos.ability);
                }
            }

            if(skipOnPlayEventPhase) this.flagManager.handleFlag(player, 'PLAY_ON_PLAY_EVENT_PHASE_READY');

        } else if(!this.gameOver
            && this.playCardManager.currentPhase === 'PLAY_ON_PLAY_EVENT_PHASE_READY') {
            this.state.playCard(player.currentMatchPlayer, this.playCardManager.playedCard);

            let actionInfos = {};
            actionInfos.cardPlayed = this.playCardManager.playedCard.id;
            actionInfos.cardPlayedData = this.playCardManager.playedCard.cardData;
            actionInfos.spentDonIds = this.playCardManager.payedDon;
            actionInfos.replacedCard = this.playCardManager.replacedCard;
            actionInfos.abilityId = this.playCardManager.abilityId;
            actionInfos.eventAction = this.playCardManager.onPlayEventActions;
            actionInfos.eventTriggered = this.playCardManager.eventTriggered;

            if(!player.bot) player.socket.emit('game_play_card_played', actionInfos, true);
            if(!player.currentOpponentPlayer.bot) player.currentOpponentPlayer.socket.emit('game_play_card_played', actionInfos, false);

            this.playCardManager = null; //Reset the play card manager
                
            this.cleanupAction(player);
        }
    }

    /** Function to cancel playing a card 
     * @param {boolean} resetPlayManager - Should the play card manager be reset
     * @param {Player} player - The player that is cancelling the play card
     * @param {number} cardId - The id of the card that is being cancelled
     * @param {number} replacedCardId - The id of the card that is being replaced
     * @param {Array<number>} spendDonIds - The ids of the don cards that are being cancelled
    */
    cancelPlayCard(resetPlayManager, player, cardId, replacedCardId, spendDonIds = []) {
        console.log(this.playCardManager);
        player.currentMatchPlayer.cancelPlayCard(cardId, replacedCardId, spendDonIds);

        if(!player.bot) player.socket.emit('game_play_card_cancel', cardId, spendDonIds, true);
        if(resetPlayManager && !player.currentOpponentPlayer.bot) player.currentOpponentPlayer.socket.emit('game_play_card_cancel', cardId, false);

        if(resetPlayManager) this.playCardManager = null; //Reset the play card manager
    }

    /** Function that handles playing a card and replacing an old one
     * @param {Player} player
     * @param {number} cardID
     * @param {Array<number>} replacementTargets
     */
    startPlayReplaceCard(player, cardID, replacementTargets=[]) {
        if(replacementTargets.length === 0) return;

        let validTarget = this.targetingManager.areValidTargets(player, replacementTargets, this.state.pending_action.targetData);
        if(validTarget) {
            let result = this.state.playReplaceCard(player.currentMatchPlayer, cardID, replacementTargets[0]);

            if(!player.bot) {
                player.socket.emit('game_stop_targetting');
                player.socket.emit('game_play_card_played', result.actionInfos, true, false, {});
                //player.socket.emit('game_change_state_active');
            }
            if(!player.currentOpponentPlayer.bot) player.currentOpponentPlayer.socket.emit('game_play_card_played', result.actionInfos, false, false, {});
        } else {
            player.socket.emit('game_reset_targets');
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
            if(!player.bot) player.socket.emit('game_attach_don_to_character', result.actionInfos, true, false);
            if(!player.currentOpponentPlayer.bot) player.currentOpponentPlayer.socket.emit('game_attach_don_to_character', result.actionInfos, false, false);
        } else if(result.actionResult === ATTACH_DON_TO_CHAR_STATES.DON_ATTACHED) {
            if(!player.bot) player.socket.emit('game_attach_don_to_character', result.actionInfos, true, true);
            if(!player.currentOpponentPlayer.bot) player.currentOpponentPlayer.socket.emit('game_attach_don_to_character', result.actionInfos, false, true, player.bot);
        }
    }
    //#endregion

    //#region ATTACK FUNCTIONS
    /** Function to start targeting a card for the attack
     * @param {Player} player
     * @param {number} cardId
     */
    startTargetingAttack(player, cardId) {
        let card = this.matchCardRegistry.get(cardId);
        if(card.state === CARD_STATES.IN_PLAY
            || (card.state === CARD_STATES.IN_PLAY_FIRST_TURN && card.hasRush())) {
            let cardData = player.currentMatchPlayer.getCard(cardId).cardData;
            let actionInfos = {actionId: 'ATTACK_' + cardId, playedCard: cardId, playedCardData: cardData};
            let targetData = {
                targetAction: TARGET_ACTION.ATTACK_CARD_ACTION,
                requiredTargets: 1,
                targets: [
                    {
                        minrequiredtargets: 0,
                        player: ["opponent"],
                        cardtypes: [CARD_TYPES.CHARACTER],
                        states: ["IN_PLAY_RESTED"],
                    },{
                        minrequiredtargets: 0,
                        player: ["opponent"],
                        cardtypes: [CARD_TYPES.LEADER]
                    }
                ]
            };
            this.state.pending_action = {actionResult: ATTACK_CARD_STATES.SELECT_TARGET, actionInfos: actionInfos, targetData: targetData};
            this.state.resolving_pending_action = true;
            player.socket.emit('game_select_attack_target', actionInfos, true, targetData);
        }
    }

    /** Function that start the attack phase
     * @param {Player} player
     * @param {number} attackerID
     * @param {number} defenderID
     */
    startAttack(player, attackerID = null, defenderID = null) {
        if(!this.gameOver && this.attackManager === null) {
            //First send signal to stop targetting to the current active player
            if(!player.bot) player.socket.emit('game_stop_targetting', false);

            //Create new action
            let attackAction = {
                actionId: 'ATTACK_CARD_' + attackerID,
                type: "ATTACK",
                phase: null,
                actionCallback: null
            };
            this.addActionToStack(attackAction);

            //Set Phase
            this.state.current_phase = MATCH_PHASES.ATTACK_PHASE;

            //get the cards
            let attackerCard = player.currentMatchPlayer.getCard(attackerID);   
            let defenderCard = player.currentOpponentPlayer.currentMatchPlayer.getCard(defenderID);
            //Setup the attack manager
            this.attackManager = new AttackManager(this, attackerCard, defenderCard, player.currentMatchPlayer, player.currentOpponentPlayer.currentMatchPlayer);

            //Reset all the action flags
            this.state.current_active_player.currentMatchPlayer.matchFlags.resetActionFlags();
            this.state.current_passive_player.currentMatchPlayer.matchFlags.resetActionFlags();

            //Start the attack phase for the attacker
            this.state.declareAttackPhase(player.currentMatchPlayer, attackerCard);

            //Send signals to the clients to prepare the attack phase
            if(!player.bot) player.socket.emit('game_declare_attack_phase', attackerID, defenderID, true, player.currentOpponentPlayer.bot);
            if(!player.currentOpponentPlayer.bot) player.currentOpponentPlayer.socket.emit('game_declare_attack_phase', attackerID, defenderID, false, player.bot);

        } else if(!this.gameOver && !this.attackManager.onAttackEventPhase_Complete) { /** EVENT PHASE */
            //test if there are any blockers in the passive players area which are not rested
            this.attackManager.onAttackEventPhase_Complete = true;

            let skipOnAttackEventPhase = true;

            //Check if there are any events to be reoslved
            let onAttackEvent = this.attackManager.attack.attacker.getAbilityByType("WHEN_ATTACKING");
            if(onAttackEvent && onAttackEvent.canActivate()) {
                this.currentAction.phase = "ON_ATTACK_EVENT_PHASE";
                let executeAbility = false;

                let actionInfos  = {actionId: 'ON_ATTACK_EVENT_' + this.attackManager.attack.attacker.id, playedCard: this.attackManager.attack.attacker.id, playedCardData: this.attackManager.attack.attacker.cardData, ability: onAttackEvent.id};
                this.state.pending_action = {actionInfos: actionInfos}; //Add to make sure

                const targets = onAttackEvent.getTargets();
                if(targets.length > 0) { //If targeting is required
                    if(this.findValidTargets(targets)) executeAbility = true;
                } else executeAbility = true; 

                if(executeAbility) {
                    skipOnAttackEventPhase = false;
                    this.activateAbility(this.state.current_active_player, actionInfos.playedCard, actionInfos.ability);
                }

                /*if(!this.state.current_passive_player.bot) this.state.current_passive_player.socket.emit('game_start_on_attack_event_phase', false);
                else this.ai.startOnAttackEventPhase();*/
            } 

            if(skipOnAttackEventPhase) {
                this.flagManager.handleFlag(this.state.current_active_player, 'BLOCKER_PHASE_READY');   
                this.flagManager.handleFlag(this.state.current_passive_player, 'BLOCKER_PHASE_READY_PASSIVE_PLAYER');
            }

        } else if(!this.gameOver
            && !this.attackManager.blockPhase_Complete
            && this.flagManager.checkFlag('BLOCKER_PHASE_READY', this.state.current_active_player)
            && this.flagManager.checkFlag('BLOCKER_PHASE_READY_PASSIVE_PLAYER', this.state.current_passive_player)) { /** BLOCKER PHASE */

            //test if there are any blockers in the passive players area which are not rested
            this.attackManager.blockPhase_Complete = true;
            this.state.current_phase = MATCH_PHASES.BLOCK_PHASE;

            //Check if the player has available blockers
            if(this.state.current_passive_player.currentMatchPlayer.hasAvailableBlockers(this.state.current_phase)) {
                if(!this.state.current_active_player.bot) this.state.current_active_player.socket.emit('game_start_blocker_phase', true);

                if(!this.state.current_passive_player.bot) this.state.current_passive_player.socket.emit('game_start_blocker_phase', false);
                else this.ai.startBlockPhase();
            } else { //If no blockers skip the counter
                if(!this.state.current_active_player.bot) this.flagManager.handleFlag(this.state.current_active_player, 'COUNTER_PHASE_READY');
                if(!this.state.current_passive_player.bot) this.flagManager.handleFlag(this.state.current_passive_player, 'COUNTER_PHASE_READY');
            }

        } else if(!this.gameOver
            && !this.attackManager.counterPhase_Complete
            && this.flagManager.checkFlag('COUNTER_PHASE_READY', this.state.current_active_player)
            && this.flagManager.checkFlag('COUNTER_PHASE_READY', this.state.current_passive_player)) { /** COUNTER PHASE */
             
            this.currentAction.phase = "ATTACK_COUNTER_PHASE";
                
            this.attackManager.counterPhase_Complete = true;
            this.state.current_phase = MATCH_PHASES.COUNTER_PHASE;

            if(!this.state.current_active_player.bot) this.state.current_active_player.socket.emit('game_start_counter_phase', true);
            if(!this.state.current_passive_player.bot) this.state.current_passive_player.socket.emit('game_start_counter_phase', false);
            else this.ai.startCounterPhase();

        } else if(!this.gameOver
            && !this.attackManager.resolveAttack_Complete
            && this.flagManager.checkFlag('RESOLVE_ATTACK_READY', this.state.current_active_player)
            && this.flagManager.checkFlag('RESOLVE_ATTACK_READY', this.state.current_passive_player)) { /** RESOLVE ATTACK */

            this.attackManager.resolveAttack_Complete = true;
        
            //Resolve the attack
            let attackResults = this.attackManager.resolveAttack(); 
            this.attackManager.attackResults = this.state.resolveAttack(attackResults, this.attackManager.attack.attacker, this.attackManager.attack.defender, this.attackManager.attack.attackingPlayer, this.attackManager.attack.defendingPlayer);

            if(this.attackManager.attackResults.lostLeaderLife) this.isGameOver();

            if(!this.state.current_active_player.bot) this.state.current_active_player.socket.emit('game_start_attack_animation', true, attackResults);
            if(!this.state.current_passive_player.bot) this.state.current_passive_player.socket.emit('game_start_attack_animation', false, attackResults);
        
        } else if (!this.gameOver
            && !this.attackManager.trigger_Complete
            && this.flagManager.checkFlag('TRIGGER_PHASE_READY', this.state.current_active_player)
            && this.flagManager.checkFlag('TRIGGER_PHASE_READY', this.state.current_passive_player)) { /** TRIGGER PHASE */

            this.attackManager.trigger_Complete = true;
            this.state.current_phase = MATCH_PHASES.TRIGGER_PHASE;

            if(this.attackManager.attackResults.lostLeaderLife) {
                this.currentAction.phase = "TRIGGER_PHASE";

                this.attackManager.attackResults = this.state.drawLifeDeckCard(this.attackManager.attackResults, this.attackManager.attack.defendingPlayer);

                if(!this.state.current_active_player.bot) this.state.current_active_player.socket.emit('game_start_trigger_phase', true, this.attackManager.attackResults.lifeCardData);
                if(!this.state.current_passive_player.bot) this.state.current_passive_player.socket.emit('game_start_trigger_phase', false, this.attackManager.attackResults.lifeCardData);
                else this.ai.startTriggerPhase()

            } else {
                this.flagManager.handleFlag(this.state.current_active_player, 'ATTACK_CLEANUP_READY');
                this.flagManager.handleFlag(this.state.current_passive_player, 'ATTACK_CLEANUP_READY');
            }

        } else if(!this.gameOver
            && !this.attackManager.triggerCleanup_Complete
            && this.flagManager.checkFlag('TRIGGER_CLEANUP_READY', this.state.current_active_player)
            && this.flagManager.checkFlag('TRIGGER_CLEANUP_READY', this.state.current_passive_player)) {
            this.attackManager.triggerCleanup_Complete = true;
            
            if(!this.state.current_active_player.bot) this.state.current_active_player.socket.emit('game_cleanup_trigger_phase', false);
            if(!this.state.current_passive_player.bot) this.state.current_passive_player.socket.emit('game_cleanup_trigger_phase', true);

            this.flagManager.handleFlag(this.state.current_active_player, 'ATTACK_CLEANUP_READY');
            this.flagManager.handleFlag(this.state.current_passive_player, 'ATTACK_CLEANUP_READY');

        }else if(!this.gameOver
            && !this.attackManager.attackCleanup_Complete
            && this.flagManager.checkFlag('ATTACK_CLEANUP_READY', this.state.current_active_player)
            && this.flagManager.checkFlag('ATTACK_CLEANUP_READY', this.state.current_passive_player)) { /** ATTACK CLEANUP PHASE */

            this.attackManager.attackCleanup_Complete = true;

            const cleanupResults = this.state.attackCleanup(this.attackManager.attack.defendingPlayer);

            //Send results to clients
            if(!this.state.current_active_player.bot) this.state.current_active_player.socket.emit('game_attack_cleanup', false, cleanupResults);
            if(!this.state.current_passive_player.bot) this.state.current_passive_player.socket.emit('game_attack_cleanup', true, cleanupResults);

        } else if(!this.gameOver
            && !this.attackManager.resumeTurn_Complete
            && this.flagManager.checkFlag('RESUME_TURN_READY', this.state.current_active_player)
            && this.flagManager.checkFlag('RESUME_TURN_READY', this.state.current_passive_player)) {

            //reset Attack object
            this.attackManager = null;

            //Change game state
            this.state.current_phase = MATCH_PHASES.MAIN_PHASE;

            this.goDownActionStack();
            //this.cleanupAction(player);

            if(!this.state.current_passive_player.bot) this.state.current_passive_player.socket.emit('game_resume_passive');   
            if(!this.state.current_active_player.bot) this.state.current_active_player.socket.emit('game_resume_active');
            else this.ai.resumeTurn(true);

        }  
    }

    /** Function that blocks an attack
     * @param {blockerID} blockerID
     */
    startBlockAttack(blockerID) {
        if(!this.state.current_active_player.bot) this.state.current_active_player.socket.emit('game_attack_blocked', true, blockerID);
        if(!this.state.current_passive_player.bot) this.state.current_passive_player.socket.emit('game_attack_blocked', false, blockerID);
    }


    /** Function to request attaching a counter to a character
     * @param {Player} player
     * @param {number} counterID
     * @param {number} characterID
     */
    startAttachCounterToCharacter(counterID, characterID) {
        let counterCard = this.state.current_passive_player.currentMatchPlayer.getCard(counterID);
        if(counterCard.cardData.counter) {
            this.state.attachCounterToCharacter(this.state.current_passive_player.currentMatchPlayer, counterID, characterID);
            if(!this.state.current_active_player.bot) this.state.current_active_player.socket.emit('game_counter_played', true, counterID, characterID, counterCard.cardData);
            if(!this.state.current_passive_player.bot) this.state.current_passive_player.socket.emit('game_counter_played', false, counterID, characterID);
        } else {
            if(!this.state.current_active_player.bot) this.state.current_active_player.socket.emit('game_counter_played_failure', true, counterID);
            if(!this.state.current_passive_player.bot) this.state.current_passive_player.socket.emit('game_counter_played_failure', false, counterID);
        }
    }


    /** Function to draw the trigger card */
    drawTriggerCard(ai_action = false) {
        //Add card to hand
        let triggerCard = this.attackManager.attackResults.lifeCard;
        triggerCard.setState(CARD_STATES.IN_HAND);
        this.attackManager.attack.defendingPlayer.inHand.push(triggerCard);

        //Send messages to client
        if(!this.state.current_active_player.bot) this.state.current_active_player.socket.emit('game_draw_trigger_card', true, this.attackManager.attackResults.lifeCardData, ai_action);
        if(!this.state.current_passive_player.bot) this.state.current_passive_player.socket.emit('game_draw_trigger_card', false, this.attackManager.attackResults.lifeCardData, ai_action);

        this.flagManager.handleFlag(this.state.current_active_player, 'ATTACK_CLEANUP_READY');
        this.flagManager.handleFlag(this.state.current_passive_player, 'ATTACK_CLEANUP_READY');
    }

    /** Function to resolve the trigger card */
    resolveTriggerCard() {
        //Get Trigger Card
        let triggerCard = this.attackManager.attackResults.lifeCard;

        //If the card is an event, discard it
        let discardCard = false;

        let player = this.attackManager.attack.defendingPlayer;
        player.discardCard(triggerCard);
        discardCard = true;

        let actionInfos = this.state.pending_action.actionInfos;
        //actionInfos.abilityResults;
        if(!this.state.current_active_player.bot) this.state.current_active_player.socket.emit('game_trigger_card_played', actionInfos, discardCard, false);
        if(!this.state.current_passive_player.bot) this.state.current_passive_player.socket.emit('game_trigger_card_played', actionInfos, discardCard, true);

        this.cleanupAction();
    }
    //#endregion

    //#region EVENT FUNCTIONS

    /** Function that handles playing a card and replacing an old one
         * @param {Player} player
         * @param {number} cardID
         * @param {Array<number>} replacementTargets
         */
    startResolveEvent(player, cardID, replacementTargets=[]) {
        if(replacementTargets.length === 0) return;

        let validTarget = this.targetingManager.areValidTargets(player, replacementTargets, this.state.pending_action.targetData);
        if(validTarget) {
            let result = this.state.playEventCard(player.currentMatchPlayer, cardID, replacementTargets[0]);

            if(!player.bot) {
                player.socket.emit('game_stop_targetting', true, true);
                player.socket.emit('game_play_card_played', result.actionInfos, true, false, {});
            }
            if(!player.currentOpponentPlayer.bot) player.currentOpponentPlayer.socket.emit('game_play_card_played', result.actionInfos, false, false, {});
        } else {
            player.socket.emit('game_reset_targets');
        }
    }

    /** Function to cleanup the ability on reception from client
     * @param {Player} player
     */
    cleanupAction(player) {
        let callBack = null;

        if(this.currentActionStack.length > 0) {
            let nextAction = this.currentActionStack[this.currentActionStack.length - 1];
            
            if(nextAction.type === "ATTACK" && nextAction.phase === "TRIGGER_PHASE") {
                callBack = () => {
                    this.flagManager.handleFlag(this.state.current_active_player, 'TRIGGER_CLEANUP_READY');
                    this.flagManager.handleFlag(this.state.current_passive_player, 'TRIGGER_CLEANUP_READY');
                }
            }
            else if(nextAction.type === "ATTACK" && nextAction.phase === "ON_ATTACK_EVENT_PHASE") {
                callBack = () => {
                    this.flagManager.handleFlag(this.state.current_active_player, 'BLOCKER_PHASE_READY');   
                    this.flagManager.handleFlag(this.state.current_passive_player, 'BLOCKER_PHASE_READY_PASSIVE_PLAYER');
                }
            }           
            else if(nextAction.type === "PLAY_CARD" && nextAction.phase === "PLAY_ON_PLAY_EVENT_PHASE") {
                callBack = () => {
                    this.flagManager.handleFlag(player, 'PLAY_ON_PLAY_EVENT_PHASE_READY');
                }
            }
        }

        this.goDownActionStack(callBack);
    }
        
    //#endregion

    //#region RESOLVE ACTION FUNCTION
    /** Function to revolve the current pending action. Big switch that will redirect to the approriate function 
     * @param {Player} player
     * @param {boolean} cancel
     * @param {Array<number>} targets
    */
    resolvePendingAction(player, cancel = false, targets = []) {
        let actionInfos = null;
        switch (this.state.pending_action.actionResult) {
            case PLAY_CARD_STATES.SELECT_REPLACEMENT_TARGET:
                if(cancel) this.cancelPlayCard(true, player, this.playCardManager.playedCard.id, this.playCardManager.replacedCard, this.playCardManager.payedDon);
                else {
                    let validTarget = this.targetingManager.areValidTargets(player, targets, this.state.pending_action.actionInfos.targetData);
                    if(validTarget) {
                        if(!player.bot) player.socket.emit('game_stop_targetting', true, false);
                        this.playCardManager.replacedCard = targets[0];
                        this.matchCardRegistry.get(this.playCardManager.replacedCard).setState(CARD_STATES.IN_DISCARD); //Set card to discard so it cannot be targeted
                        this.flagManager.handleFlag(player, 'PLAY_REPLACEMENT_PHASE_READY');
                    } 
                    else {player.socket.emit('game_reset_targets');}
                } 
                break;
            case PLAY_CARD_STATES.ON_PLAY_EVENT_TARGETS_REQUIRED:
                actionInfos = this.state.pending_action.actionInfos;
                if(cancel) {
                    if(actionInfos.optional) {
                        if(!player.bot) player.socket.emit('game_play_card_event_triggered', actionInfos, true);
                    } else this.cancelPlayCard(true, player, this.playCardManager.playedCard.id, this.playCardManager.replacedCard, this.playCardManager.payedDon);
                    this.cleanupAction(player);
                } else {
                    let validTarget = this.targetingManager.areValidTargets(player, targets, this.state.pending_action.actionInfos.targetData);
                    if(validTarget) {
                        if(!player.bot) player.socket.emit('game_stop_targetting', true, false);
                        if(!player.bot && actionInfos.optional) player.socket.emit('game_stop_on_play_event_optional');
                        
                        let abilityResults = this.executeAbility(player, actionInfos.playedCard, actionInfos.ability, targets);

                        if(abilityResults.status === "DONE") {
                            this.playCardManager.abilityId = this.state.pending_action.actionInfos.ability;
                            this.playCardManager.onPlayEventActions = abilityResults.abilityResults;
                            
                            actionInfos.abilityResults = abilityResults.actionResults;
                            if(!player.bot) player.socket.emit('game_card_ability_executed', actionInfos, true);
                            this.cleanupAction(player);
                        }
                    } 
                    else {player.socket.emit('game_reset_targets');}
                } 
                break;
            case ATTACK_CARD_STATES.SELECT_TARGET:
                if(!cancel) {
                    let validTarget = this.targetingManager.areValidTargets(player, targets, this.state.pending_action.targetData);
                    if(validTarget) {
                       this.startAttack(player, this.state.pending_action.actionInfos.playedCard, targets[0]);
                    } else {
                        player.socket.emit('game_reset_targets');
                    }
                }
                break;
            case PLAY_CARD_STATES.ABILITY_TARGETS_REQUIRED:
                if(!cancel) {
                    let validTarget = this.targetingManager.areValidTargets(player, targets, this.state.pending_action.actionInfos.targetData);
                    if(validTarget) {
                        if(!player.bot) player.socket.emit('game_stop_targetting', true, false);
                        actionInfos = this.state.pending_action.actionInfos;
                        let abilityResults = this.executeAbility(player, actionInfos.playedCard, actionInfos.ability, targets);
                        
                        if(abilityResults.status === "DONE") {
                            actionInfos.abilityResults = abilityResults.actionResults;

                            this.cleanupAction(player);

                            if(!player.bot) player.socket.emit('game_card_ability_executed', actionInfos, true);
                            if(!player.currentOpponentPlayer.bot) player.currentOpponentPlayer.socket.emit('game_card_ability_executed', actionInfos, false);
                        }
                    } else {
                        player.socket.emit('game_reset_targets');
                    }
                } else {
                    console.log("Canceling ability targeting");
                    this.cleanupAction(player);
                }
                break;
            case PLAY_CARD_STATES.ON_ATTACK_EVENT_TARGETS_REQUIRED:
                actionInfos = this.state.pending_action.actionInfos;
                if(!cancel) {
                    let validTarget = this.targetingManager.areValidTargets(player, targets, this.state.pending_action.actionInfos.targetData);
                    if(validTarget) {
                        if(!player.bot) player.socket.emit('game_stop_targetting', true, false);
                        let abilityResults = this.executeAbility(player, actionInfos.playedCard, this.state.pending_action.actionInfos.ability, targets);
                        
                        if(abilityResults.status === "DONE") {
                            actionInfos.abilityResults = abilityResults.actionResults;

                            if(!player.bot) player.socket.emit('game_card_ability_executed', actionInfos, true);

                            this.cleanupAction(player);
                        }
                    } else {
                        player.socket.emit('game_reset_targets');
                    }
                } else {
                    if(actionInfos.optional) {
                        if(!this.state.current_active_player.bot) this.state.current_active_player.socket.emit('game_on_attack_event_triggered', actionInfos, true);
                    } else {
                        //Set Phase
                        this.state.current_phase = MATCH_PHASES.MAIN_PHASE;
                        this.attackManager.attack.attacker.setState(CARD_STATES.IN_PLAY);
                        
                        this.cleanupAction(player);
                    
                        //Send cancel signals
                        if(!player.bot) player.socket.emit('game_cancel_attack', true);
                        if(!player.currentOpponentPlayer.bot) player.currentOpponentPlayer.socket.emit('game_cancel_attack', false);
                    }
                }
                break;
            case PLAY_CARD_STATES.TRIGGER_EVENT_TARGETS_REQUIRED:
                actionInfos = this.state.pending_action.actionInfos;
                if(cancel) {
                    if(!this.state.current_passive_player.bot) this.state.current_passive_player.socket.emit('game_trigger_cancel_targeting');
                } else {
                    let validTarget = this.targetingManager.areValidTargets(player, targets, this.state.pending_action.actionInfos.targetData);
                    if(validTarget) {
                        if(!player.bot) player.socket.emit('game_stop_targetting', true, false);
                        let abilityResults = this.resolveAbility(player, actionInfos.playedCard, this.state.pending_action.actionInfos.ability, targets);
                        actionInfos.abilityResults = abilityResults;

                        this.resolveTriggerCard();

                        //if(!player.bot) player.socket.emit('game_card_ability_executed', actionInfos, true);
                    } else {
                        player.socket.emit('game_reset_targets');
                    }
                }
                break;
            default:
                break;
        }
    }

    /** Function to resolve the ability
     * @param {Player} player
     * @param {number} cardId
     * @param {string} abilityId
     * @param {Array<number>} targets
     */
    executeAbility(player, cardId, abilityId, targets) {
        let card = this.matchCardRegistry.get(cardId);
        let ability = card.getAbility(abilityId);

        ability.currentTargets = targets; //Save the current target
        let actionInfos = {actionId: 'ABILITY_' + cardId, playedCard: cardId, playedCardData: card.cardData, ability: abilityId, targetData: null, optional: ability.optional};

        let abilityResults = ability.action(player.currentMatchPlayer, targets);
        
        //If the ability ccompleted
        if(abilityResults.status === "DONE") {
            actionInfos.abilityResults = abilityResults;
        } else if(abilityResults.status === "TARGETING") { //If the ability requires targeting
            actionInfos.targetData = abilityResults.targetData;
            let action =  {actionResult: PLAY_CARD_STATES.ABILITY_TARGETS_REQUIRED, actionInfos: actionInfos};

            if(ability.type === "ON_PLAY") {
                action.actionResult = PLAY_CARD_STATES.ON_PLAY_EVENT_TARGETS_REQUIRED;
            } else if(ability.type === "WHEN_ATTACKING") {
                action.actionResult = PLAY_CARD_STATES.ON_ATTACK_EVENT_TARGETS_REQUIRED;
                actionInfos.actionId = 'ON_ATTACK_EVENT_' + cardId;
            } else if(ability.type === "TRIGGER") {
                action.actionResult = PLAY_CARD_STATES.TRIGGER_EVENT_TARGETS_REQUIRED;
                actionInfos.actionId = 'TRIGGER_EVENT_' + cardId;
            }

            this.state.pending_action = action;
            this.state.resolving_pending_action = true;

            if(!player.bot) player.socket.emit('game_card_ability_activated', actionInfos, true);
        }

        
        return actionInfos;
    }

    /** Function to activate a cards ability
     * @param {Player} player
     * @param {number} cardId
     * @param {string} abilityId
     */
    activateAbility(player, cardId, abilityId) {
        let card = this.matchCardRegistry.get(cardId);
        let ability = card.getAbility(abilityId);

        if(!ability.canActivate()) {
            if(ability.type === "ON_PLAY" && this.playCardManager) {
                this.flagManager.handleFlag(player, 'PLAY_ON_PLAY_EVENT_PHASE_READY');
                return;
            } else if(ability.type === "WHEN_ATTACKING" && this.attackManager) {
                this.flagManager.handleFlag(this.state.current_active_player, 'BLOCKER_PHASE_READY');   
                this.flagManager.handleFlag(this.state.current_passive_player, 'BLOCKER_PHASE_READY_PASSIVE_PLAYER');
                return;
            } else  {
                player.socket.emit('game_activate_ability_failure', cardId, abilityId);
                return;
            }
        }

        //Create new action
        let abilityAction = {
            actionId: 'ABILITY_' + cardId + '_' + abilityId,
            type: "ABILITY",
            phase: null,
            actionCallback: null
        };
        this.addActionToStack(abilityAction);

        const actionInfos = this.executeAbility(player, cardId, abilityId, []);
        if(actionInfos.abilityResults.status === "DONE") {
            if(!player.bot) player.socket.emit('game_card_ability_executed', actionInfos, true);

            this.cleanupAction(player);
        }
    }

    //#region UTILS

    /** Function to return the player from it;s id
     * @param {number} playerID
     * @returns {Player}
     */
    getPlayer(playerID) {
        if(this.player1.playerReference === playerID) return this.player1;
        else return this.player2;
    }

    /** Function to return the player from it;s id
     * @param {number} playerID
     * @returns {Player}
     */
    getOpponentPlayer(playerID) {
        if(this.player1.id === playerID) return this.player2;
        else return this.player1;
    }

    /** Function that tells if the player is the active player
     * @param {number} playerID
     * @returns {boolean}
     */
    isPlayerActivePlayer(playerID) {
        if(this.state.current_active_player.id === playerID) return true;
        else return false;
    }

    /** Function that tries to find a valid target for every required targeting
     * @param {Array<object>} abilityTargets - Array of targets to find
     * @returns {boolean} - True if all targets are valid, false otherwise
     */
    findValidTargets(abilityTargets) {
        let validTargets = [];

        for(let i=0; i<abilityTargets.length; i++) {
            validTargets[i] = this.findValidTarget(abilityTargets[i]);
        }

        // If we want a logical AND of all targets being valid, 
        // we would check if validTargets length equals the required number of targets
        const allValid = validTargets.length > 0 && validTargets.every(v => v === true);
        
        return allValid;
    }

    /** Function that tries to find a target
     * @param {object} abilityTarget - Target to find
     * @returns {boolean} - True if a valid target was found, false otherwise
     */
    findValidTarget(abilityTarget) {
        let targetingManager = new TargetingManager(this);
        let validTarget = false;
        
        /*** Test Active Player */
        let players = [this.state.current_active_player, this.state.current_passive_player.currentMatchPlayer];
        for(let player of players) {
            //Test Character cards
            for(let card of player.currentMatchPlayer.inCharacterArea) {
                validTarget = targetingManager.areValidTargets(player, [card.id], abilityTarget);
                if(validTarget) return true;
            }
            //Test leader
            validTarget = targetingManager.areValidTargets(player, [player.currentMatchPlayer.inLeaderLocation.id], abilityTarget);
            if(validTarget) return true;
            if(player.currentMatchPlayer.inStageLocation) {
                validTarget = targetingManager.areValidTargets(player, [player.currentMatchPlayer.inStageLocation.id], abilityTarget);
                if(validTarget) return true;
            }
            for(let card of player.currentMatchPlayer.inHand) {
                validTarget = targetingManager.areValidTargets(player, [card.id], abilityTarget);
                if(validTarget) return true;
            }
        }

        return validTarget;
    }

    //#endregion

    //#region GAME OVER

    /** Function to determine wether the game is over or not 
    */
    isGameOver() {
        if(this.player1.currentMatchPlayer.life < 0 || this.player1.currentMatchPlayer.deck.length === 0) {
            this.endGame(this.player2, this.player1);
            return true;
        } else if(this.player2.currentMatchPlayer.life < 0 || this.player2.currentMatchPlayer.deck.length === 0) {
            this.endGame(this.player1, this.player2);
            return true;
        }
        return false;
    }

    /** Function to handle the game over
     * @param {Player} winner
     * @param {Player} loser
    */
    endGame(winner, loser) {
        this.gameOver = true;

        //award rewards to the winner

        //Start end game animations
        if(!winner.bot) winner.socket.emit('game_end', true, 1000);
        if(!loser.bot) loser.socket.emit('game_end', false, 0);

        //cleanup match and ai in server instance
        
        // other cleanup
        global.matchRegistry.remove(this.id);
    }

    /** Function to add an action to the stack
     * @param {Action} action
     */
    addActionToStack(action) {
        if(this.currentAction!==null) this.currentActionStack.push(this.currentAction);
        
        this.currentAction = action;

        console.log("IN ACTION: " + this.currentAction.type + ' ' + this.currentAction.actionId);
        console.log("STACK SIZE: " + this.currentActionStack.length);
    }

    /** function to continue the next action on the stack
     */
    goDownActionStack(callback = null) {
        console.log("COMPLETED ACTION: " + this.currentAction.type + ' ' + this.currentAction.actionId);
        this.currentAction = null;
        if(this.currentActionStack.length > 0) {
            this.currentAction = this.currentActionStack.pop();
            console.log("RETURNING TO ACTION: " + this.currentAction.type + ' ' + this.currentAction.actionId);
            console.log("STACK SIZE: " + this.currentActionStack.length);

            console.log(this.currentAction);
            if(callback) callback();
        }
    }

    //#region DEBUG
    debug_createFakeAttackManager(player) {
        let attacker = this.state.current_passive_player.currentMatchPlayer.inLeaderLocation;
        let defender = this.state.current_active_player.currentMatchPlayer.inLeaderLocation;

        this.attackManager = new AttackManager(this.state, attacker, defender, this.state.current_passive_player.currentMatchPlayer, this.state.current_active_player.currentMatchPlayer);
        this.attackManager.attackResults = {};
        this.attackManager.attackResults.lostLeaderLife = true;
        this.attackManager.attackResults = this.state.drawLifeDeckCard(this.attackManager.attackResults, this.attackManager.attack.defendingPlayer);

        this.flagManager.handleFlag(this.state.current_active_player, 'TRIGGER_PHASE_READY');
        this.flagManager.handleFlag(this.state.current_passive_player, 'TRIGGER_PHASE_READY');
    }
    //#endregion
}


module.exports = Match;