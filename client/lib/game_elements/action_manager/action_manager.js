/** Object that store the action elements */
class Action {
    constructor() {
        this.start = null; //callback function to be executed at the beginning of the action
        this.start_animation = null; //animation to be played between the start and the end. Needs to call 'completeAction' to perform
        this.end = null; //callback function to be executed at the end of the action
        this.end_animation = null; //animation to be played between the end and the final. Nees to call 'finalizeAction' to perform
        this.finally = null; //callback function be executed right before changing action
        this.isPlayerAction = true; //flag to signals if a delay needs to be respected before starting the next action
        this.waitForAnimationToComplete = true; //flag to signal wether the end function should wait the end of the animation. Requires the animation to call 'completeAction'
        this.switchEventTriggered = false; //flag to signal wether the start of the next action will be event triggered
        this.name = ''; //Name of the action for debugging purposes
        this.hasMoreEvents = false;
    }
}

/** Class that manages action and server stacks and store player specific actions */
class ActionManager {

    /** Constructor
     * @param {GameScene} scene - Parent Duel scene
     */    
    constructor(scene) {
        this.scene = scene;

        this.actionStack = []; //To store the incomming actions to be executed in order
        this.isExecutingAction = false; //flag to signal weither an action is currently being executed
        this.currentAction = null; //stores the current action being executed
    }

    /** Adds an action to the stack and start executing if no other action is currently being executed 
     * @param {Action} action - action to be added to the action stack
    */
    addAction(action) {
        this.actionStack.push(action);

        if(!this.isExecutingAction && this.actionStack.length===1) this.executeAction();
    }

    /** Function that executes the action
     * Pops the first action and sets it as current action
     * Sets flags
     * Executes start function if provided
     * Start Animation if provided
     * If waitForAnimation flag is false, start animation is provided and jump to the completeAction functon
     */
    executeAction() {
        //Only execute the next action if no other action is being executed, if there are actions left in the stack and the game isnt over
        if(/*!this.scene.gameManager.gameOver &&*/ !this.isExecutingAction && this.actionStack.length > 0){
            this.currentAction = this.actionStack.shift();
            this.isExecutingAction = true;

            //if(this.currentAction.name) console.log("Executing Action " + this.currentAction.name);
    
            //First execute the start part of the action
            if(this.currentAction.start !== null) this.currentAction.start();
    
            //Then execute the animation
            if(this.currentAction.waitForAnimationToComplete) {
                if(this.currentAction.start_animation !== null) this.scene.animationManager.addAnimation({animation: this.currentAction.start_animation, delay: 0});
            } else {
                if(this.currentAction.start_animation !== null) this.currentAction.start_animation.restart();
                this.completeAction();
            }  
        }
    }

    /** Function executed once the animation is finished. Needs to be called from the animation
     * Calls the end function
     * resets action manager variables
     * Starts next action with a delay if current player is the opponent
     */
    completeAction() {
        if(this.currentAction.end !== null) this.currentAction.end();
        
        if(this.currentAction !== null && !this.currentAction.switchEventTriggered) { //can be null if already finished he action previously through event

            this.triggerCompleteAction();
            /*if(this.currentAction.finally !== null) this.currentAction.finally();

            this.currentAction = null;
            this.isExecutingAction = false;

            this.scene.time.delayedCall(delay, this.executeAction, null, this);*/
        }
    }

    /** Function executed bu the triggereing of an event
     * 
     */
    triggerCompleteAction() {
        if(this.currentAction.waitForAnimationToComplete && this.currentAction.end_animation !== null) {
            this.scene.animationManager.addAnimation({animation: this.currentAction.end_animation, delay: 0});
        } else {
            if(this.currentAction.end_animation !== null) this.currentAction.end_animation.restart();
            this.finalizeAction();
        } 
        /*let delay = 500;
        if(this.currentAction.isPlayerAction) delay = 0;

        if(this.currentAction.finally !== null) this.currentAction.finally();

        this.currentAction = null;
        this.isExecutingAction = false;

        this.scene.time.delayedCall(delay, this.executeAction, null, this);*/
    }

    /** Function exected once the animation2 is finished. Needs to be calleds from animation2 */
    finalizeAction() {
        let delay = 500;
        if(this.currentAction.isPlayerAction) delay = 0;

        if(this.currentAction.finally !== null) this.currentAction.finally();

        //if(this.currentAction.name) console.log("Finishing Action " + this.currentAction.name);

        this.currentAction = null;
        this.isExecutingAction = false;

        this.scene.time.delayedCall(delay, this.executeAction, null, this);
    }
}