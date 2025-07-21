class BlockerAbility extends Ability {

    constructor(config) {
        super(config);
    }

    update() {
        if(!this.card.blockerButton_manualOverride) {
            this.card.blockerButton.canActivate = this.card.playerScene.player.isActivePlayer 
                    && !this.card.playerScene.isPlayerTurn
                    && this.card.canBlock
                    && this.canActivate(this.card.scene.gameStateManager.currentGamePhase);
        } else {
            this.card.blockerButton.canActivate = this.card.blockerButton_manualOverride;
        }

        this.card.blockerButton.abilityButton.preFX.clear();
        if(this.card.blockerButton.canActivate) this.card.blockerButton.abilityButton.preFX.addGlow(COLOR_ENUMS.OP_ORANGE, 4);
        else this.card.blockerButton.abilityButton.preFX.addGlow(COLOR_ENUMS.OP_WHITE, 3);

        if(this.card.blockerButton.canActivate) {
            if(this.card.blockerButton.canPulsate) this.card.blockerButton.startPusaltingAnimation();
        } else {
            this.card.blockerButton.stopPulsatingAnimation();
        }
    }
    
    trigger() {
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