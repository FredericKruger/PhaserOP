class DonExertedState extends DonCardState {

    constructor(card) {
        super(card, DON_CARD_STATES.EXERTED);
    }

    update() {
        card.setVisible(false);
    }

}