class NextTurnButtonPassState extends NextTurnButtonState {

    constructor(button) {
        super(button, NEXT_TURN_BUTTON_FSM_STATES.PASS);
    }
}

class NextTurnButtonBlockState extends NextTurnButtonState {

    constructor(button) {
        super(button, NEXT_TURN_BUTTON_FSM_STATES.BLOCK);
    }

    enter() {
        super.enter();
        this.button.makeInteractive(true);
        this.button.buttonText.setText("PASS");
        this.button.clearGreyscale();
    }

    onPointerDown(pointer, gameObject) {
        this.button.scene.add.tween({
            onStart: () => {
                this.exit(NEXT_TURN_BUTTON_FSM_STATES.OPPONENT_TURN);
            },
            targets: this.button,
            rotation: Math.PI*2,
            duration: 500,
            onComplete: () => {
                this.button.scene.gameStateManager.passToNextPhase(GAME_STATES.BLOCKER_INTERACTION, true);
            }
        });
    }
}

class NextTurnButtonCounterState extends NextTurnButtonState {

    constructor(button) {
        super(button, NEXT_TURN_BUTTON_FSM_STATES.COUNTER);
    }

    enter() {
        super.enter();
        this.button.makeInteractive(true);
        this.button.buttonText.setText("PASS");
        this.button.clearGreyscale();
    }

    onPointerDown(pointer, gameObject) {
        this.button.scene.add.tween({
            onStart: () => {
                this.exit(NEXT_TURN_BUTTON_FSM_STATES.OPPONENT_TURN);
            },
            targets: this.button,
            rotation: Math.PI*2,
            duration: 500,
            onComplete: () => {
                this.button.scene.gameStateManager.passToNextPhase();
            }
        });
    }
}