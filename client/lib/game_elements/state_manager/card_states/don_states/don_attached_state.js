class DonAttachedState extends DonCardState {

    constructor(card) {
        super(card, DON_CARD_STATES.ATTACHED);
    }

    update() {
        card.setVisible(true);
    }

}