const MatchCard = require('../match_objects/match_card').MatchCard;

//#region ATTACK CLASS
class Attack {

    /** Constructor 
     * @param {AttackManager} attackManager
     * @param {MatchCard} attacker
     * @param {MatchCard} defender
    */
    constructor(attackManager,  attacker, defender) {
        this.attackManager = attackManager;
        this.attacker = attacker;
        this.defender = defender;
    }

    /** Function to set the defender of the attack
     * @param {MatchCard} attacker - defender of the attack
     */
    setAttacker(attacker) {this.attacker = attacker;}

    /** Function to set the defender of the attack
     * @param {MatchCard} defender - defender of the attack
     */
    setDefender(defender) {this.defender = defender;}
}
//#endregion

//#region ATTACK MANAGER CLASS
class AttackManager {

    /** Constructor
     * @param {MatchState} matchState
     * @param {MatchCard} attacker
     * @param {MatchCard} defender
     */
    constructor(matchState, attacker, defender) {
        this.matchState = matchState;

        this.attack = new Attack(this, attacker, defender);
    }

}

//#endregion

module.exports = {
    AttackManager: AttackManager,
    Attack: Attack
};