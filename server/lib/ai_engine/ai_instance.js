const ServerInstance = require("../server_instance");
const Match = require("../match_objects/match");

class AI_Instance {

    /**
     * 
     * @param {ServerInstance} server 
     * @param {Match} match 
     */
    constructor(server, match) {
        this.server = server;
        this.match = match;
        this.matchPlayer = match.state.player2;
    }

}

module.exports = AI_Instance;