class ActiveInteractionState extends GameState {

    /** Constructor
     * @param {GameScene} scene - The scene that the game state is in
     */
    constructor(scene) {
        super(scene, GAME_STATES.ACTIVE_INTERACTION);
    }

    onPointerOver(pointer, gameObject) {
        gameObject.fsmState.onPointerOver(pointer, gameObject);
    }

    onPointerOut(pointer, gameObject) {
        gameObject.fsmState.onPointerOut(pointer, gameObject);
    }

    onDragStart(pointer, gameObject) {
        gameObject.fsmState.onDragStart(pointer, gameObject);
        this.exit(GAME_STATES.DRAGGING);
    }
}