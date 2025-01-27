class CardCraftingPanel extends Phaser.GameObjects.Container{

    constructor(scene, x, y) {
        super(scene, x, y);

        this.scene = scene;
        this.obj = [];
        
        // Create a semi-transparent overlay that takes up the whole window
        this.overlay = this.scene.add.graphics();
        this.overlay.fillStyle(0x000000, 0.55); // Black color with 50% opacity
        this.overlay.fillRect(-this.scene.scale.width/2, -this.scene.scale.height/2, this.scene.scale.width, this.scene.scale.height);
        this.obj.push(this.overlay);

        // Create a transparent panel that takes up the whole window
        this.transparentPanel = this.scene.add.graphics();
        this.transparentPanel.fillStyle(0xffffff, 0.1); // Black color with 50% opacity
        this.transparentPanel.fillRect(-this.scene.scale.width/2, -this.scene.scale.height/2, this.scene.scale.width, this.scene.scale.height);
        this.obj.push(this.transparentPanel);

        this.art = this.scene.add.image(0, -100, '').setOrigin(0.5);
        this.art.setScale(0.6);
        this.obj.push(this.art);

        this.backart = this.scene.add.image(110, -150, 'card_back1').setOrigin(0.5);
        this.backart.setScale(0.48);
        this.backart.angle = 20;
        this.obj.push(this.backart);

        this.packart = this.scene.add.image(-110, -150, 'packart_1').setOrigin(0.5);
        this.packart.setScale(0.8);
        this.packart.angle = -20;
        this.obj.push(this.packart);

        this.cardAmountBox = this.scene.add.graphics();
        this.cardAmountBox.fillStyle(OP_CREAM, 1);
        this.cardAmountBox.fillRoundedRect(-60, CARD_ART_HEIGHT/2*0.6-100-55, 120, 80, 5);
        this.obj.push(this.cardAmountBox);
        this.cardAmountBox.lineStyle(4, OP_WHITE, 1); // Border color (orange) with 2px thickness
        this.cardAmountBox.strokeRoundedRect(-60, CARD_ART_HEIGHT/2*0.6-100-55, 120, 80, 5); // Draw the border

        this.cardAmountText = this.scene.add.text(0, CARD_ART_HEIGHT/2*0.6-100-20, 'x4', {
            fontFamily: 'Arial',
            fontSize: '45px',
            color: '#0xD6AA44'
        });
        this.cardAmountText.setOrigin(0.5, 0.5);
        this.obj.push(this.cardAmountText);

        this.add([this.overlay, this.transparentPanel, this.cardAmountBox, this.packart, this.backart, this.art, this.cardAmountText]);

        this.setSize(this.scene.scale.width, this.scene.scale.height);

        this.scene.add.existing(this);

        this.setInteractive();
        this.on('pointerdown', () => {
            this.setVisible(false);
        });

        
        this.setVisible(false);
    }

    /** UPDATE THE INFORMATION IUN THE PANEL */
    updateArt(cardInfo) {
        this.art.setTexture(cardInfo.art);
        this.packart.setTexture('packart_' + cardInfo.set);
    }

    /** FUNCTION TO SET THE PANEL VISIBLE */
    setVisible(visible) {
        this.scene.children.bringToTop(this);
        for(let o of this.obj) {
            o.setVisible(visible);
        }

        if (visible) {
            this.setInteractive();
        } else {
            this.disableInteractive();
        }
    }
}