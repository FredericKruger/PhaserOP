class OnAttackEventInteractionState extends GameState {

    /** Constructor
     * @param {GameScene} scene - The scene that the game state is in
     * @param {string} previousState - The previous game state
     */
    constructor(scene, previousState) {
        super(scene, GAME_STATES.ON_ATTACK_EVENT_INTERACTION, previousState);
    }

    enter() {
        super.enter();
        this.scene.gameStateUI.nextTurnbutton.fsmState.exit(NEXT_TURN_BUTTON_FSM_STATES.ON_ATTACK_EVENT);
    }

    onPointerOver(pointer, gameObject) {
        if(gameObject instanceof GameCardUI) gameObject.fsmState.onPointerOver(pointer, gameObject);
    }

    onPointerOut(pointer, gameObject) {
        if(gameObject instanceof GameCardUI) gameObject.fsmState.onPointerOut(pointer, gameObject);
    }

    onPointerDown(pointer, gameObject) {
        if(gameObject === this.scene.gameStateUI.nextTurnbutton) this.scene.gameStateUI.nextTurnbutton.fsmState.onPointerDown(pointer, gameObject);
        else if(gameObject === this.scene.gameStateUI.surrenderButton) this.scene.gameStateManager.askForSurrender();
        else if(gameObject instanceof AbilityButton && gameObject.type === "WHEN_ATTACKING") gameObject.onPointerDown();
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