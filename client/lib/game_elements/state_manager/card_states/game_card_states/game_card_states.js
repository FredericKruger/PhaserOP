const GAME_CARD_STATES = Object.freeze({
    IN_DECK: 'IN_DECK',
    IN_HAND: 'IN_HAND',
    TRAVELLING: 'TRAVELLING',
    FIRST_TURN: 'FIRST_TURN',
    IN_PLAY: 'IN_PLAY',
    IN_DISCARD: 'IN_DISCARD',
    ATTACHED: 'ATTACHED',
    IN_ACTION: 'IN_ACTION',
});

class GameCardState {

    /** Constructor
     * @param {GameCardUI} card - The card that the state is in
     * @param {string} name - The name of the state
     */
    constructor(card, name) {
        this.card = card;
        this.name = name;

        this.enter();
    }

    enter() {
        this.card.hideGlow();
    }

    /** Function to exit one state to another
     * @param {string} newState - The state to exit to
     */
    exit(newState) {
        let newFSMState = null;
        switch (newState) {
            case GAME_CARD_STATES.IN_DECK:
                newFSMState = new InDeckState(this.card);
                break;
            case GAME_CARD_STATES.IN_HAND:
                newFSMState = new InHandState(this.card);
                break;
            case GAME_CARD_STATES.TRAVELLING:
                newFSMState = new TravellingState(this.card);
                break;
            case GAME_CARD_STATES.IN_PLAY:
                newFSMState = new InPlayState(this.card);
                break;
            case GAME_CARD_STATES.FIRST_TURN:
                newFSMState = new FirstTurnState(this.card);
                break;
            case GAME_CARD_STATES.IN_DISCARD:
                this.card.state = new InDiscardState(this.card);
                break;
            /*case GAME_CARD_STATES.ATTACHED:
                this.card.state = new AttachedState(this.card);
                break;
            case GAME_CARD_STATES.IN_ACTION:
                this.card.state = new InActionState(this.card);
                break;*/
            default:
                newFSMState = null;
                break;
        }

        if(newFSMState.name !== this.name) {
            this.card.fsmState = newFSMState;
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