class BlockerAbility extends Ability {

    constructor(config) {
        super(config);
    }

    update() {
        if(!this.card.blockerButton_manualOverride) {
            this.card.blockerButton.canActivate = this.card.playerScene.player.isActivePlayer 
                    && !this.card.playerScene.isPlayerTurn
                    && this.canActivate(this.card.scene.gameStateManager.currentGamePhase);
            /*this.card.blockerButton.setVisible(
                this.card.playerScene.player.isActivePlayer 
                && !this.card.playerScene.isPlayerTurn
                && this.canActivate(this.card.scene.gameStateManager.currentGamePhase)
            );*/
        } else {
            this.card.blockerButton.canActivate = this.card.blockerButton_manualOverride;
        }

        this.card.blockerButton.preFX.clear();
        if(this.card.blockerButton.canActivate) this.card.blockerButton.preFX.addGlow(COLOR_ENUMS.OP_ORANGE, 4);
        else this.card.blockerButton.preFX.addGlow(COLOR_ENUMS.OP_WHITE, 3);
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