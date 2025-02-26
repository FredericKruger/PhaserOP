const DON_CARD_STATES = Object.freeze({
    IN_DECK: 'IN_DECK',
    ACTIVE: 'ACTIVE',
    EXERTED: 'EXERTED',
    ATTACHED: 'ATTACHED',
    TRAVELLING: 'TRAVELLING',
});

class DonCardState {

    /** Constructor
     * @param {DonCardUI} card - The card that the state is in
     * @param {string} name - The name of the state
     */
    constructor(card, name) {
        this.card = card;
        this.name = name;
    }

    /** Function to exit one state to another
     * @param {string} newState - The state to exit to
     */
    exit(newState) {
        let newFSMState = null;
        switch (newState) {
            case DON_CARD_STATES.IN_DECK:
                newFSMState = new DonInDeckState(this.card);
                break;
            case DON_CARD_STATES.ACTIVE:
                newFSMState = new DonActiveState(this.card);
                break;
            case DON_CARD_STATES.EXERTED:
                newFSMState = new DonExertedState(this.card);
                break;
            case DON_CARD_STATES.ATTACHED:
                newFSMState = new DonAttachedState(this.card);
                break;
            case DON_CARD_STATES.TRAVELLING:
                newFSMState = new DonTravellingState(this.card);
                break;
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