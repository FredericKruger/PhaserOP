class NextTurnButtonDrawCardState extends NextTurnButtonState {

    constructor(button, previousState) {
        super(button, NEXT_TURN_BUTTON_FSM_STATES.DRAW_CARD, previousState);
    }

    enter() {
        super.enter();
        this.button.makeInteractive(true);
        this.button.buttonText.setText("ADD TO HAND");
        this.button.clearGreyscale();
    }

    onPointerDown(pointer, gameObject) {  
        this.exit(NEXT_TURN_BUTTON_FSM_STATES.OPPONENT_TURN);
        this.button.scene.gameStateManager.passToNextPhase(GAME_STATES.TRIGGER_INTERACTION, true);  
    }
}