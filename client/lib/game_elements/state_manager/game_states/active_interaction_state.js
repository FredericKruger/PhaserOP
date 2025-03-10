class ActiveInteractionState extends GameState {

    /** Constructor
     * @param {GameScene} scene - The scene that the game state is in
     * @param {string} previousState - The previous game state
     */
    constructor(scene, previousState) {
        super(scene, GAME_STATES.ACTIVE_INTERACTION, previousState);
    }

    onPointerOver(pointer, gameObject) {
        gameObject.fsmState.onPointerOver(pointer, gameObject);
    }

    onPointerOut(pointer, gameObject) {
        gameObject.fsmState.onPointerOut(pointer, gameObject);
    }

    onDragStart(pointer, gameObject) {
        //Issue that dragstart is triggered before pointerdown in the call stack so need barrierer
        if(gameObject.fsmState.name === GAME_CARD_STATES.IN_HAND || gameObject.fsmState.name === DON_CARD_STATES.ACTIVE) {
            gameObject.fsmState.onDragStart(pointer, gameObject);
            this.exit(GAME_STATES.DRAGGING);
        }
    }

    onPointerDown(pointer, gameObject) {
        if(gameObject === this.scene.gameStateUI.nextTurnbutton) this.scene.gameStateUI.nextTurnbutton.fsmState.onPointerDown(pointer, gameObject);
        else if(gameObject instanceof GameCardUI) gameObject.fsmState.onPointerDown(pointer, gameObject);
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