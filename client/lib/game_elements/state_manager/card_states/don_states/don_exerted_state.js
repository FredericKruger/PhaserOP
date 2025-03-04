class DonExertedState extends DonCardState {

    constructor(card) {
        super(card, DON_CARD_STATES.EXERTED);
    }

    enter() {
        this.card.setVisible(false);
        super.enter();
    }

    update() {
    }

}