/** Object to store all function to communicate with the server */
class Client {

    constructor(){
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

        /** Listen to the signal from the server that the player has successfully connected */
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

        /** Listen to the signal from the server that the player has successfully disconnected */
        this.socket.on('player_disconnected', () => {this.titleScene.loadLoginScreen();});

        /** Listen to the signal when the first login screen is complete */
        this.socket.on('first_login_complete', () => {
            this.firstLogin = false;
            this.titleScene.firstLoginPanel.closePanel();
        });

        /** Listen to signal from the server containing the player decklist 
         * decklist: JSON object containing the player decklist
        */
        this.socket.on('update_player_decklist', (deckList) => {this.decklist = JSON.parse(deckList);});
        /** Signal to update collection */
        this.socket.on('update_player_collection', (collection) => {
            collection = JSON.parse(collection);
            this.playerCollection.updateCollection(collection);
            this.playerCollection.filterCollection();
        });
        /** Signal to update the settings */
        this.socket.on('update_player_settings', (settings) => {this.playerSettings = settings;});

        /** PACK OPENING LISTENERS */
        this.socket.on('pack_opened', (cardList) => {this.packOpeningScene.openPack(cardList);});
        this.socket.on('pack_open_failed', (message) => {this.packOpeningScene.packOpenFailed(message);});

        /** SHOP LISTENERS */
        this.socket.on('shop_purchase_failed', (message) => {this.storeScene.purchasePanel.purchaseFailed(message);});
        this.socket.on('shop_purchase_successful', (ShopItem, itemType, cardList) => {
            this.storeScene.setPlayerBerries();
            this.storeScene.purchasePanel.purchaseSuccessful(ShopItem, itemType, cardList);
        });

        /** MATCHMAKING LISTENERS */
        //this.socket.on('start_game_searching_scene', () => {this.deckSelectionScene.startGameSearchingScene();});
        this.socket.on('matchmaking_stopped', () => {this.gameSearchingScene.goBackToDeckSelection();});
        this.socket.on('match_found_disable_cancel', () => {this.gameSearchingScene.disableCancelButton();});

        /** CARD MOVEMENTS */
        this.socket.on('passiveplayer_card_drag_start', (cardID, cardType) => {this.gameScene.gameStateManager.passivePlayerCardDragStart(cardID, cardType);});
        this.socket.on('passiveplayer_card_drag_position', (cardID, cardType, relX, relY) => {this.gameScene.gameStateManager.passivePlayerCardDragPosition(cardID, cardType, relX, relY);});
        this.socket.on('passiveplayer_card_drag_end', (cardID, cardType) => {this.gameScene.gameStateManager.passivePlayerCardDragEnd(cardID, cardType);});
        this.socket.on('passiveplayer_card_pointer_over', (cardID, state, activePlayer) => {this.gameScene.gameStateManager.passivePlayerCardPointerOver(cardID, state, activePlayer);});
        this.socket.on('passiveplayer_card_pointer_out', (cardID, state, activePlayer) => {this.gameScene.gameStateManager.passivePlayerCardPointerOut(cardID, state, activePlayer);});

        /** GAME LISTENERS */
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

        this.socket.on('game_start_refresh_phase', (activePlayer, refreshDon, refreshCards) => {
            if(activePlayer) this.gameScene.gameStateManager.startRefreshPhase(refreshDon, refreshCards);
            else this.gameScene.gameStateManager.startRefreshPhasePassivePlayer(refreshDon, refreshCards);
        });
        this.socket.on('game_start_draw_phase', (activePlayer, newCards) => {this.gameScene.gameStateManager.startDrawPhase(newCards, activePlayer);});
        this.socket.on('game_start_don_phase', (activePlayer, donCards) => {this.gameScene.gameStateManager.startDonPhase(donCards, activePlayer);});
        this.socket.on('game_start_main_phase', (activePlayer) => {this.gameScene.gameStateManager.startMainPhase(activePlayer);});

        /** CARD PLAY */
        this.socket.on('game_play_card_not_enough_don', (actionInfos, activePlayer) => {this.gameScene.gameStateManager.playCardNotEnoughDon(actionInfos, activePlayer);});
        this.socket.on('game_play_card_played', (actionInfos, activePlayer, requiresTargeting, targetData) => {
            if(activePlayer && requiresTargeting) this.gameScene.targetManager.loadFromTargetData(targetData);

            this.gameScene.gameStateManager.playCard(actionInfos, activePlayer, requiresTargeting);
        });
        this.socket.on('game_play_card_cancel_replacement_target', (cardID, activePlayer) => {this.gameScene.gameStateManager.cancelReplacementTarget(cardID, activePlayer);});

        /** ATTACH DON TO CHARACTER */
        this.socket.on('game_attach_don_to_character', (actionInfos, activePlayer, attachDonSuccessful, botAction = false) => {
            if(attachDonSuccessful) this.gameScene.gameStateManager.attachDonToCharacterSuccess(actionInfos, activePlayer, botAction);
            else this.gameScene.gameStateManager.attachDonToCharacterFailure(actionInfos, activePlayer);
        });

        /** ATTACK CHARACTER */
        this.socket.on('game_select_attack_target', (actionInfos, activePlayer, targetData) => {
            if(activePlayer) this.gameScene.targetManager.loadFromTargetData(targetData);

            this.gameScene.gameStateManager.selectAttackTarget(actionInfos, activePlayer);
        });
        this.socket.on('game_declare_attack_phase', (attackerID, defenderID, activePlayer, botAction) => {this.gameScene.gameStateManager.declareAttackPhase(attackerID, defenderID, activePlayer, botAction);});
        this.socket.on('game_start_targeting_attack_passiveplayer', (cardID) => {this.gameScene.gameStateManager.passivePlayerStartTargetingAttack(cardID);});
        this.socket.on('game_udpate_targeting_attack_passiveplayer', (relX, relY) => {this.gameScene.gameStateManager.passivePlayerUpdateTargetingAttack(relX, relY);});
        this.socket.on('game_stop_targeting_attack_passiveplayer', () => {this.gameScene.gameStateManager.passivePlayerStopTargetingAttack();});
        this.socket.on('game_start_blocker_phase', (activePlayer) => {this.gameScene.gameStateManager.startBlockerPhase(activePlayer);});
        this.socket.on('game_start_counter_phase', (activePlayer) => {this.gameScene.gameStateManager.startCounterPhase(activePlayer);});
        this.socket.on('game_attack_blocked', (activePlayer, blockerID) => {this.gameScene.gameStateManager.startAttackBlocked(activePlayer, blockerID);});

        /** OPPONENT ACTION LISTENERS */
        this.socket.on('game_stop_targetting', (hideArrow = true) => {
            this.gameScene.targetManager.reset();
            if(hideArrow) this.gameScene.targetingArrow.stopTargeting();
            this.gameScene.gameState.exit(GAME_STATES.PASSIVE_INTERACTION);
        });
        this.socket.on('game_reset_targets', () => {this.gameScene.targetManager.resetTargetIDs();});

        this.socket.on('game_change_state_active', () => {this.gameScene.gameStateManager.changeGameStateActive();});

        this.socket.on('game_complete_current_turn', () => {this.gameScene.gameStateManager.completeCurrentTurn();});
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

    /** CARD MOVEMENTS */
    sendCardDragStart (cardID, cardType) {this.socket.emit('player_card_drag_start', cardID, cardType);}
    sendCardDragPosition (cardID, cardType, relX, relY) {this.socket.emit('player_card_drag_position', cardID, cardType, relX, relY);}
    sendCardDragEnd (cardID, cardType) {this.socket.emit('player_card_drag_end', cardID, cardType);}
    sendCardPointerOver (cardID, state, activePlayer) {this.socket.emit('player_card_pointer_over', cardID, state, activePlayer);}
    sendCardPointerOut (cardID, state, activePlayer) {this.socket.emit('player_card_pointer_out', cardID, state, activePlayer);}

    /** MATCHMAKING */
    requestEnterMatchmaking (selectedDeck, vsAI) {this.socket.emit('player_enter_matchmaking', selectedDeck, vsAI);}
    requestLeaveMatchmaking () {this.socket.emit('player_leave_matchmaking');}

    /** GAME COMMUNICATION */
    requestMatchSceneReady () {this.socket.emit('player_match_scene_ready');}
    requestStartMulliganPhase () {this.socket.emit('player_match_start_mulligan_phase');}
    requestMulliganCards (cards) {this.socket.emit('player_mulligan_cards', cards);}
    requestEndMulliganPhase () {this.socket.emit('player_match_end_mulligan_phase');}
    requestMulliganAnimationPassivePlayerComplete () {this.socket.emit('player_mulligan_animation_passiveplayer_complete');}
    requestFirstTurnSetup () {this.socket.emit('player_first_turn_setup');}
    requestReadyFirstTurn () {this.socket.emit('player_ready_first_turn');}
    requestFirstTurnSetupComplete() {this.socket.emit('player_first_turn_setup_complete');};
    requestFirstTurnSetupPassivePlayerAnimationComplete () {this.socket.emit('player_first_turn_setup_passiveplayer_animation_complete');};

    requestEndRefreshPhase (activePlayer) {this.socket.emit('player_end_refresh_phase', activePlayer);}
    requestEndDrawPhase (activePlayer) {this.socket.emit('player_end_draw_phase', activePlayer);}
    requestEndDonPhase (activePlayer) {this.socket.emit('player_end_don_phase', activePlayer);}

    requestPlayerPlayCard (cardID) {this.socket.emit('player_play_card', cardID);}
    requestPlayerAttachDonToCharacter (donID, characterID) {this.socket.emit('player_attach_don_to_character', donID, characterID);}

    requestCancelTargeting () {this.socket.emit('player_cancel_targeting');}
    requestSendTargets (targetIDs) {this.socket.emit('player_resolve_targeting', targetIDs);}

    requestStartTargetingAttack (cardID) {this.socket.emit('player_start_targeting_attack', cardID);}
    requestStartTargetingPassivePlayer (cardID) {this.socket.emit('player_start_targeting_passiveplayer', cardID);}
    requestUpdateTragetingPassivePlayer (relX, relY) {this.socket.emit('player_udpate_targeting_attack_passiveplayer', relX, relY);}
    requestStartBlockerPhase () {this.socket.emit('player_blocker_phase_ready');}
    requestStartBlockerPhasePassivePlayer () {this.socket.emit('player_blocker_phase_ready_passive_player');}

    requestPassBlockerPhase (passed) {this.socket.emit('player_pass_blocker_phase', passed);}

    /** ABILITY FUNCTIONS */
    requestPerformAbility (cardId, abilityId) {this.socket.emit('player_perform_ability', cardId, abilityId);}

    /** NEXT TURN COMMUNICATION */
    requestStartNextTurn () {this.socket.emit('player_start_next_turn');}
    requestCurrentTurnCompletedPassivePlayer() {this.socket.emit('player_current_turn_completed_passiveplayer');}

    /** Function that tells the server to update the player settings */
    updatePlayerSettings () {this.socket.emit('update_player_settings', this.playerSettings);}
    
}