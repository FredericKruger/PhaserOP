const Utils = require('./utils/utils.js');

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
}

module.exports = ServerInstance;