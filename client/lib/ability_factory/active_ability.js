class ActiveAbility extends Ability {

    constructor(config) {
        super(config);
    }

    update() {
        //find button
        let button = this.card.getAbilityButton(this.art.art);

        if(this.canActivate(this.card.scene.gameStateUI.phase)) {
            button.canActivate = true;

            button.abilityButton.preFX.clear();
            button.abilityButton.preFX.addGlow(COLOR_ENUMS.OP_ORANGE, 4);

        } else {
            button.canActivate = false;

            button.abilityButton.preFX.clear();
            button.abilityButton.preFX.addGlow(COLOR_ENUMS.OP_WHITE, 3);
        }
    }

    trigger() {this.card.scene.game.gameClient.requestActivateAbility(this.card.id, this.id);}
}