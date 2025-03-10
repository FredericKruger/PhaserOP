class NextTurnButtonActiveState extends NextTurnButtonState {

    constructor(button, previousState) {
        super(button, NEXT_TURN_BUTTON_FSM_STATES.ACTIVE, previousState);
    }

    enter() {
        super.enter();
        this.button.makeInteractive(true);
        this.button.buttonText.setText("END TURN");
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
                this.button.scene.gameStateManager.triggerNextTurn();
            }
        });
    }

}
