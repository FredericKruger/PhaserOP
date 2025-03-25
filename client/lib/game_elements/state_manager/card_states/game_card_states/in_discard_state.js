class InDiscardState extends GameCardState {

    /** Constructor
     * @param {GameCardUI} card - The card that the state is in
     */
    constructor(card) {
        super(card, GAME_CARD_STATES.IN_DISCARD);
    }

    enter() {
        //Destroy dizzyanumation
        console.log("Entering Discard State");
        this.card.stopDizzyAnimation();
        super.enter();
    }

}