class TargetingState extends GameState {

    constructor(scene) {
        super(scene, GAME_STATES.TARGETING);
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
}