class CardOpeningPanelCardPanel {

    /**
     * 
     * @param {PackOpeningScene} scene 
     */
    constructor(scene) {
        /** @type {PackOpeningScene} */
        this.scene = scene;
        this.obj = [];

        this.doneButton = this.scene.add.image(this.scene.placeholderImage.x, this.scene.placeholderImage.y, ASSET_ENUMS.ICON_DONE);
        this.doneButton.setVisible(false);

        this.setVisible(false);
    }

    resetPanel() {
        for(let o of this.obj) {
            o.destroy();
        }
        this.obj = [];
    }

    showCards(cardList) {
        const centerX = this.scene.placeholderImage.x;
        const centerY = this.scene.placeholderImage.y;
        const radius = 300; // Adjust the radius as needed
        const angleStep = (2 * Math.PI) / cardList.length;

        for(let i = 0; i<cardList.length; i++) {
            let cardIndex = cardList[i];
            let card = GameClient.playerCollection.cardCollection[cardIndex - 1];
            let angle = -60 + i * angleStep;
            let x = centerX + radius * Math.cos(angle);
            let y = centerY + radius * Math.sin(angle);

            let cardVisual = new CardOpeningPanelCardVisual(this.scene, {
                x: x,
                y: y,
                index: cardIndex,
                art: card.art,
                rarity: card.rarity,
                newcard: card.amount === 0,
                scale: 0
            });
            this.obj.push(cardVisual);

            // Add appearance animation
            //cardVisual.setScale(0); // Start with scale 0
            this.scene.tweens.add({
                targets: cardVisual,
                scale: { from: 0, to: 0.35 },
                duration: 700,
                ease: 'Sine.easeInOut',
                onComplete: () => {
                    this.setCardVisualInteractivity(cardVisual);
                    // Add floating effect
                    this.scene.tweens.add({
                        targets: cardVisual,
                        y: {
                            value: y + Phaser.Math.Between(-5, 5), // Random vertical movement
                            duration: Phaser.Math.Between(1500, 2500), // Random duration
                            ease: 'Sine.easeInOut',
                            yoyo: true,
                            repeat: -1
                        },
                        x: {
                            value: x + Phaser.Math.Between(-5, 5), // Random horizontal movement
                            duration: Phaser.Math.Between(1500, 2500), // Random duration
                            ease: 'Sine.easeInOut',
                            yoyo: true,
                            repeat: -1
                        }
                    });
                }
            });
        }
    }

    // function to show visibility of the card panel
    setVisible(visible) {
        for(let o of this.obj) {
            o.setVisible(visible);
        }
    }

    setCardVisualInteractivity(cardVisual){
        cardVisual.setInteractive();
        cardVisual.on('pointerover', () => {
            this.scene.tweens.add({
                targets: cardVisual,
                scale: 0.37,
                duration: 200,
                ease: 'Sine.easeInOut'
            });
            cardVisual.addGlowEffect();
        });
        cardVisual.on('pointerout', () => {
            this.scene.tweens.add({
                targets: cardVisual,
                scale: 0.35,
                duration: 200,
                ease: 'Sine.easeInOut'
            });
            cardVisual.hideGlowEffect();
        });
        cardVisual.on('pointerdown', () => {
            if(cardVisual.showingBack) cardVisual.flipCard();
        });
    }

    checkAllCardsFlipped() {
        let allFlipped = true;
        for(let o of this.obj) {
            if(!o.flipped) {
                allFlipped = false;
                break;
            }
        }
        if(allFlipped) {
            this.doneButton.setVisible(true);
        }
    }

}