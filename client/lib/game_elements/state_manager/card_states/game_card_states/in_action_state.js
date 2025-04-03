class InActionState extends GameCardState {

    /** Constructor
     * @param {GameCardUI} card - The card that the state is in
     */
    constructor(card) {
        super(card, GAME_CARD_STATES.IN_ACTION);
    }

    enter() {
        for(let abilityButton of this.card.abilityButtons) abilityButton.setVisible(true);
        super.enter();
    }

    exit(newState) {
        for(let abilityButton of this.card.abilityButtons) abilityButton.setVisible(false);
        super.exit(newState);
    }

    onPointerOver(pointer, gameObject) {
        gameObject.showGlow(COLOR_ENUMS.OP_WHITE);
    }

    onPointerOut(pointer, gameObject) {
        gameObject.hideGlow();
    }

    update() {
        for(let ability of this.card.abilities) {
            ability.update();
        }
    }
}