const Match = require('../match_objects/match');
const Player = require('../game_objects/player.js');

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
            DON_PHASE_ANIMATION_PASSIVEPLAYER_COMPLETE: new WaitFlag("DON_PHASE_ANIMATION_PASSIVEPLAYER_COMPLETE", true, false),

            //PLAY PHASES
            PLAY_PHASE_READY: new WaitFlag("PLAY_PHASE_READY", true, false),
            PLAY_REPLACEMENT_PHASE_READY: new WaitFlag("PLAY_REPLACEMENT_PHASE_READY", true, false),
            PLAY_ON_PLAY_EVENT_PHASE_READY: new WaitFlag("PLAY_ON_PLAY_EVENT_PHASE_READY", true, false),
            PLAY_CLEANUP_PHASE_READY: new WaitFlag("PLAY_CLEANUP_PHASE_READY", true, false),

            //ATTACK PHASES
            ON_ATTACK_EVENT_PHASE_READY: new WaitFlag("ON_ATTACK_EVENT_PHASE_READY", true, false),
            ON_ATTACK_EVENT_PHASE_READY_PASSIVE_PLAYER: new WaitFlag("ON_ATTACK_EVENT_PHASE_READY_PASSIVE_PLAYER", true, false),
            BLOCKER_PHASE_READY: new WaitFlag("BLOCKER_PHASE_READY", true, false),
            BLOCKER_PHASE_READY_PASSIVE_PLAYER: new WaitFlag("BLOCKER_PHASE_READY_PASSIVE_PLAYER", true, false),
            COUNTER_PHASE_READY: new WaitFlag("COUNTER_PHASE_READY", true, true),
            BLOCKER_EVENT_PHASE_READY: new WaitFlag("BLOCKER_EVENT_PHASE_READY", true, true),
            BLOCKER_EVENT_PHASE_READY_PASSIVE_PLAYER: new WaitFlag("BLOCKER_EVENT_PHASE_READY_PASSIVE_PLAYER", true, true),
            RESOLVE_ATTACK_READY: new WaitFlag("RESOLVE_ATTACK_READY", true, true),
            TRIGGER_PHASE_READY: new WaitFlag("TRIGGER_PHASE_READY", true, true),
            TRIGGER_CLEANUP_READY: new WaitFlag("TRIGGER_CLEANUP_READY", true, true),
            ATTACK_CLEANUP_READY: new WaitFlag("ATTACK_CLEANUP_READY", true, true),
            ON_END_OF_ATTACK_READY: new WaitFlag("ON_END_OF_ATTACK_READY", true, true),
            RESUME_TURN_READY: new WaitFlag("RESUME_TURN_READY", true, true),
            RESUME_TURN_READY_PASSIVE_PLAYER: new WaitFlag("RESUME_TURN_READY_PASSIVE_PLAYER", true, true)
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

    /** Function that resets all the flags for the action to false */
    resetActionFlags() {
        for(let flag in this.flags) {
            if(this.flags[flag].isActionBased) this.flags[flag].value = false;
        }
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
                this.match.startDrawPhase();
                break;
            case 'REFRESH_PHASE_ANIMATION_PASSIVEPLAYER_COMPLETE':
                if(player.currentOpponentPlayer.bot) player.currentOpponentPlayer.currentMatchPlayer.matchFlags.setFlag('REFRESH_PHASE_COMPLETE', true);
                this.match.startDrawPhase();
                break;
            case 'DRAW_PHASE_COMPLETE':
                if(player.currentOpponentPlayer.bot) player.currentOpponentPlayer.currentMatchPlayer.matchFlags.setFlag('DRAW_PHASE_ANIMATION_PASSIVEPLAYER_COMPLETE', true);
                this.match.startDonPhase();
                break;
            case 'DRAW_PHASE_ANIMATION_PASSIVEPLAYER_COMPLETE':
                if(player.currentOpponentPlayer.bot) player.currentOpponentPlayer.currentMatchPlayer.matchFlags.setFlag('DRAW_PHASE_COMPLETE', true);
                this.match.startDonPhase();
                break;
            case 'DON_PHASE_COMPLETE':
                if(player.currentOpponentPlayer.bot) player.currentOpponentPlayer.currentMatchPlayer.matchFlags.setFlag('DON_PHASE_ANIMATION_PASSIVEPLAYER_COMPLETE', true);
                this.match.startMainPhase();
                break;
            case 'DON_PHASE_ANIMATION_PASSIVEPLAYER_COMPLETE':
                if(player.currentOpponentPlayer.bot) player.currentOpponentPlayer.currentMatchPlayer.matchFlags.setFlag('DON_PHASE_COMPLETE', true);
                this.match.startMainPhase();
                break;
            case 'PLAY_PHASE_READY':
                this.match.playCardManager.currentPhase = 'PLAY_PHASE_READY';
                this.match.startPlayCard(player, this.match.playCardManager.playedCard.id);
                break;
            case 'PLAY_REPLACEMENT_PHASE_READY':
                this.match.playCardManager.currentPhase = 'PLAY_REPLACEMENT_PHASE_READY';
                this.match.startPlayCard(player, this.match.playCardManager.playedCard.id);
                break;
            case 'PLAY_ON_PLAY_EVENT_PHASE_READY':
                this.match.playCardManager.currentPhase = 'PLAY_ON_PLAY_EVENT_PHASE_READY';
                this.match.startPlayCard(player, this.match.playCardManager.playedCard.id);
                break;
            case 'ON_ATTACK_EVENT_PHASE_READY':
                if(player.currentOpponentPlayer.bot) player.currentOpponentPlayer.currentMatchPlayer.matchFlags.setFlag('ON_ATTACK_EVENT_PHASE_READY_PASSIVE_PLAYER', true);
                this.match.startAttack(player);
                break;
            case 'ON_ATTACK_EVENT_PHASE_READY_PASSIVE_PLAYER':
                if(player.currentOpponentPlayer.bot) player.currentOpponentPlayer.currentMatchPlayer.matchFlags.setFlag('ON_ATTACK_EVENT_PHASE_READY', true);
                this.match.startAttack(player);
                break;
            case 'BLOCKER_PHASE_READY':
                if(player.currentOpponentPlayer.bot) player.currentOpponentPlayer.currentMatchPlayer.matchFlags.setFlag('BLOCKER_PHASE_READY_PASSIVE_PLAYER', true);
                this.match.startAttack(player);
                break;
            case 'BLOCKER_PHASE_READY_PASSIVE_PLAYER':
                if(player.currentOpponentPlayer.bot) player.currentOpponentPlayer.currentMatchPlayer.matchFlags.setFlag('BLOCKER_PHASE_READY', true);
                this.match.startAttack(player);
                break;
            case 'BLOCKER_EVENT_PHASE_READY':
                if(player.currentOpponentPlayer.bot) player.currentOpponentPlayer.currentMatchPlayer.matchFlags.setFlag('BLOCKER_EVENT_PHASE_READY_PASSIVE_PLAYER', true);
                this.match.startAttack(player);
                break;
            case 'BLOCKER_EVENT_PHASE_READY_PASSIVE_PLAYER':
                if(player.currentOpponentPlayer.bot) player.currentOpponentPlayer.currentMatchPlayer.matchFlags.setFlag('BLOCKER_EVENT_PHASE_READY', true);
                this.match.startAttack(player);
                break;
            case 'COUNTER_PHASE_READY':
            case 'RESOLVE_ATTACK_READY':
            case 'TRIGGER_PHASE_READY':
            case 'TRIGGER_CLEANUP_READY':
            case 'ATTACK_CLEANUP_READY':
            case 'ON_END_OF_ATTACK_READY':
            case 'RESUME_TURN_READY':
                this.match.startAttack(player);
                break;
            /*case 'RESUME_TURN_READY':
                if(player.currentOpponentPlayer.bot) player.currentOpponentPlayer.currentMatchPlayer.matchFlags.setFlag('RESUME_TURN_READY_PASSIVE_PLAYER', true);
                this.match.startAttack(player);
                break;*/
            case'RESUME_TURN_READY_PASSIVE_PLAYER':
                if(player.currentOpponentPlayer.bot) player.currentOpponentPlayer.currentMatchPlayer.matchFlags.setFlag('RESUME_TURN_READY', true);
                this.match.startAttack(player);
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