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

class NextTurnButtonOpponentBlockState extends NextTurnButtonState {

    constructor(button) {
        super(button, NEXT_TURN_BUTTON_FSM_STATES.OPPONENT_BLOCK);
    }

    enter() {
        super.enter();
        this.button.makeInteractive(false);
        this.button.buttonText.setText("OPPONENT BLOCK");
        this.button.setGreyscale();
    }

}

class NextTurnButtonOpponentCounterState extends NextTurnButtonState {

    constructor(button) {
        super(button, NEXT_TURN_BUTTON_FSM_STATES.OPPONENT_COUNTER);
    }

    enter() {
        super.enter();
        this.button.makeInteractive(false);
        this.button.buttonText.setText("OPPONENT COUNTER");
        this.button.setGreyscale();
    }

}