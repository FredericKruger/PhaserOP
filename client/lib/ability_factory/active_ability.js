class ActiveAbility extends Ability {

    constructor(config) {
        super(config);
    }

    update() {
        //find button
        let button = this.card.getAbilityButton(this.art.art);

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

    trigger() {this.card.scene.game.gameClient.requestActivateAbility(this.card.id, this.id);}
}