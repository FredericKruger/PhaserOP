class PassiveInteractionState extends GameState {

    /** Constructor
     * @param {GameScene} scene - The scene that the game state is in
     */
    constructor(scene) {
        super(scene, GAME_STATES.PASSIVE_INTERACTION);
    }

    onPointerOver(pointer, gameObject) {
        gameObject.fsmState.onPointerOver(pointer, gameObject);
    }

    onPointerOut(pointer, gameObject) {
        gameObject.fsmState.onPointerOut(pointer, gameObject);
    }
}