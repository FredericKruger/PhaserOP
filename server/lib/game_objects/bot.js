const Match = require("../match_objects/match");
const ServerInstance = require("../server_instance");

class Bot {

    /** Constructor
     * @param {ServerInstance} serverInstance - The server instance
     */
    constructor(serverInstance) {
        /** @type {number} */
        this.id = serverInstance.lastBotID++;
        /** @type {string} */
        this.name = "BOT" + this.id.toString();
        /** @type {string} */
        this.playerReference = "B" + this.id.toString();
        
        /** @type {boolean} */
        this.inMatch = false;
        /** @type {boolean} */
        this.waitingForMatch = false;

        /** @type {Match} */
        this.match = null;
        /** @type {boolean} */
        this.bot = true;

        this.deck = null;
        /** @type {boolean} */
        this.ready = true;

        serverInstance.bots.push(this);
    }

    /** Function that makes the bot leave a match */
    leave_match() {
        this.match = null;
    }

}

module.exports = Bot;