class NextTurnButtonCancelState extends NextTurnButtonState {

    constructor(button, previousState) {
        super(button, NEXT_TURN_BUTTON_FSM_STATES.CANCEL, previousState);
    }

    enter() {
        super.enter();
        this.button.makeInteractive(true);
        this.button.buttonText.setText("CANCEL");
    }

    onPointerDown(pointer, gameObject) {
        this.button.scene.actionLibrary.cancelTargetingAction();
    }
}