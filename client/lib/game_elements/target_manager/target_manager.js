class TargetManager {

    /** Constructor
     * @param {GameScene} scene - The game scene
     */
    constructor(scene) {
        this.scene = scene;

        this.targetData = {};
        this.targetAction = null;
        this.targets = [];
        this.targetIDs = [];
    }

    /** Function that prepares the target from the server data
     * @param {Object} targetData - The target data from the server
     */
    loadFromTargetData(targetData) {
        this.targetData = targetData;
        this.targetAction = targetData.targetAction;
        for(let el of targetData.targets)
            this.targets.push(new Target(el));
    }


    /** Function to test if a card is valid for any target
     * @param {GameCardUI} card - The card to test
     */
    isValidTarget(card) {
        let isValid = false;

        for (let target of this.targets) {
            isValid = isValid || target.isValidTarget(card);
        }

        return isValid;
    }

    /** Resets the object */
    reset() {
        this.targetAction = null;
        this.targets = [];
        this.targetIDs = [];
    }
}