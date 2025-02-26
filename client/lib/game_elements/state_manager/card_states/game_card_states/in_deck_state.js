class InDeckState extends GameCardState {
        /** Constructor
     * @param {GameCardUI} card - The card that the state is in
     * @param {string} name - The name of the state
     */
    constructor(card) {
        super(card, GAME_CARD_STATES.IN_DECK);
    }
}