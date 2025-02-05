class CardOpeningPanelCardVisual extends Phaser.GameObjects.Container {

    constructor (scene, config) {
        super(scene, config.x, config.y);

        let width = 600;
        let height = 838;

        this.scene = scene;
        this.scale = config.scale;

        this.cardIndex = config.index;
        this.rarity = config.rarity;
        this.newCard = config.newcard;

        this.showingBack = true;
        this.flipped = false;
        this.isGlowing = false;

        this.artKey = config.art;
        this.art = this.scene.add.image(0, 0, '');
        this.art.setVisible(!this.showingBack);
        this.backart = this.scene.add.image(0, 0, ASSET_ENUMS.CARD_BACK1);
        this.backart.setVisible(this.showingBack);

        //Need to create a new banner
        this.newCardIcon = this.scene.add.image(0, this.backart.height/2, ASSET_ENUMS.ICON_NEW_CARD).setScale(0.5);
        this.newCardIcon.setVisible(false);

        this.add([this.art, this.backart, this.newCardIcon]);

        this.setSize(width, height);
        this.setScale(config.scale);

        this.scene.add.existing(this);

        this.setUpdate();
    }

    /** Update the content of the card */
    setUpdate () {
        let loader = new Phaser.Loader.LoaderPlugin(this.scene); //create a loader 
        if(!this.scene.textures.exists(this.artKey)) {
            loader.image(this.artKey, `assets/cardart/${this.artKey}.png`); //load image
            loader.once(Phaser.Loader.Events.COMPLETE, () => {
                this.art.setTexture(this.artKey);
            });
            loader.start();
        } else {
            this.art.setTexture(this.artKey);
        }
    }

    addGlowEffect() {
        let glowColor;
        switch (this.rarity) {
            case 'COMMON':
                glowColor = 0xffffff; // White glow for common
                break;
            case 'UNCOMMON':
                glowColor = 0x0000ff; // Blue glow for rare
                break;
            case 'RARE':
                glowColor = 0x800080; // Purple glow for epic
                break;
            case 'SUPER RARE':
                glowColor = 0xffd700; // Gold glow for legendary
                break;
            case 'LEADER':
                glowColor = COLOR_ENUMS.OP_GOLD; // Gold glow for legendary
                break;
            default:
                glowColor = 0xffffff; // Default white glow
        }

        if(!this.isGlowing) {  
            if(this.showingBack) {
                this.backart.preFX.setPadding(32);
                const fx = this.backart.preFX.addGlow(glowColor, 4 ,0, false, 0.1, 32);
        
                this.scene.tweens.add({
                    targets: fx,
                    outerStrength: 10,
                    duration:1000,
                    alpha:0.8,
                    ease: 'Sine.inout',
                    yoyo: true,
                    repeat: -1
                });
            } else {
                this.art.preFX.setPadding(32);
                const fx = this.art.preFX.addGlow(glowColor, 4 ,0, false, 0.1, 32);
        
                this.scene.tweens.add({
                    targets: fx,
                    outerStrength: 10,
                    duration:1000,
                    alpha:0.8,
                    ease: 'Sine.inout',
                    yoyo: true,
                    repeat: -1
                });
            } 

            this.isGlowing = true;
        }
    }

    hideGlowEffect() {
        if(this.showingBack){
            this.backart.preFX.clear();
            this.isGlowing = false;
        } 
        else {
            if(!this.flipped) {
                this.art.preFX.clear();
                this.isGlowing = false;
            }
        }
    }

    getWidth () {
        return this.width * this.scale;
    }

    getHeight () {
        return this.height * this.scale;
    }

    /** Flip the card to reveal the art */
    flipCard() {
        this.scene.tweens.add({
            targets: this.backart,
            scaleX: 0,
            duration: 400,
            ease: 'Sine.easeOut',
            onComplete: () => {
                this.showingBack = false;
                this.backart.setVisible(false);
                this.art.scaleX = 0;
                this.art.setVisible(true);
                this.flipped = true;
                this.isGlowing = false;
                this.addGlowEffect();
                this.scene.tweens.add({
                    targets: this.art,
                    scaleX: 1,
                    duration: 400,
                    ease: 'Sin.easeOut',
                    onComplete: () => {
                        if(this.newCard) this.newCardIcon.setVisible(true); 
                        this.scene.cardPanel.checkAllCardsFlipped();
                    }
                });
            }
        });
    }

    burnCard() {
        this.art.setPipeline(PIPELINE_ENUMS.BURNING_PIPELINE);

        // Animate the burnAmount uniform to gradually increase the burn effect
        this.scene.tweens.add({
            targets: { burnAmount: 0 },
            burnAmount: 1,
            duration: 1000,
            ease: 'Linear',
            onUpdate: (tween) => {
                this.art.pipeline.set1f('burnAmount', tween.getValue());
            },
            onComplete: () => {
                this.destroy(); // Destroy the card after the burning effect
            }
        });
    }
}