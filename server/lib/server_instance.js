const Utils = require('./utils/utils.js');
const Bot = require('./game_objects/bot.js');
const Match = require('./match_objects/match.js');
const Player = require('./game_objects/player.js');
const AI_Instance = require('./ai_engine/ai_instance.js');

/** Object to store Server information */
class ServerInstance {
    constructor(dirname){
        this.players = []; //List of currently connected players
        this.matches = []; //List of currently started matches
        this.bots = []; //List of currently active bots

        this.waitingPlayers = []; //List of players waiting for a match
        
        this.lastPlayerID = 0; //keep track of the last assigned id to a new player
        this.lastMatchID = 0; //Keep track of the last assigned matchid
        this.lastBotID = 0; //Keep track of the last assigned bot id
        
        this.ai = null;

        this.usedMatchIDS = []; //Keep track of the matchIDS currents in use

        this.cardIndex = {}; //Store the card database

        this.util = new Utils(this, dirname);
        this.io = null
    }

    /** Function that returns a random integer between min and max
     * @param {number} max - max boundary for random integer
     * @param {number} min - min boudary for random integer  
     * @returns {number} random number generated
     */
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    }

    /** Returns true if the given matchID is already in use, false otherwise
     * @param {number} id - Match ID
     * @returns {boolean} 
     */
    isMatchIDUsed(id) {
        for(let i of this.usedMatchIDS) {
            if(id === i) return true;
        }
        return false;
    }

    /** Returns true ifthe username is already in use, fales otherwise
     * @param {string} username - Username
     * @returns {boolean}
     */
    isUsernameUsed(username) {
        for(let p of this.players) {
            if(p.name === username) return true;
        }
        return false;
    }

    /** Release the match id for when the match is over
     * @param {number} id - match id
     * @returns {boolean} True if the match ID was removed, false otherwise 
     */
    releaseMatchID(id) {
        for(let i = (this.usedMatchIDS.length-1); i>=0; i--) {
            if(this.usedMatchIDS[i] === id){
                this.usedMatchIDS.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    /** Function that determines the owner of a card */
    getOwnerOfCard(socket, playerOwned) {
        //First determine the player
        let player = 'a';
        if(socket.player === socket.match.b) player = 'b';

        let p = socket.match.state.a;
        if(player === 'b') p = socket.match.state.b;

        if(!playerOwned) {
            if(player === 'a') p = socket.match.state.b;
            else p = socket.match.state.a;
        }

        return p;
    }

    getPlayerOpponentSocket(socket) {
        if(socket.match.a.socket === socket) return socket.match.b.socket;
        else return socket.match.a.socket;
    }

    /** Function to get a list of all players currentlzy waiting to be connected to a match */
    getAllWaitingPlayers() {
        return this.waitingPlayers;
    }

    /** Add a player to the list of waiting players 
     * @param {Player} player - Player object
    */
    addToWaitingPlayers(player) {
        this.waitingPlayers.push(player);
    }

    /** Remove a player from the list of waiting Players 
     * @param {Player} player - Player object
    */
    removeFromWaitingPlayers(player) {
        this.waitingPlayers = this.waitingPlayers.filter(p => p.id !== player.id);
    }

    /** Function that finds a match between 2 players
     * @param {Player} player - Player object
     * @returns {Player}
     */
    findMatch(player) {
        let n = 0;
        let p = null;
        let attempts = 0;
        const maxAttempts = 100;
        let matchFound = false;

        do {
            attempts++;
            n = this.getRandomInt(0, this.waitingPlayers.length);
            p = this.waitingPlayers[n];
            if(p.id === player.id) {
                continue;
            } else {
                matchFound = true;
                break;
            };
        } while(attempts < maxAttempts);
        
        if(matchFound) {
            this.removeFromWaitingPlayers(player);
            this.removeFromWaitingPlayers(p);
            player.matchFound = true;
            p.matchFound = true;
        } else {
            p = null;
        }

        return p;
    }

    /** Create  
     * @param {Player} player - Player object
    */
    async createAIMatch(player) {
        let bot = new Bot(this);

        this.lastMatchID += 1;
        let match = new Match(this.lastMatchID, player, bot, this, true); //Create a new match
        this.matches.push(match); //Add match to list

        bot.match = match; //Give the bot the match he will play
        player.match = match; //Assign match to player
        player.matchFound = true; //Set the match found flag to true

        //Retrieve the decks. This needs to happen synchronously. Eventually, player user name will be use. FOR NOW HARDCODED
        let aiDeck = await this.util.getRandomAIDeck();
        let playerDeck = player.decklist[player.selectedDeck];

        //Fill the deck from the JSON decklist provided
        match.lastCardID = match.state.player1.deck.fromJSON(playerDeck, this.cardIndex, match.lastCardID, match, player.playerReference);
        match.lastCardID = match.state.player2.deck.fromJSON(aiDeck, this.cardIndex, match.lastCardID, match, bot.playerReference);

        //Fill the don deck
        match.lastCardID = match.state.player1.fillDonDeck(10, match.lastCardID, player.playerReference);
        match.lastCardID = match.state.player2.fillDonDeck(10, match.lastCardID, bot.playerReference);

        //Shuffle the decks
        match.state.player1.deck.shuffle();
        match.state.player2.deck.shuffle();

        //Ready life points
        match.state.player1.life = match.state.player1.deck.leader.cardData.life;
        match.state.player2.life = match.state.player2.deck.leader.cardData.life;

        //Create an AI to play the game
        match.ai = new AI_Instance(this, match);

        let board = this.getRandomInt(0, 3); //Randomly select the board
       
        //Send the client messages to 
        // 1: Load the match ui, provided the number of cards in each deck
        player.socket.emit('start_game_scene', 
            match.state.player1.deck.cards.length, match.state.player2.deck.cards.length, 
            "", 
            board);
    }

    /** Create a match between two players
     * @param {Player} player1 - Player object
     * @param {Player} player2 - Player object
     */
    async createMatch(player1, player2) {
        //Disable cancel button
        player1.socket.emit('match_found_disable_cancel');
        player2.socket.emit('match_found_disable_cancel');

        //Create the match
        this.lastMatchID += 1;
        let match = new Match(this.lastMatchID, player1, player2, this, false); //Create a new match
        this.matches.push(match); //Add match to list

         //Assign match to players
        player1.match = match;
        player2.match = match;

        //Retrieve the decks. This needs to happen synchronously. Eventually, player user name will be use. FOR NOW HARDCODED
        let player1Deck = player1.decklist[player1.selectedDeck];
        let player2Deck = player2.decklist[player2.selectedDeck];

        //Fill the deck from the JSON decklist provided
        match.lastCardID = match.state.player1.deck.fromJSON(player1Deck, this.cardIndex, match.lastCardID, match, player1.playerReference);
        match.lastCardID = match.state.player2.deck.fromJSON(player2Deck, this.cardIndex, match.lastCardID, match, player2.playerReference);

        //Fill the don deck
        match.lastCardID = match.state.player1.fillDonDeck(10, match.lastCardID, player1.playerReference);
        match.lastCardID = match.state.player2.fillDonDeck(10, match.lastCardID, player2.playerReference);

        //Shuffle the decks

        match.state.player1.deck.shuffle();
        match.state.player2.deck.shuffle();

        //Ready life points
        match.state.player1.life = match.state.player1.deck.leader.cardData.life;
        match.state.player2.life = match.state.player2.deck.leader.cardData.life;

        //Randomly select a board
        let board = this.getRandomInt(0, 3); //Randomly select the board
       
        //Send the client messages to 
        // 1: Load the match ui, provided the number of cards in each deck
        player1.socket.emit('start_game_scene', 
            match.state.player1.deck.cards.length, match.state.player2.deck.cards.length, 
            "", 
            board);
        player2.socket.emit('start_game_scene', 
            match.state.player1.deck.cards.length, match.state.player2.deck.cards.length, 
            "", 
            board);
    }
}

module.exports = ServerInstance;