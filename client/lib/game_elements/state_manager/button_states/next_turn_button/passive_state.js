class NextTurnButtonPassiveState extends NextTurnButtonState {

    constructor(button, previousState) {
        super(button, NEXT_TURN_BUTTON_FSM_STATES.PASSIVE, previousState);
    }

    enter() {
        super.enter();
        this.button.makeInteractive(false);
        this.button.buttonText.setText("END TURN");
        this.button.clearGreyscale();
    }

}