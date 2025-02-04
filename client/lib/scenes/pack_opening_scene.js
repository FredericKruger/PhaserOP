class PackOpeningScene extends Phaser.Scene {

    constructor() {
        super({key: SCENE_ENUMS.PACK_OPENING});

        this.padding = 35;
    }

    create() {
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        this.add.image(screenCenterX, screenCenterY, ASSET_ENUMS.BACKGROUND1).setScale(1); //add background image

        // CREATE PACK LIST PANEL
        this.packPanelSize = {width: 250, height: this.cameras.main.height - this.padding*2};
        this.createPackPanel();
        //this.generatePacks();

        // CREATE OPENING ZONE
        this.openingZoneSize = {width: this.cameras.main.width - this.packPanelSize.width - this.padding*3, height: this.cameras.main.height - this.padding*2};
        this.createOpeningZone();

        // CREATE TITLE
        let openingZoneTitle = this.add.image(
            this.cameras.main.width  - this.padding - this.openingZoneSize.width/2, 
            screenCenterY - this.openingZoneSize.height/2 + 10, ASSET_ENUMS.IMAGE_PACK_OPEN_TITLE).setOrigin(0.5).setScale(0.2);
        
        // Create store button
        this.storeButton = this.add.image(this.packPanelSize.width/2 + this.padding, this.cameras.main.height - this.padding - 60, ASSET_ENUMS.ICON_STORE).setOrigin(0.5).setScale(0.2);
        this.storeButton.setInteractive();
        this.storeButton.on('pointerover',  () => {this.storeButton.setScale(0.21)});
        this.storeButton.on('pointerout',  () => {this.storeButton.setScale(0.2)});

        // Create back button
        let backButton = new Button({
            scene: this,
            x: this.cameras.main.width - this.padding - 40, 
            y: this.cameras.main.height - this.padding - 15,
            width: 100,
            height: 40, //self.deckDropZone.height/2,
            radius: 5,
            backgroundcolor: COLOR_ENUMS.OP_CREAM,
            outlinecolor: COLOR_ENUMS.OP_CREAM_DARKER,
            text: "Back",
            fontsize: 18,
            textColor: COLOR_ENUMS_CSS.OP_BLACK,
        });
        backButton.setInteractive(true);
        backButton.on('pointerover',  () => {backButton.setScale(1.1)});
        backButton.on('pointerout',  () => {backButton.setScale(1)});
        backButton.on('pointerdown', () => {this.scene.start(SCENE_ENUMS.TITLE)});

        //Create scrollPanel
        this.packScrollPanelSize = {
            width: this.packPanelSize.width, 
            height: this.packPanelSize.height - this.padding - this.storeButton.displayHeight,
            x: this.padding,
            y: this.padding
        };
        this.packScrollPanel = new ScrollPanel(this, this.packScrollPanelSize.x, this.packScrollPanelSize.y, this.packScrollPanelSize.width, this.packScrollPanelSize.height, false);
        this.packScrollPanel.setVisible(true);

        this.generatePacks();
    }

    createPackPanel() {
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        // Create a texture from the image
        let graphics = this.add.graphics();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(0, 0, this.packPanelSize.width, this.packPanelSize.height);
        graphics.generateTexture('panelTexture', this.packPanelSize.width, this.packPanelSize.height);
        graphics.destroy();

        // Use the texture to fill the rectangle
        let packPanelBackground = this.add.image(this.packPanelSize.width/2 + this.padding, screenCenterY, 'panelTexture');
        packPanelBackground.setTexture(ASSET_ENUMS.LEATHER_BACKGROUND);
        packPanelBackground.setDisplaySize(this.packPanelSize.width, this.packPanelSize.height);
        packPanelBackground.setPipeline(PIPELINE_ENUMS.BLUE_TINT_PIPELINE);

        // Create a mask with rounded corners
        let maskGraphics = this.make.graphics();
        maskGraphics.fillStyle(0xffffff);
        maskGraphics.fillRoundedRect(0, 0, this.packPanelSize.width, this.packPanelSize.height, 5); // Adjust the radius as needed
        maskGraphics.generateTexture('roundedMask', this.packPanelSize.width, this.packPanelSize.height);
        maskGraphics.destroy();

        let packPanelMaskImage = this.add.image(this.packPanelSize.width/2 + this.padding, screenCenterY, 'roundedMask');
        packPanelBackground.setMask(packPanelMaskImage.createBitmapMask());
        packPanelMaskImage.setVisible(false); // Hide the mask image

        //create outline
        let packPanelOutlineGraphics = this.add.graphics();
        packPanelOutlineGraphics.lineStyle(4, COLOR_ENUMS.OP_CREAM_DARKER); // Set the line style (width and color)
        packPanelOutlineGraphics.strokeRoundedRect(
            packPanelBackground.x - this.packPanelSize.width / 2,
            packPanelBackground.y - this.packPanelSize.height / 2,
            this.packPanelSize.width,
            this.packPanelSize.height,
            5 // Adjust the radius as needed
        );
    }

    createOpeningZone() {
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        // Create a texture from the image
        let graphics = this.add.graphics();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(0, 0, this.openingZoneSize.width, this.openingZoneSize.height);
        graphics.generateTexture('panelTexture2', this.openingZoneSize.width, this.openingZoneSize.height);
        graphics.destroy();

        // Use the texture to fill the rectangle
        let openingZonePanelBackground = this.add.image(this.cameras.main.width  - this.padding - this.openingZoneSize.width/2, screenCenterY, 'panelTexture2');
        openingZonePanelBackground.setTexture(ASSET_ENUMS.MAP_BACKGROUND);
        openingZonePanelBackground.setPipeline(PIPELINE_ENUMS.BLUE_TINT_PIPELINE);

        // Calculate crop area from the center
        let textureWidth = openingZonePanelBackground.width;
        let textureHeight = openingZonePanelBackground.height;
        let cropX = (textureWidth - this.openingZoneSize.width) / 2;
        let cropY = (textureHeight - this.openingZoneSize.height) / 2;
        
        openingZonePanelBackground.setCrop(cropX, cropY, this.openingZoneSize.width, this.openingZoneSize.height); // Crop the texture to fit the panel
        
        // Create a mask with rounded corners
        let maskGraphics = this.make.graphics();
        maskGraphics.fillStyle(0xffffff);
        maskGraphics.fillRoundedRect(0, 0, this.openingZoneSize.width, this.openingZoneSize.height, 5); // Adjust the radius as needed
        maskGraphics.generateTexture('roundedMask2', this.openingZoneSize.width, this.openingZoneSize.height);
        maskGraphics.destroy();

        let openingZonePanelMaskImage = this.add.image(this.cameras.main.width  - this.padding - this.openingZoneSize.width/2, screenCenterY, 'roundedMask2');
        openingZonePanelBackground.setMask(openingZonePanelMaskImage.createBitmapMask());
        openingZonePanelMaskImage.setVisible(false); // Hide the mask image

        //create outline
        let openingZonePanelOutlineGraphics = this.add.graphics();
        openingZonePanelOutlineGraphics.lineStyle(4, COLOR_ENUMS.OP_CREAM_DARKER); // Set the line style (width and color)
        openingZonePanelOutlineGraphics.strokeRoundedRect(
            openingZonePanelBackground.x - this.openingZoneSize.width / 2,
            openingZonePanelBackground.y - this.openingZoneSize.height / 2,
            this.openingZoneSize.width,
            this.openingZoneSize.height,
            5 // Adjust the radius as needed
        );

        //Create placeholder image
        this.placeholderImage = this.add.image(openingZonePanelBackground.x, openingZonePanelBackground.y, ASSET_ENUMS.IMAGE_PACK_OPEN_PLACEHOLDER).setOrigin(0.5).setScale(0.3).setAlpha(0.4);
        
        maskGraphics = this.make.graphics();
        maskGraphics.fillStyle(0xffffff);
        maskGraphics.fillRoundedRect(0, 0, this.placeholderImage.displayWidth-2, this.placeholderImage.displayHeight-2, 5); // Adjust the radius as needed
        maskGraphics.generateTexture('roundedMask3', this.placeholderImage.displayWidth-2, this.placeholderImage.displayHeight-2);
        maskGraphics.destroy();

        let placeholderMaskImage = this.add.image(openingZonePanelBackground.x, openingZonePanelBackground.y, 'roundedMask3');
        this.placeholderImage.setMask(placeholderMaskImage.createBitmapMask());
        placeholderMaskImage.setVisible(false); // Hide the mask image

    }

    generatePacks() {
        let validPackIndex = 0;
        for(let i = 0; i<GameClient.playerSettings.packs.length; i++) {
            let pack = GameClient.playerSettings.packs[i];
            if(pack.amount > 0) {
                let packImage = this.add.image(0, 0, GameClient.utils.getPackArt(pack.set)).setOrigin(0.5).setScale(0.45);
                let posY = 20 + (packImage.displayHeight + 10) * validPackIndex + packImage.displayHeight/2;
                packImage.setPosition(this.packScrollPanelSize.width/2, posY);
                packImage.setInteractive();
                this.input.setDraggable(packImage);
                this.packScrollPanel.addElement(packImage);

                validPackIndex++;
            }
        }
    }
}