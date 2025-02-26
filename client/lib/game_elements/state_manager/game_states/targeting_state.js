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

    update() {
        if(this.scene.targetingArrow.isTargeting) {
            this.scene.targetingArrow.update(this.scene.input.mousePointer.x, this.scene.input.mousePointer.y);
        }
    }
}