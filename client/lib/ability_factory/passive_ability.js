class PassiveAbility extends Ability {

    constructor(config) {
        super(config);

        this.active = false;
    }

    update() {
        //find button
        let button = this.card.getAbilityButton(this.art.art);

        if(this.canActivate() && !this.active) {
            this.active = true;
            button.canActivate = true;

            this.executePassiveActions(this.card, true);

            button.abilityButton.preFX.clear();
            button.abilityButton.preFX.addGlow(COLOR_ENUMS.OP_ORANGE, 4);

            this.card.scene.tweens.add({
                targets: button,
                scale: button.scale * 1.1, // Slightly smaller on press
                duration: 100,
                yoyo: true
            });

        } else if(!this.canActivate() && this.active) {
            this.active = false;
            button.canActivate = false;

            this.executePassiveActions(this.card, false);

            button.abilityButton.preFX.clear();
            button.abilityButton.preFX.addGlow(COLOR_ENUMS.OP_WHITE, 3);
        }
    }
}