const NEXT_TURN_BUTTON_FSM_STATES = Object.freeze({
    INIT: 'INIT',
    ACTIVE: 'ACTIVE',
    CANCEL: 'CANCEL',
    PASS: 'PASS',
    BLOCK: 'BLOCK',
    COUNTER: 'COUNTER',
    PASSIVE: 'PASSIVE',
    OPPONENT_TURN: 'OPPONENT_TURN',
    OPPONENT_BLOCK: 'OPPONENT_BLOCK',
    OPPONENT_COUNTER: 'OPPONENT_COUNTER',
    ON_PLAY_EVENT: 'ON_PLAY_EVENT',
    ON_ATTACK_EVENT: 'ON_ATTACK_EVENT',
});

class NextTurnButtonState {

    /** Constructor
     * @param {NextTurnButton} button - The card that the state is in
     * @param {string} name - The name of the state
     * @param {string} previousState - The previous state
     */
    constructor(button, name, previousState) {
        this.button = button;
        this.name = name;
        this.previousState = previousState;

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
                newFSMState = new NextTurnButtonInitState(this.button, this.name);
                break;
            case NEXT_TURN_BUTTON_FSM_STATES.ACTIVE:
                newFSMState = new NextTurnButtonActiveState(this.button, this.name);
                break;
            case NEXT_TURN_BUTTON_FSM_STATES.PASSIVE:
                newFSMState = new NextTurnButtonPassiveState(this.button, this.name);
                break;
            case NEXT_TURN_BUTTON_FSM_STATES.CANCEL:
                newFSMState = new NextTurnButtonCancelState(this.button, this.name);
                break;
            case NEXT_TURN_BUTTON_FSM_STATES.PASS:
                newFSMState = new NextTurnButtonPassState(this.button, this.name);
                break;
            case NEXT_TURN_BUTTON_FSM_STATES.BLOCK:
                newFSMState = new NextTurnButtonBlockState(this.button, this.name);
                break;
            case NEXT_TURN_BUTTON_FSM_STATES.COUNTER:
                newFSMState = new NextTurnButtonCounterState(this.button, this.name);
                break;
            case NEXT_TURN_BUTTON_FSM_STATES.OPPONENT_TURN:
                newFSMState = new NextTurnButtonOpponentTurnState(this.button, this.name);
                break;
            case NEXT_TURN_BUTTON_FSM_STATES.OPPONENT_BLOCK:
                newFSMState = new NextTurnButtonOpponentBlockState(this.button, this.name);
                break;
            case NEXT_TURN_BUTTON_FSM_STATES.OPPONENT_COUNTER:
                newFSMState = new NextTurnButtonOpponentCounterState(this.button, this.name);
                break;
            case NEXT_TURN_BUTTON_FSM_STATES.ON_PLAY_EVENT:
                newFSMState = new NextTurnButtonOnPlayEventState(this.button, this.name);
                break;
            case NEXT_TURN_BUTTON_FSM_STATES.ON_ATTACK_EVENT:
                newFSMState = new NextTurnButtonOnAttackEventState(this.button, this.name);
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