class AuraAbility extends Ability {

    constructor(config) {
        super(config);

        /** @type {Aura} */
        this.aura = null;
        
        this.active = false;
        
        /** @type {TargetManager} */
        this.targetManager = null;
    }

    createTargetManager() {
        this.targetManager = new TargetManager(this.card.scene, 'AURA', this.aura.ability.id, this.card, false);
        this.targetManager.loadFromTargetData(this.aura.ability.target); //Load the target data
    }

    update() {
        //find button
        let button = this.card.getAbilityButton(this.art.art);

        if(this.canActivate() && !this.active) {
            this.active = true;
            button.canActivate = true;

            //console.log("Aura ability activating");
            this.applyAura(true);

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

            //console.log("Aura ability deactivating");
            this.applyAura(false);

            button.abilityButton.preFX.clear();
            button.abilityButton.preFX.addGlow(COLOR_ENUMS.OP_WHITE, 3);
        }

        if(this.canActivate()) {
            if(button.canPulsate) button.startPusaltingAnimation();
        } else {
            button.stopPulsatingAnimation();
        }
    }

    /** If the card is active */
    applyAura(active) {
        if(!this.targetManager) this.createTargetManager(); //Create the target manager if it doesn't exist 
        //find targets
        let targetCards = [];
        if(this.aura.affectedPlayers.includes('owner')) {
            targetCards = targetCards.concat(this.card.playerScene.leaderLocation.cards);
            targetCards = targetCards.concat(this.card.playerScene.characterArea.cards);
            targetCards = targetCards.concat(this.card.playerScene.hand.cards);
        }
        if(this.aura.affectedPlayers.includes('opponent')) {
            targetCards = targetCards.concat(this.card.playerScene.opponentPlayerScene.leaderLocation.cards);
            targetCards = targetCards.concat(this.card.playerScene.opponentPlayerScene.characterArea.cards);
        }

        //Loop through the target cards and check if they are valid targets
        for(let card of targetCards) {
            if(this.targetManager.isValidTarget(card).isValid) {
                this.executeAuraActions(this.card, active, card);
            }
        }
    }
}