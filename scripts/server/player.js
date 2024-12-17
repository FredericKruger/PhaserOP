class Player {
    constructor(socket, server, username) {
        this.id = server.lastPlayerID++;
        this.name = username;
        this.inMatch = false;
        this.waitingForMatch = false;
        this.selectedDeck = 0;
        this.spectating = false;
        this.match = null;
        this.bot = false;
        this.socket = socket;
    }

    leave_match() { this.match = null; }
}

module.exports = Player;