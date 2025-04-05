const GAME_STATES = Object.freeze({
    NO_INTERACTION: 'NO_INTERACTION',
    ACTIVE_INTERACTION: 'ACTIVE_INTERACTION',
    PASSIVE_INTERACTION: 'PASSIVE_INTERACTION',
    ON_ATTACK_EVENT_INTERACTION: 'ON_ATTACK_EVENT_INTERACTION',
    ON_PLAY_EVENT_INTERACTION: 'ON_PLAY_EVENT_INTERACTION',
    BLOCKER_INTERACTION: 'BLOCKER_INTERACTION',
    COUNTER_INTERACTION: 'COUNTER_INTERACTION',
    TARGETING: 'TARGETING',
    DRAGGING: 'DRAGGING',
});

class GameState {
    
    /** Constructor
     * @param {GameScene} scene - The scene that the game state is in
     * @param {string} name - The name of the game state
     * @param {string} previousState - The previous game state
     */
    constructor(scene, name, previousState) {
        this.scene = scene;
        this.name = name;

        this.previousState = previousState;

        this.enter();
    }

    enter() {
        //Reset glows of all cards
        for(let card of this.scene.activePlayerScene.hand.cards) card.hideGlow();
        for(let card of this.scene.activePlayerScene.characterArea.cards) card.hideGlow();
        for(let card of this.scene.activePlayerScene.leaderLocation.cards) card.hideGlow();
        for(let card of this.scene.activePlayerScene.stageLocation.cards) card.hideGlow();
    }

    exit(newState) {
        switch(newState) {
            case GAME_STATES.NO_INTERACTION:
                this.scene.gameState = new NoInteractionState(this.scene, this.scene.gameState.name);
                break;
            case GAME_STATES.ACTIVE_INTERACTION:
                this.scene.gameState = new ActiveInteractionState(this.scene, this.scene.gameState.name);
                break;
            case GAME_STATES.PASSIVE_INTERACTION:
                this.scene.gameState = new PassiveInteractionState(this.scene, this.scene.gameState.name);
                break;
            case GAME_STATES.TARGETING:
                this.scene.gameState = new TargetingState(this.scene, this.scene.gameState.name);
                break;
            case GAME_STATES.DRAGGING:
                this.scene.gameState = new DraggingState(this.scene, this.scene.gameState.name);
                break;
            case GAME_STATES.ON_ATTACK_EVENT_INTERACTION:
                this.scene.gameState = new OnAttackEventInteractionState(this.scene, this.scene.gameState.name);
                break;  
            case GAME_STATES.ON_PLAY_EVENT_INTERACTION:
                this.scene.gameState = new OnPlayEventInteractionState(this.scene, this.scene.gameState.name);
                break;
            case GAME_STATES.BLOCKER_INTERACTION:
                this.scene.gameState = new BlockerInteractionState(this.scene, this.scene.gameState.name);
                break;
            case GAME_STATES.COUNTER_INTERACTION:
                this.scene.gameState = new CounterInteractionState(this.scene, this.scene.gameState.name);
                break;
            default:
                break;
        }
    }

    onPointerDown(pointer, gameObject) {}

    onPointerOver(pointer, gameObject) {}

    onPointerOut(pointer, gameObject) {}

    onDragStart(pointer, gameObject) {}

    onDrag(pointer, gameObject, dragX, dragY) {}

    onDragEnd(pointer, gameObject, dropped) {}

    onDrop(pointer, gameObject, dropZone) {}

    update() {}

}