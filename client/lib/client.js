/** Object to store all function to communicate with the server */
class Client {

    constructor(){
        //#region CONSTRUCTOR
        //Creates a client object
        this.username = ""; //Store the mainplayer username
        this.playerSettings = null; //Store the mainplayer settings

        this.playerCollection = new CardCollection(); //Store the player collection
        this.decklist = []; //Store the player decks
        this.aidecklist = {}; //Store the ai decks
        this.shopData = []; //Store the shop data

        this.firstLogin = false;

        //Connects to the server.
        // @ts-ignore
        this.socket = io.connect();

        /** @type {GameScene} */
        this.gameScene = null; //Store pointer for matchscene
        /** @type {LoginScene} */
        this.loginScene = null; //Store pointer to loginScene
        /** @type {TitleScene} */
        this.titleScene = null; //Store pointer to titleScene
        /** @type {PackOpeningScene} */
        this.packOpeningScene = null; //Store pointer to packOpeningScene
        /** @type {StoreScene} */
        this.storeScene = null; //Store pointer to storeScene
        /** @type {DeckSelectionScene} */
        this.deckSelectionScene = null; //Store pointer to deckSelectionScene
        /** @type {GameSearchingScene} */
        this.gameSearchingScene = null; //Store pointer to gameSearchingScene

        //To help scene initialisation
        this.activePlayerNumberCards = null;
        this.passivePlayerNumberCards = null;
        this.passivePlayerName = "";
        //#endregion

        //#region SOCKET.ON CONNECT
        this.socket.on('player_connected', (success, playerSetting, cardList, playerCollection, newPlayer, shopData) => {
            if(success) {
                this.playerSettings = playerSetting;
                this.playerCollection.loadCards(cardList);
                this.playerCollection.updateCollection(playerCollection);
                this.shopData = shopData;
                this.firstLogin = newPlayer;
                this.loginScene.loadTitleScene();
            } else {
                this.username = null;
                this.loginScene.shakeLoginMenu();
            }    
        });
        this.socket.on('player_disconnected', () => {this.titleScene.loadLoginScreen();});
        this.socket.on('first_login_complete', () => {
            this.firstLogin = false;
            this.titleScene.firstLoginPanel.closePanel();
        });
        //#endregion

        //#region SOCKET.ON DECKLIST
        this.socket.on('update_player_decklist', (deckList) => {this.decklist = JSON.parse(deckList);});
        this.socket.on('update_player_collection', (collection) => {
            collection = JSON.parse(collection);
            this.playerCollection.updateCollection(collection);
            this.playerCollection.filterCollection();
        });
        //#endregion

        //#region SOCKET.ON SETTINGS
        this.socket.on('update_player_settings', (settings) => {this.playerSettings = settings;});
        //#endregion

        //#region SOCKET.ON PACK OPENING LISTENERS
        this.socket.on('pack_opened', (cardList) => {this.packOpeningScene.openPack(cardList);});
        this.socket.on('pack_open_failed', (message) => {this.packOpeningScene.packOpenFailed(message);});
        //#endregion

        //#region SHOP LISTENERS
        this.socket.on('shop_purchase_failed', (message) => {this.storeScene.purchasePanel.purchaseFailed(message);});
        this.socket.on('shop_purchase_successful', (ShopItem, itemType, cardList) => {
            this.storeScene.setPlayerBerries();
            this.storeScene.purchasePanel.purchaseSuccessful(ShopItem, itemType, cardList);
        });
        //#endregion

        //#region SOCKET.ON MATCHMAKING LISTENERS
        this.socket.on('matchmaking_stopped', () => {this.gameSearchingScene.goBackToDeckSelection();});
        this.socket.on('match_found_disable_cancel', () => {this.gameSearchingScene.disableCancelButton();});
        //#region

        //#region SOCKET.ON CARD MOVEMENTS
        this.socket.on('passiveplayer_card_drag_start', (cardID, cardType) => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.passivePlayerCardDragStart(cardID, cardType);
        });
        this.socket.on('passiveplayer_card_drag_position', (cardID, cardType, relX, relY) => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.passivePlayerCardDragPosition(cardID, cardType, relX, relY);
        });
        this.socket.on('passiveplayer_card_drag_end', (cardID, cardType) => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.passivePlayerCardDragEnd(cardID, cardType);
        });
        this.socket.on('passiveplayer_card_pointer_over', (cardID, state, activePlayer) => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.passivePlayerCardPointerOver(cardID, state, activePlayer);
        });
        this.socket.on('passiveplayer_card_pointer_out', (cardID, state, activePlayer) => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.passivePlayerCardPointerOut(cardID, state, activePlayer);
        });
        //#endregion

        //#region SOCKET.ON GAME SETUP
        this.socket.on('start_game_scene', (activePlayerNumberCards, passivePlayerNumberCards, passivePlayerName, board) => {
            this.activePlayerNumberCards = activePlayerNumberCards;
            this.passivePlayerNumberCards = passivePlayerNumberCards;
            this.passivePlayerName = passivePlayerName;
            this.gameSearchingScene.startGameScene(board);
        });
        this.socket.on('start_game_intro', (activePlayerLeader, passivePlayerLeader) => {this.gameScene.startIntroAnimation(activePlayerLeader, passivePlayerLeader);});
        this.socket.on('game_start_mulligan', (activePlayerCards, passivePlayerCards) => {this.gameScene.gameStateManager.startMulligan(activePlayerCards, passivePlayerCards);});
        this.socket.on('game_mulligan_cards', (newCards) => {this.gameScene.gameStateManager.mulliganCards(newCards);});
        this.socket.on('game_mulligan_cards_passiveplayer', (newCards) => {this.gameScene.gameStateManager.mulliganCardsPassivePlayer(newCards);});
        this.socket.on('game_end_mulligan', () => {this.gameScene.gameStateManager.endMulligan();});
        this.socket.on('game_first_turn_setup', (activePlayerCards, passivePlayerCards) => {this.gameScene.gameStateManager.firstTurnSetup(activePlayerCards, passivePlayerCards);});
        //#endregion

        //#region SOCKET.ON GAME PHASES
        this.socket.on('game_start_refresh_phase', (activePlayer, refreshDon, refreshCards, removedAuras) => {
            if(!this.gameScene.gameStateManager.gameOver) {
                if(activePlayer) this.gameScene.gameStateManager.startRefreshPhase(refreshDon, refreshCards, removedAuras);
                else this.gameScene.gameStateManager.startRefreshPhasePassivePlayer(refreshDon, refreshCards, removedAuras);
            }
        });
        this.socket.on('game_start_draw_phase', (activePlayer, newCards) => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.startDrawPhase(newCards, activePlayer);
        });
        this.socket.on('game_start_don_phase', (activePlayer, donCards) => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.startDonPhase(donCards, activePlayer);
        });
        this.socket.on('game_start_main_phase', (activePlayer) => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.startMainPhase(activePlayer);
        });
        //#endregion

        //#region SOCKET.ON CARD PLAY
        this.socket.on('game_play_card_not_enough_don', (actionInfos, activePlayer) => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.playCardNotEnoughDon(actionInfos, activePlayer);
        });
        this.socket.on('game_play_card_being_played', (actionInfos, activePlayer) => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.startPlayCard(actionInfos, activePlayer);
        });
        this.socket.on('game_play_card_played', (actionInfos, activePlayer) => {
            if(!this.gameScene.gameStateManager.gameOver) {
                this.gameScene.gameStateManager.playCard(actionInfos, activePlayer);
            }
        });
        this.socket.on('game_play_select_replacement', (actionInfos, activePlayer) => {
            if(!this.gameScene.gameStateManager.gameOver) {
                    this.gameScene.gameStateManager.selectTarget(actionInfos, activePlayer, 'PLAY');
            }
        });
        this.socket.on('game_play_card_event_triggered', (actionInfos, activePlayer) => {
            if(!this.gameScene.gameStateManager.gameOver) {
                if(actionInfos.optional) {
                    this.gameScene.gameState.exit(GAME_STATES.ON_PLAY_EVENT_INTERACTION);
                } else this.gameScene.gameStateManager.selectTarget(actionInfos, activePlayer, 'EVENT');
            }
        });
        this.socket.on('game_play_card_cancel', (cardID, spentDonIDs, activePlayer) => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.cancelPlayCard(cardID, spentDonIDs, activePlayer);
        });
        this.socket.on('game_stop_on_play_event_optional', () => {
            if(!this.gameScene.gameStateManager.gameOver) {
                this.gameScene.gameStateUI.nextTurnbutton.fsmState.exit(NEXT_TURN_BUTTON_FSM_STATES.ACTIVE);
                this.gameScene.gameState.exit(GAME_STATES.ACTIVE_INTERACTION);
            }
        })
        //#endregion

        //#region SOCKET.ON ATTACH DON TO CHARACTER
        this.socket.on('game_attach_don_to_character', (actionInfos, activePlayer, attachDonSuccessful, botAction = false) => {
            if(!this.gameScene.gameStateManager.gameOver) {
                if(attachDonSuccessful) this.gameScene.gameStateManager.attachDonToCharacterSuccess(actionInfos, activePlayer, botAction);
                else this.gameScene.gameStateManager.attachDonToCharacterFailure(actionInfos, activePlayer);
            }
        });
        //#endregion

        //#region SOCKET.ON ATTACK CHARACTER
        this.socket.on('game_select_attack_target', (actionInfos, activePlayer, targetData) => {
            if(!this.gameScene.gameStateManager.gameOver) {
                //Create new targeting Manager
                let targetManager = new TargetManager(this.gameScene, 'ATTACK', actionInfos.actionId, actionInfos.playedCard);
                this.gameScene.targetManagers.push(targetManager);
                if(activePlayer) targetManager.loadFromTargetData(targetData);

                this.gameScene.gameStateManager.selectAttackTarget(actionInfos, activePlayer);
            }
        });
        this.socket.on('game_declare_attack_phase', (attackerID, defenderID, activePlayer, botAction) => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.declareAttackPhase(attackerID, defenderID, activePlayer, botAction);
        });
        this.socket.on('game_cancel_attack', (activePlayer) => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.cancelAttack(activePlayer);
        });
        this.socket.on('game_on_attack_event_triggered', (actionInfos, activePlayer) => {
            if(!this.gameScene.gameStateManager.gameOver) {
                if(actionInfos.optional) {
                    this.gameScene.gameState.exit(GAME_STATES.ON_ATTACK_EVENT_INTERACTION);
                } else this.gameScene.gameStateManager.selectTarget(actionInfos, activePlayer, 'EVENT');
            }
        });
        this.socket.on('game_start_on_attack_event_phase', (activePlayer) => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.startOnAttackEventPhase(activePlayer);
        });
        this.socket.on('game_start_blocker_phase', (activePlayer) => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.startBlockerPhase(activePlayer);
        });
        this.socket.on('game_attack_blocked', (activePlayer, blockerID) => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.startAttackBlocked(activePlayer, blockerID);
        });

        this.socket.on('game_start_counter_phase', (activePlayer) => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.startCounterPhase(activePlayer);
        });
        
        this.socket.on('game_counter_played_failure', (activePlayer, counterID) => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.startCounterPlayedFailure(activePlayer, counterID);
        });
        this.socket.on('game_counter_played', (activePlayer, counterID, characterID, counterCardData = null) => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.startCounterPlayed(activePlayer, counterID, characterID, counterCardData);
        });

        this.socket.on('game_start_attack_animation', (activePlayer, attackResults) => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.startAttackAnimation(activePlayer, attackResults);
        });
        this.socket.on('game_start_trigger_phase', (activePlayer, lifeCardData) => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.startTriggerPhase(activePlayer, lifeCardData);
        });
        this.socket.on('game_draw_trigger_card', (activePlayer, lifeCardData) => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.drawTriggerCard(activePlayer, lifeCardData);
        });
        this.socket.on('game_trigger_cancel_targeting', () => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameState.exit(GAME_STATES.TRIGGER_INTERACTION);
        });
        this.socket.on('game_trigger_card_played', (actionInfos, discardCard, activePlayer) => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.triggerCardPlayed(actionInfos, discardCard, activePlayer);
        });
        this.socket.on('game_cleanup_trigger_phase', (activePlayer) => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.cleanupTriggerPhase(activePlayer);
        });
        this.socket.on('game_card_trigger_close_interaction_state', () => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.closeTriggerInteractionState();
        });
        this.socket.on('game_card_trigger_flip_card', (activePlayer, cardId, cardData) => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.flipTriggerCard(activePlayer, cardId, cardData);
        });
        this.socket.on('game_attack_attacker_cleanup', (activePlayer, attackerID) => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.startAttackAttackerCleanup(activePlayer, attackerID);
        });
        this.socket.on('game_attack_cleanup', (activePlayer, cleanupResults) => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.startAttackCleanup(activePlayer, cleanupResults);
        });
        //#endregion

        //#region SOCKET.ON TARGETTING
        this.socket.on('game_cancel_targetting', () => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.actionLibrary.cancelTargetingAction(true);
        });
        this.socket.on('game_stop_targetting', () => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.actionLibrary.stopTargetingAction();
        });
        this.socket.on('game_reset_targets', () => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.getActiveTargetManager().resetTargetIDs();
        });
        //#endregion

        //#region SOCKET.ON SELECTION
        this.socket.on('game_reset_selection', () => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.currentSelectionManager.resetSelection();
        });
        //#endregion

        //#region SOCKET.ON ABILITY FUNCTIONS
        this.socket.on('game_ability_success', (cardId, abilityId) => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.handleAbilityStatus(cardId, abilityId, true);
        });
        this.socket.on('game_ability_failure', (cardId, abilityId) => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.handleAbilityStatus(cardId, abilityId, false);
        });
        this.socket.on('game_card_ability_activated', (actionInfos, activePlayer) => {
            if(!this.gameScene.gameStateManager.gameOver) {
                let targetManager = new TargetManager(this.gameScene, 'EVENT', actionInfos.actionId, actionInfos.playedCard);
                this.gameScene.targetManagers.push(targetManager);

                console.log("Targets for ability: ", actionInfos);

                if(activePlayer) targetManager.loadFromTargetData(actionInfos.targets);
                this.gameScene.gameStateManager.startAbilityTargeting(actionInfos.playedCard, activePlayer);
            }
        });
        this.socket.on('game_card_ability_executed', (actionInfos, activePlayer) => {
            if(!this.gameScene.gameStateManager.gameOver) {
                this.gameScene.gameStateManager.resolveAbility(actionInfos.playedCard, actionInfos.ability, actionInfos, activePlayer);
            }
        });
        this.socket.on('game_card_ability_executed_animation', (cardId, abilityId) => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.handleAbilityAnimation(cardId, abilityId);
        });
        //#endregion

        //#region SOCKET.ON STATE CHANGE
        this.socket.on('game_change_state_active', () => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.changeGameStateActive();
        });
        this.socket.on('game_resume_active', () => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.resumeActive();
        });
        this.socket.on('game_resume_passive', () => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.resumePassive();
        });
        //#endregion

        //#region SOCKET.ON NEXT TURN
        this.socket.on('game_complete_current_turn', () => {
            if(!this.gameScene.gameStateManager.gameOver) this.gameScene.gameStateManager.completeCurrentTurn();
        });
        //#endregion

        //#region SOCKET.ON END GAME
        this.socket.on('game_end', (isWinner, reward) => {
            this.gameScene.gameStateManager.endGame(isWinner, reward);
        });
        //#endregion
    }

    /** Function that tells the server a new deck was chosen */
    addDeckToCollection (deckName) {this.socket.emit('unlock_deck', deckName);}

    /** Function that tells the server the main player disconnected */
    askDisconnect () {this.socket.emit('disconnect');};
    
    /** Function that tells the server the main player wants to open the pack */
    requestOpenPack (set) {this.socket.emit('open_pack', set);};
    
    /** Function that asks the server for the player decklists */
    askPlayerDeckList () {this.socket.emit('request_player_decklist');};

    /** Function that sends the server the player decks to save */
    askSavePlayerDecks () {this.socket.emit('save_player_decklist', JSON.stringify(this.decklist));};

    /** Function that sends the server a request from the player to buy the item */
    playerBuyItem (item, itemType) {this.socket.emit('player_buy_item', item, itemType)};

    /** Function that connects a new player to the server */
    playerConnect () {this.socket.emit('player_connect', this.username);}

    /** Function that disconnects a player from the server */
    playerDisconnect () {
        this.socket.emit('player_disconnect', this.username);
        this.username = null;
    }

    //#region REQUEST MATCHMAKING
    requestEnterMatchmaking (selectedDeck, vsAI) {this.socket.emit('player_enter_matchmaking', selectedDeck, vsAI);}
    requestLeaveMatchmaking () {this.socket.emit('player_leave_matchmaking');}
    //#endregion

    //#region REQUEST CARD MOVEMENT
    sendCardDragStart (cardID, cardType) {this.socket.emit('player_card_drag_start', cardID, cardType);}
    sendCardDragPosition (cardID, cardType, relX, relY) {this.socket.emit('player_card_drag_position', cardID, cardType, relX, relY);}
    sendCardDragEnd (cardID, cardType) {this.socket.emit('player_card_drag_end', cardID, cardType);}
    sendCardPointerOver (cardID, state, activePlayer) {this.socket.emit('player_card_pointer_over', cardID, state, activePlayer);}
    sendCardPointerOut (cardID, state, activePlayer) {this.socket.emit('player_card_pointer_out', cardID, state, activePlayer);}
    //#endregion

    //#region REQUEST GAME SETUP
    requestMatchSceneReady () {this.socket.emit('player_match_scene_ready');}
    requestStartMulliganPhase () {this.socket.emit('player_match_start_mulligan_phase');}
    requestMulliganCards (cards) {this.socket.emit('player_mulligan_cards', cards);}
    requestEndMulliganPhase () {this.socket.emit('player_match_end_mulligan_phase');}
    requestMulliganAnimationPassivePlayerComplete () {this.socket.emit('player_mulligan_animation_passiveplayer_complete');}
    requestFirstTurnSetup () {this.socket.emit('player_first_turn_setup');}
    requestReadyFirstTurn () {this.socket.emit('player_ready_first_turn');}
    requestFirstTurnSetupComplete() {this.socket.emit('player_first_turn_setup_complete');};
    requestFirstTurnSetupPassivePlayerAnimationComplete () {this.socket.emit('player_first_turn_setup_passiveplayer_animation_complete');};
    //#endregion

    //#region REQUEST GAME PHASES
    requestEndRefreshPhase (activePlayer) {this.socket.emit('player_end_refresh_phase', activePlayer);}
    requestEndDrawPhase (activePlayer) {this.socket.emit('player_end_draw_phase', activePlayer);}
    requestEndDonPhase (activePlayer) {this.socket.emit('player_end_don_phase', activePlayer);}
    //#endregion

    //#region REQUEST CARD PLAY
    requestPlayerPlayCard (cardID) {this.socket.emit('player_play_card', cardID);}
    requestStartPlayCardComplete () {this.socket.emit('player_play_start_play_card_complete');}
    requestPlayerAttachDonToCharacter (donID, characterID) {this.socket.emit('player_attach_don_to_character', donID, characterID);}
    requestPassOnPlayEventPhase (passed) {this.socket.emit('player_pass_on_play_event_phase', passed);}
    //#endregion

    //#region REQUEST TARGET
    requestCancelTargeting () {this.socket.emit('player_cancel_targeting');}
    requestSendTargets (targetIDs) {this.socket.emit('player_resolve_targeting', targetIDs);}
    //#endregion

    //#region REQUEST ATTACK
    requestStartTargetingAttack (cardID) {this.socket.emit('player_start_targeting_attack', cardID);}
    requestStartOnAttackEventPhase () {this.socket.emit('player_on_attack_event_phase_ready');}
    requestStartOnAttackEventPhasePassivePlayer () {this.socket.emit('player_on_attack_event_phase_ready_passive_player');}
    requestPlayerAttachCounterToCharacter (counterID, characterID) {this.socket.emit('player_attach_counter_to_character', counterID, characterID);}
    requestPassOnAttackEventPhase (passed) {this.socket.emit('player_pass_on_attack_event_phase', passed);}
    requestPassBlockerPhase (passed) {this.socket.emit('player_pass_blocker_phase', passed);}
    requestPassCounterPhase (passed) {this.socket.emit('player_pass_counter_phase', passed);}
    requestStartTriggerPhase () {this.socket.emit('player_trigger_phase_ready');}
    requestDrawTriggerCard () {this.socket.emit('player_draw_trigger_card');}
    requestStartAttackCleanup () {this.socket.emit('player_start_attack_cleanup');}
    requestOnAttackEnd () {this.socket.emit('player_on_attack_end');}
    requestEndAttack() {this.socket.emit('player_end_attack');}
    //#endregion

    //#region REQUEST SELECTION
    requestSendSelection (selectedCardIds, destination) {this.socket.emit('player_send_selection', selectedCardIds, destination);}
    //#endregion

    //#region REQUEST ABILITY
    requestPerformAbility (cardId, abilityId) {this.socket.emit('player_perform_ability', cardId, abilityId);}
    requestActivateAbility (cardId, abilityId) {this.socket.emit('player_activate_ability', cardId, abilityId);}
    requestCleanupAction () {this.socket.emit('player_cleanup_action');}
    //#endregion

    //#region REQUEST END TURN
    requestStartNextTurn () {this.socket.emit('player_start_next_turn');}
    requestCurrentTurnCompletedPassivePlayer() {this.socket.emit('player_current_turn_completed_passiveplayer');}
    requestSurrender() {this.socket.emit('player_surrender');}
    //#endregion

    //#region REQUEST SETTINGS
    updatePlayerSettings () {this.socket.emit('update_player_settings', this.playerSettings);}
    //#endregion

    sendDebug(cardID) {this.socket.emit('debug', cardID);}
    
}