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
        this.socket.on('passiveplayer_card_drag_position', (cardID, cardType, posX, posY) => {this.gameScene.gameStateManager.passivePlayerCardDragPosition(cardID, cardType, posX, posY);});
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

        this.socket.on('game_start_refresh_phase', (refreshDon, refreshCards) => {this.gameScene.gameStateManager.startRefreshPhase(refreshDon, refreshCards);});
        this.socket.on('game_start_refresh_phase_passive_player', (refreshDon, refreshCards) => {this.gameScene.gameStateManager.startRefreshPhasePassivePlayer(refreshDon, refreshCards);});
        this.socket.on('game_start_draw_phase', (newCards) => {this.gameScene.gameStateManager.startDrawPhase(newCards, true);});
        this.socket.on('game_start_draw_phase_passive_player', (newCards) => {this.gameScene.gameStateManager.startDrawPhase(newCards, false);});
        this.socket.on('game_start_don_phase', (donCards) => {this.gameScene.gameStateManager.startDonPhase(donCards, true);});
        this.socket.on('game_start_don_phase_passive_player', (donCards) => {this.gameScene.gameStateManager.startDonPhase(donCards, false);});
        this.socket.on('game_start_main_phase', () => {this.gameScene.gameStateManager.startMainPhase(true);});
        this.socket.on('game_start_main_phase_passive_player', () => {this.gameScene.gameStateManager.startMainPhase(false);});

        /** CARD PLAY */
        this.socket.on('game_play_card_not_enough_don', (actionInfos) => {this.gameScene.gameStateManager.playCardNotEnoughDon(actionInfos, true);});
        this.socket.on('game_play_card_not_enough_don_passive_player', (actionInfos) => {this.gameScene.gameStateManager.playCardNotEnoughDon(actionInfos, false);});
        this.socket.on('game_play_card_character_played', (actionInfos) => {this.gameScene.gameStateManager.playCard(actionInfos, true, false);});
        this.socket.on('game_play_card_character_played_passive_player', (actionInfos) => {this.gameScene.gameStateManager.playCard(actionInfos, false, false);});
        /** OPPONENT ACTION LISTENERS */
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
    sendCardDragPosition (cardID, cardType, posX, posY) {this.socket.emit('player_card_drag_position', cardID, cardType, posX, posY);}
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

    requestEndRefreshPhase () {this.socket.emit('player_end_refresh_phase');}
    requestEndPassivePlayerAnimationRefreshPhase () {this.socket.emit('player_end_passiveplayer_animation_refresh_phase');}
    requestEndDrawPhase () {this.socket.emit('player_end_draw_phase');}
    requestEndPassivePlayerAnimationDrawPhase () {this.socket.emit('player_end_passiveplayer_animation_draw_phase');}
    requestEndDonPhase () {this.socket.emit('player_end_don_phase');}
    requestEndPassivePlayerAnimationDonPhase () {this.socket.emit('player_end_passiveplayer_animation_don_phase');}

    requestPlayerPlayCard (cardID) {this.socket.emit('player_play_card', cardID);}

    /** NEXT TURN COMMUNICATION */
    requestStartNextTurn () {this.socket.emit('player_start_next_turn');}

    /** Function that tells the server to update the player settings */
    updatePlayerSettings () {this.socket.emit('update_player_settings', this.playerSettings);}
    
}