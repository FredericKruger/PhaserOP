const GAME_STATES = Object.freeze({
    NO_INTERACTION: 'NO_INTERACTION',
    ACTIVE_INTERACTION: 'ACTIVE_INTERACTION',
    PASSIVE_INTERACTION: 'PASSIVE_INTERACTION',
    RESPONSIVE_INTERACTION: 'RESPONSIVE_INTERACTION',
    TARGETING: 'TARGETING',
    DRAGGING: 'DRAGGING'
});

class GameState {
    
    /** Constructor
     * @param {GameScene} scene - The scene that the game state is in
     * @param {string} name - The name of the game state
     */
    constructor(scene, name) {
        this.scene = scene;
        this.name = name;
        
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
                this.scene.gameState = new NoInteractionState(this.scene);
                break;
            case GAME_STATES.ACTIVE_INTERACTION:
                this.scene.gameState = new ActiveInteractionState(this.scene);
                break;
            case GAME_STATES.PASSIVE_INTERACTION:
                this.scene.gameState = new PassiveInteractionState(this.scene);
                break;
            /*case GAME_STATES.RESPONSIVE_INTERACTION:
                this.scene.gameState = new ResponsiveInteractionState(this.scene);
                break;*/
            case GAME_STATES.TARGETING:
                this.scene.gameState = new TargetingState(this.scene);
                break;
            case GAME_STATES.DRAGGING:
                this.scene.gameState = new DraggingState(this.scene);
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