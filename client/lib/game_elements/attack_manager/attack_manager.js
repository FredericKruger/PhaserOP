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

        this.attacker.previousState = this.attacker.state;
        this.defender.previousState = this.defender.state;

        this.attacker.setState(CARD_STATES.IN_PLAY_ATTACKING);
        this.defender.setState(CARD_STATES.IN_PLAY_DEFENDING);
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
        this.defender.setState(this.defender.previousState); //FIXME: This should be EXERTED or else not attackable
        this.defender = defender;
        this.defender.previousState = this.defender.state;
        this.defender.setState(CARD_STATES.IN_PLAY_BLOCKING);
        this.defender.angleTo(-90, true, false, false); //Play exert
    }
}
//#endregion

//#region ATTACK MANAGER CLASS
class AttackManager {

    /** Constructor
     * @param {GameScene} matchState
     * @param {GameCardUI} attacker
     * @param {GameCardUI} defender
     * @param {TargetManager} targetingManager
     */
    constructor(scene, attacker, defender, targetingManager) {
        this.scene = scene;
        this.attack = new Attack(this, attacker, defender);
        this.targetingManager = targetingManager;
    }

}

//#endregion