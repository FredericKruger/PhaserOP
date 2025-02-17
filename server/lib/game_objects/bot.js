const ServerInstance = require("../server_instance");

class Bot {

    /** Constructor
     * @param {ServerInstance} serverInstance - The server instance
     */
    constructor(serverInstance) {
        this.id = serverInstance.lastBotID++;
        this.name = "BOT" + this.id.toString();
        
        this.inMatch = false;
        this.waitingForMatch = false;

        this.match = null;
        this.bot = true;

        this.deck = null;
        this.ready = true;

        serverInstance.bots.push(this);
    }

    leave_match() {
        this.match = null;
    }

}

module.exports = Bot;