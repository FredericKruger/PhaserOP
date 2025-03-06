//#region ATTACK CLASS
class Attack {

    /** Constructor 
     * @param {AttackManager} attackManager
     * @param {GameCardUI} attacker
     * @param {GameCardUI} defender
    */
    constructor(attackManager,  attacker, defender) {
        this.attackManager = attackManager;
        this.attacker = attacker;
        this.defender = defender;

        this.attacker.state = CARD_STATES.IN_PLAY_ATTACKING;
        this.defender.state = CARD_STATES.IN_PLAY_DEFENDING;
    }

    /** Function to set the defender of the attack
     * @param {GameCardUI} attacker - defender of the attack
     */
    setAttacker(attacker) {this.attacker = attacker;}

    /** Function to set the defender of the attack
     * @param {GameCardUI} defender - defender of the attack
     */
    setDefender(defender) {this.defender = defender;}

    /** Function to switch defenders
     * @param {GameCardUI} defender - defender of the attack
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
     * @param {GameScene} matchState
     * @param {GameCardUI} attacker
     * @param {GameCardUI} defender
     */
    constructor(scene, attacker, defender) {
        this.scene = scene;
        this.attack = new Attack(this, attacker, defender);
    }

}

//#endregion