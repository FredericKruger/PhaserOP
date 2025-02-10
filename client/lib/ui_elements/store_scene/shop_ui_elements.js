class ShopUIElements {

    /**
     * 
     * @param {StoreScene} scene 
     */
    constructor(scene) {
        this.scene = scene;
    }

    /** Function to initialize variables */
    init() {
        this.screenCenterX = this.scene.cameras.main.worldView.x + this.scene.cameras.main.width / 2;
        this.screenCenterY = this.scene.cameras.main.worldView.y + this.scene.cameras.main.height / 2;

        //init sizes
        this.mainPanelSize = {
            width: this.scene.cameras.main.width * 0.95,
            height: this.scene.cameras.main.height * 0.95
        }
        this.insidePanelSize = {
            width: 100,
            height: 80
        };
        this.topMenuPanelSize = {
            width: this.mainPanelSize.width-6-this.insidePanelSize.width*2,
            height: 60,
            x: this.screenCenterX - this.mainPanelSize.width/2 + 3 + this.insidePanelSize.width,
            y: this.screenCenterY - this.mainPanelSize.height/2 + 3 + this.insidePanelSize.height - 5,
        }
        this.topMenuPanelBounds = {
            x: this.screenCenterX - this.mainPanelSize.width/2 + 3 + this.insidePanelSize.width + 3,
            y: this.topMenuPanelSize.y + this.topMenuPanelSize.height + 3,
            height: (this.screenCenterY + this.mainPanelSize.height/2 - 3 - this.insidePanelSize.height) - (this.topMenuPanelSize.y + this.topMenuPanelSize.height) - 6,
            width: this.topMenuPanelSize.width - 6
        }
    }

    /**
     * Function that creates the main shop panel
     */
    createShopPanel() {
        // Use the texture to fill the rectangle
        let shopPanelBackground = this.scene.add.image(
            this.screenCenterX, this.screenCenterY, 
            ASSET_ENUMS.BACKGORUND4);
        shopPanelBackground.setDepth(0);

        // Calculate crop area from the center
        let textureWidth = shopPanelBackground.width;
        let textureHeight = shopPanelBackground.height;
        let cropX = (textureWidth - this.mainPanelSize.width) / 2;
        let cropY = (textureHeight - this.mainPanelSize.height) / 2;
                
        shopPanelBackground.setCrop(cropX, cropY, this.mainPanelSize.width, this.mainPanelSize.height); // Crop the texture to fit the panel

        // Create a mask with rounded corners
        let maskGraphics = this.scene.add.graphics();
        maskGraphics.fillStyle(0xffffff);
        maskGraphics.fillRoundedRect(0, 0, this.mainPanelSize.width, this.mainPanelSize.height, 5); // Adjust the radius as needed
        maskGraphics.generateTexture('roundedMask2', this.mainPanelSize.width, this.mainPanelSize.height);
        maskGraphics.destroy();
        
        let shopPanelPanelMaskImage = this.scene.add.image(this.screenCenterX, this.screenCenterY, 'roundedMask2');
        shopPanelBackground.setMask(shopPanelPanelMaskImage.createBitmapMask());
        shopPanelPanelMaskImage.setVisible(false); // Hide the mask image
        shopPanelPanelMaskImage.setDepth(0);
        
        //create outline
        let shopPanelOutlineGraphics = this.scene.add.graphics();
        shopPanelOutlineGraphics.lineStyle(6, COLOR_ENUMS.OP_GREY); // Set the line style (width and color)
        shopPanelOutlineGraphics.strokeRoundedRect(
            shopPanelBackground.x - this.mainPanelSize.width / 2,
            shopPanelBackground.y - this.mainPanelSize.height / 2,
            this.mainPanelSize.width,
            this.mainPanelSize.height,
            5 // Adjust the radius as needed
        );
        shopPanelOutlineGraphics.setDepth(0);

        //Create inside borders
        let borderGraphics = this.scene.add.graphics();
        borderGraphics.fillStyle(COLOR_ENUMS.OP_CREAM_DARKER);
        borderGraphics.fillRoundedRect( //Top Border
            this.screenCenterX - this.mainPanelSize.width/2 + 3, this.screenCenterY - this.mainPanelSize.height/2 + 3, 
            this.mainPanelSize.width-6, this.insidePanelSize.height, 0).setDepth(0); // Adjust the radius as needed
        borderGraphics.fillRoundedRect( //Bottom Border
            this.screenCenterX - this.mainPanelSize.width/2 + 3, this.screenCenterY + this.mainPanelSize.height/2 - 3 - this.insidePanelSize.height, 
            this.mainPanelSize.width-6, this.insidePanelSize.height, 0).setDepth(0); // Adjust the radius as needed
        borderGraphics.fillRoundedRect(
            this.screenCenterX - this.mainPanelSize.width/2 + 3, this.screenCenterY - this.mainPanelSize.height/2 + 3, 
            this.insidePanelSize.width, this.mainPanelSize.height - 6, 0).setDepth(0); // Adjust the radius as needed
        borderGraphics.fillRoundedRect(
            this.screenCenterX + this.mainPanelSize.width/2 - 3 - this.insidePanelSize.width, this.screenCenterY - this.mainPanelSize.height/2 + 3, 
            this.insidePanelSize.width, this.mainPanelSize.height - 6, 0).setDepth(0); // Adjust the radius as needed
    }

    
    /**
     * Function that creates the top menu panel
     */
    createTopMenuPanel() {
        //Create Panel
        let graphics = this.scene.add.graphics();
        graphics.fillStyle(COLOR_ENUMS.OP_BLUE);
        graphics.fillRoundedRect(
            this.screenCenterX - this.mainPanelSize.width/2 + 3 + this.insidePanelSize.width, 
            this.screenCenterY - this.mainPanelSize.height/2 + 3 + this.insidePanelSize.height - 5, 
            this.topMenuPanelSize.width, this.topMenuPanelSize.height, 
            { tl: 5, tr: 5, bl: 0, br: 0 }); // Adjust the radius as needed*/
        graphics.lineStyle(6, COLOR_ENUMS.OP_GREY); // Set the line style (width and color)
        graphics.strokeRoundedRect(
            this.screenCenterX - this.mainPanelSize.width/2 + 3 + this.insidePanelSize.width, 
            this.screenCenterY - this.mainPanelSize.height/2 + 3 + this.insidePanelSize.height - 5, 
            this. topMenuPanelSize.width, this.topMenuPanelSize.height, 
            { tl: 5, tr: 5, bl: 0, br: 0 }); // Adjust the radius as needed*/
        graphics.strokeRoundedRect(
            this.screenCenterX - this.mainPanelSize.width/2 + 3 + this.insidePanelSize.width, 
            this.screenCenterY - this.mainPanelSize.height/2 + 3 + this.insidePanelSize.height - 5, 
            this.topMenuPanelSize.width, this.mainPanelSize.height-6-this.insidePanelSize.height*2+5,
            { tl: 5, tr: 5, bl: 0, br: 0 }); // Adjust the radius as needed*/
        graphics.setDepth(0);
    }

    /** Create the top menu buttons */
    createMenuButtons() {
        //Add PackButton
        this.packButton = new ToggleButton({
            scene: this.scene,
            x: this.screenCenterX - this.topMenuPanelSize.width/2 + 90, 
            y: this.topMenuPanelSize.y + this.topMenuPanelSize.height/2,
            width: 150,
            height: 40, //self.deckDropZone.height/2,
            radius: 5,
            backgroundcolor: COLOR_ENUMS.OP_ORANGE,
            outlinecolor: COLOR_ENUMS.OP_CREAM,
            text: "Packs",
            fontsize: 30,
            fontfamily: "OnePieceFont",
            textColor: COLOR_ENUMS_CSS.OP_BLACK,
        });
        this.packButton.setDepth(2);
        this.packButton.on('pointerover', () => {this.packButton.onHover();});
        this.packButton.on('pointerout', () => {this.packButton.onOut();});
        this.packButton.on('pointerdown', () => {
            if(this.scene.selectedButton === this.packButton) return;
            this.scene.selectedButton.toggle();
            this.scene.selectedButton = this.packButton;
            this.scene.selectedButton.toggle();
            this.scene.generateShelfItems("PACKS");
        });

        //Add SetButton
        this.setButton = new ToggleButton({
            scene: this.scene,
            x: this.packButton.x + this.packButton.width/2 + 90, 
            y: this.topMenuPanelSize.y + this.topMenuPanelSize.height/2,
            width: 150,
            height: 40, //self.deckDropZone.height/2,
            radius: 5,
            backgroundcolor: COLOR_ENUMS.OP_ORANGE,
            outlinecolor: COLOR_ENUMS.OP_CREAM,
            text: "Decks",
            fontsize: 30,
            fontfamily: "OnePieceFont",
            textColor: COLOR_ENUMS_CSS.OP_BLACK,
        });
        this.setButton.setDepth(2);
        this.setButton.on('pointerover', () => {this.setButton.onHover();});
        this.setButton.on('pointerout', () => {this.setButton.onOut();});
        this.setButton.on('pointerdown', () => {
            if(this.scene.selectedButton === this.setButton) return;
            this.scene.selectedButton.toggle();
            this.scene.selectedButton = this.setButton;
            this.scene.selectedButton.toggle();
            this.scene.generateShelfItems("DECKS");
        });
    }

    /** FUNCTION TO CREATE THE PANEL TITLE */
    createTitle() {
        // CREATE TITLE
        let storeTitle = this.scene.add.image(
            this.screenCenterX, 
            this.screenCenterY - this.mainPanelSize.height/2 + 20, ASSET_ENUMS.IMAGE_SHOP_TITLE)
            .setOrigin(0.5).setScale(0.2).setDepth(0);
    }

    /** FUNCTION TO CREATE THE PLAYER BERRY PANEL */
    createPlayerBerries() {
        let graphics = this.scene.add.graphics();
        graphics.fillStyle(COLOR_ENUMS.OP_CREAM);
        graphics.fillRoundedRect( //Top Border
            this.screenCenterX + this.mainPanelSize.width/2 - 3  - this.insidePanelSize.width - 200, 
            this.screenCenterY + this.mainPanelSize.height/2 - 3 - this.insidePanelSize.height/2 - 20, 
            200, 
            40, 3);
        graphics.lineStyle(3, COLOR_ENUMS.OP_GREY);
        graphics.strokeRoundedRect( //Top Border
            this.screenCenterX + this.mainPanelSize.width/2 - 3  - this.insidePanelSize.width - 200, 
            this.screenCenterY + this.mainPanelSize.height/2 - 3 - this.insidePanelSize.height/2 - 20, 
            200, 
            40, 3);
        graphics.setDepth(0); // Adjust the radius as needed
        this.scene.add.image(
            this.screenCenterX + this.mainPanelSize.width/2 - 3  - this.insidePanelSize.width - 25,
            this.screenCenterY + this.mainPanelSize.height/2 - 3 - this.insidePanelSize.height/2,
            ASSET_ENUMS.ICON_BERRIES
        ).setOrigin(0.5).setDepth(0).setScale(0.6);
        this.playerBerries = this.scene.add.text(
            this.screenCenterX + this.mainPanelSize.width/2 - 3  - this.insidePanelSize.width - 50,
            this.screenCenterY + this.mainPanelSize.height/2 - 3 - this.insidePanelSize.height/2, 
            '50000',
            {
                font: "22px OnePieceTCGFont",
                color: COLOR_ENUMS_CSS.OP_BLACK
            }
        ).setOrigin(1, 0.5).setDepth(0);
    }

    /** FUNCTION TO CREATE THE BACK BUTTONS */
    createButtons() {
        this.backButton = new Button({
            scene: this.scene,
            x: this.screenCenterX + this.mainPanelSize.width/2 - 40, 
            y: this.screenCenterY + this.mainPanelSize.height/2 - 15,
            width: 100,
            height: 40, //self.deckDropZone.height/2,
            radius: 5,
            backgroundcolor: COLOR_ENUMS.OP_CREAM_DARKER,
            outlinecolor: COLOR_ENUMS.OP_GREY,
            text: "Back",
            fontsize: 25,
            fontfamily: "OnePieceFont",
            textColor: COLOR_ENUMS_CSS.OP_BLACK,
        });
        this.backButton.setDepth(2);
        this.backButton.on('pointerover', () => {
            this.scene.tweens.add({
                targets: this.backButton,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100,
                ease: 'Sine.easeInOut',
                yoyo: false,
                repeat: 0
            });
        });
        this.backButton.on('pointerout', () => {
            this.scene.tweens.killTweensOf(this.backButton);
            this.scene.tweens.add({
                targets: this.backButton,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
                ease: 'Sine.easeInOut',
                yoyo: false,
                repeat: 0
            });
        });
        this.backButton.on('pointerdown', () => {
            this.scene.returnToTitle();
        });
    }

    /** Function that set the amount of berries available for the purchase
     * @param {number} berries
     */
    setPlayerBerries(berries) {
        this.playerBerries.setText(berries);
    }

}