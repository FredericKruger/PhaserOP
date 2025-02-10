class ShopItemVisual extends Phaser.GameObjects.Container {

    constructor(scene, config) {
        super(scene, config.x, config.y);

        this.scene = scene;

        this.placeholder = this.scene.add.image(0, 0, ASSET_ENUMS.IMAGE_SHOP_ITEM_PLACEHOLDER).setScale(0.25).setOrigin(0.5);
        
        //Place the art
        this.art = this.scene.add.image(0, 0, '').setOrigin(0.5);
        if(!config.isplaceholder) {
            this.art.setTexture(`PACK_ART_${config.art}`);
            this.art.setScale(0.37);
            this.art.setPosition(0,  -this.art.displayHeight/2 + 18);
        } else {
            this.art.setVisible(false);
        }

        //Add ma,e text
        this.nameText = this.scene.add.text(0, 55, '', {
            font: "35px OnePieceFont",
            color: COLOR_ENUMS_CSS.OP_BLACK
        }).setOrigin(0.5);
        if(!config.isplaceholder) {
            this.nameText.setText(config.name);
        } else {
            this.nameText.setVisible(false);
        }

        //Add descirption text
        this.descriptionText = this.scene.add.text(0, 70, '', {
            font: "25px OnePieceFont",
            color: COLOR_ENUMS_CSS.OP_BLACK,
            align: 'center'
        }).setOrigin(0.5, 0);
        if(!config.isplaceholder) {
            this.descriptionText.setText(config.description);
            this.adjustFontSizeToFit(this.descriptionText, this.placeholder.displayWidth - 30, 18); // Adjust font size to fit
        } else {
            this.descriptionText.setVisible(false);
        }

        //Addd the price text
        this.priceText = this.scene.add.text(30, 155, '', {
            font: "30px OnePieceTCGFont",
            color: COLOR_ENUMS_CSS.OP_BLACK
        }).setOrigin(1);
        if(!config.isplaceholder) {
            this.priceText.setText(config.price);
        } else {
            this.priceText.setVisible(false);
        }

        this.add([this.placeholder, this.art, this.nameText, this.descriptionText, this.priceText]);
        this.setSize(this.placeholder.displayWidth, this.placeholder.displayHeight);

        this.scene.add.existing(this); 

        //make item reactive
        if(!config.isplaceholder) {
            this.setInteractive();
            this.on('pointerover', () => {this.addGlowEffect();});
            this.on('pointerout', () => {this.hideGlowEffect();});
        }
    }

    /** Function that shows the card's glow effect */
    addGlowEffect() {
        const fx = this.placeholder.preFX.addGlow(COLOR_ENUMS.OP_ORANGE, 4 ,0, false, 0.1, 32);
    }

    /**
     * Function that hides the card's glow effect
     */
    hideGlowEffect() {
        this.placeholder.preFX.clear();
    }

    /**
     * Function to adjust the font size to fit the width of the panel
     */
    adjustFontSizeToFit(textObject, maxWidth, minFontSize) {
        let fontSize = parseInt(textObject.style.fontSize);
        while (textObject.displayWidth > maxWidth && fontSize > minFontSize) {
            fontSize--;
            textObject.setFontSize(fontSize);
        }
        if (fontSize <= minFontSize) {
            this.wrapText(textObject, maxWidth);
        }
    }

    /**
     * Function to wrap text into multiple lines
     */
    wrapText(textObject, maxWidth) {
        let words = textObject.text.split(' ');
        let wrappedText = '';
        let line = '';
        for (let i = 0; i < words.length; i++) {
            let testLine = line + words[i] + ' ';
            textObject.setText(testLine);
            if (textObject.displayWidth > maxWidth && i > 0) {
                wrappedText += line + '\n';
                line = words[i] + ' ';
            } else {
                line = testLine;
            }
        }
        wrappedText += line;
        textObject.setText(wrappedText);
    }

}