class DraggingState extends GameState {
    /** Constructor
     * @param {GameScene} scene - The scene that the game state is in
     */
    constructor(scene) {
        super(scene, GAME_STATES.DRAGGING);
    }

    onDrag(pointer, gameObject, dragX, dragY) {
        gameObject.fsmState.onDrag(pointer, gameObject, dragX, dragY);
    }

    onDragEnd(pointer, gameObject, dropped) {
        gameObject.fsmState.onDragEnd(pointer, gameObject, dropped);
        this.exit(GAME_STATES.ACTIVE_INTERACTION);
    }

    onDrop(pointer, gameObject, dropZone) {
        gameObject.fsmState.onDrop(pointer, gameObject, dropZone);
        this.exit(GAME_STATES.ACTIVE_INTERACTION);
    }

    update() {}
}