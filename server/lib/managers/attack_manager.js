const { CARD_STATES } = require('../match_objects/match_card');

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

        this.counterPlayed = false;

        this.attacker.state = CARD_STATES.IN_PLAY_ATTACKING;
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
        this.defender.state = CARD_STATES.IN_PLAY;
        this.defender = defender;
        this.defender.state = CARD_STATES.IN_PLAY_DEFENDING;
    }
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

        /** @type {Attack} */
        this.attack = new Attack(this, attacker, defender);
    }

}

//#endregion

module.exports = {
    AttackManager: AttackManager,
    Attack: Attack
};