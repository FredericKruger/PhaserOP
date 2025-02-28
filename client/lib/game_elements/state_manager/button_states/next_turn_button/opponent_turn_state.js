class NextTurnButtonOpponentTurnState extends NextTurnButtonState {

    constructor(button) {
        super(button, NEXT_TURN_BUTTON_FSM_STATES.OPPONENT_TURN);
    }

    enter() {
        super.enter();
        this.button.makeInteractive(false);
        this.button.buttonText.setText("OPPONENT TURN");
        this.button.setGreyscale();
    }

}