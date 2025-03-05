class BlockerAbility extends Ability {

    constructor(config) {
        super(config);
    }

    update() {
        this.card.blockerButton.setVisible(this.canActivate(this.card.scene.gameState));
    }

    action() {
        this.card.scene.game.gameClient.requestPerformAbility(this.card.id, this.id);
        this.card.scene.gameState.exit(GAME_STATES.PASSIVE_INTERACTION);
    }

}