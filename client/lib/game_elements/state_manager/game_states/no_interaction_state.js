class NoInteractionState extends GameState {

    /** Constructor
     * @param {GameScene} scene - The scene that the game state is in
     * @param {string} previousState - The previous game state
     */
    constructor(scene, previousState) {
        super(scene, GAME_STATES.NO_INTERACTION, previousState);
    }
}