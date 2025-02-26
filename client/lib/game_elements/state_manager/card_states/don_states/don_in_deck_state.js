class DonInDeckState extends DonCardState {

    constructor(card) {
        super(card, DON_CARD_STATES.IN_DECK);
    }

    update() {
        card.setVisible(false);
    }
}