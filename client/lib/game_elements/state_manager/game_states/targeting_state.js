class TargetingState extends GameState {

    constructor(scene) {
        super(scene, GAME_STATES.TARGETING);
    }

    enter() {
        super.enter();
        this.scene.gameStateUI.nextTurnbutton.fsmState.exit(NEXT_TURN_BUTTON_FSM_STATES.CANCEL);
    }

    onPointerOver(pointer, gameObject) {
        gameObject.fsmState.onPointerOver(pointer, gameObject);
    }

    onPointerOut(pointer, gameObject) {
        gameObject.fsmState.onPointerOut(pointer, gameObject);
    }
    
    onPointerDown(pointer, gameObject) {
        if(pointer.rightButtonDown()) {
            this.scene.actionLibrary.cancelTargetingAction();
        } else {
            if(gameObject === this.scene.gameStateUI.nextTurnbutton) this.scene.gameStateUI.nextTurnbutton.fsmState.onPointerDown(pointer, gameObject);
            if(gameObject instanceof GameCardUI) this.scene.targetManager.addTarget(gameObject);
        }
    }

    update() {
        if(this.scene.targetingArrow.isTargeting) {
            this.scene.targetingArrow.update(this.scene.input.mousePointer.x, this.scene.input.mousePointer.y);
        }

        //Update all cards in the hand to reflect if they can take an action
        for(let card of this.scene.activePlayerScene.characterArea.cards) card.fsmState.isValidTarget();
        for(let card of this.scene.activePlayerScene.leaderLocation.cards) card.fsmState.isValidTarget();
        for(let card of this.scene.activePlayerScene.stageLocation.cards) card.fsmState.isValidTarget();
    }

    exit(newState) {
        this.scene.gameStateUI.nextTurnbutton.fsmState.exit(NEXT_TURN_BUTTON_FSM_STATES.ACTIVE);
        super.exit(newState); 
    }
}