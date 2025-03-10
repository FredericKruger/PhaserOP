class TargetManager {

    /** Constructor
     * @param {GameScene} scene - The game scene
     */
    constructor(scene) {
        this.scene = scene;

        this.originatorCard = null; //Store the reference to the card triggered the targeting
        this.targetData = {};
        this.targetAction = null;
        this.requiredTargets = 0;
        this.targets = [];
        this.targetIDs = [];
    }

    /** Function that prepares the target from the server data
     * @param {Object} targetData - The target data from the server
     */
    loadFromTargetData(targetData) {
        this.targetData = targetData;
        this.targetAction = targetData.targetAction;
        this.requiredTargets = targetData.requiredTargets;
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
            if(isValid) return {isValid, target};
        }

        return {isValid, target: null};
    }

    /** Function to add a card to the target 
     * @param {GameCardUI} card - The card to add
    */
    addTarget(card) {
        let isValid = this.isValidTarget(card); //Test if the card is valid for any target
        
        this.targetIDs.push(card.id);
        this.targets.splice(this.targets.indexOf(isValid.target), 1);
        //} else {
            //this.scene.animationLibrary.shakingAnimation(card); //Create a little animation to show it's not a right target
            //TODO find small animation that shows it's not a right target (maybe a sound like MURI)
        //}

        //If all targets are selected, send the targets to the server
        if(this.targetIDs.length === this.requiredTargets) {
            this.scene.game.gameClient.requestSendTargets(this.targetIDs);
        }
    }

    /** Reset Target IDs */
    resetTargetIDs() {
        this.targetIDs = [];
    }

    /** Resets the object */
    reset() {
        this.originatorCard = null;
        this.targetAction = null;
        this.targets = [];
        this.targetIDs = [];
    }
}