class TargetManager {

    /** Constructor
     * @param {GameScene} scene - The game scene
     * @param {string} type - The type of the target manager (target, attack, block, etc.)
     * @param {string} id - The id of the target manager
     */
    constructor(scene, type, id, originatorCard, active = true) {
        this.scene = scene;
        this.type = type;
        this.id = id;

        this.active = active; //Is the target active
        this.waitingForServer = false;
        this.canCancel = true; //Can the target be cancelled

        this.originatorCard = originatorCard; //Store the reference to the card triggered the targeting
        this.targetData = {};
        this.targetAction = null;
        this.requiredTargets = 0;
        /** @type {Array<Target>} */
        this.targets = [];
        this.targetIDs = [];

        //determine targeting arrow color depending on type
        let color = COLOR_ENUMS.OP_WHITE; //Green
        if(type === 'ATTACK') color = COLOR_ENUMS.OP_RED; //Red
        else if(type === 'EVENT') color = COLOR_ENUMS.OP_GREEN; //Blue
        else if(type === 'PLAY') color = COLOR_ENUMS.OP_BLUE; //Blue

        //Attach targeting Arrow to target manager
        this.targetArrow = new TargetingArrow(this.scene, color); //Target arrow
        if(type !== 'AURA') this.targetArrow.create();
    }

    /** Function that prepares the target from the server data
     * @param {Object} targetData - The target data from the server
     */
    loadFromTargetData(targetData) {
        this.targetData = targetData;
        this.targetAction = targetData.targetAction;
        this.requiredTargets = targetData.requiredTargets;
        for(let el of targetData.targets)
            this.targets.push(new Target(el, this));
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
        if(this.targetIDs.length === this.requiredTargets && !this.waitingForServer) {
            this.waitingForServer = true;
            this.scene.game.gameClient.requestSendTargets(this.targetIDs);
        }
    }

    /** Reset Target IDs */
    resetTargetIDs() {
        this.targetIDs = [];
        this.waitingForServer = false;
    }

    /** Resets the object */
    reset() {
        this.originatorCard = null;
        this.targetAction = null;
        this.targets = [];
        this.targetIDs = [];
    }
}