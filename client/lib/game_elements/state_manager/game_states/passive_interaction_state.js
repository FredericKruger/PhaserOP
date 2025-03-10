class PassiveInteractionState extends GameState {

    /** Constructor
     * @param {GameScene} scene - The scene that the game state is in
     * @param {string} previousState - The previous game state
     */
    constructor(scene, previousState) {
        super(scene, GAME_STATES.PASSIVE_INTERACTION, previousState);
    }

    onPointerOver(pointer, gameObject) {
        gameObject.fsmState.onPointerOver(pointer, gameObject);
    }

    onPointerOut(pointer, gameObject) {
        gameObject.fsmState.onPointerOut(pointer, gameObject);
    }

    update() {
        //Update all cards in the hand to reflect if they can take an action
        for(let card of this.scene.activePlayerScene.hand.cards) card.fsmState.update(); 
        for(let card of this.scene.activePlayerScene.characterArea.cards) card.fsmState.update();
        for(let card of this.scene.activePlayerScene.leaderLocation.cards) card.fsmState.update();
        for(let card of this.scene.activePlayerScene.stageLocation.cards) card.fsmState.update();

        //Update all cards in the hand to reflect if they can take an action
        for(let card of this.scene.passivePlayerScene.characterArea.cards) card.fsmState.update();
        for(let card of this.scene.passivePlayerScene.leaderLocation.cards) card.fsmState.update();
        for(let card of this.scene.passivePlayerScene.stageLocation.cards) card.fsmState.update();
    }
}