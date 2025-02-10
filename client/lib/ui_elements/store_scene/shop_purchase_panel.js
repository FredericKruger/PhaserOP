class PurchasePanel extends Phaser.GameObjects.Container {

    constructor(scene, x, y, shopItem) {
        super(scene, x, y);

        this.obj = [];

        this.scene = scene;
        this.shopItem = shopItem;

        // Create a semi-transparent overlay that takes up the whole window
        this.overlay = this.scene.add.graphics();
        this.overlay.fillStyle(COLOR_ENUMS.OP_BLACK, 0.7); // Black color with 50% opacity
        this.overlay.fillRect(-this.scene.scale.width/2, -this.scene.scale.height/2, this.scene.scale.width, this.scene.scale.height);
        this.obj.push(this.overlay);

        this.screenCenterX = this.scene.cameras.main.worldView.x + this.scene.cameras.main.width / 2;
        this.screenCenterY = this.scene.cameras.main.worldView.y + this.scene.cameras.main.height / 2;
        this.mainPanelSize = {
            width: this.scene.cameras.main.width * 0.5,
            height: this.scene.cameras.main.height * 0.7
        }

        //Creating the main panel
        this.createCentralPanel();

        //Make buttons interactive
        this.buyButton.setInteractive();
        this.buyButton.on('pointerover', () => {
            this.buyButton.setScale(0.16);
            this.buyButton.preFX.addGlow(COLOR_ENUMS.OP_BLUE, 4 ,0, false, 0.1, 32);
        });
        this.buyButton.on('pointerout', () => {
            this.buyButton.setScale(0.15);
            this.buyButton.preFX.clear();
        });
        this.buyButton.on('pointerdown', () => {
            this.setVisible(false);
        });

        this.add(this.obj);
        this.setSize(this.scene.scale.width, this.scene.scale.height);

        this.scene.add.existing(this);

        this.setVisible(false);
        this.setDepth(3);

        this.setInteractive();
        let mainPanelBounds = new Phaser.Geom.Rectangle(this.mainPanelSize.x, this.mainPanelSize.y, this.mainPanelSize.width, this.mainPanelSize.height);
        this.on('pointerover', () => {});
        this.on('pointerdown', (pointer) => {
            if(!Phaser.Geom.Rectangle.Contains(mainPanelBounds, pointer.x, pointer.y)) {
                this.setVisible(false);
            }
        });
    }

    /** Function that shows the Purchase Panel */
    launch(shopItem, itemType) {
        this.banner.setTexture(`BANNER_${shopItem.name}`);
        this.placholderart.setTexture(`PACK_ART_${shopItem.name}`)
        this.priceText.setText(shopItem.price);
        this.descriptionTitleText.setText(shopItem.name + ' ' + shopItem.description);

        if(itemType === 'PACKS') {
            this.descriptionContentTitleText.setText('Contents per Pack:');
            this.descriptionContentText.setText(
                '  - 5 One Piece Cards\n' +
                '  - At least 1 card will be Uncommon or better'
            );
        } else if (itemType === 'DECKS') {
            this.descriptionContentTitleText.setText('Contents per Deck:');
            this.descriptionContentText.setText(
                '  - A deck of 50 cards\n' +
                '  - The deck includes a leader card, and 4 Secret Rare cards'
            );
        }

        this.setVisible(true);
    }

    createCentralPanel() {
        //create main block
        let graphics = this.scene.add.graphics();
        graphics.fillStyle(COLOR_ENUMS.OP_CREAM_DARKER);
        graphics.fillRoundedRect(
            -this.mainPanelSize.width/2, 
            -this.mainPanelSize.height/2- 50, 
            this.mainPanelSize.width, this.mainPanelSize.height,  
            5);
        this.obj.push(graphics);

        //Store the position
        let mainPanelPosition = {
            x: -this.mainPanelSize.width/2,
            y: -this.mainPanelSize.height/2 - 100
        };

        this.mainPanelSize.x = this.screenCenterX-this.mainPanelSize.width/2;
        this.mainPanelSize.y = this.screenCenterY-this.mainPanelSize.height/2 - 100;

        //Add background Picture
        let backgroundImage = this.scene.add.image(
            0, 
            -150, 
            ASSET_ENUMS.BACKGROUND5
        ).setOrigin(0.5).setAlpha(0.7);
        this.obj.push(backgroundImage);

        // Calculate crop area from the center
        let cropX = 50;
        let cropY = 30;             
        backgroundImage.setCrop(cropX, cropY, backgroundImage.width-100, backgroundImage.height-60); // Crop the texture to fit the panel

        //Add outline
        let backgroundImageOutline = this.scene.add.graphics();
        backgroundImageOutline.lineStyle(3, COLOR_ENUMS.OP_GREY); // Set the line style (width and color)
        backgroundImageOutline.strokeRoundedRect(
            backgroundImage.x - (backgroundImage.width/2-50),
            backgroundImage.y - (backgroundImage.height/2-30),
            backgroundImage.displayWidth-100,
            backgroundImage.displayHeight-60,
            0 // Adjust the radius as needed
        );
        this.obj.push(backgroundImageOutline);

        //Create Placeholder for banner
        this.banner = this.scene.add.image(
            0, 
            backgroundImage.y - (backgroundImage.height/2-30) + 20, 
            ''
        ).setOrigin(0.5).setScale(0.35);
        this.banner.preFX.addGlow(COLOR_ENUMS.OP_ORANGE, 4 ,0, false, 0.1, 32);
        this.obj.push(this.banner);

        //Create Description Panel
        let descriptionPanel = this.scene.add.graphics();
        descriptionPanel.fillStyle(COLOR_ENUMS.OP_CREAM);
        descriptionPanel.fillRoundedRect(
            -backgroundImage.width/2 + 50, 
            backgroundImage.y + (backgroundImage.height/2-30) + 20,
            (backgroundImage.width-100)*0.68, 200,  
            5);
        this.obj.push(descriptionPanel);

        let descriptionPanelOutline = this.scene.add.graphics();
        descriptionPanelOutline.lineStyle(3, COLOR_ENUMS.OP_GREY);
        descriptionPanelOutline.strokeRoundedRect(
            -backgroundImage.width/2 + 50, 
            backgroundImage.y + (backgroundImage.height/2-30) + 20,
            (backgroundImage.width-100)*0.68, 200,  
            5);
        this.obj.push(descriptionPanelOutline);

        let descriptionPanelPosition = {
            x: -backgroundImage.width/2 + 50,
            y: backgroundImage.y + (backgroundImage.height/2-30) + 20,
            width: (backgroundImage.width-100)*0.68,
            height: 200
        };

        //Add Text
        this.descriptionTitleText = this.scene.add.text(
            descriptionPanelPosition.x + 10,
            descriptionPanelPosition.y + 10,
            '',
            {
                font: "26px OnePieceFont",
                color: COLOR_ENUMS_CSS.OP_BLACK
            }
        );
        this.obj.push(this.descriptionTitleText);

        this.descriptionContentTitleText = this.scene.add.text(
            descriptionPanelPosition.x + 10,
            descriptionPanelPosition.y + 40,
            '',
            {
                font: "22px OnePieceTCGFont",
                color: COLOR_ENUMS_CSS.OP_BLACK
            }
        );
        this.obj.push(this.descriptionContentTitleText);

        this.descriptionContentText = this.scene.add.text(
            descriptionPanelPosition.x + 10,
            descriptionPanelPosition.y + 70,
            '',
            {
                font: "16px OnePieceTCGFont",
                color: COLOR_ENUMS_CSS.OP_BLACK
            }
        );
        this.obj.push(this.descriptionContentText);

        //Create Buy Buton Panel
        let buyButtonPanel = this.scene.add.graphics();
        buyButtonPanel.fillStyle(COLOR_ENUMS.OP_CREAM);
        buyButtonPanel.fillRoundedRect(
            -backgroundImage.width/2 + 50 + (backgroundImage.width-100)*0.70, 
            backgroundImage.y + (backgroundImage.height/2-30) + 20,
            (backgroundImage.width-100)*0.3, 200,  
            5);
        this.obj.push(buyButtonPanel);

        let buyButtonPanelOutline = this.scene.add.graphics();
        buyButtonPanelOutline.lineStyle(3, COLOR_ENUMS.OP_GREY);
        buyButtonPanelOutline.strokeRoundedRect(
            -backgroundImage.width/2 + 50 + (backgroundImage.width-100)*0.70, 
            backgroundImage.y + (backgroundImage.height/2-30) + 20,
            (backgroundImage.width-100)*0.3, 200,  
            5);
        this.obj.push(buyButtonPanelOutline);

        let buyButtonPanelPosition = {
            x: -backgroundImage.width/2 + 50 + (backgroundImage.width-100)*0.70 + (backgroundImage.width-100)*0.3/2,
            y: (backgroundImage.y + (backgroundImage.height/2-30) + 20) + 100,
            width: (backgroundImage.width-100)*0.3,
            height: 200
        };

        //Add price Tag
        let pricePlaceHolder = this.scene.add.graphics();
        pricePlaceHolder.fillStyle(COLOR_ENUMS.OP_BLACK);
        pricePlaceHolder.fillRoundedRect(
            buyButtonPanelPosition.x - buyButtonPanelPosition.width/2 + 20, 
            buyButtonPanelPosition.y - buyButtonPanelPosition.height/2 + 40,
            buyButtonPanelPosition.width-40, 50,  
            5);
        this.obj.push(pricePlaceHolder);

        let pricePlaceHolderOutline = this.scene.add.graphics();
        pricePlaceHolderOutline.lineStyle(3, COLOR_ENUMS.OP_GOLD);
        pricePlaceHolderOutline.strokeRoundedRect(
            buyButtonPanelPosition.x - buyButtonPanelPosition.width/2 + 20, 
            buyButtonPanelPosition.y - buyButtonPanelPosition.height/2 + 40,
            buyButtonPanelPosition.width-40, 50,  
            5);
        this.obj.push(pricePlaceHolderOutline);

        //Add Text
        let priceIcon = this.scene.add.image(
            buyButtonPanelPosition.x + buyButtonPanelPosition.width/2 - 20 - 20,
            buyButtonPanelPosition.y - buyButtonPanelPosition.height/2 + 40 + 25,
            ASSET_ENUMS.ICON_BERRIES
        ).setOrigin(0.5).setScale(0.6);
        this.obj.push(priceIcon);

        this.priceText = this.scene.add.text(
            buyButtonPanelPosition.x + buyButtonPanelPosition.width/2 - 20 - 50,
            buyButtonPanelPosition.y - buyButtonPanelPosition.height/2 + 40 + 25,
            '',
            {
                font: "22px OnePieceTCGFont",
                color: COLOR_ENUMS_CSS.OP_CREAM
            }
        ).setOrigin(1, 0.5);
        this.obj.push(this.priceText);

        //Add Buy Button
        this.buyButton = this.scene.add.image(
            buyButtonPanelPosition.x,
            buyButtonPanelPosition.y + 40,
            ASSET_ENUMS.ICON_BUY
        ).setOrigin(0.5).setScale(0.15);
        this.obj.push(this.buyButton);

        //Add Placeholder pack
        this.placholderart = this.scene.add.image(backgroundImage.x, backgroundImage.y + 40, '').setScale(0.4);
        this.placholderart.preFX.addGlow(COLOR_ENUMS.OP_WHITE, 4 ,0, false, 0.1, 32);
        this.obj.push(this.placholderart);
    }

    /** Function that set sthe visibility of the panel
     * @param {boolean} visible - The visibility of the panel
     */
    setvisible(visible) {
        for(let o of this.obj) {
            o.setVisible(visible);
        }
    }

}