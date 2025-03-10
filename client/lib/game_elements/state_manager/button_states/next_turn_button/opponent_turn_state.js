class NextTurnButtonOpponentTurnState extends NextTurnButtonState {

    constructor(button, previousState) {
        super(button, NEXT_TURN_BUTTON_FSM_STATES.OPPONENT_TURN, previousState);
    }

    enter() {
        super.enter();
        this.button.makeInteractive(false);
        this.button.buttonText.setText("OPPONENT TURN");
        this.button.setGreyscale();
    }

}

class NextTurnButtonOpponentBlockState extends NextTurnButtonState {

    constructor(button, previousState) {
        super(button, NEXT_TURN_BUTTON_FSM_STATES.OPPONENT_BLOCK, previousState);
    }

    enter() {
        super.enter();
        this.button.makeInteractive(false);
        this.button.buttonText.setText("OPPONENT BLOCK");
        this.button.setGreyscale();
    }

}

class NextTurnButtonOpponentCounterState extends NextTurnButtonState {

    constructor(button, previousState) {
        super(button, NEXT_TURN_BUTTON_FSM_STATES.OPPONENT_COUNTER, previousState);
    }

    enter() {
        super.enter();
        this.button.makeInteractive(false);
        this.button.buttonText.setText("OPPONENT COUNTER");
        this.button.setGreyscale();
    }

}