class BlockerAbility extends Ability {

    constructor(config) {
        super(config);
    }

    update() {
        this.card.blockerButton.setVisible(this.canActivate(this.card.scene.gameState));
    }

}