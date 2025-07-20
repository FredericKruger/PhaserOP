const { CARD_STATES } = require('../match_objects/match_card');
const { CARD_TYPES } = require('../match_objects/match_enums');
const MatchPlayer = require('../match_objects/match_player');

const MatchCard = require('../match_objects/match_card').MatchCard;

//#region ATTACK CLASS
class Attack {

    /** Constructor 
     * @param {MatchCard} attacker
     * @param {MatchCard} defender
     * @param {MatchPlayer} attackingPlayer
     * @param {MatchPlayer} defendingPlayer
    */
    constructor(attacker, defender, attackingPlayer, defendingPlayer) {
        /** @type {MatchCard} */
        this.attacker = attacker;
        /** @type {MatchCard} */
        this.defender = defender;

        /** @type {MatchPlayer} */
        this.attackingPlayer = attackingPlayer
        this.defendingPlayer = defendingPlayer

        /** @type {boolean} */
        this.counterPlayed = false;
        /** @type {boolean} */
        this.blocked = false;

        this.attacker.state = CARD_STATES.IN_PLAY_ATTACKING;

        this.defender.previousState = this.defender.state;
        this.defender.state = CARD_STATES.IN_PLAY_DEFENDING;
    }

    /** Function to set the defender of the attack
     * @param {MatchCard} attacker - defender of the attack
     */
    setAttacker(attacker) {this.attacker = attacker;}

    /** Function to set the defender of the attack
     * @param {MatchCard} defender - defender of the attack
     */
    setDefender(defender) {this.defender = defender;}

    /** Function to switch defenders
     * @param {MatchCard} defender - defender of the attack
     */
    switchDefender(defender) {
        this.defender.state = this.defender.previousState;
        this.defender = defender;
        
        this.defender.previousState = CARD_STATES.IN_PLAY_RESTED; //If card blocked it will go back to rested
        this.defender.state = CARD_STATES.IN_PLAY_DEFENDING;
        this.blocked = true;
    }


}
//#endregion

//#region ATTACK MANAGER CLASS
class AttackManager {

    /** Constructor
     * @param {MatchState} matchState
     * @param {MatchCard} attacker
     * @param {MatchCard} defender
     * @param {MatchPlayer} attackingPlayer
     * @param {MatchPlayer} defendingPlayer
     */
    constructor(matchState, attacker, defender, attackingPlayer, defendingPlayer) {
        this.matchState = matchState;

        /** @type {Attack} */
        this.attack = new Attack(attacker, defender, attackingPlayer, defendingPlayer);

        this.attackResults = null;

        this.onAttackEventPhase_Complete = false;
        this.blockPhase_Complete = false;
        this.counterPhase_Complete = false;
        this.onblockEventPhase_Complete = false;
        this.resolveAttack_Complete = false;
        this.trigger_Complete = false;
        this.triggerCleanup_Complete = false;
        this.attackCleanup_Complete = false;
        this.onEndOfAttack_Complete = false;
        this.resumeTurn_Complete = false;
        this.cancelAttack_Complete = false;

        this.debugTest = true;
    }

    /** Function to resolve the attack
     * @returns {Object}
     */
    resolveAttack() {
        const attackerPower = this.attack.attacker.getPower(true);
        const defenderPower = this.attack.defender.getPower(false);

        let attackResult = {
            defenderDestroyed: false,
            lostLeaderLife: false
        };

        //Check if the attack was successful from the attacker perspective
        if(attackerPower >= defenderPower) {
            if(this.attack.defender.cardData.card === CARD_TYPES.CHARACTER) attackResult.defenderDestroyed = true;
            else if(this.attack.defender.cardData.card === CARD_TYPES.LEADER) {
                this.attack.defendingPlayer.life--;
                attackResult.lostLeaderLife = true;
            }
        }

        return attackResult;
    }

    /** Function that verifies if the attack is still going ahead
     * Condition is that attacker and defender still have to be in the their respective character areas and in the right state
     * @returns {boolean}
     */
    verifyAttackStillValid() {       
        //Check is the card are still in the right locations
        if(!this.debugTest) return this.debugTest;

        if(!this.attack.attackingPlayer.characterAreaContains(this.attack.attacker) 
            && !this.attack.attackingPlayer.leaderLocationContains(this.attack.attacker)) 
            return false;

        if(!this.attack.defendingPlayer.characterAreaContains(this.attack.defender) 
            && !this.attack.defendingPlayer.leaderLocationContains(this.attack.defender)) 
            return false;

        return true;
    }

}

//#endregion

module.exports = {
    AttackManager: AttackManager,
    Attack: Attack
};