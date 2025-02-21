const Match = require('../match_objects/match');
const Player = require('./player.js');

class WaitFlag {

    /** Constructor
     * @param {string} flag - The flag to be set
     * @param {boolean} isTurnBased - If the flag is turn based
     * @param {boolean} isActionBased - If the flag is action based
     */
    constructor(flag, isTurnBased, isActionBased) {
        /** @type {boolean} */
        this.value = false;
        /** @type {string} */
        this.flag = flag;

        /** @type {boolean} */
        this.isActionBased = isActionBased;
        /** @type {boolean} */
        this.isTurnBased = isTurnBased
    }
}

class MatchFlags {

    /** Constructor */
    constructor() {
        this.flags = {
            READY_SETUP: new WaitFlag("READY_SETUP", false, false),
            
            READY_MULLIGAN: new WaitFlag("READY_MULLIGAN", false, false),
            MULLIGAN_SWAPPED_CARDS: new WaitFlag("MULLIGAN_SWAPPED_CARDS", false, false),
            MULLIGAN_ANIMATION_PASSIVEPLAYER_OVER: new WaitFlag("MULLIGAN_ANIMATION_PASSIVEPLAYER_OVER", false, false),
            MULLIGAN_OVER: new WaitFlag("MULLIGAN_OVER", false, false),
            
            READY_FIRST_TURN_STEP: new WaitFlag("READY_FIRST_TURN_STEP", false, false),
            FIRST_TURN_PREP_COMPLETE: new WaitFlag("FIRST_TURN_PREP_COMPLETE", false, false),
            FIRST_TURN_PREP_ANIMATION_PASSIVEPLAYER_COMPLETE: new WaitFlag("FIRST_TURN_PREP_ANIMATION_PASSIVEPLAYER_COMPLETE", false, false),

            REFRESH_PHASE_COMPLETE: new WaitFlag("REFRESH_PHASE_COMPLETE", true, false),
            REFRESH_PHASE_ANIMATION_PASSIVEPLAYER_COMPLETE: new WaitFlag("REFRESH_PHASE_ANIMATION_PASSIVEPLAYER_COMPLETE", true, false),

            DRAW_PHASE_COMPLETE: new WaitFlag("DRAW_PHASE_COMPLETE", true, false),
            DRAW_PHASE_ANIMATION_PASSIVEPLAYER_COMPLETE: new WaitFlag("DRAW_PHASE_ANIMATION_PASSIVEPLAYER_COMPLETE", true, false),
            
            DON_PHASE_COMPLETE: new WaitFlag("DON_PHASE_COMPLETE", true, false),
            DON_PHASE_ANIMATION_PASSIVEPLAYER_COMPLETE: new WaitFlag("DON_PHASE_ANIMATION_PASSIVEPLAYER_COMPLETE", true, false)
        }   
    }

    /** Function that sets the flag to the corresponding value
     * @param {string} flag - The flag to be set
     * @param {boolean} value - The value to be set
     */
    setFlag(flag, value) {
        this.flags[flag].value = value;
    }

    /** Function that retrieves the value of given flag
     * @param {string} flag - The flag to be retrieved
     */
    getFlag(flag) {
        return this.flags[flag].value;
    }

    /** Function that resets all the flags for the turn to false */
    resetTurnFlags() {
        for(let flag in this.flags) {
            if(this.flags[flag].isTurnBased) this.flags[flag].value = false;
        }
    }
}

class FlagManager {

    /** Constructor
     * @param {Match} match - The match to be managed
     */
    constructor(match) {
        /** @type {Match} */
        this.match = match;
    }

    /** Function that sets a flag
     * @param {Player} player - The player that sets the flag
     * @param {WaitFlag} flag - The flag to be set
     * @param {Object} args - Arguments for the flag
     */
    handleFlag(player, flag, args = {}) {
        player.currentMatchPlayer.matchFlags.setFlag(flag, true);
        if(player.currentOpponentPlayer.bot) player.currentOpponentPlayer.currentMatchPlayer.matchFlags.setFlag(flag, true);
                
        switch (flag) {
            case 'READY_SETUP':
                this.match.startSetup(player);
                break;
            case 'READY_MULLIGAN':
                this.match.startMulliganPhase(player);
                break;  
            case 'MULLIGAN_SWAPPED_CARDS':
                this.match.mulliganCards(player, args.cards);
                break;
            case 'MULLIGAN_OVER':
            case 'MULLIGAN_ANIMATION_PASSIVEPLAYER_OVER':
                this.match.endMulliganPhase();
                break;
            case 'READY_FIRST_TURN_STEP':
                this.match.firstTurnSetup(player);
                break;
            case 'FIRST_TURN_PREP_COMPLETE':
            case 'FIRST_TURN_PREP_ANIMATION_PASSIVEPLAYER_COMPLETE':
                this.match.endFirstTurnSetup();
                break;
            case 'REFRESH_PHASE_COMPLETE':
                if(player.currentOpponentPlayer.bot) player.currentOpponentPlayer.currentMatchPlayer.matchFlags.setFlag('REFRESH_PHASE_ANIMATION_PASSIVEPLAYER_COMPLETE', true);
            case 'REFRESH_PHASE_ANIMATION_PASSIVEPLAYER_COMPLETE':
                this.match.startDrawPhase();
                break;
            case 'DRAW_PHASE_COMPLETE':
                if(player.currentOpponentPlayer.bot) player.currentOpponentPlayer.currentMatchPlayer.matchFlags.setFlag('DRAW_PHASE_ANIMATION_PASSIVEPLAYER_COMPLETE', true);
            case 'DRAW_PHASE_ANIMATION_PASSIVEPLAYER_COMPLETE':
                this.match.startDonPhase();
                break;
            case 'DON_PHASE_COMPLETE':
                if(player.currentOpponentPlayer.bot) player.currentOpponentPlayer.currentMatchPlayer.matchFlags.setFlag('DON_PHASE_ANIMATION_PASSIVEPLAYER_COMPLETE', true);
            case 'DON_PHASE_ANIMATION_PASSIVEPLAYER_COMPLETE':
                this.match.startMainPhase();
                break;
        }
    }

    /** Check if all flags a true
     * @param {Array<string>} flags - The flags to be checked
     */
    checkFlags(flags) {
        let flagValues = []

        for(let flag of flags) {
            let value = this.match.player1.currentMatchPlayer.matchFlags.getFlag(flag) && this.match.player2.currentMatchPlayer.matchFlags.getFlag(flag);
            flagValues.push(value);
        }

        let result = flagValues.every(v => v === true);
        return result;
    }

    /** Gets flag value for a specific flag for a specific player 
     * @param {string} flag - The flag to be checked
     * @param {Player} player - The player to be checked
    */
    checkFlag(flag, player) {
        return player.currentMatchPlayer.matchFlags.getFlag(flag);
    }

}

module.exports = {
    FlagManager: FlagManager,
    WaitFlag: WaitFlag,
    MatchFlags: MatchFlags
};