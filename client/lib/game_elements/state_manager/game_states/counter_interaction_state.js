class CounterInteractionState extends GameState {

    /** Constructor
     * @param {GameScene} scene - The scene that the game state is in
     */
    constructor(scene) {
        super(scene, GAME_STATES.COUNTER_INTERACTION);
    }

    onPointerOver(pointer, gameObject) {
        gameObject.fsmState.onPointerOver(pointer, gameObject);
    }

    onPointerOut(pointer, gameObject) {
        gameObject.fsmState.onPointerOut(pointer, gameObject);
    }

    onDragStart(pointer, gameObject) {
        gameObject.fsmState.onDragStart(pointer, gameObject);
    }

    onDrag(pointer, gameObject, dragX, dragY) {
        gameObject.fsmState.onDrag(pointer, gameObject, dragX, dragY);
    }

    onDragEnd(pointer, gameObject, dropped) {
        gameObject.fsmState.onDragEnd(pointer, gameObject, dropped);
    }

    onDrop(pointer, gameObject, dropZone) {
        gameObject.fsmState.onDrop(pointer, gameObject, dropZone);
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