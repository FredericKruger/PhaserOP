const NEXT_TURN_BUTTON_FSM_STATES = Object.freeze({
    INIT: 'INIT',
    ACTIVE: 'ACTIVE',
    PASS: 'PASS',
    PASSIVE: 'PASSIVE',
    OPPONENT_TURN: 'OPPONENT_TURN',
});

class NextTurnButtonState {

    /** Constructor
     * @param {NextTurnButton} button - The card that the state is in
     * @param {string} name - The name of the state
     */
    constructor(button, name) {
        this.button = button;
        this.name = name;

        this.enter();
    }

    enter() {
    }

    /** Function to exit one state to another
     * @param {string} newState - The state to exit to
     */
    exit(newState) {
        let newFSMState = null;
        switch (newState) {
            case NEXT_TURN_BUTTON_FSM_STATES.INIT:
                newFSMState = new NextTurnButtonInitState(this.button);
                break;
            case NEXT_TURN_BUTTON_FSM_STATES.ACTIVE:
                newFSMState = new NextTurnButtonActiveState(this.button);
                break;
            case NEXT_TURN_BUTTON_FSM_STATES.PASSIVE:
                newFSMState = new NextTurnButtonPassiveState(this.button);
                break;
            case NEXT_TURN_BUTTON_FSM_STATES.PASS:
                newFSMState = new NextTurnButtonPassState(this.button);
                break;
            case NEXT_TURN_BUTTON_FSM_STATES.OPPONENT_TURN:
                newFSMState = new NextTurnButtonOpponentTurnState(this.button);
                break;
            default:
                newFSMState = null;
                break;
        }

        if(newFSMState.name !== this.name) {
            this.button.fsmState = newFSMState;
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

    isValidTarget() {}

}