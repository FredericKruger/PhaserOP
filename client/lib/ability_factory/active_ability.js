class ActiveAbility extends Ability {

    constructor(config) {
        super(config);
    }

    update() {
        //find button
        let button = this.card.getAbilityButton(this.art.art);
        button.canPulsate = button.card.playerScene.isPlayerTurn;

        if(this.canActivate(this.card.scene.gameStateUI.phase)) {
            button.canActivate = true;

            //button.scene.children.moveToTop(button);
            button.abilityButton.preFX.clear();
            button.abilityButton.preFX.addGlow(COLOR_ENUMS.OP_ORANGE, 4);

            if(button.canPulsate) button.startPusaltingAnimation();

        } else {
            button.canActivate = false;

            button.abilityButton.preFX.clear();
            button.abilityButton.preFX.addGlow(COLOR_ENUMS.OP_WHITE, 3);

            // Stop pulsing animation and reset scale
            button.stopPulsatingAnimation();
        }
    }

    trigger() {
        if(this.card.scene.gameState.name === GAME_STATES.ON_PLAY_EVENT_INTERACTION) {
            this.card.scene.gameStateUI.nextTurnbutton.fsmState.exit(NEXT_TURN_BUTTON_FSM_STATES.ACTIVE);
            this.card.scene.gameState.exit(GAME_STATES.ACTIVE_INTERACTION);
        }  
        this.card.scene.game.gameClient.requestActivateAbility(this.card.id, this.id);
    }
}