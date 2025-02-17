const Match = require('./match')
const MatchPlayer = require('./match_player')

const MATCH_PHASES = Object.freeze({
    WAITING_TO_START: 'WAITING_TO_START',
})

class MatchState {

    /**
     * Constructor on the Match State class
     * @param {Match} match 
     */
    constructor(match) {
        this.match = match;

        this.current_player_turn = null;
        this.current_phase = MATCH_PHASES.WAITING_TO_START;

        this.player1 = new MatchPlayer();
        this.player2 = new MatchPlayer();
    }
}

module.exports = {
    MATCH_PHASES: MATCH_PHASES,
    MatchState: MatchState
};