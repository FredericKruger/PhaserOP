class BlockerAbility extends Ability {

    constructor(config) {
        super(config);
    }

    update() {
        if(!this.card.blockerButton_manualOverride) {
            this.card.blockerButton.setVisible(
                this.card.playerScene.player.isActivePlayer 
                && !this.card.playerScene.isPlayerTurn
                && this.canActivate(this.card.scene.gameStateManager.currentGamePhase)
            );
        } else this.card.blockerButton.setVisible(this.card.blockerButton_manualOverride);

    }
    
    trigger() {
        this.card.scene.game.gameClient.requestPerformAbility(this.card.id, this.id);
        super.trigger();
    }

    action() {        
        super.action();
    }

    onFail() {
        this.card.scene.gameState.exit(GAME_STATES.BLOCKER_INTERACTION);
        super.onFail();
    }

}