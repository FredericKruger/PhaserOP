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
    }

    onPointerDown(pointer, gameObject) {
        this.button.scene.add.tween({
            onStart: () => {
                this.exit(NEXT_TURN_BUTTON_FSM_STATES.PASSIVE);
            },
            targets: this.button,
            rotation: Math.PI*2,
            duration: 500,
            onComplete: () => {
                console.log("Pass Block");
            }
        });
    }
}

class NextTurnButtonCounterState extends NextTurnButtonState {

    constructor(button) {
        super(button, NEXT_TURN_BUTTON_FSM_STATES.COUNTER);
    }
}