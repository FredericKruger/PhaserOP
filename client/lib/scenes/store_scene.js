class StoreScene extends Phaser.Scene {

    constructor() {
        super({ key: SCENE_ENUMS.STORE });

        this.shelfItems = [];
        this.selectedButton = null;
    }
    
    init() {
        this.game.gameClient.storeScene = this;
    }

    create() {
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        this.add.image(screenCenterX, screenCenterY, ASSET_ENUMS.BACKGROUND1).setScale(1); //add background image

        //Create the shop Panel
        this.createShopPanel();

        //Create top menu panel
        this.createTopMenuPanel();

         //Create ScrollPanel
        this.scrollPanel = new ScrollPanel(this, 
            this.topMenuPanelBounds.x, this.topMenuPanelBounds.y, 
            this.topMenuPanelBounds.width, this.topMenuPanelBounds.height, 
            false, {backgroundColor: COLOR_ENUMS.OP_BLACK, alpha: 1, round: 5});
        this.scrollPanel.setVisible(true);

        this.children.bringToTop(this.setButton);
        this.children.bringToTop(this.packButton);

        /*let maskGraphics = this.add.graphics();
        maskGraphics.fillStyle(0xffffff);
        maskGraphics.fillRoundedRect(this.topMenuPanelBounds.x, this.topMenuPanelBounds.y, 
            this.topMenuPanelBounds.width, this.topMenuPanelBounds.height, 5); // Adjust the radius as needed*/

        //Generate Shelf Items
        this.generateShelfItems("PACKS");

        // CREATE TITLE
        let storeTitle = this.add.image(
            screenCenterX, 
            screenCenterY - this.panelSize.height/2 + 20, ASSET_ENUMS.IMAGE_SHOP_TITLE).setOrigin(0.5).setScale(0.2);

        // Create back button
        this.backButton = new Button({
            scene: this,
            x: screenCenterX + this.panelSize.width/2 - 40, 
            y: screenCenterY + this.panelSize.height/2 - 15,
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
        this.backButton.on('pointerover', () => {
            this.tweens.add({
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
            this.tweens.killTweensOf(this.backButton);
            this.tweens.add({
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
            this.scene.start(SCENE_ENUMS.TITLE);
        });
                
                
    }

    /**
     * Function that creates the main shop panel
     */
    createShopPanel(){
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        this.panelSize = {
            width: this.cameras.main.width * 0.9,
            height: this.cameras.main.height * 0.9
        }

        // Use the texture to fill the rectangle
        let shopPanelBackground = this.add.image(screenCenterX, screenCenterY, ASSET_ENUMS.BACKGORUND4);

        // Calculate crop area from the center
        let textureWidth = shopPanelBackground.width;
        let textureHeight = shopPanelBackground.height;
        let cropX = (textureWidth - this.panelSize.width) / 2;
        let cropY = (textureHeight - this.panelSize.height) / 2;
                
        shopPanelBackground.setCrop(cropX, cropY, this.panelSize.width, this.panelSize.height); // Crop the texture to fit the panel

        // Create a mask with rounded corners
        let maskGraphics = this.add.graphics();
        maskGraphics.fillStyle(0xffffff);
        maskGraphics.fillRoundedRect(0, 0, this.panelSize.width, this.panelSize.height, 5); // Adjust the radius as needed
        maskGraphics.generateTexture('roundedMask2', this.panelSize.width, this.panelSize.height);
        maskGraphics.destroy();
        
        let shopPanelPanelMaskImage = this.add.image(screenCenterX, screenCenterY, 'roundedMask2');
        shopPanelBackground.setMask(shopPanelPanelMaskImage.createBitmapMask());
        shopPanelPanelMaskImage.setVisible(false); // Hide the mask image
        
        //create outline
        let shopPanelOutlineGraphics = this.add.graphics();
        shopPanelOutlineGraphics.lineStyle(6, COLOR_ENUMS.OP_GREY); // Set the line style (width and color)
        shopPanelOutlineGraphics.strokeRoundedRect(
            shopPanelBackground.x - this.panelSize.width / 2,
            shopPanelBackground.y - this.panelSize.height / 2,
            this.panelSize.width,
            this.panelSize.height,
            5 // Adjust the radius as needed
        );

        //Create inside borders
        this.insidePanelSize = {
            width: 180,
            height: 80
        };
        let borderGraphics = this.add.graphics();
        borderGraphics.fillStyle(COLOR_ENUMS.OP_CREAM_DARKER);
        borderGraphics.fillRoundedRect( //Top Border
            screenCenterX - this.panelSize.width/2 + 3, screenCenterY - this.panelSize.height/2 + 3, 
            this.panelSize.width-6, this.insidePanelSize.height, 0); // Adjust the radius as needed
        borderGraphics.fillRoundedRect( //Bottom Border
            screenCenterX - this.panelSize.width/2 + 3, screenCenterY + this.panelSize.height/2 - 3 - this.insidePanelSize.height, 
            this.panelSize.width-6, this.insidePanelSize.height, 0); // Adjust the radius as needed
        borderGraphics.fillRoundedRect(
            screenCenterX - this.panelSize.width/2 + 3, screenCenterY - this.panelSize.height/2 + 3, 
            this.insidePanelSize.width, this.panelSize.height - 6, 0); // Adjust the radius as needed
        borderGraphics.fillRoundedRect(
            screenCenterX + this.panelSize.width/2 - 3 - this.insidePanelSize.width, screenCenterY - this.panelSize.height/2 + 3, 
            this.insidePanelSize.width, this.panelSize.height - 6, 0); // Adjust the radius as needed
            
    }

    /**
     * Function that creates the top menu panel
     */
    createTopMenuPanel() {
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        const topMenuPanelSize = {
            width: this.panelSize.width-6-this.insidePanelSize.width*2,
            height: 60,
            x: screenCenterX - this.panelSize.width/2 + 3 + this.insidePanelSize.width,
            y: screenCenterY - this.panelSize.height/2 + 3 + this.insidePanelSize.height - 5,
        }

        let maskGraphics = this.add.graphics();
        maskGraphics.fillStyle(COLOR_ENUMS.OP_BLUE);
        maskGraphics.fillRoundedRect(
            screenCenterX - this.panelSize.width/2 + 3 + this.insidePanelSize.width, 
            screenCenterY - this.panelSize.height/2 + 3 + this.insidePanelSize.height - 5, 
            topMenuPanelSize.width, 
            topMenuPanelSize.height, { tl: 5, tr: 5, bl: 0, br: 0 }); // Adjust the radius as needed*/
        maskGraphics.lineStyle(6, COLOR_ENUMS.OP_GREY); // Set the line style (width and color)
        maskGraphics.strokeRoundedRect(
            screenCenterX - this.panelSize.width/2 + 3 + this.insidePanelSize.width, 
            screenCenterY - this.panelSize.height/2 + 3 + this.insidePanelSize.height - 5, 
            topMenuPanelSize.width, 
            topMenuPanelSize.height, { tl: 5, tr: 5, bl: 0, br: 0 }); // Adjust the radius as needed*/
        maskGraphics.strokeRoundedRect(
                screenCenterX - this.panelSize.width/2 + 3 + this.insidePanelSize.width, 
                screenCenterY - this.panelSize.height/2 + 3 + this.insidePanelSize.height - 5, 
                topMenuPanelSize.width, 
                this.panelSize.height-6-this.insidePanelSize.height*2+5,
                { tl: 5, tr: 5, bl: 0, br: 0 }); // Adjust the radius as needed*/

        //Add PackButton
        this.packButton = new ToggleButton({
            scene: this,
            x: screenCenterX - topMenuPanelSize.width/2 + 90, 
            y: topMenuPanelSize.y + topMenuPanelSize.height/2,
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
        this.packButton.on('pointerover', () => {this.packButton.onHover();});
        this.packButton.on('pointerout', () => {this.packButton.onOut();});
        this.packButton.on('pointerdown', () => {
            if(this.selectedButton === this.packButton) return;
            this.selectedButton.toggle();
            this.selectedButton = this.packButton;
            this.selectedButton.toggle();
            this.generateShelfItems("PACKS");
        });

        //Add SetButton
        this.setButton = new ToggleButton({
            scene: this,
            x: this.packButton.x + this.packButton.width/2 + 90, 
            y: topMenuPanelSize.y + topMenuPanelSize.height/2,
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
        this.setButton.on('pointerover', () => {this.setButton.onHover();});
        this.setButton.on('pointerout', () => {this.setButton.onOut();});
        this.setButton.on('pointerdown', () => {
            if(this.selectedButton === this.setButton) return;
            this.selectedButton.toggle();
            this.selectedButton = this.setButton;
            this.selectedButton.toggle();
            this.generateShelfItems("DECKS");
        });

        this.selectedButton = this.packButton;
        this.selectedButton.toggle();

        this.topMenuPanelBounds = {
            x: screenCenterX - this.panelSize.width/2 + 3 + this.insidePanelSize.width + 3,
            y: topMenuPanelSize.y + topMenuPanelSize.height + 3,
            height: (screenCenterY + this.panelSize.height/2 - 3 - this.insidePanelSize.height) - (topMenuPanelSize.y + topMenuPanelSize.height) - 6,
            width: topMenuPanelSize.width - 6
        }
    }

    /** 
     * Generate Shelf Items
     */
    generateShelfItems(itemType) {
        //Reset first
        this.shelfItems.forEach(item => {
            this.scrollPanel.removeElement(item);
            item.destroy();
        });
        this.shelfItems = [];

        //filter the shop items from the data
        let shopItems = this.game.gameClient.shopData.find(item => item.type === itemType);

        //Create Shelp Items
        for(let item of shopItems.items){
            let config = {
                x: 0,
                y: 0,
                art: item.name,
                name: item.name,
                description: item.description,
                price: item.price,
                isplaceholder: false
            }
            let shopItem = new ShopItemVisual(this, config);
            this.shelfItems.push(shopItem);
            this.scrollPanel.addElement(shopItem);
        }

        //Add Empty Placeholder
        let shopItem = new ShopItemVisual(this, {
            x: 0,
            y: 0,
            isplaceholder: true
        });
        this.shelfItems.push(shopItem);
        this.scrollPanel.addElement(shopItem);

        if(this.shelfItems.length > 0) {
            //Position Shelf Items
            let itemWidth = this.shelfItems[0].displayWidth;
            let itemHeight = this.shelfItems[0].displayHeight;

            let startX = this.scrollPanel.width/2 - itemWidth - 25 - itemWidth/2;
            let startY = 25;

            for(let i = 0; i<this.shelfItems.length; i++){
                let item = this.shelfItems[i];
                let itemX = startX + (i % 3) * (itemWidth + 25);
                let itemY = startY + Math.floor(i / 3) * (itemHeight + 25);
                item.setPosition(itemX, itemY);
            }
        }
        this.scrollPanel.updateScrollcontainer();

    }

}