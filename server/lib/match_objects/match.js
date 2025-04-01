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

        /** @type {Boolean} */
        this.gameOver = false;

        /** @type {MatchCardRegistry} */
        this.matchCardRegistry = new MatchCardRegistry(); //Create a new card registry

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

        //Refresh all the game flags all players (this has to be done for the passsive player animation flags)
        this.state.current_active_player.currentMatchPlayer.matchFlags.resetTurnFlags();
        this.state.current_passive_player.currentMatchPlayer.matchFlags.resetTurnFlags();

        //Get the cards that need to be refreshed
        let refreshedDon = this.state.refreshDon(this.state.current_active_player.currentMatchPlayer); //Bring dons back to don area
        let refreshedCard = this.state.refreshCards(this.state.current_active_player.currentMatchPlayer); //Change status of cards
        this.state.resetCards(this.state.current_active_player.currentMatchPlayer); //Refresh abilities and card values

        //Send signal to client
        if(!this.state.current_active_player.bot) this.state.current_active_player.socket.emit('game_start_refresh_phase', true, refreshedDon, refreshedCard);
        if(!this.state.current_passive_player.bot) this.state.current_passive_player.socket.emit('game_start_refresh_phase', false, refreshedDon, refreshedCard);
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

    //#region ACTION FUNCTIONS
    /** Function that handles playing a card
     * @param {Player} player
     * @param {number} cardID
     */
    startPlayCard(player, cardID) {
        let result = this.state.playCard(player.currentMatchPlayer, cardID);

        if(result.actionResult === PLAY_CARD_STATES.NOT_ENOUGH_DON) {
            if(!player.bot) player.socket.emit('game_play_card_not_enough_don', result.actionInfos, true);
            if(!player.currentOpponentPlayer.bot) player.currentOpponentPlayer.socket.emit('game_play_card_not_enough_don', result.actionInfos, false);
        } else if(result.actionResult === PLAY_CARD_STATES.CARD_PLAYED) {
            if(!player.bot) player.socket.emit('game_play_card_played', result.actionInfos, true, false, {});
            if(!player.currentOpponentPlayer.bot) player.currentOpponentPlayer.socket.emit('game_play_card_played', result.actionInfos, false, false, {});
        } else if(result.actionResult === PLAY_CARD_STATES.SELECT_REPLACEMENT_TARGET) {
            if(!player.bot) player.socket.emit('game_play_card_played', result.actionInfos, true, true, result.targetData);
            if(!player.currentOpponentPlayer.bot) player.currentOpponentPlayer.socket.emit('game_play_card_played', result.actionInfos, false, true, {});
        } else if(result.actionResult === PLAY_CARD_STATES.CONDITIONS_NOT_MET) {
            if(!player.bot) player.socket.emit('game_play_card_return_to_hand', result.actionInfos, true);
            if(!player.currentOpponentPlayer.bot) player.currentOpponentPlayer.socket.emit('game_play_card_return_to_hand', result.actionInfos, false);
        } else if(result.actionResult === PLAY_CARD_STATES.EVENT_TARGETS_REQUIRED) {
            if(!player.bot) player.socket.emit('game_play_card_played', result.actionInfos, true, true, result.targetData);
        }
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
    startAttackPhase(player, attackerID, defenderID) {
        //First send signal to stop targetting to the current active player
        if(!player.bot) player.socket.emit('game_stop_targetting', false);

        //Set Phase
        this.state.current_phase = MATCH_PHASES.ATTACK_PHASE;

        //get the cards
        let attackerCard = player.currentMatchPlayer.getCard(attackerID);   
        let defenderCard = player.currentOpponentPlayer.currentMatchPlayer.getCard(defenderID);
        //Setup the attack manager
        this.attackManager = new AttackManager(this, attackerCard, defenderCard, player.currentMatchPlayer, player.currentOpponentPlayer.currentMatchPlayer);

        //Start the attack phase for the attacker
        this.state.declareAttackPhase(player.currentMatchPlayer, attackerCard);

        //Send signals to the clients to prepare the attack phase
        if(!player.bot) player.socket.emit('game_declare_attack_phase', attackerID, defenderID, true, player.currentOpponentPlayer.bot);
        if(!player.currentOpponentPlayer.bot) player.currentOpponentPlayer.socket.emit('game_declare_attack_phase', attackerID, defenderID, false, player.bot);
    }

    /** Function to start the on attack event phase */
    startOnAttackEventPhase() {
        //Reset all the action flags
        this.state.current_active_player.currentMatchPlayer.matchFlags.resetActionFlags();
        this.state.current_passive_player.currentMatchPlayer.matchFlags.resetActionFlags();

        //test if there are any blockers in the passive players area which are not rested
        this.attackManager.onAttackEventPhase_Complete = true;

        let skipOnAttackEventPhase = true;

        //Check if there are any events to be reoslved
        let onAttackEvent = this.attackManager.attack.attacker.getAbilityByType("WHEN_ATTACKING");
        if(onAttackEvent && onAttackEvent.canActivate()) {
            if(onAttackEvent.target) {
                const targets = onAttackEvent.target;
                console.log("LOOKING FOR TARGETS")
                if(this.findValidTarget(targets)) {
                    console.log("HAS ON ATTACK EVENTS - ACTIVE");
                    //console.log(onAttackEvent);
                    //if(!this.state.current_active_player.bot) this.state.current_active_player.socket.emit('game_start_on_attack_event_phase', true);
                    skipOnAttackEventPhase = false;
                
                    const abilityInfos = {actionId: 'ON_ATTACK_EVENT_' + this.attackManager.attack.attacker.id, playedCard: this.attackManager.attack.attacker.id, playedCardData: this.attackManager.attack.attacker.cardData, ability: onAttackEvent.id};
                    this.state.pending_action = {actionResult: PLAY_CARD_STATES.ON_ATTACK_EVENT_TARGETS_REQUIRED, actionInfos: abilityInfos, targetData: targets};
                    this.state.resolving_pending_action = true;
                    if(!this.state.current_active_player.bot) this.state.current_active_player.socket.emit('game_card_ability_activated', abilityInfos, true, true, targets, true);
                    //if(!this.state.current_active_player.bot) this.state.current_active_player.socket.emit('game_start_on_attack_event_phase', true);
                } 
            } else {
                console.log("HAS ON ATTACK EVENTS - PASSIVE");
                skipOnAttackEventPhase = false;
            }   

            /*if(!this.state.current_passive_player.bot) this.state.current_passive_player.socket.emit('game_start_on_attack_event_phase', false);
            else this.ai.startOnAttackEventPhase();*/
        } 

        if(skipOnAttackEventPhase) {
            this.flagManager.handleFlag(this.state.current_active_player, 'BLOCKER_PHASE_READY');   
            this.flagManager.handleFlag(this.state.current_passive_player, 'BLOCKER_PHASE_READY_PASSIVE_PLAYER');
        }
    }

    /** Function to start the blocker phase */
    startBlockerPhase() {
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
    }

    /** Function that blocks an attack
     * @param {blockerID} blockerID
     */
    startBlockAttack(blockerID) {
        if(!this.state.current_active_player.bot) this.state.current_active_player.socket.emit('game_attack_blocked', true, blockerID);
        if(!this.state.current_passive_player.bot) this.state.current_passive_player.socket.emit('game_attack_blocked', false, blockerID);
    }

    /** Function to start the Counter Phase */
    startCounterPhase() {
        if( !this.attackManager.counterPhase_Complete
            && this.flagManager.checkFlag('COUNTER_PHASE_READY', this.state.current_active_player)
            && this.flagManager.checkFlag('COUNTER_PHASE_READY', this.state.current_passive_player)){

            this.attackManager.counterPhase_Complete = true;
            this.state.current_phase = MATCH_PHASES.COUNTER_PHASE;

            if(!this.state.current_active_player.bot) this.state.current_active_player.socket.emit('game_start_counter_phase', true);
            if(!this.state.current_passive_player.bot) this.state.current_passive_player.socket.emit('game_start_counter_phase', false);
            else this.ai.startCounterPhase();
        }
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

    /** Function to resolve the attack */
    startResolveAttack() {
        if( !this.attackManager.resolveAttack_Complete
            && this.flagManager.checkFlag('RESOLVE_ATTACK_READY', this.state.current_active_player)
            && this.flagManager.checkFlag('RESOLVE_ATTACK_READY', this.state.current_passive_player)){

            this.attackManager.resolveAttack_Complete = true;
            
            //Resolve the attack
            let attackResults = this.attackManager.resolveAttack(); 
            attackResults = this.state.resolveAttack(attackResults, this.attackManager.attack.attacker, this.attackManager.attack.defender, this.attackManager.attack.attackingPlayer, this.attackManager.attack.defendingPlayer);

            if(!this.state.current_active_player.bot) this.state.current_active_player.socket.emit('game_start_attack_animation', true, attackResults);
            if(!this.state.current_passive_player.bot) this.state.current_passive_player.socket.emit('game_start_attack_animation', false, attackResults);
        } 
    }

    /** Function to cleanup after the attack */
    startAttackCleanup() {
        if( !this.attackManager.attackCleanup_Complete
            && this.flagManager.checkFlag('ATTACK_CLEANUP_READY', this.state.current_active_player)
            && this.flagManager.checkFlag('ATTACK_CLEANUP_READY', this.state.current_passive_player)){

                this.attackManager.attackCleanup_Complete = true;
                console.log("READY FOR CLEANUP");

                const cleanupResults = this.state.attackCleanup(this.attackManager.attack.defendingPlayer);

                //reset Attack object
                this.attackManager = null;

                //Send results to clients
                if(!this.state.current_active_player.bot) this.state.current_active_player.socket.emit('game_attack_cleanup', false, cleanupResults);
                if(!this.state.current_passive_player.bot) this.state.current_passive_player.socket.emit('game_attack_cleanup', true, cleanupResults);
        }
    }

    /** Function to continue with the rest of the turn */
    resumeTurn() {  
        if( this.flagManager.checkFlag('RESUME_TURN_READY', this.state.current_active_player)
            && this.flagManager.checkFlag('RESUME_TURN_READY', this.state.current_passive_player)) {

            if(!this.state.current_passive_player.bot) this.state.current_passive_player.socket.emit('game_resume_passive');   
            if(!this.state.current_active_player.bot) this.state.current_active_player.socket.emit('game_resume_active');
            else this.ai.resumeTurn(true);
        }
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
        
    //#endregion

    //#region RESOLVE ACTION FUNCTION
    /** Function to revolve the current pending action. Big switch that will redirect to the approriate function 
     * @param {Player} player
     * @param {boolean} cancel
     * @param {Array<number>} targets
    */
    resolvePendingAction(player, cancel = false, targets = []) {
        switch (this.state.pending_action.actionResult) {
            case PLAY_CARD_STATES.EVENT_TARGETS_REQUIRED:
                if(cancel) {
                    let cardID = this.state.cancelPlayCard(player.currentMatchPlayer);
                    if(!player.currentOpponentPlayer.bot) player.currentOpponentPlayer.socket.emit('game_play_card_cancel_replacement_target', cardID, false);
                } else {
                    this.startResolveEvent(player, this.state.pending_action.actionInfos.playedCard, targets);
                }
                break;
            case PLAY_CARD_STATES.SELECT_REPLACEMENT_TARGET:
                if(cancel) {
                    let cardID = this.state.cancelPlayCard(player.currentMatchPlayer);
                    if(!player.currentOpponentPlayer.bot) player.currentOpponentPlayer.socket.emit('game_play_card_cancel_replacement_target', cardID, false);
                } 
                else this.startPlayReplaceCard(player, this.state.pending_action.actionInfos.playedCard, targets);
                break;
            case ATTACK_CARD_STATES.SELECT_TARGET:
                if(!cancel) {
                    let validTarget = this.targetingManager.areValidTargets(player, targets, this.state.pending_action.targetData);
                    if(validTarget) {
                       this.startAttackPhase(player, this.state.pending_action.actionInfos.playedCard, targets[0]);
                    } else {
                        player.socket.emit('game_reset_targets');
                    }
                } else {
                    if(!player.currentOpponentPlayer.bot) player.currentOpponentPlayer.socket.emit('game_stop_targeting_attack_passiveplayer');
                }
                break;
            case PLAY_CARD_STATES.ABILITY_TARGETS_REQUIRED:
                if(!cancel) {
                    let validTarget = this.targetingManager.areValidTargets(player, targets, this.state.pending_action.targetData);
                    if(validTarget) {
                        if(!player.bot) player.socket.emit('game_stop_targetting', true, false);
                        let actionInfos = this.state.pending_action.actionInfos;
                        let abilityResults = this.resolveAbility(player, this.state.pending_action.actionInfos.playedCard, this.state.pending_action.actionInfos.ability, targets);
                        actionInfos.abilityResults = abilityResults;

                        if(!player.bot) player.socket.emit('game_card_ability_executed', actionInfos, true);
                        //if(!player.currentOpponentPlayer.bot) player.currentOpponentPlayer.socket.emit('game_play_card_played', result.actionInfos, false, false, {});
                    } else {
                        player.socket.emit('game_reset_targets');
                    }
                } else {
                    //if(!player.currentOpponentPlayer.bot) player.currentOpponentPlayer.socket.emit('game_stop_targeting_attack_passiveplayer');
                    console.log("Canceling ability targeting")
                    //if(!player.currentOpponentPlayer.bot) player.currentOpponentPlayer.socket.emit('game_play_card_cancel_replacement_target', cardID, false);
                }
                break;
            case PLAY_CARD_STATES.ON_ATTACK_EVENT_TARGETS_REQUIRED:
                if(!cancel) {
                    let validTarget = this.targetingManager.areValidTargets(player, targets, this.state.pending_action.targetData);
                    if(validTarget) {
                        if(!player.bot) player.socket.emit('game_stop_targetting', true, false);
                        let actionInfos = this.state.pending_action.actionInfos;
                        let abilityResults = this.resolveAbility(player, actionInfos.playedCard, this.state.pending_action.actionInfos.ability, targets);
                        actionInfos.abilityResults = abilityResults;

                        if(!player.bot) player.socket.emit('game_card_ability_executed', actionInfos, true);
                    } else {
                        player.socket.emit('game_reset_targets');
                    }
                } else {
                    //Send cancel signals
                    //Set Phase
                    this.state.current_phase = MATCH_PHASES.MAIN_PHASE;
                    this.attackManager.attack.attacker.setState(CARD_STATES.IN_PLAY);
                    
                    if(!player.bot) player.socket.emit('game_cancel_attack', true);
                    if(!player.currentOpponentPlayer.bot) player.currentOpponentPlayer.socket.emit('game_cancel_attack', false);
                }
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
    resolveAbility(player, cardId, abilityId, targets) {
        let card = this.matchCardRegistry.get(cardId);
        let ability = card.getAbility(abilityId);

        let abilityResults = {};
        if(ability && ability.canActivate()) {
            abilityResults = ability.action(player.currentMatchPlayer, targets);
        } else {
            player.socket.emit('game_ability_failure', cardId, abilityId);
        }
        return abilityResults;
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
            player.socket.emit('game_activate_ability_failure', cardId, abilityId);
            return;
        }
        
        const targets = card.getAbilityTargets(abilityId);
        if(targets) {
            const abilityInfos = {actionId: 'ABILITY_' + cardId, playedCard: cardId, playedCardData: card.cardData, ability: abilityId};
            this.state.pending_action = {actionResult: PLAY_CARD_STATES.ABILITY_TARGETS_REQUIRED, actionInfos: abilityInfos, targetData: targets};
            this.state.resolving_pending_action = true;
            if(!player.bot) player.socket.emit('game_card_ability_activated', abilityInfos, true, true, targets);
        }
    }

    //#region UTILS

    /** Function to return the player from it;s id
     * @param {number} playerID
     * @returns {Player}
     */
    getPlayer(playerID) {
        if(this.player1.id === playerID) return this.player1;
        else return this.player2;
    }

    /** Function that tries to find a target */
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

    /** Function to determine wether the game is over or not */
    isGameOver() {

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
}


module.exports = Match;