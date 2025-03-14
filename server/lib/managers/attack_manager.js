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

        this.blockPhase_Complete = false;
        this.counterPhase_Complete = false;
        this.resolveAttack_Complete = false;
        this.attackCleanup_Complete = false;
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
            else if(this.attack.defender.cardData.card === CARD_TYPES.LEADER) attackResult.lostLeaderLife = true;
        }

        return attackResult;
    }

}

//#endregion

module.exports = {
    AttackManager: AttackManager,
    Attack: Attack
};